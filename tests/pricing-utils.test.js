// Quote maths in src/utils/pricing.js. Run with: npm test
import { test } from 'node:test'
import assert from 'node:assert/strict'
import { calculateJob, getCuttingCost } from '../src/utils/pricing.js'

// Same numbers as the defaults in the backend (src/pricingSettings.js)
const pricing = {
  vatRate: 0.2,
  markup: 200,
  slabAreaM2: 5.12,
  cuttingCosts: {
    '20mm': { 1: 900, 2: 1300, 3: 1600, 4: 1900 },
    '30mm': { 1: 1200, 2: 1500, 3: 1900, 4: 2200 }
  },
  slabs: [
    { name: 'Arctic', finishes: { Polished: { price20mm: 137.5, price30mm: 166.6 } } },
    { name: 'Taj Mahal', finishes: {
      Polished: { price20mm: 146.2, price30mm: 176.1 },
      Velluto: { price20mm: 152.7, price30mm: 182.6 }
    } }
  ]
}

const close = (actual, expected) => assert.ok(Math.abs(actual - expected) < 0.005, `${actual} != ${expected}`)

test('cutting cost: zero or negative quantity costs nothing', () => {
  assert.equal(getCuttingCost(pricing, 0, '20mm'), 0)
  assert.equal(getCuttingCost(pricing, -2, '20mm'), 0)
})

test('cutting cost: quantities above 4 use the 4-slab price', () => {
  assert.equal(getCuttingCost(pricing, 5, '30mm'), 2200)
})

test('cutting cost: unknown thickness falls back to 20mm', () => {
  assert.equal(getCuttingCost(pricing, 1, '40mm'), 900)
})

test('cutting cost: accepts a quantity typed as a string', () => {
  assert.equal(getCuttingCost(pricing, '3', '20mm'), 1600)
})

test('job total matches the original hardcoded calculation', () => {
  // 137.5 * 5.12 * 2 * 1.2 = 1689.60; + cutting 1300 + markup 200 = 3189.60 subtotal
  const job = calculateJob(pricing, { slabName: 'Arctic', finish: 'Polished', thickness: '20mm', quantity: 2 })
  close(job.slabCostIncVat, 1689.6)
  close(job.cuttingCost, 1300)
  close(job.subtotal, 3189.6)
  close(job.vat, 637.92)
  close(job.total, 3827.52)
})

test('30mm uses the 30mm price and cutting table', () => {
  const job = calculateJob(pricing, { slabName: 'Arctic', finish: 'Polished', thickness: '30mm', quantity: 1 })
  close(job.slabCostIncVat, 166.6 * 5.12 * 1.2)
  assert.equal(job.cuttingCost, 1200)
})

test('velluto finish has its own price', () => {
  const job = calculateJob(pricing, { slabName: 'Taj Mahal', finish: 'Velluto', thickness: '20mm', quantity: 1 })
  close(job.slabCostIncVat, 152.7 * 5.12 * 1.2)
})

test('unknown material charges only cutting and markup', () => {
  const job = calculateJob(pricing, { slabName: 'Nope', finish: 'Polished', thickness: '20mm', quantity: 1 })
  assert.equal(job.slabCostIncVat, 0)
  close(job.total, (900 + 200) * 1.2)
})

test('zero quantity charges no slab cost and no cutting, but keeps markup', () => {
  const job = calculateJob(pricing, { slabName: 'Arctic', finish: 'Polished', thickness: '20mm', quantity: 0 })
  assert.equal(job.slabCostIncVat, 0)
  assert.equal(job.cuttingCost, 0)
  close(job.total, 200 * 1.2)
})
