import React, { useState, useEffect } from 'react'
import { FileText, Download, BarChart2, PieChart, TrendingUp, DollarSign } from 'lucide-react'
import toast from 'react-hot-toast'
import PageHeader from '../components/common/PageHeader'
import StatsCard from '../components/common/StatsCard'
import { format, subMonths } from 'date-fns'

const REPORTS_LIST = [
  { id: 'sales', title: 'Sales Report', desc: 'Detailed view of sales, revenue, and customer stats.', icon: TrendingUp },
  { id: 'purchases', title: 'Purchase Report', desc: 'Summary of supplier purchases and material costs.', icon: DollarSign },
  { id: 'inventory', title: 'Inventory Valuation', desc: 'Current stock value for raw materials and finished goods.', icon: PieChart },
  { id: 'production', title: 'Production Yield', desc: 'Batch statistics and production costs analysis.', icon: BarChart2 },
  { id: 'financial', title: 'Financial Summary', desc: 'Overall P&L, expenses, salaries, and cash flow.', icon: FileText },
]

export default function ReportsPage() {
  const [dateRange, setDateRange] = useState({
    start: format(subMonths(new Date(), 1), 'yyyy-MM-dd'),
    end: format(new Date(), 'yyyy-MM-dd')
  })
  const [downloading, setDownloading] = useState(null)

  const handleDownload = async (reportId) => {
    setDownloading(reportId)
    // Mock download delay
    setTimeout(() => {
      toast.success(`${reportId.toUpperCase()} Report downloaded successfully`)
      setDownloading(null)
    }, 1500)
  }

  return (
    <div style={{ animation: 'fadeIn 0.3s ease' }}>
      <PageHeader 
        title="Reports & Analytics" 
        subtitle="Generate and download business intelligence reports"
      />

      <div className="card" style={{ marginBottom: '24px' }}>
        <div style={{ display: 'flex', gap: '20px', alignItems: 'center' }}>
          <div style={{ fontSize: '0.875rem', fontWeight: 500, color: 'var(--text-secondary)' }}>Global Date Range:</div>
          <input 
            type="date" 
            className="form-input" 
            style={{ width: '150px' }}
            value={dateRange.start}
            onChange={(e) => setDateRange(prev => ({ ...prev, start: e.target.value }))}
          />
          <span style={{ color: 'var(--text-muted)' }}>to</span>
          <input 
            type="date" 
            className="form-input" 
            style={{ width: '150px' }}
            value={dateRange.end}
            onChange={(e) => setDateRange(prev => ({ ...prev, end: e.target.value }))}
          />
        </div>
      </div>

      <div className="grid-3">
        {REPORTS_LIST.map((report) => (
          <div key={report.id} className="card" style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '16px' }}>
              <div style={{ padding: '10px', background: 'var(--bg-surface-hover)', borderRadius: '12px', color: 'var(--accent-gold)' }}>
                <report.icon size={24} />
              </div>
              <h3 style={{ fontSize: '1.1rem', margin: 0 }}>{report.title}</h3>
            </div>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem', flex: 1, marginBottom: '24px' }}>
              {report.desc}
            </p>
            <div style={{ display: 'flex', gap: '12px' }}>
              <button 
                className="btn btn-secondary" 
                style={{ flex: 1, justifyContent: 'center' }}
                onClick={() => toast.success('Preview feature coming soon!')}
              >
                Preview
              </button>
              <button 
                className="btn btn-primary" 
                style={{ flex: 1, justifyContent: 'center' }}
                onClick={() => handleDownload(report.id)}
                disabled={downloading === report.id}
              >
                {downloading === report.id ? 'Exporting...' : <><Download size={16} /> Export CSV</>}
              </button>
            </div>
          </div>
        ))}
      </div>

      <div style={{ marginTop: '40px' }}>
        <h3 className="section-title">Monthly Overview</h3>
        <div className="grid-4">
          <StatsCard title="Gross Sales" value={1450000} prefix="₹" color="green" />
          <StatsCard title="Total Purchases" value={850000} prefix="₹" color="blue" />
          <StatsCard title="Total Expenses" value={120000} prefix="₹" color="red" />
          <StatsCard title="Net Profit" value={480000} prefix="₹" color="gold" />
        </div>
      </div>
    </div>
  )
}

