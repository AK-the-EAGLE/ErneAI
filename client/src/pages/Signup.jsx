import { useState } from 'react'
import { FaArrowRight, FaEye, FaEyeSlash, FaLock, FaUserPlus } from 'react-icons/fa'
import { Link, Navigate, useNavigate } from 'react-router-dom'
import useAuth from '../hooks/useAuth.js'
import ThemeToggle from '../components/ThemeToggle.jsx'
import AuthPhrasePanel from '../components/AuthPhrasePanel.jsx'
import BrandLogo from '../components/BrandLogo.jsx'

export default function Signup() {
  const { user, loading: sessionLoading, signup } = useAuth()
  const navigate = useNavigate()
  const [fullName, setFullName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmation, setShowConfirmation] = useState(false)
  const [acceptedTerms, setAcceptedTerms] = useState(false)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  if (sessionLoading) return <p className="session-loading" role="status">Checking your session…</p>
  if (user) return <Navigate to="/learn" replace />

  async function handleSubmit(event) {
    event.preventDefault()
    setError('')
    if (fullName.trim().length < 2) return setError('Enter your name to create an account.')
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return setError('Enter a valid email address.')
    if (password.length < 8 || new TextEncoder().encode(password).length > 72) return setError('Choose a password between 8 characters and 72 bytes.')
    if (password !== confirmPassword) return setError('Those passwords do not match.')
    if (!acceptedTerms) return setError('Please acknowledge the prototype account notice to continue.')

    setLoading(true)
    await new Promise((resolve) => window.setTimeout(resolve, 300))
    try {
      await signup({ fullName, email, password })
      navigate('/learn', { replace: true })
    } catch (signupError) {
      setError(signupError.message)
      setLoading(false)
    }
  }

  return (
    <div className="auth-page">
      <ThemeToggle />
      <Link to="/" className="brand auth-brand"><BrandLogo /></Link>
      <div className="auth-layout">
        <div className="auth-card signup-card">
          <div className="auth-symbol"><FaUserPlus aria-hidden="true" /></div>
          <span className="eyebrow"><span className="eyebrow-line" /> Your next hello starts here</span>
          <h1>Create a little<br /><em>more connection.</em></h1>
          <p className="auth-lede">Create an account to save your phrases and learning progress.</p>
          <form className="auth-form" onSubmit={handleSubmit} noValidate>
            <label htmlFor="signup-name">Full name</label>
            <input id="signup-name" autoComplete="name" value={fullName} onChange={(event) => setFullName(event.target.value)} placeholder="Your name" required />
            <label htmlFor="signup-email">Email address</label>
            <input id="signup-email" type="email" autoComplete="email" value={email} onChange={(event) => setEmail(event.target.value)} placeholder="you@example.com" required />
            <label htmlFor="signup-password">Password</label>
            <div className="password-field"><input id="signup-password" type={showPassword ? 'text' : 'password'} autoComplete="new-password" value={password} onChange={(event) => setPassword(event.target.value)} placeholder="At least 8 characters" required minLength={8} /><button type="button" className="password-toggle" aria-label={showPassword ? 'Hide password' : 'Show password'} onClick={() => setShowPassword((value) => !value)}>{showPassword ? <FaEyeSlash aria-hidden="true" /> : <FaEye aria-hidden="true" />}</button></div>
            <label htmlFor="signup-confirm">Confirm password</label>
            <div className="password-field"><input id="signup-confirm" type={showConfirmation ? 'text' : 'password'} autoComplete="new-password" value={confirmPassword} onChange={(event) => setConfirmPassword(event.target.value)} placeholder="Re-enter password" required /><button type="button" className="password-toggle" aria-label={showConfirmation ? 'Hide confirmation password' : 'Show confirmation password'} onClick={() => setShowConfirmation((value) => !value)}>{showConfirmation ? <FaEyeSlash aria-hidden="true" /> : <FaEye aria-hidden="true" />}</button></div>
            <label className="remember-option"><input type="checkbox" checked={acceptedTerms} onChange={(event) => setAcceptedTerms(event.target.checked)} /> I understand Erne AI is a hackathon prototype; I will use placeholder information.</label>
            {error && <p className="auth-error" role="alert">{error}</p>}
            <button type="submit" className="button button-dark auth-submit" disabled={loading}>{loading ? 'Creating profile…' : 'Create account'} {!loading && <FaArrowRight aria-hidden="true" />}</button>
          </form>
          <p className="auth-switch">Already have an account? <Link to="/login">Log in</Link></p>
          <div className="demo-security"><FaLock aria-hidden="true" /><p><strong>Prototype account.</strong> Passwords are hashed on the server and sessions use HTTP-only cookies. This project has not had a production security audit; use placeholder information.</p></div>
        </div>
        <AuthPhrasePanel
          heading="Start Learning Kannada"
          description="Learn useful Kannada phrases for real-life situations, one conversation at a time."
          supportingLine="Your journey to confident conversations starts here."
        />
      </div>
      <p className="auth-footer">Learn Kannada. Belong anywhere.</p>
    </div>
  )
}
