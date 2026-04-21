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
    <div style={{ minHeight: '100vh', background: '#f4f6f3', display: 'flex', flexDirection: 'column', fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&display=swap');

        .ll-nav-btn {
          padding: 7px 18px; border-radius: 8px;
          border: 1px solid rgba(255,255,255,0.18); background: transparent;
          font-size: 13px; font-weight: 500; color: rgba(255,255,255,0.75);
          cursor: pointer; transition: all 0.18s; font-family: 'Plus Jakarta Sans', sans-serif;
          text-decoration: none; display: inline-flex; align-items: center;
        }
        .ll-nav-btn:hover { border-color: rgba(255,255,255,0.45); color: #fff; }

        .ll-nav-btn-primary {
          padding: 7px 20px; border-radius: 8px;
          border: none; background: #00ed64;
          font-size: 13px; font-weight: 700; color: #0a1f0a;
          cursor: pointer; transition: opacity 0.18s; font-family: 'Plus Jakarta Sans', sans-serif;
          text-decoration: none; display: inline-flex; align-items: center;
        }
        .ll-nav-btn-primary:hover { opacity: 0.88; }

        .ll-dashboard-btn {
          padding: 7px 16px; border-radius: 8px;
          border: 1px solid rgba(0,237,100,0.35); background: rgba(0,237,100,0.07);
          font-size: 13px; font-weight: 500; color: #00ed64;
          cursor: pointer; transition: all 0.18s; font-family: 'Plus Jakarta Sans', sans-serif;
        }
        .ll-dashboard-btn:hover { background: rgba(0,237,100,0.14); }

        .ll-logout-btn {
          padding: 7px 14px; border-radius: 8px;
          border: 1px solid rgba(255,255,255,0.12); background: transparent;
          font-size: 13px; color: rgba(255,255,255,0.45); cursor: pointer;
          transition: all 0.18s; font-family: 'Plus Jakarta Sans', sans-serif;
        }
        .ll-logout-btn:hover { color: rgba(255,255,255,0.8); border-color: rgba(255,255,255,0.3); }

        .ll-hero-badge {
          display: inline-flex; align-items: center; gap: 7px;
          background: rgba(0,237,100,0.1); border: 1px solid rgba(0,237,100,0.22);
          border-radius: 100px; padding: 4px 13px;
          font-size: 10.5px; font-weight: 600; letter-spacing: 0.1em;
          text-transform: uppercase; color: #00ed64; margin-bottom: 20px;
        }
        .ll-hero-dot {
          width: 5px; height: 5px; background: #00ed64; border-radius: 50%;
          animation: ll-pulse 2s ease-in-out infinite;
        }
        @keyframes ll-pulse {
          0%,100% { opacity:1; transform:scale(1); }
          50% { opacity:0.4; transform:scale(0.7); }
        }

        .ll-stat-card {
          background: rgba(255,255,255,0.05);
          border: 1px solid rgba(255,255,255,0.08);
          border-radius: 12px; padding: 16px 20px;
          text-align: center;
        }

        .page-enter { animation: fadeSlideUp 0.3s ease both; }
        @keyframes fadeSlideUp {
          from { opacity:0; transform:translateY(10px); }
          to   { opacity:1; transform:translateY(0); }
        }
      `}</style>

      {/* ── NAV ── */}
      <header style={{
        height: 64, background: '#0a1f0a',
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        padding: '0 48px', flexShrink: 0, position: 'sticky', top: 0, zIndex: 100,
        borderBottom: '1px solid rgba(0,237,100,0.09)',
        boxShadow: '0 1px 24px rgba(0,0,0,0.35)'
      }}>
        <Link to="/" style={{ textDecoration: 'none' }}>
          <span style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", fontSize: 21, fontWeight: 800, color: '#fff', letterSpacing: '-0.5px' }}>
            Akade<span style={{ color: '#00ed64' }}>mi</span>
          </span>
        </Link>

        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          {user ? (
            <>
              <button className="ll-dashboard-btn" onClick={() => navigate(getDashboardLink())}>
                Dashboard →
              </button>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, margin: '0 4px' }}>
                <div style={{
                  width: 28, height: 28, borderRadius: '50%',
                  background: '#00ed64', display: 'flex', alignItems: 'center',
                  justifyContent: 'center', fontSize: 11, fontWeight: 700, color: '#0a1f0a'
                }}>
                  {user.name?.[0]?.toUpperCase() || '?'}
                </div>
                <span style={{ fontSize: 13, color: 'rgba(255,255,255,0.65)', fontWeight: 500 }}>{user.name}</span>
              </div>
              <button className="ll-logout-btn" onClick={handleLogout}>Sign out</button>
            </>
          ) : (
            <>
              <button className="ll-nav-btn" onClick={() => navigate('/login')}>Login</button>
              <button className="ll-nav-btn-primary" onClick={() => navigate('/login', { state: { tab: 'register' } })}>
                Register
              </button>
            </>
          )}
        </div>
      </header>

      {/* ── HERO ── */}
      <div style={{
        background: '#0a1f0a',
        padding: '80px 48px 88px',
        borderBottom: '1px solid rgba(0,237,100,0.07)',
        position: 'relative', overflow: 'hidden',
        textAlign: 'center',
      }}>
        {/* Mesh glows */}
        <div style={{ position: 'absolute', inset: 0, pointerEvents: 'none' }}>
          <div style={{
            position: 'absolute', top: '-80px', left: '50%', transform: 'translateX(-50%)',
            width: 700, height: 400,
            background: 'radial-gradient(ellipse, rgba(0,237,100,0.13) 0%, transparent 70%)',
          }} />
          <div style={{
            position: 'absolute', bottom: '-40px', left: '10%',
            width: 300, height: 300,
            background: 'radial-gradient(circle, rgba(0,237,100,0.05) 0%, transparent 70%)',
          }} />
          <div style={{
            position: 'absolute', bottom: 0, right: '8%',
            width: 250, height: 250,
            background: 'radial-gradient(circle, rgba(0,180,80,0.06) 0%, transparent 70%)',
          }} />
        </div>

        <div style={{ maxWidth: 680, margin: '0 auto', position: 'relative' }}>

          {/* Title */}
          <h1 style={{
            fontFamily: "'Plus Jakarta Sans', sans-serif",
            fontSize: 56, fontWeight: 800, color: '#fff',
            letterSpacing: '-2.5px', lineHeight: 1.05,
            marginBottom: 20,
          }}>
            Akademi<br />
            <span style={{
              color: 'transparent',
              backgroundImage: 'linear-gradient(90deg, #00ed64 0%, #00c853 100%)',
              WebkitBackgroundClip: 'text',
              backgroundClip: 'text',
            }}>All in one place.</span>
          </h1>

          {/* Badge */}
          <div className="ll-hero-badge" style={{ margin: '0 auto 28px' }}>
            <span className="ll-hero-dot" />
            Smart Campus Operations Hub
          </div>

          {/* Subtitle */}
          <p style={{
            fontSize: 16, color: 'rgba(255,255,255,0.38)',
            lineHeight: 1.8, maxWidth: 440, margin: '0 auto',
            fontWeight: 400,
          }}>
            Browse lecture halls, labs &amp; meeting rooms.
            {!user && <> <Link to="/login" style={{ color: 'rgba(0,237,100,0.8)', fontWeight: 500, textDecoration: 'none' }}>Log in</Link> to book or report an incident.</>}
          </p>

          {/* CTAs */}
          {!user && (
            <div style={{ display: 'flex', gap: 12, marginTop: 36, justifyContent: 'center', flexWrap: 'wrap' }}>
              <button className="ll-nav-btn-primary"
                onClick={() => navigate('/login', { state: { tab: 'register' } })}
                style={{ padding: '12px 32px', fontSize: 14, borderRadius: '100px' }}>
                Get Started →
              </button>
              <button className="ll-nav-btn"
                onClick={() => navigate('/login')}
                style={{ padding: '12px 28px', fontSize: 14, borderRadius: '100px' }}>
                Sign In
              </button>
            </div>
          )}

          {/* Stats pills */}
          <div style={{
            display: 'flex', justifyContent: 'center', gap: 10,
            marginTop: 52, flexWrap: 'wrap',
          }}>
            {[
              { num: '50+', label: 'Campus Rooms' },
              { num: '3', label: 'Resource Types' },
              { num: '24/7', label: 'Availability' },
              { num: '1-click', label: 'Booking' },
            ].map(({ num, label }) => (
              <div key={label} style={{
                background: 'rgba(255,255,255,0.04)',
                border: '1px solid rgba(255,255,255,0.08)',
                borderRadius: '100px',
                padding: '7px 18px',
                display: 'flex', alignItems: 'center', gap: 8,
              }}>
                <span style={{ fontSize: 13, fontWeight: 700, color: '#00ed64' }}>{num}</span>
                <span style={{ fontSize: 12, color: 'rgba(255,255,255,0.3)', fontWeight: 400 }}>{label}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── PAGE CONTENT ── */}
      <main style={{ flex: 1, padding: '36px 48px', maxWidth: 1196, width: '100%', margin: '0 auto', alignSelf: 'stretch' }}>
        <div className="page-enter">
          <Outlet />
        </div>
      </main>

      {/* ── FOOTER ── */}
      <footer style={{
        background: '#fff', borderTop: '1px solid #e8ebe6',
        padding: '18px 48px',
        display: 'flex', alignItems: 'center', justifyContent: 'space-between'
      }}>
        <span style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", fontSize: 14, fontWeight: 700, color: '#0a1f0a', letterSpacing: '-0.3px' }}>
          Akade<span style={{ color: '#00ed64' }}>mi</span>
        </span>
        <p style={{ fontSize: 12, color: '#9aaa96' }}>
          © {new Date().getFullYear()} Akademi — Smart Campus Platform
        </p>
      </footer>
    </div>
  )
}
