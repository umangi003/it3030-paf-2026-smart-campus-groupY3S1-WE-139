import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { analyticsApi } from '../../api/analyticsApi'
import { incidentApi } from '../../api/incidentApi'
import api from '../../api/axiosInstance'
import Button from '../../components/common/Button'
import StatusBadge from '../../components/common/StatusBadge'
import toast from 'react-hot-toast'
import { getErrorMessage } from '../../utils/helpers'

function StatCard({ label, value, sub, accent }) {
  return (
    <div style={{
      background: 'var(--white)', borderRadius: 'var(--radius-lg)',
      border: '1px solid var(--gray-200)', padding: '20px 24px'
    }}>
      <p style={{ fontSize: 12, color: 'var(--gray-400)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 8 }}>{label}</p>
      <p style={{ fontSize: 32, fontWeight: 600, letterSpacing: '-1px', color: accent || 'var(--green-deepest)', lineHeight: 1 }}>{value ?? '—'}</p>
      {sub && <p style={{ fontSize: 12, color: 'var(--gray-400)', marginTop: 6, fontFamily: 'var(--font-mono)' }}>{sub}</p>}
    </div>
  )
}

export default function AdminDashboard() {
  const navigate = useNavigate()
  const [stats, setStats] = useState(null)
  const [incidents, setIncidents] = useState([])
  const [technicians, setTechnicians] = useState([])
  const [loading, setLoading] = useState(true)
  const [assigning, setAssigning] = useState(null) // incident id being assigned

  useEffect(() => {
    Promise.all([
      analyticsApi.getSummary().catch(() => ({ data: { data: null } })),
      api.get('/incidents').catch(() => ({ data: { data: [] } })),
      api.get('/auth/users/technicians').catch(() => ({ data: { data: [] } })),
    ]).then(([a, i, t]) => {
      setStats(a.data.data)
      setIncidents(i.data.data || [])
      setTechnicians(t.data.data || [])
    }).catch(() => toast.error('Failed to load dashboard data'))
      .finally(() => setLoading(false))
  }, [])

  const handleAssign = async (incidentId, technicianId) => {
    setAssigning(incidentId)
    try {
      await incidentApi.assign(incidentId, technicianId)
      toast.success('Technician assigned')
      // Refresh incidents
      const res = await api.get('/incidents')
      setIncidents(res.data.data || [])
    } catch (err) {
      toast.error(getErrorMessage(err))
    } finally {
      setAssigning(null)
    }
  }

  const unassigned = incidents.filter(i => !i.assignedToId && !['RESOLVED', 'CLOSED'].includes(i.status))
  const openCount  = incidents.filter(i => i.status === 'OPEN').length

  if (loading) return <p style={{ color: 'var(--gray-400)', fontSize: 14 }}>Loading dashboard...</p>

  return (
    <div>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 32 }}>
        <div>
          <h1 style={{ fontSize: 22, fontWeight: 600, letterSpacing: '-0.5px' }}>Admin Dashboard</h1>
          <p style={{ fontSize: 14, color: 'var(--gray-600)', marginTop: 2 }}>Platform overview and analytics</p>
        </div>
        <Button variant="outline" onClick={() => navigate('/admin/sla')}>SLA Monitor →</Button>
      </div>

      {/* Booking Stats */}
      {stats && (
        <>
          <div style={{ marginBottom: 32 }}>
            <p style={{ fontSize: 11, fontWeight: 600, letterSpacing: '0.1em', color: 'var(--gray-400)', textTransform: 'uppercase', marginBottom: 14 }}>Bookings</p>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))', gap: 12 }}>
              <StatCard label="Total" value={stats.totalBookings} />
              <StatCard label="Confirmed" value={stats.confirmedBookings} accent="var(--green-mid)" />
              <StatCard label="Completed" value={stats.completedBookings} accent="var(--gray-600)" />
              <StatCard label="Cancelled" value={stats.cancelledBookings} accent="#dc2626" />
            </div>
          </div>

          <div style={{ marginBottom: 32 }}>
            <p style={{ fontSize: 11, fontWeight: 600, letterSpacing: '0.1em', color: 'var(--gray-400)', textTransform: 'uppercase', marginBottom: 14 }}>Incidents</p>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))', gap: 12 }}>
              <StatCard label="Total" value={stats.totalIncidents} />
              <StatCard label="Open" value={stats.openIncidents} accent="#dc2626" />
              <StatCard label="Resolved" value={stats.resolvedIncidents} accent="var(--green-mid)" />
              <StatCard label="Escalated" value={stats.escalatedIncidents} accent="#7c3aed" />
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 24, marginBottom: 32 }}>
            <div>
              <p style={{ fontSize: 11, fontWeight: 600, letterSpacing: '0.1em', color: 'var(--gray-400)', textTransform: 'uppercase', marginBottom: 14 }}>SLA</p>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                <StatCard label="Response Breaches" value={stats.slaResponseBreaches}
                  accent={stats.slaResponseBreaches > 0 ? '#dc2626' : 'var(--green-mid)'}
                  sub={stats.slaResponseBreaches > 0 ? 'Needs attention' : 'All good'} />
                <StatCard label="Resolve Breaches" value={stats.slaResolveBreaches}
                  accent={stats.slaResolveBreaches > 0 ? '#dc2626' : 'var(--green-mid)'}
                  sub={stats.slaResolveBreaches > 0 ? 'Needs attention' : 'All good'} />
              </div>
            </div>
            <div>
              <p style={{ fontSize: 11, fontWeight: 600, letterSpacing: '0.1em', color: 'var(--gray-400)', textTransform: 'uppercase', marginBottom: 14 }}>Resources</p>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                <StatCard label="Total Resources" value={stats.totalResources} />
                <StatCard label="Available" value={stats.availableResources} accent="var(--green-mid)"
                  sub={stats ? `${Math.round((stats.availableResources / stats.totalResources) * 100)}% available` : ''} />
              </div>
            </div>
          </div>
        </>
      )}

      {/* ── Technician Assignment ── */}
      <div style={{
        background: 'var(--white)', borderRadius: 'var(--radius-lg)',
        border: unassigned.length > 0 ? '1px solid #fca5a5' : '1px solid var(--gray-200)',
        padding: 24, marginBottom: 24
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
          <div>
            <p style={{ fontSize: 13, fontWeight: 600 }}>Unassigned Incident Tickets</p>
            <p style={{ fontSize: 12, color: 'var(--gray-400)', marginTop: 2 }}>
              Assign a technician to each open ticket
            </p>
          </div>
          {unassigned.length > 0 && (
            <span style={{
              fontSize: 12, fontWeight: 700, padding: '3px 10px', borderRadius: 10,
              background: '#fee2e2', color: '#dc2626', fontFamily: 'var(--font-mono)'
            }}>
              {unassigned.length} unassigned
            </span>
          )}
        </div>

        {unassigned.length === 0 ? (
          <p style={{ fontSize: 13, color: 'var(--gray-400)' }}>
            All active tickets have been assigned. ✓
          </p>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {unassigned.map(inc => (
              <div key={inc.id} style={{
                display: 'flex', alignItems: 'center', gap: 12,
                padding: '12px 14px', borderRadius: 'var(--radius-md)',
                border: '1px solid var(--gray-200)', flexWrap: 'wrap'
              }}>
                <div style={{ flex: 1, minWidth: 180 }}>
                  <p style={{ fontSize: 13, fontWeight: 500 }}>{inc.title}</p>
                  <p style={{ fontSize: 11, color: 'var(--gray-400)', fontFamily: 'var(--font-mono)', marginTop: 2 }}>
                    📍 {inc.location}
                  </p>
                </div>
                <StatusBadge status={inc.status} />
                <select
                  defaultValue=""
                  disabled={assigning === inc.id || technicians.length === 0}
                  onChange={e => { if (e.target.value) handleAssign(inc.id, e.target.value) }}
                  style={{
                    padding: '7px 12px', borderRadius: 'var(--radius-md)',
                    border: '1px solid var(--gray-200)', fontSize: 13,
                    fontFamily: 'var(--font-sans)', color: 'var(--green-deepest)',
                    background: 'var(--white)', cursor: 'pointer', minWidth: 180
                  }}
                >
                  <option value="" disabled>
                    {technicians.length === 0 ? 'No technicians available' : 'Assign technician…'}
                  </option>
                  {technicians.map(t => (
                    <option key={t.id} value={t.id}>{t.name}</option>
                  ))}
                </select>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Quick Links */}
      <div style={{
        background: 'var(--white)', borderRadius: 'var(--radius-lg)',
        border: '1px solid var(--gray-200)', padding: 24
      }}>
        <p style={{ fontSize: 13, fontWeight: 600, marginBottom: 16 }}>Quick Actions</p>
        <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
          <Button variant="outline" size="sm" onClick={() => navigate('/resources')}>Manage Resources</Button>
          <Button variant="outline" size="sm" onClick={() => navigate('/incidents')}>View All Incidents</Button>
          <Button variant="outline" size="sm" onClick={() => navigate('/bookings')}>View Bookings</Button>
          <Button variant="outline" size="sm" onClick={() => navigate('/admin/sla')}>SLA Monitor</Button>
        </div>
      </div>
    </div>
  )
}
