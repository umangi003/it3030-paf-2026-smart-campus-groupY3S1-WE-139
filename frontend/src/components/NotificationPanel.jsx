import { useEffect, useState } from 'react'
import { notificationApi } from '../api/notificationApi'
import { formatDateTime } from '../utils/helpers'

export default function NotificationPanel({ onClose }) {
  const [notifications, setNotifications] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    notificationApi.getAll()
      .then(r => setNotifications(r.data.data || []))
      .finally(() => setLoading(false))
  }, [])

  const markRead = async (id) => {
    await notificationApi.markAsRead(id)
    setNotifications(prev => prev.map(n => n.id === id ? { ...n, read: true } : n))
  }

  return (
    <div style={{
      position: 'fixed', top: 60, right: 24, width: 360,
      background: 'var(--white)', borderRadius: 'var(--radius-lg)',
      boxShadow: 'var(--shadow-lg)', border: '1px solid var(--gray-200)',
      zIndex: 1000, maxHeight: 480, display: 'flex', flexDirection: 'column'
    }}>
      <div style={{
        padding: '16px 20px', borderBottom: '1px solid var(--gray-100)',
        display: 'flex', justifyContent: 'space-between', alignItems: 'center'
      }}>
        <p style={{ fontWeight: 600, fontSize: 14 }}>Notifications</p>
        <button onClick={onClose} style={{
          background: 'none', border: 'none', fontSize: 18,
          color: 'var(--gray-400)', lineHeight: 1
        }}>×</button>
      </div>
      <div style={{ overflowY: 'auto', flex: 1 }}>
        {loading ? (
          <p style={{ padding: 20, color: 'var(--gray-400)', fontSize: 14 }}>Loading...</p>
        ) : notifications.length === 0 ? (
          <p style={{ padding: 20, color: 'var(--gray-400)', fontSize: 14 }}>No notifications</p>
        ) : notifications.map(n => (
          <div key={n.id} onClick={() => !n.read && markRead(n.id)} style={{
            padding: '14px 20px', borderBottom: '1px solid var(--gray-100)',
            background: n.read ? 'transparent' : 'rgba(0,237,100,0.04)',
            cursor: n.read ? 'default' : 'pointer', transition: 'background var(--transition)'
          }}>
            <div style={{ display: 'flex', gap: 10, alignItems: 'flex-start' }}>
              {!n.read && <span style={{
                width: 6, height: 6, borderRadius: '50%',
                background: 'var(--green-bright)', flexShrink: 0, marginTop: 5
              }} />}
              <div style={{ marginLeft: n.read ? 16 : 0 }}>
                <p style={{ fontSize: 13, fontWeight: 500, marginBottom: 2 }}>{n.title}</p>
                <p style={{ fontSize: 12, color: 'var(--gray-600)', marginBottom: 4 }}>{n.message}</p>
                <p style={{ fontSize: 11, color: 'var(--gray-400)', fontFamily: 'var(--font-mono)' }}>
                  {formatDateTime(n.createdAt)}
                </p>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
