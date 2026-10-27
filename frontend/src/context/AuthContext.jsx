import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react'
import { auth } from '../services/api'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(auth.hasToken())

  useEffect(() => {
    if (!auth.hasToken()) return
    auth.me().then(setUser).catch(() => auth.logout()).finally(() => setLoading(false))
  }, [])

  const login = useCallback(async (email, password) => {
    const u = await auth.login(email, password)
    setUser(u)
    return u
  }, [])

  const loginWithGoogle = useCallback(async (payload) => {
    const u = await auth.loginWithGoogle(payload)
    setUser(u)
    return u
  }, [])

  const logout = useCallback(() => {
    auth.logout()
    setUser(null)
  }, [])

  const value = useMemo(() => ({ user, setUser, loading, login, loginWithGoogle, logout }), [user, loading, login, loginWithGoogle, logout])
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

// eslint-disable-next-line react-refresh/only-export-components
export const useAuth = () => useContext(AuthContext)

/** Page d'accueil selon le rôle */
// eslint-disable-next-line react-refresh/only-export-components
export const homeFor = (role) => ({ etudiant: '/etudiant', professeur: '/professeur', admin: '/admin' })[role] || '/'
