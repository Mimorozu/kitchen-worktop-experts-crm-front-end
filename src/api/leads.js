import axios from 'axios'
import { getToken } from './auth'

const API_URL = 'http://localhost:5000/api'

// Axios instance with the JWT token automatically attached to every request
const api = axios.create({
  baseURL: API_URL,
  headers: {
    get Authorization() {
      return `Bearer ${getToken()}`
    }
  }
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