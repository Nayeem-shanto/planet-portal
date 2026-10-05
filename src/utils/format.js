export const formatDate = (iso) =>
  iso ? new Date(iso).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' }) : ''

export function timeAgo(iso) {
  const days = Math.floor((Date.now() - new Date(iso)) / 86_400_000)
  if (days <= 0) return 'Today'
  if (days === 1) return 'Yesterday'
  if (days < 30) return `${days} days ago`
  const months = Math.floor(days / 30)
  return months === 1 ? '1 month ago' : `${months} months ago`
}

export const daysLeft = (deadlineIso) => Math.ceil((new Date(deadlineIso) - Date.now()) / 86_400_000)

export function formatSalary(min, max) {
  if (!min && !max) return 'Negotiable'
  const fmt = (n) => `৳${Number(n).toLocaleString('en-IN')}`
  if (min && max) return `${fmt(min)} – ${fmt(max)}`
  return min ? `From ${fmt(min)}` : `Up to ${fmt(max)}`
}

export const initials = (name = '') =>
  name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((word) => word[0].toUpperCase())
    .join('')

/** Turn "a, b\nc" into ["a", "b", "c"] */
export const splitList = (text = '') =>
  text
    .split(/[\n,•]+/)
    .map((s) => s.trim())
    .filter(Boolean)

/** One item per line, for text that may itself contain commas. */
export const splitLines = (text = '') =>
  text
    .split('\n')
    .map((s) => s.replace(/^[-•*]\s*/, '').trim())
    .filter(Boolean)
