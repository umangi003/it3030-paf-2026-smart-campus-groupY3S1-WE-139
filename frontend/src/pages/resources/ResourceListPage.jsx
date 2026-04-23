import { useState, useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { resourceApi } from '../../api/resourceApi'
import { useAuth } from '../../context/AuthContext'
import StatusBadge from '../../components/common/StatusBadge'
import Button from '../../components/common/Button'
import Modal from '../../components/common/Modal'
import toast from 'react-hot-toast'
import { getErrorMessage } from '../../utils/helpers'

// ── Validation ────────────────────────────────────────────────────────────────
function validateForm(form) {
  const errors = {}

  if (!form.name.trim())
    errors.name = 'Name is required'
  else if (form.name.trim().length < 3)
    errors.name = 'Name must be at least 3 characters'
  else if (form.name.trim().length > 100)
    errors.name = 'Name must be under 100 characters'

  if (!form.location.trim())
    errors.location = 'Location is required'

  if (form.capacity !== '') {
    const cap = Number(form.capacity)
    if (isNaN(cap) || cap <= 0)
      errors.capacity = 'Capacity must be a positive number'
    else if (!Number.isInteger(cap))
      errors.capacity = 'Capacity must be a whole number'
  }

  if (form.imageUrl && form.imageUrl.trim() && !form.imageUrl.startsWith('data:')) {
    try {
      const url = new URL(form.imageUrl)
      if (!['http:', 'https:'].includes(url.protocol))
        errors.imageUrl = 'Image URL must start with http:// or https://'
    } catch {
      errors.imageUrl = 'Please enter a valid URL'
    }
  }

  if (form.openingTime && !form.closingTime)
    errors.closingTime = 'Closing time is required when opening time is set'
  if (form.closingTime && !form.openingTime)
    errors.openingTime = 'Opening time is required when closing time is set'
  if (form.openingTime && form.closingTime && form.openingTime >= form.closingTime)
    errors.closingTime = 'Closing time must be after opening time'

  return errors
}

// ── Styles ────────────────────────────────────────────────────────────────────
const inputBase = {
  width: '100%', padding: '8px 12px', borderRadius: 'var(--radius-md)',
  fontSize: 14, outline: 'none', fontFamily: 'var(--font-sans)',
  color: 'var(--green-deepest)', boxSizing: 'border-box', transition: 'border-color 0.15s'
}
const inputOk  = { ...inputBase, border: '1px solid var(--gray-200)' }
const inputErr = { ...inputBase, border: '1px solid #dc2626', background: '#fff8f8' }
const labelStyle = { fontSize: 12, fontWeight: 500, color: 'var(--gray-600)', display: 'block', marginBottom: 4 }
const errStyle   = { fontSize: 11, color: '#dc2626', marginTop: 3 }

function Field({ label, error, children }) {
  return (
    <div>
      <label style={labelStyle}>{label}</label>
      {children}
      {error && <p style={errStyle}>⚠ {error}</p>}
    </div>
  )
}

// ── Image Upload Component ────────────────────────────────────────────────────
function ImageUploader({ value, onChange }) {
  const fileRef = useRef()
  const [tab, setTab] = useState('upload') // 'upload' | 'url'
  const [urlInput, setUrlInput] = useState('')

  const handleFile = (e) => {
    const file = e.target.files[0]
    if (!file) return
    if (file.size > 2 * 1024 * 1024) {
      toast.error('Image must be under 2MB')
      return
    }
    const reader = new FileReader()
    reader.onload = () => onChange(reader.result) // base64 string
    reader.readAsDataURL(file)
  }

  const handleUrlSubmit = () => {
    if (!urlInput.trim()) return
    onChange(urlInput.trim())
  }

  const handleRemove = () => {
    onChange('')
    setUrlInput('')
    if (fileRef.current) fileRef.current.value = ''
  }

  return (
    <div>
      <label style={labelStyle}>Image</label>

      {/* Tab switcher */}
      <div style={{ display: 'flex', gap: 0, marginBottom: 8, border: '1px solid var(--gray-200)', borderRadius: 'var(--radius-md)', overflow: 'hidden', width: 'fit-content' }}>
        {['upload', 'url'].map(t => (
          <button key={t} type="button" onClick={() => setTab(t)} style={{
            padding: '5px 14px', fontSize: 12, fontWeight: 500,
            border: 'none', cursor: 'pointer', fontFamily: 'var(--font-sans)',
            background: tab === t ? 'var(--green-deepest)' : 'var(--white)',
            color: tab === t ? 'var(--white)' : 'var(--gray-500)',
          }}>
            {t === 'upload' ? '📁 Upload File' : '🔗 Paste URL'}
          </button>
        ))}
      </div>

      {tab === 'upload' ? (
        <div
          onClick={() => fileRef.current.click()}
          style={{
            border: '2px dashed var(--gray-200)', borderRadius: 'var(--radius-md)',
            padding: '20px', textAlign: 'center', cursor: 'pointer',
            background: 'var(--gray-50)', transition: 'border-color 0.15s'
          }}
          onMouseOver={e => e.currentTarget.style.borderColor = 'var(--green-mid)'}
          onMouseOut={e => e.currentTarget.style.borderColor = 'var(--gray-200)'}
        >
          <p style={{ fontSize: 13, color: 'var(--gray-500)', margin: 0 }}>
            Click to upload image
          </p>
          <p style={{ fontSize: 11, color: 'var(--gray-400)', margin: '4px 0 0' }}>
            JPG, PNG, WEBP — max 2MB
          </p>
          <input ref={fileRef} type="file" accept="image/*"
            style={{ display: 'none' }} onChange={handleFile} />
        </div>
      ) : (
        <div style={{ display: 'flex', gap: 8 }}>
          <input
            style={{ ...inputOk, flex: 1 }}
            placeholder="https://example.com/image.jpg"
            value={urlInput}
            onChange={e => setUrlInput(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && (e.preventDefault(), handleUrlSubmit())}
          />
          <button type="button" onClick={handleUrlSubmit} style={{
            padding: '8px 14px', borderRadius: 'var(--radius-md)',
            border: '1px solid var(--gray-200)', background: 'var(--white)',
            fontSize: 13, cursor: 'pointer', color: 'var(--green-deepest)',
            fontFamily: 'var(--font-sans)', whiteSpace: 'nowrap'
          }}>Use URL</button>
        </div>
      )}

      {/* Preview */}
      {value && (
        <div style={{ marginTop: 10, position: 'relative', display: 'inline-block' }}>
          <img src={value} alt="Preview"
            style={{ width: '100%', maxHeight: 120, objectFit: 'cover', borderRadius: 'var(--radius-md)', border: '1px solid var(--gray-200)' }}
            onError={e => { e.target.style.display = 'none' }}
          />
          <button type="button" onClick={handleRemove} style={{
            position: 'absolute', top: 6, right: 6,
            background: '#dc2626', color: 'white', border: 'none',
            borderRadius: '50%', width: 22, height: 22, fontSize: 12,
            cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center'
          }}>✕</button>
        </div>
      )}
    </div>
  )
}

// ── Main Component ────────────────────────────────────────────────────────────
const emptyForm = {
  name: '', description: '', location: '', capacity: '',
  status: 'AVAILABLE', imageUrl: '', openingTime: '', closingTime: ''
}

export default function ResourceListPage() {
  const navigate    = useNavigate()
  const { isAdmin } = useAuth()
  const [resources,  setResources]  = useState([])
  const [loading,    setLoading]    = useState(true)
  const [search,     setSearch]     = useState('')
  const [showCreate, setShowCreate] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [form,       setForm]       = useState(emptyForm)
  const [errors,     setErrors]     = useState({})
  const [touched,    setTouched]    = useState({})

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

  const handleChange = (field, value) => {
    const updated = { ...form, [field]: value }
    setForm(updated)
    setTouched(t => ({ ...t, [field]: true }))
    setErrors(validateForm(updated))
  }

  const handleBlur = (field) => {
    setTouched(t => ({ ...t, [field]: true }))
    setErrors(validateForm(form))
  }

  const inp = (field) => touched[field] && errors[field] ? inputErr : inputOk

  const handleCreate = async (e) => {
    e.preventDefault()
    const allTouched = Object.keys(emptyForm).reduce((a, k) => ({ ...a, [k]: true }), {})
    setTouched(allTouched)
    const errs = validateForm(form)
    setErrors(errs)
    if (Object.keys(errs).length > 0) return

    setSubmitting(true)
    try {
      await resourceApi.create({
        name: form.name.trim(),
        description: form.description.trim() || null,
        location: form.location.trim(),
        capacity: form.capacity ? Number(form.capacity) : null,
        status: form.status,
        imageUrl: form.imageUrl || null,
        openingTime: form.openingTime || null,
        closingTime: form.closingTime || null,
      })
      toast.success('Resource created successfully!')
      closeModal()
      fetchResources()
    } catch (err) {
      toast.error(getErrorMessage(err))
    } finally {
      setSubmitting(false)
    }
  }

  const closeModal = () => {
    setShowCreate(false)
    setForm(emptyForm)
    setErrors({})
    setTouched({})
  }

  const hasErrors = Object.keys(validateForm(form)).length > 0
  const showSummary = Object.keys(touched).length > 0 && hasErrors

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
        <input placeholder="Search resources..." value={search}
          onChange={e => handleSearch(e.target.value)}
          style={{ ...inputOk, maxWidth: 320 }} />
      </div>

      {/* Resource Grid */}
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
              {r.imageUrl && (
                <img src={r.imageUrl} alt={r.name}
                  style={{ width: '100%', height: 140, objectFit: 'cover' }}
                  onError={e => { e.target.style.display = 'none' }} />
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
                  {r.openingTime && <span>🕐 {r.openingTime}</span>}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Create Modal */}
      <Modal isOpen={showCreate} onClose={closeModal} title="New Resource">
        <form onSubmit={handleCreate} style={{ display: 'flex', flexDirection: 'column', gap: 10 }} noValidate>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
            <Field label="Name *" error={touched.name && errors.name}>
              <input style={inp('name')} value={form.name} placeholder="e.g. Meeting Room A"
                onChange={e => handleChange('name', e.target.value)}
                onBlur={() => handleBlur('name')} />
            </Field>
            <Field label="Location *" error={touched.location && errors.location}>
              <input style={inp('location')} value={form.location} placeholder="e.g. Block B, Floor 2"
                onChange={e => handleChange('location', e.target.value)}
                onBlur={() => handleBlur('location')} />
            </Field>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
            <Field label="Capacity (optional)" error={touched.capacity && errors.capacity}>
              <input style={inp('capacity')} type="number" min="1" value={form.capacity} placeholder="e.g. 20"
                onChange={e => handleChange('capacity', e.target.value)}
                onBlur={() => handleBlur('capacity')} />
            </Field>
            <Field label="Status *" error={null}>
              <select style={inputOk} value={form.status}
                onChange={e => handleChange('status', e.target.value)}>
                {['AVAILABLE', 'UNAVAILABLE', 'MAINTENANCE', 'RETIRED'].map(s => <option key={s}>{s}</option>)}
              </select>
            </Field>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
            <Field label="Opening Time" error={touched.openingTime && errors.openingTime}>
              <input style={inp('openingTime')} type="time" value={form.openingTime}
                onChange={e => handleChange('openingTime', e.target.value)}
                onBlur={() => handleBlur('openingTime')} />
            </Field>
            <Field label="Closing Time" error={touched.closingTime && errors.closingTime}>
              <input style={inp('closingTime')} type="time" value={form.closingTime}
                onChange={e => handleChange('closingTime', e.target.value)}
                onBlur={() => handleBlur('closingTime')} />
            </Field>
          </div>

          {/* Image uploader */}
          <ImageUploader
            value={form.imageUrl}
            onChange={val => handleChange('imageUrl', val)}
          />

          <Field label="Description (optional)" error={null}>
            <textarea style={{ ...inputOk, height: 60, resize: 'vertical' }}
              value={form.description} placeholder="Brief description of this resource..."
              onChange={e => handleChange('description', e.target.value)} />
          </Field>

          {showSummary && (
            <div style={{ background: '#fff5f5', border: '1px solid #fca5a5', borderRadius: 'var(--radius-md)', padding: '10px 14px' }}>
              <p style={{ fontSize: 12, color: '#dc2626', fontWeight: 500 }}>
                ⚠ Please fix the errors above before submitting.
              </p>
            </div>
          )}

          <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end', marginTop: 4 }}>
            <Button variant="outline" type="button" onClick={closeModal}>Cancel</Button>
            <Button type="submit" disabled={submitting}>
              {submitting ? 'Creating...' : 'Create Resource'}
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  )
}