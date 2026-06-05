import React from 'react'
import { Link, useLocation } from 'react-router-dom'
import { Hexagon } from 'lucide-react'

export default function PublicNavbar() {
  const location = useLocation()

  const isActive = (path) => location.pathname === path

  return (
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
      zIndex: 100,
    }}>
      {/* Brand */}
      <Link
        to="/"
        style={{ display: 'flex', alignItems: 'center', gap: '12px', textDecoration: 'none', cursor: 'pointer' }}
      >
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

      {/* Center nav links + Right action buttons */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
        {[
          { label: 'Features', id: 'features' },
          { label: 'How It Works', id: 'how-it-works' },
          { label: 'Pricing', id: 'pricing' },
        ].map(({ label, id }) => (
          <button
            key={label}
            onClick={() => {
              if (location.pathname === '/') {
                document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' })
              } else {
                window.location.href = '/#' + id
              }
            }}
            style={{
              background: 'none', border: 'none', cursor: 'pointer',
              color: 'var(--text-muted)', fontSize: '0.9rem', fontWeight: 500,
              padding: '8px 16px', borderRadius: '8px',
              transition: 'color 0.2s, background 0.2s',
            }}
            onMouseEnter={e => { e.target.style.color = 'var(--text-primary)'; e.target.style.background = 'rgba(255,255,255,0.06)' }}
            onMouseLeave={e => { e.target.style.color = 'var(--text-muted)'; e.target.style.background = 'none' }}
          >
            {label}
          </button>
        ))}

        <div style={{ width: '1px', height: '24px', background: 'var(--border)', margin: '0 12px' }} />

        <Link to="/login" style={{
          color: isActive('/login') ? 'var(--text-primary)' : 'var(--text-muted)',
          fontSize: '0.9rem', fontWeight: isActive('/login') ? 600 : 500,
          padding: '8px 16px', borderRadius: '8px', textDecoration: 'none',
          transition: 'color 0.2s, background 0.2s',
        }}
        onMouseEnter={e => { e.target.style.color = 'var(--text-primary)'; e.target.style.background = 'rgba(255,255,255,0.06)' }}
        onMouseLeave={e => { if (!isActive('/login')) { e.target.style.color = 'var(--text-muted)' }; e.target.style.background = 'none' }}
        >
          Login
        </Link>
        <Link to="/trial" className="btn btn-secondary" style={{ padding: '8px 20px', fontSize: '0.9rem' }}>
          Try for free
        </Link>
        <Link to="/register" className="btn btn-primary" style={{ padding: '8px 20px', fontSize: '0.9rem' }}>
          Request Access
        </Link>
      </div>
    </nav>
  )
}
