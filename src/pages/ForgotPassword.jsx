import { useState } from 'react'
import { Link } from 'react-router-dom'
import { requestPasswordReset, errorMessage } from '../api/auth'

export default function ForgotPassword() {
  const [email, setEmail] = useState('')
  const [message, setMessage] = useState('')
  const [error, setError] = useState('')
  const [sending, setSending] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setMessage('')
    setSending(true)
    try {
      setMessage(await requestPasswordReset(email))
    } catch (err) {
      setError(errorMessage(err, 'Request failed. Try again later.'))
    } finally {
      setSending(false)
    }
  }

  return (
    <div className="login-container">
      <div className="login-box">
        <h1>Kitchen Worktop Experts</h1>
        <h2>Reset password</h2>
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Email</label>
            <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
          </div>
          {error && <p className="error">{error}</p>}
          {message && <p className="pricing-success">{message}</p>}
          <button type="submit" disabled={sending}>{sending ? 'Sending...' : 'Send reset link'}</button>
        </form>
        <p className="auth-links">
          <Link to="/login">Back to log in</Link>
        </p>
      </div>
    </div>
  )
}
