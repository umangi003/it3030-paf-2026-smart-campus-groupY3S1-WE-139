import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import { incidentApi } from '../../api/incidentApi'
import api from '../../api/axiosInstance'
import StatusBadge from '../../components/common/StatusBadge'
import Button from '../../components/common/Button'
import Modal from '../../components/common/Modal'
import toast from 'react-hot-toast'
import { getErrorMessage } from '../../utils/helpers'

const STATUS_FLOW = ['OPEN', 'IN_PROGRESS', 'RESOLVED', 'CLOSED']

const priorityStyle = (p) => ({
  display: 'inline-block', fontSize: 10, fontWeight: 600,
  padding: '2px 8px', borderRadius: 10, fontFamily: 'var(--font-mono)',
  background: p === 'HIGH' ? '#fee2e2' : p === 'MEDIUM' ? '#fef9c3' : '#f0fdf4',
  color: p === 'HIGH' ? '#dc2626' : p === 'MEDIUM' ? '#ca8a04' : '#16a34a',
})

function StatCard({ label, value, accent, sub }) {
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

export default function TechnicianDashboard() {
  const { user } = useAuth()
  const navigate = useNavigate()
  const [tickets, setTickets] = useState([])
  const [loading, setLoading] = useState(true)
  const [selected, setSelected] = useState(null)       // ticket being actioned
  const [showNote, setShowNote] = useState(false)       // resolution note modal
  const [note, setNote] = useState('')
  const [updating, setUpdating] = useState(false)

  useEffect(() => { fetchAssigned() }, [])

  const fetchAssigned = async () => {
    try {
      const res = await api.get('/incidents/assigned')
      setTickets(res.data.data || [])
    } catch {
      toast.error('Failed to load assigned tickets')
    } finally {
      setLoading(false)
    }
  }

  const handleStatusUpdate = async (ticket, newStatus) => {
    setUpdating(true)
    try {
      await incidentApi.updateStatus(ticket.id, newStatus)
      toast.success(`Status updated to ${newStatus}`)
      fetchAssigned()
    } catch (err) {
      toast.error(getErrorMessage(err))
    } finally {
      setUpdating(false)
    }
  }

  const handleAddNote = async () => {
    if (!note.trim()) return
    setUpdating(true)
    try {
      await api.patch(`/incidents/${selected.id}/resolution`, { note })
      toast.success('Resolution note saved')
      setShowNote(false)
      setNote('')
      setSelected(null)
      fetchAssigned()
    } catch (err) {
      toast.error(getErrorMessage(err))
    } finally {
      setUpdating(false)
    }
  }

  const openTickets      = tickets.filter(t => t.status === 'OPEN')
  const inProgressTickets = tickets.filter(t => t.status === 'IN_PROGRESS')
  const resolvedTickets  = tickets.filter(t => ['RESOLVED', 'CLOSED'].includes(t.status))

  const nextStatus = (current) => {
    const idx = STATUS_FLOW.indexOf(current)
    return idx < STATUS_FLOW.length - 1 ? STATUS_FLOW[idx + 1] : null
  }

  if (loading) return <p style={{ color: 'var(--gray-400)', fontSize: 14 }}>Loading dashboard...</p>

  return (
    <div>
      {/* Header */}
      <div style={{ marginBottom: 32 }}>
        <h1 style={{ fontSize: 22, fontWeight: 600, letterSpacing: '-0.5px' }}>
          Technician Dashboard
        </h1>
        <p style={{ fontSize: 14, color: 'var(--gray-600)', marginTop: 2 }}>
          Welcome, {user?.name} — manage your assigned incident tickets
        </p>
      </div>

      {/* Stats */}
      <div style={{
        display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(170px, 1fr))',
        gap: 12, marginBottom: 36
      }}>
        <StatCard label="Total Assigned" value={tickets.length} />
        <StatCard label="Open" value={openTickets.length}
          accent={openTickets.length > 0 ? '#dc2626' : 'var(--green-mid)'}
          sub={openTickets.length > 0 ? 'Awaiting action' : 'All clear'} />
        <StatCard label="In Progress" value={inProgressTickets.length} accent="#ca8a04" />
        <StatCard label="Resolved" value={resolvedTickets.length} accent="var(--green-mid)" />
      </div>

      {/* Ticket board — 3 columns */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 20 }}>

        {/* OPEN column */}
        <TicketColumn
          title="Open" color="#dc2626" tickets={openTickets}
          onAction={(t) => handleStatusUpdate(t, 'IN_PROGRESS')}
          actionLabel="Start Work"
          onNote={(t) => { setSelected(t); setShowNote(true) }}
          onNavigate={(t) => navigate(`/incidents/${t.id}`)}
          updating={updating}
        />

        {/* IN PROGRESS column */}
        <TicketColumn
          title="In Progress" color="#ca8a04" tickets={inProgressTickets}
          onAction={(t) => handleStatusUpdate(t, 'RESOLVED')}
          actionLabel="Mark Resolved"
          onNote={(t) => { setSelected(t); setShowNote(true) }}
          onNavigate={(t) => navigate(`/incidents/${t.id}`)}
          updating={updating}
        />

        {/* RESOLVED / CLOSED column */}
        <TicketColumn
          title="Resolved / Closed" color="var(--green-mid)" tickets={resolvedTickets}
          onNote={(t) => { setSelected(t); setShowNote(true) }}
          onNavigate={(t) => navigate(`/incidents/${t.id}`)}
          updating={updating}
          readOnly
        />
      </div>

      {tickets.length === 0 && (
        <div style={{
          textAlign: 'center', padding: '60px 24px',
          background: 'var(--white)', borderRadius: 'var(--radius-lg)',
          border: '1px solid var(--gray-200)', marginTop: 24
        }}>
          <p style={{ fontSize: 32, marginBottom: 12 }}>🎉</p>
          <p style={{ fontSize: 15, fontWeight: 500, color: 'var(--green-deepest)', marginBottom: 6 }}>
            No tickets assigned to you yet
          </p>
          <p style={{ fontSize: 13, color: 'var(--gray-400)' }}>
            Check back later or contact your admin.
          </p>
        </div>
      )}

      {/* Resolution Note Modal */}
      <Modal isOpen={showNote} onClose={() => { setShowNote(false); setNote('') }} title="Add Resolution Note">
        <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          {selected && (
            <div style={{
              padding: '10px 14px', background: 'var(--gray-50)',
              borderRadius: 'var(--radius-md)', border: '1px solid var(--gray-200)'
            }}>
              <p style={{ fontSize: 13, fontWeight: 500 }}>{selected.title}</p>
              <p style={{ fontSize: 12, color: 'var(--gray-400)', marginTop: 2 }}>{selected.location}</p>
              {selected.resolutionNote && (
                <p style={{ fontSize: 12, color: 'var(--gray-600)', marginTop: 8, fontStyle: 'italic' }}>
                  Current note: {selected.resolutionNote}
                </p>
              )}
            </div>
          )}
          <div>
            <label style={{ fontSize: 13, fontWeight: 500, color: 'var(--gray-600)', display: 'block', marginBottom: 6 }}>
              Resolution Note
            </label>
            <textarea
              value={note}
              onChange={e => setNote(e.target.value)}
              placeholder="Describe what was done to resolve this issue..."
              style={{
                width: '100%', padding: '10px 14px', borderRadius: 'var(--radius-md)',
                border: '1px solid var(--gray-200)', fontSize: 13,
                fontFamily: 'var(--font-sans)', resize: 'vertical', minHeight: 100, outline: 'none'
              }}
            />
          </div>
          <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end' }}>
            <Button variant="outline" onClick={() => { setShowNote(false); setNote('') }}>Cancel</Button>
            <Button onClick={handleAddNote} disabled={updating || !note.trim()}>Save Note</Button>
          </div>
        </div>
      </Modal>
    </div>
  )
}

// ── Sub-component: a single kanban column ──────────────────────────────
function TicketColumn({ title, color, tickets, onAction, actionLabel, onNote, onNavigate, updating, readOnly }) {
  return (
    <div>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12 }}>
        <span style={{ width: 10, height: 10, borderRadius: '50%', background: color, display: 'inline-block' }} />
        <p style={{ fontSize: 13, fontWeight: 600 }}>{title}</p>
        <span style={{
          fontSize: 11, fontWeight: 600, fontFamily: 'var(--font-mono)',
          background: 'var(--gray-100)', color: 'var(--gray-600)',
          padding: '1px 7px', borderRadius: 10
        }}>{tickets.length}</span>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
        {tickets.length === 0 ? (
          <p style={{ fontSize: 12, color: 'var(--gray-400)', padding: '12px', textAlign: 'center' }}>
            No tickets
          </p>
        ) : tickets.map(t => (
          <div key={t.id} style={{
            background: 'var(--white)', borderRadius: 'var(--radius-lg)',
            border: '1px solid var(--gray-200)', padding: 16,
            transition: 'box-shadow var(--transition)'
          }}>
            {/* Title */}
            <p style={{ fontSize: 13, fontWeight: 600, marginBottom: 6, lineHeight: 1.3 }}>
              {t.title}
            </p>

            {/* Location */}
            <p style={{ fontSize: 11, color: 'var(--gray-400)', fontFamily: 'var(--font-mono)', marginBottom: 8 }}>
              📍 {t.location}
            </p>

            {/* Priority */}
            {t.priority && <span style={priorityStyle(t.priority)}>{t.priority}</span>}

            {/* Resolution note preview */}
            {t.resolutionNote && (
              <p style={{
                fontSize: 11, color: 'var(--gray-600)', marginTop: 8,
                padding: '6px 10px', background: 'var(--gray-50)',
                borderRadius: 'var(--radius-sm)', fontStyle: 'italic', lineHeight: 1.4
              }}>
                📝 {t.resolutionNote.slice(0, 80)}{t.resolutionNote.length > 80 ? '…' : ''}
              </p>
            )}

            {/* Actions */}
            <div style={{ display: 'flex', gap: 6, marginTop: 12, flexWrap: 'wrap' }}>
              <button onClick={() => onNavigate(t)} style={{
                padding: '5px 10px', fontSize: 11, borderRadius: 'var(--radius-sm)',
                border: '1px solid var(--gray-200)', background: 'transparent',
                color: 'var(--gray-600)', cursor: 'pointer'
              }}>
                Details
              </button>

              <button onClick={() => onNote(t)} style={{
                padding: '5px 10px', fontSize: 11, borderRadius: 'var(--radius-sm)',
                border: '1px solid var(--gray-200)', background: 'transparent',
                color: 'var(--gray-600)', cursor: 'pointer'
              }}>
                {t.resolutionNote ? 'Edit Note' : '+ Note'}
              </button>

              {!readOnly && onAction && (
                <button onClick={() => onAction(t)} disabled={updating} style={{
                  padding: '5px 10px', fontSize: 11, borderRadius: 'var(--radius-sm)',
                  border: 'none', background: 'var(--green-bright)', color: 'var(--green-deepest)',
                  fontWeight: 600, cursor: updating ? 'not-allowed' : 'pointer',
                  opacity: updating ? 0.7 : 1
                }}>
                  {actionLabel}
                </button>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
