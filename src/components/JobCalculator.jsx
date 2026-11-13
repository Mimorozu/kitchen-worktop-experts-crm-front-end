import { useState } from 'react'
import { usePricing } from '../hooks/usePricing'
import { calculateJob } from '../utils/pricing'
import { generateQuotePdf } from '../utils/generateQuotePdf'

const currency = (n) => `£${n.toLocaleString('en-GB', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`

// Waits for pricing settings before showing the form
export default function JobCalculator({ lead }) {
  const { pricing, error } = usePricing()

  if (error) {
    return (
      <div className="activity-panel">
        <h2>Job Calculator</h2>
        <p className="error">{error}</p>
      </div>
    )
  }

  if (!pricing) {
    return (
      <div className="activity-panel">
        <h2>Job Calculator</h2>
        <p className="activity-empty">Loading pricing...</p>
      </div>
    )
  }

  return <JobCalculatorForm lead={lead} pricing={pricing} />
}

function JobCalculatorForm({ lead, pricing }) {
  const [slabName, setSlabName] = useState(pricing.slabs[0]?.name ?? '')
  const [finish, setFinish] = useState('Polished')
  const [thickness, setThickness] = useState('20mm')
  const [quantity, setQuantity] = useState(1)
  const [exporting, setExporting] = useState(false)

  const slab = pricing.slabs.find((s) => s.name === slabName)
  const availableFinishes = slab ? Object.keys(slab.finishes) : ['Polished']
  const activeFinish = availableFinishes.includes(finish) ? finish : availableFinishes[0]

  const handleSlabChange = (e) => {
    setSlabName(e.target.value)
    setFinish('Polished')
  }

  const { slabCostIncVat, cuttingCost, markup, subtotal, vat, total } = calculateJob(pricing, {
    slabName,
    finish: activeFinish,
    thickness,
    quantity
  })

  const handleExport = async () => {
    setExporting(true)
    try {
      await generateQuotePdf({
        lead,
        slabName,
        finish: activeFinish,
        thickness,
        quantity,
        subtotal,
        vat,
        total
      })
    } finally {
      setExporting(false)
    }
  }

  return (
    <div className="activity-panel">
      <h2>Job Calculator</h2>

      <div className="form-group">
        <label>Slab Name</label>
        <select value={slabName} onChange={handleSlabChange}>
          {pricing.slabs.map((s) => (
            <option key={s.name} value={s.name}>{s.name}</option>
          ))}
        </select>
      </div>

      <div className="calc-row">
        <div className="form-group">
          <label>Finish</label>
          <select value={activeFinish} onChange={(e) => setFinish(e.target.value)} disabled={availableFinishes.length < 2}>
            {availableFinishes.map((f) => (
              <option key={f} value={f}>{f}</option>
            ))}
          </select>
        </div>

        <div className="form-group">
          <label>Thickness</label>
          <select value={thickness} onChange={(e) => setThickness(e.target.value)}>
            <option value="20mm">20mm</option>
            <option value="30mm">30mm</option>
          </select>
        </div>
      </div>

      <div className="form-group">
        <label>Slab Quantity</label>
        <input
          type="number"
          min="1"
          step="1"
          value={quantity}
          onChange={(e) => setQuantity(e.target.value)}
        />
      </div>

      <div className="calc-summary">
        <div className="calc-summary-row">
          <span>Slab cost (incl. VAT)</span>
          <span>{currency(slabCostIncVat)}</span>
        </div>
        <div className="calc-summary-row">
          <span>Cutting costs</span>
          <span>{currency(cuttingCost)}</span>
        </div>
        <div className="calc-summary-row">
          <span>Markup</span>
          <span>{currency(markup)}</span>
        </div>
        <div className="calc-summary-row">
          <span>Subtotal</span>
          <span>{currency(subtotal)}</span>
        </div>
        <div className="calc-summary-row">
          <span>VAT ({Math.round(pricing.vatRate * 100)}%)</span>
          <span>{currency(vat)}</span>
        </div>
        <div className="calc-summary-row calc-summary-total">
          <span>Total inc. VAT</span>
          <span>{currency(total)}</span>
        </div>
      </div>

      <button type="button" className="export-quote-btn" onClick={handleExport} disabled={exporting}>
        {exporting ? 'Generating...' : 'Export Quote (PDF)'}
      </button>
    </div>
  )
}
