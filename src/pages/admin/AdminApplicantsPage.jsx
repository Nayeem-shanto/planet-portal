import { useMemo, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import { useToast } from '../../context/ToastContext'
import { usePortalData } from '../../hooks/usePortalData'
import { updateApplicationStatus } from '../../services/applicationService'
import { APPLICATION_STATUSES } from '../../data/constants'
import { matchScore } from '../../utils/matching'
import { formatDate } from '../../utils/format'
import PageHeader from '../../components/ui/PageHeader'
import EmptyState from '../../components/ui/EmptyState'
import FullPageLoader from '../../components/ui/FullPageLoader'
import Modal from '../../components/ui/Modal'
import CVPreview from '../../components/cv/CVPreview'
import MatchBadge from '../../components/jobs/MatchBadge'
import Icon from '../../components/ui/Icon'

export default function AdminApplicantsPage() {
  const { user } = useAuth()
  const notify = useToast()
  const { jobs, applications, loading, reload } = usePortalData(user, { allApplications: true })
  const [params, setParams] = useSearchParams()
  const jobFilter = params.get('job') ?? ''
  const [statusFilter, setStatusFilter] = useState('')
  const [sort, setSort] = useState('newest')
  const [viewing, setViewing] = useState(null)

  const jobsById = useMemo(() => Object.fromEntries(jobs.map((j) => [j.id, j])), [jobs])
  const rows = useMemo(() => {
    const list = applications
      .filter((a) => !jobFilter || a.jobId === jobFilter)
      .filter((a) => !statusFilter || a.status === statusFilter)
      .map((a) => ({ ...a, job: jobsById[a.jobId], match: jobsById[a.jobId] ? matchScore(jobsById[a.jobId], a.cvSnapshot) : null }))
    return sort === 'match'
      ? list.toSorted((a, b) => (b.match?.score ?? 0) - (a.match?.score ?? 0))
      : list.toSorted((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
  }, [applications, jobFilter, statusFilter, sort, jobsById])

  async function changeStatus(application, status) {
    await updateApplicationStatus(application.id, status)
    notify(`${application.applicantName} marked ${status}`)
    reload()
  }

  if (loading) return <FullPageLoader />

  return (
    <div className="mx-auto max-w-6xl">
      <PageHeader title="Applicants" description="Review CVs and move candidates through the hiring stages. Candidates see each status change." />

      <div className="mb-4 flex flex-wrap gap-2">
        <select className="select select-sm w-auto" value={jobFilter} onChange={(e) => setParams(e.target.value ? { job: e.target.value } : {})} aria-label="Filter by job">
          <option value="">All jobs</option>
          {jobs.map((j) => <option key={j.id} value={j.id}>{j.title}</option>)}
        </select>
        <select className="select select-sm w-auto" value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} aria-label="Filter by status">
          <option value="">All statuses</option>
          {APPLICATION_STATUSES.map((s) => <option key={s}>{s}</option>)}
        </select>
        <select className="select select-sm w-auto" value={sort} onChange={(e) => setSort(e.target.value)} aria-label="Sort applicants">
          <option value="newest">Newest first</option>
          <option value="match">Best CV match</option>
        </select>
      </div>

      {rows.length === 0 ? (
        <EmptyState icon="users" title="No applicants yet">Applications appear here as soon as candidates apply.</EmptyState>
      ) : (
        <div className="overflow-x-auto rounded-box border border-base-300 bg-base-100">
          <table className="table">
            <thead><tr><th>Candidate</th><th>Job</th><th>Applied</th><th>Match</th><th>Status</th><th /></tr></thead>
            <tbody>
              {rows.map((a) => (
                <tr key={a.id} className="hover:bg-base-200/60">
                  <td><p className="font-semibold">{a.applicantName}</p><p className="text-xs text-base-content/60">{a.applicantEmail}</p></td>
                  <td className="max-w-56">{a.job?.title ?? 'Deleted job'}</td>
                  <td className="whitespace-nowrap">{formatDate(a.createdAt)}</td>
                  <td><MatchBadge match={a.match} /></td>
                  <td>
                    <select className="select select-xs w-32" value={a.status} onChange={(e) => changeStatus(a, e.target.value)} aria-label={`Status for ${a.applicantName}`}>
                      {APPLICATION_STATUSES.map((s) => <option key={s}>{s}</option>)}
                    </select>
                  </td>
                  <td className="text-right"><button className="btn btn-ghost btn-xs" onClick={() => setViewing(a)}><Icon name="eye" className="size-4" /> View CV</button></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <Modal open={Boolean(viewing)} onClose={() => setViewing(null)} title={viewing ? `${viewing.applicantName}, for ${viewing.job?.title ?? 'a deleted job'}` : ''} size="max-w-4xl">
        {viewing && (
          <div className="space-y-4">
            {viewing.coverLetter && (
              <div className="rounded-box bg-base-200 p-4">
                <p className="mb-1 text-sm font-semibold">Cover letter</p>
                <p className="whitespace-pre-line text-sm">{viewing.coverLetter}</p>
              </div>
            )}
            <div className="max-h-[70vh] overflow-y-auto rounded-box bg-base-300 p-4">
              <CVPreview cv={viewing.cvSnapshot} />
            </div>
          </div>
        )}
      </Modal>
    </div>
  )
}
