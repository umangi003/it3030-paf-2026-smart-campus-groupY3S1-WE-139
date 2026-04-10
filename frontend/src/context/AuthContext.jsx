import { createContext, useContext, useState, useEffect } from 'react'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [token, setToken] = useState(localStorage.getItem('token'))
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const stored = localStorage.getItem('user')
    if (stored && token) {
      try { setUser(JSON.parse(stored)) } catch { logout() }
    }
    setLoading(false)
  }, [])

  const login = (userData, jwt, refreshJwt) => {
    setUser(userData)
    setToken(jwt)
    localStorage.setItem('token', jwt)
    if (refreshJwt) localStorage.setItem('refreshToken', refreshJwt)
    localStorage.setItem('user', JSON.stringify(userData))
  }

  const logout = () => {
    setUser(null)
    setToken(null)
    localStorage.removeItem('token')
    localStorage.removeItem('refreshToken')
    localStorage.removeItem('user')
  }

  const isAdmin       = () => user?.role === 'ADMIN'
  const isStaff       = () => user?.role === 'STAFF'
  const isStudent     = () => user?.role === 'STUDENT'
  const isTechnician  = () => user?.role === 'TECHNICIAN'

  // Returns the default home route for the current user's role
  const getHomePath = () => {
    if (!user) return '/'
    if (user.role === 'ADMIN')      return '/admin'
    if (user.role === 'TECHNICIAN') return '/technician'
    if (user.role === 'STAFF')      return '/staff'
    return '/' // STUDENT → public landing (logged-in view)
  }

  return (
    <AuthContext.Provider value={{
      user, token, loading,
      login, logout,
      isAdmin, isStaff, isStudent, isTechnician,
      getHomePath,
    }}>
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used within AuthProvider')
  return ctx
}
