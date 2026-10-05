import { useMemo, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import { usePortalData } from '../../hooks/usePortalData'
import { DEFAULT_FILTERS, filterAndSortJobs } from '../../utils/jobFilters'
import { getSavedJobIds, toggleSavedJob } from '../../services/jobService'
import JobFilters from '../../components/jobs/JobFilters'
import JobListItem from '../../components/jobs/JobListItem'
import JobDetail from '../../components/jobs/JobDetail'
import ApplyModal from '../../components/jobs/ApplyModal'
import EmptyState from '../../components/ui/EmptyState'
import FullPageLoader from '../../components/ui/FullPageLoader'

export default function JobsPage() {
  const { user } = useAuth()
  const { jobs, companies, cv, applications, loading, reload } = usePortalData(user)
  const [filters, setFilters] = useState(DEFAULT_FILTERS)
  const [savedIds, setSavedIds] = useState(() => getSavedJobIds(user.id))
  const [applyingTo, setApplyingTo] = useState(null)

  // The selected job lives in the URL (?job=...), so a job can be shared,
  // bookmarked, and survives a page refresh.
  const [params, setParams] = useSearchParams()
  const selectedId = params.get('job')

  // Derived data: computed from state, never stored in its own state.
  // Storing it separately would let the two copies drift out of sync.
  const companiesById = useMemo(() => Object.fromEntries(companies.map((c) => [c.id, c])), [companies])
  const appliedJobIds = useMemo(() => new Set(applications.map((a) => a.jobId)), [applications])
  const visibleJobs = useMemo(
    () => filterAndSortJobs(jobs, filters, { companiesById, savedIds, cv }),
    [jobs, filters, companiesById, savedIds, cv],
  )

  // On wide screens, show the first job when nothing is selected.
  const selectedJob = visibleJobs.find((j) => j.id === selectedId) ?? (selectedId ? null : visibleJobs[0])
  const openRolesFor = (companyId) => jobs.filter((j) => j.companyId === companyId && j.status === 'open').length

  if (loading) return <FullPageLoader />

  const selectJob = (id) => {
    setParams({ job: id })
    // On small screens the list is replaced by the detail, so start at its top.
    if (!window.matchMedia('(min-width: 80rem)').matches) window.scrollTo({ top: 0 })
  }

  return (
    <div className="mx-auto max-w-[1500px]">
      <div className="mb-5">
        <h1 className="text-2xl font-bold sm:text-3xl">Find your next role</h1>
        <p className="mt-1 text-base-content/70">Openings from every company in the Planet group.</p>
      </div>

      <JobFilters
        filters={filters}
        onChange={setFilters}
        onReset={() => setFilters(DEFAULT_FILTERS)}
        hasCV={Boolean(cv?.skills?.length)}
        resultCount={visibleJobs.length}
      />

      {visibleJobs.length === 0 ? (
        <div className="mt-6">
          <EmptyState icon="search" title="No jobs match these filters" action={<button className="btn btn-outline btn-sm" onClick={() => setFilters(DEFAULT_FILTERS)}>Clear filters</button>}>
            Try a broader search or remove a filter.
          </EmptyState>
        </div>
      ) : (
        <div className="mt-5 grid gap-5 xl:grid-cols-[340px_minmax(0,1fr)]">
          {/* On small screens, show the list OR the detail, not both. */}
          <div className={`thin-scroll space-y-3 xl:sticky xl:top-24 xl:max-h-[calc(100vh-7rem)] xl:overflow-y-auto xl:pr-1 ${selectedId ? 'hidden xl:block' : ''}`}>
            {visibleJobs.map((job) => (
              <JobListItem
                key={job.id}
                job={job}
                company={companiesById[job.companyId]}
                selected={job.id === selectedJob?.id}
                saved={savedIds.includes(job.id)}
                applied={appliedJobIds.has(job.id)}
                onSelect={selectJob}
              />
            ))}
          </div>

          <div className={selectedId ? '' : 'hidden xl:block'}>
            {selectedJob ? (
              <JobDetail
                job={selectedJob}
                company={companiesById[selectedJob.companyId]}
                openRoles={openRolesFor(selectedJob.companyId)}
                saved={savedIds.includes(selectedJob.id)}
                applied={appliedJobIds.has(selectedJob.id)}
                onToggleSave={() => setSavedIds(toggleSavedJob(user.id, selectedJob.id))}
                onApply={() => setApplyingTo(selectedJob)}
                onBack={() => setParams({})}
              />
            ) : (
              <EmptyState title="This job is not in the current results">Pick a job from the list.</EmptyState>
            )}
          </div>
        </div>
      )}

      <ApplyModal
        job={applyingTo}
        company={applyingTo && companiesById[applyingTo.companyId]}
        user={user}
        cv={cv}
        onClose={() => setApplyingTo(null)}
        onApplied={() => {
          setApplyingTo(null)
          reload()
        }}
      />
    </div>
  )
}
