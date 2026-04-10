import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import { bookingApi } from '../../api/bookingApi'
import { incidentApi } from '../../api/incidentApi'
import { notificationApi } from '../../api/notificationApi'
import StatusBadge from '../../components/common/StatusBadge'
import Button from '../../components/common/Button'
import { formatDateTime } from '../../utils/helpers'

function StatCard({ label, value, accent, onClick }) {
  return (
    <div onClick={onClick} style={{
      background: 'var(--white)', borderRadius: 'var(--radius-lg)',
      border: '1px solid var(--gray-200)', padding: '20px 24px',
      cursor: onClick ? 'pointer' : 'default',
      transition: 'box-shadow var(--transition)',
    }}
      onMouseOver={e => onClick && (e.currentTarget.style.boxShadow = 'var(--shadow-md)')}
      onMouseOut={e => onClick && (e.currentTarget.style.boxShadow = 'none')}
    >
      <p style={{ fontSize: 12, color: 'var(--gray-400)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 8 }}>{label}</p>
      <p style={{ fontSize: 36, fontWeight: 700, letterSpacing: '-1px', color: accent || 'var(--green-deepest)', lineHeight: 1 }}>{value ?? '—'}</p>
    </div>
  )
}

export default function StudentDashboard() {
  const { user } = useAuth()
  const navigate = useNavigate()
  const [bookings, setBookings] = useState([])
  const [incidents, setIncidents] = useState([])
  const [unread, setUnread] = useState(0)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    Promise.all([
      bookingApi.getMy(),
      incidentApi.getMy(),
      notificationApi.getUnreadCount(),
    ]).then(([b, i, n]) => {
      setBookings(b.data.data || [])
      setIncidents(i.data.data || [])
      setUnread(n.data.data || 0)
    }).catch(() => {}).finally(() => setLoading(false))
  }, [])

  const upcomingBookings = bookings
    .filter(b => b.status === 'CONFIRMED' || b.status === 'PENDING')
    .slice(0, 4)

  const activeIncidents = incidents
    .filter(i => i.status === 'OPEN' || i.status === 'IN_PROGRESS')
    .slice(0, 4)

  if (loading) return <p style={{ color: 'var(--gray-400)', fontSize: 14 }}>Loading dashboard...</p>

  return (
    <div>
      {/* Header */}
      <div style={{ marginBottom: 32 }}>
        <h1 style={{ fontSize: 22, fontWeight: 600, letterSpacing: '-0.5px' }}>
          Welcome back, {user?.name?.split(' ')[0]} 👋
        </h1>
        <p style={{ fontSize: 14, color: 'var(--gray-600)', marginTop: 4 }}>
          Here's what's happening with your bookings and incidents.
        </p>
      </div>

      {/* Stats */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(160px, 1fr))', gap: 12, marginBottom: 36 }}>
        <StatCard label="My Bookings" value={bookings.length} onClick={() => navigate('/bookings')} />
        <StatCard
          label="Active Bookings"
          value={bookings.filter(b => b.status === 'CONFIRMED' || b.status === 'PENDING').length}
          accent="var(--green-mid)"
          onClick={() => navigate('/bookings')}
        />
        <StatCard
          label="My Incidents"
          value={incidents.length}
          onClick={() => navigate('/incidents')}
        />
        <StatCard
          label="Open Incidents"
          value={incidents.filter(i => i.status === 'OPEN' || i.status === 'IN_PROGRESS').length}
          accent={incidents.filter(i => i.status === 'OPEN').length > 0 ? '#dc2626' : 'var(--green-mid)'}
          onClick={() => navigate('/incidents')}
        />
        <StatCard
          label="Unread Notifications"
          value={unread}
          accent={unread > 0 ? '#f59e0b' : 'var(--gray-400)'}
          onClick={() => navigate('/notifications')}
        />
      </div>

      {/* Quick Actions */}
      <div style={{
        background: 'var(--white)', borderRadius: 'var(--radius-lg)',
        border: '1px solid var(--gray-200)', padding: 24, marginBottom: 28
      }}>
        <p style={{ fontSize: 13, fontWeight: 600, marginBottom: 16 }}>Quick Actions</p>
        <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
          <Button onClick={() => navigate('/bookings/new')}>+ New Booking</Button>
          <Button variant="outline" onClick={() => navigate('/incidents')}>Report Incident</Button>
          <Button variant="outline" onClick={() => navigate('/resources')}>Browse Resources</Button>
          <Button variant="outline" onClick={() => navigate('/notifications')}>
            Notifications {unread > 0 && `(${unread})`}
          </Button>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 24 }}>
        {/* Upcoming Bookings */}
        <div style={{
          background: 'var(--white)', borderRadius: 'var(--radius-lg)',
          border: '1px solid var(--gray-200)', padding: 24
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
            <p style={{ fontSize: 13, fontWeight: 600 }}>Upcoming Bookings</p>
            <button onClick={() => navigate('/bookings')} style={{
              fontSize: 12, color: 'var(--green-mid)', background: 'none',
              border: 'none', cursor: 'pointer', fontWeight: 500
            }}>View all →</button>
          </div>
          {upcomingBookings.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '24px 0' }}>
              <p style={{ fontSize: 13, color: 'var(--gray-400)', marginBottom: 12 }}>No upcoming bookings</p>
              <Button size="sm" onClick={() => navigate('/bookings/new')}>Book a resource</Button>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {upcomingBookings.map(b => (
                <div key={b.id} onClick={() => navigate('/bookings')} style={{
                  padding: '12px', borderRadius: 'var(--radius-md)',
                  border: '1px solid var(--gray-200)', cursor: 'pointer',
                  transition: 'border-color var(--transition)',
                }}
                  onMouseOver={e => e.currentTarget.style.borderColor = 'var(--green-bright)'}
                  onMouseOut={e => e.currentTarget.style.borderColor = 'var(--gray-200)'}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 }}>
                    <p style={{ fontSize: 13, fontWeight: 500 }}>{b.resourceName || `Resource #${b.resourceId}`}</p>
                    <StatusBadge status={b.status} />
                  </div>
                  <p style={{ fontSize: 11, color: 'var(--gray-400)', fontFamily: 'var(--font-mono)' }}>
                    {formatDateTime(b.startTime)}
                  </p>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Active Incidents */}
        <div style={{
          background: 'var(--white)', borderRadius: 'var(--radius-lg)',
          border: '1px solid var(--gray-200)', padding: 24
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
            <p style={{ fontSize: 13, fontWeight: 600 }}>My Active Incidents</p>
            <button onClick={() => navigate('/incidents')} style={{
              fontSize: 12, color: 'var(--green-mid)', background: 'none',
              border: 'none', cursor: 'pointer', fontWeight: 500
            }}>View all →</button>
          </div>
          {activeIncidents.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '24px 0' }}>
              <p style={{ fontSize: 13, color: 'var(--gray-400)' }}>No active incidents 🎉</p>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {activeIncidents.map(i => (
                <div key={i.id} onClick={() => navigate(`/incidents/${i.id}`)} style={{
                  padding: '12px', borderRadius: 'var(--radius-md)',
                  border: '1px solid var(--gray-200)', cursor: 'pointer',
                  transition: 'border-color var(--transition)',
                }}
                  onMouseOver={e => e.currentTarget.style.borderColor = 'var(--green-bright)'}
                  onMouseOut={e => e.currentTarget.style.borderColor = 'var(--gray-200)'}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 }}>
                    <p style={{ fontSize: 13, fontWeight: 500 }}>{i.title}</p>
                    <StatusBadge status={i.status} />
                  </div>
                  <p style={{ fontSize: 11, color: 'var(--gray-400)' }}>📍 {i.location}</p>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
