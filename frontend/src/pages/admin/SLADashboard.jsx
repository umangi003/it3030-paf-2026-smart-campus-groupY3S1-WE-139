import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { incidentApi } from '../../api/incidentApi'
import StatusBadge from '../../components/common/StatusBadge'
import SLABadge from '../../components/common/SLABadge'
import Button from '../../components/common/Button'
import toast from 'react-hot-toast'
import { formatDateTime, getErrorMessage } from '../../utils/helpers'
import { getSLAPercentage } from '../../utils/slaHelpers'

export default function SLADashboard() {
  const navigate = useNavigate()
  const [incidents, setIncidents] = useState([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState('all')

  useEffect(() => { fetchIncidents() }, [])

  const fetchIncidents = async () => {
    try {
      const res = await incidentApi.getAll()
      setIncidents(res.data.data || [])
    } catch { toast.error('Failed to load incidents') }
    finally { setLoading(false) }
  }

  const handleStatusChange = async (id, status) => {
    try {
      await incidentApi.updateStatus(id, status)
      toast.success('Status updated')
      fetchIncidents()
    } catch (err) { toast.error(getErrorMessage(err)) }
  }

  const filtered = incidents.filter(inc => {
    if (filter === 'breached') return inc.sla?.responseBreached || inc.sla?.resolveBreached
    if (filter === 'open') return ['OPEN', 'IN_PROGRESS'].includes(inc.status)
    if (filter === 'escalated') return inc.status === 'ESCALATED'
    return true
  })

  const breachedCount = incidents.filter(i => i.sla?.responseBreached || i.sla?.resolveBreached).length
  const openCount = incidents.filter(i => ['OPEN', 'IN_PROGRESS'].includes(i.status)).length

  return (
    <div>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 28 }}>
        <div>
          <button onClick={() => navigate('/admin')} style={{
            background: 'none', border: 'none', color: 'var(--gray-400)',
            fontSize: 14, cursor: 'pointer', marginBottom: 8, display: 'block'
          }}>← Back to Dashboard</button>
          <h1 style={{ fontSize: 22, fontWeight: 600, letterSpacing: '-0.5px' }}>SLA Monitor</h1>
          <p style={{ fontSize: 14, color: 'var(--gray-600)', marginTop: 2 }}>Track incident response and resolution times</p>
        </div>
        <Button onClick={fetchIncidents} variant="outline" size="sm">↻ Refresh</Button>
      </div>

      {/* Summary */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 12, marginBottom: 24 }}>
        {[
          { label: 'Total Incidents', value: incidents.length, color: 'var(--green-deepest)' },
          { label: 'Open / In Progress', value: openCount, color: openCount > 0 ? '#b45309' : 'var(--green-mid)' },
          { label: 'SLA Breaches', value: breachedCount, color: breachedCount > 0 ? '#dc2626' : 'var(--green-mid)' },
        ].map(({ label, value, color }) => (
          <div key={label} style={{
            background: 'var(--white)', borderRadius: 'var(--radius-lg)',
            border: '1px solid var(--gray-200)', padding: '16px 20px'
          }}>
            <p style={{ fontSize: 11, color: 'var(--gray-400)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 6 }}>{label}</p>
            <p style={{ fontSize: 28, fontWeight: 600, color, letterSpacing: '-0.5px' }}>{value}</p>
          </div>
        ))}
      </div>

      {/* Filter tabs */}
      <div style={{ display: 'flex', gap: 8, marginBottom: 20 }}>
        {[['all', 'All'], ['open', 'Open'], ['breached', 'Breached'], ['escalated', 'Escalated']].map(([val, label]) => (
          <button key={val} onClick={() => setFilter(val)} style={{
            padding: '6px 14px', borderRadius: 100, fontSize: 13,
            border: '1px solid', cursor: 'pointer', fontFamily: 'var(--font-sans)',
            background: filter === val ? 'var(--green-deepest)' : 'var(--white)',
            color: filter === val ? 'var(--white)' : 'var(--gray-600)',
            borderColor: filter === val ? 'var(--green-deepest)' : 'var(--gray-200)',
            transition: 'all var(--transition)'
          }}>{label}</button>
        ))}
      </div>

      {/* Table */}
      {loading ? (
        <p style={{ color: 'var(--gray-400)', fontSize: 14 }}>Loading...</p>
      ) : filtered.length === 0 ? (
        <p style={{ color: 'var(--gray-400)', fontSize: 14 }}>No incidents match this filter.</p>
      ) : (
        <div style={{ background: 'var(--white)', borderRadius: 'var(--radius-lg)', border: '1px solid var(--gray-200)', overflow: 'hidden' }}>
          {/* Table header */}
          <div style={{
            display: 'grid', gridTemplateColumns: '2fr 1fr 1fr 1fr 1fr',
            padding: '12px 20px', borderBottom: '1px solid var(--gray-100)',
            background: 'var(--gray-50)'
          }}>
            {['Incident', 'Status', 'SLA', 'Reported', 'Action'].map(h => (
              <p key={h} style={{ fontSize: 11, fontWeight: 600, color: 'var(--gray-400)', textTransform: 'uppercase', letterSpacing: '0.08em' }}>{h}</p>
            ))}
          </div>

          {filtered.map((inc, i) => {
            const pct = inc.sla ? getSLAPercentage(inc.createdAt, inc.sla.resolveDueAt) : 0
            return (
              <div key={inc.id} style={{
                display: 'grid', gridTemplateColumns: '2fr 1fr 1fr 1fr 1fr',
                padding: '14px 20px', borderBottom: i < filtered.length - 1 ? '1px solid var(--gray-100)' : 'none',
                alignItems: 'center'
              }}>
                {/* Title */}
                <div>
                  <p style={{ fontSize: 14, fontWeight: 500, marginBottom: 2 }}>{inc.title}</p>
                  <p style={{ fontSize: 12, color: 'var(--gray-400)' }}>#{inc.id} · {inc.location}</p>
                  {/* Progress bar */}
                  {inc.sla && (
                    <div style={{ marginTop: 6, height: 3, background: 'var(--gray-100)', borderRadius: 2, maxWidth: 120 }}>
                      <div style={{
                        height: '100%', borderRadius: 2, width: `${pct}%`,
                        background: pct >= 100 ? '#dc2626' : pct >= 75 ? '#b45309' : 'var(--green-bright)',
                        transition: 'width 0.3s ease'
                      }} />
                    </div>
                  )}
                </div>

                {/* Status */}
                <StatusBadge status={inc.status} />

                {/* SLA Badge */}
                {inc.sla ? <SLABadge sla={inc.sla} /> : <span style={{ fontSize: 12, color: 'var(--gray-400)' }}>—</span>}

                {/* Reported */}
                <p style={{ fontSize: 12, color: 'var(--gray-400)', fontFamily: 'var(--font-mono)' }}>
                  {formatDateTime(inc.createdAt)}
                </p>

                {/* Action */}
                <div style={{ display: 'flex', gap: 6 }}>
                  <button onClick={() => navigate(`/incidents/${inc.id}`)} style={{
                    padding: '5px 10px', borderRadius: 'var(--radius-sm)',
                    border: '1px solid var(--gray-200)', background: 'transparent',
                    fontSize: 12, cursor: 'pointer', color: 'var(--gray-600)',
                    fontFamily: 'var(--font-sans)'
                  }}>View</button>
                  {inc.status === 'OPEN' && (
                    <button onClick={() => handleStatusChange(inc.id, 'IN_PROGRESS')} style={{
                      padding: '5px 10px', borderRadius: 'var(--radius-sm)',
                      border: 'none', background: 'var(--green-deepest)',
                      fontSize: 12, cursor: 'pointer', color: 'var(--white)',
                      fontFamily: 'var(--font-sans)'
                    }}>Assign</button>
                  )}
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
