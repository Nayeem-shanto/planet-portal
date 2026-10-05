import { lazy, Suspense } from 'react'
import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom'
import { AuthProvider, useAuth } from './context/AuthContext'
import { ToastProvider } from './context/ToastContext'
import ProtectedRoute from './routes/ProtectedRoute'
import AppShell from './components/layout/AppShell'
import FullPageLoader from './components/ui/FullPageLoader'
import LoginPage from './pages/auth/LoginPage'
import RegisterPage from './pages/auth/RegisterPage'

// Code splitting: each page's code is downloaded only when it is first opened.
const OverviewPage = lazy(() => import('./pages/general/OverviewPage'))
const JobsPage = lazy(() => import('./pages/general/JobsPage'))
const ApplicationsPage = lazy(() => import('./pages/general/ApplicationsPage'))
const CVPage = lazy(() => import('./pages/general/CVPage'))
const AdminOverviewPage = lazy(() => import('./pages/admin/AdminOverviewPage'))
const AdminJobsPage = lazy(() => import('./pages/admin/AdminJobsPage'))
const AdminApplicantsPage = lazy(() => import('./pages/admin/AdminApplicantsPage'))
const AdminCompaniesPage = lazy(() => import('./pages/admin/AdminCompaniesPage'))

/** "/" sends people to the right place depending on who they are. */
function HomeRedirect() {
  const { user, loading } = useAuth()
  if (loading) return <FullPageLoader />
  if (!user) return <Navigate to="/login" replace />
  return <Navigate to={user.panel === 'admin' ? '/admin' : '/app'} replace />
}

export default function App() {
  return (
    <BrowserRouter>
      <ToastProvider>
        <AuthProvider>
          <Suspense fallback={<FullPageLoader />}>
            <Routes>
              <Route path="/" element={<HomeRedirect />} />
              <Route path="/login" element={<LoginPage />} />
              <Route path="/register" element={<RegisterPage />} />

              {/* General panel: students and employees */}
              <Route element={<ProtectedRoute panel="general" />}>
                <Route path="/app" element={<AppShell panel="general" />}>
                  <Route index element={<OverviewPage />} />
                  <Route path="jobs" element={<JobsPage />} />
                  <Route path="applications" element={<ApplicationsPage />} />
                  <Route path="cv" element={<CVPage />} />
                </Route>
              </Route>

              {/* Admin panel */}
              <Route element={<ProtectedRoute panel="admin" />}>
                <Route path="/admin" element={<AppShell panel="admin" />}>
                  <Route index element={<AdminOverviewPage />} />
                  <Route path="jobs" element={<AdminJobsPage />} />
                  <Route path="applicants" element={<AdminApplicantsPage />} />
                  <Route path="companies" element={<AdminCompaniesPage />} />
                </Route>
              </Route>

              <Route path="*" element={<HomeRedirect />} />
            </Routes>
          </Suspense>
        </AuthProvider>
      </ToastProvider>
    </BrowserRouter>
  )
}
