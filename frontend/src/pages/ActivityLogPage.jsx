import React, { useState } from 'react'
import PageHeader from '../components/common/PageHeader'
import useApprovalStore from '../store/approvalStore'
import useAuthStore from '../store/authStore'
import { CheckCircle, XCircle, Clock, RefreshCcw } from 'lucide-react'

export default function ActivityLogPage() {
  const user = useAuthStore(s => s.user)
  const activities = useApprovalStore(s => s.getUserActivities(user?.role, user?.name))
  const [filter, setFilter] = useState('ALL') // ALL, PENDING, APPROVED, DECLINED

  const filtered = activities.filter(a => {
    // Only show top-level activities, unless we want to show everything flat
    // But since the requirement says "the newly filled details will be shown under that same red box",
    // we'll group them. So here we filter for top-level (no parentId)
    if (a.parentId) return false
    if (filter === 'ALL') return true
    return a.status === filter
  })

  return (
    <div className="page-container fadeIn">
      <PageHeader
        title="Activity Log"
        subtitle="Track your submissions and their approval status"
      />
      
      <div style={{ marginBottom: '24px', display: 'flex', gap: '8px' }}>
        {['ALL', 'PENDING', 'APPROVED', 'DECLINED'].map(f => (
          <button 
            key={f}
            className={`btn ${filter === f ? 'btn-primary' : 'btn-secondary'}`}
            onClick={() => setFilter(f)}
          >
            {f}
          </button>
        ))}
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
        {filtered.length === 0 ? (
          <div className="card" style={{ textAlign: 'center', padding: '40px', color: 'var(--text-muted)' }}>
            No activities found.
          </div>
        ) : (
          filtered.map(activity => (
            <ActivityCard key={activity.id} activity={activity} allActivities={activities} user={user} />
          ))
        )}
      </div>
    </div>
  )
}

function ActivityCard({ activity, allActivities, user }) {
  const resubmitChange = useApprovalStore(s => s.resubmitChange)
  const isOwner = user?.role === 'OWNER'

  // Find if there are any child submissions (re-submissions)
  const children = allActivities.filter(a => a.parentId === activity.id).sort((a, b) => new Date(a.timestamp) - new Date(b.timestamp))

  const handleRefill = () => {
    // In a real app, this would open the specific module's edit modal pre-filled.
    // For this demo, we'll just resubmit the exact same data to simulate the re-fill action.
    alert('This would open the edit modal pre-filled. Submitting the exact same data for demo purposes.')
    resubmitChange(activity.id, activity.data)
  }

  const renderStatusBox = (item) => {
    const isRed = item.status === 'DECLINED'
    const isYellow = item.status === 'PENDING'
    
    let borderColor = 'var(--border)'
    if (isRed) borderColor = 'var(--danger)'
    if (isYellow) borderColor = 'var(--accent-gold)'

    return (
      <div style={{
        border: `2px solid ${borderColor}`,
        borderRadius: '8px',
        padding: '16px',
        background: 'var(--bg-surface)',
        marginBottom: '8px'
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
          <div>
            <span style={{ fontWeight: 600, color: 'var(--text-primary)' }}>{item.module} - {item.action}</span>
            <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginLeft: '12px' }}>
              {new Date(item.timestamp).toLocaleString()} by {item.submitterName}
            </span>
          </div>
          <StatusBadge status={item.status} />
        </div>
        
        <pre style={{ margin: 0, fontSize: '0.75rem', color: 'var(--text-secondary)', background: 'var(--bg-primary)', padding: '8px', borderRadius: '4px' }}>
          {JSON.stringify(item.data, null, 2)}
        </pre>

        {item.status === 'DECLINED' && (
          <div style={{ marginTop: '12px', padding: '8px', background: 'var(--danger-light)', borderRadius: '4px', border: '1px solid var(--danger)' }}>
            <div style={{ fontWeight: 600, color: 'var(--danger)', fontSize: '0.8rem' }}>
              Declined by Owner
            </div>
            {item.notes && <div style={{ fontSize: '0.8rem', color: 'var(--text-primary)', marginTop: '4px' }}>Notes: {item.notes}</div>}
            
            <div style={{ fontSize: '0.8rem', color: 'var(--text-primary)', marginTop: '4px', fontWeight: 500 }}>
              Resolution: {item.resolution?.type === 'SETTLE_MYSELF' ? 'Owner will settle up' : `Re-assigned to: ${item.resolution?.assigneeName}`}
            </div>

            {/* Show re-fill button ONLY to the assignee and ONLY if there are no pending child submissions */}
            {item.resolution?.type === 'REASSIGN' && 
             item.resolution?.assigneeId === user?.id && 
             children.length === 0 && (
              <button 
                className="btn btn-primary btn-sm" 
                style={{ marginTop: '12px' }}
                onClick={handleRefill}
              >
                <RefreshCcw size={14} style={{ marginRight: '6px' }} /> Re-fill Details
              </button>
            )}
          </div>
        )}
      </div>
    )
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
      {renderStatusBox(activity)}
      
      {/* Nested re-submissions */}
      {children.length > 0 && (
        <div style={{ marginLeft: '40px', borderLeft: '2px solid var(--border)', paddingLeft: '16px' }}>
          <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '8px' }}>Re-submissions:</div>
          {children.map(child => renderStatusBox(child))}
        </div>
      )}
    </div>
  )
}

function StatusBadge({ status }) {
  switch (status) {
    case 'APPROVED':
      return <span style={{ display: 'flex', alignItems: 'center', gap: '4px', color: 'var(--success)', fontSize: '0.8rem', fontWeight: 600 }}><CheckCircle size={14} /> Approved</span>
    case 'DECLINED':
      return <span style={{ display: 'flex', alignItems: 'center', gap: '4px', color: 'var(--danger)', fontSize: '0.8rem', fontWeight: 600 }}><XCircle size={14} /> Declined</span>
    case 'PENDING':
    default:
      return <span style={{ display: 'flex', alignItems: 'center', gap: '4px', color: 'var(--accent-gold)', fontSize: '0.8rem', fontWeight: 600 }}><Clock size={14} /> Pending Approval</span>
  }
}

