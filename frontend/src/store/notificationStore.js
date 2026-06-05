import { create } from 'zustand'

const useNotificationStore = create((set, get) => ({
  notifications: [],
  unreadCount: 0,

  setNotifications: (notifications) => set({ notifications }),

  setUnreadCount: (unreadCount) => set({ unreadCount }),

  // Primary methods
  markRead: (id) => {
    const notifications = get().notifications.map((n) =>
      n.id === id ? { ...n, read: true } : n
    )
    const unreadCount = notifications.filter((n) => !n.read).length
    set({ notifications, unreadCount })
  },

  markAllRead: () => {
    const notifications = get().notifications.map((n) => ({ ...n, read: true }))
    set({ notifications, unreadCount: 0 })
  },

  // Aliases used by NotificationsPage
  markAsRead: (id) => {
    const notifications = get().notifications.map((n) =>
      n.id === id ? { ...n, read: true } : n
    )
    const unreadCount = notifications.filter((n) => !n.read).length
    set({ notifications, unreadCount })
  },

  markAllAsRead: () => {
    const notifications = get().notifications.map((n) => ({ ...n, read: true }))
    set({ notifications, unreadCount: 0 })
  },

  // Remove a single notification by id
  removeNotification: (id) => {
    const notifications = get().notifications.filter((n) => n.id !== id)
    const unreadCount = notifications.filter((n) => !n.read).length
    set({ notifications, unreadCount })
  },

  // Clear all notifications
  clearAll: () => set({ notifications: [], unreadCount: 0 }),

  // Helper: call this whenever a record is edited
  // module = 'Expenses', recordName = 'Office Depot ₹1250', editorName = 'Jane Smith', previousModifier = 'Owner'
  notifyEdit: (module, recordName, editorName, previousModifier) => {
    const now = new Date().toISOString()
    const newNotifs = []

    // Always notify Owner
    newNotifs.push({
      id: `edit-${Date.now()}-owner`,
      type: 'EDIT',
      title: `${module} record updated`,
      message: `"${recordName}" was edited by ${editorName}`,
      read: false,
      timestamp: now,
      forRole: 'OWNER',
    })

    // Notify the previous modifier if they are different from the editor and not the owner
    if (previousModifier && previousModifier !== editorName && previousModifier !== 'Owner') {
      newNotifs.push({
        id: `edit-${Date.now()}-prev`,
        type: 'EDIT',
        title: `${module} record you edited was updated`,
        message: `"${recordName}" (which you last edited) was updated by ${editorName}`,
        read: false,
        timestamp: now,
        forRole: 'MANAGER',
        forName: previousModifier,
      })
    }

    const notifications = [...newNotifs, ...get().notifications]
    const unreadCount = notifications.filter((n) => !n.read).length
    set({ notifications, unreadCount })
  },

  addNotification: (notification) => {
    const notifications = [notification, ...get().notifications]
    const unreadCount = notifications.filter((n) => !n.read).length
    set({ notifications, unreadCount })
  },
}))

export default useNotificationStore
