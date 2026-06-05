import React, { useState, useEffect, useRef } from 'react'
import { Search, X } from 'lucide-react'

export default function SearchBar({
  value,
  onChange,
  placeholder = 'Search...',
  debounce = 300,
  onClear,
}) {
  const [localValue, setLocalValue] = useState(value || '')
  const timerRef = useRef(null)

  useEffect(() => {
    setLocalValue(value || '')
  }, [value])

  const handleChange = (e) => {
    const v = e.target.value
    setLocalValue(v)
    clearTimeout(timerRef.current)
    timerRef.current = setTimeout(() => {
      onChange(v)
    }, debounce)
  }

  const handleClear = () => {
    setLocalValue('')
    onChange('')
    onClear?.()
  }

  return (
    <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
      <Search
        size={16}
        style={{
          position: 'absolute',
          left: '12px',
          color: 'var(--text-muted)',
          pointerEvents: 'none',
        }}
      />
      <input
        type="text"
        className="form-input"
        value={localValue}
        onChange={handleChange}
        placeholder={placeholder}
        style={{ paddingLeft: '38px', paddingRight: localValue ? '36px' : '14px' }}
      />
      {localValue && (
        <button
          type="button"
          onClick={handleClear}
          style={{
            position: 'absolute',
            right: '10px',
            background: 'none',
            border: 'none',
            cursor: 'pointer',
            color: 'var(--text-muted)',
            display: 'flex',
            padding: '2px',
          }}
        >
          <X size={14} />
        </button>
      )}
    </div>
  )
}
