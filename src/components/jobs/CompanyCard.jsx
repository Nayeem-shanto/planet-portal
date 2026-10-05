import CompanyLogo from '../ui/CompanyLogo'
import Icon from '../ui/Icon'

export default function CompanyCard({ company, openRoles }) {
  if (!company) return null
  return (
    <aside className="rounded-box border border-base-300 bg-base-100 p-5">
      <h3 className="mb-4 text-sm font-semibold text-base-content/60">About the company</h3>
      <div className="flex items-center gap-3">
        <CompanyLogo company={company} size="size-12" />
        <div>
          <p className="font-display text-lg font-bold leading-tight">{company.name}</p>
          <p className="text-sm text-base-content/60">{company.industry}</p>
        </div>
      </div>
      <p className="mt-4 text-sm leading-relaxed text-base-content/80">{company.about}</p>
      <dl className="mt-4 space-y-2 text-sm">
        <div className="flex justify-between gap-2"><dt className="text-base-content/60">Headquarters</dt><dd className="text-right font-medium">{company.location}</dd></div>
        <div className="flex justify-between gap-2"><dt className="text-base-content/60">Size</dt><dd className="font-medium">{company.size}</dd></div>
        <div className="flex justify-between gap-2"><dt className="text-base-content/60">Founded</dt><dd className="font-medium">{company.founded}</dd></div>
        <div className="flex justify-between gap-2"><dt className="text-base-content/60">Open roles</dt><dd className="font-medium">{openRoles}</dd></div>
      </dl>
      {company.website && (
        <a href={company.website} target="_blank" rel="noopener noreferrer" className="btn btn-outline btn-sm mt-5 w-full">
          <Icon name="globe" className="size-4" /> Visit website
        </a>
      )}
    </aside>
  )
}
