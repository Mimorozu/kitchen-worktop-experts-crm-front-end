import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { createLead } from '../api/leads'
import Navbar from '../components/Navbar'
import { logout } from '../api/auth'

export default function NewLead() {
  const navigate = useNavigate()
  const [error, setError] = useState('')
  const [form, setForm] = useState({
    name: '',
    email: '',
    phone: '',
    postcode: '',
    size: '',
    material: '',
    quartzStyle: '',
    budget: '',
    timeline: '',
    notes: ''
  })

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value })
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    try {
      await createLead(form)
      navigate('/')
    } catch (err) {
      setError('Failed to create lead')
    }
  }

  const handleLogout = () => {
    logout()
    navigate('/login')
  }

  return (
    <div>
      <Navbar onLogout={handleLogout} />
      <div className="form-container">
        <h1>New Lead</h1>
        <form onSubmit={handleSubmit}>

          <div className="form-group">
            <label>Name *</label>
            <input name="name" value={form.name} onChange={handleChange} required />
          </div>

          <div className="form-group">
            <label>Email *</label>
            <input name="email" type="email" value={form.email} onChange={handleChange} required />
          </div>

          <div className="form-group">
            <label>Phone *</label>
            <input name="phone" value={form.phone} onChange={handleChange} required />
          </div>

          <div className="form-group">
            <label>Postcode *</label>
            <input name="postcode" value={form.postcode} onChange={handleChange} required />
          </div>

          <div className="form-group">
            <label>Size *</label>
            <select name="size" value={form.size} onChange={handleChange} required>
              <option value="">Select size</option>
              <option value="Small">Small</option>
              <option value="Medium">Medium</option>
              <option value="Large">Large</option>
            </select>
          </div>

          <div className="form-group">
            <label>Material *</label>
            <select name="material" value={form.material} onChange={handleChange} required>
              <option value="">Select material</option>
              <option value="Quartz">Quartz</option>
              <option value="Granite">Granite</option>
              <option value="Porcelain">Porcelain</option>
            </select>
          </div>

          <div className="form-group">
            <label>Quartz Style</label>
            <input name="quartzStyle" value={form.quartzStyle} onChange={handleChange} />
          </div>

          <div className="form-group">
            <label>Budget</label>
            <input name="budget" value={form.budget} onChange={handleChange} />
          </div>

          <div className="form-group">
            <label>Timeline</label>
            <input name="timeline" value={form.timeline} onChange={handleChange} />
          </div>

          <div className="form-group">
            <label>Notes</label>
            <textarea name="notes" value={form.notes} onChange={handleChange} rows={4} />
          </div>

          {error && <p className="error">{error}</p>}

          <div className="form-actions">
            <button type="button" onClick={() => navigate('/')}>Cancel</button>
            <button type="submit">Save Lead</button>
          </div>

        </form>
      </div>
    </div>
  )
}