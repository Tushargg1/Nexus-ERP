import React, { useState, useEffect } from 'react'
import { Download, Package, CheckCircle2, Clock, XCircle, ShoppingCart } from 'lucide-react'
import toast from 'react-hot-toast'
import useAuthStore from '../../store/authStore'
import { registrationAPI } from '../../api/registration'
import client from '../../api/client'

const SOFTWARE_CATALOG = [
  {
    id: 'nexus-erp-pro',
    name: 'Nexus ERP - Professional',
    description: 'Full-featured ERP with inventory, workforce management, financial analytics, GST invoicing, production tracking, and more.',
    version: 'v2.4.1',
    platform: 'Windows / macOS / Linux',
    size: '145 MB',
    price: '$129/mo',
  },
]

const statusConfig = {
  approved: { icon: CheckCircle2, color: 'var(--success)', bg: 'rgba(34,197,94,0.1)', label: 'Approved' },
  pending: { icon: Clock, color: 'var(--accent-gold)', bg: 'rgba(245,158,11,0.1)', label: 'Pending Approval' },
  rejected: { icon: XCircle, color: 'var(--danger)', bg: 'rgba(239,68,68,0.1)', label: 'Rejected' },
  not_purchased: { icon: ShoppingCart, color: 'var(--text-muted)', bg: 'rgba(148,163,184,0.1)', label: 'Not Purchased' },
}

export default function AccountSoftwarePage() {
  const user = useAuthStore((s) => s.user)
  const [approvalStatus, setApprovalStatus] = useState(null) // null = loading, 'not_purchased' | 'pending' | 'approved' | 'rejected'
  const [loading, setLoading] = useState(true)
  const [buying, setBuying] = useState(false)
  const [downloading, setDownloading] = useState(false)

  useEffect(() => {
    checkApprovalStatus()
  }, [])

  const resolveStatus = (data) => {
    if (data?.approved === true) return 'approved'
    if (data?.status === 'PENDING') return 'pending'
    if (data?.status === 'REJECTED') return 'rejected'
    return 'not_purchased'
  }

  const checkApprovalStatus = async () => {
    try {
      const res = await registrationAPI.verifyLicense(user?.email)
      const status = resolveStatus(res.data)
      setApprovalStatus(status)
      return status
    } catch (err) {
      // If 404 or no registration found, user hasn't purchased
      setApprovalStatus('not_purchased')
      return 'not_purchased'
    } finally {
      setLoading(false)
    }
  }

  const handleDownload = async () => {
    setDownloading(true)
    try {
      // Re-verify the latest approval status with the server before downloading
      const latest = await checkApprovalStatus()
      if (latest !== 'approved') {
        const messages = {
          pending: 'Your purchase is still pending admin approval.',
          rejected: 'Your access has been revoked. Please request again.',
          not_purchased: 'No active purchase found. Please buy the software first.',
        }
        toast.error(messages[latest] || 'Download not available.')
        return
      }
      // Still approved — fetch the gated installer from the server
      const res = await client.get('/software/download', {
        params: { email: user?.email },
        responseType: 'blob',
      })

      // If the server returned JSON (an error/unavailable message) instead of a file
      const contentType = res.headers['content-type'] || ''
      if (contentType.includes('application/json')) {
        const text = await res.data.text()
        const msg = JSON.parse(text)?.message || 'Download not available yet.'
        toast.error(msg)
        return
      }

      // Trigger the browser download of the received file
      const blobUrl = window.URL.createObjectURL(res.data)
      const link = document.createElement('a')
      link.href = blobUrl
      link.download = 'nexus-erp-pro-v2.4.1.zip'
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      window.URL.revokeObjectURL(blobUrl)
      toast.success('Download started.')
    } catch (err) {
      const status = err.response?.status
      if (status === 403) {
        toast.error('Your license is not approved. Download blocked.')
        await checkApprovalStatus()
      } else if (status === 404) {
        toast.error('The installer is not available yet. Please contact support.')
      } else {
        toast.error('Unable to download. Please try again.')
      }
    } finally {
      setDownloading(false)
    }
  }

  const handleBuy = async () => {
    setBuying(true)
    try {
      // Send a purchase request for the existing account (admin must approve)
      await registrationAPI.requestPurchase(user?.email)
      setApprovalStatus('pending')
      toast.success('Purchase request submitted! Awaiting admin approval.')
    } catch (err) {
      const msg = err.response?.data?.message || 'Failed to submit purchase request.'
      if (msg.toLowerCase().includes('already')) {
        await checkApprovalStatus()
      }
      toast.error(msg)
    } finally {
      setBuying(false)
    }
  }

  if (loading) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '300px' }}>
        <div className="spinner" />
      </div>
    )
  }

  return (
    <div>
      <div style={{ marginBottom: '32px' }}>
        <h1 style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--text-primary)', marginBottom: '8px' }}>
          My Software
        </h1>
        <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>
          Purchase, manage, and download Nexus ERP software.
        </p>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
        {SOFTWARE_CATALOG.map((sw) => {
          const status = statusConfig[approvalStatus] || statusConfig.not_purchased
          const StatusIcon = status.icon
          return (
            <div key={sw.id} style={{
              background: 'var(--bg-surface)',
              border: '1px solid var(--border)',
              borderRadius: '12px',
              padding: '28px',
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <div style={{ flex: 1 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '8px' }}>
                    <h3 style={{ fontSize: '1.1rem', fontWeight: 700, color: 'var(--text-primary)' }}>{sw.name}</h3>
                    <span style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '4px',
                      fontSize: '0.7rem',
                      fontWeight: 600,
                      padding: '3px 10px',
                      borderRadius: '4px',
                      background: status.bg,
                      color: status.color,
                      textTransform: 'uppercase',
                    }}>
                      <StatusIcon size={12} />
                      {status.label}
                    </span>
                  </div>
                  <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem', marginBottom: '16px', maxWidth: '600px' }}>
                    {sw.description}
                  </p>

                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '16px' }}>
                    <div>
                      <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: '2px' }}>Version</p>
                      <p style={{ fontSize: '0.85rem', color: 'var(--text-primary)', fontWeight: 500 }}>{sw.version}</p>
                    </div>
                    <div>
                      <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: '2px' }}>Platform</p>
                      <p style={{ fontSize: '0.85rem', color: 'var(--text-primary)', fontWeight: 500 }}>{sw.platform}</p>
                    </div>
                    <div>
                      <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: '2px' }}>Size</p>
                      <p style={{ fontSize: '0.85rem', color: 'var(--text-primary)', fontWeight: 500 }}>{sw.size}</p>
                    </div>
                    <div>
                      <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: '2px' }}>Price</p>
                      <p style={{ fontSize: '0.85rem', color: 'var(--text-primary)', fontWeight: 500 }}>{sw.price}</p>
                    </div>
                  </div>
                </div>

                {/* Action button */}
                <div style={{ marginLeft: '24px', flexShrink: 0 }}>
                  {approvalStatus === 'approved' && (
                    <button
                      onClick={handleDownload}
                      disabled={downloading}
                      className="btn btn-primary"
                      style={{ padding: '12px 24px', fontSize: '0.85rem', display: 'flex', alignItems: 'center', gap: '8px' }}
                    >
                      {downloading ? (
                        <>
                          <div className="spinner spinner-sm" style={{ borderTopColor: '#0d1117' }} />
                          Verifying...
                        </>
                      ) : (
                        <>
                          <Download size={16} /> Download ({sw.size})
                        </>
                      )}
                    </button>
                  )}
                  {approvalStatus === 'pending' && (
                    <button
                      disabled
                      className="btn btn-secondary"
                      style={{ padding: '12px 24px', fontSize: '0.85rem', opacity: 0.7, cursor: 'not-allowed', display: 'flex', alignItems: 'center', gap: '8px' }}
                    >
                      <Clock size={16} /> Awaiting Approval
                    </button>
                  )}
                  {approvalStatus === 'rejected' && (
                    <button
                      onClick={handleBuy}
                      disabled={buying}
                      className="btn btn-primary"
                      style={{ padding: '12px 24px', fontSize: '0.85rem', display: 'flex', alignItems: 'center', gap: '8px' }}
                    >
                      {buying ? (
                        <>
                          <div className="spinner spinner-sm" style={{ borderTopColor: '#0d1117' }} />
                          Processing...
                        </>
                      ) : (
                        <>
                          <ShoppingCart size={16} /> Buy Again
                        </>
                      )}
                    </button>
                  )}
                  {approvalStatus === 'not_purchased' && (
                    <button
                      onClick={handleBuy}
                      disabled={buying}
                      className="btn btn-primary"
                      style={{ padding: '12px 24px', fontSize: '0.85rem', display: 'flex', alignItems: 'center', gap: '8px' }}
                    >
                      {buying ? (
                        <>
                          <div className="spinner spinner-sm" style={{ borderTopColor: '#0d1117' }} />
                          Processing...
                        </>
                      ) : (
                        <>
                          <ShoppingCart size={16} /> Buy Now
                        </>
                      )}
                    </button>
                  )}
                </div>
              </div>

              {/* Info messages */}
              {approvalStatus === 'pending' && (
                <div style={{
                  marginTop: '20px',
                  padding: '12px 16px',
                  background: 'rgba(245,158,11,0.06)',
                  border: '1px solid rgba(245,158,11,0.15)',
                  borderRadius: '8px',
                  fontSize: '0.8rem',
                  color: 'var(--accent-gold)',
                }}>
                  ⏳ Your purchase is pending admin approval. You'll be able to download the software once approved.
                </div>
              )}
              {approvalStatus === 'approved' && (
                <div style={{
                  marginTop: '20px',
                  padding: '12px 16px',
                  background: 'rgba(34,197,94,0.06)',
                  border: '1px solid rgba(34,197,94,0.15)',
                  borderRadius: '8px',
                  fontSize: '0.8rem',
                  color: 'var(--success)',
                }}>
                  ✅ Approved! Download the software and use your registered email ({user?.email}) to login. Internet is required for the first login and after signing out.
                </div>
              )}
              {approvalStatus === 'rejected' && (
                <div style={{
                  marginTop: '20px',
                  padding: '12px 16px',
                  background: 'rgba(239,68,68,0.06)',
                  border: '1px solid rgba(239,68,68,0.15)',
                  borderRadius: '8px',
                  fontSize: '0.8rem',
                  color: 'var(--danger)',
                }}>
                  ❌ Your previous request was rejected. You can submit a new request by clicking "Buy Again".
                </div>
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}
