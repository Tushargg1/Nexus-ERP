import React, { useState, useEffect } from 'react'
import { Plus, CreditCard, ArrowDownRight, ArrowUpRight } from 'lucide-react'
import toast from 'react-hot-toast'
import { paymentsAPI } from '../api/payments'
import PageHeader from '../components/common/PageHeader'
import DataTable from '../components/common/DataTable'
import Modal from '../components/common/Modal'
import SearchBar from '../components/common/SearchBar'
import StatsCard from '../components/common/StatsCard'
import Badge from '../components/common/Badge'
import { format } from 'date-fns'



const emptyForm = { type: 'IN', partyName: '', amount: '', date: format(new Date(), 'yyyy-MM-dd'), mode: 'BANK_TRANSFER', reference: '', notes: '' }

export default function PaymentsPage() {
  const [payments, setPayments] = useState([])
  const [loading, setLoading] = useState(false)
  const [search, setSearch] = useState('')
  const [typeFilter, setTypeFilter] = useState('ALL')
  const [modalOpen, setModalOpen] = useState(false)
  const [saving, setSaving] = useState(false)
  const [formData, setFormData] = useState(emptyForm)

  useEffect(() => {
    fetchPayments()
  }, [])

  const fetchPayments = async () => {
    setLoading(true)
    try {
      const res = await paymentsAPI.getAll()
      const data = res.data?.data || res.data?.content || res.data;
      setPayments(Array.isArray(data) ? data : [])
    } catch {
      setPayments([])
    } finally {
      setLoading(false)
    }
  }

  const filtered = payments.filter((p) => {
    const matchType = typeFilter === 'ALL' || p.type === typeFilter
    const matchSearch = !search || [p.partyName, p.refNo].some(f => f?.toLowerCase().includes(search.toLowerCase()))
    return matchType && matchSearch
  })

  const totalIn = payments.filter(p => p.type === 'IN' && p.status === 'COMPLETED').reduce((s, p) => s + p.amount, 0)
  const totalOut = payments.filter(p => p.type === 'OUT' && p.status === 'COMPLETED').reduce((s, p) => s + p.amount, 0)
  const netBalance = totalIn - totalOut

  const handleSave = async () => {
    if (!formData.partyName || !formData.amount) return toast.error('Fill required fields')
    setSaving(true)
    try {
      const res = await paymentsAPI.create(formData)
      const newPay = res.data?.data || {
        id: Date.now(),
        refNo: `PAY-${formData.type}-${String(payments.length + 1).padStart(3, '0')}`,
        status: 'COMPLETED',
        ...formData,
        amount: Number(formData.amount),
      }
      setPayments([newPay, ...payments])
      toast.success('Payment recorded')
      setModalOpen(false)
      setFormData(emptyForm)
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to record payment')
    } finally {
      setSaving(false)
    }
  }

  const cols = [
    { key: 'refNo', label: 'Reference No', primary: true },
    { key: 'date', label: 'Date' },
    { 
      key: 'type', 
      label: 'Type',
      render: (v) => v === 'IN' 
        ? <span style={{ color: 'var(--success)', display: 'flex', alignItems: 'center', gap: '4px' }}><ArrowDownRight size={14}/> Receive</span>
        : <span style={{ color: 'var(--danger)', display: 'flex', alignItems: 'center', gap: '4px' }}><ArrowUpRight size={14}/> Pay</span>
    },
    { key: 'partyName', label: 'Party Name' },
    { key: 'mode', label: 'Mode' },
    { key: 'amount', label: 'Amount', render: (v) => <strong>₹{v.toLocaleString('en-IN')}</strong> },
    { key: 'status', label: 'Status', render: (v) => <Badge status={v} /> },
  ]

  return (
    <div style={{ animation: 'fadeIn 0.3s ease' }}>
      <PageHeader 
        title="Payments" 
        subtitle="Record incoming and outgoing payments"
        actions={
          <button className="btn btn-primary" onClick={() => { setFormData(emptyForm); setModalOpen(true); }}>
            <Plus size={16} /> Record Payment
          </button>
        }
      />

      <div className="grid-3" style={{ marginBottom: '24px' }}>
        <StatsCard title="Total Received" value={totalIn} prefix="₹" icon={ArrowDownRight} color="green" />
        <StatsCard title="Total Paid" value={totalOut} prefix="₹" icon={ArrowUpRight} color="red" />
        <StatsCard title="Net Balance" value={netBalance} prefix="₹" icon={CreditCard} color="gold" />
      </div>

      <div className="card">
        <div className="filter-bar">
          <SearchBar value={search} onChange={setSearch} placeholder="Search party or ref no..." />
          <select className="form-select" value={typeFilter} onChange={(e) => setTypeFilter(e.target.value)}>
            <option value="ALL">All Payments</option>
            <option value="IN">Received (IN)</option>
            <option value="OUT">Paid (OUT)</option>
          </select>
        </div>
        
        <DataTable
          columns={cols}
          data={filtered}
          loading={loading}
          searchValue={search}
          emptyMessage="No payments found"
          emptyIcon={<CreditCard size={28} />}
        />
      </div>

      <Modal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        title="Record New Payment"
        size="md"
        footer={
          <>
            <button className="btn btn-secondary" onClick={() => setModalOpen(false)}>Cancel</button>
            <button className="btn btn-primary" onClick={handleSave} disabled={saving}>
              {saving ? 'Saving...' : 'Save Payment'}
            </button>
          </>
        }
      >
        <div className="form-grid">
          <div className="form-group">
            <label className="form-label">Type <span className="required">*</span></label>
            <select className="form-select" value={formData.type} onChange={(e) => setFormData({...formData, type: e.target.value})}>
              <option value="IN">Receive (IN)</option>
              <option value="OUT">Pay (OUT)</option>
            </select>
          </div>
          <div className="form-group">
            <label className="form-label">Party Name <span className="required">*</span></label>
            <input className="form-input" value={formData.partyName} onChange={(e) => setFormData({...formData, partyName: e.target.value})} placeholder="Customer or Supplier name" />
          </div>
          <div className="form-group">
            <label className="form-label">Amount (₹) <span className="required">*</span></label>
            <input type="number" className="form-input" value={formData.amount} onChange={(e) => setFormData({...formData, amount: e.target.value})} placeholder="0.00" />
          </div>
          <div className="form-group">
            <label className="form-label">Date</label>
            <input type="date" className="form-input" value={formData.date} onChange={(e) => setFormData({...formData, date: e.target.value})} />
          </div>
          <div className="form-group">
            <label className="form-label">Payment Mode</label>
            <select className="form-select" value={formData.mode} onChange={(e) => setFormData({...formData, mode: e.target.value})}>
              {['CASH', 'BANK_TRANSFER', 'UPI', 'CHEQUE', 'NEFT', 'RTGS'].map(m => (
                <option key={m} value={m}>{m.replace('_', ' ')}</option>
              ))}
            </select>
          </div>
          <div className="form-group">
            <label className="form-label">Reference No</label>
            <input className="form-input" value={formData.reference} onChange={(e) => setFormData({...formData, reference: e.target.value})} placeholder="UTR / Cheque No" />
          </div>
          <div className="form-group" style={{ gridColumn: '1 / -1' }}>
            <label className="form-label">Notes</label>
            <textarea className="form-textarea" value={formData.notes} onChange={(e) => setFormData({...formData, notes: e.target.value})} placeholder="Additional details..." rows={2} />
          </div>
        </div>
      </Modal>
    </div>
  )
}

