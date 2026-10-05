import { Navigate, Outlet, useLocation } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import FullPageLoader from '../components/ui/FullPageLoader'

/**
 * Only render child routes for a signed-in user of the right panel.
 *
 * NOTE: this is a UX guard, not security. Hiding a page in the browser does
 * not protect data. With a real backend, the SERVER must check the user's
 * role on every request (authorization). The frontend guard only stops people
 * landing on screens they can't use.
 */
export default function ProtectedRoute({ panel }) {
  const { user, loading } = useAuth()
  const location = useLocation()

  if (loading) return <FullPageLoader />
  if (!user) return <Navigate to={`/login?panel=${panel}`} replace state={{ from: location }} />
  if (user.panel !== panel) return <Navigate to={user.panel === 'admin' ? '/admin' : '/app'} replace />
  return <Outlet />
}
