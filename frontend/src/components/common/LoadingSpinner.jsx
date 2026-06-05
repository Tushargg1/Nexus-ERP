import React from 'react'

export default function LoadingSpinner({ size = 'md', text, fullPage = false }) {
  const sizeClass = size === 'sm' ? 'spinner-sm' : size === 'lg' ? 'spinner-lg' : ''

  if (fullPage) {
    return (
      <div style={{
        position: 'fixed',
        inset: 0,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'var(--bg-primary)',
        zIndex: 9999,
        gap: '16px',
      }}>
        <div className={`spinner ${sizeClass}`} />
        {text && <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem' }}>{text}</p>}
      </div>
    )
  }

  return (
    <div className="loading-container">
      <div className={`spinner ${sizeClass}`} />
      {text && <p>{text}</p>}
    </div>
  )
}
