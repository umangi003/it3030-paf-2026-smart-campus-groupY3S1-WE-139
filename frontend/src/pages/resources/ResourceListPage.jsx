import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { resourceApi } from '../../api/resourceApi'
import { useAuth } from '../../context/AuthContext'
import StatusBadge from '../../components/common/StatusBadge'
import Button from '../../components/common/Button'
import Modal from '../../components/common/Modal'
import toast from 'react-hot-toast'
import { getErrorMessage } from '../../utils/helpers'

export default function ResourceListPage() {
  const navigate = useNavigate()
  const { isAdmin } = useAuth()
  const [resources, setResources] = useState([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [showCreate, setShowCreate] = useState(false)
  const [form, setForm] = useState({
    name: '', description: '', location: '', capacity: '',
    status: 'AVAILABLE', imageUrl: '', openingTime: '', closingTime: ''
  })

  useEffect(() => { fetchResources() }, [])

  const fetchResources = async () => {
    try {
      const res = await resourceApi.getAll()
      setResources(res.data.data || [])
    } catch { toast.error('Failed to load resources') }
    finally { setLoading(false) }
  }

  const handleSearch = async (val) => {
    setSearch(val)
    if (!val.trim()) { fetchResources(); return }
    try {
      const res = await resourceApi.search(val)
      setResources(res.data.data || [])
    } catch {}
  }

  const handleCreate = async (e) => {
    e.preventDefault()
    try {
      await resourceApi.create({
        ...form,
        capacity: form.capacity ? Number(form.capacity) : null,
        imageUrl: form.imageUrl || null,
        openingTime: form.openingTime || null,
        closingTime: form.closingTime || null,
      })
      toast.success('Resource created')
      setShowCreate(false)
      setForm({ name: '', description: '', location: '', capacity: '', status: 'AVAILABLE', imageUrl: '', openingTime: '', closingTime: '' })
      fetchResources()
    } catch (err) { toast.error(getErrorMessage(err)) }
  }

  const inputStyle = {
    width: '100%', padding: '9px 12px', borderRadius: 'var(--radius-md)',
    border: '1px solid var(--gray-200)', fontSize: 14, outline: 'none',
    fontFamily: 'var(--font-sans)', color: 'var(--green-deepest)',
    boxSizing: 'border-box',
  }

  const labelStyle = {
    fontSize: 13, fontWeight: 500, color: 'var(--gray-600)',
    display: 'block', marginBottom: 5
  }

  const rowStyle = { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }

  return (
    <div>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 28 }}>
        <div>
          <h1 style={{ fontSize: 22, fontWeight: 600, color: 'var(--green-deepest)', letterSpacing: '-0.5px' }}>Resources</h1>
          <p style={{ fontSize: 14, color: 'var(--gray-600)', marginTop: 2 }}>Browse and book campus facilities</p>
        </div>
        {isAdmin() && <Button onClick={() => setShowCreate(true)}>+ New Resource</Button>}
      </div>

      {/* Search */}
      <div style={{ marginBottom: 24 }}>
        <input
          placeholder="Search resources..."
          value={search}
          onChange={e => handleSearch(e.target.value)}
          style={{ ...inputStyle, maxWidth: 320 }}
        />
      </div>

      {/* Grid */}
      {loading ? (
        <p style={{ color: 'var(--gray-400)', fontSize: 14 }}>Loading...</p>
      ) : resources.length === 0 ? (
        <p style={{ color: 'var(--gray-400)', fontSize: 14 }}>No resources found.</p>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 16 }}>
          {resources.map(r => (
            <div key={r.id} onClick={() => navigate(`/resources/${r.id}`)} style={{
              background: 'var(--white)', borderRadius: 'var(--radius-lg)',
              border: '1px solid var(--gray-200)', overflow: 'hidden',
              cursor: 'pointer', transition: 'box-shadow var(--transition), border-color var(--transition)'
            }}
              onMouseOver={e => { e.currentTarget.style.boxShadow = 'var(--shadow-md)'; e.currentTarget.style.borderColor = 'var(--green-mid)' }}
              onMouseOut={e => { e.currentTarget.style.boxShadow = 'none'; e.currentTarget.style.borderColor = 'var(--gray-200)' }}
            >
              {r.imageUrl ? (
                <img src={r.imageUrl} alt={r.name}
                  style={{ width: '100%', height: 160, objectFit: 'cover', display: 'block' }}
                  onError={e => { e.target.style.display = 'none' }} />
              ) : (
                <div style={{
                  width: '100%', height: 120,
                  background: 'linear-gradient(135deg, var(--green-deepest) 0%, #023430 100%)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 32
                }}>🏛️</div>
              )}
              <div style={{ padding: 20 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 8 }}>
                  <h3 style={{ fontSize: 15, fontWeight: 600 }}>{r.name}</h3>
                  <StatusBadge status={r.status} />
                </div>
                <p style={{ fontSize: 13, color: 'var(--gray-600)', marginBottom: 12, lineHeight: 1.5 }}>
                  {r.description || 'No description'}
                </p>
                <div style={{ display: 'flex', gap: 16, fontSize: 12, color: 'var(--gray-400)', fontFamily: 'var(--font-mono)' }}>
                  <span>📍 {r.location}</span>
                  {r.capacity && <span>👥 {r.capacity}</span>}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Create Modal */}
      <Modal isOpen={showCreate} onClose={() => setShowCreate(false)} title="New Resource">
        <form onSubmit={handleCreate} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>

          {/* Name + Location */}
          <div style={rowStyle}>
            <div>
              <label style={labelStyle}>Name *</label>
              <input style={inputStyle} value={form.name}
                onChange={e => setForm(p => ({ ...p, name: e.target.value }))}
                type="text" required placeholder="e.g. Lecture Hall A" />
            </div>
            <div>
              <label style={labelStyle}>Location *</label>
              <input style={inputStyle} value={form.location}
                onChange={e => setForm(p => ({ ...p, location: e.target.value }))}
                type="text" required placeholder="e.g. Block B, Floor 2" />
            </div>
          </div>

          {/* Capacity + Status */}
          <div style={rowStyle}>
            <div>
              <label style={labelStyle}>Capacity</label>
              <input style={inputStyle} value={form.capacity}
                onChange={e => setForm(p => ({ ...p, capacity: e.target.value }))}
                type="number" min="1" placeholder="e.g. 50" />
            </div>
            <div>
              <label style={labelStyle}>Status</label>
              <select style={inputStyle} value={form.status}
                onChange={e => setForm(p => ({ ...p, status: e.target.value }))}>
                {['AVAILABLE', 'UNAVAILABLE', 'MAINTENANCE', 'RETIRED'].map(s => (
                  <option key={s}>{s}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Opening + Closing Time */}
          <div style={rowStyle}>
            <div>
              <label style={labelStyle}>Opening Time</label>
              <input style={inputStyle} type="time" value={form.openingTime}
                onChange={e => setForm(p => ({ ...p, openingTime: e.target.value }))} />
            </div>
            <div>
              <label style={labelStyle}>Closing Time</label>
              <input style={inputStyle} type="time" value={form.closingTime}
                onChange={e => setForm(p => ({ ...p, closingTime: e.target.value }))} />
            </div>
          </div>

          {/* Description */}
          <div>
            <label style={labelStyle}>Description</label>
            <textarea style={{ ...inputStyle, height: 72, resize: 'vertical' }}
              value={form.description}
              onChange={e => setForm(p => ({ ...p, description: e.target.value }))}
              placeholder="Brief description of the resource..." />
          </div>

          <div>
            <label style={labelStyle}>Image URL</label>
            <input style={inputStyle} value={form.imageUrl}
              onChange={e => setForm(p => ({ ...p, imageUrl: e.target.value }))}
              type="url" placeholder="https://example.com/image.jpg" />
            {form.imageUrl && (
              <img src={form.imageUrl} alt="preview"
                style={{ marginTop: 8, width: '100%', height: 120, objectFit: 'cover', borderRadius: 'var(--radius-md)', border: '1px solid var(--gray-200)' }}
                onError={e => { e.target.style.display = 'none' }} />
            )}
          </div>

          <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end', marginTop: 4 }}>
            <Button variant="outline" type="button" onClick={() => setShowCreate(false)}>Cancel</Button>
            <Button type="submit">Create</Button>
          </div>
        </form>
      </Modal>
    </div>
  )
} 