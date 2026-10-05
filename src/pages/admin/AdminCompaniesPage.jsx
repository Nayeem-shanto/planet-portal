import { useState } from 'react'
import { useAuth } from '../../context/AuthContext'
import { useToast } from '../../context/ToastContext'
import { usePortalData } from '../../hooks/usePortalData'
import { createCompany, deleteCompany, updateCompany } from '../../services/companyService'
import PageHeader from '../../components/ui/PageHeader'
import CompanyLogo from '../../components/ui/CompanyLogo'
import EmptyState from '../../components/ui/EmptyState'
import FullPageLoader from '../../components/ui/FullPageLoader'
import Icon from '../../components/ui/Icon'
import CompanyFormModal from './CompanyFormModal'

export default function AdminCompaniesPage() {
  const { user } = useAuth()
  const notify = useToast()
  const { companies, jobs, loading, reload } = usePortalData(user, { allApplications: true })
  const [editing, setEditing] = useState(undefined)

  async function handleSubmit(data) {
    if (editing) await updateCompany(editing.id, data)
    else await createCompany(data)
    notify(editing ? 'Company profile updated' : 'Company added')
    setEditing(undefined)
    reload()
  }

  async function handleDelete(company) {
    if (!confirm(`Delete ${company.name}?`)) return
    try {
      await deleteCompany(company.id)
      notify('Company deleted')
      reload()
    } catch (err) {
      notify(err.message, 'error')
    }
  }

  if (loading) return <FullPageLoader />

  return (
    <div className="mx-auto max-w-6xl">
      <PageHeader
        title="Companies"
        description="Profiles shown to candidates beside every job post."
        actions={<button className="btn btn-primary" onClick={() => setEditing(null)}><Icon name="plus" className="size-4" /> Add company</button>}
      />
      {companies.length === 0 ? (
        <EmptyState icon="building" title="No companies yet" action={<button className="btn btn-primary btn-sm" onClick={() => setEditing(null)}>Add company</button>}>Add the first Planet company to start posting jobs.</EmptyState>
      ) : (
        <div className="grid gap-4 md:grid-cols-2">
          {companies.map((c) => {
            const openJobs = jobs.filter((j) => j.companyId === c.id && j.status === 'open').length
            return (
              <article key={c.id} className="flex flex-col rounded-box border border-base-300 bg-base-100 p-5">
                <div className="flex items-start gap-3">
                  <CompanyLogo company={c} size="size-12" />
                  <div className="min-w-0 flex-1">
                    <h2 className="text-lg font-bold leading-tight">{c.name}</h2>
                    <p className="text-sm text-base-content/60">{c.industry}, {c.location}</p>
                  </div>
                  <span className="badge badge-soft badge-secondary">{openJobs} open</span>
                </div>
                <p className="mt-3 line-clamp-3 flex-1 text-sm text-base-content/80">{c.about}</p>
                <div className="mt-4 flex justify-end gap-1">
                  <button className="btn btn-ghost btn-sm" onClick={() => setEditing(c)}><Icon name="edit" className="size-4" /> Edit</button>
                  <button className="btn btn-ghost btn-sm text-error" onClick={() => handleDelete(c)}><Icon name="trash" className="size-4" /> Delete</button>
                </div>
              </article>
            )
          })}
        </div>
      )}
      {editing !== undefined && <CompanyFormModal key={editing?.id ?? 'new'} company={editing} onClose={() => setEditing(undefined)} onSubmit={handleSubmit} />}
    </div>
  )
}
