import { useState } from 'react'
import { newCertification, newEducation, newExperience } from '../../services/cvService'
import { splitList } from '../../utils/format'
import Icon from '../ui/Icon'

function Field({ label, className = '', ...props }) {
  return (
    <label className={`block ${className}`}>
      <span className="mb-1 block text-sm font-medium">{label}</span>
      <input className="input input-sm w-full" {...props} />
    </label>
  )
}

function Card({ title, children, action }) {
  return (
    <section className="rounded-box border border-base-300 bg-base-100 p-5">
      <div className="mb-4 flex items-center justify-between gap-2">
        <h2 className="text-lg font-bold">{title}</h2>
        {action}
      </div>
      {children}
    </section>
  )
}

/** Text box for a list (skills, languages). Keeps the raw text so typing a comma feels natural. */
function ListInput({ label, value, onChange, placeholder }) {
  const [text, setText] = useState(value.join(', '))
  return (
    <label className="block">
      <span className="mb-1 block text-sm font-medium">{label}</span>
      <textarea
        className="textarea textarea-sm h-20 w-full"
        value={text}
        placeholder={placeholder}
        onChange={(e) => {
          setText(e.target.value)
          onChange(splitList(e.target.value))
        }}
      />
      {value.length > 0 && (
        <div className="mt-2 flex flex-wrap gap-1">
          {value.map((v) => <span key={v} className="badge badge-sm bg-base-200">{v}</span>)}
        </div>
      )}
    </label>
  )
}

export default function CVForm({ cv, onChange }) {
  const setPersonal = (key, value) => onChange({ ...cv, personal: { ...cv.personal, [key]: value } })

  // Generic helpers for list sections: update / add / remove one item by id.
  const updateItem = (section, id, key, value) =>
    onChange({ ...cv, [section]: cv[section].map((item) => (item.id === id ? { ...item, [key]: value } : item)) })
  const addItem = (section, factory) => onChange({ ...cv, [section]: [...cv[section], factory()] })
  const removeItem = (section, id) => onChange({ ...cv, [section]: cv[section].filter((item) => item.id !== id) })

  const p = cv.personal
  const addButton = (section, factory, label) => (
    <button type="button" className="btn btn-ghost btn-sm text-secondary" onClick={() => addItem(section, factory)}>
      <Icon name="plus" className="size-4" /> {label}
    </button>
  )
  const removeButton = (section, id) => (
    <button type="button" className="btn btn-ghost btn-xs text-error" onClick={() => removeItem(section, id)}>
      <Icon name="trash" className="size-3.5" /> Remove
    </button>
  )

  return (
    <div className="space-y-4">
      <Card title="Personal details">
        <div className="grid gap-3 sm:grid-cols-2">
          <Field label="Full name" value={p.fullName} onChange={(e) => setPersonal('fullName', e.target.value)} />
          <Field label="Professional headline" placeholder="e.g. Frontend Developer" value={p.title} onChange={(e) => setPersonal('title', e.target.value)} />
          <Field label="Email" type="email" value={p.email} onChange={(e) => setPersonal('email', e.target.value)} />
          <Field label="Phone" value={p.phone} onChange={(e) => setPersonal('phone', e.target.value)} />
          <Field label="Address" className="sm:col-span-2" value={p.address} onChange={(e) => setPersonal('address', e.target.value)} />
          <Field label="LinkedIn" value={p.linkedin} onChange={(e) => setPersonal('linkedin', e.target.value)} />
          <Field label="Website or portfolio" value={p.website} onChange={(e) => setPersonal('website', e.target.value)} />
          <label className="block sm:col-span-2">
            <span className="mb-1 block text-sm font-medium">Professional summary</span>
            <textarea className="textarea textarea-sm h-24 w-full" placeholder="Two or three sentences: who you are, what you do well, and what you want next." value={p.summary} onChange={(e) => setPersonal('summary', e.target.value)} />
          </label>
        </div>
      </Card>

      <Card title="Work experience" action={addButton('experience', newExperience, 'Add job')}>
        {cv.experience.length === 0 && <p className="text-sm text-base-content/60">No experience yet? Internships, part-time work and volunteering count.</p>}
        <div className="space-y-4">
          {cv.experience.map((item) => (
            <div key={item.id} className="rounded-lg border border-base-300 p-4">
              <div className="grid gap-3 sm:grid-cols-2">
                <Field label="Job title" value={item.role} onChange={(e) => updateItem('experience', item.id, 'role', e.target.value)} />
                <Field label="Company" value={item.company} onChange={(e) => updateItem('experience', item.id, 'company', e.target.value)} />
                <Field label="Location" value={item.location} onChange={(e) => updateItem('experience', item.id, 'location', e.target.value)} />
                <div className="grid grid-cols-2 gap-3">
                  <Field label="Start year" inputMode="numeric" value={item.start} onChange={(e) => updateItem('experience', item.id, 'start', e.target.value)} />
                  <Field label="End year" inputMode="numeric" disabled={item.current} value={item.current ? '' : item.end} onChange={(e) => updateItem('experience', item.id, 'end', e.target.value)} />
                </div>
                <label className="label cursor-pointer gap-2 text-sm sm:col-span-2">
                  <input type="checkbox" className="checkbox checkbox-sm checkbox-secondary" checked={item.current} onChange={(e) => updateItem('experience', item.id, 'current', e.target.checked)} />
                  I currently work here
                </label>
                <label className="block sm:col-span-2">
                  <span className="mb-1 block text-sm font-medium">What you did (one point per line)</span>
                  <textarea className="textarea textarea-sm h-24 w-full" value={item.details} onChange={(e) => updateItem('experience', item.id, 'details', e.target.value)} placeholder="Start each line with a verb and a result, e.g. Cut page load time by 40%" />
                </label>
              </div>
              <div className="mt-2 text-right">{removeButton('experience', item.id)}</div>
            </div>
          ))}
        </div>
      </Card>

      <Card title="Education" action={addButton('education', newEducation, 'Add education')}>
        <div className="space-y-4">
          {cv.education.map((item) => (
            <div key={item.id} className="rounded-lg border border-base-300 p-4">
              <div className="grid gap-3 sm:grid-cols-2">
                <Field label="Degree" value={item.degree} onChange={(e) => updateItem('education', item.id, 'degree', e.target.value)} />
                <Field label="Institution" value={item.institution} onChange={(e) => updateItem('education', item.id, 'institution', e.target.value)} />
                <Field label="Result" placeholder="e.g. CGPA 3.60/4.00" value={item.result} onChange={(e) => updateItem('education', item.id, 'result', e.target.value)} />
                <div className="grid grid-cols-2 gap-3">
                  <Field label="Start year" inputMode="numeric" value={item.start} onChange={(e) => updateItem('education', item.id, 'start', e.target.value)} />
                  <Field label="End year" inputMode="numeric" value={item.end} onChange={(e) => updateItem('education', item.id, 'end', e.target.value)} />
                </div>
              </div>
              <div className="mt-2 text-right">{removeButton('education', item.id)}</div>
            </div>
          ))}
        </div>
      </Card>

      <Card title="Skills and languages">
        <div className="grid gap-4">
          <ListInput label="Skills (separate with commas)" placeholder="JavaScript, React, Tailwind CSS, Git" value={cv.skills} onChange={(skills) => onChange({ ...cv, skills })} />
          <ListInput label="Languages" placeholder="Bangla, English" value={cv.languages} onChange={(languages) => onChange({ ...cv, languages })} />
        </div>
      </Card>

      <Card title="Certifications" action={addButton('certifications', newCertification, 'Add certification')}>
        <div className="space-y-3">
          {cv.certifications.map((item) => (
            <div key={item.id} className="grid items-end gap-3 sm:grid-cols-[2fr_1.5fr_0.8fr_auto]">
              <Field label="Name" value={item.name} onChange={(e) => updateItem('certifications', item.id, 'name', e.target.value)} />
              <Field label="Issuer" value={item.issuer} onChange={(e) => updateItem('certifications', item.id, 'issuer', e.target.value)} />
              <Field label="Year" value={item.year} onChange={(e) => updateItem('certifications', item.id, 'year', e.target.value)} />
              <button type="button" className="btn btn-ghost btn-sm btn-square text-error" onClick={() => removeItem('certifications', item.id)} aria-label="Remove certification">
                <Icon name="trash" className="size-4" />
              </button>
            </div>
          ))}
        </div>
      </Card>
    </div>
  )
}
