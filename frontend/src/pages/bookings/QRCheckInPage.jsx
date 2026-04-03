import { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { qrApi } from '../../api/qrApi'
import { formatDateTime } from '../../utils/helpers'
import { QRCodeSVG } from 'qrcode.react'
import Button from '../../components/common/Button'

export default function QRCheckInPage() {
  const { token } = useParams()
  const navigate = useNavigate()
  const [result, setResult] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    qrApi.verify(token)
      .then(r => setResult(r.data.data))
      .catch(() => setResult({ valid: false, message: 'Invalid QR token' }))
      .finally(() => setLoading(false))
  }, [token])

  if (loading) return (
    <div style={{ display: 'flex', justifyContent: 'center', paddingTop: 80 }}>
      <p style={{ color: 'var(--gray-400)', fontSize: 14 }}>Verifying...</p>
    </div>
  )

  return (
    <div style={{ maxWidth: 420, margin: '0 auto', textAlign: 'center' }}>
      <h1 style={{ fontSize: 22, fontWeight: 600, letterSpacing: '-0.5px', marginBottom: 28 }}>QR Check-In</h1>

      <div style={{
        background: 'var(--white)', borderRadius: 'var(--radius-lg)',
        border: `2px solid ${result?.valid ? 'var(--green-bright)' : '#fca5a5'}`,
        padding: 32
      }}>
        {/* Status indicator */}
        <div style={{
          width: 64, height: 64, borderRadius: '50%', margin: '0 auto 20px',
          background: result?.valid ? 'rgba(0,237,100,0.1)' : 'rgba(220,38,38,0.1)',
          display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 28
        }}>
          {result?.valid ? '✓' : '✕'}
        </div>

        <h2 style={{
          fontSize: 18, fontWeight: 600, marginBottom: 8,
          color: result?.valid ? 'var(--green-mid)' : '#dc2626'
        }}>
          {result?.valid ? 'Check-In Successful' : 'Invalid QR Code'}
        </h2>
        <p style={{ fontSize: 14, color: 'var(--gray-600)', marginBottom: 24 }}>{result?.message}</p>

        {result?.valid && (
          <>
            <div style={{ marginBottom: 24, display: 'flex', justifyContent: 'center' }}>
              <QRCodeSVG value={token} size={140} fgColor="var(--green-deepest)" />
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10, textAlign: 'left' }}>
              {[
                ['User', result.userName],
                ['Resource', result.resourceName],
                ['Start', formatDateTime(result.startTime)],
                ['End', formatDateTime(result.endTime)],
              ].map(([label, value]) => (
                <div key={label} style={{ display: 'flex', justifyContent: 'space-between', fontSize: 14 }}>
                  <span style={{ color: 'var(--gray-400)' }}>{label}</span>
                  <span style={{ fontWeight: 500 }}>{value}</span>
                </div>
              ))}
            </div>
          </>
        )}
      </div>

      <div style={{ marginTop: 20 }}>
        <Button variant="outline" onClick={() => navigate('/bookings')}>Back to Bookings</Button>
      </div>
    </div>
  )
}
