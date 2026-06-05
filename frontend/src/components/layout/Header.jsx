import React from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { Search, Bell, Menu, ChevronRight, Download, PlusCircle, Users, ClipboardCheck } from 'lucide-react'
import useAuthStore from '../../store/authStore'
import useApprovalStore from '../../store/approvalStore'
import useNotificationStore from '../../store/notificationStore'
import { backupsAPI } from '../../api/backups'
import toast from 'react-hot-toast'

const PAGE_TITLES = {
  '/dashboard': { title: 'Dashboard', subtitle: 'Overview of your business operations' },
  '/suppliers': { title: 'Suppliers', subtitle: 'Manage your material suppliers' },
  '/customers': { title: 'Customers', subtitle: 'Manage customer accounts and dues' },
  '/inventory/raw-materials': { title: 'Raw Materials', subtitle: 'Track your material inventory' },
  '/inventory/finished-goods': { title: 'Finished Goods', subtitle: 'Manage your product inventory' },
  '/purchases': { title: 'Purchases', subtitle: 'Purchase invoices and payments' },
  '/sales': { title: 'Sales', subtitle: 'Sales invoices and collections' },
  '/payments': { title: 'Payments', subtitle: 'Track all payment transactions' },
  '/employees': { title: 'Employees', subtitle: 'Manage your workforce' },
  '/attendance': { title: 'Attendance', subtitle: 'Track daily attendance records' },
  '/salaries': { title: 'Salaries', subtitle: 'Payroll and salary management' },
  '/expenses': { title: 'Expenses', subtitle: 'Track business expenses' },
  '/production': { title: 'Production', subtitle: 'Monitor production workflow' },
  '/reports': { title: 'Reports', subtitle: 'Analytics and business reports' },
  '/notifications': { title: 'Notifications', subtitle: 'System alerts and notifications' },
  '/settings': { title: 'Settings', subtitle: 'System configuration and preferences' },
}

export default function Header({ onToggleSidebar }) {
  const location = useLocation()
  const navigate = useNavigate()
  const user = useAuthStore((s) => s.user)
  const switchDemoUser = useAuthStore((s) => s.switchDemoUser)
  const pendingCount = useApprovalStore((s) => s.getPendingApprovals(user).length)
  const unreadCount = useNotificationStore((s) => s.unreadCount)

  const pageInfo = PAGE_TITLES[location.pathname] || { title: 'Nexus ERP', subtitle: '' }

  const initials = user?.name
    ? user.name.split(' ').map((n) => n[0]).join('').toUpperCase().slice(0, 2)
    : 'U'

  return (
    <header className="header">
      <div className="header-left">
        <div>
          <h1 style={{ fontSize: '1.125rem', fontWeight: 700, color: 'var(--text-primary)', lineHeight: 1.2 }}>
            {pageInfo.title}
          </h1>
          {pageInfo.subtitle && (
            <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '1px' }}>
              {pageInfo.subtitle}
            </p>
          )}
        </div>
      </div>

      <div className="header-right">
        {/* Quick Actions */}
        <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
          <button
            onClick={async () => {
              const tId = toast.loading('Generating human-readable backup...')
              try {
                const res = await backupsAPI.trigger()
                const backup = res.data?.data || res.data
                const backupId = backup?.id
                const backupFilename = backup?.filename || `Backup_${new Date().toISOString().slice(0,10)}.zip`

                if (!backupId) {
                  toast.error('Backup trigger failed — no ID returned', { id: tId })
                  return
                }

                toast.loading('Downloading zip...', { id: tId })
                const blobRes = await backupsAPI.download(backupId)

                // If DEMO_MODE intercepts the download, it returns a plain JSON object instead of a Blob.
                let fileData = blobRes.data
                if (fileData && typeof fileData === 'object' && !fileData.size) {
                    fileData = 'Mock Backup Data for Demo Mode (Backend is not connected)'
                }

                // Try to get filename from Content-Disposition header
                const disposition = blobRes.headers?.['content-disposition'] || ''
                const match = disposition.match(/filename[^;=\n]*=((['"]).*?\2|[^;\n]*)/)
                const filename = match ? match[1].replace(/['"]/g, '') : backupFilename

                const url = window.URL.createObjectURL(new Blob([fileData], { type: 'application/zip' }))
                const link = document.createElement('a')
                link.href = url
                link.setAttribute('download', filename)
                document.body.appendChild(link)
                link.click()
                link.remove()
                window.URL.revokeObjectURL(url)

                toast.success(`Downloaded: ${filename}`, { id: tId })
              } catch (e) {
                console.error(e)
                toast.error('Failed to create backup', { id: tId })
              }
            }}
            className="btn btn-secondary"
            style={{ padding: '6px 12px', fontSize: '0.8125rem' }}
          >
            <Download size={14} style={{ marginRight: '6px' }} /> Backup Now
          </button>

          <button
            onClick={() => switchDemoUser(user?.role === 'OWNER' ? 'MANAGER' : 'OWNER')}
            className="btn btn-ghost"
            style={{ padding: '6px 12px', fontSize: '0.8125rem', border: '1px solid var(--border)' }}
          >
            <Users size={14} style={{ marginRight: '6px' }} /> 
            View as: {user?.role === 'OWNER' ? 'Manager' : 'Owner'}
          </button>
          
          <button
            onClick={() => navigate('/expenses', { state: { openAddModal: true } })}
            className="btn btn-primary"
            style={{ padding: '6px 12px', fontSize: '0.8125rem' }}
          >
            <PlusCircle size={14} style={{ marginRight: '6px' }} /> Add Expense
          </button>
        </div>

        {/* Notification bell */}
        <button
          className="notification-btn"
          onClick={() => navigate('/notifications')}
          title="Notifications"
        >
          <Bell size={18} />
          {unreadCount > 0 && (
            <span className="notification-badge">
              {unreadCount > 99 ? '99+' : unreadCount}
            </span>
          )}
        </button>
        
        <button
          className="btn btn-secondary"
          onClick={() => navigate('/approvals')}
          title="Pending Approvals"
          style={{ padding: '6px 12px', fontSize: '0.8125rem', borderColor: pendingCount > 0 ? 'var(--accent-gold)' : 'var(--border)' }}
        >
          <ClipboardCheck size={14} style={{ marginRight: '6px', color: pendingCount > 0 ? 'var(--accent-gold)' : 'inherit' }} /> 
          Approvals
          {pendingCount > 0 && (
            <span style={{ 
              background: 'var(--accent-gold)', 
              color: '#000', 
              marginLeft: '6px', 
              padding: '2px 6px', 
              borderRadius: '10px', 
              fontSize: '0.65rem', 
              fontWeight: 700 
            }}>
              {pendingCount > 99 ? '99+' : pendingCount}
            </span>
          )}
        </button>

        {/* Divider */}
        <div className="vertical-divider" style={{ height: '32px' }} />

        {/* User avatar */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '10px',
            cursor: 'pointer',
            padding: '6px 10px',
            borderRadius: 'var(--radius-sm)',
            transition: 'var(--transition)',
          }}
          onClick={() => navigate('/settings')}
          className="btn-ghost"
        >
          <div
            style={{
              width: '34px',
              height: '34px',
              background: 'linear-gradient(135deg, #f59e0b, #d97706)',
              borderRadius: '50%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '0.8125rem',
              fontWeight: 700,
              color: '#0d1117',
              flexShrink: 0,
            }}
          >
            {initials}
          </div>
          <div style={{ lineHeight: 1.3 }}>
            <div style={{ fontSize: '0.8125rem', fontWeight: 600, color: 'var(--text-primary)' }}>
              {user?.name || 'User'}
            </div>
            <div style={{ fontSize: '0.6875rem', color: 'var(--text-muted)', textTransform: 'capitalize' }}>
              {user?.role || 'Staff'}
            </div>
          </div>
        </div>
      </div>
    </header>
  )
}
