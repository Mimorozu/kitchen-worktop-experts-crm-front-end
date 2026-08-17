import axios from 'axios'
import { getToken } from './auth'

const API_ORIGIN = 'http://localhost:5000'
const API_URL = `${API_ORIGIN}/api`

export { API_ORIGIN }

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

export const addLeadActivity = async (id, message) => {
  const response = await api.post(`/leads/${id}/activity`, { message })
  return response.data
}

export const uploadLeadPhoto = async (id, file) => {
  const formData = new FormData()
  formData.append('photo', file)
  const response = await api.post(`/leads/${id}/photos`, formData, {
    headers: { 'Content-Type': 'multipart/form-data' }
  })
  return response.data
}

export const deleteLeadPhoto = async (id, photoId) => {
  await api.delete(`/leads/${id}/photos/${photoId}`)
}