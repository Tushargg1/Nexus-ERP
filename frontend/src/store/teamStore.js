import { create } from 'zustand'
import { IS_INSTALLED_APP } from '../config/appConfig'

// Demo team members are only seeded in the trial/website build. The installed
// client software starts with an empty team (owner adds their own staff).
const DEMO_MEMBERS = [
  { id: '1', name: 'Demo Manager', email: 'manager@nexuserp.com', role: 'MANAGER', status: 'ACTIVE' },
  { id: '2', name: 'Demo Producer', email: 'producer@nexuserp.com', role: 'PRODUCER', status: 'ACTIVE' },
]

const useTeamStore = create((set) => ({
  teamMembers: IS_INSTALLED_APP ? [] : DEMO_MEMBERS,
  addMember: (member) => set((state) => ({
    teamMembers: [...state.teamMembers, { ...member, id: Date.now().toString(), status: 'ACTIVE' }]
  })),
  editMember: (id, updates) => set((state) => ({
    teamMembers: state.teamMembers.map(m => m.id === id ? { ...m, ...updates } : m)
  })),
  deleteMember: (id) => set((state) => ({
    teamMembers: state.teamMembers.filter(m => m.id !== id)
  })),
}))

export default useTeamStore
