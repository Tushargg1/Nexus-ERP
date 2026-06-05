import React from 'react'
import { NavLink, useNavigate } from 'react-router-dom'
import {
  LayoutDashboard, Truck, Users, Package, ShoppingBag,
  ShoppingCart, TrendingUp, CreditCard, User, Calendar,
  DollarSign, Receipt, Factory, BarChart3, Bell, Settings,
  ChevronLeft, ChevronRight, LogOut, Hexagon, UserCog, Activity,
} from 'lucide-react'
import useAuthStore from '../../store/authStore'
import useNotificationStore from '../../store/notificationStore'
import useApprovalStore from '../../store/approvalStore'

const NAV_GROUPS = [
  {
    label: 'OVERVIEW',
    items: [
      { to: '/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
    ],
  },
  {
    label: 'PARTIES',
    items: [
      { to: '/suppliers', icon: Truck, label: 'Suppliers' },
      { to: '/customers', icon: Users, label: 'Buyers' },
    ],
  },
  {
    label: 'INVENTORY',
    items: [
      { to: '/inventory/raw-materials', icon: Package, label: 'Raw Materials' },
      { to: '/inventory/finished-goods', icon: ShoppingBag, label: 'Finished Goods' },
      { to: '/production', icon: Factory, label: 'Ongoing Production' },
    ],
  },
  {
    label: 'TRANSACTIONS',
    items: [
      { to: '/purchases', icon: ShoppingCart, label: 'Purchases' },
      { to: '/sales', icon: TrendingUp, label: 'Sales' },
      { to: '/payments', icon: CreditCard, label: 'Payments' },
    ],
  },
  {
    label: 'WORKFORCE',
    items: [
      { to: '/employees', icon: User, label: 'Employees' },
      { to: '/attendance', icon: Calendar, label: 'Attendance' },
      { to: '/salaries', icon: DollarSign, label: 'Salaries' },
      { to: '/expenses', icon: Receipt, label: 'Expenses' },
    ],
  },
  {
    label: 'ANALYTICS',
    items: [
      { to: '/reports', icon: BarChart3, label: 'Reports' },
    ],
  },
  {
    label: 'SYSTEM',
    items: [
      { to: '/approvals', icon: Bell, label: 'Pending Approvals' },
      { to: '/team', icon: UserCog, label: 'Team', roles: ['OWNER'] },
      { to: '/activity', icon: Activity, label: 'Activity Log' },
      { to: '/notifications', icon: Bell, label: 'Notifications' },
      { to: '/settings', icon: Settings, label: 'Settings', roles: ['OWNER'] },
    ],
  },
]

export default function Sidebar({ collapsed, onToggle }) {
  const { user, logout } = useAuthStore()
  const unreadCount = useNotificationStore((s) => s.unreadCount)
  const pendingCount = useApprovalStore((s) => s.getPendingApprovals(user).length)
  const navigate = useNavigate()

  const handleLogout = () => {
    logout()
    navigate('/login')
  }

  const initials = user?.name
    ? user.name.split(' ').map((n) => n[0]).join('').toUpperCase().slice(0, 2)
    : 'U'

  return (
    <aside className={`sidebar ${collapsed ? 'collapsed' : ''}`}>
      {/* Logo */}
      <div className="sidebar-logo">
        <div className="sidebar-logo-icon">
          <Hexagon size={20} color="#0d1117" strokeWidth={2.5} />
        </div>
        {!collapsed && (
          <div className="sidebar-logo-text">
            <div>Nexus ERP</div>
            <div className="sidebar-logo-sub">Business Management</div>
          </div>
        )}
      </div>

      {/* Toggle button */}
      <button
        onClick={onToggle}
        className="btn btn-ghost btn-icon"
        style={{
          position: 'absolute',
          top: '14px',
          right: collapsed ? '8px' : '12px',
          zIndex: 10,
          width: '28px',
          height: '28px',
          padding: 0,
          borderRadius: '6px',
          background: 'var(--bg-elevated)',
          border: '1px solid var(--border)',
          color: 'var(--text-muted)',
        }}
        title={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
      >
        {collapsed ? <ChevronRight size={14} /> : <ChevronLeft size={14} />}
      </button>

      {/* Navigation */}
      <nav className="sidebar-nav">
        {NAV_GROUPS.map((group) => (
          <div key={group.label} className="sidebar-group">
            <div className="sidebar-group-label">{group.label}</div>
            {group.items
              .filter((item) => {
                if (item.to === '/approvals' && pendingCount > 0) return true
                return !item.roles || item.roles.includes(user?.role)
              })
              .map((item) => {
              const Icon = item.icon
              const isNotif = item.to === '/notifications'
              return (
                <NavLink
                  key={item.to}
                  to={item.to}
                  className={({ isActive }) =>
                    `sidebar-item ${isActive ? 'active' : ''}`
                  }
                  title={collapsed ? item.label : ''}
                >
                  <span className="sidebar-icon">
                    <Icon size={18} />
                  </span>
                  <span className="sidebar-label">{item.label}</span>
                  {isNotif && unreadCount > 0 && !collapsed && (
                    <span
                      style={{
                        marginLeft: 'auto',
                        background: 'var(--danger)',
                        color: '#fff',
                        fontSize: '0.625rem',
                        fontWeight: 700,
                        padding: '1px 6px',
                        borderRadius: '10px',
                      }}
                    >
                      {unreadCount}
                    </span>
                  )}
                  {collapsed && (
                    <div className="sidebar-tooltip">{item.label}</div>
                  )}
                </NavLink>
              )
            })}
          </div>
        ))}
      </nav>

      {/* User footer */}
      <div className="sidebar-footer">
        <div className="sidebar-user">
          <div className="sidebar-avatar">{initials}</div>
          {!collapsed && (
            <div className="sidebar-user-info" style={{ flex: 1, minWidth: 0 }}>
              <div className="sidebar-user-name truncate">{user?.name || 'User'}</div>
              <div className="sidebar-user-role">{user?.role || 'Staff'}</div>
            </div>
          )}
          {!collapsed && (
            <button
              onClick={handleLogout}
              className="btn btn-ghost btn-icon"
              title="Logout"
              style={{ flexShrink: 0, color: 'var(--text-muted)' }}
            >
              <LogOut size={16} />
            </button>
          )}
        </div>
        {collapsed && (
          <button
            onClick={handleLogout}
            className="btn btn-ghost btn-icon"
            title="Logout"
            style={{ width: '100%', marginTop: '8px', color: 'var(--text-muted)' }}
          >
            <LogOut size={16} />
          </button>
        )}
      </div>
    </aside>
  )
}
