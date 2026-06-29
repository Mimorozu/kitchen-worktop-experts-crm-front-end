import axios from 'axios'

const API_URL = 'kitchen-worktop-experts-crm-api-production.up.railway.app'

// sends email and password to your API, gets back a token and saves it
export const login = async (email, password) => {
  const response = await axios.post(`${API_URL}/auth/login`, { email, password })
  const token = response.data.token
  localStorage.setItem('token', token) // the browser's built in key/value store
  return token
}

//removes the token from localStorage
export const logout = () => {
  localStorage.removeItem('token')
}

//retrieves the token so we can attach it to API requests
export const getToken = () => {
  return localStorage.getItem('token')
}

//returns boolean depending on whether a token exists
export const isLoggedIn = () => {
  return !!localStorage.getItem('token')
  
}