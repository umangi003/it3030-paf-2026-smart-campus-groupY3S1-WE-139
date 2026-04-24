export default function Button({
  children, onClick, variant = 'primary', size = 'md',
  disabled = false, type = 'button', style = {}
}) {
  const base = {
    display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
    gap: 6, border: 'none', borderRadius: 'var(--radius-md)',
    fontFamily: 'var(--font-sans)', fontWeight: 500, cursor: disabled ? 'not-allowed' : 'pointer',
    transition: 'all var(--transition)', opacity: disabled ? 0.5 : 1,
    whiteSpace: 'nowrap', ...style
  }

  const sizes = {
    sm: { padding: '6px 12px', fontSize: 13 },
    md: { padding: '9px 18px', fontSize: 14 },
    lg: { padding: '12px 24px', fontSize: 15 },
  }

  const variants = {
    primary: {
      background: 'var(--green-bright)', color: 'var(--green-deepest)',
    },
    secondary: {
      background: 'var(--green-deepest)', color: 'var(--white)',
    },
    outline: {
      background: 'transparent', color: 'var(--green-deepest)',
      border: '1px solid var(--gray-200)'
    },
    danger: {
      background: '#fef2f2', color: '#dc2626',
      border: '1px solid #fecaca'
    },
    ghost: {
      background: 'transparent', color: 'var(--gray-600)', border: 'none'
    }
  }

  return (
    <button
      type={type} onClick={onClick} disabled={disabled}
      style={{ ...base, ...sizes[size], ...variants[variant] }}
    >
      {children}
    </button>
  )
}
