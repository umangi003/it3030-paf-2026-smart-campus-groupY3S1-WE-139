import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { analyticsApi } from '../../api/analyticsApi'
import Button from '../../components/common/Button'
import toast from 'react-hot-toast'

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
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    analyticsApi.getSummary()
      .then(r => setStats(r.data.data))
      .catch(() => toast.error('Failed to load analytics'))
      .finally(() => setLoading(false))
  }, [])

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
      <div style={{ marginBottom: 32 }}>
        <p style={{ fontSize: 11, fontWeight: 600, letterSpacing: '0.1em', color: 'var(--gray-400)', textTransform: 'uppercase', marginBottom: 14 }}>Bookings</p>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))', gap: 12 }}>
          <StatCard label="Total" value={stats?.totalBookings} />
          <StatCard label="Confirmed" value={stats?.confirmedBookings} accent="var(--green-mid)" />
          <StatCard label="Completed" value={stats?.completedBookings} accent="var(--gray-600)" />
          <StatCard label="Cancelled" value={stats?.cancelledBookings} accent="#dc2626" />
        </div>
      </div>

      {/* Incident Stats */}
      <div style={{ marginBottom: 32 }}>
        <p style={{ fontSize: 11, fontWeight: 600, letterSpacing: '0.1em', color: 'var(--gray-400)', textTransform: 'uppercase', marginBottom: 14 }}>Incidents</p>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))', gap: 12 }}>
          <StatCard label="Total" value={stats?.totalIncidents} />
          <StatCard label="Open" value={stats?.openIncidents} accent="#dc2626" />
          <StatCard label="Resolved" value={stats?.resolvedIncidents} accent="var(--green-mid)" />
          <StatCard label="Escalated" value={stats?.escalatedIncidents} accent="#7c3aed" />
        </div>
      </div>

      {/* SLA + Resources */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 24 }}>
        {/* SLA */}
        <div>
          <p style={{ fontSize: 11, fontWeight: 600, letterSpacing: '0.1em', color: 'var(--gray-400)', textTransform: 'uppercase', marginBottom: 14 }}>SLA</p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            <StatCard label="Response Breaches" value={stats?.slaResponseBreaches}
              accent={stats?.slaResponseBreaches > 0 ? '#dc2626' : 'var(--green-mid)'}
              sub={stats?.slaResponseBreaches > 0 ? 'Needs attention' : 'All good'} />
            <StatCard label="Resolve Breaches" value={stats?.slaResolveBreaches}
              accent={stats?.slaResolveBreaches > 0 ? '#dc2626' : 'var(--green-mid)'}
              sub={stats?.slaResolveBreaches > 0 ? 'Needs attention' : 'All good'} />
          </div>
        </div>

        {/* Resources */}
        <div>
          <p style={{ fontSize: 11, fontWeight: 600, letterSpacing: '0.1em', color: 'var(--gray-400)', textTransform: 'uppercase', marginBottom: 14 }}>Resources</p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            <StatCard label="Total Resources" value={stats?.totalResources} />
            <StatCard label="Available" value={stats?.availableResources} accent="var(--green-mid)"
              sub={stats ? `${Math.round((stats.availableResources / stats.totalResources) * 100)}% available` : ''} />
          </div>
        </div>
      </div>

      {/* Quick Links */}
      <div style={{ marginTop: 32, background: 'var(--white)', borderRadius: 'var(--radius-lg)', border: '1px solid var(--gray-200)', padding: 24 }}>
        <p style={{ fontSize: 13, fontWeight: 600, marginBottom: 16 }}>Quick Actions</p>
        <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
          <Button variant="outline" size="sm" onClick={() => navigate('/resources')}>Manage Resources</Button>
          <Button variant="outline" size="sm" onClick={() => navigate('/incidents')}>View Incidents</Button>
          <Button variant="outline" size="sm" onClick={() => navigate('/bookings')}>View Bookings</Button>
          <Button variant="outline" size="sm" onClick={() => navigate('/admin/sla')}>SLA Monitor</Button>
        </div>
      </div>
    </div>
  )
}
