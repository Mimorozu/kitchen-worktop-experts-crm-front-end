import { jsPDF } from 'jspdf'

const NAVY = [26, 26, 46]
const CORAL = [233, 69, 96]
const INK = [40, 40, 48]
const MUTED = [140, 140, 152]
const HAIRLINE = [225, 225, 230]

const MARGIN_X = 20
const PAGE_RIGHT = 190
const CONTENT_WIDTH = PAGE_RIGHT - MARGIN_X

const currency = (n) => `£${n.toLocaleString('en-GB', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`

const slugify = (name) => name.toLowerCase().replace(/\s+/g, '-')

const loadSlabImage = (slabName) => new Promise((resolve) => {
  const img = new Image()
  img.crossOrigin = 'anonymous'
  img.onload = () => {
    const canvas = document.createElement('canvas')
    canvas.width = img.naturalWidth
    canvas.height = img.naturalHeight
    const ctx = canvas.getContext('2d')
    ctx.drawImage(img, 0, 0)
    resolve({
      dataUrl: canvas.toDataURL('image/jpeg', 0.8),
      width: img.naturalWidth,
      height: img.naturalHeight
    })
  }
  img.onerror = () => resolve(null)
  img.src = `/slabs/${slugify(slabName)}.webp`
})

// Small coral accent mark used before section labels, echoing the app's own section-dot motif.
const sectionLabel = (doc, text, x, y) => {
  doc.setFillColor(...CORAL)
  doc.rect(x, y - 3, 2.2, 2.2, 'F')
  doc.setFont(undefined, 'bold')
  doc.setFontSize(9)
  doc.setTextColor(...MUTED)
  doc.text(text.toUpperCase(), x + 5, y)
}

export async function generateQuotePdf({ lead, slabName, finish, thickness, quantity, subtotal, vat, total }) {
  const slabImage = await loadSlabImage(slabName)

  const doc = new jsPDF()

  // Header band
  doc.setFillColor(...NAVY)
  doc.rect(0, 0, 210, 36, 'F')
  doc.setFillColor(...CORAL)
  doc.rect(0, 36, 210, 1.2, 'F')

  doc.setTextColor(255, 255, 255)
  doc.setFont(undefined, 'bold')
  doc.setFontSize(19)
  doc.text('Kitchen Worktop Experts', MARGIN_X, 21)

  doc.setFont(undefined, 'normal')
  doc.setFontSize(10)
  doc.setTextColor(...CORAL)
  doc.text('QUOTE', PAGE_RIGHT, 16, { align: 'right' })
  doc.setTextColor(220, 220, 230)
  doc.setFontSize(9)
  const issueDate = new Date()
  const validUntil = new Date(issueDate.getTime() + 30 * 24 * 60 * 60 * 1000)
  doc.text(issueDate.toLocaleDateString('en-GB', { day: '2-digit', month: 'long', year: 'numeric' }), PAGE_RIGHT, 22, { align: 'right' })

  let y = 52

  // Customer / validity row
  sectionLabel(doc, 'Bill To', MARGIN_X, y)
  sectionLabel(doc, 'Valid Until', 130, y)

  y += 7
  doc.setFont(undefined, 'bold')
  doc.setFontSize(12)
  doc.setTextColor(...INK)
  doc.text(lead?.name || '', MARGIN_X, y)
  doc.text(validUntil.toLocaleDateString('en-GB', { day: '2-digit', month: 'long', year: 'numeric' }), 130, y)

  y += 6
  doc.setFont(undefined, 'normal')
  doc.setFontSize(10)
  doc.setTextColor(90, 90, 100)
  const addressLines = [lead?.addressLine1, lead?.addressLine2, lead?.postcode].filter(Boolean)
  addressLines.forEach((line) => {
    doc.text(line, MARGIN_X, y)
    y += 5.2
  })

  y += 8
  doc.setDrawColor(...HAIRLINE)
  doc.line(MARGIN_X, y, PAGE_RIGHT, y)
  y += 12

  // Slab & material
  sectionLabel(doc, 'Slab & Material', MARGIN_X, y)
  y += 6

  const boxX = MARGIN_X
  const boxY = y
  const boxW = CONTENT_WIDTH
  const boxH = slabImage ? Math.min(boxW * (slabImage.height / slabImage.width), 92) : 50

  doc.setDrawColor(...HAIRLINE)
  doc.roundedRect(boxX, boxY, boxW, boxH, 2, 2, 'S')

  if (slabImage) {
    const scale = Math.min(boxW / slabImage.width, boxH / slabImage.height)
    const drawW = slabImage.width * scale
    const drawH = slabImage.height * scale
    const offsetX = boxX + (boxW - drawW) / 2
    const offsetY = boxY + (boxH - drawH) / 2
    doc.addImage(slabImage.dataUrl, 'JPEG', offsetX, offsetY, drawW, drawH)
  } else {
    doc.setFontSize(8)
    doc.setTextColor(...MUTED)
    doc.text('No image available', boxX + boxW / 2, boxY + boxH / 2, { align: 'center' })
  }

  y = boxY + boxH + 11

  const specRows = [
    ['Slab', slabName],
    ['Finish', finish],
    ['Thickness', thickness],
    ['Quantity', String(quantity)]
  ]
  const specColWidth = boxW / specRows.length
  specRows.forEach(([label, value], i) => {
    const specX = boxX + i * specColWidth
    doc.setFont(undefined, 'normal')
    doc.setFontSize(8)
    doc.setTextColor(...MUTED)
    doc.text(label.toUpperCase(), specX, y)
    doc.setFont(undefined, 'bold')
    doc.setFontSize(12)
    doc.setTextColor(...INK)
    doc.text(String(value), specX, y + 6)
  })

  y += 18
  doc.setDrawColor(...HAIRLINE)
  doc.line(MARGIN_X, y, PAGE_RIGHT, y)
  y += 12

  // Price breakdown
  sectionLabel(doc, 'Price Breakdown', MARGIN_X, y)
  y += 10

  const priceRows = [
    ['Subtotal', subtotal],
    ['VAT (20%)', vat]
  ]
  priceRows.forEach(([label, value]) => {
    doc.setFont(undefined, 'normal')
    doc.setFontSize(10.5)
    doc.setTextColor(...INK)
    doc.text(label, MARGIN_X, y)
    doc.text(currency(value), PAGE_RIGHT, y, { align: 'right' })
    y += 6
    doc.setDrawColor(240, 240, 244)
    doc.line(MARGIN_X, y - 2.5, PAGE_RIGHT, y - 2.5)
  })

  y += 6

  // Total bar
  const totalBarH = 16
  doc.setFillColor(...NAVY)
  doc.roundedRect(MARGIN_X, y, CONTENT_WIDTH, totalBarH, 2, 2, 'F')
  doc.setFont(undefined, 'bold')
  doc.setFontSize(10)
  doc.setTextColor(220, 220, 230)
  doc.text('TOTAL INC. VAT', MARGIN_X + 6, y + totalBarH / 2 + 1.2, { baseline: 'middle' })
  doc.setFontSize(15)
  doc.setTextColor(...CORAL)
  doc.text(currency(total), PAGE_RIGHT - 6, y + totalBarH / 2 + 1.5, { align: 'right', baseline: 'middle' })

  // Footer
  doc.setDrawColor(...HAIRLINE)
  doc.line(MARGIN_X, 280, PAGE_RIGHT, 280)
  doc.setFont(undefined, 'normal')
  doc.setFontSize(8)
  doc.setTextColor(...MUTED)
  doc.text('This quote is valid for 30 days from the date above. Prices exclude any additional site works.', MARGIN_X, 286)
  doc.text('Thank you for choosing Kitchen Worktop Experts.', MARGIN_X, 291)

  const safeName = (lead?.name || 'quote').replace(/[^a-z0-9]+/gi, '-').toLowerCase()
  doc.save(`quote-${safeName}-${new Date().toISOString().slice(0, 10)}.pdf`)
}
