export const formatTSh = (value) => {
  const num = Number(value) || 0
  return `TSh ${num.toLocaleString('en-US', { maximumFractionDigits: 0 })}`
}

export const formatKG = (value) => {
  const num = Number(value) || 0
  const trimmed = Number.isInteger(num) ? num : num.toFixed(1)
  return `${trimmed} KG`
}

export const monthLabel = (month) => {
  if (!month) return ''
  return month.charAt(0) + month.slice(1).toLowerCase()
}

export const MONTHS = [
  'JANUARY', 'FEBRUARY', 'MARCH', 'APRIL', 'MAY', 'JUNE',
  'JULY', 'AUGUST', 'SEPTEMBER', 'OCTOBER', 'NOVEMBER', 'DECEMBER',
]

export const CLASSES = ['Form One', 'Form Two', 'Form Three', 'Form Four']
export const STREAMS = ['A', 'B', 'C', 'D']

export const statusBadgeClass = (status) => {
  switch (status) {
    case 'COMPLETED': return 'badge-completed'
    case 'HAS_DEBT': return 'badge-debt'
    case 'SENT': return 'badge-sent'
    case 'FAILED': return 'badge-failed'
    case 'PENDING':
    case 'NOT_SENT':
      return 'badge-pending'
    default: return 'badge-pending'
  }
}

export const statusLabel = (status) => {
  const map = {
    HAS_DEBT: 'HAS DEBT',
    COMPLETED: 'COMPLETED',
    SENT: 'SENT',
    FAILED: 'FAILED',
    PENDING: 'PENDING',
    NOT_SENT: 'NOT SENT',
  }
  return map[status] || status
}
