// Quote maths for the job calculator. Takes the pricing settings object as input; all money in £.

// Flat cutting cost for a slab quantity and thickness. Quantities above 4 use the 4-slab cost.
export const getCuttingCost = (pricing, quantity, thickness) => {
  const qty = Number(quantity) || 0
  if (qty <= 0) return 0
  const table = pricing.cuttingCosts[thickness] || pricing.cuttingCosts['20mm']
  return table[Math.min(qty, 4)] ?? 0
}

// Works out slab cost, cutting, markup and VAT for one job.
export const calculateJob = (pricing, { slabName, finish, thickness, quantity }) => {
  const slab = pricing.slabs.find((s) => s.name === slabName)
  const prices = slab?.finishes[finish]
  const pricePerM2 = prices ? (thickness === '30mm' ? prices.price30mm : prices.price20mm) : 0
  const qty = Number(quantity) || 0

  const slabCostIncVat = pricePerM2 * pricing.slabAreaM2 * qty * (1 + pricing.vatRate)
  const cuttingCost = getCuttingCost(pricing, qty, thickness)
  const subtotal = slabCostIncVat + cuttingCost + pricing.markup

  return {
    slabCostIncVat,
    cuttingCost,
    markup: pricing.markup,
    subtotal,
    vat: subtotal * pricing.vatRate,
    total: subtotal * (1 + pricing.vatRate)
  }
}
