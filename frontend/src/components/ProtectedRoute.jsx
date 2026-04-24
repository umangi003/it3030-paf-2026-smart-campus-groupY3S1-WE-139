import { Navigate, Outlet, useLocation } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import Navbar from './Navbar'
import Sidebar from './Sidebar'

export default function ProtectedRoute({ adminOnly = false, staffOnly = false }) {
  const { user, token, loading } = useAuth()
  const location = useLocation()

  if (loading) {
    return (
      <div style={{
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        height: '100vh', background: 'var(--gray-50)'
      }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{
            width: 32, height: 32, border: '2px solid var(--green-bright)',
            borderTopColor: 'transparent', borderRadius: '50%',
            animation: 'spin 0.7s linear infinite', margin: '0 auto 12px'
          }} />
          <style>{`@keyframes spin { to { transform: rotate(360deg) } }`}</style>
          <p style={{ color: 'var(--gray-600)', fontSize: 14 }}>Loading...</p>
        </div>
      </div>
    )
  }

  // Not logged in — redirect to login, saving intended destination
  if (!token || !user) {
    return <Navigate to="/login" state={{ from: location }} replace />
  }

  // Role-based guards
  if (adminOnly && user.role !== 'ADMIN') return <Navigate to="/" replace />
  if (staffOnly && user.role !== 'STAFF' && user.role !== 'ADMIN') return <Navigate to="/" replace />

  return (
    <div style={{ display: 'flex', minHeight: '100vh', background: 'var(--gray-50)' }}>
      <Sidebar />
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', minWidth: 0 }}>
        <Navbar />
        <main style={{ flex: 1, padding: '32px', overflowY: 'auto' }}>
          <div className="page-enter">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  )
}
