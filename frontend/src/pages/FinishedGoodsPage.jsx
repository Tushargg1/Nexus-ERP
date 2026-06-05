import React, { useState, useEffect } from 'react'
import { Plus, ShoppingBag, AlertTriangle, RefreshCw, Settings, Trash2 } from 'lucide-react'
import toast from 'react-hot-toast'
import { useForm } from 'react-hook-form'
import { productsAPI } from '../api/products'
import useAuthStore from '../store/authStore'
import useNotificationStore from '../store/notificationStore'
import PageHeader from '../components/common/PageHeader'
import DataTable from '../components/common/DataTable'
import Modal from '../components/common/Modal'
import SearchBar from '../components/common/SearchBar'
import ConfirmDialog from '../components/common/ConfirmDialog'
import StatsCard from '../components/common/StatsCard'
import Badge from '../components/common/Badge'

const DEFAULT_CATEGORIES = ['Baba Suit', 'Baby Set', 'Rompers', 'T-Shirts', 'Other']



const defaultValues = {
  name: '', category: 'Baba Suit', size: '', color: '',
  quantity: '', sellingPrice: '', costPrice: '', reorderLevel: '',
}

export default function FinishedGoodsPage() {
  const [categories, setCategories] = useState(() => {
    try {
      const saved = localStorage.getItem('finished_goods_categories')
      return saved ? JSON.parse(saved) : DEFAULT_CATEGORIES
    } catch {
      return DEFAULT_CATEGORIES
    }
  })

  useEffect(() => {
    localStorage.setItem('finished_goods_categories', JSON.stringify(categories))
  }, [categories])

  const allCategories = ['ALL', ...categories]

  const [catModalOpen, setCatModalOpen] = useState(false)
  const [newCat, setNewCat] = useState('')

  const handleAddCat = (e) => {
    e.preventDefault()
    if (newCat.trim() && !categories.includes(newCat.trim())) {
      setCategories([...categories, newCat.trim()])
      setNewCat('')
    }
  }

  const handleRemoveCat = (cat) => {
    if (window.confirm(`Remove category "${cat}"?`)) {
      setCategories(categories.filter(c => c !== cat))
      if (activeCategory === cat) setActiveCategory('ALL')
    }
  }

  const [products, setProducts] = useState([])
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

  const { register, handleSubmit, reset, formState: { errors } } = useForm({ defaultValues })
  const user = useAuthStore(s => s.user)
  const notifyEdit = useNotificationStore(s => s.notifyEdit)

  useEffect(() => {
    const fetch = async () => {
      setLoading(true)
      try {
        const res = await productsAPI.getAll()
        const data = res.data?.data || res.data?.content || res.data;
        setProducts(Array.isArray(data) ? data : [])
      } catch {
        setProducts([])
      } finally {
        setLoading(false)
      }
    }
    fetch()
  }, [])

  const filtered = products.filter((p) => {
    const matchCat = activeCategory === 'ALL' || p.category === activeCategory
    const matchSearch = !search || [p.name, p.category, p.color, p.size]
      .some((f) => f?.toLowerCase().includes(search.toLowerCase()))
    return matchCat && matchSearch
  })

  const lowStockItems = products.filter((p) => p.quantity <= p.reorderLevel)
  const totalValue = products.reduce((sum, p) => sum + p.quantity * p.costPrice, 0)

  const openAdd = () => { setEditItem(null); reset(defaultValues); setModalOpen(true) }
  const openEdit = (item) => { setEditItem(item); reset(item); setModalOpen(true) }

  const onSubmit = async (data) => {
    setSaving(true)
    const margin = Math.round(((data.sellingPrice - data.costPrice) / data.sellingPrice) * 100)
    try {
      if (editItem) {
        const editorName = user?.name || 'Unknown'
        const previousModifier = editItem.lastModifiedBy || 'Owner'
        const updated = { ...data, margin, lastModifiedBy: editorName }
        await productsAPI.update(editItem.id, updated)
        setProducts((prev) => prev.map((p) => p.id === editItem.id ? { ...p, ...updated } : p))
        notifyEdit('Finished Goods', data.name, editorName, previousModifier)
        toast.success('Product updated')
      } else {
        const res = await productsAPI.create({ ...data, margin })
        const newP = res.data?.data || res.data
        setProducts((prev) => [newP, ...prev])
        toast.success('Product added')
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
      await productsAPI.adjust(adjustItem.id, { quantity: Number(adjustQty) })
      setProducts((prev) => prev.map((p) =>
        p.id === adjustItem.id ? { ...p, quantity: p.quantity + Number(adjustQty) } : p
      ))
      toast.success('Stock adjusted')
      setAdjustModal(false)
      setAdjustQty('')
    } catch {
      toast.error('Adjustment failed')
    }
  }

  const handleDelete = async () => {
    setDeleting(true)
    try {
      await productsAPI.delete(deleteItem.id)
      setProducts((prev) => prev.filter((p) => p.id !== deleteItem.id))
      toast.success('Product deleted')
      setDeleteItem(null)
    } catch {
      toast.error('Failed to delete')
    } finally {
      setDeleting(false)
    }
  }

  const cols = [
    { key: 'name', label: 'Product', primary: true, render: (v, row) => (
      <div>
        <div style={{ fontWeight: 600, color: 'var(--text-primary)' }}>{v}</div>
        <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Size: {row.size} · Color: {row.color}</div>
      </div>
    )},
    { key: 'category', label: 'Category', render: (v) => <span className="badge badge-info">{v}</span> },
    { key: 'quantity', label: 'Stock', render: (v, row) => (
      <span style={{ fontWeight: 700, color: v <= row.reorderLevel ? 'var(--danger)' : 'var(--success)' }}>
        {v} pcs
      </span>
    )},
    { key: 'sellingPrice', label: 'Selling Price', render: (v) => `₹${v}` },
    { key: 'costPrice', label: 'Cost Price', render: (v) => `₹${v}` },
    { key: 'margin', label: 'Margin', render: (v) => (
      <span style={{ color: 'var(--accent-gold)', fontWeight: 600 }}>{v}%</span>
    )},
    { key: 'stockStatus', label: 'Status', noSort: true, render: (_, row) => (
      row.quantity <= row.reorderLevel ? <Badge status="LOW_STOCK" /> : <Badge status="IN_STOCK" />
    )},
  ]

  return (
    <div style={{ animation: 'fadeIn 0.3s ease' }}>
      <PageHeader
        title="Finished Goods"
        subtitle="Manage product inventory and pricing"
        actions={
          <button className="btn btn-primary" onClick={openAdd}>
            <Plus size={16} /> Add Product
          </button>
        }
      />

      <div className="grid-3" style={{ marginBottom: '24px' }}>
        <StatsCard title="Total Products" value={products.length} suffix=" SKUs" icon={ShoppingBag} color="blue" />
        <StatsCard title="Low Stock" value={lowStockItems.length} suffix=" items" icon={AlertTriangle} color="red" />
        <StatsCard title="Inventory Value" value={totalValue} prefix="₹" icon={ShoppingBag} color="gold" />
      </div>

      <div className="card">
        <div className="card-header" style={{ flexDirection: 'column', alignItems: 'flex-start', gap: '12px' }}>
          <div className="tabs" style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
            {allCategories.map((cat) => (
              <button key={cat} className={`tab ${activeCategory === cat ? 'active' : ''}`} onClick={() => setActiveCategory(cat)}>
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
          <SearchBar value={search} onChange={setSearch} placeholder="Search products..." />
        </div>

        <DataTable
          columns={cols}
          data={filtered}
          loading={loading}
          searchValue={search}
          onEdit={openEdit}
          onDelete={(row) => setDeleteItem(row)}
          emptyMessage="No products found"
          emptyIcon={<ShoppingBag size={28} />}
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

      <Modal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        title={editItem ? 'Edit Product' : 'Add Finished Product'}
        size="md"
        footer={
          <>
            <button className="btn btn-secondary" onClick={() => setModalOpen(false)}>Cancel</button>
            <button className="btn btn-primary" onClick={handleSubmit(onSubmit)} disabled={saving}>
              {saving ? 'Saving...' : editItem ? 'Update' : 'Add Product'}
            </button>
          </>
        }
      >
        <div className="form-grid">
          <div className="form-group form-full">
            <label className="form-label">Product Name <span className="required">*</span></label>
            <input className={`form-input ${errors.name ? 'error' : ''}`} {...register('name', { required: true })} placeholder="e.g. Baba Suit White 6M" />
          </div>
          <div className="form-group">
            <label className="form-label">Category</label>
            <select className="form-select" {...register('category')}>
              {categories.map((c) => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>
          </div>
          <div className="form-group">
            <label className="form-label">Size</label>
            <input className="form-input" {...register('size')} placeholder="e.g. 6M, 1Y, S, M" />
          </div>
          <div className="form-group">
            <label className="form-label">Color</label>
            <input className="form-input" {...register('color')} placeholder="e.g. White, Blue" />
          </div>
          <div className="form-group">
            <label className="form-label">Quantity (pcs)</label>
            <input type="number" className="form-input" {...register('quantity')} placeholder="0" />
          </div>
          <div className="form-group">
            <label className="form-label">Cost Price (₹)</label>
            <input type="number" step="0.01" className="form-input" {...register('costPrice')} placeholder="0.00" />
          </div>
          <div className="form-group">
            <label className="form-label">Selling Price (₹)</label>
            <input type="number" step="0.01" className="form-input" {...register('sellingPrice')} placeholder="0.00" />
          </div>
          <div className="form-group">
            <label className="form-label">Reorder Level</label>
            <input type="number" className="form-input" {...register('reorderLevel')} placeholder="Min stock" />
          </div>
        </div>
      </Modal>

      <Modal
        isOpen={adjustModal}
        onClose={() => setAdjustModal(false)}
        title={`Adjust Stock — ${adjustItem?.name}`}
        size="sm"
        footer={
          <>
            <button className="btn btn-secondary" onClick={() => setAdjustModal(false)}>Cancel</button>
            <button className="btn btn-primary" onClick={handleAdjust}>Apply</button>
          </>
        }
      >
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div style={{ background: 'var(--bg-surface)', borderRadius: 'var(--radius-sm)', padding: '12px 16px', fontSize: '0.875rem' }}>
            Current Stock: <strong style={{ color: 'var(--accent-gold)' }}>{adjustItem?.quantity} pcs</strong>
          </div>
          <div className="form-group">
            <label className="form-label">Quantity Change (+ or -)</label>
            <input type="number" className="form-input" value={adjustQty} onChange={(e) => setAdjustQty(e.target.value)} placeholder="e.g. +50 or -20" />
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
        message={`Delete product "${deleteItem?.name}"?`}
      />
    </div>
  )
}

