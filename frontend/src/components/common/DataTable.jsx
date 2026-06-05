import React, { useState, useMemo } from 'react'
import { ChevronUp, ChevronDown, ChevronsUpDown, Edit2, Trash2, Eye, ChevronLeft, ChevronRight } from 'lucide-react'

const PAGE_SIZE_OPTIONS = [10, 25, 50]

export default function DataTable({
  columns: _columns = [],
  data = [],
  onEdit,
  onDelete,
  onView,
  loading = false,
  searchValue = '',
  actions,
  rowKey = 'id',
  emptyMessage = 'No records found',
  emptyIcon,
}) {
  const columns = useMemo(() => [
    ..._columns,
    {
      key: '_modifiedBy',
      label: 'Last Modified By',
      noSort: true,
      render: (_, row) => (
        <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
          {row.submitterName || row.modifiedBy || 'Owner'}
        </span>
      )
    }
  ], [_columns])

  const [sortKey, setSortKey] = useState(null)
  const [sortDir, setSortDir] = useState('asc')
  const [page, setPage] = useState(1)
  const [pageSize, setPageSize] = useState(10)

  const handleSort = (key) => {
    if (sortKey === key) {
      setSortDir((d) => (d === 'asc' ? 'desc' : 'asc'))
    } else {
      setSortKey(key)
      setSortDir('asc')
    }
    setPage(1)
  }

  const sorted = useMemo(() => {
    if (!sortKey) return data
    return [...data].sort((a, b) => {
      const av = a[sortKey]
      const bv = b[sortKey]
      if (av == null) return 1
      if (bv == null) return -1
      const cmp = String(av).localeCompare(String(bv), undefined, { numeric: true })
      return sortDir === 'asc' ? cmp : -cmp
    })
  }, [data, sortKey, sortDir])

  const totalPages = Math.max(1, Math.ceil(sorted.length / pageSize))
  const paginated = sorted.slice((page - 1) * pageSize, page * pageSize)
  const hasActions = onEdit || onDelete || onView || actions

  const SortIcon = ({ colKey }) => {
    if (sortKey !== colKey) return <ChevronsUpDown size={12} style={{ opacity: 0.4 }} />
    return sortDir === 'asc'
      ? <ChevronUp size={12} style={{ color: 'var(--accent-gold)' }} />
      : <ChevronDown size={12} style={{ color: 'var(--accent-gold)' }} />
  }

  if (loading) {
    return (
      <div className="table-container">
        <table className="data-table">
          <thead>
            <tr>
              {columns.map((col) => (
                <th key={col.key}>{col.label}</th>
              ))}
              {hasActions && <th>Actions</th>}
            </tr>
          </thead>
          <tbody>
            {Array.from({ length: 6 }).map((_, i) => (
              <tr key={i}>
                {columns.map((col, ci) => (
                  <td key={col.key}>
                    <div className="skeleton skeleton-text" style={{ width: `${55 + ((i + ci) % 4) * 10}%` }} />
                  </td>
                ))}
                {hasActions && (
                  <td>
                    <div className="skeleton skeleton-text" style={{ width: '80px' }} />
                  </td>
                )}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    )
  }

  if (!sorted.length) {
    return (
      <div className="empty-state">
        <div className="empty-state-icon">
          {emptyIcon || <ChevronsUpDown size={28} />}
        </div>
        <div className="empty-state-title">{emptyMessage}</div>
        <div className="empty-state-desc">
          {searchValue ? 'Try adjusting your search terms' : 'No data to display yet'}
        </div>
      </div>
    )
  }

  return (
    <div>
      <div className="table-container">
        <table className="data-table">
          <thead>
            <tr>
              {columns.map((col) => (
                <th
                  key={col.key}
                  onClick={() => !col.noSort && handleSort(col.key)}
                  style={{ cursor: col.noSort ? 'default' : 'pointer' }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    {col.label}
                    {!col.noSort && <SortIcon colKey={col.key} />}
                  </div>
                </th>
              ))}
              {hasActions && (
                <th style={{ cursor: 'default', textAlign: 'right' }}>Actions</th>
              )}
            </tr>
          </thead>
          <tbody>
            {paginated.map((row, rowIdx) => {
              let rowStyle = {}
              if (row._approvalStatus === 'PENDING') {
                rowStyle = { borderLeft: '4px solid var(--accent-gold)', backgroundColor: 'rgba(245, 158, 11, 0.05)' }
              } else if (row._approvalStatus === 'DECLINED') {
                rowStyle = { borderLeft: '4px solid var(--danger)', backgroundColor: 'rgba(239, 68, 68, 0.05)' }
              }
              
              return (
              <tr key={row[rowKey] || rowIdx} className={row._rowClass || ''} style={rowStyle}>
                {columns.map((col) => (
                  <td key={col.key}>
                    {col.render ? col.render(row[col.key], row) : (
                      <span style={{ color: col.primary ? 'var(--text-primary)' : undefined, fontWeight: col.primary ? 600 : undefined }}>
                        {row[col.key] ?? '—'}
                      </span>
                    )}
                  </td>
                ))}
                {hasActions && (
                  <td style={{ textAlign: 'right', whiteSpace: 'nowrap' }}>
                    <div style={{ display: 'flex', gap: '6px', justifyContent: 'flex-end' }}>
                      {onView && (
                        <button
                          className="btn btn-ghost btn-sm btn-icon"
                          onClick={() => onView(row)}
                          title="View"
                          style={{ color: 'var(--accent-blue)' }}
                        >
                          <Eye size={15} />
                        </button>
                      )}
                      {onEdit && (
                        <button
                          className="btn btn-ghost btn-sm btn-icon"
                          onClick={() => onEdit(row)}
                          title="Edit"
                          style={{ color: 'var(--accent-gold)' }}
                        >
                          <Edit2 size={15} />
                        </button>
                      )}
                      {onDelete && (
                        <button
                          className="btn btn-ghost btn-sm btn-icon"
                          onClick={() => onDelete(row)}
                          title="Delete"
                          style={{ color: 'var(--danger)' }}
                        >
                          <Trash2 size={15} />
                        </button>
                      )}
                      {actions && actions(row)}
                    </div>
                  </td>
                )}
              </tr>
              )
            })}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      <div className="pagination">
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <span className="pagination-info">
            Showing {Math.min((page - 1) * pageSize + 1, sorted.length)}–{Math.min(page * pageSize, sorted.length)} of {sorted.length}
          </span>
          <select
            className="form-select"
            value={pageSize}
            onChange={(e) => { setPageSize(Number(e.target.value)); setPage(1) }}
            style={{ width: 'auto', padding: '4px 28px 4px 10px', fontSize: '0.8125rem' }}
          >
            {PAGE_SIZE_OPTIONS.map((s) => (
              <option key={s} value={s}>{s} per page</option>
            ))}
          </select>
        </div>

        <div className="pagination-controls">
          <button
            className="page-btn"
            onClick={() => setPage(1)}
            disabled={page === 1}
          >
            «
          </button>
          <button
            className="page-btn"
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            disabled={page === 1}
          >
            <ChevronLeft size={14} />
          </button>

          {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
            const start = Math.max(1, Math.min(page - 2, totalPages - 4))
            const p = start + i
            if (p > totalPages) return null
            return (
              <button
                key={p}
                className={`page-btn ${p === page ? 'active' : ''}`}
                onClick={() => setPage(p)}
              >
                {p}
              </button>
            )
          })}

          <button
            className="page-btn"
            onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
            disabled={page === totalPages}
          >
            <ChevronRight size={14} />
          </button>
          <button
            className="page-btn"
            onClick={() => setPage(totalPages)}
            disabled={page === totalPages}
          >
            »
          </button>
        </div>
      </div>
    </div>
  )
}
