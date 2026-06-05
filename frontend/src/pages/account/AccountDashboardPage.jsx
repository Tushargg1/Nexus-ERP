import React, { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { Package, ShoppingBag, Download, ArrowRight, CheckCircle2, Clock } from 'lucide-react'
import useAuthStore from '../../store/authStore'
import { registrationAPI } from '../../api/registration'

export default function AccountDashboardPage() {
  const user = useAuthStore((s) => s.user)
  const [approvalStatus, setApprovalStatus] = useState(null) // null = loading
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const checkStatus = async () => {
      try {
        const res = await registrationAPI.verifyLicense(user?.email)
        if (res.data?.approved === true) {
          setApprovalStatus('approved')
        } else if (res.data?.status === 'PENDING') {
          setApprovalStatus('pending')
        } else {
          setApprovalStatus('not_purchased')
        }
      } catch {
        setApprovalStatus('not_purchased')
      } finally {
        setLoading(false)
      }
    }
    checkStatus()
  }, [user?.email])

  return (
    <div>
      {/* Welcome Header */}
      <div style={{ marginBottom: '40px' }}>
        <h1 style={{ fontSize: '1.75rem', fontWeight: 800, color: 'var(--text-primary)', marginBottom: '8px' }}>
          Welcome back, {user?.name || 'User'} 👋
        </h1>
        <p style={{ color: 'var(--text-muted)', fontSize: '0.95rem' }}>
          Manage your software licenses and downloads.
        </p>
      </div>

      {/* Status Banner */}
      {!loading && approvalStatus === 'approved' && (
        <div style={{
          background: 'rgba(34,197,94,0.06)',
          border: '1px solid rgba(34,197,94,0.2)',
          borderRadius: '12px',
          padding: '20px 24px',
          marginBottom: '28px',
          display: 'flex',
          alignItems: 'center',
          gap: '16px',
        }}>
          <CheckCircle2 size={28} color="var(--success)" />
          <div>
            <p style={{ fontWeight: 600, color: 'var(--text-primary)', fontSize: '0.95rem' }}>Your license is active</p>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.8rem' }}>
              You can download Nexus ERP from the <Link to="/account/software" style={{ color: 'var(--accent-blue)', textDecoration: 'none', fontWeight: 600 }}>My Software</Link> page.
            </p>
          </div>
        </div>
      )}

      {!loading && approvalStatus === 'pending' && (
        <div style={{
          background: 'rgba(245,158,11,0.06)',
          border: '1px solid rgba(245,158,11,0.2)',
          borderRadius: '12px',
          padding: '20px 24px',
          marginBottom: '28px',
          display: 'flex',
          alignItems: 'center',
          gap: '16px',
        }}>
          <Clock size={28} color="var(--accent-gold)" />
          <div>
            <p style={{ fontWeight: 600, color: 'var(--text-primary)', fontSize: '0.95rem' }}>Pending approval</p>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.8rem' }}>
              Your purchase request is being reviewed by our team. You'll be able to download the software once approved.
            </p>
          </div>
        </div>
      )}

      {!loading && approvalStatus === 'not_purchased' && (
        <div style={{
          background: 'rgba(59,130,246,0.06)',
          border: '1px solid rgba(59,130,246,0.2)',
          borderRadius: '12px',
          padding: '20px 24px',
          marginBottom: '28px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
            <Package size={28} color="var(--accent-blue)" />
            <div>
              <p style={{ fontWeight: 600, color: 'var(--text-primary)', fontSize: '0.95rem' }}>Get Nexus ERP</p>
              <p style={{ color: 'var(--text-muted)', fontSize: '0.8rem' }}>
                Purchase the software to manage your business operations.
              </p>
            </div>
          </div>
          <Link to="/account/software" className="btn btn-primary" style={{ padding: '10px 20px', fontSize: '0.85rem', textDecoration: 'none' }}>
            Buy Now
          </Link>
        </div>
      )}

      {/* Quick Links */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '20px', marginBottom: '40px' }}>
        <Link to="/account/software" style={{ textDecoration: 'none' }}>
          <div style={{
            background: 'var(--bg-surface)',
            border: '1px solid var(--border)',
            borderRadius: '12px',
            padding: '24px',
            transition: 'border-color 0.2s',
            cursor: 'pointer',
          }}
          onMouseEnter={e => e.currentTarget.style.borderColor = 'var(--accent-gold)'}
          onMouseLeave={e => e.currentTarget.style.borderColor = 'var(--border)'}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '12px' }}>
              <div style={{ width: '40px', height: '40px', background: 'rgba(245,158,11,0.1)', borderRadius: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Package size={20} color="var(--accent-gold)" />
              </div>
            </div>
            <p style={{ fontWeight: 600, color: 'var(--text-primary)', fontSize: '0.9rem', marginBottom: '4px' }}>My Software</p>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.8rem' }}>View licenses & downloads</p>
          </div>
        </Link>

        <Link to="/account/purchases" style={{ textDecoration: 'none' }}>
          <div style={{
            background: 'var(--bg-surface)',
            border: '1px solid var(--border)',
            borderRadius: '12px',
            padding: '24px',
            transition: 'border-color 0.2s',
            cursor: 'pointer',
          }}
          onMouseEnter={e => e.currentTarget.style.borderColor = 'var(--accent-blue)'}
          onMouseLeave={e => e.currentTarget.style.borderColor = 'var(--border)'}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '12px' }}>
              <div style={{ width: '40px', height: '40px', background: 'rgba(59,130,246,0.1)', borderRadius: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <ShoppingBag size={20} color="var(--accent-blue)" />
              </div>
            </div>
            <p style={{ fontWeight: 600, color: 'var(--text-primary)', fontSize: '0.9rem', marginBottom: '4px' }}>Purchases</p>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.8rem' }}>Transaction history</p>
          </div>
        </Link>

        <Link to="/account/settings" style={{ textDecoration: 'none' }}>
          <div style={{
            background: 'var(--bg-surface)',
            border: '1px solid var(--border)',
            borderRadius: '12px',
            padding: '24px',
            transition: 'border-color 0.2s',
            cursor: 'pointer',
          }}
          onMouseEnter={e => e.currentTarget.style.borderColor = 'var(--success)'}
          onMouseLeave={e => e.currentTarget.style.borderColor = 'var(--border)'}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '12px' }}>
              <div style={{ width: '40px', height: '40px', background: 'rgba(34,197,94,0.1)', borderRadius: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Download size={20} color="var(--success)" />
              </div>
            </div>
            <p style={{ fontWeight: 600, color: 'var(--text-primary)', fontSize: '0.9rem', marginBottom: '4px' }}>Settings</p>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.8rem' }}>Profile & preferences</p>
          </div>
        </Link>
      </div>

      {/* How it works */}
      <div style={{
        background: 'var(--bg-surface)',
        border: '1px solid var(--border)',
        borderRadius: '12px',
        padding: '28px',
      }}>
        <h2 style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '20px' }}>
          How it works
        </h2>
        <div style={{ display: 'flex', gap: '32px' }}>
          {[
            { step: '1', title: 'Buy Software', desc: 'Purchase from My Software page' },
            { step: '2', title: 'Admin Approves', desc: 'Our team reviews your request' },
            { step: '3', title: 'Download', desc: 'Download the ERP installer' },
            { step: '4', title: 'Login & Use', desc: 'Sign in with your email (internet required once)' },
          ].map((item, i) => (
            <div key={i} style={{ flex: 1, display: 'flex', gap: '12px' }}>
              <div style={{
                width: '32px',
                height: '32px',
                background: 'rgba(245,158,11,0.1)',
                borderRadius: '8px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '0.8rem',
                fontWeight: 700,
                color: 'var(--accent-gold)',
                flexShrink: 0,
              }}>
                {item.step}
              </div>
              <div>
                <p style={{ fontWeight: 600, color: 'var(--text-primary)', fontSize: '0.85rem', marginBottom: '2px' }}>{item.title}</p>
                <p style={{ color: 'var(--text-muted)', fontSize: '0.75rem' }}>{item.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
