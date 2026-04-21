import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { notificationApi } from '../../api/notificationApi'
import Button from '../../components/common/Button'
import toast from 'react-hot-toast'
import { formatDateTime } from '../../utils/helpers'

const categoryColors = {
  BOOKING_CONFIRMED: '#00684A', BOOKING_CANCELLED: '#dc2626',
  BOOKING_REMINDER: '#b45309', INCIDENT_CREATED: '#dc2626',
  INCIDENT_UPDATED: '#b45309', INCIDENT_RESOLVED: '#00684A',
  SLA_WARNING: '#b45309', SLA_BREACH: '#dc2626', GENERAL: '#374151'
}

export default function NotificationsPage() {
  const navigate = useNavigate()
  const [notifications, setNotifications] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => { fetchNotifications() }, [])

  const fetchNotifications = async () => {
    try {
      const res = await notificationApi.getAll()
      setNotifications(res.data.data || [])
    } catch { toast.error('Failed to load notifications') }
    finally { setLoading(false) }
  }

  const markRead = async (id) => {
    await notificationApi.markAsRead(id)
    setNotifications(prev => prev.map(n => n.id === id ? { ...n, read: true } : n))
    window.dispatchEvent(new CustomEvent('notifications-read'))
  }

  const markAllRead = async () => {
    await notificationApi.markAllAsRead()
    setNotifications(prev => prev.map(n => ({ ...n, read: true })))
    toast.success('All marked as read')
    window.dispatchEvent(new CustomEvent('notifications-read'))
  }

  const unreadCount = notifications.filter(n => !n.read).length

  return (
    <div style={{ maxWidth: 640 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 28 }}>
        <div>
          <h1 style={{ fontSize: 22, fontWeight: 600, letterSpacing: '-0.5px' }}>Notifications</h1>
          <p style={{ fontSize: 14, color: 'var(--gray-600)', marginTop: 2 }}>
            {unreadCount > 0 ? `${unreadCount} unread` : 'All caught up'}
          </p>
        </div>
        <div style={{ display: 'flex', gap: 10 }}>
          {unreadCount > 0 && <Button variant="outline" size="sm" onClick={markAllRead}>Mark all read</Button>}
          <Button variant="outline" size="sm" onClick={() => navigate('/notifications/preferences')}>Preferences</Button>
        </div>
      </div>

      {loading ? (
        <p style={{ color: 'var(--gray-400)', fontSize: 14 }}>Loading...</p>
      ) : notifications.length === 0 ? (
        <div style={{
          background: 'var(--white)', borderRadius: 'var(--radius-lg)',
          border: '1px solid var(--gray-200)', padding: 48, textAlign: 'center'
        }}>
          <p style={{ color: 'var(--gray-400)', fontSize: 14 }}>No notifications yet</p>
        </div>
      ) : (
        <div style={{ background: 'var(--white)', borderRadius: 'var(--radius-lg)', border: '1px solid var(--gray-200)', overflow: 'hidden' }}>
          {notifications.map((n, i) => (
            <div key={n.id} onClick={() => !n.read && markRead(n.id)} style={{
              padding: '16px 20px', cursor: n.read ? 'default' : 'pointer',
              background: n.read ? 'transparent' : 'rgba(0,237,100,0.03)',
              borderBottom: i < notifications.length - 1 ? '1px solid var(--gray-100)' : 'none',
              transition: 'background var(--transition)',
              display: 'flex', gap: 14, alignItems: 'flex-start'
            }}>
              {/* Dot */}
              <div style={{
                width: 8, height: 8, borderRadius: '50%', marginTop: 5, flexShrink: 0,
                background: n.read ? 'var(--gray-200)' : (categoryColors[n.category] || 'var(--green-bright)')
              }} />
              <div style={{ flex: 1 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 4 }}>
                  <p style={{ fontSize: 14, fontWeight: n.read ? 400 : 600 }}>{n.title}</p>
                  <span style={{ fontSize: 11, color: 'var(--gray-400)', fontFamily: 'var(--font-mono)', flexShrink: 0, marginLeft: 12 }}>
                    {formatDateTime(n.createdAt)}
                  </span>
                </div>
                <p style={{ fontSize: 13, color: 'var(--gray-600)', lineHeight: 1.5 }}>{n.message}</p>
                <span style={{
                  display: 'inline-block', marginTop: 6, fontSize: 11, padding: '2px 8px',
                  borderRadius: 100, background: 'var(--gray-100)', color: 'var(--gray-600)',
                  fontFamily: 'var(--font-mono)'
                }}>
                  {n.category?.replace(/_/g, ' ')}
                </span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
