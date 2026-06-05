import React, { useState, useEffect } from 'react'
import { Monitor, LogOut, RefreshCw, Circle, Search } from 'lucide-react'
import toast from 'react-hot-toast'
import { adminAPI } from '../../api/admin'

export default function AdminSessionsPage() {
  const [clients, setClients] = useState([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [forcing, setForcing] = useState(null)

  useEffect(() => { load() }, [])

  const load = async () => {
    setLoading(true)
    try {
      const res = await adminAPI.getAllSessions()
      setClients(res.data || [])
    } catch (err) {
      toast.error('Failed to load sessions')
    } finally {
      setLoading(false)
    }
  }

  const handleForceLogout = async (email) => {
    setForcing(email)
    try {
      await adminAPI.forceLogout(email)
      toast.success(`${email} signed out from all devices`)
      await load()
    } catch (err) {
      toast.error('Failed to force logout')
    } finally {
      setForcing(null)
    }
  }

  const fmt = (d) => d ? new Date(d).toLocaleString() : '—'

  const filtered = clients.filter(c =>
    !search ||
    c.name?.toLowerCase().includes(search.toLowerCase()) ||
    c.email?.toLowerCase().includes(search.toLowerCase()) ||
    c.businessName?.toLowerCase().includes(search.toLowerCase())
  )

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '24px' }}>
        <div>
          <h1 style={{ fontSize: '1.75rem', fontWeight: 800, color: '#f1f5f9', marginBottom: '4px' }}>
            Devices & Sessions
          </h1>
          <p style={{ color: '#64748b', fontSize: '0.9rem' }}>
            View every client's devices and active session. Force a sign-out to require re-login.
          </p>
        </div>
        <button
          onClick={load}
          style={{
            display: 'flex', alignItems: 'center', gap: '8px', padding: '10px 16px',
            background: '#1e293b', border: '1px solid rgba(99,102,241,0.2)', borderRadius: '10px',
            color: '#cbd5e1', cursor: 'pointer', fontSize: '0.85rem',
          }}
        >
          <RefreshCw size={15} /> Refresh
        </button>
      </div>

      {/* Search */}
      <div style={{ position: 'relative', marginBottom: '20px', maxWidth: '420px' }}>
        <Search size={16} style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', color: '#64748b' }} />
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search by name, business, or email..."
          style={{
            width: '100%', padding: '10px 14px 10px 40px', background: '#1e293b',
            border: '1px solid rgba(99,102,241,0.15)', borderRadius: '10px', color: '#f1f5f9',
            fontSize: '0.875rem', outline: 'none',
          }}
        />
      </div>

      {loading ? (
        <div style={{ padding: '40px', textAlign: 'center', color: '#64748b' }}>Loading...</div>
      ) : filtered.length === 0 ? (
        <div style={{ padding: '40px', textAlign: 'center', color: '#64748b' }}>No clients found.</div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {filtered.map((c) => (
            <div key={c.email} style={{
              background: '#1e293b', border: '1px solid rgba(99,102,241,0.1)',
              borderRadius: '14px', padding: '20px',
            }}>
              {/* Client header */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <span style={{ fontWeight: 700, color: '#f1f5f9', fontSize: '1rem' }}>{c.name}</span>
                    <span style={{
                      display: 'inline-flex', alignItems: 'center', gap: '5px', fontSize: '0.7rem', fontWeight: 600,
                      padding: '3px 10px', borderRadius: '20px',
                      background: c.sessionActive ? 'rgba(34,197,94,0.12)' : 'rgba(148,163,184,0.12)',
                      color: c.sessionActive ? '#22c55e' : '#94a3b8',
                    }}>
                      <Circle size={8} fill="currentColor" />
                      {c.sessionActive ? 'ONLINE' : 'OFFLINE'}
                    </span>
                  </div>
                  <div style={{ color: '#64748b', fontSize: '0.8rem', marginTop: '2px' }}>
                    {c.email} · {c.businessName}
                  </div>
                </div>
                <button
                  onClick={() => handleForceLogout(c.email)}
                  disabled={!c.sessionActive || forcing === c.email}
                  style={{
                    display: 'flex', alignItems: 'center', gap: '6px', padding: '8px 14px',
                    background: c.sessionActive ? 'rgba(239,68,68,0.1)' : 'rgba(148,163,184,0.08)',
                    border: `1px solid ${c.sessionActive ? 'rgba(239,68,68,0.3)' : 'rgba(148,163,184,0.2)'}`,
                    borderRadius: '8px', color: c.sessionActive ? '#ef4444' : '#64748b',
                    cursor: c.sessionActive ? 'pointer' : 'not-allowed', fontSize: '0.8rem', fontWeight: 600,
                  }}
                >
                  <LogOut size={14} /> {forcing === c.email ? 'Signing out...' : 'Force Logout'}
                </button>
              </div>

              {/* Devices */}
              {c.devices && c.devices.length > 0 ? (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  {c.devices.map((d) => (
                    <div key={d.deviceId} style={{
                      display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                      padding: '10px 14px', background: '#0f172a', borderRadius: '8px',
                      border: d.isActive ? '1px solid rgba(34,197,94,0.3)' : '1px solid rgba(255,255,255,0.04)',
                    }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                        <Monitor size={16} color={d.isActive ? '#22c55e' : '#64748b'} />
                        <div>
                          <div style={{ color: '#e2e8f0', fontSize: '0.85rem', fontWeight: 500 }}>
                            {d.label || 'Unknown device'}
                            {d.isActive && <span style={{ marginLeft: '8px', fontSize: '0.7rem', color: '#22c55e', fontWeight: 600 }}>● ACTIVE NOW</span>}
                          </div>
                          <div style={{ color: '#64748b', fontSize: '0.72rem', fontFamily: 'monospace' }}>
                            {d.deviceId?.slice(0, 24)}…
                          </div>
                        </div>
                      </div>
                      <div style={{ textAlign: 'right', color: '#64748b', fontSize: '0.72rem' }}>
                        <div>Last seen: {fmt(d.lastSeen)}</div>
                        <div>First seen: {fmt(d.firstSeen)}</div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div style={{ color: '#64748b', fontSize: '0.8rem', fontStyle: 'italic' }}>
                  No devices have signed in yet.
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
