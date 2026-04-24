import { useState, useEffect, useRef } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { resourceApi } from '../../api/resourceApi'
import { useAuth } from '../../context/AuthContext'
import StatusBadge from '../../components/common/StatusBadge'
import Button from '../../components/common/Button'
import toast from 'react-hot-toast'
import { getErrorMessage } from '../../utils/helpers'

// Validation
function validateForm(form) {
  const errors = {}

  if (!form.name || !form.name.trim())
    errors.name = 'Name is required'
  else if (form.name.trim().length < 3)
    errors.name = 'Name must be at least 3 characters'
  else if (form.name.trim().length > 100)
    errors.name = 'Name must be under 100 characters'

  if (!form.location || !form.location.trim())
    errors.location = 'Location is required'

  if (form.capacity !== '' && form.capacity !== null && form.capacity !== undefined) {
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

//Styles
const inputBase = {
  width: '100%', padding: '8px 12px', borderRadius: 'var(--radius-md)',
  fontSize: 14, outline: 'none', fontFamily: 'var(--font-sans)',
  color: 'var(--green-deepest)', boxSizing: 'border-box', transition: 'border-color 0.15s'
}
const inputOk  = { ...inputBase, border: '1px solid var(--gray-200)' }
const inputErr = { ...inputBase, border: '1px solid #dc2626', background: '#fff8f8' }
const labelStyle = { fontSize: 12, fontWeight: 500, color: 'var(--gray-600)', display: 'block', marginBottom: 4 }
const errStyle   = { fontSize: 11, color: '#dc2626', marginTop: 3 }
const rowStyle   = { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }

function Field({ label, error, children }) {
  return (
    <div>
      <label style={labelStyle}>{label}</label>
      {children}
      {error && <p style={errStyle}>⚠ {error}</p>}
    </div>
  )
}

//Image Uploader
function ImageUploader({ value, onChange }) {
  const fileRef = useRef()
  const [tab, setTab] = useState('upload')
  const [urlInput, setUrlInput] = useState('')

  const handleFile = (e) => {
    const file = e.target.files[0]
    if (!file) return
    if (file.size > 2 * 1024 * 1024) {
      toast.error('Image must be under 2MB')
      return
    }
    const reader = new FileReader()
    reader.onload = () => onChange(reader.result)
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

      <div style={{ display: 'flex', gap: 0, marginBottom: 8, border: '1px solid var(--gray-200)', borderRadius: 'var(--radius-md)', overflow: 'hidden', width: 'fit-content' }}>
        {['upload', 'url'].map(t => (
          <button key={t} type="button" onClick={() => setTab(t)} style={{
            padding: '5px 14px', fontSize: 12, fontWeight: 500,
            border: 'none', cursor: 'pointer', fontFamily: 'var(--font-sans)',
            background: tab === t ? 'var(--green-deepest)' : 'var(--white)',
            color: tab === t ? 'var(--white)' : 'var(--gray-500)',
          }}>
            {t === 'upload' ? 'Upload File' : 'Paste URL'}
          </button>
        ))}
      </div>

      {tab === 'upload' ? (
        <div
          onClick={() => fileRef.current.click()}
          style={{
            border: '2px dashed var(--gray-200)', borderRadius: 'var(--radius-md)',
            padding: '20px', textAlign: 'center', cursor: 'pointer',
            background: 'var(--gray-50)'
          }}
          onMouseOver={e => e.currentTarget.style.borderColor = 'var(--green-mid)'}
          onMouseOut={e => e.currentTarget.style.borderColor = 'var(--gray-200)'}
        >
          <p style={{ fontSize: 13, color: 'var(--gray-500)', margin: 0 }}>Click to upload image</p>
          <p style={{ fontSize: 11, color: 'var(--gray-400)', margin: '4px 0 0' }}>JPG, PNG, WEBP — max 2MB</p>
          <input ref={fileRef} type="file" accept="image/*" style={{ display: 'none' }} onChange={handleFile} />
        </div>
      ) : (
        <div style={{ display: 'flex', gap: 8 }}>
          <input style={{ ...inputOk, flex: 1 }} placeholder="https://example.com/image.jpg"
            value={urlInput} onChange={e => setUrlInput(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && (e.preventDefault(), handleUrlSubmit())} />
          <button type="button" onClick={handleUrlSubmit} style={{
            padding: '8px 14px', borderRadius: 'var(--radius-md)',
            border: '1px solid var(--gray-200)', background: 'var(--white)',
            fontSize: 13, cursor: 'pointer', color: 'var(--green-deepest)',
            fontFamily: 'var(--font-sans)', whiteSpace: 'nowrap'
          }}>Use URL</button>
        </div>
      )}

      {value && (
        <div style={{ marginTop: 10, position: 'relative', display: 'inline-block', width: '100%' }}>
          <img src={value} alt="Preview"
            style={{ width: '100%', maxHeight: 140, objectFit: 'cover', borderRadius: 'var(--radius-md)', border: '1px solid var(--gray-200)' }}
            onError={e => { e.target.style.display = 'none' }} />
          <button type="button" onClick={handleRemove} style={{
            position: 'absolute', top: 6, right: 6, background: '#dc2626',
            color: 'white', border: 'none', borderRadius: '50%',
            width: 22, height: 22, fontSize: 12, cursor: 'pointer',
            display: 'flex', alignItems: 'center', justifyContent: 'center'
          }}>✕</button>
        </div>
      )}
    </div>
  )
}

//Main Component
export default function ResourceDetailPage() {
  const { id }      = useParams()
  const navigate    = useNavigate()
  const { isAdmin } = useAuth()
  const [resource,   setResource]   = useState(null)
  const [loading,    setLoading]    = useState(true)
  const [editing,    setEditing]    = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [form,       setForm]       = useState({})
  const [errors,     setErrors]     = useState({})
  const [touched,    setTouched]    = useState({})
  const [submitted, setSubmitted] = useState(false)

  useEffect(() => {
    resourceApi.getById(id)
      .then(r => { setResource(r.data.data); setForm(r.data.data) })
      .catch(() => toast.error('Resource not found'))
      .finally(() => setLoading(false))
  }, [id])

  
  const handleChange = (field, value) => {
    setForm(prev => ({ ...prev, [field]: value }))
  }

  
  const handleBlur = (field) => {
    setTouched(t => ({ ...t, [field]: true }))
    setErrors(validateForm({ ...form }))
  }

  const handleTimeBlur = () => {
    setTouched(t => ({ ...t, openingTime: true, closingTime: true }))
    setErrors(validateForm({ ...form }))
  }

  const inp = (field) => touched[field] && errors[field] ? inputErr : inputOk

  const handleUpdate = async (e) => {
    e.preventDefault()
    const allTouched = Object.keys(form).reduce((a, k) => ({ ...a, [k]: true }), {})
    setTouched(allTouched)
    const errs = validateForm(form)
    setErrors(errs)
    if (Object.keys(errs).length > 0) return

    setSubmitted(true)
    try {
      const res = await resourceApi.update(id, {
        name: form.name.trim(),
        description: form.description?.trim() || null,
        location: form.location.trim(),
        capacity: form.capacity ? Number(form.capacity) : null,
        status: form.status,
        imageUrl: form.imageUrl || null,
        openingTime: form.openingTime || null,
        closingTime: form.closingTime || null,
      })
      setResource(res.data.data)
      setEditing(false)
      setTouched({})
      setErrors({})
      toast.success('Resource updated successfully!')
    } catch (err) {
      toast.error(getErrorMessage(err))
    } finally {
      setSubmitting(false)
    }
  }

  const handleCancelEdit = () => {
    setEditing(false)
    setForm(resource)
    setErrors({})
    setTouched({})
    setSubmitted(false)
  }

  const handleDelete = async () => {
    if (!confirm('Are you sure you want to delete this resource? This cannot be undone.')) return
    try {
      await resourceApi.delete(id)
      toast.success('Resource deleted')
      navigate('/resources')
    } catch (err) { toast.error(getErrorMessage(err)) }
  }

  const hasErrors = Object.keys(validateForm(form)).length > 0
  const showSummary = submitted && hasErrors

  if (loading) return <p style={{ color: 'var(--gray-400)', fontSize: 14 }}>Loading...</p>
  if (!resource) return <p style={{ color: 'var(--gray-400)', fontSize: 14 }}>Resource not found.</p>

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
            onError={e => { e.target.style.display = 'none' }} />
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
            <form onSubmit={handleUpdate} style={{ display: 'flex', flexDirection: 'column', gap: 12 }} noValidate>

              <div style={rowStyle}>
                <Field label="Name *" error={touched.name && errors.name}>
                  <input style={inp('name')} value={form.name || ''}
                    onChange={e => handleChange('name', e.target.value)}
                    onBlur={() => handleBlur('name')} />
                </Field>
                <Field label="Location *" error={touched.location && errors.location}>
                  <input style={inp('location')} value={form.location || ''}
                    onChange={e => handleChange('location', e.target.value)}
                    onBlur={() => handleBlur('location')} />
                </Field>
              </div>

              <div style={rowStyle}>
                <Field label="Capacity" error={touched.capacity && errors.capacity}>
                  <input style={inp('capacity')} type="number" min="1" value={form.capacity || ''}
                    onChange={e => handleChange('capacity', e.target.value)}
                    onBlur={() => handleBlur('capacity')} />
                </Field>
                <Field label="Status *" error={null}>
                  <select style={inputOk} value={form.status || 'AVAILABLE'}
                    onChange={e => handleChange('status', e.target.value)}>
                    {['AVAILABLE', 'UNAVAILABLE', 'MAINTENANCE', 'RETIRED'].map(s => <option key={s}>{s}</option>)}
                  </select>
                </Field>
              </div>

              <div style={rowStyle}>
                <Field label="Opening Time" error={touched.openingTime && errors.openingTime}>
                  <input style={inp('openingTime')} type="time" value={form.openingTime || ''}
                    onChange={e => handleChange('openingTime', e.target.value)}
                    onBlur={() => handleBlur()} />
                </Field>
                <Field label="Closing Time" error={touched.closingTime && errors.closingTime}>
                  <input style={inp('closingTime')} type="time" value={form.closingTime || ''}
                    onChange={e => handleChange('closingTime', e.target.value)}
                    onBlur={() => handleBlur()} />
                </Field>
              </div>

              <ImageUploader
                value={form.imageUrl || ''}
                onChange={val => handleChange('imageUrl', val)}
              />

              <Field label="Description" error={null}>
                <textarea style={{ ...inputOk, height: 80, resize: 'vertical' }}
                  value={form.description || ''}
                  onChange={e => handleChange('description', e.target.value)} />
              </Field>

              {showSummary && (
                <div style={{ background: '#fff5f5', border: '1px solid #fca5a5', borderRadius: 'var(--radius-md)', padding: '10px 14px' }}>
                  <p style={{ fontSize: 12, color: '#dc2626', fontWeight: 500 }}>
                    ⚠ Please fix the errors above before saving.
                  </p>
                </div>
              )}

              <div style={{ display: 'flex', gap: 10, marginTop: 4 }}>
                <Button type="submit" disabled={submitting}>
                  {submitting ? 'Saving...' : 'Save Changes'}
                </Button>
                <Button variant="outline" type="button" onClick={handleCancelEdit}>Cancel</Button>
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
              ].map(([label, value]) => (
                <div key={label} style={{ display: 'flex', gap: 24 }}>
                  <span style={{ fontSize: 13, color: 'var(--gray-400)', width: 90, flexShrink: 0 }}>{label}</span>
                  <span style={{ fontSize: 14, color: 'var(--green-deepest)' }}>{value}</span>
                </div>
              ))}
            {!isAdmin() && (
              <div style={{ marginTop: 8 }}>
                {resource.status === 'AVAILABLE' ? (
              <Button onClick={() => navigate(`/bookings/new?resourceId=${resource.id}`)}>
                  Book this Resource
              </Button>
            ) : (
              <div style={{
              padding: '10px 16px', borderRadius: 'var(--radius-md)',
              background: '#f9fafb', border: '1px solid var(--gray-200)',
              fontSize: 13, color: 'var(--gray-400)', display: 'inline-block'
            }}>
              {resource.status === 'MAINTENANCE' && 'This resource is under maintenance and cannot be booked'}
              {resource.status === 'UNAVAILABLE' && 'This resource is currently unavailable'}
              {resource.status === 'RETIRED' && 'This resource has been retired'}
            </div>
            )}
            </div>
            )}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}