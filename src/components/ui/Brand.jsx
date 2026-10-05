export default function Brand({ light = false }) {
  return (
    <div className="flex items-center gap-2.5">
      <svg viewBox="0 0 64 64" className="size-9 shrink-0" aria-hidden="true">
        <circle cx="32" cy="32" r="30" fill={light ? '#eef6e6' : '#1e3a2b'} />
        <path d="M8 34c8-6 16-6 24 0s16 6 24 0M12 22c7-5 13-5 20 0s13 5 20 0M12 46c7-5 13-5 20 0s13 5 20 0" fill="none" stroke="#9bc53d" strokeWidth="3.5" strokeLinecap="round" />
      </svg>
      <div className="leading-tight">
        <p className={`font-display text-lg font-bold ${light ? 'text-primary-content' : 'text-primary'}`}>Planet Careers</p>
        <p className={`text-xs ${light ? 'text-primary-content/60' : 'text-base-content/60'}`}>Planet Eco-system</p>
      </div>
    </div>
  )
}
