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

    // Store token then fetch user info
    localStorage.setItem('token', token)
    api.get('/auth/me').then(res => {
      login(res.data.data, token, refreshToken)
      navigate('/')
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
