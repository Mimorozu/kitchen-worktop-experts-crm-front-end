import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { createLead } from '../api/leads'
import Navbar from '../components/Navbar'
import SelectedMaterialField from '../components/SelectedMaterialField'
import { logout } from '../api/auth'
import { SOURCES } from '../constants'

export default function NewLead() {
  const navigate = useNavigate()
  const [error, setError] = useState('')
  const [form, setForm] = useState({
    name: '',
    email: '',
    phone: '',
    addressLine1: '',
    addressLine2: '',
    postcode: '',
    size: '',
    material: '',
    quartzStyle: '',
    kitchenColour: '',
    kitchenStyle: '',
    floorColour: '',
    handleColour: '',
    wallColour: '',
    specialFeatures: '',
    budget: '',
    timeline: '',
    notes: '',
    followUpDate: '',
    warehouseVisitDate: '',
    selectedMaterial: '',
    templateDate: '',
    kitchenInstallDate: '',
    source: 'Website'
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

          <h2 className="form-section-title">Customer Details</h2>
          <div className="form-grid">
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
            <label>Address Line 1</label>
            <input name="addressLine1" value={form.addressLine1} onChange={handleChange} />
          </div>

          <div className="form-group">
            <label>Address Line 2</label>
            <input name="addressLine2" value={form.addressLine2} onChange={handleChange} />
          </div>

          <div className="form-group">
            <label>Postcode *</label>
            <input name="postcode" value={form.postcode} onChange={handleChange} required />
          </div>
          </div>

          <h2 className="form-section-title">Kitchen Details</h2>
          <div className="form-grid">
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
            <label>Kitchen Style</label>
            <input name="kitchenStyle" value={form.kitchenStyle} onChange={handleChange} />
          </div>

          <div className="form-group">
            <label>Kitchen Colour</label>
            <input name="kitchenColour" value={form.kitchenColour} onChange={handleChange} />
          </div>

          <div className="form-group">
            <label>Floor Colour</label>
            <input name="floorColour" value={form.floorColour} onChange={handleChange} />
          </div>

          <div className="form-group">
            <label>Handle Colour</label>
            <input name="handleColour" value={form.handleColour} onChange={handleChange} />
          </div>

          <div className="form-group">
            <label>Wall Colour</label>
            <input name="wallColour" value={form.wallColour} onChange={handleChange} />
          </div>

          <div className="form-group">
            <label>Slab Design</label>
            <input name="quartzStyle" value={form.quartzStyle} onChange={handleChange} />
          </div>

          <div className="form-group">
            <label>Budget</label>
            <input name="budget" value={form.budget} onChange={handleChange} />
          </div>

          <div className="form-group form-group-full">
            <label>Special Features</label>
            <input name="specialFeatures" value={form.specialFeatures} onChange={handleChange} />
          </div>
          </div>

          <h2 className="form-section-title">Dates</h2>
          <div className="form-grid">
          <div className="form-group">
            <label>Timeline</label>
            <input name="timeline" value={form.timeline} onChange={handleChange} />
          </div>

          <div className="form-group">
            <label>Kitchen Install</label>
            <input name="kitchenInstallDate" type="date" value={form.kitchenInstallDate} onChange={handleChange} />
          </div>

          <div className="form-group">
            <label>Template Date</label>
            <input name="templateDate" type="date" value={form.templateDate} onChange={handleChange} />
          </div>
          </div>

          <h2 className="form-section-title">Result</h2>
          <div className="form-grid">
          <div className="form-group">
            <label>Source</label>
            <select name="source" value={form.source} onChange={handleChange}>
              {SOURCES.map((s) => (
                <option key={s} value={s}>{s}</option>
              ))}
            </select>
          </div>

          <div className="form-group">
            <label>Supplier Warehouse Visit</label>
            <input name="warehouseVisitDate" type="date" value={form.warehouseVisitDate} onChange={handleChange} />
          </div>

          <div className="form-group">
            <label>Follow-up Date</label>
            <input name="followUpDate" type="date" value={form.followUpDate} onChange={handleChange} />
          </div>

          <div className="form-group">
            <label>Selected Material</label>
            <SelectedMaterialField value={form.selectedMaterial} onChange={handleChange} />
          </div>

          <div className="form-group form-group-full">
            <label>Notes</label>
            <textarea name="notes" value={form.notes} onChange={handleChange} rows={4} />
          </div>
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