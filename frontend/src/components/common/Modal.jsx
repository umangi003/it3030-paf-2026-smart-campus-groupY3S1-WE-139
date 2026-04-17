import { useEffect } from 'react'
import ReactDOM from 'react-dom'

export default function Modal({ isOpen, onClose, title, children, width = 480 }) {
  useEffect(() => {
    if (isOpen) document.body.style.overflow = 'hidden'
    else document.body.style.overflow = ''
    return () => { document.body.style.overflow = '' }
  }, [isOpen])

  if (!isOpen) return null

  // Portal renders directly into document.body — escapes overflow:auto parent
  return ReactDOM.createPortal(
    <div
      onClick={onClose}
      style={{
        position: 'fixed', inset: 0,
        background: 'rgba(0,30,43,0.5)',
        zIndex: 9999,
        overflowY: 'auto',
        padding: '84px 24px 24px',  // 60px navbar + 24px breathing room
      }}
    >
      <div style={{ display: 'flex', justifyContent: 'center', minHeight: '100%', alignItems: 'flex-start' }}>
        <div
          onClick={e => e.stopPropagation()}
          style={{
            background: 'var(--white)',
            borderRadius: 'var(--radius-lg)',
            boxShadow: 'var(--shadow-lg)',
            width: '100%', maxWidth: width,
            margin: 'auto 0',
            animation: 'fadeUp 0.18s ease forwards',
          }}
        >
          {/* Header */}
          <div style={{
            display: 'flex', justifyContent: 'space-between', alignItems: 'center',
            padding: '16px 24px', borderBottom: '1px solid var(--gray-100)',
            borderRadius: 'var(--radius-lg) var(--radius-lg) 0 0',
          }}>
            <h3 style={{ fontSize: 16, fontWeight: 600, color: 'var(--green-deepest)' }}>{title}</h3>
            <button onClick={onClose} style={{
              background: 'none', border: 'none', fontSize: 22,
              color: 'var(--gray-400)', cursor: 'pointer', lineHeight: 1,
            }}>×</button>
          </div>

          {/* Body */}
          <div style={{ padding: '20px 24px' }}>{children}</div>
        </div>
      </div>
    </div>,
    document.body
  )
}