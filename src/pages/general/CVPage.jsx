import { useEffect, useState } from 'react'
import { useAuth } from '../../context/AuthContext'
import { useToast } from '../../context/ToastContext'
import { emptyCV, getCV, saveCV } from '../../services/cvService'
import CVForm from '../../components/cv/CVForm'
import CVPreview from '../../components/cv/CVPreview'
import CVImport from '../../components/cv/CVImport'
import PageHeader from '../../components/ui/PageHeader'
import FullPageLoader from '../../components/ui/FullPageLoader'
import Icon from '../../components/ui/Icon'

export default function CVPage() {
  const { user } = useAuth()
  const notify = useToast()
  const [cv, setCV] = useState(null)
  const [savedJSON, setSavedJSON] = useState('') // snapshot of the last saved version
  const [tab, setTab] = useState('form')
  const [formKey, setFormKey] = useState(0) // bump to remount the form after an import
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    getCV(user.id).then((existing) => {
      // New users get their name and email pre-filled from their account.
      const initial = existing ?? { ...emptyCV(), personal: { ...emptyCV().personal, fullName: user.name, email: user.email } }
      setCV(initial)
      setSavedJSON(existing ? JSON.stringify(existing) : '')
    })
  }, [user])

  const isDirty = cv && JSON.stringify(cv) !== savedJSON

  // Warn before closing the tab with unsaved changes.
  useEffect(() => {
    if (!isDirty) return
    const warn = (e) => e.preventDefault()
    window.addEventListener('beforeunload', warn)
    return () => window.removeEventListener('beforeunload', warn)
  }, [isDirty])

  async function handleSave() {
    if (!cv.personal.fullName.trim()) return notify('Add your full name before saving.', 'error')
    setSaving(true)
    try {
      const saved = await saveCV(user.id, cv)
      setSavedJSON(JSON.stringify(saved))
      notify('CV saved')
    } finally {
      setSaving(false)
    }
  }

  function handleImported(importedCV) {
    if (savedJSON && !confirm('Replace your current CV with the imported one? You can still edit it before saving.')) return
    setCV(importedCV)
    setFormKey((k) => k + 1)
    setTab('form')
    notify('CV imported. Review each section, then save.', 'info')
  }

  if (!cv) return <FullPageLoader />

  return (
    <div className="mx-auto max-w-[1500px]">
      <PageHeader
        title="My CV"
        description="Fill in the form or import an existing CV. The preview updates as you type and is what employers receive."
        actions={
          <>
            <button className="btn btn-outline" onClick={() => window.print()}>
              <Icon name="printer" className="size-4" /> Download PDF
            </button>
            <button className="btn btn-primary" onClick={handleSave} disabled={saving || !isDirty}>
              {saving && <span className="loading loading-spinner loading-sm" />}
              {isDirty ? 'Save CV' : 'Saved'}
            </button>
          </>
        }
      />

      <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_minmax(0,1fr)]">
        <div>
          <div role="tablist" className="tabs tabs-box mb-4 w-fit bg-base-300/60">
            <button role="tab" className={`tab ${tab === 'form' ? 'tab-active' : ''}`} onClick={() => setTab('form')}>Fill in the form</button>
            <button role="tab" className={`tab ${tab === 'import' ? 'tab-active' : ''}`} onClick={() => setTab('import')}>Import existing CV</button>
          </div>
          {tab === 'form' ? <CVForm key={formKey} cv={cv} onChange={setCV} /> : <CVImport onImported={handleImported} />}
        </div>

        <div className="xl:sticky xl:top-24 xl:self-start">
          <p className="mb-2 text-sm text-base-content/60">Preview (A4). Use Download PDF and choose “Save as PDF”.</p>
          <CVPreview cv={cv} id="cv-print" />
        </div>
      </div>
    </div>
  )
}
