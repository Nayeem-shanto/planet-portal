import CompanyLogo from '../ui/CompanyLogo'
import Icon from '../ui/Icon'
import CompanyCard from './CompanyCard'
import MatchBadge from './MatchBadge'
import { daysLeft, formatDate, formatSalary } from '../../utils/format'

function Section({ title, items }) {
  if (!items?.length) return null
  return (
    <section className="mt-7">
      <h3 className="mb-2 text-lg font-semibold">{title}</h3>
      <ul className="space-y-1.5">
        {items.map((item) => (
          <li key={item} className="flex gap-2.5 text-base-content/85">
            <span className="mt-2 size-1.5 shrink-0 rounded-full bg-secondary" /> {item}
          </li>
        ))}
      </ul>
    </section>
  )
}

export default function JobDetail({ job, company, openRoles, saved, applied, onToggleSave, onApply, onBack }) {
  const remaining = daysLeft(job.deadline)
  const facts = [
    ['Salary', formatSalary(job.salaryMin, job.salaryMax)],
    ['Experience', job.experienceMin > 0 ? `${job.experienceMin}+ years` : 'Not required'],
    ['Vacancies', job.vacancies],
    ['Deadline', formatDate(job.deadline)],
  ]

  return (
    <div className="@container">
    <div className="grid gap-5 @3xl:grid-cols-[minmax(0,1fr)_260px] @2xl:grid-cols-[minmax(0,1fr)_240px]">
      <article className="@container/article min-w-0 rounded-box border border-base-300 bg-base-100 p-5 sm:p-7">
        {onBack && (
          <button className="btn btn-ghost btn-sm -ml-2 mb-4 xl:hidden" onClick={onBack}>← All jobs</button>
        )}
        <div className="flex flex-wrap items-start gap-4">
          <CompanyLogo company={company} size="size-14" />
          <div className="min-w-0 flex-1">
            <h2 className="text-2xl font-bold leading-tight">{job.title}</h2>
            <p className="mt-1 text-base-content/70">{company?.name}, {job.location}</p>
            <div className="mt-3 flex flex-wrap gap-1.5">
              <span className="badge badge-outline">{job.type}</span>
              <span className="badge badge-outline">{job.workplace}</span>
              <span className="badge badge-outline">{job.category}</span>
            </div>
          </div>
        </div>

        <div className="mt-6 flex flex-wrap gap-2">
          <button className="btn btn-primary" onClick={onApply} disabled={applied || remaining <= 0}>
            {applied ? <><Icon name="check" className="size-4" /> Applied</> : remaining <= 0 ? 'Applications closed' : 'Apply now'}
          </button>
          <button className={`btn ${saved ? 'btn-secondary' : 'btn-outline'}`} onClick={onToggleSave} aria-pressed={saved}>
            <Icon name="bookmark" filled={saved} className="size-4" /> {saved ? 'Saved' : 'Save'}
          </button>
        </div>

        <dl className="mt-6 grid grid-cols-2 gap-px overflow-hidden rounded-box border border-base-300 bg-base-300 @lg/article:grid-cols-4">
          {facts.map(([label, value]) => (
            <div key={label} className="bg-base-100 p-3">
              <dt className="text-xs text-base-content/60">{label}</dt>
              <dd className="mt-0.5 text-sm font-semibold">{value}</dd>
            </div>
          ))}
        </dl>

        {job.match && (
          <div className="mt-6 rounded-box bg-base-200 p-4">
            <div className="flex items-center justify-between gap-2">
              <p className="font-semibold">How your CV fits</p>
              <MatchBadge match={job.match} size="badge-md" />
            </div>
            <div className="mt-3 flex flex-wrap gap-1.5">
              {job.match.matchedSkills.map((s) => <span key={s} className="badge badge-success badge-soft">✓ {s}</span>)}
              {job.match.missingSkills.map((s) => <span key={s} className="badge badge-ghost text-base-content/60">{s}</span>)}
            </div>
            {job.match.missingSkills.length > 0 && (
              <p className="mt-2 text-xs text-base-content/60">Grey skills are not on your CV yet. If you have them, add them to your CV.</p>
            )}
          </div>
        )}

        <section className="mt-7">
          <h3 className="mb-2 text-lg font-semibold">About the role</h3>
          <p className="max-w-prose leading-relaxed text-base-content/85">{job.description}</p>
        </section>
        <Section title="What you will do" items={job.responsibilities} />
        <Section title="What we are looking for" items={job.requirements} />
        <Section title="Benefits" items={job.benefits} />
        {job.skills?.length > 0 && (
          <section className="mt-7">
            <h3 className="mb-2 text-lg font-semibold">Skills</h3>
            <div className="flex flex-wrap gap-1.5">
              {job.skills.map((s) => <span key={s} className="badge badge-lg bg-base-200">{s}</span>)}
            </div>
          </section>
        )}
      </article>

      <div className="@2xl:sticky @2xl:top-24 @2xl:self-start">
        <CompanyCard company={company} openRoles={openRoles} />
      </div>
    </div>
    </div>
  )
}
