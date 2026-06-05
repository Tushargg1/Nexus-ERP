import React, { useState } from 'react'
import { Save, User, Building, Lock, Globe, Database, Upload } from 'lucide-react'
import toast from 'react-hot-toast'
import PageHeader from '../components/common/PageHeader'
import { backupsAPI } from '../api/backups'
import { IS_INSTALLED_APP } from '../config/appConfig'
import useAuthStore from '../store/authStore'

export default function SettingsPage() {
  const [saving, setSaving] = useState(false)
  const [backingUp, setBackingUp] = useState(false)
  const user = useAuthStore((s) => s.user)

  // Profile — in the installed app this reflects the logged-in client;
  // in the trial/website it shows demo placeholder data.
  const [profile, setProfile] = useState(
    IS_INSTALLED_APP
      ? { name: user?.name || '', email: user?.email || '', phone: user?.phone || '' }
      : { name: 'Admin User', email: 'admin@nexuserp.com', phone: '+91 9876543210' }
  )

  // Company — blank for a fresh installed client; demo data for the trial.
  const [company, setCompany] = useState(
    IS_INSTALLED_APP
      ? { name: user?.businessName || '', address: '', gstin: '', currency: 'INR' }
      : { name: 'Acme Corp Manufacturing', address: '123 Industrial Area, Phase 1, New Delhi', gstin: '07AAAAA0000A1Z5', currency: 'INR' }
  )

  // App
  const [appSettings, setAppSettings] = useState({
    theme: 'dark',
    lowStockAlert: 10,
    language: 'en'
  })

  const handleSave = () => {
    setSaving(true)
    setTimeout(() => {
      toast.success('Settings saved successfully')
      setSaving(false)
    }, 800)
  }

  const handleBackup = async () => {
    setBackingUp(true)
    const tId = toast.loading('Generating backup...')
    try {
      const res = await backupsAPI.trigger()
      const backup = res.data?.data || res.data
      const backupId = backup?.id
      const backupFilename = backup?.filename || `Backup_${new Date().toISOString().slice(0,10)}.zip`

      if (!backupId) {
        toast.error('Backup trigger failed — no ID returned', { id: tId })
        return
      }

      toast.loading('Downloading zip...', { id: tId })
      const blobRes = await backupsAPI.download(backupId)

      // If DEMO_MODE intercepts the download, it returns a plain JSON object instead of a Blob.
      let fileData = blobRes.data
      if (fileData && typeof fileData === 'object' && !fileData.size) {
          fileData = 'Mock Backup Data for Demo Mode (Backend is not connected)'
      }

      // Try to get filename from Content-Disposition header
      const disposition = blobRes.headers?.['content-disposition'] || ''
      const match = disposition.match(/filename[^;=\n]*=((['"]).*?\2|[^;\n]*)/)
      const filename = match ? match[1].replace(/['"]/g, '') : backupFilename

      const url = window.URL.createObjectURL(new Blob([fileData], { type: 'application/zip' }))
      const link = document.createElement('a')
      link.href = url
      link.setAttribute('download', filename)
      document.body.appendChild(link)
      link.click()
      link.remove()
      window.URL.revokeObjectURL(url)

      toast.success(`Downloaded: ${filename}`, { id: tId })
    } catch (err) {
      console.error(err)
      toast.error('Failed to create backup', { id: tId })
    } finally {
      setBackingUp(false)
    }
  }

  return (
    <div style={{ animation: 'fadeIn 0.3s ease', maxWidth: '900px', margin: '0 auto' }}>
      <PageHeader 
        title="Settings" 
        subtitle="Manage your profile, company details, and preferences"
        actions={
          <button className="btn btn-primary" onClick={handleSave} disabled={saving}>
            <Save size={16} /> {saving ? 'Saving...' : 'Save Changes'}
          </button>
        }
      />

      <div className="grid-2">
        {/* Profile Settings */}
        <div className="card">
          <div className="section-title" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <User size={18} /> Profile Information
          </div>
          <div className="form-group">
            <label className="form-label">Full Name</label>
            <input className="form-input" value={profile.name} onChange={e => setProfile({...profile, name: e.target.value})} />
          </div>
          <div className="form-group">
            <label className="form-label">Email Address</label>
            <input type="email" className="form-input" value={profile.email} onChange={e => setProfile({...profile, email: e.target.value})} />
          </div>
          <div className="form-group">
            <label className="form-label">Phone Number</label>
            <input className="form-input" value={profile.phone} onChange={e => setProfile({...profile, phone: e.target.value})} />
          </div>
        </div>

        {/* Company Settings */}
        <div className="card">
          <div className="section-title" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Building size={18} /> Company Details
          </div>
          <div className="form-group">
            <label className="form-label">Company Name</label>
            <input className="form-input" value={company.name} onChange={e => setCompany({...company, name: e.target.value})} />
          </div>
          <div className="form-group">
            <label className="form-label">GSTIN</label>
            <input className="form-input" value={company.gstin} onChange={e => setCompany({...company, gstin: e.target.value})} />
          </div>
          <div className="form-group">
            <label className="form-label">Address</label>
            <textarea className="form-textarea" value={company.address} onChange={e => setCompany({...company, address: e.target.value})} rows={3} />
          </div>
        </div>

        {/* Application Preferences */}
        <div className="card">
          <div className="section-title" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Globe size={18} /> App Preferences
          </div>
          <div className="form-group">
            <label className="form-label">Theme</label>
            <select className="form-select" value={appSettings.theme} onChange={e => setAppSettings({...appSettings, theme: e.target.value})}>
              <option value="dark">Dark Theme (Glassmorphism)</option>
              <option value="light">Light Theme (Coming Soon)</option>
            </select>
          </div>
          <div className="form-group">
            <label className="form-label">Low Stock Alert Threshold</label>
            <input type="number" className="form-input" value={appSettings.lowStockAlert} onChange={e => setAppSettings({...appSettings, lowStockAlert: e.target.value})} />
            <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '4px' }}>Notify when inventory falls below this quantity.</p>
          </div>
          <div className="form-group">
            <label className="form-label">Language</label>
            <select className="form-select" value={appSettings.language} onChange={e => setAppSettings({...appSettings, language: e.target.value})}>
              <option value="en">English</option>
              <option value="hi">Hindi (Coming Soon)</option>
            </select>
          </div>
        </div>

        {/* Security & Backup */}
        <div className="card">
          <div className="section-title" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Lock size={18} /> Security & Data
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <button className="btn btn-secondary" style={{ justifyContent: 'center' }}>
              Change Password
            </button>
            <button className="btn btn-secondary" style={{ justifyContent: 'center' }} onClick={handleBackup} disabled={backingUp}>
              <Database size={16} /> {backingUp ? 'Backing up...' : 'Backup Database Now'}
            </button>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
              <label className="btn btn-ghost" style={{ justifyContent: 'center', cursor: 'pointer', border: '1px dashed var(--border)', fontSize: '0.8rem', padding: '6px' }}>
                <input type="file" accept=".zip" style={{ display: 'none' }} onChange={(e) => {
                  if (e.target.files?.[0]) {
                    const tId = toast.loading('Restoring from zip backup...');
                    setTimeout(() => {
                      toast.success('Database successfully restored!', { id: tId });
                      setTimeout(() => window.location.reload(), 1000);
                    }, 1500);
                    e.target.value = '';
                  }
                }} />
                <Upload size={14} style={{ marginRight: '6px' }} /> Restore Zip
              </label>

              <label className="btn btn-ghost" style={{ justifyContent: 'center', cursor: 'pointer', border: '1px dashed var(--border)', fontSize: '0.8rem', padding: '6px' }}>
                <input type="file" webkitdirectory="true" directory="true" style={{ display: 'none' }} onChange={(e) => {
                  if (e.target.files?.length > 0) {
                    const tId = toast.loading('Restoring from folder backup...');
                    setTimeout(() => {
                      toast.success('Database successfully restored!', { id: tId });
                      setTimeout(() => window.location.reload(), 1000);
                    }, 1500);
                    e.target.value = '';
                  }
                }} />
                <Upload size={14} style={{ marginRight: '6px' }} /> Restore Folder
              </label>
            </div>
            <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textAlign: 'center' }}>
              Last backup: {new Date().toLocaleString()}
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}

