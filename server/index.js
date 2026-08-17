import express from 'express'
import cors from 'cors'
import multer from 'multer'
import path from 'path'
import fs from 'fs'
import { fileURLToPath } from 'url'
import * as store from './data.js'

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
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase()
    cb(null, `${req.params.id}-${Date.now()}${ext}`)
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

// Mock auth: any non-empty email/password gets a token
app.post('/api/auth/login', (req, res) => {
  const { email, password } = req.body
  if (!email || !password) {
    return res.status(400).json({ message: 'Email and password required' })
  }
  res.json({ token: 'mock-token-' + Buffer.from(email).toString('base64') })
})

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

app.post('/api/leads/:id/photos', upload.single('photo'), (req, res) => {
  if (!store.getById(req.params.id)) return res.status(404).json({ message: 'Lead not found' })
  if (!req.file) return res.status(400).json({ message: 'No valid file uploaded' })
  const photo = store.addPhoto(req.params.id, {
    filename: req.file.originalname,
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

app.listen(PORT, () => {
  console.log(`Mock CRM API running at http://localhost:${PORT}`)
})
