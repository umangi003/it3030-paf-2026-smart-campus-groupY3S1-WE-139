import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { resourceApi } from '../../api/resourceApi'
import { useAuth } from '../../context/AuthContext'
import StatusBadge from '../../components/common/StatusBadge'
import Button from '../../components/common/Button'
import toast from 'react-hot-toast'
import { getErrorMessage } from '../../utils/helpers'

const BOOKABLE_STATUSES = ['AVAILABLE']

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
      .then(r => {
        setResource(r.data.data)
        setForm(r.data.data)
      })
      .catch(() => toast.error('Resource not found'))
      .finally(() => setLoading(false))
  }, [id])

  const handleUpdate = async (e) => {
    e.preventDefault()
    try {
      const res = await resourceApi.update(id, {
        name: form.name,
        description: form.description,
        location: form.location,
        capacity: form.capacity ? Number(form.capacity) : null,
        status: form.status,
        imageUrl: form.imageUrl || null,
        openingTime: form.openingTime || null,
        closingTime: form.closingTime || null,
      })
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
    width: '100%', padding: '8px 12px', borderRadius: 'var(--radius-md)',
    border: '1px solid var(--gray-200)', fontSize: 14, outline: 'none',
    fontFamily: 'var(--font-sans)', color: 'var(--green-deepest)',
    boxSizing: 'border-box'
  }

  const labelStyle = {
    fontSize: 12, fontWeight: 500, color: 'var(--gray-600)',
    display: 'block', marginBottom: 4
  }

  const rowStyle = { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }

  if (loading) return <p style={{ color: 'var(--gray-400)', fontSize: 14 }}>Loading...</p>
  if (!resource) return <p style={{ color: 'var(--gray-400)', fontSize: 14 }}>Resource not found.</p>

  const canBook = BOOKABLE_STATUSES.includes(resource.status)


  const bookingBlockedReason = {
    UNAVAILABLE: 'This resource is currently unavailable for booking.',
    MAINTENANCE: 'This resource is under maintenance and cannot be booked.',
    RETIRED:     'This resource has been retired and is no longer bookable.',
  }[resource.status]

  return (
    <div style={{ maxWidth: 640 }}>
      <button onClick={() => navigate('/resources')} style={{
        background: 'none', border: 'none', color: 'var(--gray-400)',
        fontSize: 14, cursor: 'pointer', marginBottom: 20, display: 'flex', alignItems: 'center', gap: 4
      }}>← Back to Resources</button>

      <div style={{ background: 'var(--white)', borderRadius: 'var(--radius-lg)', border: '1px solid var(--gray-200)', overflow: 'hidden' }}>

        {resource.imageUrl && !editing && (
          <img src={resource.imageUrl} alt={resource.name}
            style={{ width: '100%', height: 200, objectFit: 'cover' }}
            onError={e => { e.target.style.display = 'none' }}
          />
        )}

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

        <div style={{ padding: 24 }}>
          {editing ? (
            <form onSubmit={handleUpdate} style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>

              <div style={rowStyle}>
                <div>
                  <label style={labelStyle}>Name *</label>
                  <input style={inputStyle} value={form.name || ''} required
                    onChange={e => setForm(p => ({ ...p, name: e.target.value }))} />
                </div>
                <div>
                  <label style={labelStyle}>Location *</label>
                  <input style={inputStyle} value={form.location || ''} required
                    onChange={e => setForm(p => ({ ...p, location: e.target.value }))} />
                </div>
              </div>

              <div style={rowStyle}>
                <div>
                  <label style={labelStyle}>Capacity</label>
                  <input style={inputStyle} type="number" value={form.capacity || ''}
                    onChange={e => setForm(p => ({ ...p, capacity: e.target.value }))} />
                </div>
                <div>
                  <label style={labelStyle}>Status *</label>
                  <select style={inputStyle} value={form.status || 'AVAILABLE'}
                    onChange={e => setForm(p => ({ ...p, status: e.target.value }))}>
                    {['AVAILABLE', 'UNAVAILABLE', 'MAINTENANCE', 'RETIRED'].map(s => <option key={s}>{s}</option>)}
                  </select>
                </div>
              </div>

              <div style={rowStyle}>
                <div>
                  <label style={labelStyle}>Opening Time</label>
                  <input style={inputStyle} type="time"
                    value={form.openingTime || ''}
                    onChange={e => setForm(p => ({ ...p, openingTime: e.target.value }))} />
                </div>
                <div>
                  <label style={labelStyle}>Closing Time</label>
                  <input style={inputStyle} type="time"
                    value={form.closingTime || ''}
                    onChange={e => setForm(p => ({ ...p, closingTime: e.target.value }))} />
                </div>
              </div>

              <div>
                <label style={labelStyle}>Image URL</label>
                <input style={inputStyle} type="url" value={form.imageUrl || ''} placeholder="https://..."
                  onChange={e => setForm(p => ({ ...p, imageUrl: e.target.value }))} />
                {form.imageUrl && (
                  <img src={form.imageUrl} alt="preview"
                    style={{ marginTop: 8, width: '100%', height: 120, objectFit: 'cover', borderRadius: 'var(--radius-md)', border: '1px solid var(--gray-200)' }}
                    onError={e => { e.target.style.display = 'none' }} />
                )}
              </div>

              <div>
                <label style={labelStyle}>Description</label>
                <textarea style={{ ...inputStyle, height: 80, resize: 'vertical' }}
                  value={form.description || ''}
                  onChange={e => setForm(p => ({ ...p, description: e.target.value }))} />
              </div>

              <div style={{ display: 'flex', gap: 10, marginTop: 4 }}>
                <Button type="submit">Save Changes</Button>
                <Button variant="outline" type="button" onClick={() => setEditing(false)}>Cancel</Button>
              </div>
            </form>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              {[
                ['Location',    resource.location],
                ['Capacity',    resource.capacity ? `${resource.capacity} people` : '—'],
                ['Description', resource.description || '—'],
                ['Opening',     resource.openingTime || '—'],
                ['Closing',     resource.closingTime || '—'],
                ['Image URL',   resource.imageUrl
                  ? <a href={resource.imageUrl} target="_blank" rel="noreferrer"
                      style={{ color: 'var(--green-mid)', fontSize: 13 }}>View image ↗</a>
                  : '—'],
              ].map(([label, value]) => (
                <div key={label} style={{ display: 'flex', gap: 24 }}>
                  <span style={{ fontSize: 13, color: 'var(--gray-400)', width: 90, flexShrink: 0 }}>{label}</span>
                  <span style={{ fontSize: 14, color: 'var(--green-deepest)' }}>{value}</span>
                </div>
              ))}

              <div style={{ marginTop: 8 }}>
                {canBook ? (
                  <Button onClick={() => navigate(`/bookings/new?resourceId=${resource.id}`)}>
                    Book this Resource
                  </Button>
                ) : (
                  <div style={{
                    display: 'flex', alignItems: 'center', gap: 10,
                    padding: '12px 16px', borderRadius: 'var(--radius-md)',
                    background: '#fef3f2', border: '1px solid #fecdc9',
                  }}>
                    <span style={{ fontSize: 16 }}>🚫</span>
                    <span style={{ fontSize: 13, color: '#b42318' }}>
                      {bookingBlockedReason}
                    </span>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}