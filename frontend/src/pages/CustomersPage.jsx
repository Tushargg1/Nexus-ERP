import React, { useState, useEffect } from 'react'
import { Plus, Users, BookOpen } from 'lucide-react'
import toast from 'react-hot-toast'
import { useForm } from 'react-hook-form'
import { customersAPI } from '../api/customers'
import useAuthStore from '../store/authStore'
import useNotificationStore from '../store/notificationStore'
import PageHeader from '../components/common/PageHeader'
import DataTable from '../components/common/DataTable'
import Modal from '../components/common/Modal'
import SearchBar from '../components/common/SearchBar'
import ConfirmDialog from '../components/common/ConfirmDialog'
import Badge from '../components/common/Badge'



const defaultValues = {
  name: '', businessName: '', phone: '', email: '',
  address: '', gstNumber: '', creditLimit: '',
}

export default function CustomersPage() {
  const [customers, setCustomers] = useState([])
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

  useEffect(() => {
    const fetch = async () => {
      setLoading(true)
      try {
        const res = await customersAPI.getAll()
        const data = res.data?.data || res.data?.content || res.data
        setCustomers(Array.isArray(data) ? data : [])
      } catch {
        setCustomers([])
      } finally {
        setLoading(false)
      }
    }
    fetch()
  }, [])

  const filtered = customers.filter((c) =>
    !search || [c.name, c.businessName, c.phone, c.gstNumber]
      .some((f) => f?.toLowerCase().includes(search.toLowerCase()))
  )

  const openAdd = () => { setEditItem(null); reset(defaultValues); setModalOpen(true) }
  const openEdit = (item) => { setEditItem(item); reset(item); setModalOpen(true) }

  const onSubmit = async (data) => {
    setSaving(true)
    try {
      if (editItem) {
        const editorName = user?.name || 'Unknown'
        const previousModifier = editItem.lastModifiedBy || 'Owner'
        const updated = { ...data, lastModifiedBy: editorName }
        await customersAPI.update(editItem.id, updated)
        setCustomers((prev) => prev.map((c) => c.id === editItem.id ? { ...c, ...updated } : c))
        notifyEdit('Customers', data.name, editorName, previousModifier)
        toast.success('Customer updated')
      } else {
        const res = await customersAPI.create(data)
        const newC = res.data?.data || res.data
        setCustomers((prev) => [newC, ...prev])
        toast.success('Customer added')
      }
      setModalOpen(false)
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to save')
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async () => {
    setDeleting(true)
    try {
      await customersAPI.delete(deleteItem.id)
      setCustomers((prev) => prev.filter((c) => c.id !== deleteItem.id))
      toast.success('Customer deleted')
      setDeleteItem(null)
    } catch {
      toast.error('Failed to delete')
    } finally {
      setDeleting(false)
    }
  }

  const columns = [
    { key: 'name', label: 'Customer', primary: true, render: (v, row) => (
      <div>
        <div style={{ fontWeight: 600, color: 'var(--text-primary)' }}>{v}</div>
        <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{row.businessName}</div>
      </div>
    )},
    { key: 'phone', label: 'Phone' },
    { key: 'gstNumber', label: 'GST No', render: (v) => <span style={{ fontFamily: 'monospace', fontSize: '0.8125rem' }}>{v || '—'}</span> },
    { key: 'creditLimit', label: 'Credit Limit', render: (v) => `₹${(v || 0).toLocaleString('en-IN')}` },
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
        title="Buyers"
        subtitle="Manage your buyer network and credit limits"
        actions={
          <button className="btn btn-primary" onClick={openAdd}>
            <Plus size={16} /> Add Customer
          </button>
        }
      />

      <div className="card">
        <div className="card-header">
          <SearchBar value={search} onChange={setSearch} placeholder="Search by name, business, phone, GST..." />
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
          emptyMessage="No customers found"
          emptyIcon={<Users size={28} />}
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
        title={editItem ? 'Edit Customer' : 'Add New Customer'}
        size="lg"
        footer={
          <>
            <button className="btn btn-secondary" onClick={() => setModalOpen(false)}>Cancel</button>
            <button className="btn btn-primary" onClick={handleSubmit(onSubmit)} disabled={saving}>
              {saving ? 'Saving...' : editItem ? 'Update' : 'Add Customer'}
            </button>
          </>
        }
      >
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div className="form-grid">
            <div className="form-group">
              <label className="form-label">Customer Name <span className="required">*</span></label>
              <input className={`form-input ${errors.name ? 'error' : ''}`} {...register('name', { required: true })} placeholder="Full name" />
            </div>
            <div className="form-group">
              <label className="form-label">Business Name</label>
              <input className="form-input" {...register('businessName')} placeholder="Business / shop name" />
            </div>
            <div className="form-group">
              <label className="form-label">Phone <span className="required">*</span></label>
              <input className={`form-input ${errors.phone ? 'error' : ''}`} {...register('phone', { required: true })} placeholder="Mobile number" />
            </div>
            <div className="form-group">
              <label className="form-label">Email</label>
              <input type="email" className="form-input" {...register('email')} placeholder="email@example.com" />
            </div>
            <div className="form-group">
              <label className="form-label">GST Number</label>
              <input className="form-input" {...register('gstNumber')} placeholder="15-digit GST number" style={{ textTransform: 'uppercase' }} />
            </div>
            <div className="form-group">
              <label className="form-label">Credit Limit (₹)</label>
              <input type="number" className="form-input" {...register('creditLimit')} placeholder="0" />
            </div>
            <div className="form-group form-full">
              <label className="form-label">Address</label>
              <textarea className="form-textarea" {...register('address')} placeholder="Full address" rows={2} />
            </div>
          </div>
        </div>
      </Modal>

      {/* Ledger Modal */}
      <Modal
        isOpen={!!ledgerItem}
        onClose={() => setLedgerItem(null)}
        title={`Account Ledger — ${ledgerItem?.name}`}
        size="lg"
      >
        <div style={{ display: 'flex', gap: '16px', marginBottom: '20px' }}>
          {[
            { label: 'Total Sales', value: '₹3,15,000', color: 'var(--success)' },
            { label: 'Total Received', value: '₹2,33,000', color: 'var(--accent-blue)' },
            { label: 'Outstanding Dues', value: `₹${(ledgerItem?.outstandingAmount || 0).toLocaleString('en-IN')}`, color: 'var(--danger)' },
          ].map((item, i) => (
            <div key={i} style={{
              flex: 1, background: 'var(--bg-surface)',
              borderRadius: 'var(--radius-sm)', padding: '14px 16px', border: '1px solid var(--border)',
            }}>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: '4px' }}>{item.label}</div>
              <div style={{ fontSize: '1.25rem', fontWeight: 700, color: item.color }}>{item.value}</div>
            </div>
          ))}
        </div>
        <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem', textAlign: 'center', padding: '20px' }}>
          Connect to backend to view full transaction history.
        </p>
      </Modal>

      <ConfirmDialog
        isOpen={!!deleteItem}
        onClose={() => setDeleteItem(null)}
        onConfirm={handleDelete}
        loading={deleting}
        message={`Delete customer "${deleteItem?.name}"? This action cannot be undone.`}
      />
    </div>
  )
}

