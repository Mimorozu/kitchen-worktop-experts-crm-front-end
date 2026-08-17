import { useState, useEffect } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { getLead, updateLead, deleteLead, addLeadActivity, uploadLeadPhoto, deleteLeadPhoto } from '../api/leads'
import Navbar from '../components/Navbar'
import JobCalculator from '../components/JobCalculator'
import SelectedMaterialField from '../components/SelectedMaterialField'
import { logout } from '../api/auth'
import { STATUSES, SOURCES } from '../constants'

const formatDateTime = (iso) =>
  new Date(iso).toLocaleString('en-GB', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' })

const buildForm = (data) => ({
  name: data.name || '',
  email: data.email || '',
  phone: data.phone || '',
  addressLine1: data.addressLine1 || '',
  addressLine2: data.addressLine2 || '',
  postcode: data.postcode || '',
  size: data.size || '',
  material: data.material || '',
  quartzStyle: data.quartzStyle || '',
  kitchenColour: data.kitchenColour || '',
  kitchenStyle: data.kitchenStyle || '',
  floorColour: data.floorColour || '',
  handleColour: data.handleColour || '',
  wallColour: data.wallColour || '',
  specialFeatures: data.specialFeatures || '',
  budget: data.budget || '',
  timeline: data.timeline || '',
  notes: data.notes || '',
  status: data.status || 'New',
  quoteValue: data.quoteValue || '',
  followUpDate: data.followUpDate || '',
  warehouseVisitDate: data.warehouseVisitDate || '',
  selectedMaterial: data.selectedMaterial || '',
  templateDate: data.templateDate || '',
  installDate: data.installDate || '',
  kitchenInstallDate: data.kitchenInstallDate || '',
  source: data.source || 'Website'
})

export default function LeadDetail() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [lead, setLead] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [saving, setSaving] = useState(false)
  const [editing, setEditing] = useState(false)
  const [noteText, setNoteText] = useState('')
  const [addingNote, setAddingNote] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [form, setForm] = useState(buildForm({}))

  useEffect(() => {
    const fetchLead = async () => {
      try {
        const data = await getLead(id)
        setLead(data)
        setForm(buildForm(data))
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

  // Dropdown fields save immediately on change, same as the Kanban board's drag-drop,
  // instead of waiting for the separate Edit/Save Changes flow.
  const handleDropdownChange = async (e) => {
    const { name, value } = e.target
    const prevValue = form[name]
    setForm((f) => ({ ...f, [name]: value }))
    setLead((l) => ({ ...l, [name]: value }))
    try {
      await updateLead(id, { [name]: value })
    } catch (err) {
      setForm((f) => ({ ...f, [name]: prevValue }))
      setLead((l) => ({ ...l, [name]: prevValue }))
      setError(`Failed to update ${name}`)
    }
  }

  const handleSave = async () => {
    setSaving(true)
    try {
      const updated = await updateLead(id, form)
      setLead((l) => ({ ...l, ...updated }))
      setForm(buildForm(updated))
      setEditing(false)
    } catch (err) {
      setError('Failed to save changes')
    } finally {
      setSaving(false)
    }
  }

  const handleCancelEdit = () => {
    setForm(buildForm(lead))
    setEditing(false)
    setError('')
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

  const handleAddNote = async () => {
    if (!noteText.trim()) return
    setAddingNote(true)
    try {
      const entry = await addLeadActivity(id, noteText.trim())
      setLead((l) => ({ ...l, activityLog: [...(l.activityLog || []), entry] }))
      setNoteText('')
    } catch (err) {
      setError('Failed to add note')
    } finally {
      setAddingNote(false)
    }
  }

  const handlePhotoSelect = async (e) => {
    const file = e.target.files[0]
    e.target.value = ''
    if (!file) return
    setUploading(true)
    try {
      const photo = await uploadLeadPhoto(id, file)
      setLead((l) => ({ ...l, photos: [...(l.photos || []), photo] }))
    } catch (err) {
      setError('Failed to upload photo')
    } finally {
      setUploading(false)
    }
  }

  const handlePhotoDelete = async (photoId) => {
    try {
      await deleteLeadPhoto(id, photoId)
      setLead((l) => ({ ...l, photos: l.photos.filter((p) => p.id !== photoId) }))
    } catch (err) {
      setError('Failed to delete photo')
    }
  }

  if (loading) return <p className="loading">Loading...</p>
  if (error) return <p className="error">{error}</p>

  return (
    <div>
      <Navbar onLogout={handleLogout} />
      <div className="detail-layout">
      <div className="form-container">
        <div className="detail-header">
          <div>
            <h1>{lead.name}</h1>
            {lead.referenceNumber && (
              <div className="reference-number">Ref #{lead.referenceNumber}</div>
            )}
          </div>
          <span className={`status-badge status-${form.status.toLowerCase()}`}>
            {form.status}
          </span>
        </div>

        <h2 className="form-section-title">Customer Details</h2>
        <div className="form-grid">
        <div className="form-group">
          <label>Name</label>
          <input name="name" value={form.name} onChange={handleChange} disabled={!editing} />
        </div>

        <div className="form-group">
          <label>Email</label>
          <input name="email" type="email" value={form.email} onChange={handleChange} disabled={!editing} />
        </div>

        <div className="form-group">
          <label>Phone</label>
          <input name="phone" value={form.phone} onChange={handleChange} disabled={!editing} />
        </div>

        <div className="form-group">
          <label>Address Line 1</label>
          <input name="addressLine1" value={form.addressLine1} onChange={handleChange} disabled={!editing} />
        </div>

        <div className="form-group">
          <label>Address Line 2</label>
          <input name="addressLine2" value={form.addressLine2} onChange={handleChange} disabled={!editing} />
        </div>

        <div className="form-group">
          <label>Postcode</label>
          <input name="postcode" value={form.postcode} onChange={handleChange} disabled={!editing} />
        </div>
        </div>

        <h2 className="form-section-title">Kitchen Details</h2>
        <div className="form-grid">
        <div className="form-group">
          <label>Size</label>
          <select name="size" value={form.size} onChange={handleDropdownChange}>
            <option value="Small">Small</option>
            <option value="Medium">Medium</option>
            <option value="Large">Large</option>
          </select>
        </div>

        <div className="form-group">
          <label>Material</label>
          <select name="material" value={form.material} onChange={handleDropdownChange}>
            <option value="Quartz">Quartz</option>
            <option value="Granite">Granite</option>
            <option value="Porcelain">Porcelain</option>
          </select>
        </div>

        <div className="form-group">
          <label>Kitchen Style</label>
          <input name="kitchenStyle" value={form.kitchenStyle} onChange={handleChange} disabled={!editing} />
        </div>

        <div className="form-group">
          <label>Kitchen Colour</label>
          <input name="kitchenColour" value={form.kitchenColour} onChange={handleChange} disabled={!editing} />
        </div>

        <div className="form-group">
          <label>Floor Colour</label>
          <input name="floorColour" value={form.floorColour} onChange={handleChange} disabled={!editing} />
        </div>

        <div className="form-group">
          <label>Handle Colour</label>
          <input name="handleColour" value={form.handleColour} onChange={handleChange} disabled={!editing} />
        </div>

        <div className="form-group">
          <label>Wall Colour</label>
          <input name="wallColour" value={form.wallColour} onChange={handleChange} disabled={!editing} />
        </div>

        <div className="form-group">
          <label>Slab Design</label>
          <input name="quartzStyle" value={form.quartzStyle} onChange={handleChange} disabled={!editing} />
        </div>

        <div className="form-group">
          <label>Budget</label>
          <input name="budget" value={form.budget} onChange={handleChange} disabled={!editing} />
        </div>

        <div className="form-group form-group-full">
          <label>Special Features</label>
          <input name="specialFeatures" value={form.specialFeatures} onChange={handleChange} disabled={!editing} />
        </div>
        </div>

        <h2 className="form-section-title">Dates</h2>
        <div className="form-grid">
        <div className="form-group">
          <label>Timeline</label>
          <input name="timeline" value={form.timeline} onChange={handleChange} disabled={!editing} />
        </div>

        <div className="form-group">
          <label>Kitchen Install</label>
          <input name="kitchenInstallDate" type="date" value={form.kitchenInstallDate} onChange={handleChange} disabled={!editing} />
        </div>

        <div className="form-group">
          <label>Template Date</label>
          <input name="templateDate" type="date" value={form.templateDate} onChange={handleChange} disabled={!editing} />
        </div>

        <div className="form-group">
          <label>Worktop Install Date</label>
          <input name="installDate" type="date" value={form.installDate} onChange={handleChange} disabled={!editing} />
        </div>
        </div>

        <h2 className="form-section-title">Result</h2>
        <div className="form-grid">
        <div className="form-group">
          <label>Status</label>
          <select name="status" value={form.status} onChange={handleDropdownChange}>
            {STATUSES.map(s => (
              <option key={s} value={s}>{s}</option>
            ))}
          </select>
        </div>

        <div className="form-group">
          <label>Source</label>
          <select name="source" value={form.source} onChange={handleDropdownChange}>
            {SOURCES.map((s) => (
              <option key={s} value={s}>{s}</option>
            ))}
          </select>
        </div>

        <div className="form-group">
          <label>Quote Value (£)</label>
          <input name="quoteValue" type="number" value={form.quoteValue} onChange={handleChange} disabled={!editing} />
        </div>

        <div className="form-group">
          <label>Supplier Warehouse Visit</label>
          <input name="warehouseVisitDate" type="date" value={form.warehouseVisitDate} onChange={handleChange} disabled={!editing} />
        </div>

        <div className="form-group">
          <label>Follow-up Date</label>
          <input name="followUpDate" type="date" value={form.followUpDate} onChange={handleChange} disabled={!editing} />
        </div>

        <div className="form-group">
          <label>Selected Material</label>
          <SelectedMaterialField value={form.selectedMaterial} onChange={handleChange} editing={editing} />
        </div>

        <div className="form-group form-group-full">
          <label>Notes</label>
          <textarea name="notes" value={form.notes} onChange={handleChange} rows={4} disabled={!editing} />
        </div>
        </div>

        {error && <p className="error">{error}</p>}

        <div className="form-actions">
          <button className="delete-btn" onClick={handleDelete}>Delete Lead</button>
          {editing ? (
            <>
              <button type="button" onClick={handleCancelEdit}>Cancel</button>
              <button onClick={handleSave} disabled={saving}>
                {saving ? 'Saving...' : 'Save Changes'}
              </button>
            </>
          ) : (
            <>
              <button type="button" onClick={() => navigate('/')}>Back to Leads</button>
              <button type="button" onClick={() => setEditing(true)}>Edit</button>
            </>
          )}
        </div>
      </div>

      <div className="detail-sidebar">
        <JobCalculator lead={lead} />

        <div className="activity-panel">
          <h2>Photos &amp; Files</h2>
          <label className="photo-upload-btn">
            {uploading ? 'Uploading...' : '+ Upload photo or PDF'}
            <input
              type="file"
              accept=".jpg,.jpeg,.png,.webp,.pdf"
              onChange={handlePhotoSelect}
              disabled={uploading}
              hidden
            />
          </label>
          <div className="photo-grid">
            {(lead.photos || []).map((photo) => {
              const isImage = /\.(jpe?g|png|webp)$/i.test(photo.filename)
              return (
                <div key={photo.id} className="photo-thumb">
                  <a href={photo.url} target="_blank" rel="noreferrer">
                    {isImage ? (
                      <img src={photo.url} alt={photo.filename} />
                    ) : (
                      <div className="photo-file-icon">PDF</div>
                    )}
                  </a>
                  <button
                    className="photo-remove-btn"
                    title="Remove"
                    onClick={() => handlePhotoDelete(photo.id)}
                  >
                    ×
                  </button>
                </div>
              )
            })}
            {(!lead.photos || lead.photos.length === 0) && (
              <p className="activity-empty">No photos uploaded yet.</p>
            )}
          </div>
        </div>

        <div className="activity-panel">
          <h2>Activity</h2>
          <div className="activity-add">
            <textarea
              placeholder="Add a note..."
              value={noteText}
              onChange={(e) => setNoteText(e.target.value)}
              rows={2}
            />
            <button onClick={handleAddNote} disabled={addingNote || !noteText.trim()}>
              {addingNote ? 'Adding...' : 'Add Note'}
            </button>
          </div>
          <div className="activity-log">
            {[...(lead.activityLog || [])].reverse().map((entry) => (
              <div key={entry.id} className={`activity-entry activity-${entry.type}`}>
                <div className="activity-entry-message">{entry.message}</div>
                <div className="activity-entry-time">{formatDateTime(entry.createdAt)}</div>
              </div>
            ))}
            {(!lead.activityLog || lead.activityLog.length === 0) && (
              <p className="activity-empty">No activity yet.</p>
            )}
          </div>
        </div>
      </div>
      </div>
    </div>
  )
}