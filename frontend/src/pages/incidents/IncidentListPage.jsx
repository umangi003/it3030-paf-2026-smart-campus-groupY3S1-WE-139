import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { incidentApi } from '../../api/incidentApi'
import { useAuth } from '../../context/AuthContext'
import StatusBadge from '../../components/common/StatusBadge'
import Button from '../../components/common/Button'
import Modal from '../../components/common/Modal'
import toast from 'react-hot-toast'
import { formatDateTime, getErrorMessage } from '../../utils/helpers'

const EMPTY_FORM = {
  title: '',
  description: '',
  location: '',
  category: '',
  priority: '',
  contactPhone: '',
}

const EMPTY_ERRORS = {
  title: '',
  description: '',
  location: '',
  contactPhone: '',
}

const STATUSES = ['OPEN', 'IN_PROGRESS', 'RESOLVED', 'CLOSED', 'ESCALATED', 'REJECTED']

// Sri Lanka phone: 07X-XXXXXXX (10 digits starting with 07)
const PHONE_REGEX = /^07[0-9]{8}$/

const validateForm = (form) => {
  const errors = { ...EMPTY_ERRORS }
  let valid = true

  if (!form.title.trim()) {
    errors.title = 'Title is required.'
    valid = false
  } else if (form.title.length > 100) {
    errors.title = 'Title must be 100 characters or fewer.'
    valid = false
  }

  if (!form.location.trim()) {
    errors.location = 'Location is required.'
    valid = false
  } else if (form.location.length > 100) {
    errors.location = 'Location must be 100 characters or fewer.'
    valid = false
  }

  if (!form.description.trim()) {
    errors.description = 'Description is required.'
    valid = false
  } else if (form.description.length > 500) {
    errors.description = 'Description must be 500 characters or fewer.'
    valid = false
  }

  if (form.contactPhone.trim() && !PHONE_REGEX.test(form.contactPhone.replace(/\s+/g, ''))) {
    errors.contactPhone = 'Enter a valid Sri Lanka phone number (e.g. 0771234567).'
    valid = false
  }

  return { errors, valid }
}

export default function IncidentListPage() {
  const navigate = useNavigate()
  const { isAdmin } = useAuth()
  const [incidents, setIncidents] = useState([])
  const [loading, setLoading] = useState(true)
  const [showCreate, setShowCreate] = useState(false)
  const [form, setForm] = useState(EMPTY_FORM)
  const [formErrors, setFormErrors] = useState(EMPTY_ERRORS)
  const [imageFiles, setImageFiles] = useState([])
  const [imageError, setImageError] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [showRejectModal, setShowRejectModal] = useState(false)
  const [rejectReason, setRejectReason] = useState('')
  const [rejectingId, setRejectingId] = useState(null)
  const [rejecting, setRejecting] = useState(false)
  const [showDeleteModal, setShowDeleteModal] = useState(false)
  const [deletingId, setDeletingId] = useState(null)
  const [deleting, setDeleting] = useState(false)

  useEffect(() => { fetchIncidents() }, [])

  const fetchIncidents = async () => {
    try {
      const res = isAdmin() ? await incidentApi.getAll() : await incidentApi.getMy()
      setIncidents(res.data.data || [])
    } catch { toast.error('Failed to load incidents') }
    finally { setLoading(false) }
  }

  const handleImageChange = (e) => {
    const selected = Array.from(e.target.files)
    if (selected.length > 3) {
      setImageError('Maximum 3 images allowed.')
      return
    }
    const validTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/gif']
    const invalid = selected.find(f => !validTypes.includes(f.type))
    if (invalid) {
      setImageError('Only image files are allowed (JPG, PNG, WEBP, GIF).')
      return
    }
    setImageError('')
    setImageFiles(selected)
  }

  // Live field update + per-field validation
  const handleFieldChange = (field, value) => {
    setForm(prev => ({ ...prev, [field]: value }))

    // Clear error as user types (re-validate on submit)
    if (formErrors[field]) {
      setFormErrors(prev => ({ ...prev, [field]: '' }))
    }
  }

  const handleCreate = async (e) => {
    e.preventDefault()

    const { errors, valid } = validateForm(form)
    if (!valid) {
      setFormErrors(errors)
      return
    }

    setSubmitting(true)
    try {
      const res = await incidentApi.create(form)
      const newTicket = res.data.data || res.data
      const ticketId = newTicket?.id
      if (imageFiles.length > 0) {
        await incidentApi.uploadAttachments(ticketId, imageFiles)
      }
      setIncidents(prev => [newTicket, ...prev])
      toast.success('Incident reported successfully!')
      setShowCreate(false)
      setForm(EMPTY_FORM)
      setFormErrors(EMPTY_ERRORS)
      setImageFiles([])
      setImageError('')
      const updated = isAdmin() ? await incidentApi.getAll() : await incidentApi.getMy()
      setIncidents(updated.data.data || [])
    } catch (err) {
      toast.error(getErrorMessage(err) || 'Failed to submit incident. Please try again.')
    } finally {
      setSubmitting(false)
    }
  }

  const handleClose = () => {
    setShowCreate(false)
    setForm(EMPTY_FORM)
    setFormErrors(EMPTY_ERRORS)
    setImageFiles([])
    setImageError('')
  }

  const handleStatusChange = async (e, incId, status) => {
    e.stopPropagation()
    if (status === 'REJECTED') {
      setRejectingId(incId)
      setShowRejectModal(true)
      return
    }
    try {
      const res = await incidentApi.updateStatus(incId, status)
      setIncidents(prev => prev.map(i => i.id === incId ? res.data.data : i))
      toast.success('Status updated')
    } catch (err) { toast.error(getErrorMessage(err)) }
  }

  const handleReject = async () => {
    if (!rejectReason.trim()) { toast.error('Please provide a rejection reason'); return }
    setRejecting(true)
    try {
      const res = await incidentApi.reject(rejectingId, rejectReason.trim())
      setIncidents(prev => prev.map(i => i.id === rejectingId ? res.data.data : i))
      toast.success('Incident rejected')
      setShowRejectModal(false)
      setRejectReason('')
      setRejectingId(null)
    } catch (err) { toast.error(getErrorMessage(err)) }
    finally { setRejecting(false) }
  }

  const confirmDelete = (e, incId) => {
    e.stopPropagation()
    setDeletingId(incId)
    setShowDeleteModal(true)
  }

  const handleDelete = async () => {
    setDeleting(true)
    try {
      await incidentApi.deleteIncident(deletingId)
      setIncidents(prev => prev.filter(i => i.id !== deletingId))
      toast.success('Incident deleted')
      setShowDeleteModal(false)
      setDeletingId(null)
    } catch (err) { toast.error(getErrorMessage(err)) }
    finally { setDeleting(false) }
  }

  const priorityStyle = (priority) => ({
    fontSize: 11, fontWeight: 600, padding: '2px 8px',
    borderRadius: 'var(--radius-sm)', textTransform: 'uppercase',
    background: priority === 'CRITICAL' ? '#fee2e2' : priority === 'HIGH' ? '#fef3c7' : priority === 'MEDIUM' ? '#dbeafe' : '#f0fdf4',
    color: priority === 'CRITICAL' ? '#dc2626' : priority === 'HIGH' ? '#d97706' : priority === 'MEDIUM' ? '#2563eb' : '#16a34a',
  })

  const inputStyle = (hasError) => ({
    width: '100%', padding: '9px 12px', borderRadius: 'var(--radius-md)',
    border: `1px solid ${hasError ? '#fca5a5' : 'var(--gray-200)'}`,
    fontSize: 14, outline: 'none',
    fontFamily: 'var(--font-sans)', color: 'var(--green-deepest)',
    boxSizing: 'border-box',
    background: hasError ? '#fff8f8' : undefined,
  })

  const labelStyle = {
    fontSize: 13, fontWeight: 500, color: 'var(--gray-600)',
    display: 'block', marginBottom: 5,
  }

  const fieldStyle = { display: 'flex', flexDirection: 'column' }

  const errorText = (msg) => msg
    ? <p style={{ fontSize: 12, color: '#dc2626', marginTop: 4 }}>{msg}</p>
    : null

  const charCounter = (current, max) => {
    const over = current > max
    return (
      <span style={{ fontSize: 11, color: over ? '#dc2626' : 'var(--gray-400)', marginLeft: 'auto' }}>
        {current}/{max}
      </span>
    )
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
        {!isAdmin() && <Button onClick={() => setShowCreate(true)}>+ Report Incident</Button>}
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
      ) : isAdmin() ? (
        // ── Admin grid card layout ──────────────────────────────────────
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: 16 }}>
          {incidents.map(inc => (
            <div key={inc.id} style={{
              background: 'var(--white)', borderRadius: 'var(--radius-lg)',
              border: '1px solid var(--gray-200)', overflow: 'hidden',
              display: 'flex', flexDirection: 'column',
              transition: 'box-shadow var(--transition), border-color var(--transition)',
              cursor: 'pointer',
            }}
              onMouseOver={e => { e.currentTarget.style.boxShadow = 'var(--shadow-sm)'; e.currentTarget.style.borderColor = 'var(--green-mid)' }}
              onMouseOut={e => { e.currentTarget.style.boxShadow = 'none'; e.currentTarget.style.borderColor = 'var(--gray-200)' }}
            >
              {inc.imageUrls?.length > 0 && (
                <div style={{ display: 'flex', gap: 4, padding: '10px 10px 0' }}>
                  {inc.imageUrls.slice(0, 3).map((url, i) => (
                    <img key={i}
                      src={`http://localhost:8081${url}`}
                      alt={`thumb-${i}`}
                      onClick={e => { e.stopPropagation(); window.open(`http://localhost:8081${url}`, '_blank') }}
                      style={{ width: 64, height: 64, objectFit: 'cover', borderRadius: 8, border: '1px solid var(--gray-200)', cursor: 'zoom-in' }}
                    />
                  ))}
                </div>
              )}

              <div style={{ padding: '14px 16px', flex: 1 }} onClick={() => navigate(`/incidents/${inc.id}`)}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6, flexWrap: 'wrap' }}>
                  <StatusBadge status={inc.status} />
                  {inc.priority && <span style={priorityStyle(inc.priority)}>{inc.priority}</span>}
                  {inc.category && (
                    <span style={{ fontSize: 11, color: 'var(--gray-400)', fontFamily: 'var(--font-mono)' }}>
                      {inc.category}
                    </span>
                  )}
                </div>
                <h3 style={{ fontSize: 15, fontWeight: 600, marginBottom: 6 }}>{inc.title}</h3>
                <p style={{ fontSize: 13, color: 'var(--gray-600)', marginBottom: 8 }}>
                  {inc.description?.slice(0, 80)}{inc.description?.length > 80 ? '...' : ''}
                </p>
                <div style={{ fontSize: 12, color: 'var(--gray-400)', fontFamily: 'var(--font-mono)' }}>
                  <span>📍 {inc.location}</span>
                </div>
                {inc.reportedByName && (
                  <div style={{ fontSize: 12, color: 'var(--gray-400)', marginTop: 4 }}>
                    👤 {inc.reportedByName} · {formatDateTime(inc.createdAt)}
                  </div>
                )}
                {inc.status === 'REJECTED' && inc.rejectionReason && (
                  <div style={{ marginTop: 8, padding: '6px 10px', background: '#fef2f2', borderRadius: 6, fontSize: 12, color: '#dc2626' }}>
                    ❌ {inc.rejectionReason}
                  </div>
                )}
              </div>

              <div style={{ padding: '10px 16px', borderTop: '1px solid var(--gray-100)', display: 'flex', gap: 8 }}
                onClick={e => e.stopPropagation()}>
                <select
                  value={inc.status}
                  onChange={e => handleStatusChange(e, inc.id, e.target.value)}
                  style={{
                    flex: 1, padding: '7px 10px', borderRadius: 'var(--radius-md)',
                    border: '1px solid var(--gray-200)', fontSize: 13,
                    fontFamily: 'var(--font-sans)', cursor: 'pointer', outline: 'none',
                    background: '#f8fafc',
                  }}>
                  {STATUSES.map(s => <option key={s} value={s}>{s.replace('_', ' ')}</option>)}
                </select>
                <button onClick={() => navigate(`/incidents/${inc.id}#comments`)} style={{
                  padding: '7px 12px', borderRadius: 'var(--radius-md)',
                  border: '1px solid var(--gray-200)', background: 'transparent',
                  fontSize: 13, cursor: 'pointer', fontFamily: 'var(--font-sans)',
                  color: 'var(--gray-600)', whiteSpace: 'nowrap'
                }}>💬</button>
                {['CLOSED', 'REJECTED'].includes(inc.status) && (
                  <button onClick={e => confirmDelete(e, inc.id)} style={{
                    padding: '7px 12px', borderRadius: 'var(--radius-md)',
                    border: 'none', background: '#fee2e2', color: '#dc2626',
                    fontSize: 13, cursor: 'pointer', fontFamily: 'var(--font-sans)', whiteSpace: 'nowrap'
                  }}>🗑 Delete</button>
                )}
              </div>
            </div>
          ))}
        </div>
      ) : (
        // ── Student grid card layout ───────────────────────────────────
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: 16 }}>
          {incidents.map(inc => (
            <div key={inc.id} style={{
              background: 'var(--white)', borderRadius: 'var(--radius-lg)',
              border: '1px solid var(--gray-200)', overflow: 'hidden',
              display: 'flex', flexDirection: 'column',
              transition: 'box-shadow var(--transition), border-color var(--transition)',
              cursor: 'pointer',
            }}
              onMouseOver={e => { e.currentTarget.style.boxShadow = 'var(--shadow-sm)'; e.currentTarget.style.borderColor = 'var(--green-mid)' }}
              onMouseOut={e => { e.currentTarget.style.boxShadow = 'none'; e.currentTarget.style.borderColor = 'var(--gray-200)' }}
            >
              {inc.imageUrls?.length > 0 && (
                <div style={{ display: 'flex', gap: 4, padding: '10px 10px 0' }}>
                  {inc.imageUrls.slice(0, 3).map((url, i) => (
                    <img key={i}
                      src={`http://localhost:8081${url}`}
                      alt={`thumb-${i}`}
                      onClick={e => { e.stopPropagation(); window.open(`http://localhost:8081${url}`, '_blank') }}
                      style={{ width: 64, height: 64, objectFit: 'cover', borderRadius: 8, border: '1px solid var(--gray-200)', cursor: 'zoom-in' }}
                    />
                  ))}
                </div>
              )}

              <div style={{ padding: '14px 16px', flex: 1 }} onClick={() => navigate(`/incidents/${inc.id}`)}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6, flexWrap: 'wrap' }}>
                  <StatusBadge status={inc.status} />
                  {inc.priority && <span style={priorityStyle(inc.priority)}>{inc.priority}</span>}
                  {inc.category && (
                    <span style={{ fontSize: 11, color: 'var(--gray-400)', fontFamily: 'var(--font-mono)' }}>
                      {inc.category}
                    </span>
                  )}
                </div>
                <h3 style={{ fontSize: 15, fontWeight: 600, marginBottom: 6 }}>{inc.title}</h3>
                <p style={{ fontSize: 13, color: 'var(--gray-600)', marginBottom: 8 }}>
                  {inc.description?.slice(0, 80)}{inc.description?.length > 80 ? '...' : ''}
                </p>
                <div style={{ fontSize: 12, color: 'var(--gray-400)', fontFamily: 'var(--font-mono)' }}>
                  <span>📍 {inc.location}</span>
                </div>
                <div style={{ fontSize: 12, color: 'var(--gray-400)', marginTop: 4, fontFamily: 'var(--font-mono)' }}>
                  {formatDateTime(inc.createdAt)}
                </div>
                {inc.status === 'REJECTED' && inc.rejectionReason && (
                  <div style={{ marginTop: 8, padding: '6px 10px', background: '#fef2f2', borderRadius: 6, fontSize: 12, color: '#dc2626' }}>
                    ❌ {inc.rejectionReason}
                  </div>
                )}
              </div>

              <div style={{ padding: '10px 16px', borderTop: '1px solid var(--gray-100)', display: 'flex', gap: 8 }}
                onClick={e => e.stopPropagation()}>
                <button onClick={() => navigate(`/incidents/${inc.id}#comments`)} style={{
                  flex: 1, padding: '7px 12px', borderRadius: 'var(--radius-md)',
                  border: '1px solid var(--gray-200)', background: 'transparent',
                  fontSize: 13, cursor: 'pointer', fontFamily: 'var(--font-sans)',
                  color: 'var(--gray-600)'
                }}>💬 Comments</button>
                {['OPEN', 'REJECTED'].includes(inc.status) && (
                  <button onClick={e => confirmDelete(e, inc.id)} style={{
                    padding: '7px 12px', borderRadius: 'var(--radius-md)',
                    border: 'none', background: '#fee2e2', color: '#dc2626',
                    fontSize: 13, cursor: 'pointer', fontFamily: 'var(--font-sans)'
                  }}>🗑 Delete</button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteModal && (
        <div onClick={() => setShowDeleteModal(false)} style={{
          position: 'fixed', inset: 0,
          background: 'rgba(15, 23, 42, 0.6)', backdropFilter: 'blur(4px)',
          zIndex: 9999, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20
        }}>
          <div onClick={e => e.stopPropagation()} style={{
            background: '#fff', borderRadius: 16,
            boxShadow: '0 25px 50px -12px rgba(0,0,0,0.25)',
            width: '100%', maxWidth: 400, padding: 24
          }}>
            <h3 style={{ fontSize: 17, fontWeight: 700, color: '#1e293b', marginBottom: 6 }}>Delete Incident</h3>
            <p style={{ fontSize: 13, color: 'var(--gray-400)', marginBottom: 20 }}>
              Are you sure you want to delete this incident? This action cannot be undone.
            </p>
            <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end' }}>
              <button onClick={() => { setShowDeleteModal(false); setDeletingId(null) }} style={{
                padding: '8px 16px', borderRadius: 8, border: '1px solid var(--gray-200)',
                background: '#fff', fontSize: 13, cursor: 'pointer'
              }}>Cancel</button>
              <button onClick={handleDelete} disabled={deleting} style={{
                padding: '8px 16px', borderRadius: 8, border: 'none',
                background: '#dc2626', color: '#fff', fontSize: 13,
                cursor: deleting ? 'not-allowed' : 'pointer', opacity: deleting ? 0.7 : 1
              }}>{deleting ? 'Deleting...' : 'Yes, Delete'}</button>
            </div>
          </div>
        </div>
      )}

      {/* Reject Modal */}
      {showRejectModal && (
        <div onClick={() => setShowRejectModal(false)} style={{
          position: 'fixed', inset: 0,
          background: 'rgba(15, 23, 42, 0.6)', backdropFilter: 'blur(4px)',
          zIndex: 9999, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20
        }}>
          <div onClick={e => e.stopPropagation()} style={{
            background: '#fff', borderRadius: 16,
            boxShadow: '0 25px 50px -12px rgba(0,0,0,0.25)',
            width: '100%', maxWidth: 440, padding: 24
          }}>
            <h3 style={{ fontSize: 17, fontWeight: 700, color: '#1e293b', marginBottom: 6 }}>Reject Incident</h3>
            <p style={{ fontSize: 13, color: 'var(--gray-400)', marginBottom: 16 }}>
              Please provide a reason. This will be visible to the student.
            </p>
            <textarea
              autoFocus
              value={rejectReason}
              onChange={e => setRejectReason(e.target.value)}
              placeholder="e.g. Duplicate report, insufficient information..."
              style={{
                width: '100%', padding: '10px 12px', borderRadius: 8,
                border: '1px solid var(--gray-200)', fontSize: 14,
                fontFamily: 'var(--font-sans)', resize: 'vertical',
                minHeight: 100, outline: 'none', boxSizing: 'border-box'
              }}
            />
            <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end', marginTop: 16 }}>
              <button onClick={() => { setShowRejectModal(false); setRejectReason(''); setRejectingId(null) }} style={{
                padding: '8px 16px', borderRadius: 8, border: '1px solid var(--gray-200)',
                background: '#fff', fontSize: 13, cursor: 'pointer'
              }}>Cancel</button>
              <button onClick={handleReject} disabled={rejecting} style={{
                padding: '8px 16px', borderRadius: 8, border: 'none',
                background: '#dc2626', color: '#fff', fontSize: 13,
                cursor: rejecting ? 'not-allowed' : 'pointer', opacity: rejecting ? 0.7 : 1
              }}>{rejecting ? 'Rejecting...' : 'Confirm Reject'}</button>
            </div>
          </div>
        </div>
      )}

      {/* Create Modal */}
      <Modal isOpen={showCreate} onClose={handleClose} title="Report Incident">
        <form onSubmit={handleCreate} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>

          {/* Title */}
          <div style={fieldStyle}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 5 }}>
              <label style={{ ...labelStyle, marginBottom: 0 }}>Title *</label>
              {charCounter(form.title.length, 100)}
            </div>
            <input
              style={inputStyle(!!formErrors.title)}
              value={form.title}
              maxLength={100}
              onChange={e => handleFieldChange('title', e.target.value)}
            />
            {errorText(formErrors.title)}
          </div>

          {/* Location */}
          <div style={fieldStyle}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 5 }}>
              <label style={{ ...labelStyle, marginBottom: 0 }}>Location *</label>
              {charCounter(form.location.length, 100)}
            </div>
            <input
              style={inputStyle(!!formErrors.location)}
              value={form.location}
              maxLength={100}
              onChange={e => handleFieldChange('location', e.target.value)}
            />
            {errorText(formErrors.location)}
          </div>

          {/* Category + Priority */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
            <div style={fieldStyle}>
              <label style={labelStyle}>Category *</label>
              <select style={inputStyle(false)} value={form.category}
                onChange={e => setForm(p => ({ ...p, category: e.target.value }))} required>
                <option value="">Select category</option>
                <option value="ELECTRICAL">Electrical</option>
                <option value="HARDWARE">Hardware</option>
                <option value="NETWORK">Network</option>
                <option value="FURNITURE">Furniture</option>
                <option value="PLUMBING">Plumbing</option>
                <option value="SOFTWARE">Software</option>
                <option value="OTHER">Other</option>
              </select>
            </div>
            <div style={fieldStyle}>
              <label style={labelStyle}>Priority *</label>
              <select style={inputStyle(false)} value={form.priority}
                onChange={e => setForm(p => ({ ...p, priority: e.target.value }))} required>
                <option value="">Select priority</option>
                <option value="LOW">Low</option>
                <option value="MEDIUM">Medium</option>
                <option value="HIGH">High</option>
                <option value="CRITICAL">Critical</option>
              </select>
            </div>
          </div>

          {/* Description */}
          <div style={fieldStyle}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 5 }}>
              <label style={{ ...labelStyle, marginBottom: 0 }}>Description *</label>
              {charCounter(form.description.length, 500)}
            </div>
            <textarea
              style={{ ...inputStyle(!!formErrors.description), height: 100, resize: 'vertical' }}
              value={form.description}
              maxLength={500}
              onChange={e => handleFieldChange('description', e.target.value)}
            />
            {errorText(formErrors.description)}
          </div>

          {/* Contact Details */}
          <div style={{ borderTop: '1px solid var(--gray-100)', paddingTop: 14 }}>
            <p style={{ fontSize: 12, fontWeight: 600, color: 'var(--gray-400)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 12 }}>
              Contact Details (optional)
            </p>
            <div style={fieldStyle}>
              <label style={labelStyle}>Contact Phone</label>
              <input
                type="tel"
                style={inputStyle(!!formErrors.contactPhone)}
                placeholder="e.g. 0771234567"
                value={form.contactPhone}
                maxLength={10}
                onChange={e => handleFieldChange('contactPhone', e.target.value)}
              />
              {formErrors.contactPhone
                ? errorText(formErrors.contactPhone)
                : <p style={{ fontSize: 11, color: 'var(--gray-400)', marginTop: 4 }}>Sri Lanka numbers only (07X XXXXXXX)</p>
              }
            </div>
          </div>

          {/* Attachments */}
          <div style={{ borderTop: '1px solid var(--gray-100)', paddingTop: 14 }}>
            <p style={{ fontSize: 12, fontWeight: 600, color: 'var(--gray-400)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 12 }}>
              Attachments (max 3 images)
            </p>
            <input type="file" accept="image/*" multiple onChange={handleImageChange}
              style={{ fontSize: 13, color: 'var(--gray-600)' }} />
            {imageError && (
              <p style={{ color: '#dc2626', fontSize: 12, marginTop: 6 }}>{imageError}</p>
            )}
            {imageFiles.length > 0 && (
              <div style={{ display: 'flex', gap: 8, marginTop: 10, flexWrap: 'wrap' }}>
                {imageFiles.map((f, i) => (
                  <img key={i} src={URL.createObjectURL(f)} alt={`preview-${i}`}
                    style={{ width: 80, height: 80, objectFit: 'cover', borderRadius: 'var(--radius-md)', border: '1px solid var(--gray-200)' }} />
                ))}
              </div>
            )}
          </div>

          <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end', marginTop: 8 }}>
            <Button variant="outline" onClick={handleClose} type="button">Cancel</Button>
            <button type="submit" disabled={submitting} style={{
              padding: '9px 18px', background: 'green', color: 'white',
              border: 'none', borderRadius: 6,
              cursor: submitting ? 'not-allowed' : 'pointer',
              opacity: submitting ? 0.7 : 1,
            }}>
              {submitting ? 'Submitting...' : 'Submit Report'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  )
}
