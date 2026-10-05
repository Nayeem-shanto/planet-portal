import { JOB_CATEGORIES, JOB_TYPES, WORKPLACES } from '../../data/constants'
import { SORT_OPTIONS } from '../../utils/jobFilters'
import Icon from '../ui/Icon'

export default function JobFilters({ filters, onChange, onReset, hasCV, resultCount }) {
  const set = (key, value) => onChange({ ...filters, [key]: value })
  const toggleType = (type) =>
    set('types', filters.types.includes(type) ? filters.types.filter((t) => t !== type) : [...filters.types, type])

  return (
    <div className="space-y-3">
      <div className="grid gap-2 rounded-box border border-base-300 bg-base-100 p-2 md:grid-cols-[1.4fr_1fr_auto]">
        <label className="input w-full border-0 bg-transparent shadow-none focus-within:outline-none">
          <Icon name="search" className="size-4 opacity-60" />
          <input type="search" placeholder="Job title, skill or company" value={filters.query} onChange={(e) => set('query', e.target.value)} aria-label="Search jobs" />
        </label>
        <label className="input w-full border-0 bg-transparent shadow-none md:border-l md:border-base-300 md:rounded-none focus-within:outline-none">
          <Icon name="map" className="size-4 opacity-60" />
          <input type="search" placeholder="City or area" value={filters.location} onChange={(e) => set('location', e.target.value)} aria-label="Location" />
        </label>
        <select className="select w-full md:w-56" value={filters.sort} onChange={(e) => set('sort', e.target.value)} aria-label="Sort jobs">
          {SORT_OPTIONS.map((o) => (
            <option key={o.value} value={o.value} disabled={o.value === 'match' && !hasCV}>
              {o.label}{o.value === 'match' && !hasCV ? ' (add a CV first)' : ''}
            </option>
          ))}
        </select>
      </div>

      <div className="flex flex-wrap items-center gap-2">
        <select className="select select-sm w-auto" value={filters.category} onChange={(e) => set('category', e.target.value)} aria-label="Category">
          <option value="">All categories</option>
          {JOB_CATEGORIES.map((c) => <option key={c}>{c}</option>)}
        </select>
        <select className="select select-sm w-auto" value={filters.workplace} onChange={(e) => set('workplace', e.target.value)} aria-label="Workplace">
          <option value="">Any workplace</option>
          {WORKPLACES.map((w) => <option key={w}>{w}</option>)}
        </select>
        <select className="select select-sm w-auto" value={filters.maxExperience} onChange={(e) => set('maxExperience', e.target.value)} aria-label="Experience">
          <option value="">Any experience</option>
          <option value="0">No experience needed</option>
          <option value="1">Up to 1 year</option>
          <option value="2">Up to 2 years</option>
          <option value="3">Up to 3 years</option>
          <option value="5">Up to 5 years</option>
        </select>

        <div className="join">
          {JOB_TYPES.map((type) => (
            <input
              key={type}
              type="checkbox"
              className="btn btn-sm join-item border-base-300 bg-base-100 font-medium checked:border-secondary checked:bg-secondary checked:text-secondary-content"
              aria-label={type}
              checked={filters.types.includes(type)}
              onChange={() => toggleType(type)}
            />
          ))}
        </div>

        <label className="label cursor-pointer gap-2 text-sm">
          <input type="checkbox" className="toggle toggle-sm toggle-secondary" checked={filters.savedOnly} onChange={(e) => set('savedOnly', e.target.checked)} />
          Saved only
        </label>

        <span className="ml-auto text-sm text-base-content/60">{resultCount} {resultCount === 1 ? 'job' : 'jobs'}</span>
        <button className="btn btn-ghost btn-sm" onClick={onReset}>Clear filters</button>
      </div>
    </div>
  )
}
