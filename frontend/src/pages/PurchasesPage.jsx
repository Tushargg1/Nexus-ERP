import React, { useState, useEffect } from 'react'
import { Plus, ShoppingCart, FileText, CreditCard, Pencil } from 'lucide-react'
import toast from 'react-hot-toast'
import { purchasesAPI } from '../api/purchases'
import { suppliersAPI } from '../api/suppliers'
import { rawMaterialsAPI } from '../api/rawMaterials'
import PageHeader from '../components/common/PageHeader'
import DataTable from '../components/common/DataTable'
import Modal from '../components/common/Modal'
import SearchBar from '../components/common/SearchBar'
import StatsCard from '../components/common/StatsCard'
import Badge from '../components/common/Badge'
import useAuthStore from '../store/authStore'
import useNotificationStore from '../store/notificationStore'
import { format } from 'date-fns'

const emptyItem = { rawMaterialId: '', materialName: '', quantity: '', rate: '', amount: 0 }

export default function PurchasesPage() {
  const [purchases, setPurchases] = useState([])
  const [suppliersList, setSuppliersList] = useState([])
  const [materialsList, setMaterialsList] = useState([])
  const [loading, setLoading] = useState(false)
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState('ALL')
  const [modalOpen, setModalOpen] = useState(false)
  const [payModal, setPayModal] = useState(false)
  const [selectedPurchase, setSelectedPurchase] = useState(null)
  const [saving, setSaving] = useState(false)
  
  const user = useAuthStore(s => s.user)
  const notifyEdit = useNotificationStore(s => s.notifyEdit)

  // New purchase form state
  const [supplierId, setSupplierId] = useState('')
  const [purchaseDate, setPurchaseDate] = useState(format(new Date(), 'yyyy-MM-dd'))
  const [items, setItems] = useState([{ ...emptyItem }])
  const [gstAmount, setGstAmount] = useState(0)
  const [notes, setNotes] = useState('')

  // Payment form
  const [payAmount, setPayAmount] = useState('')
  const [payMode, setPayMode] = useState('CASH')
  const [payDate, setPayDate] = useState(format(new Date(), 'yyyy-MM-dd'))
  const [payRef, setPayRef] = useState('')

  useEffect(() => {
    const fetch = async () => {
      setLoading(true)
      try {
        const [pRes, sRes, mRes] = await Promise.all([
          purchasesAPI.getAll(),
          suppliersAPI.getAll(),
          rawMaterialsAPI.getAll()
        ])
        const pData = pRes.data?.data || pRes.data?.content || pRes.data;
        const sData = sRes.data?.data || sRes.data?.content || sRes.data;
        const mData = mRes.data?.data || mRes.data?.content || mRes.data;
        setPurchases(Array.isArray(pData) ? pData : [])
        setSuppliersList(Array.isArray(sData) ? sData : [])
        setMaterialsList(Array.isArray(mData) ? mData : [])
      } catch {
        setPurchases([])
        setSuppliersList([])
        setMaterialsList([])
      } finally {
        setLoading(false)
      }
    }
    fetch()
  }, [])

  const filtered = purchases.filter((p) => {
    const matchStatus = statusFilter === 'ALL' || p.status === statusFilter
    const matchSearch = !search || [p.invoiceNo, p.supplierName]
      .some((f) => f?.toLowerCase().includes(search.toLowerCase()))
    return matchStatus && matchSearch
  })

  const totalPurchases = purchases.reduce((s, p) => s + p.totalAmount, 0)
  const totalPaid = purchases.reduce((s, p) => s + p.paidAmount, 0)
  const totalPending = purchases.reduce((s, p) => s + p.pendingAmount, 0)
  const thisMonth = purchases.filter((p) => p.purchaseDate && p.purchaseDate.startsWith(format(new Date(), 'yyyy-MM'))).reduce((s, p) => s + p.totalAmount, 0)

  const updateItem = (idx, field, value) => {
    setItems((prev) => {
      const updated = [...prev]
      updated[idx] = { ...updated[idx], [field]: value }
      if (field === 'quantity' || field === 'rate') {
        updated[idx].amount = (parseFloat(updated[idx].quantity) || 0) * (parseFloat(updated[idx].rate) || 0)
      }
      return updated
    })
  }

  const subTotal = items.reduce((s, i) => s + (i.amount || 0), 0)
  const grandTotal = subTotal + parseFloat(gstAmount || 0)

  const handleCreatePurchase = async () => {
    if (!supplierId) return toast.error('Select supplier')
    const validItems = items.filter(i => i.rawMaterialId && i.quantity)
    if (validItems.length === 0) return toast.error('Add at least one item from the list')
    setSaving(true)
    try {
      const data = { 
        supplierId, 
        purchaseDate, 
        items: validItems.map(i => ({ rawMaterialId: i.rawMaterialId, quantity: i.quantity, rate: i.rate })), 
        gstAmount, 
        notes 
      }
      const res = await purchasesAPI.create(data)
      const newP = res.data?.data || res.data
      setPurchases((prev) => [newP, ...prev])
      toast.success('Purchase created successfully')
      setModalOpen(false)
      setItems([{ ...emptyItem }])
      setSupplierId('')
      setNotes('')
      setGstAmount(0)
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to create purchase')
    } finally {
      setSaving(false)
    }
  }

  const handleRecordPayment = async () => {
    if (!payAmount) return toast.error('Enter payment amount')
    try {
      await purchasesAPI.recordPayment(selectedPurchase.id, {
        amount: Number(payAmount), paymentMode: payMode, transactionRef: payRef,
      })
      
      const newPaid = selectedPurchase.paidAmount + Number(payAmount)
      const newPending = selectedPurchase.totalAmount - newPaid
      setPurchases((prev) => prev.map((p) => p.id === selectedPurchase.id ? {
        ...p,
        paidAmount: newPaid,
        pendingAmount: Math.max(0, newPending),
        status: newPending <= 0 ? 'PAID' : 'PARTIAL',
      } : p))
      toast.success('Payment recorded')
      setPayModal(false)
    } catch {
      toast.error('Failed to record payment')
    }
  }

  const cols = [
    { key: 'invoiceNo', label: 'Invoice No', primary: true, render: (v) => <span style={{ fontFamily: 'monospace', fontWeight: 600, color: 'var(--accent-gold)' }}>{v}</span> },
    { key: 'supplierName', label: 'Supplier' },
    { key: 'purchaseDate', label: 'Date' },
    { key: 'totalAmount', label: 'Total', render: (v) => <strong>₹{v?.toLocaleString('en-IN')}</strong> },
    { key: 'paidAmount', label: 'Paid', render: (v) => <span style={{ color: 'var(--success)' }}>₹{v?.toLocaleString('en-IN')}</span> },
    { key: 'pendingAmount', label: 'Pending', render: (v) => <span style={{ color: v > 0 ? 'var(--danger)' : 'var(--text-muted)' }}>₹{v?.toLocaleString('en-IN')}</span> },
    { key: 'status', label: 'Status', noSort: true, render: (v) => <Badge status={v} /> },
  ]

  return (
    <div style={{ animation: 'fadeIn 0.3s ease' }}>
      <PageHeader
        title="Purchases"
        subtitle="Manage purchase invoices and supplier payments"
        actions={
          <button className="btn btn-primary" onClick={() => setModalOpen(true)}>
            <Plus size={16} /> New Purchase
          </button>
        }
      />

      <div className="grid-4" style={{ marginBottom: '24px' }}>
        <StatsCard title="Total Purchases" value={totalPurchases} prefix="₹" icon={ShoppingCart} color="blue" />
        <StatsCard title="Total Paid" value={totalPaid} prefix="₹" icon={ShoppingCart} color="green" />
        <StatsCard title="Total Pending" value={totalPending} prefix="₹" icon={ShoppingCart} color="red" />
        <StatsCard title="This Month" value={thisMonth} prefix="₹" icon={ShoppingCart} color="gold" />
      </div>

      <div className="card">
        <div className="filter-bar">
          <SearchBar value={search} onChange={setSearch} placeholder="Search invoice, supplier..." />
          <select className="form-select" value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
            {['ALL', 'PENDING', 'PARTIAL', 'PAID'].map((s) => (
              <option key={s} value={s}>{s}</option>
            ))}
          </select>
        </div>
        <DataTable
          columns={cols}
          data={filtered}
          loading={loading}
          searchValue={search}
          emptyMessage="No purchases found"
          emptyIcon={<ShoppingCart size={28} />}
          actions={(row) => (
            <div style={{ display: 'flex', gap: '6px', alignItems: 'center', justifyContent: 'flex-end' }}>
              {row.status !== 'PAID' && (
                <button
                  className="btn btn-ghost btn-sm"
                  onClick={() => { setSelectedPurchase(row); setPayAmount(row.pendingAmount); setPayModal(true) }}
                  style={{ color: 'var(--accent-gold)', fontSize: '0.75rem', gap: '4px' }}
                >
                  <CreditCard size={13} /> Pay
                </button>
              )}
            </div>
          )}
        />
      </div>

      {/* New Purchase Modal */}
      <Modal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        title="New Purchase Order"
        size="xl"
        footer={
          <>
            <button className="btn btn-secondary" onClick={() => setModalOpen(false)}>Cancel</button>
            <button className="btn btn-primary" onClick={handleCreatePurchase} disabled={saving}>
              {saving ? 'Creating...' : 'Create Purchase'}
            </button>
          </>
        }
      >
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          <div className="form-grid">
            <div className="form-group">
              <label className="form-label">Supplier <span className="required">*</span></label>
              <select className="form-select" value={supplierId} onChange={(e) => setSupplierId(e.target.value)}>
                <option value="">Select supplier...</option>
                {suppliersList.map((s) => <option key={s.id} value={s.id}>{s.name}</option>)}
              </select>
            </div>
            <div className="form-group">
              <label className="form-label">Purchase Date</label>
              <input type="date" className="form-input" value={purchaseDate} onChange={(e) => setPurchaseDate(e.target.value)} />
            </div>
          </div>

          <div>
            <div className="section-title">Purchase Items</div>
            <table className="invoice-table">
              <thead>
                <tr>
                  <th>Material</th>
                  <th>Quantity</th>
                  <th>Rate (₹)</th>
                  <th>Amount (₹)</th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                {items.map((item, idx) => (
                  <tr key={idx}>
                    <td>
                      <select
                        className="form-select"
                        style={{ padding: '6px 10px' }}
                        value={item.rawMaterialId}
                        onChange={(e) => {
                           const matId = e.target.value;
                           const mat = materialsList.find(m => m.id === Number(matId))
                           updateItem(idx, 'rawMaterialId', matId);
                           if (mat) {
                               updateItem(idx, 'materialName', mat.name);
                               if (mat.price) updateItem(idx, 'rate', mat.price);
                           }
                        }}
                      >
                         <option value="">Select Material</option>
                         {materialsList.map(m => <option key={m.id} value={m.id}>{m.name}</option>)}
                      </select>
                    </td>
                    <td>
                      <input type="number" className="form-input" style={{ padding: '6px 10px', width: '100px' }}
                        value={item.quantity} onChange={(e) => updateItem(idx, 'quantity', e.target.value)} placeholder="0" />
                    </td>
                    <td>
                      <input type="number" step="0.01" className="form-input" style={{ padding: '6px 10px', width: '100px' }}
                        value={item.rate} onChange={(e) => updateItem(idx, 'rate', e.target.value)} placeholder="0.00" />
                    </td>
                    <td style={{ fontWeight: 600, color: 'var(--text-primary)' }}>
                      ₹{item.amount?.toLocaleString('en-IN') || 0}
                    </td>
                    <td>
                      {items.length > 1 && (
                        <button className="btn btn-ghost btn-sm btn-icon" style={{ color: 'var(--danger)' }}
                          onClick={() => setItems(items.filter((_, i) => i !== idx))}>
                          ×
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            <button
              className="btn btn-secondary btn-sm"
              onClick={() => setItems([...items, { ...emptyItem }])}
              style={{ marginTop: '12px' }}
            >
              <Plus size={14} /> Add Line Item
            </button>
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '16px' }}>
            <div style={{ width: '300px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--text-secondary)' }}>
                <span>Subtotal</span>
                <span>₹{subTotal.toLocaleString('en-IN')}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ color: 'var(--text-secondary)' }}>GST Amount (₹)</span>
                <input
                  type="number"
                  className="form-input"
                  style={{ width: '120px', textAlign: 'right' }}
                  value={gstAmount}
                  onChange={(e) => setGstAmount(e.target.value)}
                />
              </div>
              <div style={{ height: '1px', background: 'var(--border)' }} />
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '1.125rem', fontWeight: 700, color: 'var(--accent-gold)' }}>
                <span>Grand Total</span>
                <span>₹{grandTotal.toLocaleString('en-IN')}</span>
              </div>
            </div>
          </div>
          
          <div className="form-group">
            <label className="form-label">Notes</label>
            <textarea className="form-input" value={notes} onChange={(e) => setNotes(e.target.value)} placeholder="Add any notes..." rows={2} />
          </div>
        </div>
      </Modal>

      {/* Payment Modal */}
      <Modal
        isOpen={payModal}
        onClose={() => setPayModal(false)}
        title="Record Payment"
        footer={
          <>
            <button className="btn btn-secondary" onClick={() => setPayModal(false)}>Cancel</button>
            <button className="btn btn-primary" onClick={handleRecordPayment}>Confirm Payment</button>
          </>
        }
      >
        {selectedPurchase && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <div style={{ padding: '16px', background: 'var(--bg-surface)', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border)' }}>
              <div style={{ fontSize: '0.875rem', color: 'var(--text-muted)' }}>Pending Amount</div>
              <div style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--danger)', marginTop: '4px' }}>
                ₹{selectedPurchase.pendingAmount.toLocaleString('en-IN')}
              </div>
            </div>
            <div className="form-group">
              <label className="form-label">Payment Amount</label>
              <input type="number" className="form-input" value={payAmount} onChange={(e) => setPayAmount(e.target.value)} max={selectedPurchase.pendingAmount} />
            </div>
            <div className="form-grid">
              <div className="form-group">
                <label className="form-label">Payment Mode</label>
                <select className="form-select" value={payMode} onChange={(e) => setPayMode(e.target.value)}>
                  <option value="CASH">Cash</option>
                  <option value="BANK_TRANSFER">Bank Transfer</option>
                  <option value="UPI">UPI</option>
                  <option value="CHEQUE">Cheque</option>
                </select>
              </div>
              <div className="form-group">
                <label className="form-label">Transaction Ref</label>
                <input type="text" className="form-input" value={payRef} onChange={(e) => setPayRef(e.target.value)} placeholder="UPI ID / Cheque No" />
              </div>
            </div>
          </div>
        )}
      </Modal>
    </div>
  )
}