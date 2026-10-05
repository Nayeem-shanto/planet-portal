import { useMemo } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import { usePortalData } from '../../hooks/usePortalData'
import { cvCompleteness } from '../../services/cvService'
import { matchScore } from '../../utils/matching'
import { APPLICATION_STATUSES, STATUS_BADGE } from '../../data/constants'
import { daysLeft, formatSalary } from '../../utils/format'
import CompanyLogo from '../../components/ui/CompanyLogo'
import MatchBadge from '../../components/jobs/MatchBadge'
import FullPageLoader from '../../components/ui/FullPageLoader'
import Icon from '../../components/ui/Icon'

export default function OverviewPage() {
  const { user } = useAuth()
  const { jobs, companies, cv, applications, loading } = usePortalData(user)

  const companiesById = useMemo(() => Object.fromEntries(companies.map((c) => [c.id, c])), [companies])
  const openJobs = useMemo(() => jobs.filter((j) => j.status === 'open' && daysLeft(j.deadline) > 0), [jobs])
  const recommended = useMemo(() => {
    const scored = openJobs.map((j) => ({ ...j, match: matchScore(j, cv) }))
    return cv?.skills?.length
      ? scored.toSorted((a, b) => b.match.score - a.match.score).slice(0, 4)
      : scored.toSorted((a, b) => new Date(b.createdAt) - new Date(a.createdAt)).slice(0, 4)
  }, [openJobs, cv])
  const closingSoon = openJobs.filter((j) => daysLeft(j.deadline) <= 10).toSorted((a, b) => new Date(a.deadline) - new Date(b.deadline)).slice(0, 4)

  if (loading) return <FullPageLoader />

  const completeness = cvCompleteness(cv)
  const firstName = user.name.split(' ')[0]

  return (
    <div className="mx-auto max-w-6xl space-y-6">
      <section className="relative overflow-hidden rounded-box bg-primary p-6 text-primary-content sm:p-8">
        <svg className="pointer-events-none absolute -right-20 -top-24 w-[28rem] opacity-20" viewBox="0 0 400 400" aria-hidden="true">
          {[0, 1, 2, 3, 4, 5].map((i) => <ellipse key={i} cx="200" cy="200" rx={50 + i * 28} ry={36 + i * 22} fill="none" stroke="#9bc53d" strokeWidth="1.5" transform={`rotate(${20 + i * 4} 200 200)`} />)}
        </svg>
        <div className="relative flex flex-wrap items-center justify-between gap-6">
          <div>
            <h1 className="text-3xl font-bold">Hello, {firstName}</h1>
            <p className="mt-2 max-w-lg text-primary-content/75">
              {openJobs.length} roles are open across the group right now.
              {cv ? ' Your CV is ready to send.' : ' Set up your CV so you can apply in one click.'}
            </p>
            <div className="mt-5 flex flex-wrap gap-2">
              <Link to="/app/jobs" className="btn btn-accent">Browse jobs</Link>
              <Link to="/app/cv" className="btn btn-ghost border-white/25 text-primary-content hover:bg-white/10">{cv ? 'Edit my CV' : 'Create my CV'}</Link>
            </div>
          </div>
          <div className="flex items-center gap-4 rounded-box bg-white/8 p-4">
            <div className="radial-progress text-accent" style={{ '--value': completeness, '--size': '4.5rem', '--thickness': '6px' }} role="progressbar" aria-valuenow={completeness}>
              <span className="font-display text-lg font-bold text-primary-content">{completeness}%</span>
            </div>
            <div className="text-sm">
              <p className="font-semibold">CV completeness</p>
              <p className="text-primary-content/65">{completeness < 100 ? 'Complete CVs rank higher in match results.' : 'Looking complete.'}</p>
            </div>
          </div>
        </div>
      </section>

      <section className="grid gap-3 sm:grid-cols-5">
        {APPLICATION_STATUSES.map((s) => (
          <div key={s} className="rounded-box border border-base-300 bg-base-100 p-4">
            <span className={`badge badge-sm ${STATUS_BADGE[s]}`}>{s}</span>
            <p className="mt-2 font-display text-2xl font-bold">{applications.filter((a) => a.status === s).length}</p>
          </div>
        ))}
      </section>

      <div className="grid gap-6 lg:grid-cols-[minmax(0,1.6fr)_minmax(0,1fr)]">
        <section className="rounded-box border border-base-300 bg-base-100 p-5">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-lg font-bold">{cv?.skills?.length ? 'Best matches for your CV' : 'Latest openings'}</h2>
            <Link to="/app/jobs" className="link link-secondary text-sm">See all</Link>
          </div>
          <ul className="divide-y divide-base-300">
            {recommended.map((job) => (
              <li key={job.id}>
                <Link to={`/app/jobs?job=${job.id}`} className="flex items-center gap-3 py-3 hover:opacity-80">
                  <CompanyLogo company={companiesById[job.companyId]} size="size-10" />
                  <div className="min-w-0 flex-1">
                    <p className="truncate font-semibold">{job.title}</p>
                    <p className="truncate text-sm text-base-content/60">{companiesById[job.companyId]?.name}, {formatSalary(job.salaryMin, job.salaryMax)}</p>
                  </div>
                  <MatchBadge match={job.match} />
                </Link>
              </li>
            ))}
          </ul>
        </section>

        <section className="rounded-box border border-base-300 bg-base-100 p-5">
          <h2 className="mb-4 flex items-center gap-2 text-lg font-bold"><Icon name="clock" className="size-5 text-warning" /> Closing soon</h2>
          {closingSoon.length === 0 ? (
            <p className="text-sm text-base-content/60">No deadlines in the next 10 days.</p>
          ) : (
            <ul className="space-y-3">
              {closingSoon.map((job) => (
                <li key={job.id}>
                  <Link to={`/app/jobs?job=${job.id}`} className="block rounded-lg bg-base-200 p-3 hover:bg-base-300/70">
                    <p className="font-semibold">{job.title}</p>
                    <p className="text-sm text-error">{daysLeft(job.deadline)} days left</p>
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </section>
      </div>
    </div>
  )
}
