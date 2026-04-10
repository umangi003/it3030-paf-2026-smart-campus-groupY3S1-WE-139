import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import { bookingApi } from '../../api/bookingApi'
import { incidentApi } from '../../api/incidentApi'
import StatusBadge from '../../components/common/StatusBadge'
import Button from '../../components/common/Button'
import toast from 'react-hot-toast'
import { formatDateTime } from '../../utils/helpers'

function StatCard({ label, value, accent, sub }) {
  return (
    <div style={{
      background: 'var(--white)', borderRadius: 'var(--radius-lg)',
      border: '1px solid var(--gray-200)', padding: '20px 24px'
    }}>
      <p style={{
        fontSize: 12, color: 'var(--gray-400)', textTransform: 'uppercase',
        letterSpacing: '0.08em', marginBottom: 8
      }}>{label}</p>
      <p style={{
        fontSize: 32, fontWeight: 600, letterSpacing: '-1px',
        color: accent || 'var(--green-deepest)', lineHeight: 1
      }}>{value ?? '—'}</p>
      {sub && <p style={{ fontSize: 12, color: 'var(--gray-400)', marginTop: 6, fontFamily: 'var(--font-mono)' }}>{sub}</p>}
    </div>
  )
}

export default function StaffDashboard() {
  const navigate = useNavigate()
  const { user } = useAuth()
  const [bookings, setBookings] = useState([])
  const [incidents, setIncidents] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    Promise.all([
      bookingApi.getMy().catch(() => ({ data: { data: [] } })),
      incidentApi.getMy().catch(() => ({ data: { data: [] } })),
    ]).then(([b, i]) => {
      setBookings(b.data.data || [])
      setIncidents(i.data.data || [])
    }).catch(() => toast.error('Failed to load dashboard data'))
      .finally(() => setLoading(false))
  }, [])

  const activeBookings = bookings.filter(b => ['PENDING', 'APPROVED'].includes(b.status))
  const openIncidents = incidents.filter(i => ['OPEN', 'IN_PROGRESS'].includes(i.status))
  const resolvedIncidents = incidents.filter(i => ['RESOLVED', 'CLOSED'].includes(i.status))

  if (loading) return <p style={{ color: 'var(--gray-400)', fontSize: 14 }}>Loading dashboard...</p>

  return (
    <div>
      {/* Header */}
      <div style={{ marginBottom: 32 }}>
        <h1 style={{ fontSize: 22, fontWeight: 600, letterSpacing: '-0.5px' }}>
          Welcome back, {user?.name?.split(' ')[0]}
        </h1>
        <p style={{ fontSize: 14, color: 'var(--gray-600)', marginTop: 2 }}>
          Staff dashboard — your bookings and incident tickets
        </p>
      </div>

      {/* Stats */}
      <div style={{
        display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))',
        gap: 12, marginBottom: 36
      }}>
        <StatCard label="Active Bookings" value={activeBookings.length} accent="var(--green-mid)" />
        <StatCard label="Total Bookings" value={bookings.length} />
        <StatCard label="Open Tickets" value={openIncidents.length}
          accent={openIncidents.length > 0 ? '#dc2626' : 'var(--green-mid)'}
          sub={openIncidents.length > 0 ? 'Needs attention' : 'All clear'} />
        <StatCard label="Resolved Tickets" value={resolvedIncidents.length} accent="var(--gray-600)" />
      </div>

      {/* Quick Actions */}
      <div style={{
        background: 'var(--white)', borderRadius: 'var(--radius-lg)',
        border: '1px solid var(--gray-200)', padding: 24, marginBottom: 32
      }}>
        <p style={{ fontSize: 13, fontWeight: 600, marginBottom: 16 }}>Quick Actions</p>
        <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
          <Button onClick={() => navigate('/bookings/new')}>+ New Booking</Button>
          <Button variant="outline" onClick={() => navigate('/incidents')}>+ Report Incident</Button>
          <Button variant="outline" onClick={() => navigate('/')}>Browse Resources</Button>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 24 }}>
        {/* Recent Bookings */}
        <div style={{
          background: 'var(--white)', borderRadius: 'var(--radius-lg)',
          border: '1px solid var(--gray-200)', padding: 24
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
            <p style={{ fontSize: 13, fontWeight: 600 }}>My Recent Bookings</p>
            <button onClick={() => navigate('/bookings')} style={{
              fontSize: 12, color: 'var(--green-mid)', background: 'none',
              border: 'none', cursor: 'pointer', fontFamily: 'var(--font-sans)'
            }}>View all →</button>
          </div>

          {bookings.length === 0 ? (
            <p style={{ fontSize: 13, color: 'var(--gray-400)' }}>No bookings yet.</p>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {bookings.slice(0, 5).map(b => (
                <div key={b.id} onClick={() => navigate('/bookings')} style={{
                  padding: '12px 14px', borderRadius: 'var(--radius-md)',
                  border: '1px solid var(--gray-200)', cursor: 'pointer',
                  transition: 'border-color var(--transition)'
                }}
                  onMouseOver={e => e.currentTarget.style.borderColor = 'var(--green-mid)'}
                  onMouseOut={e => e.currentTarget.style.borderColor = 'var(--gray-200)'}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 4 }}>
                    <p style={{ fontSize: 13, fontWeight: 500 }}>{b.resourceName || b.resource?.name || 'Resource'}</p>
                    <StatusBadge status={b.status} />
                  </div>
                  <p style={{ fontSize: 11, color: 'var(--gray-400)', fontFamily: 'var(--font-mono)' }}>
                    {b.startTime ? formatDateTime(b.startTime) : '—'}
                  </p>
                  {b.purpose && (
                    <p style={{ fontSize: 12, color: 'var(--gray-600)', marginTop: 4 }}>{b.purpose}</p>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Recent Incidents */}
        <div style={{
          background: 'var(--white)', borderRadius: 'var(--radius-lg)',
          border: '1px solid var(--gray-200)', padding: 24
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
            <p style={{ fontSize: 13, fontWeight: 600 }}>My Incident Tickets</p>
            <button onClick={() => navigate('/incidents')} style={{
              fontSize: 12, color: 'var(--green-mid)', background: 'none',
              border: 'none', cursor: 'pointer', fontFamily: 'var(--font-sans)'
            }}>View all →</button>
          </div>

          {incidents.length === 0 ? (
            <p style={{ fontSize: 13, color: 'var(--gray-400)' }}>No tickets submitted yet.</p>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {incidents.slice(0, 5).map(inc => (
                <div key={inc.id} onClick={() => navigate(`/incidents/${inc.id}`)} style={{
                  padding: '12px 14px', borderRadius: 'var(--radius-md)',
                  border: '1px solid var(--gray-200)', cursor: 'pointer',
                  transition: 'border-color var(--transition)'
                }}
                  onMouseOver={e => e.currentTarget.style.borderColor = 'var(--green-mid)'}
                  onMouseOut={e => e.currentTarget.style.borderColor = 'var(--gray-200)'}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 4 }}>
                    <p style={{ fontSize: 13, fontWeight: 500, flex: 1, marginRight: 8 }}>
                      {inc.title || inc.description?.slice(0, 40) || 'Incident'}
                    </p>
                    <StatusBadge status={inc.status} />
                  </div>
                  {inc.priority && (
                    <span style={{
                      display: 'inline-block', fontSize: 10, fontWeight: 600,
                      padding: '2px 7px', borderRadius: 10, fontFamily: 'var(--font-mono)',
                      background: inc.priority === 'HIGH' ? '#fee2e2' : inc.priority === 'MEDIUM' ? '#fef9c3' : '#f0fdf4',
                      color: inc.priority === 'HIGH' ? '#dc2626' : inc.priority === 'MEDIUM' ? '#ca8a04' : '#16a34a',
                      marginTop: 4
                    }}>
                      {inc.priority}
                    </span>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
