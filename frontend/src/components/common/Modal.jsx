import { useEffect } from 'react'

export default function Modal({ isOpen, onClose, title, children, width = 500 }) {
  useEffect(() => {
    return () => { document.body.style.overflow = '' }
  }, [isOpen])

  if (!isOpen) return null

  return (
    <div onClick={onClose} style={{
      position: 'fixed', inset: 0,
      background: 'rgba(15, 23, 42, 0.6)',
      backdropFilter: 'blur(4px)',
      zIndex: 9999,
      overflowY: 'auto',
    }}>
      <div style={{
        minHeight: '100%',
        display: 'flex', alignItems: 'flex-start', justifyContent: 'center',
        padding: '40px 20px',
      }}>
        <div onClick={e => e.stopPropagation()} style={{
          background: '#fff',
          borderRadius: '16px',
          boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
          width: '100%', maxWidth: width,
          display: 'flex', flexDirection: 'column',
        }}>
          {/* Header */}
          <div style={{
            display: 'flex', justifyContent: 'space-between', alignItems: 'center',
            padding: '20px 24px', borderBottom: '1px solid #f1f5f9',
            position: 'sticky', top: 0, background: '#fff', borderRadius: '16px 16px 0 0', zIndex: 1,
          }}>
            <h3 style={{ fontSize: 18, fontWeight: 700, color: '#1e293b', margin: 0 }}>{title}</h3>
            <button onClick={onClose} style={{
              background: '#f1f5f9', border: 'none', borderRadius: '50%',
              width: 30, height: 30, cursor: 'pointer', color: '#64748b',
              display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 20
            }}>×</button>
          </div>
          {/* Body */}
          <div style={{ padding: '24px' }}>{children}</div>
        </div>
      </div>
    </div>
  )
}
