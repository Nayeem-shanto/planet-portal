import { useState } from 'react'
import { Link, useLocation, useNavigate, useSearchParams } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import AuthLayout from './AuthLayout'
import PanelTabs from './PanelTabs'

export default function LoginPage() {
  const [params, setParams] = useSearchParams()
  const panel = params.get('panel') === 'admin' ? 'admin' : 'general'
  const { login } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()

  const [form, setForm] = useState({ email: '', password: '' })
  const [error, setError] = useState('')
  const [submitting, setSubmitting] = useState(false)

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value })

  async function handleSubmit(e) {
    e.preventDefault()
    setError('')
    setSubmitting(true)
    try {
      await login({ ...form, panel })
      // Send people back to the page they originally tried to open.
      const fallback = panel === 'admin' ? '/admin' : '/app'
      navigate(location.state?.from?.pathname ?? fallback, { replace: true })
    } catch (err) {
      setError(err.message)
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <AuthLayout>
      <h2 className="text-3xl font-bold">Sign in</h2>
      <p className="mb-6 mt-2 text-base-content/70">
        {panel === 'admin' ? 'Manage job posts, companies and applicants.' : 'Find roles across the Planet group and track your applications.'}
      </p>

      <PanelTabs panel={panel} onChange={(value) => { setError(''); setParams({ panel: value }) }} />

      <form onSubmit={handleSubmit} className="space-y-4" noValidate>
        <label className="block">
          <span className="mb-1.5 block text-sm font-medium">Email</span>
          <input className="input w-full" type="email" name="email" autoComplete="email" required value={form.email} onChange={handleChange} />
        </label>
        <label className="block">
          <span className="mb-1.5 block text-sm font-medium">Password</span>
          <input className="input w-full" type="password" name="password" autoComplete="current-password" required value={form.password} onChange={handleChange} />
        </label>

        {error && <div role="alert" className="alert alert-error alert-soft text-sm">{error}</div>}

        <button className="btn btn-primary btn-block" disabled={submitting}>
          {submitting && <span className="loading loading-spinner loading-sm" />}
          {panel === 'admin' ? 'Sign in to admin panel' : 'Sign in'}
        </button>
      </form>

      <p className="mt-6 text-center text-sm text-base-content/70">
        New here?{' '}
        <Link to={`/register?panel=${panel}`} className="link link-secondary font-semibold">
          {panel === 'admin' ? 'Create an admin account' : 'Create an account'}
        </Link>
      </p>
    </AuthLayout>
  )
}
