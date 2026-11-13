import { useEffect, useState } from 'react'

import { Link, useSearchParams } from 'react-router-dom'
import { verifyEmail, errorMessage } from '../api/auth'

export default function VerifyEmail() {
  const [searchParams] = useSearchParams()
  const token = searchParams.get('token') || ''
  const [result, setResult] = useState(null) // { ok, message } once the API replies

  useEffect(() => {
    if (!token) return
    let active = true
    verifyEmail(token)
      .then((message) => { if (active) setResult({ ok: true, message }) })
      .catch((err) => {
        if (active) setResult({ ok: false, message: errorMessage(err, 'Verification failed. Try again later.') })
      })
    return () => { active = false }
  }, [token])

  const message = !token ? 'Verification link is invalid' : result?.message
  const failed = !token || result?.ok === false

  return (
    <div className="login-container">
      <div className="login-box">
        <h1>Kitchen Worktop Experts</h1>
        <h2>Email verification</h2>
        {message ? (
          <p className={failed ? 'error' : 'pricing-success'}>{message}</p>
        ) : (
          <p className="activity-empty">Verifying...</p>
        )}
        <p className="auth-links">
          <Link to="/login">Back to log in</Link>
        </p>
      </div>
    </div>
  )
}
