import React, { useState, useEffect } from 'react'
import { Plus, TrendingUp, CreditCard, Download, Pencil } from 'lucide-react'
import toast from 'react-hot-toast'
import { salesAPI } from '../api/sales'
import { customersAPI } from '../api/customers'
import { productsAPI } from '../api/products'
import PageHeader from '../components/common/PageHeader'
import DataTable from '../components/common/DataTable'
import Modal from '../components/common/Modal'
import SearchBar from '../components/common/SearchBar'
import StatsCard from '../components/common/StatsCard'
import Badge from '../components/common/Badge'
import useAuthStore from '../store/authStore'
import useNotificationStore from '../store/notificationStore'
import { format } from 'date-fns'

const emptyItem = { productId: '', productName: '', quantity: '', rate: '', amount: 0, gstPercent: 5 }

export default function SalesPage() {
  const [sales, setSales] = useState([])
  const [customersList, setCustomersList] = useState([])
  const [productsList, setProductsList] = useState([])
  const [loading, setLoading] = useState(false)
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState('ALL')
  const [modalOpen, setModalOpen] = useState(false)
  const [payModal, setPayModal] = useState(false)
  const [selectedSale, setSelectedSale] = useState(null)
  const [saving, setSaving] = useState(false)
  const [editSale, setEditSale] = useState(null)
  const [editModal, setEditModal] = useState(false)
  
  const user = useAuthStore(s => s.user)
  const notifyEdit = useNotificationStore(s => s.notifyEdit)

  const [customerId, setCustomerId] = useState('')
  const [saleDate, setSaleDate] = useState(format(new Date(), 'yyyy-MM-dd'))
  const [gstType, setGstType] = useState('CGST+SGST')
  const [items, setItems] = useState([{ ...emptyItem }])
  const [notes, setNotes] = useState('')

  const [payAmount, setPayAmount] = useState('')
  const [payMode, setPayMode] = useState('CASH')
  const [payDate, setPayDate] = useState(format(new Date(), 'yyyy-MM-dd'))
  const [payRef, setPayRef] = useState('')

  useEffect(() => {
    const fetch = async () => {
      setLoading(true)
      try {
        const [sRes, cRes, pRes] = await Promise.all([
          salesAPI.getAll(),
          customersAPI.getAll(),
          productsAPI.getAll()
        ])
        const sData = sRes.data?.data || sRes.data?.content || sRes.data;
        const cData = cRes.data?.data || cRes.data?.content || cRes.data;
        const pData = pRes.data?.data || pRes.data?.content || pRes.data;
        setSales(Array.isArray(sData) ? sData : [])
        setCustomersList(Array.isArray(cData) ? cData : [])
        setProductsList(Array.isArray(pData) ? pData : [])
      } catch {
        setSales([])
        setCustomersList([])
        setProductsList([])
      } finally {
        setLoading(false)
      }
    }
    fetch()
  }, [])

  const filtered = sales.filter((s) => {
    const matchStatus = statusFilter === 'ALL' || s.status === statusFilter
    const matchSearch = !search || [s.invoiceNo, s.customerName]
      .some((f) => f?.toLowerCase().includes(search.toLowerCase()))
    return matchStatus && matchSearch
  })

  const totalSales = sales.reduce((s, p) => s + p.totalAmount, 0)
  const totalReceived = sales.reduce((s, p) => s + p.paidAmount, 0)
  const totalPending = sales.reduce((s, p) => s + p.pendingAmount, 0)
  const thisMonth = sales.filter((p) => p.saleDate && p.saleDate.startsWith(format(new Date(), 'yyyy-MM'))).reduce((s, p) => s + p.totalAmount, 0)

  const updateItem = (idx, field, value) => {
    setItems((prev) => {
      const updated = [...prev]
      updated[idx] = { ...updated[idx], [field]: value }
      if (field === 'quantity' || field === 'rate') {
        const amount = (parseFloat(updated[idx].quantity) || 0) * (parseFloat(updated[idx].rate) || 0)
        updated[idx].amount = amount
      }
      return updated
    })
  }

  const subTotal = items.reduce((s, i) => s + (i.amount || 0), 0)
  const totalGst = items.reduce((s, i) => {
      const amt = i.amount || 0;
      const pct = i.gstPercent || 5;
      return s + (amt * pct / 100);
  }, 0)
  const grandTotal = subTotal + totalGst

  const handleCreateSale = async () => {
    if (!customerId) return toast.error('Select customer')
    const validItems = items.filter((i) => i.productId && i.quantity)
    if (validItems.length === 0) return toast.error('Add at least one valid product from the list')
    setSaving(true)
    try {
      const data = { 
        customerId, 
        saleDate, 
        gstType, 
        items: validItems.map(i => ({ productId: i.productId, quantity: i.quantity, rate: i.rate, gstPercent: i.gstPercent })), 
        notes 
      }
      const res = await salesAPI.create(data)
      const newS = res.data?.data || res.data
      setSales((prev) => [newS, ...prev])
      toast.success('Sale invoice created!')
      setModalOpen(false)
      setItems([{ ...emptyItem }])
      setCustomerId('')
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to create sale')
    } finally {
      setSaving(false)
    }
  }

  const handleRecordPayment = async () => {
    if (!payAmount) return toast.error('Enter amount')
    try {
      await salesAPI.recordPayment(selectedSale.id, { amount: Number(payAmount), paymentMode: payMode, transactionRef: payRef })
      const newPaid = selectedSale.paidAmount + Number(payAmount)
      const newPending = selectedSale.totalAmount - newPaid
      setSales((prev) => prev.map((s) => s.id === selectedSale.id ? {
        ...s, paidAmount: newPaid, pendingAmount: Math.max(0, newPending),
        status: newPending <= 0 ? 'PAID' : 'PARTIAL',
      } : s))
      toast.success('Payment recorded!')
      setPayModal(false)
    } catch {
      toast.error('Failed to record payment')
    }
  }

  const cols = [
    { key: 'invoiceNo', label: 'Invoice No', render: (v) => <span style={{ fontFamily: 'monospace', fontWeight: 600, color: 'var(--accent-gold)' }}>{v}</span> },
    { key: 'customerName', label: 'Customer' },
    { key: 'saleDate', label: 'Date' },
    { key: 'gstType', label: 'GST', render: (v) => <span className="badge badge-muted" style={{ fontSize: '0.7rem' }}>{v}</span> },
    { key: 'totalAmount', label: 'Total', render: (v) => <strong>₹{v?.toLocaleString('en-IN')}</strong> },
    { key: 'paidAmount', label: 'Received', render: (v) => <span style={{ color: 'var(--success)' }}>₹{v?.toLocaleString('en-IN')}</span> },
    { key: 'pendingAmount', label: 'Pending', render: (v) => <span style={{ color: v > 0 ? 'var(--danger)' : 'var(--text-muted)' }}>₹{v?.toLocaleString('en-IN')}</span> },
    { key: 'status', label: 'Status', noSort: true, render: (v) => <Badge status={v} /> },
  ]

  return (
    <div style={{ animation: 'fadeIn 0.3s ease' }}>
      <PageHeader
        title="Sales"
        subtitle="Manage sales invoices and customer payments"
        actions={
          <button className="btn btn-primary" onClick={() => setModalOpen(true)}>
            <Plus size={16} /> New Sale
          </button>
        }
      />

      <div className="grid-4" style={{ marginBottom: '24px' }}>
        <StatsCard title="Total Sales" value={totalSales} prefix="₹" icon={TrendingUp} color="green" />
        <StatsCard title="Received" value={totalReceived} prefix="₹" icon={TrendingUp} color="blue" />
        <StatsCard title="Pending" value={totalPending} prefix="₹" icon={TrendingUp} color="red" />
        <StatsCard title="This Month" value={thisMonth} prefix="₹" icon={TrendingUp} color="gold" />
      </div>

      <div className="card">
        <div className="filter-bar">
          <SearchBar value={search} onChange={setSearch} placeholder="Search invoice, customer..." />
          <select className="form-select" value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
            {['ALL', 'PENDING', 'PARTIAL', 'PAID'].map((s) => <option key={s} value={s}>{s}</option>)}
          </select>
        </div>
        <DataTable
          columns={cols}
          data={filtered}
          loading={loading}
          searchValue={search}
          emptyMessage="No sales found"
          emptyIcon={<TrendingUp size={28} />}
          actions={(row) => (
            <div style={{ display: 'flex', gap: '4px' }}>
              <button
                className="btn btn-ghost btn-sm btn-icon"
                onClick={() => { setEditSale({...row}); setEditModal(true) }}
                style={{ color: 'var(--text-muted)' }}
                title="Edit"
              >
                <Pencil size={14} />
              </button>
              {row.status !== 'PAID' && (
                <button
                  className="btn btn-ghost btn-sm"
                  onClick={() => { setSelectedSale(row); setPayAmount(row.pendingAmount); setPayModal(true) }}
                  style={{ color: 'var(--accent-gold)', fontSize: '0.75rem', gap: '4px' }}
                >
                  <CreditCard size={13} /> Collect
                </button>
              )}
              <button className="btn btn-ghost btn-sm btn-icon" title="Download Invoice" style={{ color: 'var(--accent-blue)' }} onClick={() => {
                  window.open(`http://localhost:8080/api/v1/sale/${row.id}/invoice`, '_blank');
              }}>
                <Download size={14} />
              </button>
            </div>
          )}
        />
      </div>

      {/* New Sale Modal */}
      <Modal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        title="New Sales Invoice"
        size="xl"
        footer={
          <>
            <button className="btn btn-secondary" onClick={() => setModalOpen(false)}>Cancel</button>
            <button className="btn btn-primary" onClick={handleCreateSale} disabled={saving}>
              {saving ? 'Creating...' : 'Create Invoice'}
            </button>
          </>
        }
      >
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          <div className="form-grid">
            <div className="form-group">
              <label className="form-label">Customer <span className="required">*</span></label>
              <select className="form-select" value={customerId} onChange={(e) => setCustomerId(e.target.value)}>
                <option value="">Select customer...</option>
                {customersList.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
              </select>
            </div>
            <div className="form-group">
              <label className="form-label">Date</label>
              <input type="date" className="form-input" value={saleDate} onChange={(e) => setSaleDate(e.target.value)} />
            </div>
            <div className="form-group">
              <label className="form-label">GST Type</label>
              <select className="form-select" value={gstType} onChange={(e) => setGstType(e.target.value)}>
                <option value="CGST+SGST">CGST + SGST (Intra-state)</option>
                <option value="IGST">IGST (Inter-state)</option>
                <option value="NO_GST">No GST (Exempt)</option>
              </select>
            </div>
          </div>

          <div>
            <div className="section-title">Sale Items</div>
            <table className="invoice-table">
              <thead>
                <tr>
                  <th>Product</th>
                  <th>Qty</th>
                  <th>Rate (₹)</th>
                  <th>Amount (₹)</th>
                  <th>GST (%)</th>
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
                        value={item.productId}
                        onChange={(e) => {
                          const prodId = e.target.value;
                          const prod = productsList.find(p => p.id === Number(prodId));
                          updateItem(idx, 'productId', prodId);
                          if (prod) {
                             updateItem(idx, 'productName', prod.name);
                             if (prod.sellingPrice) updateItem(idx, 'rate', prod.sellingPrice);
                          }
                        }}
                      >
                         <option value="">Select Product</option>
                         {productsList.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
                      </select>
                    </td>
                    <td>
                      <input type="number" className="form-input" style={{ padding: '6px 10px', width: '80px' }}
                        value={item.quantity} onChange={(e) => updateItem(idx, 'quantity', e.target.value)} placeholder="0" />
                    </td>
                    <td>
                      <input type="number" step="0.01" className="form-input" style={{ padding: '6px 10px', width: '100px' }}
                        value={item.rate} onChange={(e) => updateItem(idx, 'rate', e.target.value)} placeholder="0.00" />
                    </td>
                    <td style={{ color: 'var(--text-primary)', fontWeight: 600 }}>₹{(item.amount || 0).toFixed(2)}</td>
                    <td>
                      <input type="number" step="0.1" className="form-input" style={{ padding: '6px 10px', width: '70px', color: 'var(--accent-gold)' }}
                        value={item.gstPercent} onChange={(e) => updateItem(idx, 'gstPercent', e.target.value)} placeholder="5" />
                    </td>
                    <td>
                      {items.length > 1 && (
                        <button className="btn btn-danger btn-sm btn-icon" onClick={() => setItems((p) => p.filter((_, i) => i !== idx))}>×</button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            <button className="btn btn-secondary btn-sm" onClick={() => setItems((p) => [...p, { ...emptyItem }])}>
              + Add Item
            </button>
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
            <div style={{ minWidth: '300px' }}>
              <div className="invoice-total">
                <div className="invoice-total-row"><span>Subtotal:</span><span>₹{subTotal.toFixed(2)}</span></div>
                <div className="invoice-total-row"><span>GST:</span><span>₹{totalGst.toFixed(2)}</span></div>
                <div className="invoice-total-row grand-total">
                  <span>Grand Total:</span>
                  <span>₹{grandTotal.toFixed(2)}</span>
                </div>
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
        title={`Record Payment — ${selectedSale?.invoiceNo}`}
        size="sm"
        footer={
          <>
            <button className="btn btn-secondary" onClick={() => setPayModal(false)}>Cancel</button>
            <button className="btn btn-primary" onClick={handleRecordPayment}>Record Payment</button>
          </>
        }
      >
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {selectedSale && (
            <div style={{ display: 'flex', gap: '12px' }}>
              <div style={{ flex: 1, background: 'var(--bg-surface)', borderRadius: 'var(--radius-sm)', padding: '10px 14px', border: '1px solid var(--border)' }}>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Customer</div>
                <div style={{ fontWeight: 600 }}>{selectedSale.customerName}</div>
              </div>
              <div style={{ flex: 1, background: 'var(--bg-surface)', borderRadius: 'var(--radius-sm)', padding: '10px 14px', border: '1px solid var(--border)' }}>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Pending</div>
                <div style={{ fontWeight: 700, color: 'var(--danger)' }}>₹{selectedSale.pendingAmount?.toLocaleString('en-IN')}</div>
              </div>
            </div>
          )}
          <div className="form-group">
            <label className="form-label">Amount (₹) <span className="required">*</span></label>
            <input type="number" className="form-input" value={payAmount} onChange={(e) => setPayAmount(e.target.value)} />
          </div>
          <div className="form-group">
            <label className="form-label">Payment Mode</label>
            <select className="form-select" value={payMode} onChange={(e) => setPayMode(e.target.value)}>
              {['CASH', 'BANK_TRANSFER', 'UPI', 'CHEQUE'].map((m) => (
                <option key={m} value={m}>{m.replace('_', ' ')}</option>
              ))}
            </select>
          </div>
          <div className="form-group">
            <label className="form-label">Date</label>
            <input type="date" className="form-input" value={payDate} onChange={(e) => setPayDate(e.target.value)} />
          </div>
          <div className="form-group">
            <label className="form-label">Transaction Ref</label>
            <input type="text" className="form-input" value={payRef} onChange={(e) => setPayRef(e.target.value)} placeholder="UPI ID / Cheque No" />
          </div>
        </div>
      </Modal>
      
      {/* Edit Sale Modal */}
      <Modal
        isOpen={editModal}
        onClose={() => { setEditModal(false); setEditSale(null) }}
        title={`Edit Sale — ${editSale?.invoiceNo}`}
        size="sm"
        footer={
          <>
            <button className="btn btn-secondary" onClick={() => { setEditModal(false); setEditSale(null) }}>Cancel</button>
            <button className="btn btn-primary" onClick={() => {
              const editorName = user?.name || 'Unknown'
              const previousModifier = editSale.lastModifiedBy || 'Owner'
              const updated = { ...editSale, lastModifiedBy: editorName }
              setSales(prev => prev.map(s => s.id === updated.id ? updated : s))
              notifyEdit('Sales', updated.invoiceNo, editorName, previousModifier)
              toast.success('Sale updated')
              setEditModal(false)
              setEditSale(null)
            }}>Save Changes</button>
          </>
        }
      >
        {editSale && (
          <div className="form-grid">
            <div className="form-group" style={{ gridColumn: '1 / -1' }}>
              <label className="form-label">Customer</label>
              <select className="form-select" value={editSale.customerId} onChange={e => setEditSale({...editSale, customerId: e.target.value})}>
                <option value="">Select customer...</option>
                {customersList.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
              </select>
            </div>
            <div className="form-group">
              <label className="form-label">Date</label>
              <input type="date" className="form-input" value={editSale.saleDate} onChange={e => setEditSale({...editSale, saleDate: e.target.value})} />
            </div>
            <div className="form-group">
              <label className="form-label">GST Type</label>
              <select className="form-select" value={editSale.gstType} onChange={e => setEditSale({...editSale, gstType: e.target.value})}>
                {['CGST+SGST', 'IGST', 'NO_GST'].map(g => <option key={g} value={g}>{g}</option>)}
              </select>
            </div>
          </div>
        )}
      </Modal>
    </div>
  )
}
