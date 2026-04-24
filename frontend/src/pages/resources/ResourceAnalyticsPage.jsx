import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { analyticsApi } from '../../api/analyticsApi'
import toast from 'react-hot-toast'

function BarChart({ data, valueKey, labelKey, color = 'var(--green-mid)', maxBars = 10 }) {
  if (!data || data.length === 0) {
    return <p style={{ fontSize: 13, color: 'var(--gray-400)' }}>No data available yet.</p>
  }
  const max = Math.max(...data.map(d => d[valueKey]))
  const shown = data.slice(0, maxBars)

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
      {shown.map((item, i) => (
        <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <span style={{
            fontSize: 12, color: 'var(--gray-500)', width: 72,
            flexShrink: 0, textAlign: 'right', fontFamily: 'var(--font-mono)'
          }}>
            {item[labelKey]}
          </span>
          <div style={{ flex: 1, background: 'var(--gray-100)', borderRadius: 4, height: 22, overflow: 'hidden' }}>
            <div style={{
              width: `${max > 0 ? (item[valueKey] / max) * 100 : 0}%`,
              height: '100%', background: color,
              borderRadius: 4, minWidth: item[valueKey] > 0 ? 4 : 0,
              transition: 'width 0.6s ease',
              display: 'flex', alignItems: 'center', paddingLeft: 8
            }}>
              {item[valueKey] > 0 && (
                <span style={{ fontSize: 11, color: '#001E2B', fontWeight: 600, fontFamily: 'var(--font-mono)', whiteSpace: 'nowrap' }}>
                  {item[valueKey]}
                </span>
              )}
            </div>
          </div>
        </div>
      ))}
    </div>
  )
}

function StatCard({ label, value, sub, color }) {
  return (
    <div style={{
      background: 'var(--white)', borderRadius: 'var(--radius-lg)',
      border: '1px solid var(--gray-200)', padding: '18px 22px'
    }}>
      <p style={{ fontSize: 11, color: 'var(--gray-400)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 6 }}>{label}</p>
      <p style={{ fontSize: 30, fontWeight: 700, color: color || 'var(--green-deepest)', letterSpacing: '-1px', lineHeight: 1 }}>{value ?? '—'}</p>
      {sub && <p style={{ fontSize: 12, color: 'var(--gray-400)', marginTop: 5, fontFamily: 'var(--font-mono)' }}>{sub}</p>}
    </div>
  )
}

function Section({ title, subtitle, children }) {
  return (
    <div style={{
      background: 'var(--white)', borderRadius: 'var(--radius-lg)',
      border: '1px solid var(--gray-200)', padding: 24, marginBottom: 20
    }}>
      <div style={{ marginBottom: 18 }}>
        <p style={{ fontSize: 14, fontWeight: 600, color: 'var(--green-deepest)' }}>{title}</p>
        {subtitle && <p style={{ fontSize: 12, color: 'var(--gray-400)', marginTop: 2 }}>{subtitle}</p>}
      </div>
      {children}
    </div>
  )
}

function UtilisationTable({ data }) {
  if (!data || data.length === 0) {
    return <p style={{ fontSize: 13, color: 'var(--gray-400)' }}>No booking data yet.</p>
  }
  const maxBookings = Math.max(...data.map(d => d.bookingCount))

  return (
    <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
      <thead>
        <tr style={{ borderBottom: '1px solid var(--gray-100)' }}>
          {['Resource', 'Bookings', 'Hours Booked', 'Utilisation'].map(h => (
            <th key={h} style={{
              textAlign: 'left', padding: '8px 12px', fontSize: 11,
              color: 'var(--gray-400)', fontWeight: 600,
              textTransform: 'uppercase', letterSpacing: '0.06em'
            }}>{h}</th>
          ))}
        </tr>
      </thead>
      <tbody>
        {data.map((row, i) => {
          const pct = maxBookings > 0 ? Math.round((row.bookingCount / maxBookings) * 100) : 0
          return (
            <tr key={i} style={{ borderBottom: '1px solid var(--gray-50)' }}>
              <td style={{ padding: '10px 12px', fontWeight: 500, color: 'var(--green-deepest)' }}>
                {row.resourceName}
              </td>
              <td style={{ padding: '10px 12px', fontFamily: 'var(--font-mono)', color: 'var(--gray-600)' }}>
                {row.bookingCount}
              </td>
              <td style={{ padding: '10px 12px', fontFamily: 'var(--font-mono)', color: 'var(--gray-600)' }}>
                {row.totalHours}h
              </td>
              <td style={{ padding: '10px 12px', minWidth: 140 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <div style={{ flex: 1, background: 'var(--gray-100)', borderRadius: 4, height: 8 }}>
                    <div style={{
                      width: `${pct}%`, height: '100%', borderRadius: 4,
                      background: pct > 70 ? '#00ED64' : pct > 40 ? '#facc15' : '#fb923c'
                    }} />
                  </div>
                  <span style={{ fontSize: 11, color: 'var(--gray-400)', fontFamily: 'var(--font-mono)', width: 32 }}>
                    {pct}%
                  </span>
                </div>
              </td>
            </tr>
          )
        })}
      </tbody>
    </table>
  )
}

function DailyChart({ data }) {
  if (!data || data.length === 0) {
    return <p style={{ fontSize: 13, color: 'var(--gray-400)' }}>No data for the last 7 days.</p>
  }
  const max = Math.max(...data.map(d => d.bookingCount), 1)

  return (
    <div style={{ display: 'flex', alignItems: 'flex-end', gap: 8, height: 80 }}>
      {data.map((d, i) => {
        const height = Math.max((d.bookingCount / max) * 72, 4)
        const dateLabel = new Date(d.date).toLocaleDateString('en-US', { weekday: 'short', month: 'numeric', day: 'numeric' })
        return (
          <div key={i} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4 }}>
            <span style={{ fontSize: 10, color: 'var(--gray-400)', fontFamily: 'var(--font-mono)' }}>
              {d.bookingCount}
            </span>
            <div style={{
              width: '100%', height, background: 'var(--green-mid)',
              borderRadius: '4px 4px 0 0', minHeight: 4
            }} />
            <span style={{ fontSize: 9, color: 'var(--gray-400)', textAlign: 'center', lineHeight: 1.2 }}>
              {dateLabel}
            </span>
          </div>
        )
      })}
    </div>
  )
}

export default function ResourceAnalyticsPage() {
  const navigate = useNavigate()
  const [stats, setStats] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    analyticsApi.getSummary()
      .then(res => setStats(res.data.data))
      .catch(() => toast.error('Failed to load analytics'))
      .finally(() => setLoading(false))
  }, [])

  if (loading) return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 10, color: 'var(--gray-400)', fontSize: 14 }}>
      <div style={{
        width: 16, height: 16, border: '2px solid var(--gray-200)',
        borderTop: '2px solid var(--green-mid)', borderRadius: '50%',
        animation: 'spin 0.8s linear infinite'
      }} />
      Loading analytics...
    </div>
  )

  const availabilityPct = stats?.totalResources > 0
    ? Math.round((stats.availableResources / stats.totalResources) * 100)
    : 0

  // Find peak hour label
  const peakHour = stats?.peakHours?.reduce((a, b) => a.bookingCount > b.bookingCount ? a : b, {})

  return (
    <div>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 28 }}>
        <div>
          <h1 style={{ fontSize: 22, fontWeight: 600, color: 'var(--green-deepest)', letterSpacing: '-0.5px' }}>
            Resource Analytics
          </h1>
          <p style={{ fontSize: 14, color: 'var(--gray-600)', marginTop: 2 }}>
            Usage insights, booking trends and peak hours
          </p>
        </div>
        <button onClick={() => navigate('/resources')} style={{
          padding: '8px 16px', borderRadius: 'var(--radius-md)',
          border: '1px solid var(--gray-200)', background: 'var(--white)',
          fontSize: 13, cursor: 'pointer', color: 'var(--green-deepest)'
        }}>
          ← Manage Resources
        </button>
      </div>

      {/* KPI Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(160px, 1fr))', gap: 12, marginBottom: 20 }}>
        <StatCard label="Total Resources" value={stats?.totalResources} />
        <StatCard
          label="Available Now"
          value={stats?.availableResources}
          sub={`${availabilityPct}% of fleet`}
          color="var(--green-mid)"
        />
        <StatCard label="Total Bookings" value={stats?.totalBookings} />
        <StatCard label="Confirmed" value={stats?.confirmedBookings} color="var(--green-mid)" />
        {peakHour?.label && (
          <StatCard
            label="Peak Hour"
            value={peakHour.label}
            sub={`${peakHour.bookingCount} bookings`}
            color="#7c3aed"
          />
        )}
      </div>

      {/* Top Resources + Peak Hours side by side */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20, marginBottom: 0 }}>
        <Section
          title="Top Resources"
          subtitle="Most booked campus facilities"
        >
          <BarChart
            data={stats?.topResources || []}
            valueKey="bookingCount"
            labelKey="resourceName"
            color="var(--green-mid)"
          />
        </Section>

        <Section
          title="Peak Booking Hours"
          subtitle="When students book the most"
        >
          <BarChart
            data={stats?.peakHours || []}
            valueKey="bookingCount"
            labelKey="label"
            color="#7c3aed"
            maxBars={12}
          />
        </Section>
      </div>

      {/* Daily Bookings Trend */}
      <div style={{ marginTop: 20 }}>
        <Section
          title="Bookings — Last 7 Days"
          subtitle="Daily booking volume trend"
        >
          <DailyChart data={stats?.dailyBookings || []} />
        </Section>
      </div>

      {/* Resource Utilisation Table */}
      <Section
        title="Resource Utilisation"
        subtitle="Confirmed & completed bookings per resource with total hours"
      >
        <UtilisationTable data={stats?.resourceUtilisation || []} />
      </Section>

      <style>{`
        @keyframes spin { to { transform: rotate(360deg) } }
      `}</style>
    </div>
  )
}