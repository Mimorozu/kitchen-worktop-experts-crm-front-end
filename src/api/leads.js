import axios from 'axios'
import { getToken } from './auth'

const API_URL = 'kitchen-worktop-experts-crm-api-production.up.railway.app'

const api = axios.create({
  baseURL: API_URL
})

// Attach token to every request automatically
api.interceptors.request.use((config) => {
  const token = getToken()
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

export const getAllLeads = async () => {
  const response = await api.get('/leads')
  return response.data
}

export const getLead = async (id) => {
  const response = await api.get(`/leads/${id}`)
  return response.data
}

export const createLead = async (leadData) => {
  const response = await api.post('/leads', leadData)
  return response.data
}

export const updateLead = async (id, leadData) => {
  const response = await api.put(`/leads/${id}`, leadData)
  return response.data
}

export const deleteLead = async (id) => {
  await api.delete(`/leads/${id}`)
}