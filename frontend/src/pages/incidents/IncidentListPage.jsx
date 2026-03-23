import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { incidentApi } from '../../api/incidentApi'
import { useAuth } from '../../context/AuthContext'
import StatusBadge from '../../components/common/StatusBadge'
import Button from '../../components/common/Button'
import Modal from '../../components/common/Modal'
import toast from 'react-hot-toast'
import { formatDateTime, getErrorMessage } from '../../utils/helpers'

export default function IncidentListPage() {
  const navigate = useNavigate()
  const { isAdmin } = useAuth()
  const [incidents, setIncidents] = useState([])
  const [loading, setLoading] = useState(true)
  const [showCreate, setShowCreate] = useState(false)
  const [form, setForm] = useState({ title: '', description: '', location: '' })

  useEffect(() => { fetchIncidents() }, [])

  const fetchIncidents = async () => {
    try {
      const res = isAdmin() ? await incidentApi.getAll() : await incidentApi.getMy()
      setIncidents(res.data.data || [])
    } catch { toast.error('Failed to load incidents') }
    finally { setLoading(false) }
  }

  const handleCreate = async (e) => {
    e.preventDefault()
    try {
      await incidentApi.create(form)
      toast.success('Incident reported')
      setShowCreate(false)
      setForm({ title: '', description: '', location: '' })
      fetchIncidents()
    } catch (err) { toast.error(getErrorMessage(err)) }
  }

  const inputStyle = {
    width: '100%', padding: '9px 12px', borderRadius: 'var(--radius-md)',
    border: '1px solid var(--gray-200)', fontSize: 14, outline: 'none',
    fontFamily: 'var(--font-sans)', color: 'var(--green-deepest)'
  }

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 28 }}>
        <div>
          <h1 style={{ fontSize: 22, fontWeight: 600, letterSpacing: '-0.5px' }}>Incidents</h1>
          <p style={{ fontSize: 14, color: 'var(--gray-600)', marginTop: 2 }}>
            {isAdmin() ? 'All reported incidents' : 'Your reported issues'}
          </p>
        </div>
        <Button onClick={() => setShowCreate(true)}>+ Report Incident</Button>
      </div>

      {loading ? (
        <p style={{ color: 'var(--gray-400)', fontSize: 14 }}>Loading...</p>
      ) : incidents.length === 0 ? (
        <div style={{
          background: 'var(--white)', borderRadius: 'var(--radius-lg)',
          border: '1px solid var(--gray-200)', padding: 48, textAlign: 'center'
        }}>
          <p style={{ color: 'var(--gray-400)', fontSize: 14, marginBottom: 16 }}>No incidents reported</p>
          <Button onClick={() => setShowCreate(true)}>Report an Issue</Button>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          {incidents.map(inc => (
            <div key={inc.id} onClick={() => navigate(`/incidents/${inc.id}`)} style={{
              background: 'var(--white)', borderRadius: 'var(--radius-lg)',
              border: '1px solid var(--gray-200)', padding: '18px 20px',
              cursor: 'pointer', transition: 'box-shadow var(--transition), border-color var(--transition)'
            }}
              onMouseOver={e => { e.currentTarget.style.boxShadow = 'var(--shadow-sm)'; e.currentTarget.style.borderColor = 'var(--green-mid)' }}
              onMouseOut={e => { e.currentTarget.style.boxShadow = 'none'; e.currentTarget.style.borderColor = 'var(--gray-200)' }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <div style={{ flex: 1 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 6 }}>
                    <h3 style={{ fontSize: 15, fontWeight: 600 }}>{inc.title}</h3>
                    <StatusBadge status={inc.status} />
                  </div>
                  <p style={{ fontSize: 13, color: 'var(--gray-600)', marginBottom: 6 }}>
                    {inc.description?.slice(0, 100)}{inc.description?.length > 100 ? '...' : ''}
                  </p>
                  <div style={{ display: 'flex', gap: 16, fontSize: 12, color: 'var(--gray-400)', fontFamily: 'var(--font-mono)' }}>
                    <span>📍 {inc.location}</span>
                    <span>{formatDateTime(inc.createdAt)}</span>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Create Modal */}
      <Modal isOpen={showCreate} onClose={() => setShowCreate(false)} title="Report Incident">
        <form onSubmit={handleCreate} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          <div>
            <label style={{ fontSize: 13, fontWeight: 500, color: 'var(--gray-600)', display: 'block', marginBottom: 5 }}>Title</label>
            <input style={inputStyle} value={form.title} onChange={e => setForm(p => ({ ...p, title: e.target.value }))} required />
          </div>
          <div>
            <label style={{ fontSize: 13, fontWeight: 500, color: 'var(--gray-600)', display: 'block', marginBottom: 5 }}>Location</label>
            <input style={inputStyle} value={form.location} onChange={e => setForm(p => ({ ...p, location: e.target.value }))} required />
          </div>
          <div>
            <label style={{ fontSize: 13, fontWeight: 500, color: 'var(--gray-600)', display: 'block', marginBottom: 5 }}>Description</label>
            <textarea style={{ ...inputStyle, height: 100, resize: 'vertical' }}
              value={form.description} onChange={e => setForm(p => ({ ...p, description: e.target.value }))} required />
          </div>
          <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end', marginTop: 8 }}>
            <Button variant="outline" onClick={() => setShowCreate(false)}>Cancel</Button>
            <Button type="submit">Submit Report</Button>
          </div>
        </form>
      </Modal>
    </div>
  )
}
