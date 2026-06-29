import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { isLoggedIn } from './api/auth'
import Login from './pages/Login'
import Dashboard from './pages/Dashboard'
import NewLead from './pages/NewLead'
import LeadDetail from './pages/LeadDetail'

// Protected route — redirects to /login if not logged in
function ProtectedRoute({ children }) {
  if (!isLoggedIn()) {
    return <Navigate to="/login" />
  }
  return children
}

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/" element={
          <ProtectedRoute>
            <Dashboard />
          </ProtectedRoute>
        } />
        <Route path="/leads/new" element={
          <ProtectedRoute>
            <NewLead />
          </ProtectedRoute>
        } />
        <Route path="/leads/:id" element={
          <ProtectedRoute>
            <LeadDetail />
          </ProtectedRoute>
        } />
      </Routes>
    </BrowserRouter>
  )
}