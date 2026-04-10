import { useNavigate, Link } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { useState, useEffect } from 'react'
import { notificationApi } from '../api/notificationApi'

export default function Navbar() {
  const { user, logout } = useAuth()
  const navigate = useNavigate()
  const [unread, setUnread] = useState(0)

  useEffect(() => {
    notificationApi.getUnreadCount()
      .then(r => setUnread(r.data.data || 0))
      .catch(() => {})
  }, [])

  const handleLogout = () => {
    logout()
    navigate('/')   // ← back to landing page
  }

  return (
    <header style={{
      height: 60, background: 'var(--white)', borderBottom: '1px solid var(--gray-200)',
      display: 'flex', alignItems: 'center', justifyContent: 'space-between',
      padding: '0 32px', flexShrink: 0
    }}>
      <div />
      <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
        {/* Notifications bell */}
        <Link to="/notifications" style={{ position: 'relative', lineHeight: 1 }}>
          <span style={{ fontSize: 18, color: 'var(--gray-600)' }}>◎</span>
          {unread > 0 && (
            <span style={{
              position: 'absolute', top: -4, right: -4, background: 'var(--green-bright)',
              color: 'var(--green-deepest)', fontSize: 9, fontWeight: 700,
              borderRadius: 10, padding: '1px 4px', lineHeight: 1.4,
              fontFamily: 'var(--font-mono)'
            }}>{unread > 9 ? '9+' : unread}</span>
          )}
        </Link>

        {/* User info */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <div style={{
            width: 32, height: 32, borderRadius: '50%',
            background: 'var(--green-deepest)', display: 'flex',
            alignItems: 'center', justifyContent: 'center',
            fontSize: 13, fontWeight: 600, color: 'var(--green-bright)'
          }}>
            {user?.name?.[0]?.toUpperCase() || '?'}
          </div>
          <div>
            <p style={{ fontSize: 13, fontWeight: 500, color: 'var(--green-deepest)', lineHeight: 1.2 }}>
              {user?.name}
            </p>
            <p style={{ fontSize: 11, color: 'var(--gray-400)', lineHeight: 1.2, fontFamily: 'var(--font-mono)' }}>
              {user?.role}
            </p>
          </div>
        </div>

        {/* Logout */}
        <button onClick={handleLogout} style={{
          padding: '6px 14px', borderRadius: 'var(--radius-md)',
          border: '1px solid var(--gray-200)', background: 'transparent',
          fontSize: 13, color: 'var(--gray-600)', transition: 'all var(--transition)',
          cursor: 'pointer'
        }}
          onMouseOver={e => e.target.style.borderColor = 'var(--green-mid)'}
          onMouseOut={e => e.target.style.borderColor = 'var(--gray-200)'}
        >
          Sign out
        </button>
      </div>
    </header>
  )
}
