import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import { bookingApi } from '../../api/bookingApi'
import { incidentApi } from '../../api/incidentApi'
import { notificationApi } from '../../api/notificationApi'
import StatusBadge from '../../components/common/StatusBadge'
import Button from '../../components/common/Button'
import { formatDateTime } from '../../utils/helpers'

function StatCard({ label, value, accent, sub, onClick }) {
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
      {sub && <p style={{ fontSize: 11, color: 'var(--gray-400)', marginTop: 6, fontFamily: 'var(--font-mono)' }}>{sub}</p>}
    </div>
  )
}

export default function StaffDashboard() {
  const { user } = useAuth()
  const navigate = useNavigate()
  const [myBookings, setMyBookings] = useState([])
  const [allIncidents, setAllIncidents] = useState([])
  const [unread, setUnread] = useState(0)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    Promise.all([
      bookingApi.getMy(),
      incidentApi.getAll(),   // staff can see all incidents
      notificationApi.getUnreadCount(),
    ]).then(([b, i, n]) => {
      setMyBookings(b.data.data || [])
      setAllIncidents(i.data.data || [])
      setUnread(n.data.data || 0)
    }).catch(() => {}).finally(() => setLoading(false))
  }, [])

  const openIncidents = allIncidents.filter(i => i.status === 'OPEN')
  const inProgressIncidents = allIncidents.filter(i => i.status === 'IN_PROGRESS')
  const assignedToMe = allIncidents.filter(i => i.assignedToId === user?.id || i.assignedTo?.id === user?.id)

  if (loading) return <p style={{ color: 'var(--gray-400)', fontSize: 14 }}>Loading dashboard...</p>

  return (
    <div>
      {/* Header */}
      <div style={{ marginBottom: 32 }}>
        <h1 style={{ fontSize: 22, fontWeight: 600, letterSpacing: '-0.5px' }}>
          Staff Dashboard
        </h1>
        <p style={{ fontSize: 14, color: 'var(--gray-600)', marginTop: 4 }}>
          Welcome back, {user?.name?.split(' ')[0]}. Here's the current campus status.
        </p>
      </div>

      {/* Stats */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(160px, 1fr))', gap: 12, marginBottom: 36 }}>
        <StatCard
          label="Open Incidents"
          value={openIncidents.length}
          accent={openIncidents.length > 0 ? '#dc2626' : 'var(--green-mid)'}
          sub={openIncidents.length > 0 ? 'Needs attention' : 'All clear'}
          onClick={() => navigate('/incidents')}
        />
        <StatCard
          label="In Progress"
          value={inProgressIncidents.length}
          accent="#f59e0b"
          onClick={() => navigate('/incidents')}
        />
        <StatCard
          label="Assigned to Me"
          value={assignedToMe.length}
          accent={assignedToMe.length > 0 ? '#7c3aed' : 'var(--gray-400)'}
          onClick={() => navigate('/incidents')}
        />
        <StatCard
          label="My Bookings"
          value={myBookings.length}
          onClick={() => navigate('/bookings')}
        />
        <StatCard
          label="Notifications"
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
          <Button onClick={() => navigate('/incidents')}>View All Incidents</Button>
          <Button variant="outline" onClick={() => navigate('/bookings/new')}>+ New Booking</Button>
          <Button variant="outline" onClick={() => navigate('/resources')}>Browse Resources</Button>
          <Button variant="outline" onClick={() => navigate('/notifications')}>
            Notifications {unread > 0 && `(${unread})`}
          </Button>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 24 }}>
        {/* Open Incidents needing action */}
        <div style={{
          background: 'var(--white)', borderRadius: 'var(--radius-lg)',
          border: '1px solid var(--gray-200)', padding: 24
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
            <p style={{ fontSize: 13, fontWeight: 600 }}>Open Incidents</p>
            <button onClick={() => navigate('/incidents')} style={{
              fontSize: 12, color: 'var(--green-mid)', background: 'none',
              border: 'none', cursor: 'pointer', fontWeight: 500
            }}>View all →</button>
          </div>
          {openIncidents.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '24px 0' }}>
              <p style={{ fontSize: 13, color: 'var(--gray-400)' }}>No open incidents 🎉</p>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {openIncidents.slice(0, 5).map(i => (
                <div key={i.id} onClick={() => navigate(`/incidents/${i.id}`)} style={{
                  padding: '12px', borderRadius: 'var(--radius-md)',
                  border: '1px solid #fecaca', background: '#fff5f5',
                  cursor: 'pointer', transition: 'border-color var(--transition)',
                }}
                  onMouseOver={e => e.currentTarget.style.borderColor = '#dc2626'}
                  onMouseOut={e => e.currentTarget.style.borderColor = '#fecaca'}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 }}>
                    <p style={{ fontSize: 13, fontWeight: 500 }}>{i.title}</p>
                    <StatusBadge status={i.status} />
                  </div>
                  <p style={{ fontSize: 11, color: 'var(--gray-400)' }}>📍 {i.location}</p>
                  {i.reportedByName && (
                    <p style={{ fontSize: 11, color: 'var(--gray-400)', marginTop: 2 }}>Reported by: {i.reportedByName}</p>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Assigned to me */}
        <div style={{
          background: 'var(--white)', borderRadius: 'var(--radius-lg)',
          border: '1px solid var(--gray-200)', padding: 24
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
            <p style={{ fontSize: 13, fontWeight: 600 }}>Assigned to Me</p>
            <button onClick={() => navigate('/incidents')} style={{
              fontSize: 12, color: 'var(--green-mid)', background: 'none',
              border: 'none', cursor: 'pointer', fontWeight: 500
            }}>View all →</button>
          </div>
          {assignedToMe.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '24px 0' }}>
              <p style={{ fontSize: 13, color: 'var(--gray-400)' }}>No incidents assigned to you</p>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {assignedToMe.slice(0, 5).map(i => (
                <div key={i.id} onClick={() => navigate(`/incidents/${i.id}`)} style={{
                  padding: '12px', borderRadius: 'var(--radius-md)',
                  border: '1px solid #e9d5ff', background: '#faf5ff',
                  cursor: 'pointer', transition: 'border-color var(--transition)',
                }}
                  onMouseOver={e => e.currentTarget.style.borderColor = '#7c3aed'}
                  onMouseOut={e => e.currentTarget.style.borderColor = '#e9d5ff'}
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
