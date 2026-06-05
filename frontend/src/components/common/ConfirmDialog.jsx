import React from 'react'
import { AlertTriangle } from 'lucide-react'
import Modal from './Modal'

export default function ConfirmDialog({
  isOpen,
  onClose,
  onConfirm,
  title = 'Confirm Delete',
  message = 'Are you sure you want to delete this item? This action cannot be undone.',
  confirmText = 'Delete',
  cancelText = 'Cancel',
  type = 'danger',
  loading = false,
}) {
  return (
    <Modal isOpen={isOpen} onClose={onClose} title={title} size="sm">
      <div style={{ textAlign: 'center', padding: '8px 0' }}>
        <div
          style={{
            width: '60px',
            height: '60px',
            background: type === 'danger' ? 'var(--danger-light)' : 'var(--warning-light)',
            borderRadius: '50%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            margin: '0 auto 16px',
          }}
        >
          <AlertTriangle
            size={28}
            color={type === 'danger' ? 'var(--danger)' : 'var(--warning)'}
          />
        </div>

        <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', lineHeight: 1.6 }}>
          {message}
        </p>

        <div style={{ display: 'flex', gap: '12px', marginTop: '24px', justifyContent: 'center' }}>
          <button className="btn btn-secondary" onClick={onClose} disabled={loading}>
            {cancelText}
          </button>
          <button
            className={`btn ${type === 'danger' ? 'btn-danger' : 'btn-primary'}`}
            onClick={onConfirm}
            disabled={loading}
            style={type === 'danger' ? { background: 'var(--danger)', color: '#fff' } : {}}
          >
            {loading ? 'Please wait...' : confirmText}
          </button>
        </div>
      </div>
    </Modal>
  )
}
