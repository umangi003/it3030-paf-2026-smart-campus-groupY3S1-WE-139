import { getSLAStatus, getTimeRemaining } from '../../utils/slaHelpers'

export default function SLABadge({ sla }) {
  if (!sla) return null
  const status = getSLAStatus(sla)
  const remaining = getTimeRemaining(sla.resolveDueAt)

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
      <span style={{
        display: 'inline-block', padding: '3px 10px', borderRadius: 100,
        fontSize: 12, fontWeight: 500,
        color: status.color, background: status.bg,
        fontFamily: 'var(--font-mono)'
      }}>
        {status.label}
      </span>
      {remaining && (
        <span style={{ fontSize: 11, color: 'var(--gray-400)', fontFamily: 'var(--font-mono)' }}>
          {remaining}
        </span>
      )}
    </div>
  )
}
