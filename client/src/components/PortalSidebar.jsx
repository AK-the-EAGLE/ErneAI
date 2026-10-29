import { Link, NavLink, useLocation } from 'react-router-dom'
import { FaSignOutAlt } from 'react-icons/fa'
import BrandLogo from './BrandLogo.jsx'

export default function PortalSidebar({ user, links, onLogout }) {
  const location = useLocation()

  return (
    <aside className="portal-sidebar">
      <NavLink className="brand portal-brand" to="/"><BrandLogo /></NavLink>
      <div className="sidebar-caption">YOUR LEARNING SPACE</div>
      <nav className="sidebar-nav" aria-label="Learning portal navigation">
        {links.map(({ to, label, icon: Icon, count, end }) => {
          const isLearningRoute = (
            (to === '/learn/lessons' && location.pathname.startsWith('/learn/') && location.pathname !== '/learn')
            || (to === '/explore' && location.pathname.startsWith('/explore'))
          )
          const content = (
            <>
              <Icon aria-hidden="true" />
              <span>{label}</span>
              {count > 0 && <span className="sidebar-count">{count}</span>}
            </>
          )

          if (isLearningRoute) {
            return <Link key={to} to={to} aria-current="page" className="sidebar-link active">{content}</Link>
          }

          return (
            <NavLink key={to} to={to} end={end} className={({ isActive }) => `sidebar-link${isActive ? ' active' : ''}`}>
              {content}
            </NavLink>
          )
        })}
      </nav>
      <div className="sidebar-bottom">
        <div className="sidebar-user"><span className="portal-user-avatar">{user.name?.slice(0, 1).toUpperCase() ?? 'E'}</span><div><strong>{user.name || 'Erne learner'}</strong><small>{user.email}</small></div></div>
        <button className="sidebar-logout" type="button" onClick={onLogout}><FaSignOutAlt aria-hidden="true" /> Log out</button>
        <p className="demo-auth-note">Hackathon prototype · Not production audited</p>
      </div>
    </aside>
  )
}
