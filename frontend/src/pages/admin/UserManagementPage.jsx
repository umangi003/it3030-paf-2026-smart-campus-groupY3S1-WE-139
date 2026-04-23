import { useState, useEffect } from 'react'
import api from '../../api/axiosInstance'
import Button from '../../components/common/Button'
import toast from 'react-hot-toast'
import { getErrorMessage } from '../../utils/helpers'
import Modal from '../../components/common/Modal'

const ROLES = ['STUDENT', 'STAFF', 'TECHNICIAN', 'ADMIN']

const ROLE_COLORS = {
  ADMIN:      { bg: 'rgba(220,38,38,0.08)',   color: '#dc2626',          border: 'rgba(220,38,38,0.2)'   },
  TECHNICIAN: { bg: 'rgba(0,104,74,0.08)',    color: 'var(--green-mid)', border: 'rgba(0,104,74,0.2)'   },
  STAFF:      { bg: 'rgba(0,100,180,0.08)',   color: '#0064b4',          border: 'rgba(0,100,180,0.2)'  },
  STUDENT:    { bg: 'rgba(156,168,156,0.12)', color: 'var(--gray-600)',  border: 'rgba(156,168,156,0.3)' },
}

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
const NAME_RE  = /^[a-zA-Z\s'-]+$/
const PHONE_RE = /^[0-9+\-\s()]{7,15}$/

// ─── Validation ─────────────────────────────────────────────────────────────

function validateTechnicianForm(form) {
  const errors = {}

  if (!form.name.trim())
    errors.name = 'Full name is required.'
  else if (form.name.trim().length < 2)
    errors.name = 'Name must be at least 2 characters.'
  else if (!NAME_RE.test(form.name))
    errors.name = 'Name can only contain letters, spaces, hyphens and apostrophes.'

  if (!form.email.trim())
    errors.email = 'Office email is required.'
  else if (form.email.includes(' '))
    errors.email = 'Email cannot contain spaces.'
  else if (!EMAIL_RE.test(form.email))
    errors.email = 'Please enter a valid email address.'

  if (!form.password)
    errors.password = 'Password is required.'
  else if (form.password.includes(' '))
    errors.password = 'Password cannot contain spaces.'
  else if (form.password.length < 8)
    errors.password = 'Password must be at least 8 characters.'
  else if (!/[A-Z]/.test(form.password))
    errors.password = 'Password must contain at least one uppercase letter.'
  else if (!/[0-9]/.test(form.password))
    errors.password = 'Password must contain at least one number.'

  if (form.phone.trim() && !PHONE_RE.test(form.phone))
    errors.phone = 'Please enter a valid phone number (7–15 digits).'

  // Updated to personal_email (snake_case) to match DB
  if (form.personalEmail.trim()) {
    if (form.personalEmail.includes(' '))
      errors.personalEmail = 'Email cannot contain spaces.'
    else if (!EMAIL_RE.test(form.personalEmail))
      errors.personalEmail = 'Please enter a valid personal email address.'
  }

  return errors
}

// ─── Sub-components ──────────────────────────────────────────────────────────

function RoleBadge({ role }) {
  const s = ROLE_COLORS[role] || ROLE_COLORS.STUDENT
  return (
    <span style={{
      display: 'inline-block', padding: '2px 10px', borderRadius: 20,
      fontSize: 11, fontWeight: 600, letterSpacing: '0.04em',
      background: s.bg, color: s.color, border: `1px solid ${s.border}`,
    }}>
      {role}
    </span>
  )
}

const baseInputStyle = {
  width: '100%', padding: '10px 14px', borderRadius: 'var(--radius-md)',
  fontSize: 14, outline: 'none',
  background: 'var(--white)', color: 'var(--green-deepest)',
  fontFamily: 'var(--font-sans)', transition: 'border-color 0.2s',
}

const labelStyle = {
  display: 'block', fontSize: 12, fontWeight: 600,
  color: 'var(--gray-600)', marginBottom: 6, letterSpacing: '0.03em',
}

// ─── Main Component ──────────────────────────────────────────────────────────

export default function UserManagementPage() {
  const [users, setUsers] = useState([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [filterRole, setFilterRole] = useState('ALL')
  const [showCreate, setShowCreate] = useState(false)
  const [showRoleModal, setShowRoleModal] = useState(false)
  const [selectedUser, setSelectedUser] = useState(null)
  const [newRole, setNewRole] = useState('')
  const [submitting, setSubmitting] = useState(false)

  // Keys updated to snake_case for DB compatibility
  const emptyForm = { name: '', email: '', password: '', phone: '', personalEmail: '', address: '', specialization: '' }
  const [form, setForm] = useState(emptyForm)
  const [formErrors, setFormErrors] = useState({})
  const [touched, setTouched] = useState({})

  const updateForm = (k, v) => {
    const newForm = { ...form, [k]: v }
    setForm(newForm)
    if (touched[k]) {
      const errs = validateTechnicianForm(newForm)
      setFormErrors(p => ({ ...p, [k]: errs[k] || '' }))
    }
  }

  const handleBlur = (k) => {
    setTouched(p => ({ ...p, [k]: true }))
    const errs = validateTechnicianForm(form)
    setFormErrors(p => ({ ...p, [k]: errs[k] || '' }))
  }

  const blockSpaces = (e) => {
    if (e.key === ' ') e.preventDefault()
  }

  // Active blocking for Name and Phone
  const handleNameChange = (e) => {
    const val = e.target.value;
    if (val === '' || /^[a-zA-Z\s'-]+$/.test(val)) {
      updateForm('name', val);
    }
  }

  const handlePhoneChange = (e) => {
    const val = e.target.value;
    if (val === '' || /^[0-9+\-\s()]*$/.test(val)) {
      updateForm('phone', val);
    }
  }

  const inputStyle = (field) => ({
    ...baseInputStyle,
    border: `1px solid ${
      formErrors[field] ? '#e53e3e'
      : touched[field] && !formErrors[field] && form[field] ? '#38a169'
      : 'var(--gray-200)'
    }`,
  })

  const errorText = (field) => formErrors[field]
    ? <p style={{ fontSize: 11, color: '#e53e3e', marginTop: 4 }}>{formErrors[field]}</p>
    : touched[field] && !formErrors[field] && form[field]
      ? <p style={{ fontSize: 11, color: '#38a169', marginTop: 4 }}>✓ Looks good</p>
      : null

  const fetchUsers = async () => {
    try {
      const res = await api.get('/auth/users')
      setUsers(res.data.data || [])
    } catch (err) {
      toast.error(getErrorMessage(err))
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { fetchUsers() }, [])

  const handleCreateTechnician = async (e) => {
    e.preventDefault()
    const requiredFields = ['name', 'email', 'password']
    const newTouched = {}
    requiredFields.forEach(f => { newTouched[f] = true })
    if (form.phone.trim()) newTouched.phone = true
    if (form.personalEmail.trim()) newTouched.personal_email = true
    setTouched(p => ({ ...p, ...newTouched }))

    const errs = validateTechnicianForm(form)
    setFormErrors(errs)

    if (Object.keys(errs).length > 0) {
      toast.error(Object.values(errs)[0])
      return
    }

    setSubmitting(true)
    try {
      await api.post('/auth/register/technician', form)
      toast.success('Technician account created')
      setForm(emptyForm)
      setFormErrors({})
      setTouched({})
      setShowCreate(false)
      fetchUsers()
    } catch (err) {
      toast.error(getErrorMessage(err))
    } finally {
      setSubmitting(false)
    }
  }

  const openRoleChange = (user) => {
    setSelectedUser(user)
    setNewRole(user.role)
    setShowRoleModal(true)
  }

  const handleRoleChange = async () => {
    if (!selectedUser || newRole === selectedUser.role) {
      setShowRoleModal(false)
      return
    }
    setSubmitting(true)
    try {
      await api.patch(`/auth/users/${selectedUser.id}/role`, { role: newRole })
      toast.success(`Role updated to ${newRole}`)
      setShowRoleModal(false)
      fetchUsers()
    } catch (err) {
      toast.error(getErrorMessage(err))
    } finally {
      setSubmitting(false)
    }
  }

  const handleToggleActive = async (user) => {
    try {
      await api.patch(`/auth/users/${user.id}/active`, { active: !user.active })
      toast.success(`User ${user.active ? 'deactivated' : 'activated'}`)
      fetchUsers()
    } catch (err) {
      toast.error(getErrorMessage(err))
    }
  }

  const visible = users.filter(u => {
    const matchRole   = filterRole === 'ALL' || u.role === filterRole
    const q           = search.toLowerCase()
    const matchSearch = !q || u.name.toLowerCase().includes(q) || u.email.toLowerCase().includes(q)
    return matchRole && matchSearch
  })

  const countByRole = (r) => users.filter(u => u.role === r).length

  return (
    <div>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 28 }}>
        <div>
          <h1 style={{ fontSize: 22, fontWeight: 600, letterSpacing: '-0.5px' }}>User Management</h1>
          <p style={{ fontSize: 14, color: 'var(--gray-600)', marginTop: 2 }}>
            Create technician accounts and manage user roles
          </p>
        </div>
        <Button onClick={() => setShowCreate(true)}>+ New Technician</Button>
      </div>

      {/* Role Summary Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(150px, 1fr))', gap: 12, marginBottom: 24 }}>
        {ROLES.map(r => {
          const s = ROLE_COLORS[r]
          return (
            <div
              key={r}
              onClick={() => setFilterRole(filterRole === r ? 'ALL' : r)}
              style={{
                background: filterRole === r ? s.bg : 'var(--white)',
                border: `1px solid ${filterRole === r ? s.border : 'var(--gray-200)'}`,
                borderRadius: 'var(--radius-lg)', padding: '16px 20px',
                cursor: 'pointer', transition: 'all var(--transition)',
              }}
            >
              <p style={{ fontSize: 11, fontWeight: 600, letterSpacing: '0.08em', color: s.color, textTransform: 'uppercase', marginBottom: 6 }}>{r}</p>
              <p style={{ fontSize: 28, fontWeight: 600, letterSpacing: '-1px', color: filterRole === r ? s.color : 'var(--green-deepest)', lineHeight: 1 }}>
                {countByRole(r)}
              </p>
            </div>
          )
        })}
      </div>

      {/* Search & Filter */}
      <div style={{ display: 'flex', gap: 10, marginBottom: 20, flexWrap: 'wrap' }}>
        <input
          value={search}
          onChange={e => setSearch(e.target.value)}
          placeholder="Search by name or email…"
          style={{ ...baseInputStyle, border: '1px solid var(--gray-200)', flex: '1 1 220px', maxWidth: 320 }}
        />
        <select
          value={filterRole}
          onChange={e => setFilterRole(e.target.value)}
          style={{ ...baseInputStyle, border: '1px solid var(--gray-200)', width: 140 }}
        >
          <option value="ALL">All Roles</option>
          {ROLES.map(r => <option key={r} value={r}>{r}</option>)}
        </select>
        <span style={{ fontSize: 13, color: 'var(--gray-400)', alignSelf: 'center', marginLeft: 4 }}>
          {visible.length} user{visible.length !== 1 ? 's' : ''}
        </span>
      </div>

      {/* Users Table */}
      <div style={{ background: 'var(--white)', border: '1px solid var(--gray-200)', borderRadius: 'var(--radius-lg)', overflow: 'hidden' }}>
        {loading ? (
          <p style={{ padding: 32, color: 'var(--gray-400)', fontSize: 14, textAlign: 'center' }}>Loading users…</p>
        ) : visible.length === 0 ? (
          <p style={{ padding: 32, color: 'var(--gray-400)', fontSize: 14, textAlign: 'center' }}>No users found.</p>
        ) : (
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ borderBottom: '1px solid var(--gray-200)', background: 'var(--gray-50)' }}>
                {['Name', 'Email', 'Role', 'Status', 'Joined', 'Actions'].map(h => (
                  <th key={h} style={{
                    padding: '10px 16px', textAlign: 'left', fontSize: 11,
                    fontWeight: 600, letterSpacing: '0.08em', color: 'var(--gray-600)',
                    textTransform: 'uppercase',
                  }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {visible.map((u, i) => (
                <tr
                  key={u.id}
                  style={{
                    borderBottom: i < visible.length - 1 ? '1px solid var(--gray-200)' : 'none',
                    background: !u.active ? 'rgba(156,168,156,0.04)' : 'transparent',
                    transition: 'background var(--transition)',
                  }}
                  onMouseEnter={e => e.currentTarget.style.background = 'var(--gray-50)'}
                  onMouseLeave={e => e.currentTarget.style.background = !u.active ? 'rgba(156,168,156,0.04)' : 'transparent'}
                >
                  <td style={{ padding: '12px 16px', fontSize: 14, fontWeight: 500, opacity: u.active ? 1 : 0.5 }}>{u.name}</td>
                  <td style={{ padding: '12px 16px', fontSize: 13, color: 'var(--gray-600)', fontFamily: 'var(--font-mono)', opacity: u.active ? 1 : 0.5 }}>{u.email}</td>
                  <td style={{ padding: '12px 16px' }}><RoleBadge role={u.role} /></td>
                  <td style={{ padding: '12px 16px' }}>
                    <span style={{
                      fontSize: 11, fontWeight: 600, padding: '2px 8px',
                      borderRadius: 20, letterSpacing: '0.04em',
                      background: u.active ? 'rgba(0,237,100,0.10)' : 'rgba(220,38,38,0.08)',
                      color: u.active ? 'var(--green-mid)' : '#dc2626',
                      border: `1px solid ${u.active ? 'rgba(0,237,100,0.3)' : 'rgba(220,38,38,0.2)'}`,
                    }}>
                      {u.active ? 'Active' : 'Inactive'}
                    </span>
                  </td>
                  <td style={{ padding: '12px 16px', fontSize: 12, color: 'var(--gray-400)', fontFamily: 'var(--font-mono)' }}>
                    {u.createdAt ? new Date(u.createdAt).toLocaleDateString() : '—'}
                  </td>
                  <td style={{ padding: '12px 16px' }}>
                    <div style={{ display: 'flex', gap: 8 }}>
                      <button onClick={() => openRoleChange(u)} style={{
                        padding: '4px 10px', borderRadius: 'var(--radius-sm)',
                        border: '1px solid var(--gray-200)', background: 'transparent',
                        fontSize: 12, color: 'var(--gray-600)', cursor: 'pointer', fontFamily: 'var(--font-sans)',
                      }}>Change Role</button>
                      <button onClick={() => handleToggleActive(u)} style={{
                        padding: '4px 10px', borderRadius: 'var(--radius-sm)',
                        border: `1px solid ${u.active ? 'rgba(220,38,38,0.2)' : 'rgba(0,104,74,0.2)'}`,
                        background: u.active ? 'rgba(220,38,38,0.06)' : 'rgba(0,104,74,0.06)',
                        fontSize: 12, color: u.active ? '#dc2626' : 'var(--green-mid)',
                        cursor: 'pointer', fontFamily: 'var(--font-sans)',
                      }}>{u.active ? 'Deactivate' : 'Activate'}</button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* Create Technician Modal */}
      <Modal isOpen={showCreate} onClose={() => { setShowCreate(false); setFormErrors({}); setTouched({}) }} title="New Technician Account" width={540}>
        <p style={{ fontSize: 13, color: 'var(--gray-600)', marginBottom: 24 }}>
          Create a login for a new technician. They'll be able to log in immediately.
        </p>
        <form onSubmit={handleCreateTechnician} noValidate>

          {/* Name - Now blocks numbers as you type */}
          <div style={{ marginBottom: 16 }}>
            <label style={labelStyle}>Full Name <span style={{ color: '#dc2626' }}>*</span></label>
            <input
              value={form.name}
              onChange={handleNameChange} 
              onBlur={() => handleBlur('name')}
              placeholder="e.g. Kamal Perera"
              style={inputStyle('name')}
            />
            {errorText('name')}
          </div>

          {/* Office Email */}
          <div style={{ marginBottom: 16 }}>
            <label style={labelStyle}>Office Email (Login Email) <span style={{ color: '#dc2626' }}>*</span></label>
            <input
              type="text"
              value={form.email}
              onChange={e => updateForm('email', e.target.value)}
              onBlur={() => handleBlur('email')}
              onKeyDown={blockSpaces}
              placeholder="technician@akademi.lk"
              style={inputStyle('email')}
            />
            {errorText('email')}
          </div>

          {/* Password */}
          <div style={{ marginBottom: 20 }}>
            <label style={labelStyle}>Temporary Password <span style={{ color: '#dc2626' }}>*</span></label>
            <input
              type="password"
              value={form.password}
              onChange={e => updateForm('password', e.target.value)}
              onBlur={() => handleBlur('password')}
              onKeyDown={blockSpaces}
              placeholder="Min. 8 characters"
              style={inputStyle('password')}
            />
            {errorText('password')}
          </div>

          <div style={{ borderTop: '1px solid var(--gray-200)', margin: '4px 0 20px', position: 'relative' }}>
            <span style={{
              position: 'absolute', top: -9, left: 0,
              background: '#fff', paddingRight: 10,
              fontSize: 11, fontWeight: 600, color: 'var(--gray-400)', letterSpacing: '0.06em', textTransform: 'uppercase'
            }}>Contact Info (optional)</span>
          </div>

          {/* Personal Email - Key changed to match DB */}
          <div style={{ marginBottom: 16 }}>
            <label style={labelStyle}>Personal Email</label>
            <input
              type="text"
              value={form.personalEmail}
              onChange={e => updateForm('personalEmail', e.target.value)}
              onBlur={() => handleBlur('personalEmail')}
              onKeyDown={blockSpaces}
              placeholder="personal@gmail.com"
              style={inputStyle('personalEmail')}
            />
            {errorText('personalEmail')}
          </div>

          {/* Phone - Now blocks letters as you type */}
          <div style={{ marginBottom: 16 }}>
            <label style={labelStyle}>Phone Number</label>
            <input
              value={form.phone}
              onChange={handlePhoneChange}
              onBlur={() => handleBlur('phone')}
              placeholder="e.g. 0771234567"
              style={inputStyle('phone')}
            />
            {errorText('phone')}
          </div>

          {/* Address */}
          <div style={{ marginBottom: 16 }}>
            <label style={labelStyle}>Address</label>
            <input
              value={form.address}
              onChange={e => updateForm('address', e.target.value)}
              placeholder="e.g. 12 Main St, Colombo"
              style={{ ...baseInputStyle, border: '1px solid var(--gray-200)' }}
            />
          </div>

          {/* Specialization - Options in ALL CAPS to match DB */}
          <div style={{ marginBottom: 20 }}>
            <label style={labelStyle}>Specialization</label>
            <select
              value={form.specialization}
              onChange={e => updateForm('specialization', e.target.value)}
              style={{ ...baseInputStyle, border: '1px solid var(--gray-200)' }}
            >
              <option value="">Select specialization</option>
              {['ELECTRICAL', 'HARDWARE', 'NETWORK', 'FURNITURE', 'PLUMBING', 'SOFTWARE', 'OTHER']
                .map(s => <option key={s} value={s}>{s}</option>)}
            </select>
          </div>

          <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end' }}>
            <Button variant="outline" type="button" onClick={() => { setShowCreate(false); setFormErrors({}); setTouched({}) }}>Cancel</Button>
            <Button type="submit" disabled={submitting}>
              {submitting ? 'Creating…' : 'Create Account'}
            </Button>
          </div>
        </form>
      </Modal>

      {/* Change Role Modal */}
      <Modal isOpen={showRoleModal} onClose={() => setShowRoleModal(false)} title="Change Role">
        <p style={{ fontSize: 13, color: 'var(--gray-600)', marginBottom: 20 }}>
          Updating role for <strong>{selectedUser?.name}</strong>
        </p>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginBottom: 24 }}>
          {ROLES.map(r => {
            const s = ROLE_COLORS[r]
            const selected = newRole === r
            return (
              <button key={r} type="button" onClick={() => setNewRole(r)} style={{
                padding: '14px 16px', borderRadius: 'var(--radius-md)',
                border: `2px solid ${selected ? s.border : 'var(--gray-200)'}`,
                background: selected ? s.bg : 'transparent',
                cursor: 'pointer', textAlign: 'left', transition: 'all var(--transition)',
                fontFamily: 'var(--font-sans)',
              }}>
                <p style={{ fontSize: 12, fontWeight: 700, letterSpacing: '0.06em', color: selected ? s.color : 'var(--gray-600)', textTransform: 'uppercase' }}>{r}</p>
              </button>
            )
          })}
        </div>

        <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end' }}>
          <Button variant="outline" type="button" onClick={() => setShowRoleModal(false)}>Cancel</Button>
          <Button onClick={handleRoleChange} disabled={submitting || newRole === selectedUser?.role}>
            {submitting ? 'Saving…' : 'Save Role'}
          </Button>
        </div>
      </Modal>
    </div>
  )
}