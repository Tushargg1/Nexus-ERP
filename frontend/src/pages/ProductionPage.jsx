import React, { useState, useEffect } from 'react'
import { Plus, Settings2, CheckCircle, Package, Pencil } from 'lucide-react'
import toast from 'react-hot-toast'
import { productionAPI } from '../api/production'
import useAuthStore from '../store/authStore'
import useNotificationStore from '../store/notificationStore'
import PageHeader from '../components/common/PageHeader'
import DataTable from '../components/common/DataTable'
import Modal from '../components/common/Modal'
import SearchBar from '../components/common/SearchBar'
import StatsCard from '../components/common/StatsCard'
import Badge from '../components/common/Badge'
import { format } from 'date-fns'



const emptyForm = { product: '', quantity: '', date: format(new Date(), 'yyyy-MM-dd'), status: 'PLANNED', rawMaterials: [] }

export default function ProductionPage() {
  const [production, setProduction] = useState([])
  const [loading, setLoading] = useState(false)
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState('ALL')
  const [modalOpen, setModalOpen] = useState(false)
  const [editItem, setEditItem] = useState(null)
  const [saving, setSaving] = useState(false)
  const [formData, setFormData] = useState(emptyForm)

  const user = useAuthStore(s => s.user)
  const notifyEdit = useNotificationStore(s => s.notifyEdit)

  useEffect(() => { fetchProduction() }, [])

  const fetchProduction = async () => {
    setLoading(true)
    try {
      const res = await productionAPI.getAll()
      const data = res.data?.data || res.data?.content || res.data;
      setProduction(Array.isArray(data) ? data : [])
    } catch {
      setProduction([])
    } finally {
      setLoading(false)
    }
  }

  const filtered = production.filter((p) => {
    const matchStatus = statusFilter === 'ALL' || p.status === statusFilter
    const matchSearch = !search || [p.batchNo, p.product].some(f => f?.toLowerCase().includes(search.toLowerCase()))
    return matchStatus && matchSearch
  })

  const totalBatches = production.length
  const completedBatches = production.filter(p => p.status === 'COMPLETED').length
  const inProgressBatches = production.filter(p => p.status === 'IN_PROGRESS').length

  const openAdd = () => { setEditItem(null); setFormData(emptyForm); setModalOpen(true) }
  const openEdit = (row) => { setEditItem(row); setFormData({ ...row }); setModalOpen(true) }

  const handleSave = async () => {
    if (!formData.product || !formData.quantity) return toast.error('Product and quantity required')
    setSaving(true)
    try {
      const editorName = user?.name || 'Unknown'
      if (editItem) {
        toast.error('Production batches cannot be edited directly once created. Please advance their stage.');
      } else {
        const res = await productionAPI.create(formData)
        const newBatch = res.data?.data || res.data
        setProduction([newBatch, ...production])
        toast.success('Production batch created')
      }
      setModalOpen(false)
      setFormData(emptyForm)
      setEditItem(null)
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to save batch')
    } finally {
      setSaving(false)
    }
  }

  const handleUpdateStatus = async (id) => {
    try {
      const res = await productionAPI.advanceStage(id)
      const updatedBatch = res.data?.data || res.data
      setProduction(prev => prev.map(p => p.id === id ? updatedBatch : p))
      toast.success('Status advanced successfully')
    } catch (err) {
      toast.error('Failed to update status')
    }
  }

  const cols = [
    { key: 'batchNo', label: 'Batch No', primary: true },
    { key: 'product', label: 'Product' },
    { key: 'quantity', label: 'Quantity', render: v => `${v} pcs` },
    { key: 'date', label: 'Start Date' },
    { key: 'costPerUnit', label: 'Cost/Unit', render: v => v ? `₹${v.toLocaleString('en-IN')}` : '—' },
    { key: 'status', label: 'Status', render: v => <Badge status={v} /> },
  ]

  return (
    <div style={{ animation: 'fadeIn 0.3s ease' }}>
      <PageHeader 
        title="Ongoing Production" 
        subtitle="Track batches moving through various business stages"
        actions={
          <button className="btn btn-primary" onClick={openAdd}>
            <Plus size={16} /> New Batch
          </button>
        }
      />

      <div className="grid-3" style={{ marginBottom: '24px' }}>
        <StatsCard title="Total Batches" value={totalBatches} icon={Package} color="blue" />
        <StatsCard title="In Progress" value={inProgressBatches} icon={Settings2} color="gold" />
        <StatsCard title="Completed" value={completedBatches} icon={CheckCircle} color="green" />
      </div>

      <div className="card">
        <div className="filter-bar">
          <SearchBar value={search} onChange={setSearch} placeholder="Search batch or product..." />
          <select className="form-select" value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
            <option value="ALL">All Status</option>
            <option value="PLANNED">Planned</option>
            <option value="IN_PROGRESS">In Progress</option>
            <option value="COMPLETED">Completed</option>
            <option value="CANCELLED">Cancelled</option>
          </select>
        </div>
        
        <DataTable
          columns={cols}
          data={filtered}
          loading={loading}
          searchValue={search}
          emptyMessage="No production batches found"
          emptyIcon={<Settings2 size={28} />}
          actions={(row) => (
            <div style={{ display: 'flex', gap: '6px', alignItems: 'center', justifyContent: 'flex-end' }}>
              <button
                className="btn btn-ghost btn-sm btn-icon"
                onClick={() => openEdit(row)}
                style={{ color: 'var(--text-muted)' }}
                title="Edit"
              >
                <Pencil size={14} />
              </button>
              {row.status !== 'COMPLETED' && row.status !== 'CANCELLED' && (
                <button 
                  className="btn btn-ghost btn-sm" 
                  onClick={() => handleUpdateStatus(row.id)}
                  style={{ color: 'var(--accent-gold)' }}
                >
                  {row.status === 'PLANNED' ? 'Start Batch' : 'Mark Complete'}
                </button>
              )}
            </div>
          )}
        />
      </div>

      <Modal
        isOpen={modalOpen}
        onClose={() => { setModalOpen(false); setEditItem(null) }}
        title={editItem ? 'Edit Production Batch' : 'Create Production Batch'}
        size="md"
        footer={
          <>
            <button className="btn btn-secondary" onClick={() => { setModalOpen(false); setEditItem(null) }}>Cancel</button>
            <button className="btn btn-primary" onClick={handleSave} disabled={saving}>
              {saving ? 'Saving...' : editItem ? 'Update Batch' : 'Create Batch'}
            </button>
          </>
        }
      >
        <div className="form-grid">
          <div className="form-group" style={{ gridColumn: '1 / -1' }}>
            <label className="form-label">Finished Good / Product <span className="required">*</span></label>
            <input className="form-input" value={formData.product} onChange={(e) => setFormData({...formData, product: e.target.value})} placeholder="e.g. Men's Cotton Shirt" />
          </div>
          <div className="form-group">
            <label className="form-label">Target Quantity (pcs) <span className="required">*</span></label>
            <input type="number" className="form-input" value={formData.quantity} onChange={(e) => setFormData({...formData, quantity: e.target.value})} placeholder="0" />
          </div>
          <div className="form-group">
            <label className="form-label">Start Date</label>
            <input type="date" className="form-input" value={formData.date} onChange={(e) => setFormData({...formData, date: e.target.value})} />
          </div>
          <div className="form-group">
            <label className="form-label">Status</label>
            <select className="form-select" value={formData.status} onChange={(e) => setFormData({...formData, status: e.target.value})}>
              <option value="PLANNED">Planned</option>
              <option value="IN_PROGRESS">In Progress</option>
              <option value="COMPLETED">Completed</option>
              <option value="CANCELLED">Cancelled</option>
            </select>
          </div>
        </div>
      </Modal>
    </div>
  )
}

