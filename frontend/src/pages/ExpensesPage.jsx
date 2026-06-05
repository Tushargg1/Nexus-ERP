import React, { useState, useEffect } from 'react'
import { useLocation } from 'react-router-dom'
import useApprovalStore from '../store/approvalStore'
import useAuthStore from '../store/authStore'
import useNotificationStore from '../store/notificationStore'
import { Plus, Receipt, TrendingUp, CheckCircle, XCircle, Trash2, Pencil } from 'lucide-react'
import toast from 'react-hot-toast'
import { expensesAPI } from '../api/expenses'
import PageHeader from '../components/common/PageHeader'
import DataTable from '../components/common/DataTable'
import Modal from '../components/common/Modal'
import SearchBar from '../components/common/SearchBar'
import StatsCard from '../components/common/StatsCard'
import { format } from 'date-fns'



const EXPENSE_CATEGORIES = ['Electricity', 'Maintenance', 'Logistics', 'Office Supplies', 'Rent', 'Wages', 'Marketing', 'Other']
const emptyForm = { date: format(new Date(), 'yyyy-MM-dd'), category: '', amount: '', paidTo: '', paymentMode: 'CASH', reference: '', notes: '' }

export default function ExpensesPage() {
  const [expenses, setExpenses] = useState([])
  const [loading, setLoading] = useState(false)
  const [search, setSearch] = useState('')
  const [categoryFilter, setCategoryFilter] = useState('ALL')
  const [modalOpen, setModalOpen] = useState(false)
  const [editItem, setEditItem] = useState(null)
  const [saving, setSaving] = useState(false)
  const [formData, setFormData] = useState(emptyForm)
  const location = useLocation()
  
  const submitChange = useApprovalStore(s => s.submitChange)
  const approveChange = useApprovalStore(s => s.approveChange)
  const declineChange = useApprovalStore(s => s.declineChange)
  const user = useAuthStore(s => s.user)
  const notifyEdit = useNotificationStore(s => s.notifyEdit)

  useEffect(() => {
    fetchExpenses()
  }, [])

  useEffect(() => {
    if (location.state?.openAddModal) {
      setFormData(emptyForm)
      setEditItem(null)
      setModalOpen(true)
      window.history.replaceState({}, document.title)
    }
  }, [location.state])

  const fetchExpenses = async () => {
    setLoading(true)
    try {
      const res = await expensesAPI.getAll()
      const data = res.data?.data || res.data?.content || res.data;
      setExpenses(Array.isArray(data) ? data : [])
    } catch {
      setExpenses([])
    } finally {
      setLoading(false)
    }
  }

  const filtered = expenses.filter((e) => {
    const matchCat = categoryFilter === 'ALL' || e.category === categoryFilter
    const matchSearch = !search || [e.category, e.paidTo, e.notes].some(f => f?.toLowerCase().includes(search.toLowerCase()))
    return matchCat && matchSearch
  })

  // Merge pending/declined CREATE activities from approvalStore
  const allActivities = useApprovalStore(s => s.activities)
  const pendingOrDeclinedCreates = allActivities
    .filter(a => a.module === 'Expenses' && a.action === 'CREATE' && (a.status === 'PENDING' || a.status === 'DECLINED'))
    .map(a => ({ ...a.data, _approvalStatus: a.status, submitterName: a.submitterName }))

  const tableData = [...pendingOrDeclinedCreates, ...filtered]

  const totalExpenses = expenses.reduce((s, e) => s + e.amount, 0)
  const thisMonth = expenses.filter(e => e.date?.startsWith(format(new Date(), 'yyyy-MM'))).reduce((s, e) => s + e.amount, 0)

  const openAdd = () => { setEditItem(null); setFormData(emptyForm); setModalOpen(true) }
  const openEdit = (row) => { setEditItem(row); setFormData({ ...row }); setModalOpen(true) }
  
  const handleSave = async () => {
    if (!formData.category || !formData.amount || !formData.date) return toast.error('Fill required fields')
    setSaving(true)
    try {
      const isOwner = user?.role === 'OWNER'
      const editorName = user?.name || 'Unknown'

      if (editItem) {
        // EDIT flow
        const previousModifier = editItem.lastModifiedBy || 'Owner'
        const updated = { ...editItem, ...formData, amount: Number(formData.amount), lastModifiedBy: editorName }
        await expensesAPI.update(editItem.id, updated)
        submitChange('Expenses', 'UPDATE', updated, editItem)
        if (isOwner) {
          setExpenses(prev => prev.map(e => e.id === editItem.id ? updated : e))
          toast.success('Expense updated')
        } else {
          toast.success('Edit submitted for approval')
        }
        notifyEdit('Expenses', `${formData.paidTo || formData.category} ₹${formData.amount}`, editorName, previousModifier)
      } else {
        // ADD flow
        const newItemPayload = { ...formData, amount: Number(formData.amount), lastModifiedBy: editorName }
        const res = await expensesAPI.create(newItemPayload)
        const newExp = res.data?.data || res.data
        submitChange('Expenses', 'CREATE', newExp)
        if (isOwner) {
          setExpenses(prev => [newExp, ...prev])
          toast.success('Expense added')
        } else {
          toast.success('Expense submitted for approval')
        }
      }
      
      setModalOpen(false)
      setFormData(emptyForm)
      setEditItem(null)
    } catch (err) {
      toast.error('Failed to save expense')
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async (row) => {
    if (!window.confirm('Delete this expense?')) return
    try {
      const isOwner = user?.role === 'OWNER'
      await expensesAPI.delete(row.id)
      submitChange('Expenses', 'DELETE', row)
      if (isOwner) {
        setExpenses(expenses.filter(e => e.id !== row.id))
        toast.success('Expense deleted')
      } else {
        toast.success('Delete request submitted for approval')
      }
    } catch {
      toast.error('Failed to delete expense')
    }
  }

  const cols = [
    { key: 'date', label: 'Date', primary: true },
    { key: 'category', label: 'Category', render: v => <span style={{ padding: '2px 8px', background: 'var(--bg-surface-hover)', borderRadius: '12px', fontSize: '0.75rem', fontWeight: 600 }}>{v}</span> },
    { key: 'paidTo', label: 'Paid To' },
    { key: 'paymentMode', label: 'Mode' },
    { key: 'notes', label: 'Notes', render: v => <span style={{ color: 'var(--text-muted)' }}>{v || '—'}</span> },
    { key: 'amount', label: 'Amount', render: v => <strong style={{ color: 'var(--danger)' }}>₹{v.toLocaleString('en-IN')}</strong> },
  ]

  return (
    <div style={{ animation: 'fadeIn 0.3s ease' }}>
      <PageHeader 
        title="Expenses" 
        subtitle="Track daily operational expenses and overheads"
        actions={
          <button className="btn btn-primary" onClick={openAdd}>
            <Plus size={16} /> Add Expense
          </button>
        }
      />

      <div className="grid-2" style={{ marginBottom: '24px' }}>
        <StatsCard title="Total Expenses (All Time)" value={totalExpenses} prefix="₹" icon={Receipt} color="red" />
        <StatsCard title="This Month" value={thisMonth} prefix="₹" icon={TrendingUp} color="gold" />
      </div>

      <div className="card">
        <div className="filter-bar">
          <SearchBar value={search} onChange={setSearch} placeholder="Search expenses..." />
          <select className="form-select" value={categoryFilter} onChange={(e) => setCategoryFilter(e.target.value)}>
            <option value="ALL">All Categories</option>
            {EXPENSE_CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
          </select>
        </div>
        
        <DataTable
          columns={cols}
          data={tableData}
          loading={loading}
          searchValue={search}
          emptyMessage="No expenses found"
          emptyIcon={<Receipt size={28} />}
          actions={(row) => {
            if (row._approvalStatus === 'PENDING') {
              return (
                <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end' }}>
                  <button
                    onClick={() => { approveChange(row.id); toast.success('Expense Approved'); }}
                    className="btn btn-ghost btn-sm btn-icon"
                    style={{ color: 'var(--success)', border: '1px solid var(--success)' }}
                    title="Approve Now"
                  >
                    <CheckCircle size={15} />
                  </button>
                  <button
                    onClick={() => { 
                      declineChange(row.id, { type: 'REASSIGN', assigneeId: 'MANAGER', assigneeName: 'Manager' }, '');
                      toast.success('Expense Declined');
                    }}
                    className="btn btn-ghost btn-sm btn-icon"
                    style={{ color: 'var(--danger)', border: '1px solid var(--danger)' }}
                    title="Decline"
                  >
                    <XCircle size={15} />
                  </button>
                </div>
              )
            }
            return (
              <div style={{ display: 'flex', gap: '6px', justifyContent: 'flex-end' }}>
                <button
                  className="btn btn-ghost btn-sm btn-icon"
                  style={{ color: 'var(--text-muted)' }}
                  onClick={() => openEdit(row)}
                  title="Edit"
                >
                  <Pencil size={14} />
                </button>
                <button
                  className="btn btn-ghost btn-sm btn-icon"
                  style={{ color: 'var(--danger)' }}
                  onClick={() => handleDelete(row)}
                  title="Delete"
                >
                  <Trash2 size={15} />
                </button>
              </div>
            )
          }}
        />
      </div>

      <Modal
        isOpen={modalOpen}
        onClose={() => { setModalOpen(false); setEditItem(null) }}
        title={editItem ? 'Edit Expense' : 'Add Expense'}
        size="md"
        footer={
          <>
            <button className="btn btn-secondary" onClick={() => { setModalOpen(false); setEditItem(null) }}>Cancel</button>
            <button className="btn btn-primary" onClick={handleSave} disabled={saving}>
              {saving ? 'Saving...' : editItem ? 'Update Expense' : 'Save Expense'}
            </button>
          </>
        }
      >
        <div className="form-grid">
          <div className="form-group">
            <label className="form-label">Date <span className="required">*</span></label>
            <input type="date" className="form-input" value={formData.date} onChange={(e) => setFormData({...formData, date: e.target.value})} />
          </div>
          <div className="form-group">
            <label className="form-label">Category <span className="required">*</span></label>
            <select className="form-select" value={formData.category} onChange={(e) => setFormData({...formData, category: e.target.value})}>
              <option value="">Select...</option>
              {EXPENSE_CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
            </select>
          </div>
          <div className="form-group">
            <label className="form-label">Amount (₹) <span className="required">*</span></label>
            <input type="number" className="form-input" value={formData.amount} onChange={(e) => setFormData({...formData, amount: e.target.value})} placeholder="0.00" />
          </div>
          <div className="form-group">
            <label className="form-label">Paid To</label>
            <input className="form-input" value={formData.paidTo} onChange={(e) => setFormData({...formData, paidTo: e.target.value})} placeholder="Vendor or Person" />
          </div>
          <div className="form-group">
            <label className="form-label">Payment Mode</label>
            <select className="form-select" value={formData.paymentMode} onChange={(e) => setFormData({...formData, paymentMode: e.target.value})}>
              {['CASH', 'BANK_TRANSFER', 'UPI', 'CHEQUE'].map(m => <option key={m} value={m}>{m.replace('_', ' ')}</option>)}
            </select>
          </div>
          <div className="form-group">
            <label className="form-label">Reference No</label>
            <input className="form-input" value={formData.reference} onChange={(e) => setFormData({...formData, reference: e.target.value})} placeholder="Txn ID" />
          </div>
          <div className="form-group" style={{ gridColumn: '1 / -1' }}>
            <label className="form-label">Notes</label>
            <textarea className="form-textarea" value={formData.notes} onChange={(e) => setFormData({...formData, notes: e.target.value})} placeholder="Description..." rows={2} />
          </div>
        </div>
      </Modal>
    </div>
  )
}

