import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { logout } from '../api/auth'
import { savePricing } from '../api/pricing'
import { errorMessage } from '../api/auth'
import { usePricing } from '../hooks/usePricing'
import Navbar from '../components/Navbar'
import Sidebar from '../components/Sidebar'

const THICKNESSES = ['20mm', '30mm']
const FINISHES = ['Polished', 'Velluto']
const QUANTITIES = [1, 2, 3, 4]

const EMPTY_NEW_MATERIAL = { name: '', finish: 'Polished', price20mm: '', price30mm: '' }

// Turns an input's text into a number, keeping '' while the field is empty
const toNumber = (value) => (value === '' ? '' : Number(value))

const qtyLabel = (qty) => {
  if (qty === 1) return '1 slab'
  if (qty === 4) return '4+ slabs'
  return `${qty} slabs`
}

export default function PricingSettings() {
  const navigate = useNavigate()
  const { pricing, error } = usePricing()

  const handleLogout = () => {
    logout()
    navigate('/login')
  }

  let content
  if (error) content = <p className="error">{error}</p>
  else if (!pricing) content = <p className="loading">Loading pricing...</p>
  else content = <PricingForm initial={pricing} />

  return (
    <div>
      <Navbar onLogout={handleLogout} />
      <div className="app-body">
        <Sidebar />
        <div className="dashboard-container">
          <div className="dashboard-header">
            <h1>Pricing Settings</h1>
          </div>
          {content}
        </div>
      </div>
    </div>
  )
}

function PricingForm({ initial }) {
  const [draft, setDraft] = useState(initial)
  // VAT is stored as a fraction (0.2) but edited as a percentage; the text is kept so decimals can be typed
  const [vatText, setVatText] = useState(String(Number((initial.vatRate * 100).toFixed(2))))
  const [newMaterial, setNewMaterial] = useState(EMPTY_NEW_MATERIAL)
  const [addError, setAddError] = useState('')
  const [status, setStatus] = useState({ type: '', message: '' })
  const [saving, setSaving] = useState(false)

  // One row per material finish, for the table
  const rows = draft.slabs.flatMap((slab, slabIndex) =>
    Object.entries(slab.finishes).map(([finish, prices]) => ({
      key: `${slab.name}-${finish}`,
      slabIndex,
      name: slab.name,
      finish,
      prices
    }))
  )

  const updateGeneral = (field, value) => setDraft((d) => ({ ...d, [field]: value }))

  const updateCutting = (thickness, qty, value) => {
    setDraft((d) => ({
      ...d,
      cuttingCosts: {
        ...d.cuttingCosts,
        [thickness]: { ...d.cuttingCosts[thickness], [qty]: value }
      }
    }))
  }

  const updatePrice = (slabIndex, finish, field, value) => {
    setDraft((d) => ({
      ...d,
      slabs: d.slabs.map((slab, i) => {
        if (i !== slabIndex) return slab
        return {
          ...slab,
          finishes: {
            ...slab.finishes,
            [finish]: { ...slab.finishes[finish], [field]: value }
          }
        }
      })
    }))
  }

  // Removes one finish; a material with no finishes left is dropped too
  const removeFinish = (slabIndex, finish) => {
    setDraft((d) => ({
      ...d,
      slabs: d.slabs
        .map((slab, i) => {
          if (i !== slabIndex) return slab
          const finishes = { ...slab.finishes }
          delete finishes[finish]
          return { ...slab, finishes }
        })
        .filter((slab) => Object.keys(slab.finishes).length > 0)
    }))
  }

  const addMaterial = () => {
    const name = newMaterial.name.trim()
    const price20mm = toNumber(newMaterial.price20mm)
    const price30mm = toNumber(newMaterial.price30mm)
    const isPrice = (v) => typeof v === 'number' && Number.isFinite(v) && v >= 0

    if (!name) return setAddError('Enter a material name')
    if (!isPrice(price20mm) || !isPrice(price30mm)) return setAddError('Enter both prices (0 or more)')

    const existingIndex = draft.slabs.findIndex((s) => s.name.toLowerCase() === name.toLowerCase())
    if (existingIndex !== -1 && draft.slabs[existingIndex].finishes[newMaterial.finish]) {
      return setAddError(`${draft.slabs[existingIndex].name} already has a ${newMaterial.finish} finish`)
    }

    const prices = { price20mm, price30mm }
    const slabs = existingIndex === -1
      ? [...draft.slabs, { name, finishes: { [newMaterial.finish]: prices } }]
      : draft.slabs.map((slab, i) => (
        i === existingIndex
          ? { ...slab, finishes: { ...slab.finishes, [newMaterial.finish]: prices } }
          : slab
      ))

    setDraft({ ...draft, slabs })
    setNewMaterial(EMPTY_NEW_MATERIAL)
    setAddError('')
  }

  const handleSave = async () => {
    setSaving(true)
    setStatus({ type: '', message: '' })
    try {
      await savePricing(draft)
      setStatus({ type: 'success', message: 'Saved. New quotes use these prices.' })
    } catch (err) {
      setStatus({ type: 'error', message: errorMessage(err, 'Failed to save pricing') })
    } finally {
      setSaving(false)
    }
  }

  return (
    <>
      <div className="pricing-save-bar">
        {status.message && (
          <span className={status.type === 'error' ? 'error' : 'pricing-success'}>{status.message}</span>
        )}
        <button type="button" onClick={handleSave} disabled={saving}>
          {saving ? 'Saving...' : 'Save Changes'}
        </button>
      </div>

      <div className="report-panel pricing-panel">
        <h2>General</h2>
        <div className="form-grid">
          <div className="form-group">
            <label>VAT rate (%)</label>
            <input
              type="number"
              min="0"
              max="100"
              step="0.1"
              value={vatText}
              onChange={(e) => {
                setVatText(e.target.value)
                updateGeneral('vatRate', e.target.value === '' ? '' : Number(e.target.value) / 100)
              }}
            />
          </div>
          <div className="form-group">
            <label>Flat markup (£)</label>
            <input
              type="number"
              min="0"
              step="0.01"
              value={draft.markup}
              onChange={(e) => updateGeneral('markup', toNumber(e.target.value))}
            />
          </div>
          <div className="form-group">
            <label>Slab size (m²)</label>
            <input
              type="number"
              min="0.01"
              step="0.01"
              value={draft.slabAreaM2}
              onChange={(e) => updateGeneral('slabAreaM2', toNumber(e.target.value))}
            />
          </div>
        </div>
      </div>

      <div className="report-panel pricing-panel">
        <h2>Cutting costs (£, flat per order)</h2>
        <div className="table-scroll">
          <table className="leads-table">
            <thead>
              <tr>
                <th>Slabs</th>
                {THICKNESSES.map((t) => <th key={t}>{t}</th>)}
              </tr>
            </thead>
            <tbody>
              {QUANTITIES.map((qty) => (
                <tr key={qty}>
                  <td>{qtyLabel(qty)}</td>
                  {THICKNESSES.map((t) => (
                    <td key={t}>
                      <input
                        className="price-input"
                        type="number"
                        min="0"
                        step="0.01"
                        value={draft.cuttingCosts[t][qty]}
                        onChange={(e) => updateCutting(t, qty, toNumber(e.target.value))}
                      />
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <div className="report-panel pricing-panel">
        <h2>Materials (£ per m², ex. VAT)</h2>
        <div className="table-scroll">
          <table className="leads-table">
            <thead>
              <tr>
                <th>Material</th>
                <th>Finish</th>
                <th>20mm</th>
                <th>30mm</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {rows.length === 0 && (
                <tr>
                  <td colSpan={5} className="empty-cell">No materials yet.</td>
                </tr>
              )}
              {rows.map((row) => (
                <tr key={row.key}>
                  <td>{row.name}</td>
                  <td>{row.finish}</td>
                  <td>
                    <input
                      className="price-input"
                      type="number"
                      min="0"
                      step="0.01"
                      value={row.prices.price20mm}
                      onChange={(e) => updatePrice(row.slabIndex, row.finish, 'price20mm', toNumber(e.target.value))}
                    />
                  </td>
                  <td>
                    <input
                      className="price-input"
                      type="number"
                      min="0"
                      step="0.01"
                      value={row.prices.price30mm}
                      onChange={(e) => updatePrice(row.slabIndex, row.finish, 'price30mm', toNumber(e.target.value))}
                    />
                  </td>
                  <td>
                    <button
                      type="button"
                      className="price-remove-btn"
                      onClick={() => removeFinish(row.slabIndex, row.finish)}
                    >
                      Remove
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <h3 className="pricing-subtitle">Add material</h3>
        <div className="pricing-add-row">
          <div className="form-group">
            <label>Name</label>
            <input
              type="text"
              value={newMaterial.name}
              onChange={(e) => setNewMaterial({ ...newMaterial, name: e.target.value })}
              placeholder="e.g. Carrara"
            />
          </div>
          <div className="form-group">
            <label>Finish</label>
            <select
              value={newMaterial.finish}
              onChange={(e) => setNewMaterial({ ...newMaterial, finish: e.target.value })}
            >
              {FINISHES.map((f) => <option key={f} value={f}>{f}</option>)}
            </select>
          </div>
          <div className="form-group">
            <label>20mm (£/m²)</label>
            <input
              type="number"
              min="0"
              step="0.01"
              value={newMaterial.price20mm}
              onChange={(e) => setNewMaterial({ ...newMaterial, price20mm: e.target.value })}
            />
          </div>
          <div className="form-group">
            <label>30mm (£/m²)</label>
            <input
              type="number"
              min="0"
              step="0.01"
              value={newMaterial.price30mm}
              onChange={(e) => setNewMaterial({ ...newMaterial, price30mm: e.target.value })}
            />
          </div>
          <button type="button" onClick={addMaterial}>Add</button>
        </div>
        {addError && <p className="error">{addError}</p>}
      </div>
    </>
  )
}
