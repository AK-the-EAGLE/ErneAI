import { useState } from 'react'
import { FaArrowRight, FaEye, FaEyeSlash, FaLock, FaUser } from 'react-icons/fa'
import { Link, Navigate, useLocation, useNavigate } from 'react-router-dom'
import useAuth from '../hooks/useAuth.js'
import ThemeToggle from '../components/ThemeToggle.jsx'
import AuthPhrasePanel from '../components/AuthPhrasePanel.jsx'
import BrandLogo from '../components/BrandLogo.jsx'

function getRememberedEmail() {
  try {
    return window.localStorage.getItem('erne-ai-remembered-email') ?? ''
  } catch {
    return ''
  }
}

export default function Login() {
  const { user, loading: sessionLoading, login } = useAuth()
  const location = useLocation()
  const navigate = useNavigate()
  const [email, setEmail] = useState(getRememberedEmail)
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [remember, setRemember] = useState(true)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const requestedDestination = location.state?.from
  const destination = requestedDestination
    ? `${requestedDestination.pathname}${requestedDestination.search ?? ''}${requestedDestination.hash ?? ''}`
    : '/learn'
  if (sessionLoading) return <p className="session-loading" role="status">Checking your session…</p>
  if (user) return <Navigate to="/learn" replace />

  async function handleSubmit(event) {
    event.preventDefault()
    setError('')
    if (!email.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setError('Enter a valid email address.')
      return
    }
    if (password.length < 8) {
      setError('Enter your password (at least 8 characters).')
      return
    }
    setLoading(true)
    await new Promise((resolve) => window.setTimeout(resolve, 300))
    try {
      await login(email, password)
      try {
        if (remember) window.localStorage.setItem('erne-ai-remembered-email', email.trim().toLowerCase())
        else window.localStorage.removeItem('erne-ai-remembered-email')
      } catch {
        setError('You are signed in, but this browser could not remember your email.')
      }
      navigate(destination, { replace: true })
    } catch (loginError) {
      setError(loginError.message)
      setLoading(false)
    }
  }

  return (
    <div className="auth-page">
      <ThemeToggle />
      <Link to="/" className="brand auth-brand"><BrandLogo /></Link>
      <div className="auth-layout">
        <div className="auth-card">
          <div className="auth-symbol"><FaUser aria-hidden="true" /></div>
          <span className="eyebrow"><span className="eyebrow-line" /> Welcome back</span>
          <h1>Pick up where<br /><em>you left off.</em></h1>
          <p className="auth-lede">Log in to continue learning. Your session is managed by the Erne backend.</p>
          <form className="auth-form" onSubmit={handleSubmit} noValidate>
            <label htmlFor="login-email">Email address</label>
            <input id="login-email" type="email" autoComplete="email" value={email} onChange={(event) => setEmail(event.target.value)} placeholder="you@example.com" required />
            <label htmlFor="login-password">Password</label>
            <div className="password-field"><input id="login-password" type={showPassword ? 'text' : 'password'} autoComplete="current-password" value={password} onChange={(event) => setPassword(event.target.value)} placeholder="At least 8 characters" required minLength={8} /><button type="button" className="password-toggle" aria-label={showPassword ? 'Hide password' : 'Show password'} onClick={() => setShowPassword((value) => !value)}>{showPassword ? <FaEyeSlash aria-hidden="true" /> : <FaEye aria-hidden="true" />}</button></div>
            <label className="remember-option"><input type="checkbox" checked={remember} onChange={(event) => setRemember(event.target.checked)} /> Remember my email on this device</label>
            {error && <p className="auth-error" role="alert">{error}</p>}
            <button type="submit" className="button button-dark auth-submit" disabled={loading}>{loading ? 'Signing in…' : 'Log in'} {!loading && <FaArrowRight aria-hidden="true" />}</button>
          </form>
          <p className="auth-switch">New to Erne? <Link to="/signup">Create an account</Link></p>
          <div className="demo-security"><FaLock aria-hidden="true" /><p><strong>Hackathon project account.</strong> Passwords are hashed on the server and sessions use HTTP-only cookies. This prototype has not had a production security audit; use placeholder information.</p></div>
        </div>
        <AuthPhrasePanel
          heading="Your Kannada Journey Continues"
          description="Pick up where you left off and feel more confident using Kannada every day."
          supportingLine="Learn naturally. Connect meaningfully."
        />
      </div>
      <p className="auth-footer">Learn Kannada. Belong anywhere.</p>
    </div>
  )
}
