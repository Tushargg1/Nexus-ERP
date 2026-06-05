import { create } from 'zustand'
import useAuthStore from './authStore'
import { IS_INSTALLED_APP } from '../config/appConfig'

// Statuses: 'PENDING', 'APPROVED', 'DECLINED'
// Activity item structure: 
// { id, module, action ('CREATE', 'UPDATE', 'DELETE'), data, submitterName, submitterRole, timestamp, status, resolution, notes }

// Demo activities are only seeded in the trial/website build. The installed
// client software starts with a clean, empty approval queue.
const DEMO_ACTIVITIES = [
    {
      id: 'mock-approval-1',
      module: 'Expenses',
      action: 'CREATE',
      data: { category: 'OFFICE', paidTo: 'Office Depot', amount: 1250, paymentMode: 'CASH', notes: 'New office chairs', date: new Date().toISOString().slice(0, 10), id: 991 },
      submitterName: 'Jane Smith',
      submitterRole: 'MANAGER',
      timestamp: new Date().toISOString(),
      status: 'PENDING',
      resolution: null,
      notes: ''
    },
    {
      id: 'mock-approval-2',
      module: 'Raw Materials',
      action: 'UPDATE',
      data: { name: 'White Cotton Fabric', quantity: 500, purchasePrice: 88, id: 1 },
      submitterName: 'Michael Chen',
      submitterRole: 'MANAGER',
      timestamp: new Date(Date.now() - 3600000).toISOString(),
      status: 'PENDING',
      resolution: null,
      notes: ''
    },
    {
      id: 'mock-reassigned-1',
      module: 'Finished Goods',
      action: 'UPDATE',
      data: { name: 'Blue Denim Jacket', quantity: 200, salePrice: 1200, id: 2 },
      submitterName: 'Demo Manager',
      submitterRole: 'MANAGER',
      timestamp: new Date(Date.now() - 7200000).toISOString(),
      status: 'DECLINED',
      resolution: { type: 'REASSIGN', assigneeId: 'MANAGER', assigneeName: 'Manager' },
      notes: 'Please double-check the quantity and resubmit'
    }
]

const useApprovalStore = create((set, get) => ({
  activities: IS_INSTALLED_APP ? [] : DEMO_ACTIVITIES,
  
  // Submit a change to the approval queue
  submitChange: (module, action, data, oldData = null) => {
    const user = useAuthStore.getState().user
    const isOwner = user?.role === 'OWNER'
    
    const activity = {
      id: Date.now().toString(),
      module,
      action,
      data,
      oldData,
      submitterName: user?.name || 'Unknown',
      submitterRole: user?.role || 'STAFF',
      timestamp: new Date().toISOString(),
      status: isOwner ? 'APPROVED' : 'PENDING',
      resolution: null,
      notes: ''
    }

    set((state) => ({
      activities: [activity, ...state.activities]
    }))

    return activity
  },

  approveChange: (id) => {
    const isOwner = useAuthStore.getState().user?.role === 'OWNER'
    set((state) => ({
      activities: state.activities.map(a => a.id === id ? { ...a, status: isOwner ? 'APPROVED' : 'PENDING' } : a)
    }))
  },

  declineChange: (id, resolution, notes) => set((state) => ({
    activities: state.activities.map(a => a.id === id ? { ...a, status: 'DECLINED', resolution, notes } : a)
  })),

  resubmitChange: (originalId, newData) => {
    const state = get()
    const original = state.activities.find(a => a.id === originalId)
    if (!original) return

    const newActivity = {
      ...original,
      id: Date.now().toString(),
      data: newData,
      timestamp: new Date().toISOString(),
      status: 'PENDING',
      resolution: null,
      notes: '',
      parentId: originalId // Link back to the declined item
    }

    set((state) => ({
      activities: [newActivity, ...state.activities]
    }))
    
    return newActivity
  },
  
  getPendingApprovals: (user) => {
    if (!user) return []
    if (user.role === 'OWNER') {
      return get().activities.filter(a => a.status === 'PENDING')
    }
    // For managers/staff, show items that were declined and specifically re-assigned to them
    return get().activities.filter(a => 
      a.status === 'DECLINED' && 
      a.resolution?.type === 'REASSIGN' && 
      (a.resolution?.assigneeId === user.id || a.resolution?.assigneeId === 'MANAGER')
    )
  },
  
  getUserActivities: (role, name) => {
    const acts = get().activities
    if (role === 'OWNER') return acts // Owner sees all
    return acts.filter(a => a.submitterName === name && a.submitterRole === role)
  }
}))

export default useApprovalStore
