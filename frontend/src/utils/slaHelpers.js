import { parseISO, differenceInHours, differenceInMinutes, isPast } from 'date-fns'

export const getSLAStatus = (sla) => {
  if (!sla) return null
  if (sla.resolveBreached) return { label: 'Resolve Breached', color: '#dc2626', bg: '#fef2f2' }
  if (sla.responseBreached) return { label: 'Response Breached', color: '#b45309', bg: '#fffbeb' }
  if (isPast(parseISO(sla.resolveDueAt))) return { label: 'Overdue', color: '#dc2626', bg: '#fef2f2' }
  return { label: 'On Track', color: '#00684A', bg: '#f0fdf4' }
}

export const getTimeRemaining = (dueAt) => {
  if (!dueAt) return null
  const due = parseISO(dueAt)
  if (isPast(due)) return 'Overdue'
  const hours = differenceInHours(due, new Date())
  const mins = differenceInMinutes(due, new Date()) % 60
  if (hours > 0) return `${hours}h ${mins}m remaining`
  return `${mins}m remaining`
}

export const getSLAPercentage = (createdAt, dueAt) => {
  if (!createdAt || !dueAt) return 0
  const start = parseISO(createdAt).getTime()
  const end = parseISO(dueAt).getTime()
  const now = Date.now()
  const total = end - start
  const elapsed = now - start
  return Math.min(100, Math.round((elapsed / total) * 100))
}
