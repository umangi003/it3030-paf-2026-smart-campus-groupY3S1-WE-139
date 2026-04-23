import { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import { qrApi } from '../../api/qrApi'
import { formatDateTime } from '../../utils/helpers'


export default function QRCheckInPage() {
  const { token } = useParams()
  const [result, setResult] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    qrApi.verify(token)
      .then(r => setResult(r.data.data))
      .catch(() => setResult({ valid: false, message: 'Could not connect to server. Please try again.' }))
      .finally(() => setLoading(false))
  }, [token])

  if (loading) {
    return (
      <div style={{
        minHeight: '100vh',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        background: '#f9fafb',
      }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{
            width: 40, height: 40,
            border: '3px solid #00ED64',
            borderTopColor: 'transparent',
            borderRadius: '50%',
            animation: 'spin 0.7s linear infinite',
            margin: '0 auto 16px',
          }} />
          <style>{`@keyframes spin { to { transform: rotate(360deg) } }`}</style>
          <p style={{ color: '#6b7280', fontSize: 14 }}>Verifying check-in...</p>
        </div>
      </div>
    )
  }

  const isValid = result?.valid

  return (
    <div style={{
      minHeight: '100vh',
      background: '#f9fafb',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      padding: 24,
    }}>
      <div style={{ width: '100%', maxWidth: 420 }}>

        {/* Logo */}
        <div style={{ textAlign: 'center', marginBottom: 28 }}>
          <h1 style={{ fontSize: 24, fontWeight: 600, color: '#001E2B', letterSpacing: '-0.5px' }}>
            Akade<span style={{ color: '#00684A' }}>mi</span>
          </h1>
          <p style={{ fontSize: 13, color: '#9ca3af', marginTop: 4 }}>QR Check-In</p>
        </div>

        {/* Result card */}
        <div style={{
          background: '#fff',
          borderRadius: 12,
          border: `2px solid ${isValid ? '#86efac' : '#fca5a5'}`,
          padding: 32,
          textAlign: 'center',
        }}>

          {/* Big icon */}
          <div style={{
            width: 72, height: 72, borderRadius: '50%',
            margin: '0 auto 20px',
            background: isValid ? 'rgba(0,200,80,0.1)' : 'rgba(220,38,38,0.1)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: 36,
          }}>
            {isValid ? '✓' : '✕'}
          </div>

          {/* Status heading */}
          <h2 style={{
            fontSize: 20, fontWeight: 600, marginBottom: 8,
            color: isValid ? '#16a34a' : '#dc2626',
          }}>
            {isValid ? 'Check-In Successful' : 'Invalid QR Code'}
          </h2>

          <p style={{ fontSize: 14, color: '#6b7280', marginBottom: 24 }}>
            {result?.message}
          </p>

          {/* Booking details — show for valid check-ins */}
          {result?.resourceName && (
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
                ['Name',     result.userName],
                ['Resource', result.resourceName],
                ['Start',    formatDateTime(result.startTime)],
                ['End',      formatDateTime(result.endTime)],
                result.checkedInAt
                  ? ['Checked In', formatDateTime(result.checkedInAt)]
                  : null,
              ]
                .filter(Boolean)
                .map(([label, value]) => (
                  <div
                    key={label}
                    style={{
                      display: 'flex', justifyContent: 'space-between',
                      alignItems: 'center', fontSize: 14,
                      paddingBottom: 8, marginBottom: 8,
                      borderBottom: '1px solid #f3f4f6',
                    }}
                  >
                    <span style={{ color: '#9ca3af', fontSize: 13 }}>{label}</span>
                    <span style={{ fontWeight: 500, color: '#001E2B' }}>{value}</span>
                  </div>
                ))}
            </div>
          )}
        </div>

        <p style={{ textAlign: 'center', fontSize: 12, color: '#9ca3af', marginTop: 20 }}>
          Smart Campus Operations Hub
        </p>
      </div>
    </div>
  )
}
