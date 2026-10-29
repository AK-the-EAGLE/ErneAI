import { Link, Outlet, useLocation, useNavigate } from 'react-router-dom'
import { FaBookOpen, FaComments, FaDoorOpen, FaHeart, FaHome, FaMapMarkedAlt, FaUser } from 'react-icons/fa'
import useAuth from '../hooks/useAuth.js'
import useFavorites from '../hooks/useFavorites.js'
import useLearningProgress from '../hooks/useLearningProgress.js'
import PortalSidebar from '../components/PortalSidebar.jsx'
import BrandLogo from '../components/BrandLogo.jsx'
import ThemeToggle from '../components/ThemeToggle.jsx'
import { useState } from 'react'

export default function PortalLayout() {
  const { user, logout } = useAuth()
  const {
    favorites,
    favoritesError,
    favoritesMessage,
    favoritesLoading,
    pendingFavoriteKeys,
    refreshFavorites,
    toggleFavorite,
  } = useFavorites(user.id)
  const progress = useLearningProgress(user.preferredLearningLevel ?? 'beginner')
  const navigate = useNavigate()
  const location = useLocation()
  const [logoutError, setLogoutError] = useState('')
  const activeScenario = location.pathname.match(/^\/(?:explore|learn)\/([^/]+)$/)?.[1]
  const pageLabel = activeScenario && activeScenario !== 'lessons'
    ? 'LEARNING · SITUATION'
    : ({
        '/learn': 'YOUR LEARNING SPACE',
        '/explore': 'EXPLORE PHRASES',
        '/learn/lessons': 'GUIDED KANNADA LESSONS',
        '/practice': 'CONVERSATION PRACTICE',
        '/favorites': 'SAVED PHRASES',
        '/profile': 'YOUR PROFILE',
      }[location.pathname] ?? (location.pathname.startsWith('/learn/lessons/') ? 'GUIDED LESSON' : location.pathname.startsWith('/explore/') ? 'EXPLORE PHRASES' : 'YOUR LEARNING SPACE'))

  async function handleLogout() {
    setLogoutError('')
    try {
      await logout()
      navigate('/login', { replace: true })
    } catch (error) {
      setLogoutError(error.message)
    }
  }

  const links = [
    { to: '/learn', label: 'Dashboard', icon: FaHome, end: true },
    { to: '/learn/lessons', label: 'Learn Kannada', icon: FaBookOpen },
    { to: '/explore', label: 'Explore Phrases', icon: FaMapMarkedAlt },
    { to: '/practice', label: 'Conversation Practice', icon: FaComments },
    { to: '/favorites', label: 'Favorites', icon: FaHeart, count: favorites.length },
    { to: '/profile', label: 'My Profile', icon: FaUser },
  ]

  return (
    <div className="portal-shell">
      <PortalSidebar user={user} links={links} onLogout={handleLogout} />
      <main className="portal-main">
        <div className="portal-topbar">
          <div className="portal-topbar-brand"><BrandLogo /><span className="portal-label">{pageLabel}</span></div>
          <div className="portal-topbar-actions">
            <ThemeToggle />
            <Link className="portal-user" to="/profile" aria-label={`View profile for ${user.name || user.email}`}>
              <span className="portal-user-avatar">{user.name?.slice(0, 1).toUpperCase() ?? 'E'}</span>
              <span>{user.name || user.email}</span>
            </Link>
            <button className="portal-mobile-logout" type="button" aria-label="Log out" onClick={handleLogout}>
              <FaDoorOpen aria-hidden="true" />
            </button>
          </div>
        </div>
        {(logoutError || (location.pathname !== '/favorites' && (favoritesError || favoritesMessage)) || progress.storageError || progress.lessonProgressError) && (
          <p className={`storage-notice${favoritesError || logoutError || progress.storageError || progress.lessonProgressError ? ' is-error' : ''}`} role={favoritesError || logoutError || progress.storageError || progress.lessonProgressError ? 'alert' : 'status'} aria-live="polite">
            {logoutError || (location.pathname !== '/favorites' && (favoritesError || favoritesMessage)) || progress.storageError || progress.lessonProgressError}
          </p>
        )}
        <div className="portal-content">
          <Outlet context={{
            favorites,
            favoritesError,
            favoritesLoading,
            favoritesMessage,
            pendingFavoriteKeys,
            onRefreshFavorites: refreshFavorites,
            onToggleFavorite: toggleFavorite,
            progress,
          }} />
        </div>
        <footer className="portal-footer"><span>Erne AI · Practice mode</span><span><FaDoorOpen aria-hidden="true" /> Demo learning experience</span></footer>
      </main>
    </div>
  )
}
