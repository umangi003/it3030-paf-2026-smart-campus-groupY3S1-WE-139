import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import api from '../../api/axiosInstance'
import toast from 'react-hot-toast'
import { getErrorMessage } from '../../utils/helpers'
import bgPattern from '../../assets/image2.jpeg'

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

function validateField(field, value, form, tab) {
  switch (field) {
    case 'name':
      if (!value.trim())           return 'Full name is required.'
      if (value.trim().length < 2) return 'Name must be at least 2 characters.'
      return ''
    case 'email':
      if (!value.trim())           return 'Email is required.'
      if (!EMAIL_RE.test(value))   return 'Please enter a valid email address.'
      return ''
    case 'password':
      if (!value)                                         return 'Password is required.'
      if (tab === 'login'    && value.length < 6)         return 'Password must be at least 6 characters.'
      if (tab === 'register' && value.length < 8)         return 'Password must be at least 8 characters.'
      return ''
    case 'confirmPassword':
      if (!value)                  return 'Please confirm your password.'
      if (value !== form.password) return 'Passwords do not match.'
      return ''
    default:
      return ''
  }
}

export default function LoginPage() {
  const { login } = useAuth()
  const navigate = useNavigate()
  const [tab, setTab] = useState('login')
  const [loading, setLoading] = useState(false)
  const [role, setRole] = useState('STUDENT')
  const [form, setForm] = useState({ name: '', email: '', password: '', confirmPassword: '' })
  const [errors, setErrors] = useState({})
  const [touched, setTouched] = useState({})

  const update = (k, v) => {
    const newForm = { ...form, [k]: v }
    setForm(newForm)
    if (touched[k]) {
      const error = validateField(k, v, newForm, tab)
      setErrors(p => ({ ...p, [k]: error }))
      if (k === 'password' && touched.confirmPassword) {
        const confirmError = validateField('confirmPassword', newForm.confirmPassword, newForm, tab)
        setErrors(p => ({ ...p, confirmPassword: confirmError }))
      }
    }
  }

  const handleBlur = (k) => {
    setTouched(p => ({ ...p, [k]: true }))
    const error = validateField(k, form[k], form, tab)
    setErrors(p => ({ ...p, [k]: error }))
  }

  const switchTab = (t) => {
    setTab(t)
    setErrors({})
    setTouched({})
    setForm({ name: '', email: '', password: '', confirmPassword: '' })
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    const fields = tab === 'login'
      ? ['email', 'password']
      : ['name', 'email', 'password', 'confirmPassword']

    const newErrors = {}
    const newTouched = {}
    fields.forEach(f => {
      newTouched[f] = true
      const error = validateField(f, form[f], form, tab)
      if (error) newErrors[f] = error
    })

    setTouched(newTouched)
    setErrors(newErrors)

    if (Object.keys(newErrors).length > 0) {
      toast.error(Object.values(newErrors)[0])
      return
    }

    setLoading(true)
    try {
      if (tab === 'login') {
        const res = await api.post('/auth/login', { email: form.email, password: form.password })
        const { token, refreshToken, ...userData } = res.data.data
        login(userData, token, refreshToken)
        navigate(getPathForRole(userData.role), { replace: true })
      } else {
        await api.post('/auth/register', {
          name: form.name.trim(),
          email: form.email.trim(),
          password: form.password,
          role: role,
        })
        toast.success('Account created! Please login.')
        switchTab('login')
      }
    } catch (err) {
      toast.error(getErrorMessage(err))
    } finally {
      setLoading(false)
    }
  }

  const getPathForRole = (r) => {
    if (r === 'ADMIN')      return '/admin'
    if (r === 'TECHNICIAN') return '/technician'
    if (r === 'STAFF')      return '/staff'
    return '/'
  }

  const blockSpaces = (field) => (e) => {
    if (e.key === ' ') {
      e.preventDefault()
      setTouched(p => ({ ...p, [field]: true }))
      setErrors(p => ({ ...p, [field]: 'Spaces are not allowed here.' }))
    }
  }

  const blockInvalidNameChars = (e) => {
    const allowed = /^[a-zA-Z\s'`-]$/
    if (e.key.length === 1 && !allowed.test(e.key)) {
      e.preventDefault()
      setTouched(p => ({ ...p, name: true }))
      if (/\d/.test(e.key)) {
        setErrors(p => ({ ...p, name: 'Numbers are not allowed in names.' }))
      } else {
        setErrors(p => ({ ...p, name: 'Special characters are not allowed in names.' }))
      }
    }
  }

  const inputStyle = (field) => ({
    width: '100%', padding: '10px 14px', borderRadius: 'var(--radius-md)',
    border: `1px solid ${errors[field] ? '#e53e3e' : 'var(--gray-200)'}`,
    fontSize: 14, outline: 'none',
    background: 'var(--white)', color: 'var(--green-deepest)',
    transition: 'border-color 0.2s', fontFamily: 'var(--font-sans)'
  })

  const roleBtn = (r) => ({
    flex: 1, padding: '10px 8px', borderRadius: 'var(--radius-md)',
    border: `2px solid ${role === r ? 'var(--green-mid)' : 'var(--gray-200)'}`,
    background: role === r ? 'rgba(0,104,74,0.06)' : 'var(--white)',
    color: role === r ? 'var(--green-mid)' : 'var(--gray-600)',
    fontSize: 13, fontWeight: role === r ? 600 : 400,
    cursor: 'pointer', transition: 'all var(--transition)',
    display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4,
  })

  const fieldMessage = (field) => {
    if (errors[field]) {
      return (
        <p style={{ fontSize: 11, color: '#e53e3e', marginTop: 4, marginBottom: 0 }}>
          {errors[field]}
        </p>
      )
    }
    return null
  }

  return (
    <div style={{
      minHeight: '100vh',
      backgroundImage: `url(${bgPattern})`,
      backgroundSize: 'cover',
      backgroundPosition: 'center',
      backgroundRepeat: 'no-repeat',
      backgroundAttachment: 'fixed',
      display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24,
      position: 'relative',
    }}>
      <div style={{
        position: 'absolute', inset: 0,
        background: 'rgba(0,0,0,0.55)',
        pointerEvents: 'none',
      }} />

      <div style={{ width: '100%', maxWidth: 420, position: 'relative' }}>
        <div style={{ textAlign: 'center', marginBottom: 40 }}>
          <h1 style={{ fontSize: 32, fontWeight: 600, color: 'var(--white)', letterSpacing: '-1px' }}>
            Akade<span style={{ color: 'var(--green-bright)' }}>mi</span>
          </h1>
          <p style={{ color: 'rgba(255,255,255,0.6)', fontSize: 14, marginTop: 6 }}>
            Smart Campus Platform
          </p>
        </div>

        <div style={{
          background: 'var(--white)', borderRadius: 'var(--radius-lg)',
          padding: 32, boxShadow: 'var(--shadow-lg)'
        }}>
          <div style={{
            display: 'flex', background: 'var(--gray-100)',
            borderRadius: 'var(--radius-md)', padding: 4, marginBottom: 28
          }}>
            {['login', 'register'].map(t => (
              <button key={t} onClick={() => switchTab(t)} style={{
                flex: 1, padding: '8px', borderRadius: 'var(--radius-sm)',
                border: 'none', fontSize: 14, fontWeight: 500,
                background: tab === t ? 'var(--white)' : 'transparent',
                color: tab === t ? 'var(--green-deepest)' : 'var(--gray-400)',
                boxShadow: tab === t ? 'var(--shadow-sm)' : 'none',
                transition: 'all var(--transition)', textTransform: 'capitalize'
              }}>{t}</button>
            ))}
          </div>

          <form onSubmit={handleSubmit} noValidate
            style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>

            {tab === 'register' && (
              <>
                <div>
                  <label style={{ fontSize: 13, fontWeight: 500, color: 'var(--gray-600)', display: 'block', marginBottom: 8 }}>
                    I am a...
                  </label>
                  <div style={{ display: 'flex', gap: 10 }}>
                    <button type="button" style={roleBtn('STUDENT')} onClick={() => setRole('STUDENT')}>
                      Student
                    </button>
                    <button type="button" style={roleBtn('STAFF')} onClick={() => setRole('STAFF')}>
                      Staff Member
                    </button>
                  </div>
                  <p style={{ fontSize: 11, color: 'var(--gray-400)', marginTop: 8 }}>
                    Technician and Admin accounts are created by system administrators.
                  </p>
                </div>

                <div>
                  <label style={{ fontSize: 13, fontWeight: 500, color: 'var(--gray-600)', display: 'block', marginBottom: 6 }}>
                    Full Name
                  </label>
                  <input
                    style={inputStyle('name')}
                    placeholder="John Doe"
                    value={form.name}
                    onChange={e => update('name', e.target.value)}
                    onBlur={() => handleBlur('name')}
                    onKeyDown={blockInvalidNameChars}
                    autoComplete="name"
                  />
                  {fieldMessage('name')}
                  {!errors.name && !touched.name && (
                    <p style={{ fontSize: 11, color: 'var(--gray-400)', marginTop: 4 }}>
                      Letters only — numbers and special characters are not allowed
                    </p>
                  )}
                </div>
              </>
            )}

            <div>
              <label style={{ fontSize: 13, fontWeight: 500, color: 'var(--gray-600)', display: 'block', marginBottom: 6 }}>
                Email
              </label>
              <input
                style={inputStyle('email')}
                type="text"
                placeholder="you@university.edu"
                value={form.email}
                onChange={e => update('email', e.target.value)}
                onBlur={() => handleBlur('email')}
                onKeyDown={blockSpaces('email')}
                autoComplete="email"
              />
              {fieldMessage('email')}
            </div>

            <div>
              <label style={{ fontSize: 13, fontWeight: 500, color: 'var(--gray-600)', display: 'block', marginBottom: 6 }}>
                Password
              </label>
              <input
                style={inputStyle('password')}
                type="password"
                placeholder="••••••••"
                value={form.password}
                onChange={e => update('password', e.target.value)}
                onBlur={() => handleBlur('password')}
                onKeyDown={blockSpaces('password')}
                autoComplete={tab === 'login' ? 'current-password' : 'new-password'}
              />
              {fieldMessage('password')}
              {tab === 'register' && !touched.password && (
                <p style={{ fontSize: 11, color: 'var(--gray-400)', marginTop: 4 }}>
                  Minimum 8 characters, no spaces
                </p>
              )}
            </div>

            {tab === 'register' && (
              <div>
                <label style={{ fontSize: 13, fontWeight: 500, color: 'var(--gray-600)', display: 'block', marginBottom: 6 }}>
                  Confirm Password
                </label>
                <input
                  style={inputStyle('confirmPassword')}
                  type="password"
                  placeholder="••••••••"
                  value={form.confirmPassword}
                  onChange={e => update('confirmPassword', e.target.value)}
                  onBlur={() => handleBlur('confirmPassword')}
                  onKeyDown={blockSpaces('confirmPassword')}
                  autoComplete="new-password"
                />
                {fieldMessage('confirmPassword')}
              </div>
            )}

            <button type="submit" disabled={loading} style={{
              width: '100%', padding: '11px', borderRadius: 'var(--radius-md)',
              border: 'none', background: 'var(--green-bright)', color: 'var(--green-deepest)',
              fontSize: 14, fontWeight: 600, cursor: loading ? 'not-allowed' : 'pointer',
              opacity: loading ? 0.7 : 1, marginTop: 4, transition: 'opacity var(--transition)'
            }}>
              {loading ? 'Please wait...' : tab === 'login' ? 'Sign In' : 'Create Account'}
            </button>
          </form>

          <div style={{ marginTop: 20, textAlign: 'center' }}>
            <p style={{ fontSize: 12, color: 'var(--gray-400)', marginBottom: 12 }}>or continue with</p>
            <a href="http://localhost:8081/oauth2/authorize/google" style={{
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

          <div style={{ marginTop: 16, textAlign: 'center' }}>
            <a href="/" style={{ fontSize: 12, color: 'var(--gray-400)', textDecoration: 'none' }}>
              ← Back to browse resources
            </a>
          </div>
        </div>
      </div>
    </div>
  )
}
