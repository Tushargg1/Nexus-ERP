import React, { useState, useEffect } from 'react'
import { CheckCircle, XCircle, Search, Filter } from 'lucide-react'
import toast from 'react-hot-toast'
import { adminAPI } from '../../api/admin'

export default function AdminRegistrationsPage() {
  const [registrations, setRegistrations] = useState([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState('ALL')

  useEffect(() => {
    loadRegistrations()
  }, [])

  const loadRegistrations = async () => {
    try {
      const res = await adminAPI.getAllRegistrations()
      setRegistrations(res.data)
    } catch (err) {
      toast.error('Failed to load registrations')
    } finally {
      setLoading(false)
    }
  }

  const handleApprove = async (id) => {
    try {
      await adminAPI.approveRegistration(id)
      toast.success('Registration approved!')
      loadRegistrations()
    } catch (err) {
      toast.error('Failed to approve')
    }
  }

  const handleReject = async (id) => {
    try {
      await adminAPI.rejectRegistration(id)
      toast.success('Registration rejected')
      loadRegistrations()
    } catch (err) {
      toast.error('Failed to reject')
    }
  }

  const filtered = registrations.filter(reg => {
    const matchesSearch = !search || 
      reg.name?.toLowerCase().includes(search.toLowerCase()) ||
      reg.businessName?.toLowerCase().includes(search.toLowerCase()) ||
      reg.email?.toLowerCase().includes(search.toLowerCase())
    const matchesStatus = statusFilter === 'ALL' || reg.status === statusFilter
    return matchesSearch && matchesStatus
  })

  const getStatusBadge = (status) => {
    const styles = {
      PENDING: { bg: 'rgba(245,158,11,0.1)', color: '#f59e0b', border: 'rgba(245,158,11,0.3)' },
      APPROVED: { bg: 'rgba(34,197,94,0.1)', color: '#22c55e', border: 'rgba(34,197,94,0.3)' },
      REJECTED: { bg: 'rgba(239,68,68,0.1)', color: '#ef4444', border: 'rgba(239,68,68,0.3)' },
    }
    const s = styles[status] || styles.PENDING
    return (
      <span style={{
        padding: '4px 10px', borderRadius: '6px', fontSize: '0.75rem',
        fontWeight: 600, background: s.bg, color: s.color, border: `1px solid ${s.border}`,
      }}>
        {status}
      </span>
    )
  }

  return (
    <div>
      <div style={{ marginBottom: '32px' }}>
        <h1 style={{ fontSize: '1.75rem', fontWeight: 800, color: '#f1f5f9', marginBottom: '4px' }}>
          Client Registrations
        </h1>
        <p style={{ color: '#64748b', fontSize: '0.9rem' }}>
          Manage all client registration requests
        </p>
      </div>

      {/* Filters */}
      <div style={{ display: 'flex', gap: '12px', marginBottom: '24px' }}>
        <div style={{ position: 'relative', flex: 1 }}>
          <Search size={16} style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', color: '#64748b' }} />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by name, business, or email..."
            style={{
              width: '100%', padding: '10px 14px 10px 40px',
              background: '#1e293b', border: '1px solid rgba(99,102,241,0.15)',
              borderRadius: '10px', color: '#f1f5f9', fontSize: '0.875rem', outline: 'none',
            }}
          />
        </div>
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          style={{
            padding: '10px 16px', background: '#1e293b', border: '1px solid rgba(99,102,241,0.15)',
            borderRadius: '10px', color: '#f1f5f9', fontSize: '0.875rem', outline: 'none', cursor: 'pointer',
          }}
        >
          <option value="ALL">All Status</option>
          <option value="PENDING">Pending</option>
          <option value="APPROVED">Approved</option>
          <option value="REJECTED">Rejected</option>
        </select>
      </div>

      {/* Table */}
      <div style={{
        background: '#1e293b',
        border: '1px solid rgba(99,102,241,0.1)',
        borderRadius: '14px',
        overflow: 'hidden',
      }}>
        {loading ? (
          <div style={{ padding: '40px', textAlign: 'center', color: '#64748b' }}>Loading...</div>
        ) : filtered.length === 0 ? (
          <div style={{ padding: '40px', textAlign: 'center', color: '#64748b' }}>No registrations found</div>
        ) : (
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ borderBottom: '1px solid rgba(99,102,241,0.1)' }}>
                {['Name', 'Business', 'Email', 'Phone', 'Status', 'Submitted', 'Actions'].map(h => (
                  <th key={h} style={{
                    padding: '14px 16px', textAlign: 'left', color: '#94a3b8',
                    fontSize: '0.75rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em',
                  }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.map(reg => (
                <tr key={reg.id} style={{ borderBottom: '1px solid rgba(255,255,255,0.03)' }}>
                  <td style={{ padding: '14px 16px', color: '#f1f5f9', fontWeight: 500, fontSize: '0.875rem' }}>
                    {reg.name}
                  </td>
                  <td style={{ padding: '14px 16px', color: '#94a3b8', fontSize: '0.85rem' }}>
                    {reg.businessName}
                  </td>
                  <td style={{ padding: '14px 16px', color: '#94a3b8', fontSize: '0.85rem' }}>
                    {reg.email}
                  </td>
                  <td style={{ padding: '14px 16px', color: '#94a3b8', fontSize: '0.85rem' }}>
                    {reg.phone}
                  </td>
                  <td style={{ padding: '14px 16px' }}>
                    {getStatusBadge(reg.status)}
                  </td>
                  <td style={{ padding: '14px 16px', color: '#64748b', fontSize: '0.8rem' }}>
                    {reg.createdAt ? new Date(reg.createdAt).toLocaleDateString() : '—'}
                  </td>
                  <td style={{ padding: '14px 16px' }}>
                    {reg.status === 'PENDING' && (
                      <div style={{ display: 'flex', gap: '6px' }}>
                        <button
                          onClick={() => handleApprove(reg.id)}
                          title="Approve"
                          style={{
                            width: '30px', height: '30px', borderRadius: '8px',
                            border: '1px solid rgba(34,197,94,0.3)', background: 'rgba(34,197,94,0.1)',
                            color: '#22c55e', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center',
                          }}
                        >
                          <CheckCircle size={14} />
                        </button>
                        <button
                          onClick={() => handleReject(reg.id)}
                          title="Reject"
                          style={{
                            width: '30px', height: '30px', borderRadius: '8px',
                            border: '1px solid rgba(239,68,68,0.3)', background: 'rgba(239,68,68,0.1)',
                            color: '#ef4444', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center',
                          }}
                        >
                          <XCircle size={14} />
                        </button>
                      </div>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  )
}
