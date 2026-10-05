import { useState } from 'react'
import Modal from '../../components/ui/Modal'
import { JOB_CATEGORIES, JOB_TYPES, WORKPLACES } from '../../data/constants'
import { splitLines, splitList } from '../../utils/format'

// Lists are edited as text (one item per line) and stored as arrays.
const toForm = (job, companies) => ({
  title: job?.title ?? '',
  companyId: job?.companyId ?? companies[0]?.id ?? '',
  category: job?.category ?? JOB_CATEGORIES[0],
  type: job?.type ?? JOB_TYPES[0],
  workplace: job?.workplace ?? WORKPLACES[0],
  location: job?.location ?? '',
  experienceMin: job?.experienceMin ?? 0,
  salaryMin: job?.salaryMin ?? '',
  salaryMax: job?.salaryMax ?? '',
  vacancies: job?.vacancies ?? 1,
  deadline: job?.deadline?.slice(0, 10) ?? '',
  description: job?.description ?? '',
  responsibilities: job?.responsibilities?.join('\n') ?? '',
  requirements: job?.requirements?.join('\n') ?? '',
  benefits: job?.benefits?.join('\n') ?? '',
  skills: job?.skills?.join(', ') ?? '',
})

function validate(form) {
  const errors = {}
  if (!form.title.trim()) errors.title = 'Add a job title.'
  if (!form.companyId) errors.companyId = 'Choose a company.'
  if (!form.location.trim()) errors.location = 'Add a location.'
  if (!form.deadline) errors.deadline = 'Set a deadline.'
  else if (new Date(form.deadline) < new Date(new Date().toDateString())) errors.deadline = 'The deadline must be today or later.'
  if (form.salaryMin && form.salaryMax && Number(form.salaryMin) > Number(form.salaryMax)) errors.salaryMax = 'Maximum must be higher than minimum.'
  if (form.description.trim().length < 30) errors.description = 'Write at least a short paragraph (30+ characters).'
  return errors
}

export default function JobFormModal({ open, job, companies, onClose, onSubmit }) {
  const [form, setForm] = useState(() => toForm(job, companies))
  const [errors, setErrors] = useState({})
  const [saving, setSaving] = useState(false)

  const set = (e) => setForm({ ...form, [e.target.name]: e.target.value })

  async function handleSubmit(e) {
    e.preventDefault()
    const found = validate(form)
    setErrors(found)
    if (Object.keys(found).length) return

    setSaving(true)
    try {
      await onSubmit({
        ...form,
        title: form.title.trim(),
        experienceMin: Number(form.experienceMin) || 0,
        salaryMin: Number(form.salaryMin) || null,
        salaryMax: Number(form.salaryMax) || null,
        vacancies: Number(form.vacancies) || 1,
        deadline: new Date(`${form.deadline}T23:59:59`).toISOString(),
        responsibilities: splitLines(form.responsibilities),
        requirements: splitLines(form.requirements),
        benefits: splitLines(form.benefits),
        skills: splitList(form.skills),
      })
    } finally {
      setSaving(false)
    }
  }

  const input = (name, label, props = {}) => (
    <label className="block">
      <span className="mb-1 block text-sm font-medium">{label}</span>
      <input name={name} className={`input w-full ${errors[name] ? 'input-error' : ''}`} value={form[name]} onChange={set} {...props} />
      {errors[name] && <span className="mt-1 block text-xs text-error">{errors[name]}</span>}
    </label>
  )
  const select = (name, label, options) => (
    <label className="block">
      <span className="mb-1 block text-sm font-medium">{label}</span>
      <select name={name} className="select w-full" value={form[name]} onChange={set}>
        {options.map((o) => (typeof o === 'string' ? <option key={o}>{o}</option> : <option key={o.value} value={o.value}>{o.label}</option>))}
      </select>
    </label>
  )
  const textarea = (name, label, hint, rows = 'h-24') => (
    <label className="block sm:col-span-2">
      <span className="mb-1 block text-sm font-medium">{label}</span>
      <textarea name={name} className={`textarea w-full ${rows} ${errors[name] ? 'textarea-error' : ''}`} value={form[name]} onChange={set} />
      {errors[name] ? <span className="mt-1 block text-xs text-error">{errors[name]}</span> : hint && <span className="mt-1 block text-xs text-base-content/60">{hint}</span>}
    </label>
  )

  return (
    <Modal open={open} onClose={onClose} title={job ? 'Edit job post' : 'New job post'} size="max-w-3xl">
      <form onSubmit={handleSubmit} noValidate className="grid gap-4 sm:grid-cols-2">
        <div className="sm:col-span-2">{input('title', 'Job title', { placeholder: 'e.g. Junior Frontend Developer' })}</div>
        {select('companyId', 'Company', companies.map((c) => ({ value: c.id, label: c.name })))}
        {select('category', 'Category', JOB_CATEGORIES)}
        {select('type', 'Job type', JOB_TYPES)}
        {select('workplace', 'Workplace', WORKPLACES)}
        {input('location', 'Location', { placeholder: 'e.g. Banani, Dhaka' })}
        {input('deadline', 'Application deadline', { type: 'date' })}
        {input('salaryMin', 'Minimum monthly salary (৳)', { type: 'number', min: 0 })}
        {input('salaryMax', 'Maximum monthly salary (৳)', { type: 'number', min: 0 })}
        {input('experienceMin', 'Minimum experience (years)', { type: 'number', min: 0 })}
        {input('vacancies', 'Vacancies', { type: 'number', min: 1 })}
        {textarea('description', 'About the role', null, 'h-28')}
        {textarea('responsibilities', 'Responsibilities', 'One per line')}
        {textarea('requirements', 'Requirements', 'One per line')}
        {textarea('benefits', 'Benefits', 'One per line')}
        {textarea('skills', 'Skills', 'Separate with commas. Used to match candidates’ CVs.', 'h-16')}

        <div className="modal-action sm:col-span-2">
          <button type="button" className="btn btn-ghost" onClick={onClose}>Cancel</button>
          <button className="btn btn-primary" disabled={saving}>
            {saving && <span className="loading loading-spinner loading-sm" />}
            {job ? 'Save changes' : 'Publish job'}
          </button>
        </div>
      </form>
    </Modal>
  )
}
