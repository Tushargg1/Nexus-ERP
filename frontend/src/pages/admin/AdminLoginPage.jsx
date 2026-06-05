import React, { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { Eye, EyeOff, Hexagon, Shield } from 'lucide-react'
import toast from 'react-hot-toast'
import { adminAPI } from '../../api/admin'
import useAdminStore from '../../store/adminStore'

export default function AdminLoginPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPass, setShowPass] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const navigate = useNavigate()
  const login = useAdminStore((s) => s.login)

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!email || !password) {
      setError('Please enter your email and password')
      return
    }
    setError('')
    setLoading(true)
    try {
      const res = await adminAPI.login(email, password)
      const { token, ...user } = res.data
      login(token, user)
      toast.success(`Welcome, ${user.name}!`)
      navigate('/admin/dashboard')
    } catch (err) {
      const msg = err.response?.data?.message || 'Invalid credentials or insufficient permissions'
      setError(msg)
      toast.error(msg)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      background: 'linear-gradient(135deg, #0f172a 0%, #1e293b 50%, #0f172a 100%)',
      padding: '20px',
    }}>
      <div style={{
        width: '100%',
        maxWidth: '420px',
        background: 'rgba(15, 23, 42, 0.8)',
        border: '1px solid rgba(99, 102, 241, 0.2)',
        borderRadius: '20px',
        padding: '48px 40px',
        backdropFilter: 'blur(20px)',
        boxShadow: '0 25px 50px rgba(0,0,0,0.5)',
      }}>
        {/* Logo */}
        <div style={{ textAlign: 'center', marginBottom: '36px' }}>
          <div style={{
            width: '64px',
            height: '64px',
            background: 'linear-gradient(135deg, #6366f1, #4f46e5)',
            borderRadius: '16px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            margin: '0 auto 16px',
            boxShadow: '0 10px 30px rgba(99, 102, 241, 0.3)',
          }}>
            <Shield size={32} color="#ffffff" />
          </div>
          <h1 style={{
            fontSize: '1.5rem',
            fontWeight: 800,
            color: '#f1f5f9',
            marginBottom: '4px',
          }}>
            Admin Portal
          </h1>
          <p style={{ color: '#94a3b8', fontSize: '0.875rem' }}>
            Nexus ERP Website Administration
          </p>
        </div>

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          {error && (
            <div style={{
              background: 'rgba(239,68,68,0.1)',
              border: '1px solid rgba(239,68,68,0.3)',
              borderRadius: '10px',
              padding: '12px 16px',
              color: '#ef4444',
              fontSize: '0.875rem',
            }}>
              {error}
            </div>
          )}

          <div>
            <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 500, color: '#cbd5e1', marginBottom: '6px' }}>
              Admin Email
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="admin@nexuserp.com"
              autoComplete="email"
              autoFocus
              style={{
                width: '100%',
                padding: '12px 16px',
                background: 'rgba(30, 41, 59, 0.8)',
                border: '1px solid rgba(99, 102, 241, 0.2)',
                borderRadius: '10px',
                color: '#f1f5f9',
                fontSize: '0.9rem',
                outline: 'none',
                transition: 'border-color 0.2s',
              }}
              onFocus={(e) => e.target.style.borderColor = 'rgba(99, 102, 241, 0.5)'}
              onBlur={(e) => e.target.style.borderColor = 'rgba(99, 102, 241, 0.2)'}
            />
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 500, color: '#cbd5e1', marginBottom: '6px' }}>
              Password
            </label>
            <div style={{ position: 'relative' }}>
              <input
                type={showPass ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter your password"
                autoComplete="current-password"
                style={{
                  width: '100%',
                  padding: '12px 44px 12px 16px',
                  background: 'rgba(30, 41, 59, 0.8)',
                  border: '1px solid rgba(99, 102, 241, 0.2)',
                  borderRadius: '10px',
                  color: '#f1f5f9',
                  fontSize: '0.9rem',
                  outline: 'none',
                  transition: 'border-color 0.2s',
                }}
                onFocus={(e) => e.target.style.borderColor = 'rgba(99, 102, 241, 0.5)'}
                onBlur={(e) => e.target.style.borderColor = 'rgba(99, 102, 241, 0.2)'}
              />
              <button
                type="button"
                onClick={() => setShowPass(v => !v)}
                style={{
                  position: 'absolute', right: '12px', top: '50%', transform: 'translateY(-50%)',
                  background: 'none', border: 'none', cursor: 'pointer', color: '#94a3b8', display: 'flex', padding: '4px',
                }}
              >
                {showPass ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            style={{
              width: '100%',
              padding: '14px',
              background: 'linear-gradient(135deg, #6366f1, #4f46e5)',
              border: 'none',
              borderRadius: '10px',
              color: '#ffffff',
              fontSize: '0.95rem',
              fontWeight: 700,
              cursor: loading ? 'not-allowed' : 'pointer',
              opacity: loading ? 0.7 : 1,
              transition: 'opacity 0.2s, transform 0.2s',
              marginTop: '4px',
            }}
          >
            {loading ? 'Signing in...' : 'Sign In to Admin Portal'}
          </button>
        </form>

        <div style={{ textAlign: 'center', marginTop: '24px' }}>
          <Link to="/" style={{ color: '#94a3b8', fontSize: '0.8rem', textDecoration: 'none' }}>
            ← Back to Nexus ERP Website
          </Link>
        </div>
      </div>
    </div>
  )
}
