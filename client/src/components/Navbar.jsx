import { useRef, useState } from 'react'
import { Link, NavLink } from 'react-router-dom'
import { FaArrowRight, FaBars, FaTimes } from 'react-icons/fa'
import useAuth from '../hooks/useAuth.js'
import BrandLogo from './BrandLogo.jsx'
import ThemeToggle from './ThemeToggle.jsx'

const links = [
  { to: '/', label: 'Home', end: true },
  { to: '/about', label: 'About' },
  { to: '/how-it-works', label: 'How It Works' },
  { to: '/features', label: 'Features' },
]

export default function Navbar() {
  const { user } = useAuth()
  const [menuOpen, setMenuOpen] = useState(false)
  const menuToggleRef = useRef(null)

  function closeMenu() {
    setMenuOpen(false)
  }

  return (
    <header className="site-header">
      <div className="nav-wrap">
        <Link className="brand" to="/" aria-label="Erne AI home" onClick={closeMenu}>
          <BrandLogo />
        </Link>
        <button ref={menuToggleRef} className="menu-toggle icon-button" type="button" aria-label={menuOpen ? 'Close navigation' : 'Open navigation'} aria-controls="primary-navigation" aria-expanded={menuOpen} onClick={() => setMenuOpen((open) => !open)}>
          {menuOpen ? <FaTimes aria-hidden="true" /> : <FaBars aria-hidden="true" />}
        </button>
        <nav id="primary-navigation" className={`main-nav ${menuOpen ? 'is-open' : ''}`} aria-label="Main navigation" onKeyDown={(event) => {
          if (event.key === 'Escape' && menuOpen) {
            closeMenu()
            menuToggleRef.current?.focus()
          }
        }}>
          {links.map((link) => (
            <NavLink key={link.to} to={link.to} end={link.end} onClick={closeMenu} className={({ isActive }) => `nav-link${isActive ? ' active' : ''}`}>
              {link.label}
            </NavLink>
          ))}
          {user ? <Link className="nav-login" to="/learn" onClick={closeMenu}>My learning</Link> : <Link className="nav-login" to="/login" onClick={closeMenu}>Log in</Link>}
          <ThemeToggle onToggle={closeMenu} />
          <Link className="button button-dark nav-cta" to={user ? '/learn/lessons' : '/signup'} onClick={closeMenu}>{user ? 'Open portal' : 'Get Started'} <FaArrowRight aria-hidden="true" /></Link>
        </nav>
      </div>
    </header>
  )
}
