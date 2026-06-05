import React, { useEffect, useState } from 'react'
import {
  LineChart, Line, BarChart, Bar, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
} from 'recharts'
import {
  TrendingUp, TrendingDown, ShoppingCart, DollarSign,
  AlertTriangle, Package, Clock, ArrowRight,
} from 'lucide-react'
import toast from 'react-hot-toast'
import { dashboardAPI } from '../api/dashboard'
import StatsCard from '../components/common/StatsCard'
import Badge from '../components/common/Badge'

const MOCK_EXPENSE_PIE = [];
const MOCK_LOW_STOCK = [];
const MOCK_PENDING_PAYMENTS = [];
const MOCK_RECENT = [];





const MOCK_STATS = {
  todaySales: 0,
  todayPurchases: 0,
  pendingPayable: 0,
  pendingReceivable: 0,
  monthlyProfit: 0,
  lowStockCount: 0,
}







const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    return (
      <div style={{
        background: 'var(--bg-elevated)',
        border: '1px solid var(--border)',
        borderRadius: 'var(--radius-sm)',
        padding: '12px 16px',
        boxShadow: 'var(--shadow-lg)',
      }}>
        <p style={{ color: 'var(--text-primary)', fontWeight: 600, marginBottom: '8px' }}>{label}</p>
        {payload.map((entry, i) => (
          <p key={i} style={{ color: entry.color, fontSize: '0.8125rem', margin: '2px 0' }}>
            {entry.name}: ₹{(entry.value / 1000).toFixed(0)}K
          </p>
        ))}
      </div>
    )
  }
  return null
}

export default function DashboardPage() {
  const [stats, setStats] = useState({
    todaySales: 0,
    todayPurchases: 0,
    pendingPayable: 0,
    pendingReceivable: 0,
    monthlyProfit: 0,
    lowStockCount: 0,
  })
  const [chartData] = useState([])
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await dashboardAPI.getStats()
        setStats(res.data)
      } catch {
        // use mock data
      }
    }
    fetchData()
  }, [])

  const formatAmount = (v) => `₹${(v / 1000).toFixed(1)}K`

  return (
    <div style={{ animation: 'fadeIn 0.3s ease' }}>
      {/* Stats Row 1 */}
      <div className="grid-4" style={{ marginBottom: '20px' }}>
        <StatsCard
          title="Today's Sales"
          value={stats.todaySales}
          prefix="₹"
          icon={TrendingUp}
          color="green"
          trend="up"
          trendValue="+12.5%"
          subtitle="vs yesterday"
        />
        <StatsCard
          title="Today's Purchases"
          value={stats.todayPurchases}
          prefix="₹"
          icon={ShoppingCart}
          color="blue"
          trend="down"
          trendValue="-3.2%"
          subtitle="vs yesterday"
        />
        <StatsCard
          title="Pending Payable"
          value={stats.pendingPayable}
          prefix="₹"
          icon={TrendingDown}
          color="red"
          trend="neutral"
          subtitle="Outstanding to suppliers"
        />
        <StatsCard
          title="Pending Receivable"
          value={stats.pendingReceivable}
          prefix="₹"
          icon={DollarSign}
          color="gold"
          trend="neutral"
          subtitle="Outstanding from customers"
        />
      </div>

      {/* Stats Row 2 */}
      <div className="grid-2" style={{ marginBottom: '24px' }}>
        <StatsCard
          title="Monthly Profit"
          value={stats.monthlyProfit}
          prefix="₹"
          icon={TrendingUp}
          color="green"
          trend="up"
          trendValue="+8.3%"
          subtitle="May 2025"
        />
        <StatsCard
          title="Low Stock Alerts"
          value={stats.lowStockCount}
          suffix=" items"
          icon={AlertTriangle}
          color="red"
          subtitle="Items below reorder level"
        />
      </div>

      {/* Charts Row */}
      <div className="grid-2" style={{ marginBottom: '24px' }}>
        {/* Sales vs Purchases LineChart */}
        <div className="card">
          <div className="card-header">
            <div>
              <div className="card-title">Sales vs Purchases</div>
              <div className="card-subtitle">Last 12 months trend</div>
            </div>
          </div>
          <div className="card-body" style={{ padding: '16px 8px 8px' }}>
            <ResponsiveContainer width="100%" height={260}>
              <LineChart data={chartData} margin={{ top: 5, right: 20, left: 0, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                <XAxis dataKey="month" tick={{ fill: '#64748b', fontSize: 12 }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fill: '#64748b', fontSize: 11 }} axisLine={false} tickLine={false} tickFormatter={(v) => `${v / 1000}K`} />
                <Tooltip content={<CustomTooltip />} />
                <Legend
                  wrapperStyle={{ color: 'var(--text-muted)', fontSize: '0.8125rem', paddingTop: '8px' }}
                />
                <Line type="monotone" dataKey="sales" stroke="#10b981" strokeWidth={2.5} dot={false} name="Sales" />
                <Line type="monotone" dataKey="purchases" stroke="#3b82f6" strokeWidth={2.5} dot={false} name="Purchases" />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Expense Pie */}
        <div className="card">
          <div className="card-header">
            <div>
              <div className="card-title">Expense Breakdown</div>
              <div className="card-subtitle">Current month by category</div>
            </div>
          </div>
          <div className="card-body" style={{ padding: '16px 8px 8px' }}>
            <ResponsiveContainer width="100%" height={260}>
              <PieChart>
                <Pie
                  data={MOCK_EXPENSE_PIE}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={90}
                  paddingAngle={3}
                  dataKey="value"
                >
                  {MOCK_EXPENSE_PIE.map((entry, index) => (
                    <Cell key={index} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip
                  formatter={(value) => [`${value}%`, '']}
                  contentStyle={{
                    background: 'var(--bg-elevated)',
                    border: '1px solid var(--border)',
                    borderRadius: '8px',
                    color: 'var(--text-primary)',
                  }}
                />
                <Legend
                  wrapperStyle={{ color: 'var(--text-muted)', fontSize: '0.8125rem' }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Monthly Profit Bar Chart */}
      <div className="card" style={{ marginBottom: '24px' }}>
        <div className="card-header">
          <div>
            <div className="card-title">Monthly Profit Trend</div>
            <div className="card-subtitle">Last 12 months</div>
          </div>
        </div>
        <div className="card-body" style={{ padding: '16px 8px 8px' }}>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={chartData} margin={{ top: 5, right: 20, left: 0, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
              <XAxis dataKey="month" tick={{ fill: '#64748b', fontSize: 12 }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fill: '#64748b', fontSize: 11 }} axisLine={false} tickLine={false} tickFormatter={(v) => `${v / 1000}K`} />
              <Tooltip content={<CustomTooltip />} />
              <Bar dataKey="profit" name="Profit" fill="#f59e0b" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Bottom Row: Alerts + Recent Transactions */}
      <div className="grid-2">
        {/* Alerts */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {/* Low Stock */}
          <div className="card">
            <div className="card-header">
              <div className="card-title" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Package size={18} color="var(--danger)" />
                Low Stock Items
              </div>
              <span className="badge badge-danger">{MOCK_LOW_STOCK.length}</span>
            </div>
            <div style={{ padding: '12px 0' }}>
              {MOCK_LOW_STOCK.map((item, i) => (
                <div
                  key={i}
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    padding: '10px 24px',
                    borderBottom: i < MOCK_LOW_STOCK.length - 1 ? '1px solid var(--border)' : 'none',
                  }}
                >
                  <div>
                    <div style={{ fontSize: '0.875rem', fontWeight: 600, color: 'var(--text-primary)' }}>
                      {item.name}
                    </div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '2px' }}>
                      Reorder at {item.reorderLevel} {item.unit}
                    </div>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <div style={{ fontSize: '0.9375rem', fontWeight: 700, color: 'var(--danger)' }}>
                      {item.quantity} {item.unit}
                    </div>
                    <div style={{ fontSize: '0.6875rem', color: 'var(--text-muted)' }}>remaining</div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Pending payments */}
          <div className="card">
            <div className="card-header">
              <div className="card-title" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Clock size={18} color="var(--warning)" />
                Pending Payments
              </div>
            </div>
            <div style={{ padding: '12px 0' }}>
              {MOCK_PENDING_PAYMENTS.map((p, i) => (
                <div
                  key={i}
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    padding: '10px 24px',
                    borderBottom: i < MOCK_PENDING_PAYMENTS.length - 1 ? '1px solid var(--border)' : 'none',
                  }}
                >
                  <div>
                    <div style={{ fontSize: '0.875rem', fontWeight: 600, color: 'var(--text-primary)' }}>
                      {p.party}
                    </div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '2px' }}>
                      Due {p.days} days ago
                    </div>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <div style={{
                      fontSize: '0.9375rem',
                      fontWeight: 700,
                      color: p.type === 'Payable' ? 'var(--danger)' : 'var(--success)',
                    }}>
                      ₹{(p.amount / 1000).toFixed(0)}K
                    </div>
                    <div style={{ fontSize: '0.6875rem', color: 'var(--text-muted)' }}>{p.type}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Recent transactions */}
        <div className="card">
          <div className="card-header">
            <div className="card-title">Recent Transactions</div>
            <span style={{ fontSize: '0.75rem', color: 'var(--accent-gold)', cursor: 'pointer' }}>
              View All <ArrowRight size={12} style={{ display: 'inline' }} />
            </span>
          </div>
          <div>
            {MOCK_RECENT.map((tx, i) => (
              <div
                key={i}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '14px',
                  padding: '14px 24px',
                  borderBottom: i < MOCK_RECENT.length - 1 ? '1px solid var(--border)' : 'none',
                  transition: 'background 0.15s ease',
                }}
                onMouseEnter={(e) => e.currentTarget.style.background = 'var(--bg-elevated)'}
                onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
              >
                <div style={{
                  width: '36px',
                  height: '36px',
                  borderRadius: '8px',
                  background: tx.type === 'Sale' ? 'rgba(16,185,129,0.12)' : 'rgba(59,130,246,0.12)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexShrink: 0,
                }}>
                  {tx.type === 'Sale'
                    ? <TrendingUp size={16} color="var(--success)" />
                    : <ShoppingCart size={16} color="var(--accent-blue)" />
                  }
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: '0.875rem', fontWeight: 600, color: 'var(--text-primary)', truncate: true }}>
                    {tx.party}
                  </div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                    {tx.ref} · {tx.date}
                  </div>
                </div>
                <div style={{ textAlign: 'right', flexShrink: 0 }}>
                  <div style={{
                    fontSize: '0.9375rem',
                    fontWeight: 700,
                    color: tx.type === 'Sale' ? 'var(--success)' : 'var(--text-primary)',
                    marginBottom: '4px',
                  }}>
                    {tx.type === 'Sale' ? '+' : '-'}₹{(tx.amount / 1000).toFixed(1)}K
                  </div>
                  <Badge status={tx.status} />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}

