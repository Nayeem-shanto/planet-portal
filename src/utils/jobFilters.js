import { matchScore } from './matching'

export const DEFAULT_FILTERS = {
  query: '',
  location: '',
  category: '',
  types: [],
  workplace: '',
  maxExperience: '',
  savedOnly: false,
  hideExpired: true,
  sort: 'newest',
}

export const SORT_OPTIONS = [
  { value: 'newest', label: 'Newest first' },
  { value: 'match', label: 'Best match for my CV' },
  { value: 'salary', label: 'Highest salary' },
  { value: 'deadline', label: 'Deadline soonest' },
]

/**
 * Pure function: same input, same output, no side effects.
 * Pure functions are the easiest code to test and reason about,
 * which is why filtering logic lives here and not inside a component.
 */
export function filterAndSortJobs(jobs, filters, { companiesById, savedIds, cv }) {
  const query = filters.query.trim().toLowerCase()
  const location = filters.location.trim().toLowerCase()
  const now = Date.now()

  const result = jobs
    .filter((job) => job.status === 'open')
    .filter((job) => !filters.hideExpired || new Date(job.deadline).getTime() > now)
    .filter((job) => {
      if (!query) return true
      const company = companiesById[job.companyId]?.name ?? ''
      const haystack = [job.title, company, job.category, ...(job.skills ?? [])].join(' ').toLowerCase()
      return haystack.includes(query)
    })
    .filter((job) => !location || job.location.toLowerCase().includes(location))
    .filter((job) => !filters.category || job.category === filters.category)
    .filter((job) => !filters.types.length || filters.types.includes(job.type))
    .filter((job) => !filters.workplace || job.workplace === filters.workplace)
    .filter((job) => filters.maxExperience === '' || Number(job.experienceMin) <= Number(filters.maxExperience))
    .filter((job) => !filters.savedOnly || savedIds.includes(job.id))
    .map((job) => ({ ...job, match: matchScore(job, cv) }))

  const comparators = {
    newest: (a, b) => new Date(b.createdAt) - new Date(a.createdAt),
    match: (a, b) => (b.match?.score ?? -1) - (a.match?.score ?? -1),
    salary: (a, b) => (b.salaryMax || b.salaryMin || 0) - (a.salaryMax || a.salaryMin || 0),
    deadline: (a, b) => new Date(a.deadline) - new Date(b.deadline),
  }
  // toSorted() returns a new array instead of mutating the original.
  return result.toSorted(comparators[filters.sort] ?? comparators.newest)
}
