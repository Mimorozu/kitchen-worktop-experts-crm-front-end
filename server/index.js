import express from 'express'
import cors from 'cors'
import multer from 'multer'
import path from 'path'
import fs from 'fs'
import crypto from 'crypto'
import { fileURLToPath } from 'url'
import * as store from './data.js'
import * as pricing from './pricing.js'
import * as auth from './auth.js'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const uploadsDir = path.join(__dirname, 'uploads')
fs.mkdirSync(uploadsDir, { recursive: true })

const app = express()
app.use(cors())
app.use(express.json())
app.use('/uploads', express.static(uploadsDir))

const PORT = 5000

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, uploadsDir),
  // Random name: the lead id and time are guessable, and the original name is not trusted
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase()
    cb(null, `${crypto.randomBytes(16).toString('hex')}${ext}`)
  }
})

const upload = multer({
  storage,
  limits: { fileSize: 8 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    const allowed = ['.jpg', '.jpeg', '.png', '.webp', '.pdf']
    cb(null, allowed.includes(path.extname(file.originalname).toLowerCase()))
  }
})

// Public auth routes
app.post('/api/auth/login', auth.login)
app.post('/api/auth/logout', auth.logout)
app.post('/api/auth/verify', auth.verifyEmail)
app.post('/api/auth/forgot', auth.forgotPassword)
app.post('/api/auth/reset', auth.resetPassword)

// Everything below needs a signed-in user
app.use('/api/leads', auth.requireAuth)
app.use('/api/pricing', auth.requireAuth)

app.get('/api/leads', (req, res) => {
  res.json(store.getAll())
})

app.get('/api/leads/:id', (req, res) => {
  const lead = store.getById(req.params.id)
  if (!lead) return res.status(404).json({ message: 'Lead not found' })
  res.json(lead)
})

app.post('/api/leads', (req, res) => {
  const lead = store.create(req.body)
  res.status(201).json(lead)
})

app.put('/api/leads/:id', (req, res) => {
  const lead = store.update(req.params.id, req.body)
  if (!lead) return res.status(404).json({ message: 'Lead not found' })
  res.json(lead)
})

app.delete('/api/leads/:id', (req, res) => {
  const ok = store.remove(req.params.id)
  if (!ok) return res.status(404).json({ message: 'Lead not found' })
  res.status(204).end()
})

app.post('/api/leads/:id/activity', (req, res) => {
  const entry = store.addActivity(req.params.id, req.body.message)
  if (!entry) return res.status(404).json({ message: 'Lead not found' })
  res.status(201).json(entry)
})

// Checks the first bytes of the saved file. Matches the real backend's photos.detectFileType.
const hasImageSignature = (filePath) => {
  const head = Buffer.alloc(12)
  const fd = fs.openSync(filePath, 'r')
  const bytesRead = fs.readSync(fd, head, 0, 12, 0)
  fs.closeSync(fd)
  const h = head.subarray(0, bytesRead)
  if (h.length >= 3 && h[0] === 0xff && h[1] === 0xd8 && h[2] === 0xff) return true
  if (h.length >= 8 && h.subarray(0, 8).equals(Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]))) return true
  if (h.length >= 12 && h.subarray(0, 4).toString('ascii') === 'RIFF' && h.subarray(8, 12).toString('ascii') === 'WEBP') return true
  if (h.length >= 5 && h.subarray(0, 5).toString('ascii') === '%PDF-') return true
  return false
}

app.post('/api/leads/:id/photos', upload.single('photo'), (req, res) => {
  if (!store.getById(req.params.id)) return res.status(404).json({ message: 'Lead not found' })
  if (!req.file) return res.status(400).json({ message: 'No valid file uploaded' })
  if (!hasImageSignature(req.file.path)) {
    fs.unlink(req.file.path, () => {})
    return res.status(400).json({ message: 'File must be a JPEG, PNG, WebP or PDF' })
  }
  const photo = store.addPhoto(req.params.id, {
    filename: req.file.originalname.replace(/[^A-Za-z0-9._ -]/g, '_').slice(0, 120),
    url: `/uploads/${req.file.filename}`
  })
  res.status(201).json(photo)
})

app.delete('/api/leads/:id/photos/:photoId', (req, res) => {
  const photo = store.removePhoto(req.params.id, req.params.photoId)
  if (!photo) return res.status(404).json({ message: 'Photo not found' })
  const filePath = path.join(uploadsDir, path.basename(photo.url))
  fs.unlink(filePath, () => {})
  res.status(204).end()
})

app.get('/api/pricing', (req, res) => {
  res.json(pricing.getPricing())
})

app.put('/api/pricing', (req, res) => {
  const result = pricing.updatePricing(req.body)
  if (result.error) return res.status(400).json({ message: result.error })
  res.json(result.value)
})

app.listen(PORT, () => {
  console.log(`Mock CRM API running at http://localhost:${PORT}`)
})
