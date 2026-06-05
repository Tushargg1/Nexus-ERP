import React, { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { Eye, EyeOff, Hexagon } from 'lucide-react'
import toast from 'react-hot-toast'
import { registrationAPI } from '../api/registration'
import useAuthStore from '../store/authStore'
import PublicNavbar from '../components/PublicNavbar'

export default function LoginPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPass, setShowPass] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [showForceOption, setShowForceOption] = useState(false)
  // Forgot-password mini-flow
  const [forgotMode, setForgotMode] = useState(false)
  const [forgotEmail, setForgotEmail] = useState('')
  const [forgotLoading, setForgotLoading] = useState(false)
  const navigate = useNavigate()

  const login = useAuthStore((s) => s.login)

  const completeLogin = (data) => {
    const clientUser = {
      id: 'client-' + data.id,
      name: data.name,
      email: data.email,
      businessName: data.businessName,
      phone: data.phone,
      role: 'CLIENT',
    }
    login('client-token-' + data.id, clientUser)
    toast.success(`Welcome back, ${data.name}!`)
    navigate('/account')
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setShowForceOption(false)
    if (!email || !password) {
      setError('Please enter your email and password')
      return
    }
    setError('')
    setLoading(true)
    try {
      const res = await registrationAPI.login(email, password)
      const data = res.data
      if (data.status === 'REJECTED') {
        throw new Error('Your registration was rejected. Please re-apply.')
      }
      completeLogin(data)
    } catch (err) {
      const status = err.response?.status
      if (status === 409) {
        // Account active on another device — offer "log out all devices"
        setError('This account is already signed in on another device.')
        setShowForceOption(true)
      } else {
        const msg = err.response?.data?.message || err.message || 'Invalid email or password'
        setError(msg)
        toast.error(msg)
      }
    } finally {
      setLoading(false)
    }
  }

  // Log out of all devices and sign in here (force).
  const handleForceLogin = async () => {
    setLoading(true)
    setError('')
    try {
      const res = await registrationAPI.login(email, password, true)
      const data = res.data
      if (data.status === 'REJECTED') {
        throw new Error('Your registration was rejected. Please re-apply.')
      }
      setShowForceOption(false)
      completeLogin(data)
    } catch (err) {
      const msg = err.response?.data?.message || err.message || 'Could not sign in.'
      setError(msg)
      toast.error(msg)
    } finally {
      setLoading(false)
    }
  }

  const handleForgot = async (e) => {
    e.preventDefault()
    if (!forgotEmail) {
      toast.error('Please enter your email')
      return
    }
    setForgotLoading(true)
    try {
      const res = await registrationAPI.forgotPassword(forgotEmail)
      toast.success(res.data?.message || 'If the account exists, a temporary password was sent.')
      setForgotMode(false)
      setEmail(forgotEmail)
    } catch (err) {
      toast.error('Could not process the request. Please try again.')
    } finally {
      setForgotLoading(false)
    }
  }

  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      flexDirection: 'column',
      background: '#080b10',
    }}>
      <PublicNavbar />

      {/* Centered card layout */}
      <div style={{
        flex: 1,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '40px 20px',
        position: 'relative',
      }}>
        {/* Background glow */}
        <div style={{
          position: 'absolute',
          top: '20%',
          left: '50%',
          transform: 'translateX(-50%)',
          width: '600px',
          height: '400px',
          background: 'radial-gradient(circle, rgba(245,158,11,0.06) 0%, transparent 70%)',
          pointerEvents: 'none',
        }} />

        <div style={{
          width: '100%',
          maxWidth: '440px',
          background: 'var(--bg-surface)',
          border: '1px solid var(--border)',
          borderRadius: '16px',
          padding: '40px',
          position: 'relative',
          zIndex: 1,
          boxShadow: '0 20px 60px rgba(0,0,0,0.4)',
        }}>
          {/* Logo + Header */}
          <div style={{ textAlign: 'center', marginBottom: '32px' }}>
            <div style={{
              width: '56px',
              height: '56px',
              background: 'linear-gradient(135deg, #f59e0b, #d97706)',
              borderRadius: '14px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto 20px',
              boxShadow: '0 8px 24px rgba(245,158,11,0.25)',
            }}>
              <Hexagon size={28} color="#0d1117" strokeWidth={2.5} />
            </div>
            <h2 style={{
              fontSize: '1.5rem',
              fontWeight: 800,
              color: 'var(--text-primary)',
              marginBottom: '6px',
            }}>
              {forgotMode ? 'Reset Password' : 'Welcome back'}
            </h2>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem' }}>
              {forgotMode
                ? 'Enter your email to receive a temporary password'
                : 'Sign in to your Nexus ERP account'}
            </p>
          </div>

          {forgotMode ? (
            <form onSubmit={handleForgot} style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>
              <div className="form-group">
                <label className="form-label">Email Address <span className="required">*</span></label>
                <input
                  type="email"
                  className="form-input"
                  value={forgotEmail}
                  onChange={(e) => setForgotEmail(e.target.value)}
                  placeholder="you@company.com"
                  autoFocus
                />
              </div>
              <button
                type="submit"
                className="btn btn-primary btn-lg"
                disabled={forgotLoading}
                style={{ width: '100%', justifyContent: 'center' }}
              >
                {forgotLoading ? 'Sending...' : 'Send Temporary Password'}
              </button>
              <button
                type="button"
                onClick={() => setForgotMode(false)}
                style={{ background: 'none', border: 'none', color: 'var(--accent-blue)', cursor: 'pointer', fontSize: '0.85rem' }}
              >
                ← Back to sign in
              </button>
            </form>
          ) : (
          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>
            {error && (
              <div style={{
                background: 'rgba(239,68,68,0.08)',
                border: '1px solid rgba(239,68,68,0.25)',
                borderRadius: '8px',
                padding: '10px 14px',
                color: 'var(--danger)',
                fontSize: '0.8rem',
              }}>
                {error}
              </div>
            )}

            <div className="form-group">
              <label className="form-label">Email Address <span className="required">*</span></label>
              <input
                type="email"
                className="form-input"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@company.com"
                autoComplete="email"
                autoFocus
              />
            </div>

            <div className="form-group">
              <label className="form-label">Password <span className="required">*</span></label>
              <div style={{ position: 'relative' }}>
                <input
                  type={showPass ? 'text' : 'password'}
                  className="form-input"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter your password"
                  autoComplete="current-password"
                  style={{ paddingRight: '44px' }}
                />
                <button
                  type="button"
                  onClick={() => setShowPass((v) => !v)}
                  style={{
                    position: 'absolute', right: '12px', top: '50%', transform: 'translateY(-50%)',
                    background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)', display: 'flex', padding: '4px',
                  }}
                >
                  {showPass ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            {/* Forgot password link */}
            <div style={{ textAlign: 'right', marginTop: '-8px' }}>
              <button
                type="button"
                onClick={() => { setForgotMode(true); setForgotEmail(email) }}
                style={{ background: 'none', border: 'none', color: 'var(--accent-blue)', cursor: 'pointer', fontSize: '0.8rem' }}
              >
                Forgot password?
              </button>
            </div>

            <button
              type="submit"
              className="btn btn-primary btn-lg"
              disabled={loading}
              style={{ width: '100%', justifyContent: 'center', marginTop: '4px' }}
            >
              {loading ? (
                <>
                  <div className="spinner spinner-sm" style={{ borderTopColor: '#0d1117' }} />
                  Verifying...
                </>
              ) : (
                'Sign In'
              )}
            </button>

            {showForceOption && (
              <button
                type="button"
                onClick={handleForceLogin}
                disabled={loading}
                className="btn btn-secondary"
                style={{ width: '100%', justifyContent: 'center' }}
              >
                Log out of all devices & sign in here
              </button>
            )}
          </form>
          )}

          {!forgotMode && (
          <div style={{ marginTop: '24px', textAlign: 'center', fontSize: '0.85rem', color: 'var(--text-muted)' }}>
            Don't have an account?{' '}
            <Link to="/register" style={{ color: 'var(--accent-blue)', fontWeight: 600, textDecoration: 'none' }}>
              Request Access
            </Link>
          </div>
          )}
        </div>
      </div>

      <p style={{ textAlign: 'center', padding: '16px', fontSize: '0.75rem', color: 'var(--text-muted)' }}>
        © {new Date().getFullYear()} Nexus ERP. All rights reserved.
      </p>
    </div>
  )
}
