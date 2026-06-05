import React, { useState, useEffect } from 'react'
import { Users, UserCheck, Clock, XCircle, CheckCircle } from 'lucide-react'
import toast from 'react-hot-toast'
import { adminAPI } from '../../api/admin'

export default function AdminDashboardPage() {
  const [stats, setStats] = useState(null)
  const [pending, setPending] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadData()
  }, [])

  const loadData = async () => {
    try {
      const [statsRes, pendingRes] = await Promise.all([
        adminAPI.getStats(),
        adminAPI.getPendingRegistrations(),
      ])
      setStats(statsRes.data)
      setPending(pendingRes.data.slice(0, 5))
    } catch (err) {
      toast.error('Failed to load dashboard data')
    } finally {
      setLoading(false)
    }
  }

  const handleApprove = async (id) => {
    try {
      await adminAPI.approveRegistration(id)
      toast.success('Registration approved!')
      loadData()
    } catch (err) {
      toast.error('Failed to approve')
    }
  }

  const handleReject = async (id) => {
    try {
      await adminAPI.rejectRegistration(id)
      toast.success('Registration rejected')
      loadData()
    } catch (err) {
      toast.error('Failed to reject')
    }
  }

  if (loading) {
    return <div style={{ color: '#94a3b8', padding: '40px', textAlign: 'center' }}>Loading dashboard...</div>
  }

  const statCards = [
    { label: 'Total Registrations', value: stats?.totalRegistrations || 0, icon: Users, color: '#6366f1' },
    { label: 'Pending Approval', value: stats?.pendingRegistrations || 0, icon: Clock, color: '#f59e0b' },
    { label: 'Approved Clients', value: stats?.approvedRegistrations || 0, icon: UserCheck, color: '#22c55e' },
    { label: 'Rejected', value: stats?.rejectedRegistrations || 0, icon: XCircle, color: '#ef4444' },
  ]

  return (
    <div>
      <div style={{ marginBottom: '32px' }}>
        <h1 style={{ fontSize: '1.75rem', fontWeight: 800, color: '#f1f5f9', marginBottom: '4px' }}>
          Dashboard
        </h1>
        <p style={{ color: '#64748b', fontSize: '0.9rem' }}>
          Overview of client registrations and website activity
        </p>
      </div>

      {/* Stats Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '20px', marginBottom: '40px' }}>
        {statCards.map(({ label, value, icon: Icon, color }) => (
          <div key={label} style={{
            background: '#1e293b',
            border: '1px solid rgba(99, 102, 241, 0.1)',
            borderRadius: '14px',
            padding: '24px',
          }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px' }}>
              <span style={{ color: '#94a3b8', fontSize: '0.8rem', fontWeight: 500 }}>{label}</span>
              <div style={{
                width: '36px', height: '36px', borderRadius: '10px',
                background: `${color}15`,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
              }}>
                <Icon size={18} color={color} />
              </div>
            </div>
            <div style={{ fontSize: '2rem', fontWeight: 800, color: '#f1f5f9' }}>{value}</div>
          </div>
        ))}
      </div>

      {/* Recent Pending */}
      <div style={{
        background: '#1e293b',
        border: '1px solid rgba(99, 102, 241, 0.1)',
        borderRadius: '14px',
        overflow: 'hidden',
      }}>
        <div style={{ padding: '20px 24px', borderBottom: '1px solid rgba(99, 102, 241, 0.1)' }}>
          <h2 style={{ fontSize: '1.1rem', fontWeight: 700, color: '#f1f5f9' }}>
            Recent Pending Registrations
          </h2>
        </div>

        {pending.length === 0 ? (
          <div style={{ padding: '40px', textAlign: 'center', color: '#64748b' }}>
            No pending registrations
          </div>
        ) : (
          <div>
            {pending.map((reg) => (
              <div key={reg.id} style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '16px 24px',
                borderBottom: '1px solid rgba(255,255,255,0.03)',
              }}>
                <div>
                  <div style={{ fontWeight: 600, color: '#f1f5f9', fontSize: '0.9rem' }}>{reg.name}</div>
                  <div style={{ color: '#64748b', fontSize: '0.8rem' }}>
                    {reg.businessName} · {reg.email}
                  </div>
                </div>
                <div style={{ display: 'flex', gap: '8px' }}>
                  <button
                    onClick={() => handleApprove(reg.id)}
                    style={{
                      padding: '6px 14px', borderRadius: '8px', border: '1px solid rgba(34,197,94,0.3)',
                      background: 'rgba(34,197,94,0.1)', color: '#22c55e', fontSize: '0.8rem',
                      fontWeight: 600, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px',
                    }}
                  >
                    <CheckCircle size={14} /> Approve
                  </button>
                  <button
                    onClick={() => handleReject(reg.id)}
                    style={{
                      padding: '6px 14px', borderRadius: '8px', border: '1px solid rgba(239,68,68,0.3)',
                      background: 'rgba(239,68,68,0.1)', color: '#ef4444', fontSize: '0.8rem',
                      fontWeight: 600, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px',
                    }}
                  >
                    <XCircle size={14} /> Reject
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
