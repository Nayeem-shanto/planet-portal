import { useMemo } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import { usePortalData } from '../../hooks/usePortalData'
import { APPLICATION_STATUSES, STATUS_BADGE } from '../../data/constants'
import { daysLeft, timeAgo } from '../../utils/format'
import CompanyLogo from '../../components/ui/CompanyLogo'
import FullPageLoader from '../../components/ui/FullPageLoader'
import Icon from '../../components/ui/Icon'

export default function AdminOverviewPage() {
  const { user } = useAuth()
  const { jobs, companies, applications, loading } = usePortalData(user, { allApplications: true })

  const stats = useMemo(() => {
    const open = jobs.filter((j) => j.status === 'open' && daysLeft(j.deadline) > 0)
    return {
      open: open.length,
      expiringSoon: open.filter((j) => daysLeft(j.deadline) <= 7).length,
      applications: applications.length,
      toReview: applications.filter((a) => a.status === 'Submitted').length,
    }
  }, [jobs, applications])

  const byCompany = useMemo(
    () => companies.map((c) => ({
      company: c,
      jobs: jobs.filter((j) => j.companyId === c.id && j.status === 'open').length,
      applicants: applications.filter((a) => a.companyId === c.id).length,
    })),
    [companies, jobs, applications],
  )
  const maxApplicants = Math.max(1, ...byCompany.map((r) => r.applicants))
  const recent = applications.toSorted((a, b) => new Date(b.createdAt) - new Date(a.createdAt)).slice(0, 6)
  const jobsById = Object.fromEntries(jobs.map((j) => [j.id, j]))

  if (loading) return <FullPageLoader />

  return (
    <div className="mx-auto max-w-6xl space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold">Hiring overview</h1>
          <p className="mt-1 text-base-content/70">Across {companies.length} Planet companies.</p>
        </div>
        <Link to="/admin/jobs" className="btn btn-primary"><Icon name="plus" className="size-4" /> Post a job</Link>
      </div>

      <section className="grid gap-px overflow-hidden rounded-box border border-base-300 bg-base-300 sm:grid-cols-4">
        {[
          ['Open job posts', stats.open, `${stats.expiringSoon} close within 7 days`],
          ['Applications', stats.applications, 'All time'],
          ['Waiting for review', stats.toReview, 'Status: Submitted'],
          ['Companies', companies.length, 'With a public profile'],
        ].map(([label, value, note]) => (
          <div key={label} className="bg-base-100 p-5">
            <p className="text-sm text-base-content/65">{label}</p>
            <p className="mt-1 font-display text-3xl font-bold">{value}</p>
            <p className="mt-1 text-xs text-base-content/55">{note}</p>
          </div>
        ))}
      </section>

      <div className="grid gap-6 lg:grid-cols-2">
        <section className="rounded-box border border-base-300 bg-base-100 p-5">
          <h2 className="mb-4 text-lg font-bold">Applicants by company</h2>
          <ul className="space-y-4">
            {byCompany.map(({ company, jobs: open, applicants }) => (
              <li key={company.id}>
                <div className="mb-1.5 flex items-center gap-2 text-sm">
                  <CompanyLogo company={company} size="size-6 text-[9px] rounded-md" />
                  <span className="font-medium">{company.name}</span>
                  <span className="ml-auto text-base-content/60">{applicants} applicants, {open} open roles</span>
                </div>
                <div className="h-2.5 overflow-hidden rounded-full bg-base-200">
                  <div className="h-full rounded-full" style={{ width: `${(applicants / maxApplicants) * 100}%`, backgroundColor: company.color }} />
                </div>
              </li>
            ))}
          </ul>
        </section>

        <section className="rounded-box border border-base-300 bg-base-100 p-5">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-lg font-bold">Recent applications</h2>
            <Link to="/admin/applicants" className="link link-secondary text-sm">See all</Link>
          </div>
          {recent.length === 0 ? (
            <p className="text-sm text-base-content/60">No applications yet. Once candidates apply, the latest show up here.</p>
          ) : (
            <ul className="divide-y divide-base-300">
              {recent.map((a) => (
                <li key={a.id} className="flex items-center gap-3 py-2.5 text-sm">
                  <div className="min-w-0 flex-1">
                    <p className="truncate font-semibold">{a.applicantName}</p>
                    <p className="truncate text-base-content/60">{jobsById[a.jobId]?.title}</p>
                  </div>
                  <span className={`badge badge-sm ${STATUS_BADGE[a.status]}`}>{a.status}</span>
                  <span className="w-20 text-right text-xs text-base-content/55">{timeAgo(a.createdAt)}</span>
                </li>
              ))}
            </ul>
          )}
        </section>
      </div>

      <section className="rounded-box border border-base-300 bg-base-100 p-5">
        <h2 className="mb-4 text-lg font-bold">Hiring pipeline</h2>
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-5">
          {APPLICATION_STATUSES.map((s) => (
            <Link key={s} to="/admin/applicants" className="rounded-lg bg-base-200 p-3 hover:bg-base-300/70">
              <span className={`badge badge-sm ${STATUS_BADGE[s]}`}>{s}</span>
              <p className="mt-2 font-display text-2xl font-bold">{applications.filter((a) => a.status === s).length}</p>
            </Link>
          ))}
        </div>
      </section>
    </div>
  )
}
