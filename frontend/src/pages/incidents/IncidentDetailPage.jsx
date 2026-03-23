import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { incidentApi } from '../../api/incidentApi'
import { useAuth } from '../../context/AuthContext'
import StatusBadge from '../../components/common/StatusBadge'
import SLABadge from '../../components/common/SLABadge'
import Button from '../../components/common/Button'
import toast from 'react-hot-toast'
import { formatDateTime, getErrorMessage } from '../../utils/helpers'

const STATUSES = ['OPEN', 'IN_PROGRESS', 'RESOLVED', 'CLOSED', 'ESCALATED']

export default function IncidentDetailPage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { isAdmin } = useAuth()
  const [incident, setIncident] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    incidentApi.getById(id)
      .then(r => setIncident(r.data.data))
      .catch(() => toast.error('Incident not found'))
      .finally(() => setLoading(false))
  }, [id])

  const handleStatusChange = async (status) => {
    try {
      const res = await incidentApi.updateStatus(id, status)
      setIncident(res.data.data)
      toast.success('Status updated')
    } catch (err) { toast.error(getErrorMessage(err)) }
  }

  if (loading) return <p style={{ color: 'var(--gray-400)', fontSize: 14 }}>Loading...</p>
  if (!incident) return <p style={{ color: 'var(--gray-400)', fontSize: 14 }}>Incident not found.</p>

  return (
    <div style={{ maxWidth: 680 }}>
      <button onClick={() => navigate('/incidents')} style={{
        background: 'none', border: 'none', color: 'var(--gray-400)',
        fontSize: 14, cursor: 'pointer', marginBottom: 20
      }}>← Back to Incidents</button>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
        {/* Main card */}
        <div style={{ background: 'var(--white)', borderRadius: 'var(--radius-lg)', border: '1px solid var(--gray-200)', overflow: 'hidden' }}>
          <div style={{ padding: '24px', borderBottom: '1px solid var(--gray-100)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
              <div>
                <h1 style={{ fontSize: 20, fontWeight: 600, marginBottom: 10 }}>{incident.title}</h1>
                <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                  <StatusBadge status={incident.status} />
                  {incident.sla && <SLABadge sla={incident.sla} />}
                </div>
              </div>
              {isAdmin() && (
                <select value={incident.status}
                  onChange={e => handleStatusChange(e.target.value)}
                  style={{
                    padding: '7px 12px', borderRadius: 'var(--radius-md)',
                    border: '1px solid var(--gray-200)', fontSize: 13,
                    fontFamily: 'var(--font-sans)', cursor: 'pointer', outline: 'none'
                  }}>
                  {STATUSES.map(s => <option key={s} value={s}>{s.replace('_', ' ')}</option>)}
                </select>
              )}
            </div>
          </div>

          <div style={{ padding: 24 }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              <div>
                <p style={{ fontSize: 12, color: 'var(--gray-400)', marginBottom: 4, textTransform: 'uppercase', letterSpacing: '0.08em' }}>Description</p>
                <p style={{ fontSize: 14, lineHeight: 1.6 }}>{incident.description}</p>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
                {[
                  ['Location', incident.location],
                  ['Reported by', incident.reportedByName],
                  ['Assigned to', incident.assignedToName || 'Unassigned'],
                  ['Reported', formatDateTime(incident.createdAt)],
                  ['Responded', formatDateTime(incident.respondedAt)],
                  ['Resolved', formatDateTime(incident.resolvedAt)],
                ].map(([label, value]) => (
                  <div key={label}>
                    <p style={{ fontSize: 12, color: 'var(--gray-400)', marginBottom: 2, textTransform: 'uppercase', letterSpacing: '0.08em' }}>{label}</p>
                    <p style={{ fontSize: 14 }}>{value || '—'}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
