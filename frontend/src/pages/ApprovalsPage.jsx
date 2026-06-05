import React, { useState, useEffect } from 'react'
import PageHeader from '../components/common/PageHeader'
import DataTable from '../components/common/DataTable'
import Badge from '../components/common/Badge'
import Modal from '../components/common/Modal'
import { CheckCircle, XCircle, UserPlus } from 'lucide-react'
import toast from 'react-hot-toast'
import useApprovalStore from '../store/approvalStore'
import useTeamStore from '../store/teamStore'
import useAuthStore from '../store/authStore'
import { registrationAPI } from '../api/registration'

export default function ApprovalsPage() {
  // Subscribe to `activities` directly so the list updates reactively on approve/decline
  const activities = useApprovalStore(s => s.activities)
  const getPendingApprovals = useApprovalStore(s => s.getPendingApprovals)
  const approveChange = useApprovalStore(s => s.approveChange)
  const declineChange = useApprovalStore(s => s.declineChange)
  const teamMembers = useTeamStore(s => s.teamMembers)
  const user = useAuthStore(s => s.user)

  // Recomputed on every `activities` change
  const pendingApprovals = getPendingApprovals(user)

  const [declineModalOpen, setDeclineModalOpen] = useState(false)
  const [selectedActivity, setSelectedActivity] = useState(null)
  
  const [resolutionType, setResolutionType] = useState('REASSIGN') // SETTLE_MYSELF or REASSIGN
  const [reassignTo, setReassignTo] = useState('')
  const [declineNotes, setDeclineNotes] = useState('')

  // Client Registration state
  const [clientRegistrations, setClientRegistrations] = useState([])
  const [regLoading, setRegLoading] = useState(false)
  const [activeTab, setActiveTab] = useState('internal') // 'internal' or 'registrations'

  // Fetch client registrations when tab switches
  useEffect(() => {
    if (activeTab === 'registrations' && user?.role === 'OWNER') {
      fetchClientRegistrations()
    }
  }, [activeTab])

  const fetchClientRegistrations = async () => {
    setRegLoading(true)
    try {
      const res = await registrationAPI.getPendingRegistrations()
      setClientRegistrations(res.data)
    } catch (err) {
      toast.error('Failed to load client registrations')
    } finally {
      setRegLoading(false)
    }
  }

  const handleApproveRegistration = async (id) => {
    try {
      await registrationAPI.approveRegistration(id)
      toast.success('Client registration approved! They can now download the software.')
      fetchClientRegistrations()
    } catch (err) {
      toast.error('Failed to approve registration')
    }
  }

  const handleRejectRegistration = async (id) => {
    try {
      await registrationAPI.rejectRegistration(id)
      toast.success('Client registration rejected')
      fetchClientRegistrations()
    } catch (err) {
      toast.error('Failed to reject registration')
    }
  }

  const handleApprove = (id) => {
    approveChange(id)
    if (user?.role === 'OWNER') {
      toast.success('Change approved successfully')
    } else {
      toast.success('Re-submitted for Owner review')
    }
  }

  const openDeclineModal = (row) => {
    setSelectedActivity(row)
    setResolutionType('REASSIGN')
    setReassignTo('')
    setDeclineNotes('')
    setDeclineModalOpen(true)
  }

  const handleDeclineSubmit = () => {
    if (resolutionType === 'REASSIGN' && !reassignTo) {
      return toast.error('Please select a manager to re-assign to')
    }

    const resolutionDetails = {
      type: resolutionType,
      assigneeId: resolutionType === 'REASSIGN' ? reassignTo : 'OWNER',
      assigneeName: resolutionType === 'REASSIGN' 
        ? teamMembers.find(m => m.id === reassignTo)?.name 
        : 'Owner'
    }

    declineChange(selectedActivity.id, resolutionDetails, declineNotes)
    toast.success('Change declined')
    setDeclineModalOpen(false)
    setSelectedActivity(null)
  }

  const columns = [
    {
      key: 'module',
      label: 'Module',
      render: (v) => <span className="badge badge-info">{v}</span>
    },
    {
      key: 'submitter',
      label: 'Submitted By',
      render: (_, row) => (
        <div>
          <div style={{ fontWeight: 500 }}>{row.submitterName}</div>
          <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{row.submitterRole}</div>
        </div>
      )
    },
    {
      key: 'action',
      label: 'Action',
      render: (v) => <Badge status={v} /> // CREATE, UPDATE, DELETE
    },
    {
      key: 'date',
      label: 'Date',
      render: (_, row) => new Date(row.timestamp).toLocaleString()
    },
    {
      key: 'details',
      label: 'Details',
      render: (_, row) => {
        if (!row.data || typeof row.data !== 'object') return <span style={{ color: 'var(--text-muted)' }}>—</span>
        return (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', maxWidth: '350px', background: 'rgba(0,0,0,0.1)', padding: '10px 12px', borderRadius: '6px', border: '1px solid var(--border)' }}>
            {Object.entries(row.data).map(([key, value]) => {
              if (key === 'id') return null
              const formattedKey = key.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())
              const formattedValue = typeof value === 'object' ? JSON.stringify(value) : String(value)
              return (
                <div key={key} style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid rgba(255,255,255,0.05)', paddingBottom: '4px', gap: '16px' }}>
                  <span style={{ color: 'var(--text-muted)', fontSize: '0.75rem', fontWeight: 500, whiteSpace: 'nowrap' }}>{formattedKey}</span>
                  <span style={{ color: 'var(--text-primary)', fontSize: '0.8rem', fontWeight: 600, textAlign: 'right', wordBreak: 'break-word' }}>{formattedValue}</span>
                </div>
              )
            })}
          </div>
        )
      }
    },
    {
      key: 'actions',
      label: 'Actions',
      render: (_, row) => (
        <div style={{ display: 'flex', gap: '8px' }}>
          <button
            onClick={() => handleApprove(row.id)}
            className="btn btn-ghost btn-icon"
            style={{ color: 'var(--success)', border: '1px solid var(--success)' }}
            title="Approve"
          >
            <CheckCircle size={16} />
          </button>
          <button
            onClick={() => openDeclineModal(row)}
            className="btn btn-ghost btn-icon"
            style={{ color: 'var(--danger)', border: '1px solid var(--danger)' }}
            title="Decline"
          >
            <XCircle size={16} />
          </button>
        </div>
      )
    }
  ]

  const registrationColumns = [
    {
      key: 'name',
      label: 'Client Name',
      render: (v) => <span style={{ fontWeight: 500 }}>{v}</span>
    },
    {
      key: 'businessName',
      label: 'Business',
    },
    {
      key: 'email',
      label: 'Email',
    },
    {
      key: 'phone',
      label: 'Phone',
    },
    {
      key: 'createdAt',
      label: 'Submitted',
      render: (v) => v ? new Date(v).toLocaleString() : '—'
    },
    {
      key: 'status',
      label: 'Status',
      render: (v) => <Badge status={v} />
    },
    {
      key: 'actions',
      label: 'Actions',
      render: (_, row) => row.status === 'PENDING' ? (
        <div style={{ display: 'flex', gap: '8px' }}>
          <button
            onClick={() => handleApproveRegistration(row.id)}
            className="btn btn-ghost btn-icon"
            style={{ color: 'var(--success)', border: '1px solid var(--success)' }}
            title="Approve"
          >
            <CheckCircle size={16} />
          </button>
          <button
            onClick={() => handleRejectRegistration(row.id)}
            className="btn btn-ghost btn-icon"
            style={{ color: 'var(--danger)', border: '1px solid var(--danger)' }}
            title="Reject"
          >
            <XCircle size={16} />
          </button>
        </div>
      ) : null
    }
  ]

  return (
    <div className="page-container fadeIn">
      <PageHeader
        title={user?.role === 'OWNER' ? 'Pending Approvals' : 'My Assigned Tasks'}
        subtitle={user?.role === 'OWNER' 
          ? 'Review and approve changes made by your team members and client registrations'
          : 'Items the owner has sent back to you for review or correction'
        }
      />

      {/* Tabs for Owner */}
      {user?.role === 'OWNER' && (
        <div style={{ display: 'flex', gap: '4px', marginBottom: '20px', background: 'var(--bg-surface)', padding: '4px', borderRadius: '10px', border: '1px solid var(--border)', width: 'fit-content' }}>
          <button
            onClick={() => setActiveTab('internal')}
            style={{
              padding: '8px 20px',
              borderRadius: '8px',
              border: 'none',
              cursor: 'pointer',
              fontWeight: 600,
              fontSize: '0.875rem',
              background: activeTab === 'internal' ? 'var(--accent-gold)' : 'transparent',
              color: activeTab === 'internal' ? '#0d1117' : 'var(--text-muted)',
              transition: 'all 0.2s',
            }}
          >
            Internal Approvals
          </button>
          <button
            onClick={() => setActiveTab('registrations')}
            style={{
              padding: '8px 20px',
              borderRadius: '8px',
              border: 'none',
              cursor: 'pointer',
              fontWeight: 600,
              fontSize: '0.875rem',
              background: activeTab === 'registrations' ? 'var(--accent-gold)' : 'transparent',
              color: activeTab === 'registrations' ? '#0d1117' : 'var(--text-muted)',
              transition: 'all 0.2s',
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
            }}
          >
            <UserPlus size={16} /> Client Registrations
          </button>
        </div>
      )}

      {/* Internal Approvals Tab */}
      {(activeTab === 'internal' || user?.role !== 'OWNER') && (
        <div className="card slideIn">
          <DataTable
            columns={columns}
            data={pendingApprovals}
            searchPlaceholder="Search approvals..."
            emptyMessage="No Pending Approvals"
          />
        </div>
      )}

      {/* Client Registrations Tab */}
      {activeTab === 'registrations' && user?.role === 'OWNER' && (
        <div className="card slideIn">
          {regLoading ? (
            <div style={{ padding: '40px', textAlign: 'center', color: 'var(--text-muted)' }}>
              Loading client registrations...
            </div>
          ) : (
            <DataTable
              columns={registrationColumns}
              data={clientRegistrations}
              searchPlaceholder="Search registrations..."
              emptyMessage="No Pending Client Registrations"
            />
          )}
        </div>
      )}

      <Modal
        isOpen={declineModalOpen}
        onClose={() => setDeclineModalOpen(false)}
        title="Decline & Resolve"
        size="md"
        footer={
          <>
            <button className="btn btn-secondary" onClick={() => setDeclineModalOpen(false)}>Cancel</button>
            <button className="btn btn-danger" onClick={handleDeclineSubmit}>Decline Change</button>
          </>
        }
      >
        <div className="form-grid">
          <div className="form-group" style={{ gridColumn: '1 / -1' }}>
            <label className="form-label">How do you want to resolve this?</label>
            <div style={{ display: 'flex', gap: '16px', marginTop: '8px' }}>
              <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}>
                <input 
                  type="radio" 
                  name="resolution" 
                  value="SETTLE_MYSELF" 
                  checked={resolutionType === 'SETTLE_MYSELF'} 
                  onChange={(e) => setResolutionType(e.target.value)} 
                />
                Settle Up Myself
              </label>
              <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}>
                <input 
                  type="radio" 
                  name="resolution" 
                  value="REASSIGN" 
                  checked={resolutionType === 'REASSIGN'} 
                  onChange={(e) => setResolutionType(e.target.value)} 
                />
                Re-assign to Manager
              </label>
            </div>
          </div>
          
          {resolutionType === 'REASSIGN' && (
            <div className="form-group" style={{ gridColumn: '1 / -1' }}>
              <label className="form-label">Select Manager <span className="required">*</span></label>
              <select 
                className="form-select" 
                value={reassignTo} 
                onChange={(e) => setReassignTo(e.target.value)}
              >
                <option value="">-- Choose Manager --</option>
                {teamMembers.map(m => (
                  <option key={m.id} value={m.id}>{m.name} ({m.role})</option>
                ))}
              </select>
            </div>
          )}

          <div className="form-group" style={{ gridColumn: '1 / -1' }}>
            <label className="form-label">Decline Notes (Optional)</label>
            <textarea 
              className="form-textarea" 
              value={declineNotes} 
              onChange={e => setDeclineNotes(e.target.value)} 
              placeholder="Explain why this was declined..."
              rows={3}
            />
          </div>
        </div>
      </Modal>
    </div>
  )
}

