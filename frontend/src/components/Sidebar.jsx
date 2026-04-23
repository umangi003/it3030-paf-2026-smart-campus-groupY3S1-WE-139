import { NavLink } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

const getCommonItems = (isAdmin) => [
  { to: '/resources', label: 'Resources',      icon: '⬡' },
  { to: '/bookings',  label: isAdmin ? 'Bookings' : 'My Bookings', icon: '◫' },
  { to: '/incidents', label: 'Incidents',      icon: '◈' },
  { to: '/notifications', label: 'Notifications', icon: '◎' },
]

const staffItems = [
  { to: '/staff', label: 'Staff Dashboard', icon: '◧' },
]

const technicianItems = [
  { to: '/technician', label: 'My Dashboard',    icon: '🔧' },
  { to: '/notifications', label: 'Notifications', icon: '◎' },
]

const adminItems = [
  { to: '/admin',     label: 'Dashboard',  icon: '▤' },
  { to: '/admin/sla', label: 'SLA Monitor', icon: '◷' },
]

function NavItem({ to, label, icon }) {
  return (
    <NavLink to={to} style={({ isActive }) => ({
      display: 'flex', alignItems: 'center', gap: 10,
      padding: '9px 12px', borderRadius: 'var(--radius-md)',
      fontSize: 14, fontWeight: isActive ? 500 : 400,
      color: isActive ? 'var(--green-bright)' : 'rgba(255,255,255,0.55)',
      background: isActive ? 'rgba(0,237,100,0.08)' : 'transparent',
      transition: 'all var(--transition)', marginBottom: 2,
      textDecoration: 'none'
    })}>
      <span style={{ fontSize: 15 }}>{icon}</span>
      {label}
    </NavLink>
  )
}

function SectionLabel({ text }) {
  return (
    <p style={{
      fontSize: 10, fontWeight: 600, letterSpacing: '0.1em',
      color: 'rgba(255,255,255,0.25)', textTransform: 'uppercase',
      padding: '0 12px', marginBottom: 8, marginTop: 4
    }}>{text}</p>
  )
}

export default function Sidebar() {
  const { isAdmin, isStaff, isTechnician } = useAuth()

  return (
    <aside style={{
      width: 220, background: 'var(--green-deepest)', display: 'flex',
      flexDirection: 'column', padding: '0', flexShrink: 0,
      borderRight: '1px solid rgba(0,237,100,0.08)'
    }}>
      {/* Logo */}
      <div style={{ padding: '28px 24px 24px', borderBottom: '1px solid rgba(0,237,100,0.08)' }}>
        <span style={{ fontSize: 20, fontWeight: 600, color: 'var(--white)', letterSpacing: '-0.5px' }}>
          Akade<span style={{ color: 'var(--green-bright)' }}>mi</span>
        </span>
      </div>

      {/* Nav */}
      <nav style={{ flex: 1, padding: '16px 12px', overflowY: 'auto' }}>

        {/* Technician gets their own simplified nav */}
        {isTechnician() ? (
          <div>
            <SectionLabel text="Technician" />
            {technicianItems.map(item => <NavItem key={item.to} {...item} />)}
          </div>
        ) : (
          <div style={{ marginBottom: 8 }}>
            {getCommonItems(isAdmin()).map(item => <NavItem key={item.to} {...item} />)}
          </div>
        )}

        {isStaff() && (
          <div style={{ marginTop: 24 }}>
            <SectionLabel text="Staff" />
            {staffItems.map(item => <NavItem key={item.to} {...item} />)}
          </div>
        )}

        {isAdmin() && (
          <div style={{ marginTop: 24 }}>
            <SectionLabel text="Admin" />
            {adminItems.map(item => <NavItem key={item.to} {...item} />)}
          </div>
        )}
      </nav>

      {/* Bottom */}
      <div style={{ padding: '16px 24px', borderTop: '1px solid rgba(0,237,100,0.08)' }}>
        <p style={{ fontSize: 11, color: 'rgba(255,255,255,0.2)', letterSpacing: '0.05em' }}>
          Smart Campus Platform
        </p>
      </div>
    </aside>
  )
}