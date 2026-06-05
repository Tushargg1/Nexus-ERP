import React, { useState } from 'react'
import { Eye, EyeOff, Hexagon, Shield, WifiOff } from 'lucide-react'
import toast from 'react-hot-toast'
import { licenseAPI } from '../api/license'
import { authAPI } from '../api/auth'
import { registrationAPI } from '../api/registration'
import useAuthStore from '../store/authStore'

/**
 * Login page for the INSTALLED (downloaded) ERP software.
 *
 * Every login verifies the license online (internet required). Once logged in,
 * the session persists locally so the app keeps working offline until logout.
 */
export default function InstalledLoginPage() {
  const [email, setEmail] = useState(licenseAPI.getActivatedEmail() || '')
  const [password, setPassword] = useState('')
  const [showPass, setShowPass] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [showForceOption, setShowForceOption] = useState(false)
  const [forgotLoading, setForgotLoading] = useState(false)
  const login = useAuthStore((s) => s.login)

  // Forgot password — emails a temporary password (requires internet).
  const handleForgot = async () => {
    if (!email) {
      toast.error('Enter your email first, then click "Forgot password".')
      return
    }
    setForgotLoading(true)
    try {
      await registrationAPI.forgotPassword(email)
      toast.success('If an account exists, a temporary password was emailed to you.')
    } catch {
      toast.error('Could not send reset email. Check your internet connection.')
    } finally {
      setForgotLoading(false)
    }
  }

  // Establishes the local ERP session from a successful license result.
  const establishSession = async (result) => {
    licenseAPI.cacheActivation(email)
    const localUser = {
      id: result.user.id || ('client-' + Date.now()),
      name: result.user.name,
      email: result.user.email || email,
      businessName: result.user.businessName,
      role: 'OWNER',
    }
    if (result.offlineLogin) {
      login('local-session-offline', localUser)
      toast.success(`Welcome back, ${localUser.name}! (offline)`)
      return
    }
    try {
      const res = await authAPI.login(email, password)
      const { token, ...user } = res.data
      login(token, { ...localUser, ...user })
    } catch {
      login('local-session-' + localUser.id, localUser)
    }
    toast.success(`Welcome, ${localUser.name}!`)
  }

  // "Sign out the other device and continue here" — device switch.
  const handleForceLogin = async () => {
    setLoading(true)
    setError('')
    try {
      const result = await licenseAPI.forceLogin(email, password)
      if (!result.ok) {
        setError(result.message || 'Could not switch device.')
        toast.error('Could not switch device.')
        return
      }
      if (result.status !== 'APPROVED' || !result.approved) {
        setError('Your license is not active.')
        return
      }
      setShowForceOption(false)
      await establishSession(result)
    } catch {
      setError('Could not switch device. Please try again.')
    } finally {
      setLoading(false)
    }
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
      // 1. Verify license + credentials with the central server (needs internet)
      const result = await licenseAPI.verifyOnline(email, password)

      if (result.offline) {
        setError(result.message || 'No internet connection. An internet connection is required to log in.')
        toast.error(result.expired ? 'Offline access expired — connect to the internet.' : 'Internet required for first sign-in.')
        return
      }
      if (result.conflict) {
        setError(result.message || 'This account is already signed in on another device.')
        if (result.canForce) {
          setShowForceOption(true)
        }
        toast.error('Already signed in on another device.')
        return
      }
      if (!result.ok) {
        setError(result.message || 'Invalid email or password.')
        toast.error(result.message || 'Login failed.')
        return
      }
      if (result.status === 'PENDING') {
        setError('Your purchase is pending approval. Please wait for admin approval.')
        return
      }
      if (result.status === 'REJECTED' || !result.approved) {
        setError('Your license is not active. Please contact support or re-purchase.')
        return
      }

      // License approved — establish the local session
      await establishSession(result)
    } catch (err) {
      setError('Login failed. Please try again.')
      toast.error('Login failed.')
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
      background: 'linear-gradient(135deg, #0d1117 0%, #161b27 50%, #1a2035 100%)',
      padding: '20px',
    }}>
      <div style={{
        width: '100%',
        maxWidth: '420px',
        background: 'var(--bg-surface)',
        border: '1px solid var(--border)',
        borderRadius: '18px',
        padding: '44px 40px',
        boxShadow: '0 25px 50px rgba(0,0,0,0.5)',
      }}>
        {/* Logo */}
        <div style={{ textAlign: 'center', marginBottom: '32px' }}>
          <div style={{
            width: '60px',
            height: '60px',
            background: 'linear-gradient(135deg, #f59e0b, #d97706)',
            borderRadius: '16px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            margin: '0 auto 18px',
            boxShadow: '0 10px 30px rgba(245,158,11,0.3)',
          }}>
            <Hexagon size={32} color="#0d1117" strokeWidth={2.5} />
          </div>
          <h1 style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--text-primary)', marginBottom: '4px' }}>
            Nexus ERP
          </h1>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>
            Sign in with your licensed account
          </p>
        </div>

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>
          {error && (
            <div style={{
              background: 'rgba(239,68,68,0.08)',
              border: '1px solid rgba(239,68,68,0.25)',
              borderRadius: '8px',
              padding: '10px 14px',
              color: 'var(--danger)',
              fontSize: '0.8rem',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
            }}>
              {error.toLowerCase().includes('internet') && <WifiOff size={16} />}
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

          <button
            type="submit"
            className="btn btn-primary btn-lg"
            disabled={loading}
            style={{ width: '100%', justifyContent: 'center', marginTop: '8px' }}
          >
            {loading ? (
              <>
                <div className="spinner spinner-sm" style={{ borderTopColor: '#0d1117' }} />
                Verifying license...
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
              style={{ width: '100%', justifyContent: 'center', marginTop: '12px' }}
            >
              Sign out the other device & continue here
            </button>
          )}

          <div style={{ textAlign: 'center', marginTop: '14px' }}>
            <button
              type="button"
              onClick={handleForgot}
              disabled={forgotLoading}
              style={{ background: 'none', border: 'none', color: 'var(--accent-blue)', cursor: 'pointer', fontSize: '0.8rem' }}
            >
              {forgotLoading ? 'Sending...' : 'Forgot password?'}
            </button>
          </div>
        </form>

        <div style={{
          marginTop: '24px',
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          justifyContent: 'center',
          fontSize: '0.75rem',
          color: 'var(--text-muted)',
        }}>
          <Shield size={14} />
          <span>Internet is required only for the first sign-in on this device. After that it works offline.</span>
        </div>
      </div>
    </div>
  )
}
