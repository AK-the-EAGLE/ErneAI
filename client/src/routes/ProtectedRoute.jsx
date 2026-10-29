import { Navigate, Outlet, useLocation } from 'react-router-dom'
import useAuth from '../hooks/useAuth.js'

export default function ProtectedRoute() {
  const { user, loading, authError, restoreSession } = useAuth()
  const location = useLocation()
  if (loading) return <p className="session-loading" role="status">Checking your session…</p>
  if (authError) {
    return (
      <div className="session-error" role="alert">
        <p>{authError}</p>
        <button className="button button-dark" type="button" onClick={restoreSession}>Try again</button>
      </div>
    )
  }
  return user ? <Outlet /> : <Navigate to="/login" replace state={{ from: location }} />
}
