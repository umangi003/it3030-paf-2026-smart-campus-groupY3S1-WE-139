import { useEffect } from 'react'
import ReactDOM from 'react-dom'

export default function Modal({ isOpen, onClose, title, children, width = 500 }) {
  useEffect(() => {
    if (isOpen) document.body.style.overflow = 'hidden'
    else document.body.style.overflow = ''
    return () => { document.body.style.overflow = '' }
  }, [isOpen])

  if (!isOpen) return null

  return ReactDOM.createPortal(
    <div onClick={onClose} style={{
      position: 'fixed', inset: 0,
      background: 'rgba(15, 23, 42, 0.6)',
      backdropFilter: 'blur(4px)',   // ✅ your nice blur
      zIndex: 9999,
      overflowY: 'auto',
      padding: '84px 24px 24px',
    }}>
      <div style={{ display: 'flex', justifyContent: 'center', minHeight: '100%', alignItems: 'flex-start' }}>
        <div onClick={e => e.stopPropagation()} style={{
          background: '#fff',
          borderRadius: '16px',
          boxShadow: '0 25px 50px -12px rgba(0,0,0,0.25)',  // ✅ your deeper shadow
          width: '100%', maxWidth: width,
          margin: 'auto 0',
          animation: 'fadeUp 0.18s ease forwards',
        }}>
          {/* Header */}
          <div style={{
            display: 'flex', justifyContent: 'space-between', alignItems: 'center',
            padding: '20px 24px', borderBottom: '1px solid #f1f5f9',
            position: 'sticky', top: 0, background: '#fff',  // ✅ your sticky header
            borderRadius: '16px 16px 0 0', zIndex: 1,
          }}>
            <h3 style={{ fontSize: 18, fontWeight: 700, color: '#1e293b', margin: 0 }}>{title}</h3>
            <button onClick={onClose} style={{
              background: '#f1f5f9', border: 'none', borderRadius: '50%',
              width: 30, height: 30, cursor: 'pointer', color: '#64748b',  // ✅ your round button
              display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 20
            }}>×</button>
          </div>
          {/* Body */}
          <div style={{ padding: '24px' }}>{children}</div>
        </div>
      </div>
    </div>,
    document.body
  )
}
