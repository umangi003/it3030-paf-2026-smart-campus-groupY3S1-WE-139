import { useState, useEffect } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { bookingApi } from '../../api/bookingApi'
import { resourceApi } from '../../api/resourceApi'
import Button from '../../components/common/Button'
import toast from 'react-hot-toast'
import { getErrorMessage } from '../../utils/helpers'

export default function BookingFormPage() {
  const navigate = useNavigate()
  const [params] = useSearchParams()
  const [resources, setResources] = useState([])
  const [loading, setLoading] = useState(false)
  const [errors, setErrors] = useState({})

  const [form, setForm] = useState({
    resourceId: params.get('resourceId') || '',
    startTime: '',
    endTime: '',
    purpose: '',
    attendees: '',
  })

  useEffect(() => {
    resourceApi.getAvailable().then(r => setResources(r.data.data || []))
  }, [])


  const validateField = (field, value, currentForm) => {
    const f = { ...currentForm, [field]: value }
    const now = new Date()

    switch (field) {
      case 'resourceId':
        if (!value) return 'Please select a resource'
        return null

      case 'startTime': {
        if (!value) return 'Start time is required'
        if (new Date(value) <= now) return 'Start time must be in the future'
        return null
      }

      case 'endTime': {
        if (!value) return 'End time is required'
        if (new Date(value) <= now) return 'End time must be in the future'
        if (f.startTime && new Date(value) <= new Date(f.startTime))
          return 'End time must be after start time'
        return null
      }

      case 'attendees':
        if (value !== '' && Number(value) < 1) return 'Attendees must be at least 1'
        return null

      case 'purpose':
        if (value && value.length > 500) return 'Purpose cannot exceed 500 characters'
        return null

      default:
        return null
    }
  }


  const handleChange = (field, value) => {
    const updatedForm = { ...form, [field]: value }
    setForm(updatedForm)

    const fieldError = validateField(field, value, form)
    const newErrors = { ...errors, [field]: fieldError }

    if (field === 'startTime' && updatedForm.endTime) {
      newErrors.endTime = validateField('endTime', updatedForm.endTime, updatedForm)
    }

    setErrors(newErrors)
  }


  const handleSubmit = async (e) => {
    e.preventDefault()

    const fields = ['resourceId', 'startTime', 'endTime', 'attendees', 'purpose']
    const finalErrors = {}
    fields.forEach(field => {
      const err = validateField(field, form[field], form)
      if (err) finalErrors[field] = err
    })

    if (Object.keys(finalErrors).length > 0) {
      setErrors(finalErrors)
      toast.error('Please fix the errors before submitting')
      return
    }

    setLoading(true)
    try {
      await bookingApi.create({
        resourceId: Number(form.resourceId),
        startTime: `${form.startTime}:00`,
        endTime: `${form.endTime}:00`,
        purpose: form.purpose,
        attendees: form.attendees ? Number(form.attendees) : null,
      })
      toast.success('Booking submitted! Waiting for admin approval.')
      navigate('/bookings')
    } catch (err) {
      toast.error(getErrorMessage(err))
    } finally {
      setLoading(false)
    }
  }


  const inputStyle = (field) => ({
    width: '100%',
    padding: '9px 12px',
    borderRadius: 'var(--radius-md)',
    border: `1px solid ${errors[field] ? '#dc2626' : 'var(--gray-200)'}`,
    fontSize: 14,
    outline: 'none',
    fontFamily: 'var(--font-sans)',
    color: 'var(--green-deepest)',
    boxSizing: 'border-box',
    background: 'var(--white)',
  })

  const labelStyle = {
    fontSize: 13,
    fontWeight: 500,
    color: 'var(--gray-600)',
    display: 'block',
    marginBottom: 5,
  }

  const errorStyle = { fontSize: 12, color: '#dc2626', marginTop: 4 }

  const nowMin = new Date(new Date().getTime() - new Date().getTimezoneOffset() * 60000)
    .toISOString()
    .slice(0, 16)

  const durationMinutes =
    form.startTime && form.endTime && !errors.startTime && !errors.endTime
      ? Math.round((new Date(form.endTime) - new Date(form.startTime)) / 60000)
      : null

  const formatDuration = (mins) => {
    if (mins <= 0) return null
    const h = Math.floor(mins / 60)
    const m = mins % 60
    if (h === 0) return `${m} minutes`
    return m === 0 ? `${h} hour${h > 1 ? 's' : ''}` : `${h}h ${m}m`
  }


  return (
    <div style={{ maxWidth: 520, margin: '0 auto' }}>
      <button
        onClick={() => navigate('/bookings')}
        style={{
          background: 'none', border: 'none',
          color: 'var(--gray-400)', fontSize: 14,
          cursor: 'pointer', marginBottom: 20,
        }}
      >
        ← Back to Bookings
      </button>

      <h1 style={{ fontSize: 22, fontWeight: 600, letterSpacing: '-0.5px', marginBottom: 6 }}>
        New Booking
      </h1>
      <p style={{ fontSize: 13, color: 'var(--gray-600)', marginBottom: 24 }}>
        Your request will be reviewed and approved by an admin before it is confirmed.
      </p>

      <div style={{
        background: 'var(--white)',
        borderRadius: 'var(--radius-lg)',
        border: '1px solid var(--gray-200)',
        padding: 28,
      }}>
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>

          {/* Resource */}
          <div>
            <label style={labelStyle}>Resource</label>
            <select
              style={inputStyle('resourceId')}
              value={form.resourceId}
              onChange={e => handleChange('resourceId', e.target.value)}
            >
              <option value="">Select a resource...</option>
              {resources.map(r => (
                <option key={r.id} value={r.id}>
                  {r.name} — {r.location}{r.capacity ? ` (Capacity: ${r.capacity})` : ''}
                </option>
              ))}
            </select>
            {errors.resourceId && <p style={errorStyle}>{errors.resourceId}</p>}
          </div>

          {/* Start and End Time */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
            <div>
              <label style={labelStyle}>Start Time</label>
              <input
                style={inputStyle('startTime')}
                type="datetime-local"
                min={nowMin}
                value={form.startTime}
                onChange={e => handleChange('startTime', e.target.value)}
              />
              {errors.startTime && <p style={errorStyle}>{errors.startTime}</p>}
            </div>
            <div>
              <label style={labelStyle}>End Time</label>
              <input
                style={inputStyle('endTime')}
                type="datetime-local"
                min={form.startTime || nowMin}
                value={form.endTime}
                onChange={e => handleChange('endTime', e.target.value)}
              />
              {errors.endTime && <p style={errorStyle}>{errors.endTime}</p>}
            </div>
          </div>

          {/* Live duration hint */}
          {durationMinutes !== null && durationMinutes > 0 && (
            <p style={{ fontSize: 12, color: 'var(--gray-400)', marginTop: -10 }}>
              Duration: {formatDuration(durationMinutes)}
            </p>
          )}

          {/* Attendees */}
          <div>
            <label style={labelStyle}>
              Expected Attendees{' '}
              <span style={{ color: 'var(--gray-400)', fontWeight: 400 }}>(optional)</span>
            </label>
            <input
              style={inputStyle('attendees')}
              type="number"
              min="1"
              placeholder="How many people will attend?"
              value={form.attendees}
              onChange={e => handleChange('attendees', e.target.value)}
            />
            {errors.attendees && <p style={errorStyle}>{errors.attendees}</p>}
          </div>

          {/* Purpose */}
          <div>
            <label style={labelStyle}>
              Purpose{' '}
              <span style={{ color: 'var(--gray-400)', fontWeight: 400 }}>(optional)</span>
            </label>
            <textarea
              style={{ ...inputStyle('purpose'), height: 80, resize: 'vertical' }}
              placeholder="What will you use this space for?"
              value={form.purpose}
              maxLength={500}
              onChange={e => handleChange('purpose', e.target.value)}
            />
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              {errors.purpose ? <p style={errorStyle}>{errors.purpose}</p> : <span />}
              <p style={{
                fontSize: 11, marginTop: 4,
                color: form.purpose.length >= 480 ? '#b45309' : 'var(--gray-400)',
              }}>
                {form.purpose.length}/500
              </p>
            </div>
          </div>

          <div style={{ display: 'flex', gap: 10, marginTop: 4 }}>
            <Button type="submit" disabled={loading}>
              {loading ? 'Submitting...' : 'Submit Booking Request'}
            </Button>
            <Button variant="outline" type="button" onClick={() => navigate('/bookings')}>
              Cancel
            </Button>
          </div>
        </form>
      </div>
    </div>
  )
}
