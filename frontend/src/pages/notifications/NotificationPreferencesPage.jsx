import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { notificationPrefApi } from '../../api/notificationPrefApi'
import Button from '../../components/common/Button'
import toast from 'react-hot-toast'

const toggleStyle = (checked) => ({
  width: 40, height: 22, borderRadius: 11, border: 'none', cursor: 'pointer',
  background: checked ? 'var(--green-bright)' : 'var(--gray-200)',
  position: 'relative', transition: 'background var(--transition)', flexShrink: 0
})

function Toggle({ checked, onChange }) {
  return (
    <button type="button" onClick={() => onChange(!checked)} style={toggleStyle(checked)}>
      <span style={{
        position: 'absolute', top: 3, left: checked ? 21 : 3,
        width: 16, height: 16, borderRadius: '50%', background: 'var(--white)',
        transition: 'left var(--transition)', boxShadow: '0 1px 3px rgba(0,0,0,0.2)'
      }} />
    </button>
  )
}

const PREFS = [
  { key: 'emailEnabled', label: 'Email Notifications', desc: 'Receive notifications via email' },
  { key: 'pushEnabled', label: 'Push Notifications', desc: 'In-app real-time notifications' },
  { key: 'bookingNotifications', label: 'Booking Updates', desc: 'Confirmations, reminders, cancellations' },
  { key: 'incidentNotifications', label: 'Incident Updates', desc: 'Status changes on your reports' },
  { key: 'slaNotifications', label: 'SLA Alerts', desc: 'Warnings when SLA thresholds are approaching' },
  { key: 'generalNotifications', label: 'General Notices', desc: 'Platform announcements and updates' },
]

export default function NotificationPreferencesPage() {
  const navigate = useNavigate()
  const [prefs, setPrefs] = useState({
    emailEnabled: true, pushEnabled: true, bookingNotifications: true,
    incidentNotifications: true, slaNotifications: true, generalNotifications: true
  })
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    notificationPrefApi.get().then(r => {
      if (r.data.data) setPrefs(r.data.data)
    }).catch(() => {})
  }, [])

  const handleSave = async () => {
    setLoading(true)
    try {
      await notificationPrefApi.update(prefs)
      toast.success('Preferences saved')
    } catch { toast.error('Failed to save') }
    finally { setLoading(false) }
  }

  return (
    <div style={{ maxWidth: 520 }}>
      <button onClick={() => navigate('/notifications')} style={{
        background: 'none', border: 'none', color: 'var(--gray-400)',
        fontSize: 14, cursor: 'pointer', marginBottom: 20
      }}>← Back to Notifications</button>

      <h1 style={{ fontSize: 22, fontWeight: 600, letterSpacing: '-0.5px', marginBottom: 24 }}>Notification Preferences</h1>

      <div style={{ background: 'var(--white)', borderRadius: 'var(--radius-lg)', border: '1px solid var(--gray-200)', overflow: 'hidden' }}>
        {PREFS.map((p, i) => (
          <div key={p.key} style={{
            display: 'flex', justifyContent: 'space-between', alignItems: 'center',
            padding: '18px 20px',
            borderBottom: i < PREFS.length - 1 ? '1px solid var(--gray-100)' : 'none'
          }}>
            <div>
              <p style={{ fontSize: 14, fontWeight: 500 }}>{p.label}</p>
              <p style={{ fontSize: 12, color: 'var(--gray-400)', marginTop: 2 }}>{p.desc}</p>
            </div>
            <Toggle checked={prefs[p.key]} onChange={v => setPrefs(prev => ({ ...prev, [p.key]: v }))} />
          </div>
        ))}
      </div>

      <div style={{ marginTop: 20, display: 'flex', gap: 10 }}>
        <Button onClick={handleSave} disabled={loading}>{loading ? 'Saving...' : 'Save Preferences'}</Button>
        <Button variant="outline" onClick={() => navigate('/notifications')}>Cancel</Button>
      </div>
    </div>
  )
}
