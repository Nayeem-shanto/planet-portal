import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import { useToast } from '../../context/ToastContext'
import { usePortalData } from '../../hooks/usePortalData'
import { withdrawApplication } from '../../services/applicationService'
import { APPLICATION_STATUSES, STATUS_BADGE } from '../../data/constants'
import { formatDate } from '../../utils/format'
import PageHeader from '../../components/ui/PageHeader'
import CompanyLogo from '../../components/ui/CompanyLogo'
import EmptyState from '../../components/ui/EmptyState'
import FullPageLoader from '../../components/ui/FullPageLoader'

export default function ApplicationsPage() {
  const { user } = useAuth()
  const notify = useToast()
  const { jobs, companies, applications, loading, reload } = usePortalData(user)
  const [status, setStatus] = useState('All')

  const rows = useMemo(() => {
    const jobsById = Object.fromEntries(jobs.map((j) => [j.id, j]))
    const companiesById = Object.fromEntries(companies.map((c) => [c.id, c]))
    return applications
      .map((a) => ({ ...a, job: jobsById[a.jobId], company: companiesById[a.companyId] }))
      .filter((a) => status === 'All' || a.status === status)
      .toSorted((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
  }, [applications, jobs, companies, status])

  async function handleWithdraw(id) {
    if (!confirm('Withdraw this application?')) return
    try {
      await withdrawApplication(id, user.id)
      notify('Application withdrawn')
      reload()
    } catch (err) {
      notify(err.message, 'error')
    }
  }

  if (loading) return <FullPageLoader />

  return (
    <div className="mx-auto max-w-5xl">
      <PageHeader title="My applications" description="Track where each application stands. Employers update the status as they review." />

      <div role="tablist" className="tabs tabs-border mb-5 overflow-x-auto">
        {['All', ...APPLICATION_STATUSES].map((s) => (
          <button key={s} role="tab" className={`tab ${status === s ? 'tab-active' : ''}`} onClick={() => setStatus(s)}>
            {s}
            <span className="ml-1.5 text-xs text-base-content/50">
              {s === 'All' ? applications.length : applications.filter((a) => a.status === s).length}
            </span>
          </button>
        ))}
      </div>

      {rows.length === 0 ? (
        <EmptyState icon="inbox" title={status === 'All' ? 'You haven’t applied to any jobs yet' : `No applications marked ${status}`} action={<Link to="/app/jobs" className="btn btn-primary btn-sm">Browse jobs</Link>}>
          Applications you send appear here with their status.
        </EmptyState>
      ) : (
        <ul className="space-y-3">
          {rows.map((a) => (
            <li key={a.id} className="flex flex-wrap items-center gap-4 rounded-box border border-base-300 bg-base-100 p-4">
              <CompanyLogo company={a.company} />
              <div className="min-w-0 flex-1">
                <Link to={`/app/jobs?job=${a.jobId}`} className="font-semibold hover:underline">{a.job?.title ?? 'Job removed'}</Link>
                <p className="text-sm text-base-content/65">{a.company?.name}. Applied {formatDate(a.createdAt)}</p>
              </div>
              <span className={`badge ${STATUS_BADGE[a.status]}`}>{a.status}</span>
              {a.status === 'Submitted' && (
                <button className="btn btn-ghost btn-sm text-error" onClick={() => handleWithdraw(a.id)}>Withdraw</button>
              )}
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}
