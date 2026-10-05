import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import { useToast } from '../../context/ToastContext'
import { usePortalData } from '../../hooks/usePortalData'
import { createJob, deleteJob, updateJob } from '../../services/jobService'
import { daysLeft, formatDate } from '../../utils/format'
import PageHeader from '../../components/ui/PageHeader'
import CompanyLogo from '../../components/ui/CompanyLogo'
import EmptyState from '../../components/ui/EmptyState'
import FullPageLoader from '../../components/ui/FullPageLoader'
import Icon from '../../components/ui/Icon'
import JobFormModal from './JobFormModal'

export default function AdminJobsPage() {
  const { user } = useAuth()
  const notify = useToast()
  const { jobs, companies, applications, loading, reload } = usePortalData(user, { allApplications: true })
  const [editing, setEditing] = useState(undefined) // undefined = closed, null = new, object = edit
  const [query, setQuery] = useState('')

  const companiesById = useMemo(() => Object.fromEntries(companies.map((c) => [c.id, c])), [companies])
  const rows = useMemo(
    () => jobs
      .filter((j) => j.title.toLowerCase().includes(query.toLowerCase()))
      .toSorted((a, b) => new Date(b.createdAt) - new Date(a.createdAt)),
    [jobs, query],
  )
  const applicantCount = (jobId) => applications.filter((a) => a.jobId === jobId).length

  async function handleSubmit(data) {
    if (editing) {
      await updateJob(editing.id, data)
      notify('Job post updated')
    } else {
      await createJob({ ...data, postedBy: user.id })
      notify('Job published')
    }
    setEditing(undefined)
    reload()
  }

  async function toggleStatus(job) {
    await updateJob(job.id, { status: job.status === 'open' ? 'closed' : 'open' })
    notify(job.status === 'open' ? 'Job closed to new applications' : 'Job reopened')
    reload()
  }

  async function handleDelete(job) {
    if (!confirm(`Delete “${job.title}”? This cannot be undone.`)) return
    try {
      await deleteJob(job.id)
      notify('Job deleted')
      reload()
    } catch (err) {
      notify(err.message, 'error')
    }
  }

  if (loading) return <FullPageLoader />

  return (
    <div className="mx-auto max-w-6xl">
      <PageHeader
        title="Job posts"
        description="Everything published here appears on the job board for students and employees."
        actions={<button className="btn btn-primary" onClick={() => setEditing(null)} disabled={!companies.length}><Icon name="plus" className="size-4" /> New job post</button>}
      />

      {!companies.length ? (
        <EmptyState icon="building" title="Add a company first" action={<Link to="/admin/companies" className="btn btn-primary btn-sm">Add company</Link>}>
          Every job belongs to a company profile, which candidates see next to the post.
        </EmptyState>
      ) : (
        <div className="rounded-box border border-base-300 bg-base-100">
          <div className="border-b border-base-300 p-3">
            <label className="input input-sm w-full max-w-xs">
              <Icon name="search" className="size-4 opacity-60" />
              <input type="search" placeholder="Search job titles" value={query} onChange={(e) => setQuery(e.target.value)} />
            </label>
          </div>
          <div className="overflow-x-auto">
            <table className="table">
              <thead>
                <tr><th>Job</th><th>Type</th><th>Deadline</th><th>Applicants</th><th>Status</th><th className="text-right">Actions</th></tr>
              </thead>
              <tbody>
                {rows.map((job) => {
                  const remaining = daysLeft(job.deadline)
                  return (
                    <tr key={job.id} className="hover:bg-base-200/60">
                      <td>
                        <div className="flex items-center gap-3">
                          <CompanyLogo company={companiesById[job.companyId]} size="size-9" />
                          <div>
                            <p className="font-semibold">{job.title}</p>
                            <p className="text-xs text-base-content/60">{companiesById[job.companyId]?.name}</p>
                          </div>
                        </div>
                      </td>
                      <td className="whitespace-nowrap">{job.type}<br /><span className="text-xs text-base-content/60">{job.workplace}</span></td>
                      <td className="whitespace-nowrap">
                        {formatDate(job.deadline)}
                        <br /><span className={`text-xs ${remaining <= 0 ? 'text-error' : 'text-base-content/60'}`}>{remaining > 0 ? `${remaining} days left` : 'Expired'}</span>
                      </td>
                      <td><Link to={`/admin/applicants?job=${job.id}`} className="link link-secondary">{applicantCount(job.id)}</Link></td>
                      <td><span className={`badge ${job.status === 'open' ? 'badge-success badge-soft' : 'badge-ghost'}`}>{job.status === 'open' ? 'Open' : 'Closed'}</span></td>
                      <td>
                        <div className="flex justify-end gap-1">
                          <button className="btn btn-ghost btn-xs" onClick={() => toggleStatus(job)}>{job.status === 'open' ? 'Close' : 'Reopen'}</button>
                          <button className="btn btn-ghost btn-xs btn-square" onClick={() => setEditing(job)} aria-label={`Edit ${job.title}`}><Icon name="edit" className="size-4" /></button>
                          <button className="btn btn-ghost btn-xs btn-square text-error" onClick={() => handleDelete(job)} aria-label={`Delete ${job.title}`}><Icon name="trash" className="size-4" /></button>
                        </div>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
          {rows.length === 0 && <p className="p-6 text-center text-sm text-base-content/60">No job posts match “{query}”.</p>}
        </div>
      )}

      {editing !== undefined && (
        <JobFormModal key={editing?.id ?? 'new'} open job={editing} companies={companies} onClose={() => setEditing(undefined)} onSubmit={handleSubmit} />
      )}
    </div>
  )
}
