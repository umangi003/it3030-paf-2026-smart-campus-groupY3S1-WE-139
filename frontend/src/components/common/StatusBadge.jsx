import { statusColor, statusBg } from '../../utils/helpers'

export default function StatusBadge({ status }) {
  if (!status) return null
  return (
    <span style={{
      display: 'inline-block', padding: '3px 10px',
      borderRadius: 100, fontSize: 12, fontWeight: 500,
      color: statusColor(status), background: statusBg(status),
      fontFamily: 'var(--font-mono)', letterSpacing: '0.02em'
    }}>
      {status.replace(/_/g, ' ')}
    </span>
  )
}
