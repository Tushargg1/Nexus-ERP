import React, { useState, useEffect } from 'react'
import { DollarSign, FileText, CheckCircle } from 'lucide-react'
import toast from 'react-hot-toast'
import { salariesAPI } from '../api/salaries'
import PageHeader from '../components/common/PageHeader'
import DataTable from '../components/common/DataTable'
import Modal from '../components/common/Modal'
import SearchBar from '../components/common/SearchBar'
import StatsCard from '../components/common/StatsCard'
import Badge from '../components/common/Badge'
import { format, subMonths } from 'date-fns'



export default function SalariesPage() {
  const [salaries, setSalaries] = useState([])
  const [loading, setLoading] = useState(false)
  const [search, setSearch] = useState('')
  const [month, setMonth] = useState(format(subMonths(new Date(), 1), 'yyyy-MM'))
  const [payModal, setPayModal] = useState(false)
  const [selectedSal, setSelectedSal] = useState(null)
  const [payMode, setPayMode] = useState('BANK_TRANSFER')
  const [payRef, setPayRef] = useState('')

  useEffect(() => {
    fetchSalaries()
  }, [month])

  const fetchSalaries = async () => {
    setLoading(true)
    try {
      const res = await salariesAPI.getAll({ month })
      const data = res.data?.data || res.data?.content || res.data;
      setSalaries(Array.isArray(data) ? data : [])
    } catch {
      setSalaries([])
    } finally {
      setLoading(false)
    }
  }

  const filtered = salaries.filter(s => 
    !search || [s.name, s.empCode].some(f => f?.toLowerCase().includes(search.toLowerCase()))
  )

  const totalProcessed = salaries.reduce((s, row) => s + row.netSalary, 0)
  const totalPaid = salaries.filter(s => s.status === 'PAID').reduce((s, row) => s + row.netSalary, 0)
  const totalPending = salaries.filter(s => s.status === 'PENDING').reduce((s, row) => s + row.netSalary, 0)

  const handleProcessSalaries = async () => {
    if (!window.confirm('Generate salaries for ' + month + '?')) return
    try {
      await salariesAPI.generate({ month })
      toast.success('Salaries generated successfully')
      fetchSalaries()
    } catch {
      toast.error('Failed to generate salaries')
    }
  }

  const handleMarkPaid = async () => {
    try {
      await salariesAPI.markPaid(selectedSal.id, { mode: payMode, ref: payRef, date: format(new Date(), 'yyyy-MM-dd') })
      setSalaries(prev => prev.map(s => s.id === selectedSal.id ? { ...s, status: 'PAID', paidDate: format(new Date(), 'yyyy-MM-dd') } : s))
      toast.success('Salary marked as paid')
      setPayModal(false)
    } catch {
      toast.success('Marked as paid (Mock)')
      setSalaries(prev => prev.map(s => s.id === selectedSal.id ? { ...s, status: 'PAID', paidDate: format(new Date(), 'yyyy-MM-dd') } : s))
      setPayModal(false)
    }
  }

  const cols = [
    { key: 'empCode', label: 'Emp Code', primary: true },
    { key: 'name', label: 'Name' },
    { key: 'baseSalary', label: 'Base Salary', render: v => `₹${v.toLocaleString('en-IN')}` },
    { key: 'additions', label: 'OT / Bonus', render: v => <span style={{color: 'var(--success)'}}>+₹{v.toLocaleString('en-IN')}</span> },
    { key: 'deductions', label: 'Deductions', render: v => <span style={{color: 'var(--danger)'}}>-₹{v.toLocaleString('en-IN')}</span> },
    { key: 'netSalary', label: 'Net Payable', render: v => <strong>₹{v.toLocaleString('en-IN')}</strong> },
    { key: 'status', label: 'Status', render: v => <Badge status={v} /> },
  ]

  return (
    <div style={{ animation: 'fadeIn 0.3s ease' }}>
      <PageHeader 
        title="Salaries & Payroll" 
        subtitle="Manage employee salaries, overtime pay, and deductions"
        actions={
          <button className="btn btn-primary" onClick={handleProcessSalaries}>
            <FileText size={16} /> Generate Payroll
          </button>
        }
      />

      <div className="grid-3" style={{ marginBottom: '24px' }}>
        <StatsCard title={`Total Payroll (${month})`} value={totalProcessed} prefix="₹" icon={DollarSign} color="blue" />
        <StatsCard title="Total Paid" value={totalPaid} prefix="₹" icon={CheckCircle} color="green" />
        <StatsCard title="Total Pending" value={totalPending} prefix="₹" icon={DollarSign} color="red" />
      </div>

      <div className="card">
        <div className="filter-bar">
          <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
            <label style={{ fontSize: '0.875rem', fontWeight: 500, color: 'var(--text-secondary)' }}>Month:</label>
            <input 
              type="month" 
              className="form-input" 
              value={month} 
              onChange={(e) => setMonth(e.target.value)} 
            />
          </div>
          <SearchBar value={search} onChange={setSearch} placeholder="Search employee..." />
        </div>
        
        <DataTable
          columns={cols}
          data={filtered}
          loading={loading}
          searchValue={search}
          emptyMessage="No salary records found for this month"
          emptyIcon={<DollarSign size={28} />}
          actions={(row) => (
            row.status === 'PENDING' && (
              <button 
                className="btn btn-ghost btn-sm" 
                onClick={() => { setSelectedSal(row); setPayModal(true) }}
                style={{ color: 'var(--accent-gold)' }}
              >
                Pay Now
              </button>
            )
          )}
        />
      </div>

      <Modal
        isOpen={payModal}
        onClose={() => setPayModal(false)}
        title="Record Salary Payment"
        size="sm"
        footer={
          <>
            <button className="btn btn-secondary" onClick={() => setPayModal(false)}>Cancel</button>
            <button className="btn btn-primary" onClick={handleMarkPaid}>Confirm Payment</button>
          </>
        }
      >
        {selectedSal && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <div style={{ background: 'var(--bg-surface)', padding: '16px', borderRadius: '8px', border: '1px solid var(--border)' }}>
              <div style={{ color: 'var(--text-secondary)', fontSize: '0.875rem', marginBottom: '8px' }}>Paying Salary to:</div>
              <div style={{ fontWeight: 600, fontSize: '1.1rem' }}>{selectedSal.name} ({selectedSal.empCode})</div>
              <div style={{ marginTop: '12px', display: 'flex', justifyContent: 'space-between', borderTop: '1px solid var(--border)', paddingTop: '12px' }}>
                <span>Net Payable:</span>
                <span style={{ fontWeight: 700, color: 'var(--accent-gold)' }}>₹{selectedSal.netSalary.toLocaleString('en-IN')}</span>
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">Payment Mode</label>
              <select className="form-select" value={payMode} onChange={e => setPayMode(e.target.value)}>
                <option value="BANK_TRANSFER">Bank Transfer</option>
                <option value="CASH">Cash</option>
                <option value="CHEQUE">Cheque</option>
                <option value="UPI">UPI</option>
              </select>
            </div>

            <div className="form-group">
              <label className="form-label">Reference / Remarks</label>
              <input className="form-input" value={payRef} onChange={e => setPayRef(e.target.value)} placeholder="Txn ID, Cheque No..." />
            </div>
          </div>
        )}
      </Modal>
    </div>
  )
}

