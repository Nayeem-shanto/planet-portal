import CompanyLogo from '../ui/CompanyLogo'
import Icon from '../ui/Icon'
import MatchBadge from './MatchBadge'
import { daysLeft, formatSalary } from '../../utils/format'

export default function JobListItem({ job, company, selected, saved, applied, onSelect }) {
  const remaining = daysLeft(job.deadline)
  return (
    <button
      type="button"
      onClick={() => onSelect(job.id)}
      aria-current={selected ? 'true' : undefined}
      className={`w-full rounded-box border p-4 text-left transition-colors ${
        selected ? 'border-secondary bg-base-100 ring-2 ring-secondary/25' : 'border-base-300 bg-base-100 hover:border-secondary/50'
      }`}
    >
      <div className="flex gap-3">
        <CompanyLogo company={company} />
        <div className="min-w-0 flex-1">
          <div className="flex items-start justify-between gap-2">
            <h3 className="font-semibold leading-snug">{job.title}</h3>
            {saved && <Icon name="bookmark" filled className="size-4 shrink-0 text-secondary" />}
          </div>
          <p className="truncate text-sm text-base-content/70">{company?.name}</p>
          <p className="mt-1 flex items-center gap-1 text-sm text-base-content/60">
            <Icon name="map" className="size-3.5" /> {job.location} ({job.workplace})
          </p>
          <p className="mt-2 text-sm font-medium">{formatSalary(job.salaryMin, job.salaryMax)}</p>
          <div className="mt-3 flex flex-wrap items-center gap-1.5">
            <span className="badge badge-sm badge-outline">{job.type}</span>
            <MatchBadge match={job.match} />
            {applied && <span className="badge badge-sm badge-secondary">Applied</span>}
            <span className={`ml-auto text-xs ${remaining <= 7 ? 'font-semibold text-error' : 'text-base-content/55'}`}>
              {remaining > 0 ? `${remaining} days left` : 'Closed'}
            </span>
          </div>
        </div>
      </div>
    </button>
  )
}
