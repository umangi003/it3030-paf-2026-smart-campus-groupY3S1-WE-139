import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { bookingApi } from '../../api/bookingApi'
import { useAuth } from '../../context/AuthContext'
import StatusBadge from '../../components/common/StatusBadge'
import Button from '../../components/common/Button'
import toast from 'react-hot-toast'
import { formatDateTime, getErrorMessage } from '../../utils/helpers'

export default function BookingListPage() {
  const navigate = useNavigate()
  const { isAdmin } = useAuth()
  const [bookings, setBookings] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => { fetchBookings() }, [])

  const fetchBookings = async () => {
    try {
      const res = isAdmin() ? await bookingApi.getAll() : await bookingApi.getMy()
      setBookings(res.data.data || [])
    } catch { toast.error('Failed to load bookings') }
    finally { setLoading(false) }
  }

  const handleCancel = async (id) => {
    if (!confirm('Cancel this booking?')) return
    try {
      await bookingApi.cancel(id)
      toast.success('Booking cancelled')
      fetchBookings()
    } catch (err) { toast.error(getErrorMessage(err)) }
  }

  const handleGenerateQR = async (id) => {
    try {
      const res = await bookingApi.generateQR(id)
      const token = res.data.data
      navigate(`/bookings/qr/${token}`)
    } catch (err) { toast.error(getErrorMessage(err)) }
  }

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 28 }}>
        <div>
          <h1 style={{ fontSize: 22, fontWeight: 600, letterSpacing: '-0.5px' }}>Bookings</h1>
          <p style={{ fontSize: 14, color: 'var(--gray-600)', marginTop: 2 }}>
            {isAdmin() ? 'All campus bookings' : 'Your reservations'}
          </p>
        </div>
        <Button onClick={() => navigate('/bookings/new')}>+ New Booking</Button>
      </div>

      {loading ? (
        <p style={{ color: 'var(--gray-400)', fontSize: 14 }}>Loading...</p>
      ) : bookings.length === 0 ? (
        <div style={{
          background: 'var(--white)', borderRadius: 'var(--radius-lg)',
          border: '1px solid var(--gray-200)', padding: 48, textAlign: 'center'
        }}>
          <p style={{ color: 'var(--gray-400)', fontSize: 14, marginBottom: 16 }}>No bookings yet</p>
          <Button onClick={() => navigate('/bookings/new')}>Make a Booking</Button>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          {bookings.map(b => (
            <div key={b.id} style={{
              background: 'var(--white)', borderRadius: 'var(--radius-lg)',
              border: '1px solid var(--gray-200)', padding: '18px 20px',
              display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 16
            }}>
              <div style={{ flex: 1 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 6 }}>
                  <h3 style={{ fontSize: 15, fontWeight: 600 }}>{b.resourceName}</h3>
                  <StatusBadge status={b.status} />
                </div>
                <div style={{ display: 'flex', gap: 20, fontSize: 13, color: 'var(--gray-600)' }}>
                  <span>{formatDateTime(b.startTime)}</span>
                  <span>→</span>
                  <span>{formatDateTime(b.endTime)}</span>
                </div>
                {b.purpose && <p style={{ fontSize: 12, color: 'var(--gray-400)', marginTop: 4 }}>{b.purpose}</p>}
              </div>
              <div style={{ display: 'flex', gap: 8, flexShrink: 0 }}>
                {b.status === 'CONFIRMED' && (
                  <>
                    <Button size="sm" variant="outline" onClick={() => handleGenerateQR(b.id)}>QR Code</Button>
                    <Button size="sm" variant="danger" onClick={() => handleCancel(b.id)}>Cancel</Button>
                  </>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
