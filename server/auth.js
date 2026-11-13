import crypto from 'crypto'
import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'
import { sendMail } from './mailer.js'

// Authentication for the mock API: user store, password hashing, sessions, lockout, email verification and password reset.

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const usersPath = path.join(__dirname, 'users.json')
const FRONTEND_URL = process.env.FRONTEND_URL || 'http://localhost:5173'

const SESSION_TTL_MS = 8 * 60 * 60 * 1000
const VERIFY_TTL_MS = 24 * 60 * 60 * 1000
const RESET_TTL_MS = 60 * 60 * 1000
const MIN_PASSWORD_LENGTH = 12
const MAX_PASSWORD_LENGTH = 1024
const MAX_FAILED_ATTEMPTS_PER_ACCOUNT = 5
const MAX_FAILED_ATTEMPTS_PER_IP = 20
const LOCKOUT_MS = 15 * 60 * 1000

// Sessions are kept in memory, so restarting the API signs everyone out
const sessions = new Map() // sha256(token) -> { userId, expiresAt }
const failures = new Map() // lockout key -> { count, lockedUntil }

const sha256 = (value) => crypto.createHash('sha256').update(value).digest('hex')
const newToken = () => crypto.randomBytes(32).toString('base64url')
const normaliseEmail = (email) => email.trim().toLowerCase()

// Users are read from disk on every call so a user created by the CLI is seen without restarting the API
const readUsers = () => {
  if (!fs.existsSync(usersPath)) return []
  return JSON.parse(fs.readFileSync(usersPath, 'utf8'))
}
const writeUsers = (users) => fs.writeFileSync(usersPath, JSON.stringify(users, null, 2))

// scrypt with a random salt per password; stored as scrypt$<salt>$<hash>
export function hashPassword(password) {
  const salt = crypto.randomBytes(16)
  const hash = crypto.scryptSync(password, salt, 64)
  return `scrypt$${salt.toString('base64')}$${hash.toString('base64')}`
}

export function verifyPassword(password, stored) {
  const [scheme, saltB64, hashB64] = stored.split('$')
  if (scheme !== 'scrypt') return false
  const expected = Buffer.from(hashB64, 'base64')
  const actual = crypto.scryptSync(password, Buffer.from(saltB64, 'base64'), expected.length)
  return crypto.timingSafeEqual(actual, expected)
}

// Used when the email is unknown, so login takes the same time either way
const DUMMY_HASH = hashPassword('not-a-real-password')

const logAuth = (event, details) => {
  console.log(`[auth] ${new Date().toISOString()} ${event} ${JSON.stringify(details)}`)
}

const isLocked = (key) => {
  const entry = failures.get(key)
  return !!entry && entry.lockedUntil > Date.now()
}

// Per account: 5 failures locks that email. Per IP: 20, so one shared office IP isn't locked out by a few typos.
const recordFailure = (key, limit) => {
  const entry = failures.get(key) ?? { count: 0, lockedUntil: 0 }
  entry.count += 1
  if (entry.count >= limit) {
    entry.lockedUntil = Date.now() + LOCKOUT_MS
    entry.count = 0
  }
  failures.set(key, entry)
}

const isValidPassword = (password) =>
  typeof password === 'string' && password.length >= MIN_PASSWORD_LENGTH && password.length <= MAX_PASSWORD_LENGTH

const passwordRule = `Password must be ${MIN_PASSWORD_LENGTH}-${MAX_PASSWORD_LENGTH} characters`

// Creates an unverified user and emails a verification link. Used by the create-user CLI.
export async function createUser(email, password) {
  const key = normaliseEmail(email)
  if (!key.includes('@')) throw new Error('Enter a valid email address')
  if (!isValidPassword(password)) throw new Error(passwordRule)

  const users = readUsers()
  if (users.some((u) => u.email === key)) throw new Error('A user with that email already exists')

  const verifyToken = newToken()
  users.push({
    id: crypto.randomUUID(),
    email: key,
    passwordHash: hashPassword(password),
    emailVerified: false,
    verifyTokenHash: sha256(verifyToken),
    verifyExpiresAt: Date.now() + VERIFY_TTL_MS,
    createdAt: new Date().toISOString()
  })
  writeUsers(users)

  await sendMail({
    to: key,
    subject: 'Verify your CRM account',
    text: `Verify your email within 24 hours:\n${FRONTEND_URL}/verify-email?token=${verifyToken}`
  })
  logAuth('user_created', { email: key })
}

// POST /api/auth/login
export function login(req, res) {
  const { email, password } = req.body ?? {}
  if (typeof email !== 'string' || typeof password !== 'string' || !email || !password) {
    return res.status(400).json({ message: 'Email and password required' })
  }
  if (password.length > MAX_PASSWORD_LENGTH) {
    return res.status(400).json({ message: 'Email and password required' })
  }

  const key = normaliseEmail(email)
  const ipKey = `ip:${req.ip}`
  if (isLocked(key) || isLocked(ipKey)) {
    logAuth('login_locked', { email: key, ip: req.ip })
    return res.status(429).json({ message: 'Too many failed attempts. Try again in 15 minutes.' })
  }

  const user = readUsers().find((u) => u.email === key)
  const passwordOk = verifyPassword(password, user ? user.passwordHash : DUMMY_HASH)
  if (!user || !passwordOk) {
    recordFailure(key, MAX_FAILED_ATTEMPTS_PER_ACCOUNT)
    recordFailure(ipKey, MAX_FAILED_ATTEMPTS_PER_IP)
    logAuth('login_failed', { email: key, ip: req.ip })
    return res.status(401).json({ message: 'Invalid email or password' })
  }

  if (!user.emailVerified) {
    logAuth('login_unverified', { email: key, ip: req.ip })
    return res.status(403).json({ message: 'Verify your email before logging in' })
  }

  failures.delete(key)
  const token = newToken()
  sessions.set(sha256(token), { userId: user.id, expiresAt: Date.now() + SESSION_TTL_MS })
  logAuth('login_success', { email: key, ip: req.ip })
  res.json({ token })
}

// POST /api/auth/logout — ends the current session on the server
export function logout(req, res) {
  const token = bearerToken(req)
  if (token) sessions.delete(sha256(token))
  res.status(204).end()
}

const bearerToken = (req) => {
  const header = req.headers.authorization ?? ''
  return header.startsWith('Bearer ') ? header.slice(7) : ''
}

// Middleware: rejects requests without a live session
export function requireAuth(req, res, next) {
  const token = bearerToken(req)
  const hash = token ? sha256(token) : ''
  const session = hash ? sessions.get(hash) : undefined
  if (!session) return res.status(401).json({ message: 'Not signed in' })
  if (session.expiresAt < Date.now()) {
    sessions.delete(hash)
    return res.status(401).json({ message: 'Session expired. Please log in again.' })
  }
  const user = readUsers().find((u) => u.id === session.userId)
  if (!user) return res.status(401).json({ message: 'Not signed in' })
  req.user = { id: user.id, email: user.email }
  next()
}

// POST /api/auth/verify  { token }
export function verifyEmail(req, res) {
  const token = req.body?.token
  if (typeof token !== 'string' || !token) return res.status(400).json({ message: 'Verification link is invalid' })

  const users = readUsers()
  const user = users.find((u) => u.verifyTokenHash === sha256(token))
  if (!user || user.verifyExpiresAt < Date.now()) {
    return res.status(400).json({ message: 'Verification link is invalid or has expired' })
  }

  user.emailVerified = true
  delete user.verifyTokenHash
  delete user.verifyExpiresAt
  writeUsers(users)
  logAuth('email_verified', { email: user.email })
  res.json({ message: 'Email verified. You can now log in.' })
}

// POST /api/auth/forgot  { email } — same reply whether or not the account exists
export async function forgotPassword(req, res) {
  const email = typeof req.body?.email === 'string' ? normaliseEmail(req.body.email) : ''
  const users = readUsers()
  const user = users.find((u) => u.email === email && u.emailVerified)

  if (user) {
    const resetToken = newToken()
    user.resetTokenHash = sha256(resetToken)
    user.resetExpiresAt = Date.now() + RESET_TTL_MS
    writeUsers(users)
    await sendMail({
      to: user.email,
      subject: 'Reset your CRM password',
      text: `Reset your password within 1 hour:\n${FRONTEND_URL}/reset-password?token=${resetToken}`
    })
  }

  logAuth('password_reset_requested', { email, ip: req.ip, found: !!user })
  res.json({ message: 'If that account exists, a reset link has been sent.' })
}

// POST /api/auth/reset  { token, password } — also signs out every existing session for the user
export function resetPassword(req, res) {
  const { token, password } = req.body ?? {}
  if (typeof token !== 'string' || !token) return res.status(400).json({ message: 'Reset link is invalid' })
  if (!isValidPassword(password)) return res.status(400).json({ message: passwordRule })

  const users = readUsers()
  const user = users.find((u) => u.resetTokenHash === sha256(token))
  if (!user || user.resetExpiresAt < Date.now()) {
    return res.status(400).json({ message: 'Reset link is invalid or has expired' })
  }

  user.passwordHash = hashPassword(password)
  delete user.resetTokenHash
  delete user.resetExpiresAt
  writeUsers(users)

  for (const [hash, session] of sessions) {
    if (session.userId === user.id) sessions.delete(hash)
  }
  logAuth('password_reset', { email: user.email })
  res.json({ message: 'Password updated. Please log in.' })
}
