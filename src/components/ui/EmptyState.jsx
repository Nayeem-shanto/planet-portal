import Icon from './Icon'

export default function EmptyState({ icon = 'inbox', title, children, action }) {
  return (
    <div className="flex flex-col items-center rounded-box border border-dashed border-base-300 bg-base-100 px-6 py-14 text-center">
      <span className="mb-3 grid size-12 place-items-center rounded-full bg-base-200 text-secondary">
        <Icon name={icon} className="size-6" />
      </span>
      <h3 className="text-lg font-semibold">{title}</h3>
      {children && <p className="mt-1 max-w-md text-sm text-base-content/70">{children}</p>}
      {action && <div className="mt-5">{action}</div>}
    </div>
  )
}
