import { useState } from 'react'
import { Link, useNavigate, useSearchParams } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import { useToast } from '../../context/ToastContext'
import { ADMIN_ACCESS_CODE, GENERAL_ROLES } from '../../data/constants'
import AuthLayout from './AuthLayout'
import PanelTabs from './PanelTabs'

const initialForm = { name: '', email: '', password: '', confirm: '', role: 'student', department: '', accessCode: '' }

export default function RegisterPage() {
  const [params, setParams] = useSearchParams()
  const panel = params.get('panel') === 'admin' ? 'admin' : 'general'
  const { register } = useAuth()
  const notify = useToast()
  const navigate = useNavigate()

  const [form, setForm] = useState(initialForm)
  const [error, setError] = useState('')
  const [submitting, setSubmitting] = useState(false)

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value })

  async function handleSubmit(e) {
    e.preventDefault()
    setError('')
    if (form.password !== form.confirm) return setError('The two passwords do not match.')

    setSubmitting(true)
    try {
      await register({ ...form, panel })
      notify('Account created. Sign in to continue.')
      navigate(`/login?panel=${panel}`)
    } catch (err) {
      setError(err.message)
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <AuthLayout>
      <h2 className="text-3xl font-bold">Create your account</h2>
      <p className="mb-6 mt-2 text-base-content/70">
        {panel === 'admin' ? 'Admin accounts need an access code from the group HR team.' : 'For students and employees of the Planet group.'}
      </p>

      <PanelTabs panel={panel} onChange={(value) => { setError(''); setParams({ panel: value }) }} />

      <form onSubmit={handleSubmit} className="space-y-4" noValidate>
        <label className="block">
          <span className="mb-1.5 block text-sm font-medium">Full name</span>
          <input className="input w-full" name="name" autoComplete="name" required value={form.name} onChange={handleChange} />
        </label>
        <label className="block">
          <span className="mb-1.5 block text-sm font-medium">Email</span>
          <input className="input w-full" type="email" name="email" autoComplete="email" required value={form.email} onChange={handleChange} />
        </label>

        {panel === 'general' && (
          <div className="grid gap-4 sm:grid-cols-2">
            <label className="block">
              <span className="mb-1.5 block text-sm font-medium">I am a</span>
              <select className="select w-full" name="role" value={form.role} onChange={handleChange}>
                {GENERAL_ROLES.map((r) => <option key={r.value} value={r.value}>{r.label}</option>)}
              </select>
            </label>
            <label className="block">
              <span className="mb-1.5 block text-sm font-medium">{form.role === 'student' ? 'Institution' : 'Department'}</span>
              <input className="input w-full" name="department" value={form.department} onChange={handleChange} placeholder="Optional" />
            </label>
          </div>
        )}

        <div className="grid gap-4 sm:grid-cols-2">
          <label className="block">
            <span className="mb-1.5 block text-sm font-medium">Password</span>
            <input className="input w-full" type="password" name="password" autoComplete="new-password" minLength={8} required value={form.password} onChange={handleChange} />
            <span className="mt-1 block text-xs text-base-content/60">At least 8 characters</span>
          </label>
          <label className="block">
            <span className="mb-1.5 block text-sm font-medium">Confirm password</span>
            <input className="input w-full" type="password" name="confirm" autoComplete="new-password" required value={form.confirm} onChange={handleChange} />
          </label>
        </div>

        {panel === 'admin' && (
          <label className="block">
            <span className="mb-1.5 block text-sm font-medium">Admin access code</span>
            <input className="input w-full" name="accessCode" required value={form.accessCode} onChange={handleChange} />
            <span className="mt-1 block text-xs text-base-content/60">Demo code: <code className="font-semibold">{ADMIN_ACCESS_CODE}</code></span>
          </label>
        )}

        {error && <div role="alert" className="alert alert-error alert-soft text-sm">{error}</div>}

        <button className="btn btn-primary btn-block" disabled={submitting}>
          {submitting && <span className="loading loading-spinner loading-sm" />}
          Create account
        </button>
      </form>

      <p className="mt-6 text-center text-sm text-base-content/70">
        Already have an account?{' '}
        <Link to={`/login?panel=${panel}`} className="link link-secondary font-semibold">Sign in</Link>
      </p>
    </AuthLayout>
  )
}
