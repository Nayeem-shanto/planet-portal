// Values shared by forms, filters and services. One source of truth.
export const JOB_CATEGORIES = [
  'Engineering', 'Software & IT', 'Agriculture', 'Sustainability', 'Operations',
  'Finance & Accounts', 'Human Resources', 'Sales & Marketing', 'Research',
]
export const JOB_TYPES = ['Full-time', 'Part-time', 'Contract', 'Internship']
export const WORKPLACES = ['On-site', 'Hybrid', 'Remote']
export const GENERAL_ROLES = [
  { value: 'student', label: 'Student' },
  { value: 'employee', label: 'Employee' },
]
export const APPLICATION_STATUSES = ['Submitted', 'Reviewing', 'Shortlisted', 'Rejected', 'Hired']

export const STATUS_BADGE = {
  Submitted: 'badge-ghost',
  Reviewing: 'badge-info',
  Shortlisted: 'badge-warning',
  Rejected: 'badge-error',
  Hired: 'badge-success',
}

/**
 * Demo-only access code for creating an admin account.
 * In a real system, admins are never created from a public sign-up form:
 * an existing admin invites them, or they are created on the server.
 */
export const ADMIN_ACCESS_CODE = 'PLANET-ADMIN-2026'
