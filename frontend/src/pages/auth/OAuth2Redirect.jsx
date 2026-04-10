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
      if (userData.role === 'ADMIN') navigate('/admin', { replace: true })
      else if (userData.role === 'STAFF') navigate('/dashboard/staff', { replace: true })
      else navigate('/dashboard/student', { replace: true })
    }).catch(() => navigate('/login'))
  }, [])

  return (
    <div style={{
      minHeight: '100vh', display: 'flex', alignItems: 'center',
      justifyContent: 'center', background: 'var(--green-deepest)'
    }}>
      <p style={{ color: 'var(--white)', fontSize: 14 }}>Signing you in...</p>
    </div>
  )
}
