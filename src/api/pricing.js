import { api } from './client'

export const getPricing = async () => {
  const response = await api.get('/pricing')
  return response.data
}

export const savePricing = async (pricing) => {
  const response = await api.put('/pricing', pricing)
  return response.data
}
