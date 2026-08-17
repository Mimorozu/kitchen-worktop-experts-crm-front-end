let leads = [
  {
    id: '1',
    referenceNumber: '0065',
    name: 'Sarah Whitfield',
    email: 'sarah.whitfield@example.com',
    phone: '07700 900123',
    addressLine1: '14 Elm Grove',
    addressLine2: '',
    postcode: 'SW1A 1AA',
    size: 'Medium',
    material: 'Quartz',
    quartzStyle: 'Calacatta Gold',
    kitchenColour: 'White',
    kitchenStyle: 'Shaker',
    floorColour: 'Light Oak',
    handleColour: 'Brushed Brass',
    wallColour: 'Soft Grey',
    specialFeatures: 'Under-cabinet lighting',
    budget: '£3000-4000',
    timeline: '2-4 weeks',
    notes: 'Prefers morning site visits.',
    status: 'New',
    quoteValue: '',
    followUpDate: '',
    warehouseVisitDate: '',
    selectedMaterial: 'Arctic',
    templateDate: '',
    installDate: '',
    kitchenInstallDate: '',
    source: 'Website',
    photos: [],
    createdAt: '2026-07-28T09:15:00.000Z',
    activityLog: [
      { id: 'a1', type: 'created', message: 'Lead created', createdAt: '2026-07-28T09:15:00.000Z' }
    ]
  },
  {
    id: '2',
    referenceNumber: '0066',
    name: 'Marcus Reid',
    email: 'marcus.reid@example.com',
    phone: '07700 900456',
    addressLine1: '2 Riverside Court',
    addressLine2: 'Flat 5',
    postcode: 'M1 4WP',
    size: 'Large',
    material: 'Granite',
    quartzStyle: '',
    kitchenColour: 'Anthracite Grey',
    kitchenStyle: 'Modern Handleless',
    floorColour: 'Dark Walnut',
    handleColour: '',
    wallColour: 'White',
    specialFeatures: 'Waterfall edge island',
    budget: '£5000-6000',
    timeline: 'ASAP',
    notes: 'Kitchen extension, worktop needed before fitters finish.',
    status: 'Quoted',
    quoteValue: '5400',
    followUpDate: '2026-08-06',
    warehouseVisitDate: '2026-07-29',
    selectedMaterial: 'Roma',
    templateDate: '2026-08-01',
    installDate: '',
    kitchenInstallDate: '',
    source: 'Referral',
    photos: [],
    createdAt: '2026-07-25T13:40:00.000Z',
    activityLog: [
      { id: 'a2', type: 'created', message: 'Lead created', createdAt: '2026-07-25T13:40:00.000Z' },
      { id: 'a3', type: 'status', message: 'Status changed to Quoted', createdAt: '2026-07-27T10:05:00.000Z' }
    ]
  },
  {
    id: '3',
    referenceNumber: '0067',
    name: 'Priya Nair',
    email: 'priya.nair@example.com',
    phone: '07700 900789',
    addressLine1: '81 Kings Road',
    addressLine2: '',
    postcode: 'B2 4QA',
    size: 'Small',
    material: 'Porcelain',
    quartzStyle: '',
    kitchenColour: 'Sage Green',
    kitchenStyle: 'Traditional',
    floorColour: 'Terracotta Tile',
    handleColour: 'Antique Brass',
    wallColour: 'Cream',
    specialFeatures: '',
    budget: '£2000-2500',
    timeline: '1-2 months',
    notes: '',
    status: 'Contacted',
    quoteValue: '',
    followUpDate: '2026-08-04',
    warehouseVisitDate: '',
    selectedMaterial: '',
    templateDate: '',
    installDate: '',
    kitchenInstallDate: '',
    source: 'Phone',
    photos: [],
    createdAt: '2026-07-30T16:20:00.000Z',
    activityLog: [
      { id: 'a4', type: 'created', message: 'Lead created', createdAt: '2026-07-30T16:20:00.000Z' },
      { id: 'a5', type: 'status', message: 'Status changed to Contacted', createdAt: '2026-07-31T11:00:00.000Z' }
    ]
  },
  {
    id: '4',
    referenceNumber: '0068',
    name: 'Daniel Osei',
    email: 'daniel.osei@example.com',
    phone: '07700 900321',
    addressLine1: '27 Northgate Street',
    addressLine2: '',
    postcode: 'LS1 2AB',
    size: 'Medium',
    material: 'Quartz',
    quartzStyle: 'Pure White',
    kitchenColour: 'Navy Blue',
    kitchenStyle: 'Shaker',
    floorColour: 'Grey Stone',
    handleColour: 'Matte Black',
    wallColour: 'Pale Blue',
    specialFeatures: 'Integrated wine rack',
    budget: '£3500-4200',
    timeline: '2 weeks',
    notes: 'Fitter needs parking permit for the street.',
    status: 'Booked',
    quoteValue: '3900',
    followUpDate: '',
    warehouseVisitDate: '2026-08-05',
    selectedMaterial: 'Onyx Marble',
    templateDate: '2026-08-08',
    installDate: '2026-08-12',
    kitchenInstallDate: '2026-08-14',
    source: 'Website',
    photos: [],
    createdAt: '2026-07-20T10:00:00.000Z',
    activityLog: [
      { id: 'a6', type: 'created', message: 'Lead created', createdAt: '2026-07-20T10:00:00.000Z' },
      { id: 'a7', type: 'status', message: 'Status changed to Quoted', createdAt: '2026-07-21T09:00:00.000Z' },
      { id: 'a8', type: 'status', message: 'Status changed to Booked', createdAt: '2026-07-23T15:30:00.000Z' }
    ]
  }
]

let nextId = 5
let nextActivityId = 9
let nextReferenceNumber = 69

export const getAll = () => leads

export const getById = (id) => leads.find((l) => l.id === id)

export const create = (data) => {
  const lead = {
    id: String(nextId++),
    referenceNumber: String(nextReferenceNumber++).padStart(4, '0'),
    name: '', email: '', phone: '', addressLine1: '', addressLine2: '', postcode: '', size: '', material: '',
    quartzStyle: '', kitchenColour: '', kitchenStyle: '', floorColour: '', handleColour: '', wallColour: '', specialFeatures: '', budget: '', timeline: '', notes: '', status: 'New',
    quoteValue: '', followUpDate: '', warehouseVisitDate: '', selectedMaterial: '', templateDate: '', installDate: '', kitchenInstallDate: '', source: 'Website', photos: [],
    ...data,
    createdAt: new Date().toISOString(),
    activityLog: [
      { id: `a${nextActivityId++}`, type: 'created', message: 'Lead created', createdAt: new Date().toISOString() }
    ]
  }
  leads.push(lead)
  return lead
}

export const update = (id, data) => {
  const lead = leads.find((l) => l.id === id)
  if (!lead) return null
  if (data.status && data.status !== lead.status) {
    lead.activityLog.push({
      id: `a${nextActivityId++}`,
      type: 'status',
      message: `Status changed to ${data.status}`,
      createdAt: new Date().toISOString()
    })
  }
  Object.assign(lead, data)
  return lead
}

export const remove = (id) => {
  const index = leads.findIndex((l) => l.id === id)
  if (index === -1) return false
  leads.splice(index, 1)
  return true
}

export const addActivity = (id, message) => {
  const lead = leads.find((l) => l.id === id)
  if (!lead) return null
  const entry = { id: `a${nextActivityId++}`, type: 'note', message, createdAt: new Date().toISOString() }
  lead.activityLog.push(entry)
  return entry
}

let nextPhotoId = 1

export const addPhoto = (id, { filename, url }) => {
  const lead = leads.find((l) => l.id === id)
  if (!lead) return null
  const photo = { id: `p${nextPhotoId++}`, filename, url, uploadedAt: new Date().toISOString() }
  lead.photos = [...(lead.photos || []), photo]
  return photo
}

export const removePhoto = (id, photoId) => {
  const lead = leads.find((l) => l.id === id)
  if (!lead) return null
  const photo = lead.photos?.find((p) => p.id === photoId)
  lead.photos = (lead.photos || []).filter((p) => p.id !== photoId)
  return photo || null
}
