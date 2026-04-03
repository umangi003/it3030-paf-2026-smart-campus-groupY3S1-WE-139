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
  const [form, setForm] = useState({
    resourceId: params.get('resourceId') || '',
    startTime: '', endTime: '', purpose: ''
  })

  useEffect(() => {
    resourceApi.getAvailable().then(r => setResources(r.data.data || []))
  }, [])

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    try {
      await bookingApi.create({
        ...form,
        resourceId: Number(form.resourceId),
        startTime: new Date(form.startTime).toISOString(),
        endTime: new Date(form.endTime).toISOString(),
      })
      toast.success('Booking confirmed!')
      navigate('/bookings')
    } catch (err) { toast.error(getErrorMessage(err)) }
    finally { setLoading(false) }
  }

  const inputStyle = {
    width: '100%', padding: '9px 12px', borderRadius: 'var(--radius-md)',
    border: '1px solid var(--gray-200)', fontSize: 14, outline: 'none',
    fontFamily: 'var(--font-sans)', color: 'var(--green-deepest)'
  }
  const labelStyle = { fontSize: 13, fontWeight: 500, color: 'var(--gray-600)', display: 'block', marginBottom: 5 }

  return (
    <div style={{ maxWidth: 520 }}>
      <button onClick={() => navigate('/bookings')} style={{
        background: 'none', border: 'none', color: 'var(--gray-400)',
        fontSize: 14, cursor: 'pointer', marginBottom: 20
      }}>← Back to Bookings</button>

      <h1 style={{ fontSize: 22, fontWeight: 600, letterSpacing: '-0.5px', marginBottom: 24 }}>New Booking</h1>

      <div style={{ background: 'var(--white)', borderRadius: 'var(--radius-lg)', border: '1px solid var(--gray-200)', padding: 28 }}>
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
          <div>
            <label style={labelStyle}>Resource</label>
            <select style={inputStyle} value={form.resourceId}
              onChange={e => setForm(p => ({ ...p, resourceId: e.target.value }))} required>
              <option value="">Select a resource...</option>
              {resources.map(r => <option key={r.id} value={r.id}>{r.name} — {r.location}</option>)}
            </select>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
            <div>
              <label style={labelStyle}>Start Time</label>
              <input style={inputStyle} type="datetime-local" value={form.startTime}
                onChange={e => setForm(p => ({ ...p, startTime: e.target.value }))} required />
            </div>
            <div>
              <label style={labelStyle}>End Time</label>
              <input style={inputStyle} type="datetime-local" value={form.endTime}
                onChange={e => setForm(p => ({ ...p, endTime: e.target.value }))} required />
            </div>
          </div>
          <div>
            <label style={labelStyle}>Purpose <span style={{ color: 'var(--gray-400)' }}>(optional)</span></label>
            <textarea style={{ ...inputStyle, height: 80, resize: 'vertical' }}
              placeholder="What will you use this space for?"
              value={form.purpose} onChange={e => setForm(p => ({ ...p, purpose: e.target.value }))} />
          </div>
          <div style={{ display: 'flex', gap: 10, marginTop: 4 }}>
            <Button type="submit" disabled={loading}>{loading ? 'Booking...' : 'Confirm Booking'}</Button>
            <Button variant="outline" onClick={() => navigate('/bookings')}>Cancel</Button>
          </div>
        </form>
      </div>
    </div>
  )
}
