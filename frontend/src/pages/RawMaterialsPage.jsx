import React, { useState, useEffect } from 'react'
import { Plus, Package, AlertTriangle, RefreshCw, Settings, Trash2 } from 'lucide-react'
import toast from 'react-hot-toast'
import { useForm } from 'react-hook-form'
import { rawMaterialsAPI } from '../api/rawMaterials'
import useAuthStore from '../store/authStore'
import useNotificationStore from '../store/notificationStore'
import PageHeader from '../components/common/PageHeader'
import DataTable from '../components/common/DataTable'
import Modal from '../components/common/Modal'
import SearchBar from '../components/common/SearchBar'
import ConfirmDialog from '../components/common/ConfirmDialog'
import StatsCard from '../components/common/StatsCard'
import Badge from '../components/common/Badge'

const DEFAULT_CATEGORIES = ['CLOTH', 'THREAD', 'BUTTON', 'ZIPPER', 'PACKAGING', 'OTHER']



const defaultValues = {
  name: '', category: 'CLOTH', quantity: '', unit: 'meter',
  purchasePrice: '', supplierName: '', reorderLevel: '',
}

export default function RawMaterialsPage() {
  const [categories, setCategories] = useState(() => {
    try {
      const saved = localStorage.getItem('raw_material_categories')
      return saved ? JSON.parse(saved) : DEFAULT_CATEGORIES
    } catch {
      return DEFAULT_CATEGORIES
    }
  })

  useEffect(() => {
    localStorage.setItem('raw_material_categories', JSON.stringify(categories))
  }, [categories])

  const allCategories = ['ALL', ...categories]

  const [catModalOpen, setCatModalOpen] = useState(false)
  const [newCat, setNewCat] = useState('')

  const handleAddCat = (e) => {
    e.preventDefault()
    if (newCat.trim() && !categories.includes(newCat.trim().toUpperCase())) {
      setCategories([...categories, newCat.trim().toUpperCase()])
      setNewCat('')
    }
  }

  const handleRemoveCat = (cat) => {
    if (window.confirm(`Remove category "${cat}"?`)) {
      setCategories(categories.filter(c => c !== cat))
      if (activeCategory === cat) setActiveCategory('ALL')
    }
  }

  const [materials, setMaterials] = useState([])
  const [loading, setLoading] = useState(false)
  const [search, setSearch] = useState('')
  const [activeCategory, setActiveCategory] = useState('ALL')
  const [modalOpen, setModalOpen] = useState(false)
  const [adjustModal, setAdjustModal] = useState(false)
  const [editItem, setEditItem] = useState(null)
  const [adjustItem, setAdjustItem] = useState(null)
  const [deleteItem, setDeleteItem] = useState(null)
  const [saving, setSaving] = useState(false)
  const [deleting, setDeleting] = useState(false)
  const [adjustQty, setAdjustQty] = useState('')
  const [adjustReason, setAdjustReason] = useState('')

  const { register, handleSubmit, reset, formState: { errors } } = useForm({ defaultValues })
  const user = useAuthStore(s => s.user)
  const notifyEdit = useNotificationStore(s => s.notifyEdit)

  useEffect(() => {
    const fetch = async () => {
      setLoading(true)
      try {
        const res = await rawMaterialsAPI.getAll()
        const data = res.data?.data || res.data?.content || res.data;
        setMaterials(Array.isArray(data) ? data : [])
      } catch {
        setMaterials([])
      } finally {
        setLoading(false)
      }
    }
    fetch()
  }, [])

  const filtered = materials.filter((m) => {
    const matchCat = activeCategory === 'ALL' || m.category === activeCategory
    const matchSearch = !search || [m.name, m.category, m.supplierName]
      .some((f) => f?.toLowerCase().includes(search.toLowerCase()))
    return matchCat && matchSearch
  })

  const lowStockItems = materials.filter((m) => m.quantity <= m.reorderLevel)
  const totalValue = materials.reduce((sum, m) => sum + (m.totalValue || m.quantity * m.purchasePrice), 0)

  const openAdd = () => { setEditItem(null); reset(defaultValues); setModalOpen(true) }
  const openEdit = (item) => { setEditItem(item); reset(item); setModalOpen(true) }

  const onSubmit = async (data) => {
    setSaving(true)
    try {
      if (editItem) {
        const editorName = user?.name || 'Unknown'
        const previousModifier = editItem.lastModifiedBy || 'Owner'
        const updated = { ...data, lastModifiedBy: editorName }
        await rawMaterialsAPI.update(editItem.id, updated)
        setMaterials((prev) => prev.map((m) => m.id === editItem.id ? { ...m, ...updated } : m))
        notifyEdit('Raw Materials', data.name, editorName, previousModifier)
        toast.success('Material updated')
      } else {
        const res = await rawMaterialsAPI.create(data)
        const newM = res.data?.data || res.data
        setMaterials((prev) => [newM, ...prev])
        toast.success('Material added')
      }
      setModalOpen(false)
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to save')
    } finally {
      setSaving(false)
    }
  }

  const handleAdjust = async () => {
    if (!adjustQty) return toast.error('Enter quantity')
    try {
      await rawMaterialsAPI.adjust(adjustItem.id, { quantity: Number(adjustQty), reason: adjustReason })
      setMaterials((prev) => prev.map((m) =>
        m.id === adjustItem.id ? { ...m, quantity: m.quantity + Number(adjustQty) } : m
      ))
      toast.success('Stock adjusted')
      setAdjustModal(false)
      setAdjustQty('')
      setAdjustReason('')
    } catch {
      toast.error('Failed to adjust stock')
    }
  }

  const handleDelete = async () => {
    setDeleting(true)
    try {
      await rawMaterialsAPI.delete(deleteItem.id)
      setMaterials((prev) => prev.filter((m) => m.id !== deleteItem.id))
      toast.success('Material deleted')
      setDeleteItem(null)
    } catch {
      toast.error('Failed to delete')
    } finally {
      setDeleting(false)
    }
  }

  const cols = [
    { key: 'name', label: 'Material Name', primary: true, render: (v, row) => (
      <div>
        <div style={{ fontWeight: 600, color: 'var(--text-primary)' }}>{v}</div>
        <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{row.supplierName}</div>
      </div>
    )},
    { key: 'category', label: 'Category', render: (v) => <span className="badge badge-muted">{v}</span> },
    { key: 'quantity', label: 'Stock', render: (v, row) => (
      <span style={{ fontWeight: 700, color: v <= row.reorderLevel ? 'var(--danger)' : 'var(--success)' }}>
        {v} {row.unit}
      </span>
    )},
    { key: 'purchasePrice', label: 'Rate', render: (v, row) => `₹${v}/${row.unit}` },
    { key: 'reorderLevel', label: 'Reorder At', render: (v, row) => `${v} ${row.unit}` },
    { key: 'stockStatus', label: 'Status', noSort: true, render: (_, row) => (
      row.quantity <= row.reorderLevel ? <Badge status="LOW_STOCK" /> : <Badge status="IN_STOCK" />
    )},
  ]

  return (
    <div style={{ animation: 'fadeIn 0.3s ease' }}>
      <PageHeader
        title="Raw Materials"
        subtitle="Track and manage your material inventory"
        actions={
          <button className="btn btn-primary" onClick={openAdd}>
            <Plus size={16} /> Add Material
          </button>
        }
      />

      {/* Stats */}
      <div className="grid-3" style={{ marginBottom: '24px' }}>
        <StatsCard title="Total Materials" value={materials.length} suffix=" items" icon={Package} color="blue" />
        <StatsCard title="Low Stock Items" value={lowStockItems.length} suffix=" items" icon={AlertTriangle} color="red" />
        <StatsCard title="Total Value" value={totalValue} prefix="₹" icon={Package} color="gold" />
      </div>

      <div className="card">
        <div className="card-header" style={{ flexDirection: 'column', alignItems: 'flex-start', gap: '12px' }}>
          {/* Category tabs */}
          <div className="tabs" style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
            {allCategories.map((cat) => (
              <button
                key={cat}
                className={`tab ${activeCategory === cat ? 'active' : ''}`}
                onClick={() => setActiveCategory(cat)}
              >
                {cat}
              </button>
            ))}
            <button 
              className="btn btn-ghost btn-sm btn-icon" 
              onClick={() => setCatModalOpen(true)}
              style={{ color: 'var(--text-muted)' }}
              title="Manage Categories"
            >
              <Settings size={16} />
            </button>
          </div>
          <SearchBar value={search} onChange={setSearch} placeholder="Search materials..." />
        </div>

        <DataTable
          columns={cols}
          data={filtered}
          loading={loading}
          searchValue={search}
          onEdit={openEdit}
          onDelete={(row) => setDeleteItem(row)}
          emptyMessage="No materials found"
          emptyIcon={<Package size={28} />}
          actions={(row) => (
            <button
              className="btn btn-ghost btn-sm"
              onClick={() => { setAdjustItem(row); setAdjustModal(true) }}
              style={{ color: 'var(--accent-blue)', gap: '4px', fontSize: '0.75rem' }}
            >
              <RefreshCw size={13} /> Adjust
            </button>
          )}
        />
      </div>

      {/* Add/Edit Modal */}
      <Modal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        title={editItem ? 'Edit Material' : 'Add Raw Material'}
        size="md"
        footer={
          <>
            <button className="btn btn-secondary" onClick={() => setModalOpen(false)}>Cancel</button>
            <button className="btn btn-primary" onClick={handleSubmit(onSubmit)} disabled={saving}>
              {saving ? 'Saving...' : editItem ? 'Update' : 'Add Material'}
            </button>
          </>
        }
      >
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div className="form-grid">
            <div className="form-group form-full">
              <label className="form-label">Material Name <span className="required">*</span></label>
              <input className={`form-input ${errors.name ? 'error' : ''}`} {...register('name', { required: true })} placeholder="e.g. White Cotton Thread" />
            </div>
            <div className="form-group">
              <label className="form-label">Category <span className="required">*</span></label>
              <select className="form-select" {...register('category', { required: true })}>
                {categories.map((c) => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>
            </div>
            <div className="form-group">
              <label className="form-label">Unit <span className="required">*</span></label>
              <select className="form-select" {...register('unit')}>
                {['meter', 'kg', 'pcs', 'roll', 'box', 'ltr', 'dozen'].map((u) => (
                  <option key={u} value={u}>{u}</option>
                ))}
              </select>
            </div>
            <div className="form-group">
              <label className="form-label">Quantity</label>
              <input type="number" className="form-input" {...register('quantity')} placeholder="0" />
            </div>
            <div className="form-group">
              <label className="form-label">Purchase Price (₹/unit)</label>
              <input type="number" step="0.01" className="form-input" {...register('purchasePrice')} placeholder="0.00" />
            </div>
            <div className="form-group">
              <label className="form-label">Reorder Level</label>
              <input type="number" className="form-input" {...register('reorderLevel')} placeholder="Minimum stock level" />
            </div>
            <div className="form-group form-full">
              <label className="form-label">Supplier Name</label>
              <input className="form-input" {...register('supplierName')} placeholder="Primary supplier" />
            </div>
          </div>
        </div>
      </Modal>

      {/* Adjust Stock Modal */}
      <Modal
        isOpen={adjustModal}
        onClose={() => setAdjustModal(false)}
        title={`Adjust Stock — ${adjustItem?.name}`}
        size="sm"
        footer={
          <>
            <button className="btn btn-secondary" onClick={() => setAdjustModal(false)}>Cancel</button>
            <button className="btn btn-primary" onClick={handleAdjust}>Apply Adjustment</button>
          </>
        }
      >
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div style={{ background: 'var(--bg-surface)', borderRadius: 'var(--radius-sm)', padding: '12px 16px', fontSize: '0.875rem' }}>
            Current Stock: <strong style={{ color: 'var(--accent-gold)' }}>{adjustItem?.quantity} {adjustItem?.unit}</strong>
          </div>
          <div className="form-group">
            <label className="form-label">Adjustment Quantity (use negative to deduct)</label>
            <input
              type="number"
              className="form-input"
              value={adjustQty}
              onChange={(e) => setAdjustQty(e.target.value)}
              placeholder="e.g. +50 or -20"
            />
          </div>
          <div className="form-group">
            <label className="form-label">Reason</label>
            <input
              className="form-input"
              value={adjustReason}
              onChange={(e) => setAdjustReason(e.target.value)}
              placeholder="Reason for adjustment"
            />
          </div>
        </div>
      </Modal>

      <Modal
        isOpen={catModalOpen}
        onClose={() => setCatModalOpen(false)}
        title="Manage Categories"
        size="sm"
      >
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <form onSubmit={handleAddCat} style={{ display: 'flex', gap: '8px' }}>
            <input className="form-input" value={newCat} onChange={e => setNewCat(e.target.value)} placeholder="New category name" style={{ flex: 1 }} />
            <button type="submit" className="btn btn-primary">Add</button>
          </form>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', maxHeight: '300px', overflowY: 'auto' }}>
            {categories.map(cat => (
              <div key={cat} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '8px 12px', background: 'var(--bg-surface)', borderRadius: '6px', border: '1px solid var(--border)' }}>
                <span style={{ fontWeight: 500 }}>{cat}</span>
                <button className="btn btn-ghost btn-sm btn-icon" style={{ color: 'var(--danger)' }} onClick={() => handleRemoveCat(cat)}>
                  <Trash2 size={14} />
                </button>
              </div>
            ))}
          </div>
        </div>
      </Modal>

      <ConfirmDialog
        isOpen={!!deleteItem}
        onClose={() => setDeleteItem(null)}
        onConfirm={handleDelete}
        loading={deleting}
        message={`Delete material "${deleteItem?.name}"?`}
      />
    </div>
  )
}

