import axios from 'axios'

const API_URL = `${import.meta.env.VITE_CRM_API_URL}/api`

// sends email and password to your API, gets back a token and saves it
export const login = async (email, password) => {
  const response = await axios.post(`${API_URL}/auth/login`, { email, password })
  const token = response.data.token
  localStorage.setItem('token', token) // the browser's built in key/value store
  return token
}

//removes the token from localStorage. Tokens expire after 8 hours on the server.
export const logout = () => {
  localStorage.removeItem('token')
}

// Reads the error text from an API reply. The backend uses "error"; the mock API used "message".
export const errorMessage = (err, fallback) =>
  err.response?.data?.error || err.response?.data?.message || fallback

//retrieves the token so we can attach it to API requests
export const getToken = () => {
  return localStorage.getItem('token')
}

//returns boolean depending on whether a token exists
export const isLoggedIn = () => {
  return !!localStorage.getItem('token')
}

// the email verification link sends the user here with ?token=...
export const verifyEmail = async (token) => {
  const response = await axios.post(`${API_URL}/auth/verify`, { token })
  return response.data.message
}

// always succeeds for unknown emails, so the form can't be used to find accounts
export const requestPasswordReset = async (email) => {
  const response = await axios.post(`${API_URL}/auth/forgot`, { email })
  return response.data.message
}

export const resetPassword = async (token, password) => {
  const response = await axios.post(`${API_URL}/auth/reset`, { token, password })
  return response.data.message
}
