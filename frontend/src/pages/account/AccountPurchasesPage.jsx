import React from 'react'
import { ShoppingBag } from 'lucide-react'

const PURCHASES = [
  { id: 1, name: 'Nexus ERP - Professional', date: '2026-05-15', amount: '$129.00', method: 'Credit Card', status: 'active', invoice: '#INV-2026-0042' },
  { id: 2, name: 'Nexus ERP - Professional (Renewal)', date: '2026-04-15', amount: '$129.00', method: 'Credit Card', status: 'active', invoice: '#INV-2026-0038' },
  { id: 3, name: 'Nexus ERP - Starter', date: '2026-02-10', amount: '$49.00', method: 'UPI', status: 'expired', invoice: '#INV-2026-0015' },
  { id: 4, name: 'Nexus ERP - Starter', date: '2025-12-01', amount: '$49.00', method: 'Credit Card', status: 'expired', invoice: '#INV-2025-0089' },
]

export default function AccountPurchasesPage() {
  return (
    <div>
      <div style={{ marginBottom: '32px' }}>
        <h1 style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--text-primary)', marginBottom: '8px' }}>
          Purchase History
        </h1>
        <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>
          All your past transactions and subscriptions.
        </p>
      </div>

      {/* Purchases Table */}
      <div style={{
        background: 'var(--bg-surface)',
        border: '1px solid var(--border)',
        borderRadius: '12px',
        overflow: 'hidden',
      }}>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr style={{ borderBottom: '1px solid var(--border)' }}>
              {['Invoice', 'Product', 'Date', 'Amount', 'Payment', 'Status'].map((h) => (
                <th key={h} style={{
                  padding: '14px 16px',
                  textAlign: 'left',
                  fontSize: '0.8rem',
                  fontWeight: 600,
                  color: 'var(--text-muted)',
                  textTransform: 'uppercase',
                  letterSpacing: '0.05em',
                }}>
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {PURCHASES.map((p) => (
              <tr key={p.id} style={{ borderBottom: '1px solid var(--border)' }}>
                <td style={{ padding: '14px 16px', fontSize: '0.85rem', color: 'var(--accent-blue)', fontWeight: 600 }}>
                  {p.invoice}
                </td>
                <td style={{ padding: '14px 16px', fontSize: '0.85rem', color: 'var(--text-primary)', fontWeight: 500 }}>
                  {p.name}
                </td>
                <td style={{ padding: '14px 16px', fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                  {p.date}
                </td>
                <td style={{ padding: '14px 16px', fontSize: '0.85rem', color: 'var(--text-primary)', fontWeight: 600 }}>
                  {p.amount}
                </td>
                <td style={{ padding: '14px 16px', fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                  {p.method}
                </td>
                <td style={{ padding: '14px 16px' }}>
                  <span style={{
                    fontSize: '0.7rem',
                    fontWeight: 600,
                    padding: '3px 10px',
                    borderRadius: '4px',
                    background: p.status === 'active' ? 'rgba(34,197,94,0.1)' : 'rgba(239,68,68,0.1)',
                    color: p.status === 'active' ? 'var(--success)' : 'var(--danger)',
                    textTransform: 'uppercase',
                  }}>
                    {p.status}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {PURCHASES.length === 0 && (
          <div style={{ padding: '60px', textAlign: 'center' }}>
            <ShoppingBag size={48} color="var(--text-muted)" style={{ margin: '0 auto 16px', opacity: 0.5 }} />
            <p style={{ color: 'var(--text-muted)' }}>No purchases yet.</p>
          </div>
        )}
      </div>
    </div>
  )
}
