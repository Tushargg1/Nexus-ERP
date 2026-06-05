import React from 'react'
import { Outlet, NavLink, useNavigate } from 'react-router-dom'
import { LayoutDashboard, Users, Download, LogOut, Shield, Hexagon, Monitor } from 'lucide-react'
import useAdminStore from '../../store/adminStore'
import toast from 'react-hot-toast'

const NAV_ITEMS = [
  { path: '/admin/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
  { path: '/admin/registrations', icon: Users, label: 'Registrations' },
  { path: '/admin/sessions', icon: Monitor, label: 'Devices & Sessions' },
  { path: '/admin/downloads', icon: Download, label: 'Downloads' },
]

export default function AdminLayout() {
  const user = useAdminStore(s => s.user)
  const logout = useAdminStore(s => s.logout)
  const navigate = useNavigate()

  const handleLogout = () => {
    logout()
    toast.success('Logged out from admin portal')
    navigate('/admin/login')
  }

  return (
    <div style={{ display: 'flex', minHeight: '100vh', background: '#0f172a' }}>
      {/* Sidebar */}
      <aside style={{
        width: '260px',
        background: '#1e293b',
        borderRight: '1px solid rgba(99, 102, 241, 0.1)',
        display: 'flex',
        flexDirection: 'column',
        position: 'fixed',
        top: 0,
        left: 0,
        bottom: 0,
        zIndex: 50,
      }}>
        {/* Brand */}
        <div style={{
          padding: '24px 20px',
          borderBottom: '1px solid rgba(99, 102, 241, 0.1)',
          display: 'flex',
          alignItems: 'center',
          gap: '12px',
        }}>
          <div style={{
            width: '36px',
            height: '36px',
            background: 'linear-gradient(135deg, #6366f1, #4f46e5)',
            borderRadius: '10px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}>
            <Shield size={20} color="#ffffff" />
          </div>
          <div>
            <div style={{ fontSize: '0.95rem', fontWeight: 800, color: '#f1f5f9', letterSpacing: '0.02em' }}>
              Nexus Admin
            </div>
            <div style={{ fontSize: '0.7rem', color: '#6366f1', fontWeight: 600 }}>
              WEBSITE PORTAL
            </div>
          </div>
        </div>

        {/* Navigation */}
        <nav style={{ flex: 1, padding: '16px 12px', display: 'flex', flexDirection: 'column', gap: '4px' }}>
          {NAV_ITEMS.map(({ path, icon: Icon, label }) => (
            <NavLink
              key={path}
              to={path}
              style={({ isActive }) => ({
                display: 'flex',
                alignItems: 'center',
                gap: '12px',
                padding: '12px 16px',
                borderRadius: '10px',
                textDecoration: 'none',
                fontSize: '0.9rem',
                fontWeight: 500,
                color: isActive ? '#ffffff' : '#94a3b8',
                background: isActive ? 'rgba(99, 102, 241, 0.15)' : 'transparent',
                borderLeft: isActive ? '3px solid #6366f1' : '3px solid transparent',
                transition: 'all 0.2s',
              })}
            >
              <Icon size={18} />
              {label}
            </NavLink>
          ))}
        </nav>

        {/* User info & logout */}
        <div style={{
          padding: '16px 20px',
          borderTop: '1px solid rgba(99, 102, 241, 0.1)',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '12px' }}>
            <div style={{
              width: '32px', height: '32px', borderRadius: '8px',
              background: 'rgba(99, 102, 241, 0.2)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}>
              <Hexagon size={16} color="#6366f1" />
            </div>
            <div>
              <div style={{ fontSize: '0.8rem', fontWeight: 600, color: '#f1f5f9' }}>
                {user?.name || 'Admin'}
              </div>
              <div style={{ fontSize: '0.7rem', color: '#64748b' }}>
                {user?.email || ''}
              </div>
            </div>
          </div>
          <button
            onClick={handleLogout}
            style={{
              width: '100%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '8px',
              padding: '10px',
              background: 'rgba(239, 68, 68, 0.1)',
              border: '1px solid rgba(239, 68, 68, 0.2)',
              borderRadius: '8px',
              color: '#ef4444',
              fontSize: '0.8rem',
              fontWeight: 600,
              cursor: 'pointer',
              transition: 'background 0.2s',
            }}
          >
            <LogOut size={14} /> Logout
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main style={{
        flex: 1,
        marginLeft: '260px',
        padding: '32px 40px',
        minHeight: '100vh',
        background: '#0f172a',
      }}>
        <Outlet />
      </main>
    </div>
  )
}
