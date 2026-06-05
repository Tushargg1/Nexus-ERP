import React, { useState, useEffect } from 'react'
import { Users, Plus, Edit2, Trash2, Wifi, Copy, AlertTriangle, Check } from 'lucide-react'
import toast from 'react-hot-toast'
import PageHeader from '../components/common/PageHeader'
import DataTable from '../components/common/DataTable'
import Modal from '../components/common/Modal'
import Badge from '../components/common/Badge'
import ConfirmDialog from '../components/common/ConfirmDialog'
import useTeamStore from '../store/teamStore'
import { serverInfoAPI } from '../api/serverInfo'

const emptyForm = { name: '', email: '', role: 'MANAGER', password: '' }

export default function TeamManagementPage() {
  const teamMembers = useTeamStore((s) => s.teamMembers)
  const addMember = useTeamStore((s) => s.addMember)
  const editMember = useTeamStore((s) => s.editMember)
  const deleteMember = useTeamStore((s) => s.deleteMember)

  const [modalOpen, setModalOpen] = useState(false)
  const [deleteId, setDeleteId] = useState(null)
  const [formData, setFormData] = useState(emptyForm)
  const [editingId, setEditingId] = useState(null)

  // LAN sharing info
  const [serverInfo, setServerInfo] = useState(null)
  const [copied, setCopied] = useState(false)

  useEffect(() => {
    serverInfoAPI.get()
      .then((res) => setServerInfo(res.data))
      .catch(() => setServerInfo(null))
  }, [])

  const shareUrl = serverInfo?.primaryUrl || ''

  const handleCopy = () => {
    if (!shareUrl) return
    navigator.clipboard.writeText(shareUrl)
    setCopied(true)
    toast.success('URL copied to clipboard')
    setTimeout(() => setCopied(false), 2000)
  }

  const handleSave = () => {
    if (!formData.name || !formData.email) {
      return toast.error('Name and email are required')
    }
    
    if (editingId) {
      editMember(editingId, formData)
      toast.success('Team member updated')
    } else {
      if (!formData.password) return toast.error('Password is required for new users')
      addMember(formData)
      toast.success('Team member added')
    }
    
    setModalOpen(false)
    setFormData(emptyForm)
    setEditingId(null)
  }

  const handleDelete = () => {
    deleteMember(deleteId)
    toast.success('Team member removed')
    setDeleteId(null)
  }

  const openAdd = () => {
    setFormData(emptyForm)
    setEditingId(null)
    setModalOpen(true)
  }

  const openEdit = (member) => {
    setFormData({ name: member.name, email: member.email, role: member.role, password: '' })
    setEditingId(member.id)
    setModalOpen(true)
  }

  const columns = [
    { key: 'name', label: 'Name', primary: true, render: (v, r) => (
      <div>
        <div style={{ fontWeight: 600 }}>{v}</div>
        <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{r.email}</div>
      </div>
    )},
    { key: 'role', label: 'Role', render: (v) => <span style={{ fontWeight: 600, color: 'var(--accent-gold)', fontSize: '0.8rem' }}>{v}</span> },
    { key: 'status', label: 'Status', render: (v) => <Badge status={v} /> },
  ]

  return (
    <div style={{ animation: 'fadeIn 0.3s ease' }}>
      <PageHeader
        title="Team Management"
        subtitle="Manage sub-user accounts and their roles"
        actions={
          <button className="btn btn-primary" onClick={openAdd}>
            <Plus size={16} /> Add Member
          </button>
        }
      />

      <div className="card">
        <DataTable
          columns={columns}
          data={teamMembers}
          onEdit={openEdit}
          onDelete={(row) => setDeleteId(row.id)}
          emptyMessage="No team members found"
          emptyIcon={<Users size={28} />}
        />
      </div>

      {/* LAN Access Sharing */}
      <div className="card" style={{ marginTop: '24px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '8px' }}>
          <Wifi size={18} color="var(--accent-gold)" />
          <h3 style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--text-primary)', margin: 0 }}>
            Share Access on Your Network
          </h3>
        </div>
        <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', marginBottom: '20px' }}>
          Team members on the <strong>same WiFi / office network</strong> can open this URL in their browser to log in and use the software on their own device.
        </p>

        {/* URL box */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '12px',
          background: 'var(--bg-primary)',
          border: '1px solid var(--border)',
          borderRadius: '10px',
          padding: '14px 16px',
          marginBottom: '16px',
        }}>
          <code style={{
            flex: 1,
            fontSize: '1rem',
            fontWeight: 600,
            color: 'var(--accent-gold)',
            fontFamily: 'monospace',
            wordBreak: 'break-all',
          }}>
            {shareUrl || 'Detecting network address...'}
          </code>
          <button
            className="btn btn-secondary"
            onClick={handleCopy}
            disabled={!shareUrl}
            style={{ flexShrink: 0, display: 'flex', alignItems: 'center', gap: '6px', padding: '8px 16px' }}
          >
            {copied ? <Check size={16} /> : <Copy size={16} />}
            {copied ? 'Copied' : 'Copy'}
          </button>
        </div>

        {/* Show all detected addresses if more than one */}
        {serverInfo?.lanAddresses?.length > 1 && (
          <div style={{ marginBottom: '16px' }}>
            <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: '6px' }}>
              Other network addresses (try these if the main one doesn't work):
            </p>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
              {serverInfo.lanAddresses.map((ip) => (
                <code key={ip} style={{
                  fontSize: '0.8rem',
                  color: 'var(--text-secondary)',
                  background: 'var(--bg-primary)',
                  border: '1px solid var(--border)',
                  borderRadius: '6px',
                  padding: '4px 10px',
                  fontFamily: 'monospace',
                }}>
                  http://{ip}:{serverInfo.port}
                </code>
              ))}
            </div>
          </div>
        )}

        {/* Warning */}
        <div style={{
          display: 'flex',
          alignItems: 'flex-start',
          gap: '12px',
          background: 'rgba(245,158,11,0.07)',
          border: '1px solid rgba(245,158,11,0.25)',
          borderRadius: '10px',
          padding: '14px 16px',
        }}>
          <AlertTriangle size={18} color="var(--accent-gold)" style={{ flexShrink: 0, marginTop: '1px' }} />
          <div style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', lineHeight: 1.6 }}>
            <strong style={{ color: 'var(--text-primary)' }}>Important:</strong> Anyone using this URL connects to <strong>your</strong> data and any change they make (adding sales, editing inventory, etc.) is saved to this device's database. Only share with trusted team members. This works <strong>only while this device is running the software and connected to the same network</strong>. If this device is turned off, no one can access the software.
          </div>
        </div>
      </div>

      <Modal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        title={editingId ? 'Edit Team Member' : 'Add Team Member'}
        size="md"
        footer={
          <>
            <button className="btn btn-secondary" onClick={() => setModalOpen(false)}>Cancel</button>
            <button className="btn btn-primary" onClick={handleSave}>
              {editingId ? 'Save Changes' : 'Create Member'}
            </button>
          </>
        }
      >
        <div className="form-grid">
          <div className="form-group" style={{ gridColumn: '1 / -1' }}>
            <label className="form-label">Full Name <span className="required">*</span></label>
            <input className="form-input" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} placeholder="e.g. John Doe" />
          </div>
          <div className="form-group" style={{ gridColumn: '1 / -1' }}>
            <label className="form-label">Email Address <span className="required">*</span></label>
            <input type="email" className="form-input" value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} placeholder="email@example.com" />
          </div>
          <div className="form-group">
            <label className="form-label">Role <span className="required">*</span></label>
            <select className="form-select" value={formData.role} onChange={e => setFormData({...formData, role: e.target.value})}>
              <option value="MANAGER">Manager</option>
              <option value="PRODUCER">Producer</option>
              <option value="STAFF">Staff</option>
            </select>
          </div>
          <div className="form-group">
            <label className="form-label">{editingId ? 'New Password (Optional)' : 'Password'} {editingId ? '' : <span className="required">*</span>}</label>
            <input type="password" className="form-input" value={formData.password} onChange={e => setFormData({...formData, password: e.target.value})} placeholder="••••••••" />
          </div>
        </div>
      </Modal>

      <ConfirmDialog
        isOpen={!!deleteId}
        onClose={() => setDeleteId(null)}
        onConfirm={handleDelete}
        message="Are you sure you want to remove this team member? They will no longer be able to log in."
      />
    </div>
  )
}

