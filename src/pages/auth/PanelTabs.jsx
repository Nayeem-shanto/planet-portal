export default function PanelTabs({ panel, onChange }) {
  const tabs = [
    { value: 'general', label: 'General' },
    { value: 'admin', label: 'Admin' },
  ]
  return (
    <div role="tablist" className="tabs tabs-box mb-8 grid grid-cols-2 bg-base-300/60">
      {tabs.map((tab) => (
        <button
          key={tab.value}
          role="tab"
          type="button"
          aria-selected={panel === tab.value}
          className={`tab font-medium ${panel === tab.value ? 'tab-active' : ''}`}
          onClick={() => onChange(tab.value)}
        >
          {tab.label}
        </button>
      ))}
    </div>
  )
}
