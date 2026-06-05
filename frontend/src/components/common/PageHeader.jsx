import React from 'react'

export default function PageHeader({ title, subtitle, actions, breadcrumb }) {
  return (
    <div className="page-header">
      <div className="page-header-left">
        {breadcrumb && (
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            fontSize: '0.75rem',
            color: 'var(--text-muted)',
            marginBottom: '4px',
          }}>
            {breadcrumb.map((crumb, i) => (
              <React.Fragment key={i}>
                {i > 0 && <span>/</span>}
                <span style={{ color: i === breadcrumb.length - 1 ? 'var(--accent-gold)' : undefined }}>
                  {crumb}
                </span>
              </React.Fragment>
            ))}
          </div>
        )}
        <h1 className="page-title">{title}</h1>
        {subtitle && <p className="page-subtitle">{subtitle}</p>}
      </div>

      {actions && (
        <div className="page-actions">
          {actions}
        </div>
      )}
    </div>
  )
}
