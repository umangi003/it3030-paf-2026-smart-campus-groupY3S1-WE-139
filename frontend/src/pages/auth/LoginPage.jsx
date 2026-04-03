import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import api from '../../api/axiosInstance'
import toast from 'react-hot-toast'
import { getErrorMessage } from '../../utils/helpers'

export default function LoginPage() {
  const { login } = useAuth()
  const navigate = useNavigate()
  const [tab, setTab] = useState('login')
  const [loading, setLoading] = useState(false)
  const [form, setForm] = useState({ name: '', email: '', password: '' })

  const update = (k, v) => setForm(p => ({ ...p, [k]: v }))

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    try {
      if (tab === 'login') {
        const res = await api.post('/auth/login', { email: form.email, password: form.password })
        const { token, refreshToken, ...userData } = res.data.data
        login(userData, token, refreshToken)
        navigate('/')
      } else {
        await api.post('/auth/register', { name: form.name, email: form.email, password: form.password })
        toast.success('Account created! Please login.')
        setTab('login')
      }
    } catch (err) {
      toast.error(getErrorMessage(err))
    } finally {
      setLoading(false)
    }
  }

  const inputStyle = {
    width: '100%', padding: '10px 14px', borderRadius: 'var(--radius-md)',
    border: '1px solid var(--gray-200)', fontSize: 14, outline: 'none',
    background: 'var(--white)', color: 'var(--green-deepest)',
    transition: 'border-color var(--transition)', fontFamily: 'var(--font-sans)'
  }

  return (
    <div style={{
      minHeight: '100vh', background: 'var(--green-deepest)',
      display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24
    }}>
      <div style={{ width: '100%', maxWidth: 400 }}>
        {/* Logo */}
        <div style={{ textAlign: 'center', marginBottom: 40 }}>
          <h1 style={{ fontSize: 32, fontWeight: 600, color: 'var(--white)', letterSpacing: '-1px' }}>
            Akade<span style={{ color: 'var(--green-bright)' }}>mi</span>
          </h1>
          <p style={{ color: 'rgba(255,255,255,0.4)', fontSize: 14, marginTop: 6 }}>
            Smart Campus Platform
          </p>
        </div>

        {/* Card */}
        <div style={{
          background: 'var(--white)', borderRadius: 'var(--radius-lg)',
          padding: 32, boxShadow: 'var(--shadow-lg)'
        }}>
          {/* Tabs */}
          <div style={{
            display: 'flex', background: 'var(--gray-100)',
            borderRadius: 'var(--radius-md)', padding: 4, marginBottom: 28
          }}>
            {['login', 'register'].map(t => (
              <button key={t} onClick={() => setTab(t)} style={{
                flex: 1, padding: '8px', borderRadius: 'var(--radius-sm)',
                border: 'none', fontSize: 14, fontWeight: 500,
                background: tab === t ? 'var(--white)' : 'transparent',
                color: tab === t ? 'var(--green-deepest)' : 'var(--gray-400)',
                boxShadow: tab === t ? 'var(--shadow-sm)' : 'none',
                transition: 'all var(--transition)', textTransform: 'capitalize'
              }}>{t}</button>
            ))}
          </div>

          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            {tab === 'register' && (
              <div>
                <label style={{ fontSize: 13, fontWeight: 500, color: 'var(--gray-600)', display: 'block', marginBottom: 6 }}>Full Name</label>
                <input style={inputStyle} placeholder="John Doe" value={form.name}
                  onChange={e => update('name', e.target.value)} required />
              </div>
            )}
            <div>
              <label style={{ fontSize: 13, fontWeight: 500, color: 'var(--gray-600)', display: 'block', marginBottom: 6 }}>Email</label>
              <input style={inputStyle} type="email" placeholder="you@university.edu" value={form.email}
                onChange={e => update('email', e.target.value)} required />
            </div>
            <div>
              <label style={{ fontSize: 13, fontWeight: 500, color: 'var(--gray-600)', display: 'block', marginBottom: 6 }}>Password</label>
              <input style={inputStyle} type="password" placeholder="••••••••" value={form.password}
                onChange={e => update('password', e.target.value)} required />
            </div>

            <button type="submit" disabled={loading} style={{
              width: '100%', padding: '11px', borderRadius: 'var(--radius-md)',
              border: 'none', background: 'var(--green-bright)', color: 'var(--green-deepest)',
              fontSize: 14, fontWeight: 600, cursor: loading ? 'not-allowed' : 'pointer',
              opacity: loading ? 0.7 : 1, marginTop: 4, transition: 'opacity var(--transition)'
            }}>
              {loading ? 'Please wait...' : tab === 'login' ? 'Sign In' : 'Create Account'}
            </button>
          </form>

          {/* Google OAuth */}
          <div style={{ marginTop: 20, textAlign: 'center' }}>
            <p style={{ fontSize: 12, color: 'var(--gray-400)', marginBottom: 12 }}>or continue with</p>
            <a href="http://localhost:8080/oauth2/authorize/google" style={{
              display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
              padding: '10px 16px', borderRadius: 'var(--radius-md)',
              border: '1px solid var(--gray-200)', fontSize: 14, color: 'var(--gray-600)',
              fontWeight: 500, transition: 'border-color var(--transition)'
            }}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
                <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
              </svg>
              Google
            </a>
          </div>
        </div>
      </div>
    </div>
  )
}
