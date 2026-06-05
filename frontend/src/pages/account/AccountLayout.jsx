import React from 'react'
import { Outlet, NavLink, useNavigate } from 'react-router-dom'
import { Hexagon, LayoutDashboard, ShoppingBag, Package, Settings, LogOut } from 'lucide-react'
import useAuthStore from '../../store/authStore'

const NAV_ITEMS = [
  { to: '/account', icon: LayoutDashboard, label: 'Overview', end: true },
  { to: '/account/purchases', icon: ShoppingBag, label: 'Purchases' },
  { to: '/account/software', icon: Package, label: 'My Software' },
  { to: '/account/settings', icon: Settings, label: 'Settings' },
]

export default function AccountLayout() {
  const user = useAuthStore((s) => s.user)
  const logout = useAuthStore((s) => s.logout)
  const navigate = useNavigate()

  const handleLogout = () => {
    logout()
    navigate('/')
  }

  return (
    <div style={{ minHeight: '100vh', display: 'flex', background: 'var(--bg-primary)' }}>
      {/* Sidebar */}
      <aside style={{
        width: '260px',
        background: 'var(--bg-surface)',
        borderRight: '1px solid var(--border)',
        display: 'flex',
        flexDirection: 'column',
        flexShrink: 0,
      }}>
        {/* Brand */}
        <div style={{
          padding: '24px 20px',
          borderBottom: '1px solid var(--border)',
          display: 'flex',
          alignItems: 'center',
          gap: '12px',
          cursor: 'pointer',
        }} onClick={() => navigate('/')}>
          <div style={{
            width: '36px',
            height: '36px',
            background: 'linear-gradient(135deg, #f59e0b, #d97706)',
            borderRadius: '8px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}>
            <Hexagon size={20} color="#0d1117" strokeWidth={2.5} />
          </div>
          <span style={{ fontSize: '1.1rem', fontWeight: 700, color: 'var(--text-primary)' }}>
            Nexus ERP
          </span>
        </div>

        {/* User info */}
        <div style={{ padding: '20px', borderBottom: '1px solid var(--border)' }}>
          <p style={{ fontSize: '0.875rem', color: 'var(--text-muted)', marginBottom: '4px' }}>Logged in as</p>
          <p style={{ fontSize: '1rem', fontWeight: 600, color: 'var(--text-primary)' }}>
            {user?.name || 'User'}
          </p>
          <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
            {user?.email || ''}
          </p>
        </div>

        {/* Navigation */}
        <nav style={{ flex: 1, padding: '16px 12px', display: 'flex', flexDirection: 'column', gap: '4px' }}>
          {NAV_ITEMS.map(({ to, icon: Icon, label, end }) => (
            <NavLink
              key={to}
              to={to}
              end={end}
              style={({ isActive }) => ({
                display: 'flex',
                alignItems: 'center',
                gap: '12px',
                padding: '10px 14px',
                borderRadius: '8px',
                textDecoration: 'none',
                fontSize: '0.9rem',
                fontWeight: isActive ? 600 : 500,
                color: isActive ? 'var(--accent-gold)' : 'var(--text-secondary)',
                background: isActive ? 'rgba(245,158,11,0.1)' : 'transparent',
                transition: 'all 0.2s ease',
              })}
            >
              <Icon size={18} />
              {label}
            </NavLink>
          ))}
        </nav>

        {/* Logout */}
        <div style={{ padding: '16px 12px', borderTop: '1px solid var(--border)' }}>
          <button
            onClick={handleLogout}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '12px',
              padding: '10px 14px',
              borderRadius: '8px',
              border: 'none',
              background: 'none',
              cursor: 'pointer',
              fontSize: '0.9rem',
              fontWeight: 500,
              color: 'var(--danger)',
              width: '100%',
              transition: 'background 0.2s',
            }}
            onMouseEnter={e => e.currentTarget.style.background = 'rgba(239,68,68,0.08)'}
            onMouseLeave={e => e.currentTarget.style.background = 'none'}
          >
            <LogOut size={18} />
            Sign Out
          </button>
        </div>
      </aside>

      {/* Main content */}
      <main style={{ flex: 1, padding: '32px 40px', overflowY: 'auto' }}>
        <Outlet />
      </main>
    </div>
  )
}
