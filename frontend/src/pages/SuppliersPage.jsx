import React, { useState, useEffect } from 'react'
import { Plus, Truck, BookOpen } from 'lucide-react'
import toast from 'react-hot-toast'
import { useForm } from 'react-hook-form'
import { suppliersAPI } from '../api/suppliers'
import useAuthStore from '../store/authStore'
import useNotificationStore from '../store/notificationStore'
import PageHeader from '../components/common/PageHeader'
import DataTable from '../components/common/DataTable'
import Modal from '../components/common/Modal'
import SearchBar from '../components/common/SearchBar'
import ConfirmDialog from '../components/common/ConfirmDialog'
import Badge from '../components/common/Badge'



const defaultValues = {
  name: '', mobile: '', email: '', address: '',
  gstNumber: '', materialSupplied: '', bankAccount: '', bankName: '', ifsc: '',
}

export default function SuppliersPage() {
  const [suppliers, setSuppliers] = useState([])
  const [loading, setLoading] = useState(false)
  const [search, setSearch] = useState('')
  const [modalOpen, setModalOpen] = useState(false)
  const [editItem, setEditItem] = useState(null)
  const [deleteItem, setDeleteItem] = useState(null)
  const [ledgerItem, setLedgerItem] = useState(null)
  const [saving, setSaving] = useState(false)
  const [deleting, setDeleting] = useState(false)

  const { register, handleSubmit, reset, formState: { errors } } = useForm({ defaultValues })
  const user = useAuthStore(s => s.user)
  const notifyEdit = useNotificationStore(s => s.notifyEdit)

  const fetchSuppliers = async () => {
    setLoading(true)
    try {
      const res = await suppliersAPI.getAll()
      const data = res.data?.data || res.data?.content || res.data
      setSuppliers(Array.isArray(data) ? data : [])
    } catch {
      setSuppliers([])
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { fetchSuppliers() }, [])

  const filtered = suppliers.filter((s) =>
    !search || [s.name, s.mobile, s.materialSupplied, s.gstNumber]
      .some((f) => f?.toLowerCase().includes(search.toLowerCase()))
  )

  const openAdd = () => {
    setEditItem(null)
    reset(defaultValues)
    setModalOpen(true)
  }

  const openEdit = (item) => {
    setEditItem(item)
    reset(item)
    setModalOpen(true)
  }

  const onSubmit = async (data) => {
    setSaving(true)
    try {
      if (editItem) {
        const editorName = user?.name || 'Unknown'
        const previousModifier = editItem.lastModifiedBy || 'Owner'
        const updated = { ...data, lastModifiedBy: editorName }
        await suppliersAPI.update(editItem.id, updated)
        setSuppliers((prev) => prev.map((s) => s.id === editItem.id ? { ...s, ...updated } : s))
        notifyEdit('Suppliers', data.name, editorName, previousModifier)
        toast.success('Supplier updated successfully')
      } else {
        const res = await suppliersAPI.create(data)
        const newSupplier = res.data?.data || res.data
        setSuppliers((prev) => [newSupplier, ...prev])
        toast.success('Supplier added successfully')
      }
      setModalOpen(false)
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to save supplier')
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async () => {
    setDeleting(true)
    try {
      await suppliersAPI.delete(deleteItem.id)
      setSuppliers((prev) => prev.filter((s) => s.id !== deleteItem.id))
      toast.success('Supplier deleted')
      setDeleteItem(null)
    } catch {
      toast.error('Failed to delete supplier')
    } finally {
      setDeleting(false)
    }
  }

  const columns = [
    { key: 'name', label: 'Supplier Name', primary: true, render: (v, row) => (
      <div>
        <div style={{ fontWeight: 600, color: 'var(--text-primary)' }}>{v}</div>
        <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{row.mobile}</div>
      </div>
    )},
    { key: 'materialSupplied', label: 'Material' },
    { key: 'gstNumber', label: 'GST No', render: (v) => <span style={{ fontFamily: 'monospace', fontSize: '0.8125rem' }}>{v || '—'}</span> },
    { key: 'outstandingAmount', label: 'Outstanding', render: (v) => (
      <span style={{ color: v > 0 ? 'var(--danger)' : 'var(--success)', fontWeight: 700 }}>
        {v > 0 ? `₹${v.toLocaleString('en-IN')}` : '₹0'}
      </span>
    )},
    { key: 'status', label: 'Status', noSort: true, render: (v) => <Badge status={v} /> },
  ]

  return (
    <div style={{ animation: 'fadeIn 0.3s ease' }}>
      <PageHeader
        title="Suppliers"
        subtitle={`${suppliers.length} suppliers registered`}
        actions={
          <button className="btn btn-primary" onClick={openAdd}>
            <Plus size={16} /> Add Supplier
          </button>
        }
      />

      <div className="card">
        <div className="card-header">
          <SearchBar
            value={search}
            onChange={setSearch}
            placeholder="Search by name, phone, material, GST..."
          />
          <span className="text-muted text-sm">{filtered.length} results</span>
        </div>

        <DataTable
          columns={columns}
          data={filtered}
          loading={loading}
          searchValue={search}
          onEdit={openEdit}
          onDelete={(row) => setDeleteItem(row)}
          onView={(row) => setLedgerItem(row)}
          emptyMessage="No suppliers found"
          emptyIcon={<Truck size={28} />}
          actions={(row) => (
            <button
              className="btn btn-ghost btn-sm"
              onClick={() => setLedgerItem(row)}
              style={{ color: 'var(--accent-blue)', gap: '4px', fontSize: '0.75rem' }}
            >
              <BookOpen size={13} /> Ledger
            </button>
          )}
        />
      </div>

      {/* Add/Edit Modal */}
      <Modal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        title={editItem ? 'Edit Supplier' : 'Add New Supplier'}
        size="lg"
        footer={
          <>
            <button className="btn btn-secondary" onClick={() => setModalOpen(false)}>Cancel</button>
            <button className="btn btn-primary" onClick={handleSubmit(onSubmit)} disabled={saving}>
              {saving ? 'Saving...' : editItem ? 'Update Supplier' : 'Add Supplier'}
            </button>
          </>
        }
      >
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div className="section-title">Basic Information</div>
          <div className="form-grid">
            <div className="form-group">
              <label className="form-label">Supplier Name <span className="required">*</span></label>
              <input className={`form-input ${errors.name ? 'error' : ''}`} {...register('name', { required: true })} placeholder="Enter supplier name" />
            </div>
            <div className="form-group">
              <label className="form-label">Mobile <span className="required">*</span></label>
              <input className={`form-input ${errors.mobile ? 'error' : ''}`} {...register('mobile', { required: true })} placeholder="10-digit mobile number" />
            </div>
            <div className="form-group">
              <label className="form-label">Email</label>
              <input type="email" className="form-input" {...register('email')} placeholder="supplier@email.com" />
            </div>
            <div className="form-group">
              <label className="form-label">Material Supplied</label>
              <input className="form-input" {...register('materialSupplied')} placeholder="e.g. Cotton Fabric, Thread" />
            </div>
            <div className="form-group form-full">
              <label className="form-label">Address</label>
              <textarea className="form-textarea" {...register('address')} placeholder="Full address" rows={2} />
            </div>
            <div className="form-group">
              <label className="form-label">GST Number</label>
              <input className="form-input" {...register('gstNumber')} placeholder="15-digit GST number" style={{ textTransform: 'uppercase' }} />
            </div>
          </div>

          <div className="section-title">Bank Details</div>
          <div className="form-grid">
            <div className="form-group">
              <label className="form-label">Bank Account No</label>
              <input className="form-input" {...register('bankAccount')} placeholder="Account number" />
            </div>
            <div className="form-group">
              <label className="form-label">Bank Name</label>
              <input className="form-input" {...register('bankName')} placeholder="Bank name" />
            </div>
            <div className="form-group">
              <label className="form-label">IFSC Code</label>
              <input className="form-input" {...register('ifsc')} placeholder="IFSC code" style={{ textTransform: 'uppercase' }} />
            </div>
          </div>
        </div>
      </Modal>

      {/* Ledger Modal */}
      <Modal
        isOpen={!!ledgerItem}
        onClose={() => setLedgerItem(null)}
        title={`Ledger — ${ledgerItem?.name}`}
        size="lg"
      >
        <div style={{ display: 'flex', gap: '16px', marginBottom: '20px' }}>
          {[
            { label: 'Total Purchases', value: '₹2,45,000', color: 'var(--accent-blue)' },
            { label: 'Total Paid', value: '₹2,00,000', color: 'var(--success)' },
            { label: 'Outstanding', value: `₹${(ledgerItem?.outstandingAmount || 0).toLocaleString('en-IN')}`, color: 'var(--danger)' },
          ].map((item, i) => (
            <div key={i} style={{
              flex: 1,
              background: 'var(--bg-surface)',
              borderRadius: 'var(--radius-sm)',
              padding: '14px 16px',
              border: '1px solid var(--border)',
            }}>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: '4px' }}>{item.label}</div>
              <div style={{ fontSize: '1.25rem', fontWeight: 700, color: item.color }}>{item.value}</div>
            </div>
          ))}
        </div>
        <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem', textAlign: 'center', padding: '20px' }}>
          Connect to backend to see full transaction ledger history.
        </p>
      </Modal>

      {/* Confirm Delete */}
      <ConfirmDialog
        isOpen={!!deleteItem}
        onClose={() => setDeleteItem(null)}
        onConfirm={handleDelete}
        loading={deleting}
        message={`Are you sure you want to delete "${deleteItem?.name}"? All associated data will be removed.`}
      />
    </div>
  )
}

