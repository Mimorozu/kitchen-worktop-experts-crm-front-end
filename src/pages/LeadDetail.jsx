import { useState, useEffect } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { getLead, updateLead, deleteLead } from '../api/leads'
import Navbar from '../components/Navbar'
import { logout } from '../api/auth'

const STATUSES = ['New', 'Contacted', 'Quoted', 'Booked', 'Fitted', 'Invoiced', 'Lost']

export default function LeadDetail() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [lead, setLead] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [saving, setSaving] = useState(false)
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
    notes: '',
    status: '',
    quoteValue: ''
  })

  useEffect(() => {
    const fetchLead = async () => {
      try {
        const data = await getLead(id)
        setLead(data)
        setForm({
          name: data.name || '',
          email: data.email || '',
          phone: data.phone || '',
          postcode: data.postcode || '',
          size: data.size || '',
          material: data.material || '',
          quartzStyle: data.quartzStyle || '',
          budget: data.budget || '',
          timeline: data.timeline || '',
          notes: data.notes || '',
          status: data.status || 'New',
          quoteValue: data.quoteValue || ''
        })
      } catch (err) {
        setError('Failed to load lead')
      } finally {
        setLoading(false)
      }
    }
    fetchLead()
  }, [id])

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value })
  }

  const handleSave = async () => {
    setSaving(true)
    try {
      await updateLead(id, form)
      navigate('/')
    } catch (err) {
      setError('Failed to save changes')
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async () => {
    if (!window.confirm('Are you sure you want to delete this lead?')) return
    try {
      await deleteLead(id)
      navigate('/')
    } catch (err) {
      setError('Failed to delete lead')
    }
  }

  const handleLogout = () => {
    logout()
    navigate('/login')
  }

  if (loading) return <p className="loading">Loading...</p>
  if (error) return <p className="error">{error}</p>

  return (
    <div>
      <Navbar onLogout={handleLogout} />
      <div className="form-container">
        <div className="detail-header">
          <h1>{lead.name}</h1>
          <span className={`status-badge status-${form.status.toLowerCase()}`}>
            {form.status}
          </span>
        </div>

        <div className="form-group">
          <label>Status</label>
          <select name="status" value={form.status} onChange={handleChange}>
            {STATUSES.map(s => (
              <option key={s} value={s}>{s}</option>
            ))}
          </select>
        </div>

        <div className="form-group">
          <label>Quote Value (£)</label>
          <input name="quoteValue" type="number" value={form.quoteValue} onChange={handleChange} />
        </div>

        <div className="form-group">
          <label>Name</label>
          <input name="name" value={form.name} onChange={handleChange} />
        </div>

        <div className="form-group">
          <label>Email</label>
          <input name="email" type="email" value={form.email} onChange={handleChange} />
        </div>

        <div className="form-group">
          <label>Phone</label>
          <input name="phone" value={form.phone} onChange={handleChange} />
        </div>

        <div className="form-group">
          <label>Postcode</label>
          <input name="postcode" value={form.postcode} onChange={handleChange} />
        </div>

        <div className="form-group">
          <label>Size</label>
          <select name="size" value={form.size} onChange={handleChange}>
            <option value="Small">Small</option>
            <option value="Medium">Medium</option>
            <option value="Large">Large</option>
          </select>
        </div>

        <div className="form-group">
          <label>Material</label>
          <select name="material" value={form.material} onChange={handleChange}>
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
          <button className="delete-btn" onClick={handleDelete}>Delete Lead</button>
          <button type="button" onClick={() => navigate('/')}>Cancel</button>
          <button onClick={handleSave} disabled={saving}>
            {saving ? 'Saving...' : 'Save Changes'}
          </button>
        </div>
      </div>
    </div>
  )
}