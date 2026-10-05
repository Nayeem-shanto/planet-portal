import { useState } from 'react'
import Modal from '../../components/ui/Modal'
import CompanyLogo from '../../components/ui/CompanyLogo'

const SWATCHES = ['#3f7d4e', '#1e3a2b', '#d99a1e', '#2f7ea8', '#8a5a44', '#7a4fa0', '#c2453b']

export default function CompanyFormModal({ company, onClose, onSubmit }) {
  const [form, setForm] = useState({
    name: company?.name ?? '', industry: company?.industry ?? '', location: company?.location ?? '',
    size: company?.size ?? '', founded: company?.founded ?? '', website: company?.website ?? '',
    about: company?.about ?? '', color: company?.color ?? SWATCHES[0],
  })
  const [error, setError] = useState('')
  const [saving, setSaving] = useState(false)
  const set = (e) => setForm({ ...form, [e.target.name]: e.target.value })

  async function handleSubmit(e) {
    e.preventDefault()
    if (!form.name.trim() || !form.industry.trim()) return setError('Name and industry are required.')
    if (form.website && !/^https?:\/\//.test(form.website)) return setError('Website must start with http:// or https://')
    setSaving(true)
    try {
      await onSubmit({ ...form, name: form.name.trim() })
    } catch (err) {
      setError(err.message)
    } finally {
      setSaving(false)
    }
  }

  const field = (name, label, props = {}) => (
    <label className="block">
      <span className="mb-1 block text-sm font-medium">{label}</span>
      <input name={name} className="input w-full" value={form[name]} onChange={set} {...props} />
    </label>
  )

  return (
    <Modal open onClose={onClose} title={company ? 'Edit company profile' : 'New company'}>
      <form onSubmit={handleSubmit} noValidate className="grid gap-4 sm:grid-cols-2">
        <div className="flex items-center gap-4 sm:col-span-2">
          <CompanyLogo company={form} size="size-14" />
          <div>
            <p className="mb-1.5 text-sm font-medium">Logo colour</p>
            <div className="flex gap-1.5">
              {SWATCHES.map((c) => (
                <button key={c} type="button" onClick={() => setForm({ ...form, color: c })} className={`size-7 rounded-full ${form.color === c ? 'ring-2 ring-offset-2 ring-base-content' : ''}`} style={{ backgroundColor: c }} aria-label={`Colour ${c}`} aria-pressed={form.color === c} />
              ))}
            </div>
          </div>
        </div>
        {field('name', 'Company name', { placeholder: 'Planet …' })}
        {field('industry', 'Industry')}
        {field('location', 'Headquarters')}
        {field('size', 'Size', { placeholder: 'e.g. 250 employees' })}
        {field('founded', 'Founded', { inputMode: 'numeric' })}
        {field('website', 'Website', { type: 'url', placeholder: 'https://' })}
        <label className="block sm:col-span-2">
          <span className="mb-1 block text-sm font-medium">About</span>
          <textarea name="about" className="textarea h-28 w-full" value={form.about} onChange={set} placeholder="What the company does, in two or three sentences. Candidates see this next to every job post." />
        </label>
        {error && <div role="alert" className="alert alert-error alert-soft text-sm sm:col-span-2">{error}</div>}
        <div className="modal-action sm:col-span-2">
          <button type="button" className="btn btn-ghost" onClick={onClose}>Cancel</button>
          <button className="btn btn-primary" disabled={saving}>{company ? 'Save changes' : 'Add company'}</button>
        </div>
      </form>
    </Modal>
  )
}
