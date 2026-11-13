import axios from 'axios'
import { getToken, logout } from './auth'

const API_URL = `${import.meta.env.VITE_CRM_API_URL}/api`

// Shared HTTP client for all API modules
export const api = axios.create({
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

// Backend rejects the token (401 no token, 403 invalid/expired). Clear the stale token and send the user to login.
api.interceptors.response.use(
  (response) => response,
  (error) => {
    const status = error.response?.status
    if (status === 401 || status === 403) {
      logout()
      window.location.assign('/login')
    }
    return Promise.reject(error)
  }
)
