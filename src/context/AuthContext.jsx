import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react'
import * as authService from '../services/authService'

/**
 * Holds "who is signed in" for the whole app.
 * Components call useAuth() instead of reading storage themselves.
 */
const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true) // true until we know if a session exists

  useEffect(() => {
    authService.getCurrentUser().then((current) => {
      setUser(current)
      setLoading(false)
    })
  }, [])

  const login = useCallback(async (credentials) => {
    const signedIn = await authService.login(credentials)
    setUser(signedIn)
    return signedIn
  }, [])

  const logout = useCallback(() => {
    authService.logout()
    setUser(null)
  }, [])

  const updateProfile = useCallback(async (changes) => {
    const updated = await authService.updateProfile(user.id, changes)
    setUser(updated)
  }, [user])

  // useMemo stops every consumer re-rendering when AuthProvider re-renders
  // for an unrelated reason.
  const value = useMemo(
    () => ({ user, loading, login, logout, register: authService.register, updateProfile }),
    [user, loading, login, logout, updateProfile],
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

// eslint-disable-next-line react-refresh/only-export-components
export function useAuth() {
  const context = useContext(AuthContext)
  if (!context) throw new Error('useAuth must be used inside <AuthProvider>')
  return context
}
