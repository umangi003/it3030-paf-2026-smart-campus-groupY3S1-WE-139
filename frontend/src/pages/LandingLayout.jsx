import { Outlet, useNavigate, Link } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

export default function LandingLayout() {
  const { user, logout, isAdmin, isStaff } = useAuth()
  const navigate = useNavigate()

  const handleLogout = () => {
    logout()
    navigate('/')
  }

  const getDashboardLink = () => {
    if (isAdmin()) return '/admin'
    if (isStaff()) return '/staff'
    return '/bookings'
  }

  return (
    <div style={{ minHeight: '100vh', background: 'var(--gray-50)', display: 'flex', flexDirection: 'column' }}>
      {/* Public top navbar */}
      <header style={{
        height: 64, background: 'var(--green-deepest)',
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        padding: '0 40px', flexShrink: 0, position: 'sticky', top: 0, zIndex: 100,
        borderBottom: '1px solid rgba(0,237,100,0.12)'
      }}>
        {/* Logo */}
        <Link to="/" style={{ textDecoration: 'none' }}>
          <span style={{ fontSize: 22, fontWeight: 600, color: 'var(--white)', letterSpacing: '-0.5px' }}>
            Akade<span style={{ color: 'var(--green-bright)' }}>mi</span>
          </span>
        </Link>

        {/* Right side: auth state */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          {user ? (
            // Logged in — show user info + dashboard link + logout
            <>
              <button
                onClick={() => navigate(getDashboardLink())}
                style={{
                  padding: '7px 16px', borderRadius: 'var(--radius-md)',
                  border: '1px solid rgba(0,237,100,0.35)', background: 'transparent',
                  fontSize: 13, fontWeight: 500, color: 'var(--green-bright)',
                  cursor: 'pointer', transition: 'all var(--transition)'
                }}
                onMouseOver={e => { e.target.style.background = 'rgba(0,237,100,0.1)' }}
                onMouseOut={e => { e.target.style.background = 'transparent' }}
              >
                My Dashboard →
              </button>

              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <div style={{
                  width: 30, height: 30, borderRadius: '50%',
                  background: 'var(--green-bright)', display: 'flex',
                  alignItems: 'center', justifyContent: 'center',
                  fontSize: 12, fontWeight: 700, color: 'var(--green-deepest)'
                }}>
                  {user.name?.[0]?.toUpperCase() || '?'}
                </div>
                <span style={{ fontSize: 13, color: 'rgba(255,255,255,0.75)', fontWeight: 500 }}>
                  {user.name}
                </span>
              </div>

              <button onClick={handleLogout} style={{
                padding: '7px 14px', borderRadius: 'var(--radius-md)',
                border: '1px solid rgba(255,255,255,0.15)', background: 'transparent',
                fontSize: 13, color: 'rgba(255,255,255,0.55)', cursor: 'pointer',
                transition: 'all var(--transition)'
              }}
                onMouseOver={e => { e.target.style.color = 'var(--white)'; e.target.style.borderColor = 'rgba(255,255,255,0.35)' }}
                onMouseOut={e => { e.target.style.color = 'rgba(255,255,255,0.55)'; e.target.style.borderColor = 'rgba(255,255,255,0.15)' }}
              >
                Sign out
              </button>
            </>
          ) : (
            // Not logged in — show Login + Register
            <>
              <button
                onClick={() => navigate('/login')}
                style={{
                  padding: '7px 18px', borderRadius: 'var(--radius-md)',
                  border: '1px solid rgba(255,255,255,0.2)', background: 'transparent',
                  fontSize: 13, fontWeight: 500, color: 'rgba(255,255,255,0.8)',
                  cursor: 'pointer', transition: 'all var(--transition)'
                }}
                onMouseOver={e => { e.target.style.borderColor = 'rgba(255,255,255,0.5)'; e.target.style.color = 'var(--white)' }}
                onMouseOut={e => { e.target.style.borderColor = 'rgba(255,255,255,0.2)'; e.target.style.color = 'rgba(255,255,255,0.8)' }}
              >
                Login
              </button>
              <button
                onClick={() => { navigate('/login'); }}
                style={{
                  padding: '7px 18px', borderRadius: 'var(--radius-md)',
                  border: 'none', background: 'var(--green-bright)',
                  fontSize: 13, fontWeight: 600, color: 'var(--green-deepest)',
                  cursor: 'pointer', transition: 'opacity var(--transition)'
                }}
                onMouseOver={e => e.target.style.opacity = '0.85'}
                onMouseOut={e => e.target.style.opacity = '1'}
                // Navigate to login with register tab pre-selected
                onClick={() => navigate('/login', { state: { tab: 'register' } })}
              >
                Register
              </button>
            </>
          )}
        </div>
      </header>

      {/* Hero banner (only on root path) */}
      <div style={{
        background: 'var(--green-deepest)',
        padding: '40px 40px 48px',
        borderBottom: '1px solid rgba(0,237,100,0.08)'
      }}>
        <div style={{ maxWidth: 800 }}>
          <p style={{
            fontSize: 11, fontWeight: 600, letterSpacing: '0.12em',
            color: 'var(--green-bright)', textTransform: 'uppercase', marginBottom: 12
          }}>Smart Campus Operations Hub</p>
          <h2 style={{
            fontSize: 34, fontWeight: 600, color: 'var(--white)',
            letterSpacing: '-0.5px', lineHeight: 1.2, marginBottom: 12
          }}>
            Browse Campus Resources
          </h2>
          <p style={{ fontSize: 15, color: 'rgba(255,255,255,0.5)', lineHeight: 1.6, maxWidth: 520 }}>
            Explore available lecture halls, labs, meeting rooms and equipment.
            {!user && ' Log in to make a booking or report an incident.'}
          </p>
        </div>
      </div>

      {/* Page content */}
      <main style={{ flex: 1, padding: '32px 40px', maxWidth: 1200, width: '100%', margin: '0 auto', alignSelf: 'stretch' }}>
        <div className="page-enter">
          <Outlet />
        </div>
      </main>

      {/* Footer */}
      <footer style={{
        background: 'var(--white)', borderTop: '1px solid var(--gray-200)',
        padding: '16px 40px', textAlign: 'center'
      }}>
        <p style={{ fontSize: 12, color: 'var(--gray-400)' }}>
          © {new Date().getFullYear()} Akademi — Smart Campus Platform
        </p>
      </footer>
    </div>
  )
}
