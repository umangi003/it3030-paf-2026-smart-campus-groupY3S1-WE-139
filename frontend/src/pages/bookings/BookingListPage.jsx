import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { bookingApi } from '../../api/bookingApi'
import { useAuth } from '../../context/AuthContext'
import StatusBadge from '../../components/common/StatusBadge'
import Button from '../../components/common/Button'
import Modal from '../../components/common/Modal'
import toast from 'react-hot-toast'
import { formatDateTime, getErrorMessage } from '../../utils/helpers'

// Fix 3: status filter options for admin
const STATUS_FILTERS = ['ALL', 'PENDING', 'APPROVED', 'REJECTED', 'CANCELLED', 'COMPLETED']

export default function BookingListPage() {
  const navigate = useNavigate()
  const { isAdmin } = useAuth()
  const [bookings, setBookings] = useState([])
  const [loading, setLoading] = useState(true)
  const [statusFilter, setStatusFilter] = useState('ALL')       // Fix 3
  const [rejectModal, setRejectModal] = useState({ open: false, bookingId: null })  // Fix 2
  const [rejectReason, setRejectReason] = useState('')           // Fix 2
  const [actionLoading, setActionLoading] = useState(false)

  // Fix 3: re-fetch whenever the status filter changes
  useEffect(() => { fetchBookings() }, [statusFilter])

  const fetchBookings = async () => {
    setLoading(true)
    try {
      const filter = statusFilter === 'ALL' ? null : statusFilter
      // Fix 3: pass status filter to backend
      const res = isAdmin()
        ? await bookingApi.getAll(filter)
        : await bookingApi.getMy()
      setBookings(res.data.data || [])
    } catch {
      toast.error('Failed to load bookings')
    } finally {
      setLoading(false)
    }
  }

  // Fix 7: cancel only works on APPROVED — the backend also enforces this
  const handleCancel = async (id) => {
    if (!confirm('Cancel this booking?')) return
    try {
      await bookingApi.cancel(id)
      toast.success('Booking cancelled')
      fetchBookings()
    } catch (err) {
      toast.error(getErrorMessage(err))
    }
  }

  // Fix 2: admin approve
  const handleApprove = async (id) => {
    setActionLoading(true)
    try {
      await bookingApi.approve(id)
      toast.success('Booking approved — user has been notified')
      fetchBookings()
    } catch (err) {
      toast.error(getErrorMessage(err))
    } finally {
      setActionLoading(false)
    }
  }

  // Fix 2: admin reject — opens modal first to get reason
  const openRejectModal = (id) => {
    setRejectReason('')
    setRejectModal({ open: true, bookingId: id })
  }

  const handleReject = async () => {
    if (!rejectReason.trim()) {
      toast.error('Please provide a reason for rejection')
      return
    }
    setActionLoading(true)
    try {
      await bookingApi.reject(rejectModal.bookingId, rejectReason)
      toast.success('Booking rejected — user has been notified')
      setRejectModal({ open: false, bookingId: null })
      fetchBookings()
    } catch (err) {
      toast.error(getErrorMessage(err))
    } finally {
      setActionLoading(false)
    }
  }

  // Navigate to the QR display page — the token is generated there
  const handleGenerateQR = (id) => {
    navigate(`/bookings/qr-display/${id}`)
  }

  const inputStyle = {
    width: '100%', padding: '9px 12px', borderRadius: 'var(--radius-md)',
    border: '1px solid var(--gray-200)', fontSize: 14, outline: 'none',
    fontFamily: 'var(--font-sans)', color: 'var(--green-deepest)', boxSizing: 'border-box',
  }

  return (
    <div>

      {/* ── Header ─────────────────────────────────────────────────────────── */}
      <div style={{
        display: 'flex', justifyContent: 'space-between',
        alignItems: 'flex-start', marginBottom: 24,
      }}>
        <div>
          <h1 style={{ fontSize: 22, fontWeight: 600, letterSpacing: '-0.5px' }}>Bookings</h1>
          <p style={{ fontSize: 14, color: 'var(--gray-600)', marginTop: 2 }}>
            {isAdmin()
              ? 'All campus bookings — approve or reject pending requests'
              : 'Your booking requests'}
          </p>
        </div>
        {/* Admin does not need a "New Booking" button */}
        {!isAdmin() && (
          <Button onClick={() => navigate('/bookings/new')}>+ New Booking</Button>
        )}
      </div>

      {/* ── Fix 3: Admin status filter tabs ────────────────────────────────── */}
      {isAdmin() && (
        <div style={{ display: 'flex', gap: 8, marginBottom: 20, flexWrap: 'wrap' }}>
          {STATUS_FILTERS.map(s => (
            <button
              key={s}
              onClick={() => setStatusFilter(s)}
              style={{
                padding: '6px 14px', borderRadius: 20, fontSize: 13, fontWeight: 500,
                border: `1.5px solid ${statusFilter === s ? 'var(--green-mid)' : 'var(--gray-200)'}`,
                background: statusFilter === s ? 'rgba(0,104,74,0.07)' : 'var(--white)',
                color: statusFilter === s ? 'var(--green-mid)' : 'var(--gray-600)',
                cursor: 'pointer', transition: 'all 0.15s',
              }}
            >
              {s === 'ALL' ? 'All' : s.charAt(0) + s.slice(1).toLowerCase()}
            </button>
          ))}
        </div>
      )}

      {/* ── Booking list ────────────────────────────────────────────────────── */}
      {loading ? (
        <p style={{ color: 'var(--gray-400)', fontSize: 14 }}>Loading...</p>
      ) : bookings.length === 0 ? (
        <div style={{
          background: 'var(--white)', borderRadius: 'var(--radius-lg)',
          border: '1px solid var(--gray-200)', padding: 48, textAlign: 'center',
        }}>
          <p style={{ color: 'var(--gray-400)', fontSize: 14, marginBottom: 16 }}>
            No bookings found
          </p>
          {!isAdmin() && (
            <Button onClick={() => navigate('/bookings/new')}>Make a Booking</Button>
          )}
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          {bookings.map(b => (
            <div
              key={b.id}
              style={{
                background: 'var(--white)',
                borderRadius: 'var(--radius-lg)',
                // Highlight pending bookings with a yellow border so admin notices them
                border: `1px solid ${b.status === 'PENDING' ? '#fde68a' : 'var(--gray-200)'}`,
                padding: '18px 20px',
                display: 'flex', alignItems: 'center',
                justifyContent: 'space-between', gap: 16,
              }}
            >
              {/* ── Info section ──────────────────────────────────────────── */}
              <div style={{ flex: 1, minWidth: 0 }}>

                <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 6 }}>
                  {/* Fix 8: b.resourceName now works because backend returns BookingResponse DTO */}
                  <h3 style={{ fontSize: 15, fontWeight: 600 }}>{b.resourceName}</h3>
                  <StatusBadge status={b.status} />
                </div>

                {/* Show requester name to admin */}
                {isAdmin() && (
                  <p style={{ fontSize: 12, color: 'var(--gray-500)', marginBottom: 4 }}>
                    Requested by: <strong>{b.userName}</strong>
                  </p>
                )}

                <div style={{ display: 'flex', gap: 20, fontSize: 13, color: 'var(--gray-600)' }}>
                  <span>{formatDateTime(b.startTime)}</span>
                  <span>→</span>
                  <span>{formatDateTime(b.endTime)}</span>
                </div>

                {/* Fix 4: show attendees if provided */}
                {b.attendees && (
                  <p style={{ fontSize: 12, color: 'var(--gray-400)', marginTop: 4 }}>
                    👥 {b.attendees} attendee{b.attendees !== 1 ? 's' : ''}
                  </p>
                )}

                {b.purpose && (
                  <p style={{ fontSize: 12, color: 'var(--gray-400)', marginTop: 4 }}>
                    {b.purpose}
                  </p>
                )}

                {/* Fix 2: show rejection reason on rejected bookings */}
                {b.status === 'REJECTED' && b.rejectionReason && (
                  <p style={{
                    fontSize: 12, color: '#dc2626', marginTop: 6,
                    padding: '6px 10px', background: '#fef2f2', borderRadius: 6,
                  }}>
                    Reason: {b.rejectionReason}
                  </p>
                )}

                {/* Fix 1: tell user their booking is pending */}
                {b.status === 'PENDING' && !isAdmin() && (
                  <p style={{ fontSize: 12, color: '#b45309', marginTop: 6 }}>
                    Awaiting admin approval
                  </p>
                )}

                {/* Show check-in time if they have checked in */}
                {b.checkedInAt && (
                  <p style={{ fontSize: 12, color: 'var(--green-mid)', marginTop: 4 }}>
                    ✓ Checked in at {formatDateTime(b.checkedInAt)}
                  </p>
                )}
              </div>

              {/* ── Action buttons ────────────────────────────────────────── */}
              <div style={{
                display: 'flex', gap: 8, flexShrink: 0,
                flexWrap: 'wrap', justifyContent: 'flex-end',
              }}>

                {/* Fix 2: admin sees Approve/Reject only on PENDING bookings */}
                {isAdmin() && b.status === 'PENDING' && (
                  <>
                    <Button
                      size="sm"
                      onClick={() => handleApprove(b.id)}
                      disabled={actionLoading}
                    >
                      Approve
                    </Button>
                    <Button
                      size="sm"
                      variant="danger"
                      onClick={() => openRejectModal(b.id)}
                      disabled={actionLoading}
                    >
                      Reject
                    </Button>
                  </>
                )}

                {/* Fix 7: QR only for APPROVED (not CONFIRMED) */}
                {!isAdmin() && b.status === 'APPROVED' && (
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => handleGenerateQR(b.id)}
                  >
                    Get QR Code
                  </Button>
                )}

                {/* Fix 7: Cancel only for APPROVED */}
                {!isAdmin() && b.status === 'APPROVED' && (
                  <Button
                    size="sm"
                    variant="danger"
                    onClick={() => handleCancel(b.id)}
                  >
                    Cancel
                  </Button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* ── Fix 2: Reject reason modal ──────────────────────────────────────── */}
      <Modal
        isOpen={rejectModal.open}
        onClose={() => setRejectModal({ open: false, bookingId: null })}
        title="Reject Booking"
      >
        <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          <p style={{ fontSize: 14, color: 'var(--gray-600)' }}>
            Please provide a reason. The student will be notified with this message.
          </p>
          <div>
            <label style={{ fontSize: 13, fontWeight: 500, color: 'var(--gray-600)', display: 'block', marginBottom: 6 }}>
              Rejection Reason
            </label>
            <textarea
              style={{ ...inputStyle, height: 100, resize: 'vertical' }}
              placeholder="e.g. Room is unavailable for maintenance that day..."
              value={rejectReason}
              onChange={e => setRejectReason(e.target.value)}
            />
          </div>
          <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end' }}>
            <Button
              variant="outline"
              onClick={() => setRejectModal({ open: false, bookingId: null })}
            >
              Cancel
            </Button>
            <Button
              variant="danger"
              onClick={handleReject}
              disabled={actionLoading || !rejectReason.trim()}
            >
              {actionLoading ? 'Rejecting...' : 'Confirm Reject'}
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  )
}
