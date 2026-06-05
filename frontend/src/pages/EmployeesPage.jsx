import React, { useState, useEffect } from 'react'
import { Plus, Users, Phone, Mail, QrCode } from 'lucide-react'
import { QRCodeSVG } from 'qrcode.react'
import toast from 'react-hot-toast'
import { employeesAPI } from '../api/employees'
import useAuthStore from '../store/authStore'
import useNotificationStore from '../store/notificationStore'
import PageHeader from '../components/common/PageHeader'
import DataTable from '../components/common/DataTable'
import Modal from '../components/common/Modal'
import SearchBar from '../components/common/SearchBar'
import StatsCard from '../components/common/StatsCard'
import Badge from '../components/common/Badge'



const emptyForm = { name: '', role: '', phone: '', email: '', joinDate: '', salary: '', status: 'ACTIVE' }

export default function EmployeesPage() {
  const [employees, setEmployees] = useState([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [roleFilter, setRoleFilter] = useState('ALL')
  const [modalOpen, setModalOpen] = useState(false)
  const [qrModalOpen, setQrModalOpen] = useState(false)
  const [selectedEmployee, setSelectedEmployee] = useState(null)
  const [saving, setSaving] = useState(false)
  const [formData, setFormData] = useState(emptyForm)
  const [editId, setEditId] = useState(null)
  const user = useAuthStore(s => s.user)
  const notifyEdit = useNotificationStore(s => s.notifyEdit)

  useEffect(() => {
    fetchEmployees()
  }, [])

  const fetchEmployees = async () => {
    setLoading(true)
    try {
      const res = await employeesAPI.getAll()
      const data = res.data?.data || res.data?.content || res.data;
      setEmployees(Array.isArray(data) ? data : [])
    } catch {
      setEmployees([])
    } finally {
      setLoading(false)
    }
  }

  const filtered = employees.filter((e) => {
    const matchRole = roleFilter === 'ALL' || e.role === roleFilter
    const matchSearch = !search || [e.name, e.empCode, e.phone].some(f => f?.toLowerCase().includes(search.toLowerCase()))
    return matchRole && matchSearch
  })

  const totalActive = employees.filter(e => e.status === 'ACTIVE').length
  const totalInactive = employees.length - totalActive
  const roles = [...new Set(employees.map(e => e.role))]

  const handleSave = async () => {
    if (!formData.name || !formData.role) return toast.error('Name and Role are required')
    setSaving(true)
    try {
      if (editId) {
        const editorName = user?.name || 'Unknown'
        const original = employees.find(e => e.id === editId)
        const previousModifier = original?.lastModifiedBy || 'Owner'
        const updated = { ...formData, lastModifiedBy: editorName }
        await employeesAPI.update(editId, updated)
        setEmployees(employees.map(e => e.id === editId ? { ...e, ...updated } : e))
        notifyEdit('Employees', formData.name, editorName, previousModifier)
        toast.success('Employee updated')
      } else {
        const res = await employeesAPI.create(formData)
        const newEmp = res.data?.data || res.data
        setEmployees([newEmp, ...employees])
        toast.success('Employee added')
      }
      setModalOpen(false)
      setFormData(emptyForm)
      setEditId(null)
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to save employee')
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async (row) => {
    if (!window.confirm(`Delete ${row.name}?`)) return
    try {
      await employeesAPI.delete(row.id)
      setEmployees(employees.filter(e => e.id !== row.id))
      toast.success('Employee deleted')
    } catch {
      toast.error('Failed to delete employee')
    }
  }

  const cols = [
    { key: 'empCode', label: 'Emp Code', primary: true },
    { key: 'name', label: 'Name' },
    { key: 'role', label: 'Role' },
    { key: 'phone', label: 'Phone', render: (v) => <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}><Phone size={12}/> {v}</div> },
    { key: 'salary', label: 'Base Salary', render: (v) => v ? `₹${Number(v).toLocaleString('en-IN')}` : '—' },
    { key: 'status', label: 'Status', render: (v) => <Badge status={v} /> },
  ]

  return (
    <div style={{ animation: 'fadeIn 0.3s ease' }}>
      <PageHeader 
        title="Employees" 
        subtitle="Manage employee directory and details"
        actions={
          <button className="btn btn-primary" onClick={() => { setFormData(emptyForm); setEditId(null); setModalOpen(true); }}>
            <Plus size={16} /> Add Employee
          </button>
        }
      />

      <div className="grid-3" style={{ marginBottom: '24px' }}>
        <StatsCard title="Total Employees" value={employees.length} icon={Users} color="blue" />
        <StatsCard title="Active" value={totalActive} icon={Users} color="green" />
        <StatsCard title="Inactive" value={totalInactive} icon={Users} color="red" />
      </div>

      <div className="card">
        <div className="filter-bar">
          <SearchBar value={search} onChange={setSearch} placeholder="Search name, code, phone..." />
          <select className="form-select" value={roleFilter} onChange={(e) => setRoleFilter(e.target.value)}>
            <option value="ALL">All Roles</option>
            {roles.map(r => <option key={r} value={r}>{r}</option>)}
          </select>
        </div>
        
        <DataTable
          columns={cols}
          data={filtered}
          loading={loading}
          searchValue={search}
          emptyMessage="No employees found"
          emptyIcon={<Users size={28} />}
          actions={(row) => (
            <>
              <button
                onClick={() => {
                  setSelectedEmployee(row)
                  setQrModalOpen(true)
                }}
                className="btn btn-ghost btn-icon"
                style={{ color: 'var(--accent-blue)' }}
                title="Show ID Card QR"
              >
                <QrCode size={16} />
              </button>
            </>
          )}
          onEdit={(row) => {
            setFormData({ name: row.name, role: row.role, phone: row.phone, email: row.email, joinDate: row.joinDate, salary: row.salary, status: row.status })
            setEditId(row.id)
            setModalOpen(true)
          }}
          onDelete={handleDelete}
        />
      </div>

      <Modal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        title={editId ? 'Edit Employee' : 'Add Employee'}
        size="md"
        footer={
          <>
            <button className="btn btn-secondary" onClick={() => setModalOpen(false)}>Cancel</button>
            <button className="btn btn-primary" onClick={handleSave} disabled={saving}>
              {saving ? 'Saving...' : 'Save'}
            </button>
          </>
        }
      >
        <div className="form-grid">
          <div className="form-group">
            <label className="form-label">Full Name <span className="required">*</span></label>
            <input className="form-input" value={formData.name} onChange={(e) => setFormData({...formData, name: e.target.value})} placeholder="John Doe" />
          </div>
          <div className="form-group">
            <label className="form-label">Role <span className="required">*</span></label>
            <input className="form-input" value={formData.role} onChange={(e) => setFormData({...formData, role: e.target.value})} placeholder="e.g. Tailor" list="roles-list" />
            <datalist id="roles-list">
              <option value="Tailor" />
              <option value="Cutter" />
              <option value="Manager" />
              <option value="Helper" />
            </datalist>
          </div>
          <div className="form-group">
            <label className="form-label">Phone</label>
            <input type="tel" className="form-input" value={formData.phone} onChange={(e) => setFormData({...formData, phone: e.target.value})} placeholder="+91 ..." />
          </div>
          <div className="form-group">
            <label className="form-label">Email</label>
            <input type="email" className="form-input" value={formData.email} onChange={(e) => setFormData({...formData, email: e.target.value})} placeholder="email@example.com" />
          </div>
          <div className="form-group">
            <label className="form-label">Joining Date</label>
            <input type="date" className="form-input" value={formData.joinDate} onChange={(e) => setFormData({...formData, joinDate: e.target.value})} />
          </div>
          <div className="form-group">
            <label className="form-label">Base Salary (₹)</label>
            <input type="number" className="form-input" value={formData.salary} onChange={(e) => setFormData({...formData, salary: e.target.value})} placeholder="0.00" />
          </div>
          <div className="form-group">
            <label className="form-label">Status</label>
            <select className="form-select" value={formData.status} onChange={(e) => setFormData({...formData, status: e.target.value})}>
              <option value="ACTIVE">Active</option>
              <option value="INACTIVE">Inactive</option>
            </select>
          </div>
        </div>
      </Modal>

      <Modal
        isOpen={qrModalOpen}
        onClose={() => setQrModalOpen(false)}
        title="Employee ID Card QR"
        size="sm"
      >
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '20px', padding: '20px 0' }}>
          {selectedEmployee && (
            <>
              <div style={{ background: '#fff', padding: '16px', borderRadius: '12px' }}>
                <QRCodeSVG 
                  value={selectedEmployee.empCode || `EMP-${selectedEmployee.id}`} 
                  size={200}
                  level="H"
                />
              </div>
              <div style={{ textAlign: 'center' }}>
                <div style={{ fontSize: '1.25rem', fontWeight: 'bold', color: 'var(--text-primary)' }}>
                  {selectedEmployee.name}
                </div>
                <div style={{ color: 'var(--text-muted)' }}>{selectedEmployee.role}</div>
                <div style={{ color: 'var(--accent-gold)', marginTop: '4px', fontFamily: 'monospace' }}>
                  {selectedEmployee.empCode || `EMP-${selectedEmployee.id}`}
                </div>
              </div>
              <button 
                className="btn btn-primary" 
                onClick={() => {
                  toast.success('Downloaded ID Card')
                  // In a real app, you would generate a canvas and download it
                }}
              >
                <QrCode size={16} /> Print ID Card
              </button>
            </>
          )}
        </div>
      </Modal>
    </div>
  )
}

