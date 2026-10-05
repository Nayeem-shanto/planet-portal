import { NavLink, Outlet, useNavigate } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import Brand from '../ui/Brand'
import Icon from '../ui/Icon'
import { initials } from '../../utils/format'

const NAV = {
  general: [
    { to: '/app', label: 'Overview', icon: 'home', end: true },
    { to: '/app/jobs', label: 'Find jobs', icon: 'briefcase' },
    { to: '/app/applications', label: 'My applications', icon: 'inbox' },
    { to: '/app/cv', label: 'My CV', icon: 'file' },
  ],
  admin: [
    { to: '/admin', label: 'Overview', icon: 'home', end: true },
    { to: '/admin/jobs', label: 'Job posts', icon: 'briefcase' },
    { to: '/admin/applicants', label: 'Applicants', icon: 'users' },
    { to: '/admin/companies', label: 'Companies', icon: 'building' },
  ],
}

const ROLE_LABEL = { student: 'Student', employee: 'Employee', admin: 'Administrator' }

export default function AppShell({ panel }) {
  const { user, logout } = useAuth()
  const navigate = useNavigate()

  const handleLogout = () => {
    logout()
    navigate(`/login?panel=${panel}`, { replace: true })
  }

  // Close the mobile drawer after picking a link.
  const closeDrawer = () => {
    const toggle = document.getElementById('app-drawer')
    if (toggle) toggle.checked = false
  }

  return (
    <div className="drawer lg:drawer-open">
      <input id="app-drawer" type="checkbox" className="drawer-toggle" />

      <div className="drawer-content flex min-h-screen flex-col">
        <header className="sticky top-0 z-30 flex h-16 items-center gap-3 border-b border-base-300 bg-base-200/85 px-4 backdrop-blur sm:px-8">
          <label htmlFor="app-drawer" className="btn btn-ghost btn-square lg:hidden" aria-label="Open menu">
            <Icon name="menu" />
          </label>
          <div className="lg:hidden"><Brand /></div>

          <div className="ml-auto flex items-center gap-3">
            {panel === 'admin' && <span className="badge badge-accent hidden sm:inline-flex">Admin panel</span>}
            <div className="dropdown dropdown-end">
              <button tabIndex={0} className="flex items-center gap-3 rounded-full py-1 pl-1 pr-3 hover:bg-base-300/60">
                <span className="grid size-9 place-items-center rounded-full bg-secondary text-sm font-semibold text-secondary-content">
                  {initials(user.name)}
                </span>
                <span className="hidden text-left sm:block">
                  <span className="block text-sm font-semibold leading-tight">{user.name}</span>
                  <span className="block text-xs text-base-content/60">{ROLE_LABEL[user.role]}</span>
                </span>
              </button>
              <ul tabIndex={0} className="menu dropdown-content z-40 mt-2 w-56 rounded-box border border-base-300 bg-base-100 p-2 shadow-lg">
                <li className="menu-title truncate">{user.email}</li>
                <li><button onClick={handleLogout}><Icon name="logout" className="size-4" /> Sign out</button></li>
              </ul>
            </div>
          </div>
        </header>

        <main className="flex-1 px-4 py-6 sm:px-8 sm:py-8">
          <Outlet />
        </main>
      </div>

      <aside className="drawer-side z-40">
        <label htmlFor="app-drawer" className="drawer-overlay" aria-label="Close menu" />
        <nav className="relative flex min-h-full w-68 flex-col overflow-hidden bg-primary p-5 text-primary-content">
          {/* Decorative contour lines, the visual signature of the brand */}
          <svg className="pointer-events-none absolute -bottom-10 -left-16 w-96 opacity-[0.13]" viewBox="0 0 400 400" aria-hidden="true">
            {[0, 1, 2, 3, 4, 5, 6].map((i) => (
              <ellipse key={i} cx="200" cy="230" rx={60 + i * 26} ry={40 + i * 20} fill="none" stroke="#9bc53d" strokeWidth="1.5" transform={`rotate(${-12 + i * 3} 200 230)`} />
            ))}
          </svg>

          <div className="mb-8"><Brand light /></div>

          <ul className="menu w-full gap-1 p-0">
            {NAV[panel].map((item) => (
              <li key={item.to}>
                <NavLink
                  to={item.to}
                  end={item.end}
                  onClick={closeDrawer}
                  className={({ isActive }) =>
                    `rounded-lg px-3 py-2.5 text-[15px] ${isActive ? 'bg-accent font-semibold text-accent-content' : 'text-primary-content/80 hover:bg-white/10 hover:text-primary-content'}`
                  }
                >
                  <Icon name={item.icon} /> {item.label}
                </NavLink>
              </li>
            ))}
          </ul>

          <div className="relative mt-auto rounded-box bg-white/8 p-4 text-sm">
            <p className="font-semibold">{panel === 'admin' ? 'Hiring for the group' : 'Careers across the group'}</p>
            <p className="mt-1 text-primary-content/70">
              {panel === 'admin'
                ? 'Post roles for any Planet company and review every applicant in one place.'
                : 'Every Planet company posts its openings here first.'}
            </p>
          </div>
        </nav>
      </aside>
    </div>
  )
}
