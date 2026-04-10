import { NavLink } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

const commonItems = [
  { to: '/resources', label: 'Resources', icon: '⬡' },
  { to: '/bookings', label: 'Bookings', icon: '◫' },
  { to: '/incidents', label: 'Incidents', icon: '◈' },
  { to: '/notifications', label: 'Notifications', icon: '◎' },
]

const adminItems = [
  { to: '/admin', label: 'Dashboard', icon: '▤' },
  { to: '/admin/sla', label: 'SLA Monitor', icon: '◷' },
]

export default function Sidebar() {
  const { user, isAdmin } = useAuth()

  // Dashboard link depends on role
  const dashboardLink = isAdmin()
    ? { to: '/admin', label: 'Dashboard', icon: '▤' }
    : user?.role === 'STAFF'
      ? { to: '/dashboard/staff', label: 'Dashboard', icon: '▤' }
      : { to: '/dashboard/student', label: 'Dashboard', icon: '▤' }

  const navItems = [dashboardLink, ...commonItems]

  return (
    <aside style={{
      width: 220, background: 'var(--green-deepest)', display: 'flex',
      flexDirection: 'column', padding: '0', flexShrink: 0,
      borderRight: '1px solid rgba(0,237,100,0.08)'
    }}>
      {/* Logo */}
      <div style={{
        padding: '28px 24px 24px',
        borderBottom: '1px solid rgba(0,237,100,0.08)'
      }}>
        <span style={{ fontSize: 20, fontWeight: 600, color: 'var(--white)', letterSpacing: '-0.5px' }}>
          Akade<span style={{ color: 'var(--green-bright)' }}>mi</span>
        </span>
        <p style={{ fontSize: 10, color: 'rgba(255,255,255,0.25)', marginTop: 4, textTransform: 'uppercase', letterSpacing: '0.08em' }}>
          {user?.role}
        </p>
      </div>

      {/* Nav */}
      <nav style={{ flex: 1, padding: '16px 12px' }}>
        <div style={{ marginBottom: 8 }}>
          {navItems.map(({ to, label, icon }) => (
            <NavLink key={to} to={to} style={({ isActive }) => ({
              display: 'flex', alignItems: 'center', gap: 10,
              padding: '9px 12px', borderRadius: 'var(--radius-md)',
              fontSize: 14, fontWeight: isActive ? 500 : 400,
              color: isActive ? 'var(--green-bright)' : 'rgba(255,255,255,0.55)',
              background: isActive ? 'rgba(0,237,100,0.08)' : 'transparent',
              transition: 'all var(--transition)', marginBottom: 2,
              textDecoration: 'none'
            })}>
              <span style={{ fontSize: 16 }}>{icon}</span>
              {label}
            </NavLink>
          ))}
        </div>

        {/* Admin-only section */}
        {isAdmin() && (
          <div style={{ marginTop: 24 }}>
            <p style={{
              fontSize: 10, fontWeight: 600, letterSpacing: '0.1em',
              color: 'rgba(255,255,255,0.25)', textTransform: 'uppercase',
              padding: '0 12px', marginBottom: 8
            }}>Admin</p>
            {adminItems.map(({ to, label, icon }) => (
              <NavLink key={to} to={to} style={({ isActive }) => ({
                display: 'flex', alignItems: 'center', gap: 10,
                padding: '9px 12px', borderRadius: 'var(--radius-md)',
                fontSize: 14, fontWeight: isActive ? 500 : 400,
                color: isActive ? 'var(--green-bright)' : 'rgba(255,255,255,0.55)',
                background: isActive ? 'rgba(0,237,100,0.08)' : 'transparent',
                transition: 'all var(--transition)', marginBottom: 2,
                textDecoration: 'none'
              })}>
                <span style={{ fontSize: 16 }}>{icon}</span>
                {label}
              </NavLink>
            ))}
          </div>
        )}
      </nav>

      {/* Bottom label */}
      <div style={{ padding: '16px 24px', borderTop: '1px solid rgba(0,237,100,0.08)' }}>
        <p style={{ fontSize: 11, color: 'rgba(255,255,255,0.2)', letterSpacing: '0.05em' }}>
          Smart Campus Platform
        </p>
      </div>
    </aside>
  )
}
