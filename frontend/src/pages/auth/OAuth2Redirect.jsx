import { useEffect } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import api from '../../api/axiosInstance'

export default function OAuth2Redirect() {
  const [params] = useSearchParams()
  const { login } = useAuth()
  const navigate = useNavigate()

  useEffect(() => {
    const token = params.get('token')
    const refreshToken = params.get('refreshToken')
    if (!token) { navigate('/login'); return }

    localStorage.setItem('token', token)
    api.get('/auth/me').then(res => {
      const userData = res.data.data
      login(userData, token, refreshToken)

      // Role-based redirect after OAuth login
      if (userData.role === 'ADMIN') navigate('/admin', { replace: true })
      else if (userData.role === 'STAFF') navigate('/staff', { replace: true })
      else navigate('/', { replace: true })
    }).catch(() => navigate('/login'))
  }, [])

  return (
    <div style={{
      minHeight: '100vh', display: 'flex', alignItems: 'center',
      justifyContent: 'center', background: 'var(--green-deepest)'
    }}>
      <div style={{ textAlign: 'center' }}>
        <div style={{
          width: 32, height: 32, border: '2px solid var(--green-bright)',
          borderTopColor: 'transparent', borderRadius: '50%',
          animation: 'spin 0.7s linear infinite', margin: '0 auto 12px'
        }} />
        <style>{`@keyframes spin { to { transform: rotate(360deg) } }`}</style>
        <p style={{ color: 'var(--white)', fontSize: 14 }}>Signing you in...</p>
      </div>
    </div>
  )
}
