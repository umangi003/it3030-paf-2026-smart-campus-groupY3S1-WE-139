import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { resourceApi } from '../../api/resourceApi'
import { useAuth } from '../../context/AuthContext'
import StatusBadge from '../../components/common/StatusBadge'
import Button from '../../components/common/Button'
import toast from 'react-hot-toast'
import { getErrorMessage } from '../../utils/helpers'

export default function ResourceDetailPage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { isAdmin } = useAuth()
  const [resource, setResource] = useState(null)
  const [loading, setLoading] = useState(true)
  const [editing, setEditing] = useState(false)
  const [form, setForm] = useState({})

  useEffect(() => {
    resourceApi.getById(id)
      .then(r => { setResource(r.data.data); setForm(r.data.data) })
      .catch(() => toast.error('Resource not found'))
      .finally(() => setLoading(false))
  }, [id])

  const handleUpdate = async (e) => {
    e.preventDefault()
    try {
      const res = await resourceApi.update(id, form)
      setResource(res.data.data)
      setEditing(false)
      toast.success('Resource updated')
    } catch (err) { toast.error(getErrorMessage(err)) }
  }

  const handleDelete = async () => {
    if (!confirm('Delete this resource?')) return
    try {
      await resourceApi.delete(id)
      toast.success('Resource deleted')
      navigate('/resources')
    } catch (err) { toast.error(getErrorMessage(err)) }
  }

  const inputStyle = {
    width: '100%', padding: '9px 12px', borderRadius: 'var(--radius-md)',
    border: '1px solid var(--gray-200)', fontSize: 14, outline: 'none',
    fontFamily: 'var(--font-sans)', color: 'var(--green-deepest)'
  }

  if (loading) return <p style={{ color: 'var(--gray-400)', fontSize: 14 }}>Loading...</p>
  if (!resource) return <p style={{ color: 'var(--gray-400)', fontSize: 14 }}>Resource not found.</p>

  return (
    <div style={{ maxWidth: 640 }}>
      {/* Back */}
      <button onClick={() => navigate('/resources')} style={{
        background: 'none', border: 'none', color: 'var(--gray-400)',
        fontSize: 14, cursor: 'pointer', marginBottom: 20, display: 'flex', alignItems: 'center', gap: 4
      }}>← Back to Resources</button>

      <div style={{ background: 'var(--white)', borderRadius: 'var(--radius-lg)', border: '1px solid var(--gray-200)', overflow: 'hidden' }}>
        {/* Header */}
        <div style={{ padding: '24px', borderBottom: '1px solid var(--gray-100)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <div>
              <h1 style={{ fontSize: 20, fontWeight: 600, marginBottom: 8 }}>{resource.name}</h1>
              <StatusBadge status={resource.status} />
            </div>
            {isAdmin() && !editing && (
              <div style={{ display: 'flex', gap: 8 }}>
                <Button variant="outline" size="sm" onClick={() => setEditing(true)}>Edit</Button>
                <Button variant="danger" size="sm" onClick={handleDelete}>Delete</Button>
              </div>
            )}
          </div>
        </div>

        {/* Content */}
        <div style={{ padding: 24 }}>
          {editing ? (
            <form onSubmit={handleUpdate} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              {[['name', 'Name'], ['location', 'Location'], ['description', 'Description']].map(([k, l]) => (
                <div key={k}>
                  <label style={{ fontSize: 13, fontWeight: 500, color: 'var(--gray-600)', display: 'block', marginBottom: 5 }}>{l}</label>
                  {k === 'description'
                    ? <textarea style={{ ...inputStyle, height: 80 }} value={form[k] || ''} onChange={e => setForm(p => ({ ...p, [k]: e.target.value }))} />
                    : <input style={inputStyle} value={form[k] || ''} onChange={e => setForm(p => ({ ...p, [k]: e.target.value }))} />}
                </div>
              ))}
              <div>
                <label style={{ fontSize: 13, fontWeight: 500, color: 'var(--gray-600)', display: 'block', marginBottom: 5 }}>Status</label>
                <select style={inputStyle} value={form.status} onChange={e => setForm(p => ({ ...p, status: e.target.value }))}>
                  {['AVAILABLE', 'UNAVAILABLE', 'MAINTENANCE', 'RETIRED'].map(s => <option key={s}>{s}</option>)}
                </select>
              </div>
              <div style={{ display: 'flex', gap: 10 }}>
                <Button type="submit">Save</Button>
                <Button variant="outline" onClick={() => setEditing(false)}>Cancel</Button>
              </div>
            </form>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              {[
                ['Location', resource.location],
                ['Capacity', resource.capacity ? `${resource.capacity} people` : '—'],
                ['Description', resource.description || '—'],
                ['Opening', resource.openingTime || '—'],
                ['Closing', resource.closingTime || '—'],
              ].map(([label, value]) => (
                <div key={label} style={{ display: 'flex', gap: 24 }}>
                  <span style={{ fontSize: 13, color: 'var(--gray-400)', width: 90, flexShrink: 0 }}>{label}</span>
                  <span style={{ fontSize: 14, color: 'var(--green-deepest)' }}>{value}</span>
                </div>
              ))}
              <div style={{ marginTop: 8 }}>
                <Button onClick={() => navigate(`/bookings/new?resourceId=${resource.id}`)}>
                  Book this Resource
                </Button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
