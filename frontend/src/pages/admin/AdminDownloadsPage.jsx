import React, { useState, useEffect } from 'react'
import { Download, XCircle, Search } from 'lucide-react'
import toast from 'react-hot-toast'
import { adminAPI } from '../../api/admin'

export default function AdminDownloadsPage() {
  const [registrations, setRegistrations] = useState([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')

  useEffect(() => {
    loadData()
  }, [])

  const loadData = async () => {
    try {
      const res = await adminAPI.getAllRegistrations()
      // Only show approved clients (those with download access)
      setRegistrations(res.data.filter(r => r.status === 'APPROVED'))
    } catch (err) {
      toast.error('Failed to load download data')
    } finally {
      setLoading(false)
    }
  }

  const handleRevoke = async (id) => {
    if (!confirm('Are you sure you want to revoke download access for this client?')) return
    try {
      await adminAPI.revokeAccess(id)
      toast.success('Download access revoked')
      loadData()
    } catch (err) {
      toast.error('Failed to revoke access')
    }
  }

  const filtered = registrations.filter(reg =>
    !search ||
    reg.name?.toLowerCase().includes(search.toLowerCase()) ||
    reg.businessName?.toLowerCase().includes(search.toLowerCase()) ||
    reg.email?.toLowerCase().includes(search.toLowerCase())
  )

  return (
    <div>
      <div style={{ marginBottom: '32px' }}>
        <h1 style={{ fontSize: '1.75rem', fontWeight: 800, color: '#f1f5f9', marginBottom: '4px' }}>
          Download Management
        </h1>
        <p style={{ color: '#64748b', fontSize: '0.9rem' }}>
          Manage clients with active download access
        </p>
      </div>

      {/* Stats */}
      <div style={{
        background: '#1e293b', border: '1px solid rgba(99,102,241,0.1)', borderRadius: '14px',
        padding: '24px', marginBottom: '24px', display: 'flex', alignItems: 'center', gap: '16px',
      }}>
        <div style={{
          width: '48px', height: '48px', borderRadius: '12px',
          background: 'rgba(34,197,94,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center',
        }}>
          <Download size={24} color="#22c55e" />
        </div>
        <div>
          <div style={{ fontSize: '1.5rem', fontWeight: 800, color: '#f1f5f9' }}>{registrations.length}</div>
          <div style={{ fontSize: '0.85rem', color: '#64748b' }}>Clients with active download access</div>
        </div>
      </div>

      {/* Search */}
      <div style={{ position: 'relative', marginBottom: '20px' }}>
        <Search size={16} style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', color: '#64748b' }} />
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search clients..."
          style={{
            width: '100%', padding: '10px 14px 10px 40px',
            background: '#1e293b', border: '1px solid rgba(99,102,241,0.15)',
            borderRadius: '10px', color: '#f1f5f9', fontSize: '0.875rem', outline: 'none',
          }}
        />
      </div>

      {/* Table */}
      <div style={{
        background: '#1e293b', border: '1px solid rgba(99,102,241,0.1)',
        borderRadius: '14px', overflow: 'hidden',
      }}>
        {loading ? (
          <div style={{ padding: '40px', textAlign: 'center', color: '#64748b' }}>Loading...</div>
        ) : filtered.length === 0 ? (
          <div style={{ padding: '40px', textAlign: 'center', color: '#64748b' }}>
            No clients with download access
          </div>
        ) : (
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ borderBottom: '1px solid rgba(99,102,241,0.1)' }}>
                {['Client', 'Business', 'Email', 'Approved On', 'Actions'].map(h => (
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
                  <td style={{ padding: '14px 16px', color: '#64748b', fontSize: '0.8rem' }}>
                    {reg.approvedAt ? new Date(reg.approvedAt).toLocaleDateString() : '—'}
                  </td>
                  <td style={{ padding: '14px 16px' }}>
                    <button
                      onClick={() => handleRevoke(reg.id)}
                      title="Revoke Access"
                      style={{
                        padding: '6px 12px', borderRadius: '8px',
                        border: '1px solid rgba(239,68,68,0.3)', background: 'rgba(239,68,68,0.1)',
                        color: '#ef4444', fontSize: '0.8rem', fontWeight: 600,
                        cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px',
                      }}
                    >
                      <XCircle size={14} /> Revoke
                    </button>
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
