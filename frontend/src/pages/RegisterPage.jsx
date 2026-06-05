import React, { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { Hexagon, CheckCircle2 } from 'lucide-react'
import toast from 'react-hot-toast'
import { registrationAPI } from '../api/registration'
import PublicNavbar from '../components/PublicNavbar'

export default function RegisterPage() {
  const [formData, setFormData] = useState({
    name: '',
    businessName: '',
    email: '',
    phone: '',
    password: '',
    confirmPassword: '',
  })
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)
  const navigate = useNavigate()

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!formData.name || !formData.email || !formData.businessName || !formData.phone || !formData.password) {
      toast.error('Please fill in all fields')
      return
    }
    if (formData.password.length < 6) {
      toast.error('Password must be at least 6 characters')
      return
    }
    if (formData.password !== formData.confirmPassword) {
      toast.error('Passwords do not match')
      return
    }

    setLoading(true)
    try {
      const { confirmPassword, ...payload } = formData
      await registrationAPI.submitRegistration(payload)
      setLoading(false)
      setSuccess(true)
      toast.success('Registration submitted successfully!')
    } catch (err) {
      setLoading(false)
      const msg = err.response?.data?.message || 'Failed to submit registration. Please try again.'
      toast.error(msg)
    }
  }

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value })
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
          background: 'radial-gradient(circle, rgba(59,130,246,0.06) 0%, transparent 70%)',
          pointerEvents: 'none',
        }} />

        <div style={{
          width: '100%',
          maxWidth: '480px',
          background: 'var(--bg-surface)',
          border: '1px solid var(--border)',
          borderRadius: '16px',
          padding: '40px',
          position: 'relative',
          zIndex: 1,
          boxShadow: '0 20px 60px rgba(0,0,0,0.4)',
        }}>
          {success ? (
            <div style={{ textAlign: 'center' }}>
              <CheckCircle2 size={56} color="var(--success)" style={{ margin: '0 auto 20px' }} />
              <h2 style={{ fontSize: '1.5rem', fontWeight: 800, marginBottom: '12px', color: 'var(--text-primary)' }}>
                Account Created!
              </h2>
              <p style={{ color: 'var(--text-muted)', lineHeight: 1.6, marginBottom: '28px', fontSize: '0.9rem' }}>
                Your account is ready. Log in to your dashboard where you can purchase Nexus ERP. After admin approval, you'll be able to download the software.
              </p>
              <Link to="/login" className="btn btn-primary" style={{ width: '100%', justifyContent: 'center' }}>
                Go to Login
              </Link>
            </div>
          ) : (
            <>
              {/* Logo + Header */}
              <div style={{ textAlign: 'center', marginBottom: '28px' }}>
                <div style={{
                  width: '56px',
                  height: '56px',
                  background: 'linear-gradient(135deg, #3b82f6, #2563eb)',
                  borderRadius: '14px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  margin: '0 auto 20px',
                  boxShadow: '0 8px 24px rgba(59,130,246,0.25)',
                }}>
                  <Hexagon size={28} color="#ffffff" strokeWidth={2.5} />
                </div>
                <h2 style={{
                  fontSize: '1.5rem',
                  fontWeight: 800,
                  color: 'var(--text-primary)',
                  marginBottom: '6px',
                }}>
                  Request Access
                </h2>
                <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem' }}>
                  Register to get access to Nexus ERP software
                </p>
              </div>

              <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                  <div className="form-group">
                    <label className="form-label">Full Name <span className="required">*</span></label>
                    <input
                      type="text"
                      name="name"
                      className="form-input"
                      value={formData.name}
                      onChange={handleChange}
                      placeholder="John Doe"
                    />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Phone <span className="required">*</span></label>
                    <input
                      type="tel"
                      name="phone"
                      className="form-input"
                      value={formData.phone}
                      onChange={handleChange}
                      placeholder="+91 98765 43210"
                    />
                  </div>
                </div>

                <div className="form-group">
                  <label className="form-label">Business / Company <span className="required">*</span></label>
                  <input
                    type="text"
                    name="businessName"
                    className="form-input"
                    value={formData.businessName}
                    onChange={handleChange}
                    placeholder="Acme Corp"
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Email Address <span className="required">*</span></label>
                  <input
                    type="email"
                    name="email"
                    className="form-input"
                    value={formData.email}
                    onChange={handleChange}
                    placeholder="you@company.com"
                  />
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                  <div className="form-group">
                    <label className="form-label">Password <span className="required">*</span></label>
                    <input
                      type="password"
                      name="password"
                      className="form-input"
                      value={formData.password}
                      onChange={handleChange}
                      placeholder="Min 6 characters"
                    />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Confirm Password <span className="required">*</span></label>
                    <input
                      type="password"
                      name="confirmPassword"
                      className="form-input"
                      value={formData.confirmPassword}
                      onChange={handleChange}
                      placeholder="Re-enter password"
                    />
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
                      Submitting...
                    </>
                  ) : (
                    'Submit Request'
                  )}
                </button>
              </form>

              <div style={{ marginTop: '24px', textAlign: 'center', fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                Already have an account?{' '}
                <Link to="/login" style={{ color: 'var(--accent-blue)', fontWeight: 600, textDecoration: 'none' }}>
                  Sign in
                </Link>
              </div>
            </>
          )}
        </div>
      </div>

      <p style={{ textAlign: 'center', padding: '16px', fontSize: '0.75rem', color: 'var(--text-muted)' }}>
        © {new Date().getFullYear()} Nexus ERP. All rights reserved.
      </p>
    </div>
  )
}
