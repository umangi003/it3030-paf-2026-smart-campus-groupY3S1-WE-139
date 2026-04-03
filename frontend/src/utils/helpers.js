import { format, parseISO } from 'date-fns'

export const formatDate = (date) => {
  if (!date) return '—'
  try { return format(parseISO(date), 'MMM d, yyyy') } catch { return date }
}

export const formatDateTime = (date) => {
  if (!date) return '—'
  try { return format(parseISO(date), 'MMM d, yyyy · h:mm a') } catch { return date }
}

export const formatTime = (date) => {
  if (!date) return '—'
  try { return format(parseISO(date), 'h:mm a') } catch { return date }
}

export const statusColor = (status) => {
  const map = {
    CONFIRMED: '#00684A', PENDING: '#b45309', CANCELLED: '#dc2626',
    COMPLETED: '#374151', NO_SHOW: '#9ca3af',
    OPEN: '#dc2626', IN_PROGRESS: '#b45309', RESOLVED: '#00684A',
    CLOSED: '#374151', ESCALATED: '#7c3aed',
    AVAILABLE: '#00684A', UNAVAILABLE: '#dc2626',
    MAINTENANCE: '#b45309', RETIRED: '#9ca3af',
  }
  return map[status] || '#374151'
}

export const statusBg = (status) => {
  const map = {
    CONFIRMED: '#f0fdf4', PENDING: '#fffbeb', CANCELLED: '#fef2f2',
    COMPLETED: '#f9fafb', NO_SHOW: '#f9fafb',
    OPEN: '#fef2f2', IN_PROGRESS: '#fffbeb', RESOLVED: '#f0fdf4',
    CLOSED: '#f9fafb', ESCALATED: '#f5f3ff',
    AVAILABLE: '#f0fdf4', UNAVAILABLE: '#fef2f2',
    MAINTENANCE: '#fffbeb', RETIRED: '#f9fafb',
  }
  return map[status] || '#f9fafb'
}

export const getErrorMessage = (error) => {
  return error?.response?.data?.message || error?.message || 'Something went wrong'
}
