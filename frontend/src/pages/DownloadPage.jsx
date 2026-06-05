import React, { useState } from 'react'
import { Link } from 'react-router-dom'
import { Hexagon, Download, CheckCircle2, Clock, XCircle, ArrowLeft } from 'lucide-react'
import toast from 'react-hot-toast'
import { registrationAPI } from '../api/registration'

export default function DownloadPage() {
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)
  const [status, setStatus] = useState(null) // null | { status, name, businessName, ... }

  const handleCheck = async (e) => {
    e.preventDefault()
    if (!email) {
      toast.error('Please enter your registered email')
      return
    }
    setLoading(true)
    try {
      const res = await registrationAPI.getRegistrationStatus(email)
      setStatus(res.data)
    } catch (err) {
      if (err.response?.status === 404) {
        setStatus({ status: 'NOT_FOUND' })
      } else {
        toast.error('Failed to check status. Please try again.')
      }
    } finally {
      setLoading(false)
    }
  }

  const handleDownload = () => {
    // In production, this would trigger an actual file download
    // For now, show a toast indicating the download would start
    toast.success('Download started! Check your downloads folder.')
    // You can replace this with an actual download link:
    // window.location.href = '/api/v1/client-registrations/download?email=' + encodeURIComponent(email)
  }

  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      flexDirection: 'column',
      background: 'var(--bg-primary)',
    }}>
      {/* Top Navbar */}
      <nav style={{
        width: '100%',
        height: '70px',
        background: 'rgba(13,17,23,0.95)',
        borderBottom: '1px solid var(--border)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '0 5%',
        backdropFilter: 'blur(12px)',
        flexShrink: 0,
      }}>
        <Link to="/" style={{ display: 'flex', alignItems: 'center', gap: '12px', textDecoration: 'none' }}>
          <div style={{
            width: '40px',
            height: '40px',
            background: 'linear-gradient(135deg, #f59e0b, #d97706)',
            borderRadius: '10px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}>
            <Hexagon size={24} color="#0d1117" strokeWidth={2.5} />
          </div>
          <span style={{ fontSize: '1.25rem', fontWeight: 800, letterSpacing: '0.05em', color: 'var(--text-primary)' }}>
            Nexus ERP
          </span>
        </Link>
        <div style={{ display: 'flex', gap: '12px' }}>
          <Link to="/login" className="btn btn-secondary" style={{ padding: '8px 20px', fontSize: '0.9rem' }}>
            Login
          </Link>
        </div>
      </nav>

      {/* Main Content */}
      <div style={{
        flex: 1,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '60px 20px',
      }}>
        <div style={{ width: '100%', maxWidth: '500px' }}>
          {/* Back link */}
          <Link to="/" style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '6px',
            color: 'var(--text-muted)',
            textDecoration: 'none',
            fontSize: '0.875rem',
            marginBottom: '24px',
          }}>
            <ArrowLeft size={16} /> Back to Home
          </Link>

          <div style={{
            background: 'var(--bg-surface)',
            border: '1px solid var(--border)',
            borderRadius: '16px',
            padding: '40px',
          }}>
            <h1 style={{
              fontSize: '1.75rem',
              fontWeight: 800,
              color: 'var(--text-primary)',
              marginBottom: '8px',
            }}>
              Download Software 📦
            </h1>
            <p style={{ color: 'var(--text-muted)', marginBottom: '32px', fontSize: '0.9375rem' }}>
              Enter the email you used during registration to check your approval status and download.
            </p>

            {/* Email check form */}
            <form onSubmit={handleCheck} style={{ display: 'flex', flexDirection: 'column', gap: '16px', marginBottom: '24px' }}>
              <div className="form-group">
                <label className="form-label">Registered Email <span className="required">*</span></label>
                <input
                  type="email"
                  className="form-input"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="john@example.com"
                />
              </div>
              <button
                type="submit"
                className="btn btn-primary"
                disabled={loading}
                style={{ width: '100%', justifyContent: 'center' }}
              >
                {loading ? 'Checking...' : 'Check Status'}
              </button>
            </form>

            {/* Status Result */}
            {status && (
              <div style={{ marginTop: '16px' }}>
                {status.status === 'APPROVED' && (
                  <div style={{
                    background: 'rgba(34,197,94,0.08)',
                    border: '1px solid rgba(34,197,94,0.3)',
                    borderRadius: '12px',
                    padding: '24px',
                    textAlign: 'center',
                  }}>
                    <CheckCircle2 size={48} color="var(--success)" style={{ margin: '0 auto 16px' }} />
                    <h3 style={{ color: 'var(--text-primary)', marginBottom: '8px', fontWeight: 700 }}>
                      Approved!
                    </h3>
                    <p style={{ color: 'var(--text-secondary)', marginBottom: '20px', fontSize: '0.875rem' }}>
                      Welcome, {status.name}! Your registration for <strong>{status.businessName}</strong> has been approved.
                    </p>
                    <button
                      onClick={handleDownload}
                      className="btn btn-primary btn-lg"
                      style={{ width: '100%', justifyContent: 'center', gap: '8px' }}
                    >
                      <Download size={20} /> Download Nexus ERP Software
                    </button>
                    <p style={{ marginTop: '16px', fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                      After download, login with: <strong>{email}</strong>
                    </p>
                  </div>
                )}

                {status.status === 'PENDING' && (
                  <div style={{
                    background: 'rgba(245,158,11,0.08)',
                    border: '1px solid rgba(245,158,11,0.3)',
                    borderRadius: '12px',
                    padding: '24px',
                    textAlign: 'center',
                  }}>
                    <Clock size={48} color="var(--accent-gold)" style={{ margin: '0 auto 16px' }} />
                    <h3 style={{ color: 'var(--text-primary)', marginBottom: '8px', fontWeight: 700 }}>
                      Pending Approval
                    </h3>
                    <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem' }}>
                      Your registration is still being reviewed by our admin team. Please check back later.
                    </p>
                  </div>
                )}

                {status.status === 'REJECTED' && (
                  <div style={{
                    background: 'rgba(239,68,68,0.08)',
                    border: '1px solid rgba(239,68,68,0.3)',
                    borderRadius: '12px',
                    padding: '24px',
                    textAlign: 'center',
                  }}>
                    <XCircle size={48} color="var(--danger)" style={{ margin: '0 auto 16px' }} />
                    <h3 style={{ color: 'var(--text-primary)', marginBottom: '8px', fontWeight: 700 }}>
                      Registration Rejected
                    </h3>
                    <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem' }}>
                      Unfortunately your registration was not approved. Please contact support for more information.
                    </p>
                  </div>
                )}

                {status.status === 'NOT_FOUND' && (
                  <div style={{
                    background: 'rgba(239,68,68,0.08)',
                    border: '1px solid rgba(239,68,68,0.3)',
                    borderRadius: '12px',
                    padding: '24px',
                    textAlign: 'center',
                  }}>
                    <XCircle size={48} color="var(--danger)" style={{ margin: '0 auto 16px' }} />
                    <h3 style={{ color: 'var(--text-primary)', marginBottom: '8px', fontWeight: 700 }}>
                      No Registration Found
                    </h3>
                    <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem', marginBottom: '16px' }}>
                      We couldn't find a registration with this email. Please register first.
                    </p>
                    <Link to="/register" className="btn btn-primary" style={{ width: '100%', justifyContent: 'center' }}>
                      Register Now
                    </Link>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
