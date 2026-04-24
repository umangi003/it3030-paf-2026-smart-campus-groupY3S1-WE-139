import { useEffect, useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import { resourceApi } from '../../api/resourceApi'
import StatusBadge from '../../components/common/StatusBadge'

export default function LandingPage() {
  const { user } = useAuth()
  const navigate = useNavigate()
  const [resources, setResources] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    resourceApi.getAll()
      .then(r => setResources(r.data.data || []))
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [])

  // If already logged in, go to their dashboard
  useEffect(() => {
    if (user) {
      if (user.role === 'ADMIN') navigate('/admin', { replace: true })
      else if (user.role === 'STAFF') navigate('/dashboard/staff', { replace: true })
      else navigate('/dashboard/student', { replace: true })
    }
  }, [user])

  const cardStyle = {
    background: 'var(--white)',
    borderRadius: 'var(--radius-lg)',
    border: '1px solid var(--gray-200)',
    padding: '20px',
    transition: 'box-shadow var(--transition)',
    cursor: 'default',
  }

  return (
    <div style={{ minHeight: '100vh', background: 'var(--gray-50)' }}>

      {/* Top Nav */}
      <header style={{
        background: 'var(--green-deepest)',
        padding: '0 40px',
        height: 64,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        position: 'sticky', top: 0, zIndex: 100,
        boxShadow: '0 1px 0 rgba(0,237,100,0.1)'
      }}>
        <span style={{ fontSize: 22, fontWeight: 600, color: 'var(--white)', letterSpacing: '-0.5px' }}>
          Akade<span style={{ color: 'var(--green-bright)' }}>mi</span>
        </span>
        <div style={{ display: 'flex', gap: 12 }}>
          <Link to="/login" style={{
            padding: '8px 20px',
            borderRadius: 'var(--radius-md)',
            border: '1px solid rgba(255,255,255,0.2)',
            color: 'rgba(255,255,255,0.8)',
            fontSize: 14, fontWeight: 500,
            textDecoration: 'none',
            transition: 'all var(--transition)',
          }}
            onMouseOver={e => { e.currentTarget.style.borderColor = 'var(--green-bright)'; e.currentTarget.style.color = 'var(--green-bright)' }}
            onMouseOut={e => { e.currentTarget.style.borderColor = 'rgba(255,255,255,0.2)'; e.currentTarget.style.color = 'rgba(255,255,255,0.8)' }}
          >
            Login
          </Link>
          <Link to="/login?tab=register" style={{
            padding: '8px 20px',
            borderRadius: 'var(--radius-md)',
            background: 'var(--green-bright)',
            color: 'var(--green-deepest)',
            fontSize: 14, fontWeight: 600,
            textDecoration: 'none',
          }}>
            Register
          </Link>
        </div>
      </header>

      {/* Hero */}
      <section style={{
        background: 'var(--green-deepest)',
        padding: '72px 40px 80px',
        textAlign: 'center',
      }}>
        <p style={{
          fontSize: 12, fontWeight: 600, letterSpacing: '0.12em',
          color: 'var(--green-bright)', textTransform: 'uppercase', marginBottom: 20
        }}>
          Smart Campus Operations Hub
        </p>
        <h1 style={{
          fontSize: 48, fontWeight: 700, color: 'var(--white)',
          letterSpacing: '-1.5px', lineHeight: 1.1, marginBottom: 20, maxWidth: 640, margin: '0 auto 20px'
        }}>
          Book resources.<br />
          <span style={{ color: 'var(--green-bright)' }}>Report incidents.</span><br />
          Stay informed.
        </h1>
        <p style={{
          color: 'rgba(255,255,255,0.5)', fontSize: 16, maxWidth: 480,
          margin: '0 auto 40px', lineHeight: 1.7
        }}>
          A unified platform for managing campus facilities, bookings, and maintenance — all in one place.
        </p>
        <div style={{ display: 'flex', gap: 12, justifyContent: 'center', flexWrap: 'wrap' }}>
          <Link to="/login?tab=register" style={{
            padding: '13px 32px', borderRadius: 'var(--radius-md)',
            background: 'var(--green-bright)', color: 'var(--green-deepest)',
            fontSize: 15, fontWeight: 700, textDecoration: 'none',
          }}>
            Get Started
          </Link>
          <Link to="/login" style={{
            padding: '13px 32px', borderRadius: 'var(--radius-md)',
            border: '1px solid rgba(255,255,255,0.2)',
            color: 'rgba(255,255,255,0.8)', fontSize: 15, fontWeight: 500,
            textDecoration: 'none',
          }}>
            Sign In
          </Link>
        </div>
      </section>

      {/* Features strip */}
      <section style={{
        background: 'var(--white)',
        borderBottom: '1px solid var(--gray-200)',
        padding: '32px 40px',
        display: 'flex', justifyContent: 'center', gap: 48, flexWrap: 'wrap'
      }}>
        {[
          { icon: '⬡', label: 'Rooms & Labs', desc: 'Browse available facilities' },
          { icon: '◫', label: 'Easy Booking', desc: 'Reserve in seconds' },
          { icon: '◈', label: 'Incident Reports', desc: 'Report & track faults' },
          { icon: '◎', label: 'Notifications', desc: 'Stay updated in real time' },
        ].map(({ icon, label, desc }) => (
          <div key={label} style={{ textAlign: 'center' }}>
            <div style={{ fontSize: 24, marginBottom: 8 }}>{icon}</div>
            <p style={{ fontSize: 14, fontWeight: 600, color: 'var(--green-deepest)', marginBottom: 4 }}>{label}</p>
            <p style={{ fontSize: 12, color: 'var(--gray-400)' }}>{desc}</p>
          </div>
        ))}
      </section>

      {/* Resources section */}
      <section style={{ padding: '56px 40px', maxWidth: 1100, margin: '0 auto' }}>
        <div style={{ marginBottom: 32 }}>
          <h2 style={{ fontSize: 26, fontWeight: 700, color: 'var(--green-deepest)', letterSpacing: '-0.5px', marginBottom: 8 }}>
            Available Resources
          </h2>
          <p style={{ color: 'var(--gray-400)', fontSize: 14 }}>
            Browse our campus facilities. <Link to="/login" style={{ color: 'var(--green-mid)', fontWeight: 500 }}>Login to make a booking →</Link>
          </p>
        </div>

        {loading ? (
          <div style={{ textAlign: 'center', padding: '60px 0' }}>
            <div style={{
              width: 32, height: 32, border: '2px solid var(--green-bright)',
              borderTopColor: 'transparent', borderRadius: '50%',
              animation: 'spin 0.7s linear infinite', margin: '0 auto'
            }} />
            <style>{`@keyframes spin { to { transform: rotate(360deg) } }`}</style>
          </div>
        ) : resources.length === 0 ? (
          <div style={{
            textAlign: 'center', padding: '60px 0',
            color: 'var(--gray-400)', fontSize: 14
          }}>
            No resources available yet.
          </div>
        ) : (
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
            gap: 20
          }}>
            {resources.map(r => (
              <div key={r.id} style={cardStyle}
                onMouseOver={e => e.currentTarget.style.boxShadow = 'var(--shadow-md)'}
                onMouseOut={e => e.currentTarget.style.boxShadow = 'none'}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 12 }}>
                  <h3 style={{ fontSize: 15, fontWeight: 600, color: 'var(--green-deepest)' }}>{r.name}</h3>
                  <StatusBadge status={r.status} />
                </div>
                <p style={{ fontSize: 13, color: 'var(--gray-400)', marginBottom: 12, lineHeight: 1.5 }}>
                  {r.description || 'No description provided.'}
                </p>
                <div style={{ display: 'flex', gap: 16, fontSize: 12, color: 'var(--gray-400)' }}>
                  {r.location && <span>📍 {r.location}</span>}
                  {r.capacity && <span>👥 Capacity: {r.capacity}</span>}
                </div>
                <div style={{ marginTop: 16 }}>
                  <Link to="/login" style={{
                    display: 'block', textAlign: 'center',
                    padding: '8px', borderRadius: 'var(--radius-md)',
                    border: '1px solid var(--gray-200)',
                    fontSize: 13, fontWeight: 500,
                    color: 'var(--gray-600)', textDecoration: 'none',
                    transition: 'all var(--transition)',
                  }}
                    onMouseOver={e => { e.currentTarget.style.borderColor = 'var(--green-bright)'; e.currentTarget.style.color = 'var(--green-deepest)' }}
                    onMouseOut={e => { e.currentTarget.style.borderColor = 'var(--gray-200)'; e.currentTarget.style.color = 'var(--gray-600)' }}
                  >
                    Login to Book
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* Footer CTA */}
      <section style={{
        background: 'var(--green-deepest)', padding: '56px 40px',
        textAlign: 'center'
      }}>
        <h2 style={{ fontSize: 28, fontWeight: 700, color: 'var(--white)', marginBottom: 12, letterSpacing: '-0.5px' }}>
          Ready to get started?
        </h2>
        <p style={{ color: 'rgba(255,255,255,0.4)', marginBottom: 28, fontSize: 14 }}>
          Join your campus community on Akademi.
        </p>
        <Link to="/login?tab=register" style={{
          padding: '13px 36px', borderRadius: 'var(--radius-md)',
          background: 'var(--green-bright)', color: 'var(--green-deepest)',
          fontSize: 15, fontWeight: 700, textDecoration: 'none',
        }}>
          Create an Account
        </Link>
      </section>
    </div>
  )
}
