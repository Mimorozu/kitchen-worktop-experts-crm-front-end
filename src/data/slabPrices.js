// BQS Quartz Composite price list (2026), price per square metre (£/m²), ex. VAT.
// Source: BQS PRICE LIST 2026.pdf. Most colours only come in Polished; some also
// offer a Velluto (textured) finish at a higher price — only listed where present.
// Standard slab format is 320 x 160cm = 5.12m²; multiply by SLAB_AREA_M2 to get cost per whole slab.
export const SLAB_AREA_M2 = 5.12

export const SLAB_PRICES = [
  { name: 'Arctic', finishes: { Polished: { price20mm: 137.5, price30mm: 166.6 } } },
  { name: 'Aurora Dune', finishes: {
    Polished: { price20mm: 136.1, price30mm: 162.3 },
    Velluto: { price20mm: 142.6, price30mm: 168.8 }
  } },
  { name: 'Avenza', finishes: { Polished: { price20mm: 137.5, price30mm: 166.6 } } },
  { name: 'Beige Mirrorlux', finishes: { Polished: { price20mm: 66.8, price30mm: 88.7 } } },
  { name: 'Bianco Fontana', finishes: {
    Polished: { price20mm: 130.3, price30mm: 159.4 },
    Velluto: { price20mm: 136.8, price30mm: 165.9 }
  } },
  { name: 'Bianco Massa', finishes: { Polished: { price20mm: 79.8, price30mm: 108.9 } } },
  { name: 'Bianco Venatino', finishes: { Polished: { price20mm: 79.8, price30mm: 108.9 } } },
  { name: 'Black Mirrorlux', finishes: { Polished: { price20mm: 66.8, price30mm: 88.7 } } },
  { name: 'Blanco Mist', finishes: { Polished: { price20mm: 75, price30mm: 97 } } },
  { name: 'Borealis Green', finishes: {
    Polished: { price20mm: 136.1, price30mm: 162.3 },
    Velluto: { price20mm: 142.6, price30mm: 168.8 }
  } },
  { name: 'Calacatta Aurora', finishes: { Polished: { price20mm: 137.5, price30mm: 166.6 } } },
  { name: 'Calacatta Forte', finishes: { Polished: { price20mm: 123.1, price30mm: 147.8 } } },
  { name: 'Calacatta Viola', finishes: { Polished: { price20mm: 134.6, price30mm: 163.7 } } },
  { name: 'Canaletto', finishes: { Polished: { price20mm: 137.5, price30mm: 166.6 } } },
  { name: 'Capri', finishes: {
    Polished: { price20mm: 137.5, price30mm: 166.6 },
    Velluto: { price20mm: 144, price30mm: 173.1 }
  } },
  { name: 'Cararra Extra', finishes: {
    Polished: { price20mm: 87, price30mm: 116.1 },
    Velluto: { price20mm: 93.5, price30mm: 122.6 }
  } },
  { name: 'Carrara Minari', finishes: { Polished: { price20mm: 97, price30mm: 126 } } },
  { name: 'Crema Fiore', finishes: {
    Polished: { price20mm: 137.5, price30mm: 166.6 },
    Velluto: { price20mm: 144, price30mm: 173.1 }
  } },
  { name: 'Desert Grey', finishes: { Polished: { price20mm: 79.8, price30mm: 108.9 } } },
  { name: 'Elegant Grey', finishes: { Polished: { price20mm: 79.8, price30mm: 108.9 } } },
  { name: 'Glacier', finishes: {
    Polished: { price20mm: 123.1, price30mm: 152.2 },
    Velluto: { price20mm: 129.6, price30mm: 158.7 }
  } },
  { name: 'Gracious', finishes: { Polished: { price20mm: 108.7, price30mm: 137.7 } } },
  { name: 'Grey Mirrorlux', finishes: { Polished: { price20mm: 66.8, price30mm: 88.7 } } },
  { name: 'Grey Shimmer', finishes: { Polished: { price20mm: 68.3, price30mm: 93 } } },
  { name: 'Lumen Ice', finishes: {
    Polished: { price20mm: 136.1, price30mm: 162.3 },
    Velluto: { price20mm: 142.6, price30mm: 168.8 }
  } },
  { name: 'Midas Gold', finishes: { Polished: { price20mm: 80, price30mm: 102 } } },
  { name: 'Neo Calacatta', finishes: { Polished: { price20mm: 130.3, price30mm: 159.4 } } },
  { name: 'Opus White', finishes: {
    Polished: { price20mm: 68.3, price30mm: 93 },
    Velluto: { price20mm: 74.8, price30mm: 99.5 }
  } },
  { name: 'Pearl White', finishes: { Polished: { price20mm: 75.5, price30mm: 104.5 } } },
  { name: 'Permafrost', finishes: {
    Polished: { price20mm: 123.1, price30mm: 152.2 },
    Velluto: { price20mm: 129.6, price30mm: 158.7 }
  } },
  { name: 'Pietra Modena', finishes: { Polished: { price20mm: 130.3, price30mm: 159.4 } } },
  { name: 'Rapture', finishes: { Polished: { price20mm: 108.7, price30mm: 137.7 } } },
  { name: 'Roma', finishes: { Polished: { price20mm: 101.4, price30mm: 130.5 } } },
  { name: 'Siberia', finishes: { Polished: { price20mm: 108.7, price30mm: 137.7 } } },
  { name: 'Statuario Gold', finishes: { Polished: { price20mm: 120.2, price30mm: 149.3 } } },
  { name: 'Statuario Grey', finishes: { Polished: { price20mm: 120.2, price30mm: 149.3 } } },
  { name: 'Super White Plus', finishes: {
    Polished: { price20mm: 87, price30mm: 116.1 },
    Velluto: { price20mm: 93.5, price30mm: 122.6 }
  } },
  { name: 'Taj Mahal', finishes: {
    Polished: { price20mm: 146.2, price30mm: 176.1 },
    Velluto: { price20mm: 152.7, price30mm: 182.6 }
  } },
  { name: 'White Almond', finishes: { Polished: { price20mm: 68.3, price30mm: 93 } } },
  { name: 'White Mirrorlux', finishes: { Polished: { price20mm: 66.8, price30mm: 88.7 } } },
  { name: 'White Shimmer', finishes: { Polished: { price20mm: 68.3, price30mm: 93 } } }
]

export const VAT_RATE = 0.2

export const MARKUP = 200

// Flat cutting cost by slab quantity and thickness, added to the subtotal before VAT.
const CUTTING_COSTS = {
  '20mm': { 1: 900, 2: 1300, 3: 1600, 4: 1900 },
  '30mm': { 1: 1200, 2: 1500, 3: 1900, 4: 2200 }
}

export const getCuttingCost = (quantity, thickness) => {
  const qty = Number(quantity) || 0
  if (qty <= 0) return 0
  const table = CUTTING_COSTS[thickness] || CUTTING_COSTS['20mm']
  return table[Math.min(qty, 4)]
}
