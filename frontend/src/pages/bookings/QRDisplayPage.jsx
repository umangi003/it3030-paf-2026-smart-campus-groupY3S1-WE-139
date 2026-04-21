import { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { QRCodeSVG } from 'qrcode.react'
import { bookingApi } from '../../api/bookingApi'
import { formatDateTime } from '../../utils/helpers'

export default function QRDisplayPage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [token, setToken] = useState(null)
  const [booking, setBooking] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    const generate = async () => {
      try {
        // Generate the QR token from the backend
        const tokenRes = await bookingApi.generateQR(id)
        const qrToken = tokenRes.data.data
        setToken(qrToken)

        // Also fetch booking details to show alongside the QR
        const bookingRes = await bookingApi.getById(id)
        setBooking(bookingRes.data.data)
      } catch (err) {
        setError('Failed to generate QR code. Make sure your booking is approved.')
      } finally {
        setLoading(false)
      }
    }
    generate()
  }, [id])

  // The URL that the QR encodes — when scanned, opens the check-in result page
  const checkInUrl = token
    ? `${window.location.origin}/bookings/qr/${token}`
    : null

  if (loading) {
    return (
      <div style={{
        minHeight: '60vh', display: 'flex',
        alignItems: 'center', justifyContent: 'center',
      }}>
        <p style={{ color: 'var(--gray-400)', fontSize: 14 }}>Generating QR code...</p>
      </div>
    )
  }

  if (error) {
    return (
      <div style={{ maxWidth: 480, margin: '60px auto', textAlign: 'center' }}>
        <p style={{ color: '#dc2626', marginBottom: 16 }}>{error}</p>
        <button onClick={() => navigate('/bookings')}
          style={{ color: 'var(--green-mid)', background: 'none', border: 'none', cursor: 'pointer', fontSize: 14 }}>
          ← Back to Bookings
        </button>
      </div>
    )
  }

  return (
    <div style={{ maxWidth: 480, margin: '0 auto' }}>

      {/* Back */}
      <button onClick={() => navigate('/bookings')} style={{
        background: 'none', border: 'none', color: 'var(--gray-400)',
        fontSize: 14, cursor: 'pointer', marginBottom: 20,
      }}>
        ← Back to Bookings
      </button>

      <h1 style={{ fontSize: 22, fontWeight: 600, letterSpacing: '-0.5px', marginBottom: 4 }}>
        Your QR Code
      </h1>
      <p style={{ fontSize: 14, color: 'var(--gray-600)', marginBottom: 24 }}>
        Show this to the guard at the entrance. They will scan it to record your check-in.
      </p>

      <div style={{
        background: 'var(--white)',
        borderRadius: 'var(--radius-lg)',
        border: '1px solid var(--gray-200)',
        padding: 32,
        textAlign: 'center',
      }}>

        {/* QR Code image */}
        <div style={{
          display: 'inline-block',
          padding: 16,
          background: '#fff',
          borderRadius: 12,
          border: '2px solid var(--gray-200)',
          marginBottom: 24,
        }}>
          <QRCodeSVG
            value={checkInUrl}
            size={220}
            fgColor="#001E2B"
            bgColor="#ffffff"
            level="M"
          />
        </div>

        {/* Booking summary */}
        {booking && (
          <div style={{
            background: '#f9fafb',
            borderRadius: 8,
            padding: '16px 20px',
            textAlign: 'left',
          }}>
            <p style={{
              fontSize: 11, fontWeight: 600, letterSpacing: '0.08em',
              color: '#9ca3af', textTransform: 'uppercase', marginBottom: 12,
            }}>
              Booking Details
            </p>
            {[
              ['Resource', booking.resourceName],
              ['Location', booking.resourceLocation],
              ['Start',    formatDateTime(booking.startTime)],
              ['End',      formatDateTime(booking.endTime)],
            ].map(([label, value]) => (
              <div key={label} style={{
                display: 'flex', justifyContent: 'space-between',
                alignItems: 'center', fontSize: 14,
                paddingBottom: 8, marginBottom: 8,
                borderBottom: '1px solid #f3f4f6',
              }}>
                <span style={{ color: '#9ca3af', fontSize: 13 }}>{label}</span>
                <span style={{ fontWeight: 500, color: '#001E2B' }}>{value}</span>
              </div>
            ))}
          </div>
        )}

        {/* Warning about expiry */}
        <p style={{
          fontSize: 12, color: '#b45309',
          marginTop: 20,
          padding: '8px 12px',
          background: '#fffbeb',
          borderRadius: 6,
        }}>
          ⏱ This QR code expires in 15 minutes. Do not share it.
        </p>

        {/* QR link — visible text so the guard/user can also use it manually */}
        {checkInUrl && (
          <div style={{
            marginTop: 16,
            padding: '10px 14px',
            background: '#f3f4f6',
            borderRadius: 6,
            textAlign: 'left',
          }}>
            <p style={{ fontSize: 11, color: '#9ca3af', marginBottom: 4, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.06em' }}>
              Check-in URL
            </p>
            <a
              href={checkInUrl}
              style={{ fontSize: 12, color: 'var(--green-mid)', wordBreak: 'break-all' }}
              target="_blank"
              rel="noopener noreferrer"
            >
              {checkInUrl}
            </a>
          </div>
        )}
      </div>
    </div>
  )
}
