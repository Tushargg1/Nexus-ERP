import React from 'react'
import { Bell, Check, Trash2, AlertTriangle, Info, CheckCircle } from 'lucide-react'
import toast from 'react-hot-toast'
import useNotificationStore from '../store/notificationStore'
import PageHeader from '../components/common/PageHeader'
import { formatDistanceToNow } from 'date-fns'

export default function NotificationsPage() {
  const { notifications, unreadCount, markAsRead, markAllAsRead, removeNotification, clearAll } = useNotificationStore()

  const getIcon = (type) => {
    switch (type) {
      case 'WARNING': return <AlertTriangle size={20} color="var(--danger)" />
      case 'SUCCESS': return <CheckCircle size={20} color="var(--success)" />
      default: return <Info size={20} color="var(--accent-blue)" />
    }
  }

  const handleClearAll = () => {
    if (window.confirm('Clear all notifications?')) {
      clearAll()
      toast.success('Notifications cleared')
    }
  }

  return (
    <div style={{ animation: 'fadeIn 0.3s ease', maxWidth: '800px', margin: '0 auto' }}>
      <PageHeader 
        title={`Notifications ${unreadCount > 0 ? `(${unreadCount})` : ''}`}
        subtitle="Stay updated with alerts and system messages"
        actions={
          <div style={{ display: 'flex', gap: '12px' }}>
            {unreadCount > 0 && (
              <button className="btn btn-secondary" onClick={markAllAsRead}>
                <Check size={16} /> Mark all read
              </button>
            )}
            {notifications.length > 0 && (
              <button className="btn btn-danger" onClick={handleClearAll}>
                <Trash2 size={16} /> Clear All
              </button>
            )}
          </div>
        }
      />

      {notifications.length === 0 ? (
        <div className="empty-state card">
          <div className="empty-state-icon">
            <Bell size={28} style={{ opacity: 0.5 }} />
          </div>
          <div className="empty-state-title">All caught up!</div>
          <div className="empty-state-desc">You have no new notifications.</div>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          {notifications.map(n => (
            <div 
              key={n.id} 
              className="card"
              style={{ 
                padding: '16px 20px',
                display: 'flex', 
                gap: '16px', 
                alignItems: 'flex-start',
                borderLeft: !n.read ? '3px solid var(--accent-gold)' : '3px solid transparent',
                background: !n.read ? 'var(--bg-surface-hover)' : 'var(--bg-surface)'
              }}
            >
              <div style={{ padding: '8px', background: 'var(--bg-background)', borderRadius: '50%' }}>
                {getIcon(n.type)}
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                  <h4 style={{ margin: 0, fontSize: '1rem', color: !n.read ? 'var(--text-primary)' : 'var(--text-secondary)' }}>
                    {n.title}
                  </h4>
                  <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                    {formatDistanceToNow(new Date(n.timestamp), { addSuffix: true })}
                  </span>
                </div>
                <p style={{ margin: 0, fontSize: '0.875rem', color: 'var(--text-secondary)', lineHeight: 1.5 }}>
                  {n.message}
                </p>
              </div>
              <div style={{ display: 'flex', gap: '8px', opacity: 0.7 }}>
                {!n.read && (
                  <button className="btn btn-ghost btn-sm btn-icon" onClick={() => markAsRead(n.id)} title="Mark read">
                    <Check size={16} />
                  </button>
                )}
                <button className="btn btn-ghost btn-sm btn-icon" onClick={() => removeNotification(n.id)} style={{ color: 'var(--danger)' }} title="Delete">
                  <Trash2 size={16} />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

