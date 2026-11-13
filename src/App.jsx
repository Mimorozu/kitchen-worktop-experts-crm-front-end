import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { isLoggedIn } from './api/auth'
import Login from './pages/Login'
import Dashboard from './pages/Dashboard'
import NewLead from './pages/NewLead'
import LeadDetail from './pages/LeadDetail'
import Reports from './pages/Reports'
import Jobs from './pages/Jobs'
import PricingSettings from './pages/PricingSettings'
import VerifyEmail from './pages/VerifyEmail'
import ForgotPassword from './pages/ForgotPassword'
import ResetPassword from './pages/ResetPassword'

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
        <Route path="/verify-email" element={<VerifyEmail />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/reset-password" element={<ResetPassword />} />
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
        <Route path="/reports" element={
          <ProtectedRoute>
            <Reports />
          </ProtectedRoute>
        } />
        <Route path="/jobs" element={
          <ProtectedRoute>
            <Jobs />
          </ProtectedRoute>
        } />
        <Route path="/pricing" element={
          <ProtectedRoute>
            <PricingSettings />
          </ProtectedRoute>
        } />
      </Routes>
    </BrowserRouter>
  )
}