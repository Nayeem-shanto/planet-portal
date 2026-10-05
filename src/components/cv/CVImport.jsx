import { useState } from 'react'
import { extractText, parseCVText, SUPPORTED_CV_TYPES } from '../../services/cvParser'
import Icon from '../ui/Icon'

const MAX_SIZE_MB = 10

export default function CVImport({ onImported }) {
  const [status, setStatus] = useState('idle') // idle | reading | done | error
  const [progress, setProgress] = useState(0)
  const [error, setError] = useState('')
  const [result, setResult] = useState(null)
  const [dragging, setDragging] = useState(false)

  async function handleFile(file) {
    if (!file) return
    if (file.size > MAX_SIZE_MB * 1024 * 1024) {
      setStatus('error')
      return setError(`The file is larger than ${MAX_SIZE_MB} MB.`)
    }
    setStatus('reading')
    setError('')
    setProgress(0)
    try {
      const text = await extractText(file, setProgress)
      if (text.trim().length < 30) throw new Error('We could not find readable text in this file. Try a clearer scan or a PDF.')
      setResult({ fileName: file.name, cv: parseCVText(text) })
      setStatus('done')
    } catch (err) {
      setError(err.message)
      setStatus('error')
    }
  }

  const found = result && [
    ['Name', result.cv.personal.fullName],
    ['Email', result.cv.personal.email],
    ['Phone', result.cv.personal.phone],
    ['Jobs', result.cv.experience.length],
    ['Education', result.cv.education.length],
    ['Skills', result.cv.skills.length],
  ]

  return (
    <div className="space-y-4">
      <label
        onDragOver={(e) => { e.preventDefault(); setDragging(true) }}
        onDragLeave={() => setDragging(false)}
        onDrop={(e) => { e.preventDefault(); setDragging(false); handleFile(e.dataTransfer.files[0]) }}
        className={`flex cursor-pointer flex-col items-center rounded-box border-2 border-dashed p-10 text-center transition-colors ${dragging ? 'border-secondary bg-secondary/5' : 'border-base-300 bg-base-100 hover:border-secondary/60'}`}
      >
        <span className="mb-3 grid size-14 place-items-center rounded-full bg-base-200 text-secondary"><Icon name="upload" className="size-7" /></span>
        <span className="text-lg font-semibold">Drop your CV here, or click to choose a file</span>
        <span className="mt-1 text-sm text-base-content/60">PDF, DOCX, PNG or JPG, up to {MAX_SIZE_MB} MB</span>
        <input type="file" className="sr-only" accept={SUPPORTED_CV_TYPES} onChange={(e) => handleFile(e.target.files[0])} />
      </label>

      {status === 'reading' && (
        <div className="rounded-box border border-base-300 bg-base-100 p-5">
          <p className="mb-2 font-medium">Reading your CV…</p>
          <progress className="progress progress-secondary w-full" value={progress || undefined} max="100" />
          <p className="mt-2 text-xs text-base-content/60">Images take longer: the text is recognised in your browser (OCR) and nothing is uploaded to a server.</p>
        </div>
      )}

      {status === 'error' && <div role="alert" className="alert alert-error alert-soft">{error}</div>}

      {status === 'done' && (
        <div className="rounded-box border border-base-300 bg-base-100 p-5">
          <p className="font-semibold">Read {result.fileName}</p>
          <dl className="mt-3 grid grid-cols-2 gap-2 text-sm sm:grid-cols-3">
            {found.map(([label, value]) => (
              <div key={label} className="rounded-lg bg-base-200 p-2.5">
                <dt className="text-xs text-base-content/60">{label}</dt>
                <dd className={`break-all font-medium ${value ? '' : 'text-warning'}`}>{value || 'Not found'}</dd>
              </div>
            ))}
          </dl>
          <p className="mt-3 text-sm text-base-content/70">Every CV is laid out differently, so check each section after importing and fill anything we missed.</p>
          <button className="btn btn-primary mt-4" onClick={() => onImported(result.cv)}>Use this and review</button>
        </div>
      )}
    </div>
  )
}
