import { useState } from 'react'
import { Link, useNavigate, useSearchParams } from 'react-router-dom'
import { resetPassword, errorMessage } from '../api/auth'

const MIN_PASSWORD_LENGTH = 12

export default function ResetPassword() {
  const [searchParams] = useSearchParams()
  const token = searchParams.get('token') || ''
  const navigate = useNavigate()
  const [password, setPassword] = useState('')
  const [confirm, setConfirm] = useState('')
  const [error, setError] = useState('')
  const [done, setDone] = useState(false)
  const [saving, setSaving] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    if (password.length < MIN_PASSWORD_LENGTH) {
      return setError(`Password must be at least ${MIN_PASSWORD_LENGTH} characters`)
    }
    if (password !== confirm) return setError('Passwords do not match')

    setSaving(true)
    try {
      await resetPassword(token, password)
      setDone(true)
      setTimeout(() => navigate('/login'), 2000)
    } catch (err) {
      setError(errorMessage(err, 'Reset failed. Request a new link.'))
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="login-container">
      <div className="login-box">
        <h1>Kitchen Worktop Experts</h1>
        <h2>Choose a new password</h2>
        {done ? (
          <p className="pricing-success">Password updated. Taking you to the login page...</p>
        ) : (
          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label>New password</label>
              <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} required />
            </div>
            <div className="form-group">
              <label>Confirm password</label>
              <input type="password" value={confirm} onChange={(e) => setConfirm(e.target.value)} required />
            </div>
            {error && <p className="error">{error}</p>}
            <button type="submit" disabled={saving || !token}>{saving ? 'Saving...' : 'Set password'}</button>
          </form>
        )}
        <p className="auth-links">
          <Link to="/login">Back to log in</Link>
        </p>
      </div>
    </div>
  )
}
