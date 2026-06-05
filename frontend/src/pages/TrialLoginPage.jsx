import React, { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { Hexagon, Zap, Shield, BarChart3 } from 'lucide-react'
import toast from 'react-hot-toast'
import useAuthStore from '../store/authStore'
import PublicNavbar from '../components/PublicNavbar'

const FEATURES = [
  { icon: Zap, text: 'Real-time inventory tracking' },
  { icon: Shield, text: 'Secure GST-ready invoicing' },
  { icon: BarChart3, text: 'Comprehensive analytics' },
]

const TRIAL_EMAIL = 'owner@garment.com'
const TRIAL_PASSWORD = 'owner123'

export default function TrialLoginPage() {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const navigate = useNavigate()
  const login = useAuthStore((s) => s.login)

  const handleTrialLogin = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      // Trial is purely frontend — no backend call needed
      // Just set fake auth data and navigate to the trial software
      const fakeUser = {
        id: 'trial-user',
        name: 'Trial User',
        email: TRIAL_EMAIL,
        role: 'OWNER',
      }
      login('trial-token-demo', fakeUser)
      toast.success('Welcome to the trial! Explore Nexus ERP.')
      navigate('/trial/software')
    } catch (err) {
      setError('Unable to start trial. Please try again.')
      toast.error('Unable to start trial.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      background: 'var(--bg-primary)',
      flexDirection: 'column',
    }}>
      {/* Top Navbar */}
      <PublicNavbar />

      {/* Main split panel */}
      <div style={{ flex: 1, display: 'flex' }}>
        {/* Left branding panel */}
        <div style={{
          flex: '0 0 50%',
          background: 'linear-gradient(135deg, #0d1117 0%, #161b27 40%, #1a2035 100%)',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '60px',
          position: 'relative',
          overflow: 'hidden',
          borderRight: '1px solid var(--border)',
        }}>
          <div style={{
            position: 'absolute',
            inset: 0,
            backgroundImage: `
              radial-gradient(circle at 20% 20%, rgba(245,158,11,0.08) 0%, transparent 50%),
              radial-gradient(circle at 80% 80%, rgba(59,130,246,0.06) 0%, transparent 50%)
            `,
          }} />

          {[...Array(6)].map((_, i) => (
            <div
              key={i}
              style={{
                position: 'absolute',
                width: `${40 + i * 20}px`,
                height: `${40 + i * 20}px`,
                borderRadius: i % 2 === 0 ? '50%' : '12px',
                border: `1px solid rgba(245,158,11,${0.05 + i * 0.02})`,
                top: `${10 + i * 15}%`,
                left: `${5 + i * 12}%`,
                transform: `rotate(${i * 30}deg)`,
                animation: `pulse ${3 + i}s ease-in-out infinite`,
              }}
            />
          ))}

          <div style={{ position: 'relative', zIndex: 1, maxWidth: '420px', textAlign: 'center' }}>
            <div style={{
              width: '80px',
              height: '80px',
              background: 'linear-gradient(135deg, #f59e0b, #d97706)',
              borderRadius: '20px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto 28px',
              boxShadow: '0 20px 40px rgba(245,158,11,0.3)',
            }}>
              <Hexagon size={40} color="#0d1117" strokeWidth={2} />
            </div>

            <h1 style={{
              fontSize: '2.5rem',
              fontWeight: 800,
              background: 'linear-gradient(135deg, #f1f5f9, #94a3b8)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              marginBottom: '8px',
              lineHeight: 1.2,
            }}>
              Nexus ERP
            </h1>

            <p style={{
              fontSize: '1.125rem',
              color: 'var(--accent-gold)',
              fontWeight: 500,
              marginBottom: '16px',
              letterSpacing: '0.02em',
            }}>
              Business Management System
            </p>

            <p style={{
              color: 'var(--text-muted)',
              fontSize: '0.9375rem',
              lineHeight: 1.7,
              marginBottom: '40px',
            }}>
              Explore the full ERP system with pre-loaded sample data. No sign-up required.
            </p>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', textAlign: 'left' }}>
              {FEATURES.map(({ icon: Icon, text }, i) => (
                <div
                  key={i}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '14px',
                    padding: '14px 18px',
                    background: 'rgba(255,255,255,0.03)',
                    border: '1px solid rgba(245,158,11,0.15)',
                    borderRadius: '12px',
                  }}
                >
                  <div style={{
                    width: '36px',
                    height: '36px',
                    background: 'rgba(245,158,11,0.12)',
                    borderRadius: '8px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    flexShrink: 0,
                  }}>
                    <Icon size={18} color="var(--accent-gold)" />
                  </div>
                  <span style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', fontWeight: 500 }}>
                    {text}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right trial login panel */}
        <div style={{
          flex: '0 0 50%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '60px',
          background: 'var(--bg-primary)',
        }}>
          <div style={{ width: '100%', maxWidth: '420px' }}>
            <div style={{ marginBottom: '36px' }}>
              <h2 style={{
                fontSize: '1.875rem',
                fontWeight: 800,
                color: 'var(--text-primary)',
                marginBottom: '8px',
              }}>
                Try Nexus ERP 🚀
              </h2>
              <p style={{ color: 'var(--text-muted)', fontSize: '0.9375rem' }}>
                Click Sign In to explore the demo with pre-loaded data
              </p>
            </div>

            <form onSubmit={handleTrialLogin} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
              {error && (
                <div style={{
                  background: 'var(--danger-light)',
                  border: '1px solid rgba(239,68,68,0.3)',
                  borderRadius: 'var(--radius-sm)',
                  padding: '12px 16px',
                  color: 'var(--danger)',
                  fontSize: '0.875rem',
                }}>
                  {error}
                </div>
              )}

              {/* Email - read only */}
              <div className="form-group">
                <label className="form-label">
                  Email Address <span className="required">*</span>
                </label>
                <input
                  type="email"
                  className="form-input"
                  value={TRIAL_EMAIL}
                  readOnly
                  style={{ opacity: 0.7, cursor: 'not-allowed' }}
                />
              </div>

              {/* Password - read only */}
              <div className="form-group">
                <label className="form-label">
                  Password <span className="required">*</span>
                </label>
                <input
                  type="password"
                  className="form-input"
                  value={TRIAL_PASSWORD}
                  readOnly
                  style={{ opacity: 0.7, cursor: 'not-allowed' }}
                />
              </div>

              {/* Trial badge */}
              <div style={{
                background: 'rgba(245,158,11,0.08)',
                border: '1px solid rgba(245,158,11,0.2)',
                borderRadius: '8px',
                padding: '10px 14px',
                fontSize: '0.8rem',
                color: 'var(--accent-gold)',
                textAlign: 'center',
              }}>
                🔒 Trial credentials are fixed — just click Sign In below
              </div>

              {/* Submit */}
              <button
                type="submit"
                className="btn btn-primary btn-lg"
                disabled={loading}
                style={{ width: '100%', justifyContent: 'center', marginTop: '4px' }}
              >
                {loading ? (
                  <>
                    <div className="spinner spinner-sm" style={{ borderTopColor: '#0d1117' }} />
                    Starting trial...
                  </>
                ) : (
                  'Sign In'
                )}
              </button>
            </form>

            <p style={{
              marginTop: '24px',
              textAlign: 'center',
              fontSize: '0.875rem',
              color: 'var(--text-muted)',
            }}>
              Want your own account?{' '}
              <Link to="/register" style={{ color: 'var(--accent-blue)', fontWeight: 600, textDecoration: 'none' }}>
                Request Access
              </Link>
            </p>

            <p style={{
              marginTop: '8px',
              textAlign: 'center',
              fontSize: '0.875rem',
              color: 'var(--text-muted)',
            }}>
              Already have an account?{' '}
              <Link to="/login" style={{ color: 'var(--accent-blue)', fontWeight: 600, textDecoration: 'none' }}>
                Login
              </Link>
            </p>

            <p style={{
              marginTop: '24px',
              textAlign: 'center',
              fontSize: '0.75rem',
              color: 'var(--text-muted)',
            }}>
              © {new Date().getFullYear()} Nexus ERP. All rights reserved.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
