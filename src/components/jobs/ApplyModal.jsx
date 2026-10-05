import { useState } from 'react'
import { Link } from 'react-router-dom'
import Modal from '../ui/Modal'
import { applyToJob } from '../../services/applicationService'
import { cvCompleteness } from '../../services/cvService'
import { useToast } from '../../context/ToastContext'

export default function ApplyModal({ job, company, user, cv, onClose, onApplied }) {
  const [coverLetter, setCoverLetter] = useState('')
  const [error, setError] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const notify = useToast()
  const completeness = cvCompleteness(cv)

  async function handleSubmit(e) {
    e.preventDefault()
    setSubmitting(true)
    setError('')
    try {
      await applyToJob({ job, user, cv, coverLetter })
      notify(`Application sent to ${company?.name}`)
      onApplied()
    } catch (err) {
      setError(err.message)
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <Modal open={Boolean(job)} onClose={onClose} title={`Apply: ${job?.title ?? ''}`}>
      {!cv ? (
        <div className="space-y-4">
          <p>You need a CV before applying. Build one, or upload an existing CV and we’ll fill in the form for you.</p>
          <Link to="/app/cv" className="btn btn-primary">Create my CV</Link>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="flex items-center gap-4 rounded-box bg-base-200 p-4">
            <div className="radial-progress text-secondary text-sm font-semibold" style={{ '--value': completeness, '--size': '3.5rem' }} role="progressbar" aria-valuenow={completeness}>
              {completeness}%
            </div>
            <div className="text-sm">
              <p className="font-semibold">{cv.personal.fullName}{cv.personal.title && `, ${cv.personal.title}`}</p>
              <p className="text-base-content/70">Your current CV will be attached. <Link to="/app/cv" className="link">Edit CV</Link></p>
            </div>
          </div>

          <label className="block">
            <span className="mb-1.5 block text-sm font-medium">Cover letter (optional)</span>
            <textarea className="textarea h-36 w-full" value={coverLetter} onChange={(e) => setCoverLetter(e.target.value)} placeholder={`Why are you a good fit for ${company?.name}?`} />
          </label>

          {error && <div role="alert" className="alert alert-error alert-soft text-sm">{error}</div>}

          <div className="modal-action mt-0">
            <button type="button" className="btn btn-ghost" onClick={onClose}>Cancel</button>
            <button className="btn btn-primary" disabled={submitting}>
              {submitting && <span className="loading loading-spinner loading-sm" />}
              Send application
            </button>
          </div>
        </form>
      )}
    </Modal>
  )
}
