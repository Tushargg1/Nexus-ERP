import React, { useState } from 'react'
import { Save, Lock } from 'lucide-react'
import toast from 'react-hot-toast'
import useAuthStore from '../../store/authStore'
import { registrationAPI } from '../../api/registration'

export default function AccountSettingsPage() {
  const user = useAuthStore((s) => s.user)
  const updateUser = useAuthStore((s) => s.updateUser)

  const [formData, setFormData] = useState({
    name: user?.name || '',
    email: user?.email || '',
    phone: user?.phone || '',
    businessName: user?.businessName || '',
  })
  const [loading, setLoading] = useState(false)

  // Password change state
  const [pwData, setPwData] = useState({ currentPassword: '', newPassword: '', confirmPassword: '' })
  const [pwLoading, setPwLoading] = useState(false)

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value })
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    try {
      // In production, this would call the backend API
      updateUser({ ...user, ...formData })
      toast.success('Profile updated successfully')
    } catch (err) {
      toast.error('Failed to update profile')
    } finally {
      setLoading(false)
    }
  }

  const handlePwChange = (e) => {
    setPwData({ ...pwData, [e.target.name]: e.target.value })
  }

  const handlePasswordSubmit = async (e) => {
    e.preventDefault()
    if (!pwData.currentPassword || !pwData.newPassword) {
      return toast.error('Please fill in all password fields')
    }
    if (pwData.newPassword.length < 6) {
      return toast.error('New password must be at least 6 characters')
    }
    if (pwData.newPassword !== pwData.confirmPassword) {
      return toast.error('New passwords do not match')
    }
    setPwLoading(true)
    try {
      await registrationAPI.changePassword(user?.email, pwData.currentPassword, pwData.newPassword)
      toast.success('Password changed successfully')
      setPwData({ currentPassword: '', newPassword: '', confirmPassword: '' })
    } catch (err) {
      const msg = err.response?.data?.message || 'Failed to change password'
      toast.error(msg)
    } finally {
      setPwLoading(false)
    }
  }

  return (
    <div>
      <div style={{ marginBottom: '32px' }}>
        <h1 style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--text-primary)', marginBottom: '8px' }}>
          Account Settings
        </h1>
        <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>
          Manage your profile information and account preferences.
        </p>
      </div>

      <div style={{
        background: 'var(--bg-surface)',
        border: '1px solid var(--border)',
        borderRadius: '12px',
        padding: '32px',
        maxWidth: '600px',
      }}>
        <h2 style={{ fontSize: '1.1rem', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '24px' }}>
          Profile Information
        </h2>

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          <div className="form-group">
            <label className="form-label">Full Name</label>
            <input
              type="text"
              name="name"
              className="form-input"
              value={formData.name}
              onChange={handleChange}
              placeholder="Your name"
            />
          </div>

          <div className="form-group">
            <label className="form-label">Email Address</label>
            <input
              type="email"
              name="email"
              className="form-input"
              value={formData.email}
              onChange={handleChange}
              placeholder="you@example.com"
              disabled
              style={{ opacity: 0.6, cursor: 'not-allowed' }}
            />
            <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '4px' }}>
              Email cannot be changed. Contact support if needed.
            </p>
          </div>

          <div className="form-group">
            <label className="form-label">Phone Number</label>
            <input
              type="tel"
              name="phone"
              className="form-input"
              value={formData.phone}
              onChange={handleChange}
              placeholder="+91 98765 43210"
            />
          </div>

          <div className="form-group">
            <label className="form-label">Business / Company Name</label>
            <input
              type="text"
              name="businessName"
              className="form-input"
              value={formData.businessName}
              onChange={handleChange}
              placeholder="Your business name"
            />
          </div>

          <button
            type="submit"
            className="btn btn-primary"
            disabled={loading}
            style={{ alignSelf: 'flex-start', padding: '10px 24px', display: 'flex', alignItems: 'center', gap: '8px' }}
          >
            {loading ? (
              <>
                <div className="spinner spinner-sm" style={{ borderTopColor: '#0d1117' }} />
                Saving...
              </>
            ) : (
              <>
                <Save size={16} /> Save Changes
              </>
            )}
          </button>
        </form>
      </div>

      {/* Change Password Card */}
      <div style={{
        background: 'var(--bg-surface)',
        border: '1px solid var(--border)',
        borderRadius: '12px',
        padding: '32px',
        maxWidth: '600px',
        marginTop: '24px',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '24px' }}>
          <Lock size={18} color="var(--accent-gold)" />
          <h2 style={{ fontSize: '1.1rem', fontWeight: 700, color: 'var(--text-primary)', margin: 0 }}>
            Change Password
          </h2>
        </div>

        <form onSubmit={handlePasswordSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          <div className="form-group">
            <label className="form-label">Current Password</label>
            <input
              type="password"
              name="currentPassword"
              className="form-input"
              value={pwData.currentPassword}
              onChange={handlePwChange}
              placeholder="Enter current password"
              autoComplete="current-password"
            />
          </div>

          <div className="form-group">
            <label className="form-label">New Password</label>
            <input
              type="password"
              name="newPassword"
              className="form-input"
              value={pwData.newPassword}
              onChange={handlePwChange}
              placeholder="Min 6 characters"
              autoComplete="new-password"
            />
          </div>

          <div className="form-group">
            <label className="form-label">Confirm New Password</label>
            <input
              type="password"
              name="confirmPassword"
              className="form-input"
              value={pwData.confirmPassword}
              onChange={handlePwChange}
              placeholder="Re-enter new password"
              autoComplete="new-password"
            />
          </div>

          <button
            type="submit"
            className="btn btn-primary"
            disabled={pwLoading}
            style={{ alignSelf: 'flex-start', padding: '10px 24px', display: 'flex', alignItems: 'center', gap: '8px' }}
          >
            {pwLoading ? (
              <>
                <div className="spinner spinner-sm" style={{ borderTopColor: '#0d1117' }} />
                Updating...
              </>
            ) : (
              <>
                <Lock size={16} /> Update Password
              </>
            )}
          </button>
        </form>
      </div>
    </div>
  )
}
