import React, { useEffect, useState } from 'react'
import { TrendingUp, TrendingDown, Minus } from 'lucide-react'

function useCountUp(target, duration = 800) {
  const [value, setValue] = useState(0)

  useEffect(() => {
    if (typeof target !== 'number') return
    const start = Date.now()
    const startVal = 0
    const animate = () => {
      const elapsed = Date.now() - start
      const progress = Math.min(elapsed / duration, 1)
      const eased = 1 - Math.pow(1 - progress, 3)
      setValue(Math.floor(startVal + (target - startVal) * eased))
      if (progress < 1) requestAnimationFrame(animate)
    }
    requestAnimationFrame(animate)
  }, [target, duration])

  return value
}

export default function StatsCard({
  title,
  value,
  subtitle,
  icon: Icon,
  trend,
  trendValue,
  color = 'gold',
  prefix = '',
  suffix = '',
  loading = false,
}) {
  const numericValue = typeof value === 'number' ? value : parseFloat(String(value).replace(/[^0-9.]/g, '')) || 0
  const animatedValue = useCountUp(numericValue)

  const colorMap = {
    gold: '#f59e0b',
    green: '#10b981',
    blue: '#3b82f6',
    red: '#ef4444',
    purple: '#8b5cf6',
  }

  const bgMap = {
    gold: 'rgba(245,158,11,0.1)',
    green: 'rgba(16,185,129,0.1)',
    blue: 'rgba(59,130,246,0.1)',
    red: 'rgba(239,68,68,0.1)',
    purple: 'rgba(139,92,246,0.1)',
  }

  const accentColor = colorMap[color] || colorMap.gold
  const bgColor = bgMap[color] || bgMap.gold

  const formatValue = (v) => {
    if (typeof value === 'string' && !value.match(/^[\d.]+$/)) return value
    if (numericValue >= 100000) return `${prefix}${(v / 100000).toFixed(2)}L`
    if (numericValue >= 1000) return `${prefix}${v.toLocaleString('en-IN')}`
    return `${prefix}${v}${suffix}`
  }

  if (loading) {
    return (
      <div className={`stats-card ${color}`}>
        <div className="skeleton" style={{ height: 40, width: 40, borderRadius: '10px', marginBottom: 16 }} />
        <div className="skeleton skeleton-title" style={{ width: '60%', marginBottom: 8 }} />
        <div className="skeleton skeleton-text" style={{ width: '40%' }} />
      </div>
    )
  }

  return (
    <div className={`stats-card ${color}`} style={{ animation: 'countUp 0.4s ease' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '16px' }}>
        <div
          style={{
            width: '44px',
            height: '44px',
            background: bgColor,
            border: `1px solid ${accentColor}30`,
            borderRadius: '10px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          {Icon && <Icon size={22} color={accentColor} />}
        </div>

        {trend && (
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '4px',
              fontSize: '0.75rem',
              fontWeight: 600,
              color: trend === 'up' ? 'var(--success)' : trend === 'down' ? 'var(--danger)' : 'var(--text-muted)',
            }}
          >
            {trend === 'up' && <TrendingUp size={14} />}
            {trend === 'down' && <TrendingDown size={14} />}
            {trend === 'neutral' && <Minus size={14} />}
            {trendValue && <span>{trendValue}</span>}
          </div>
        )}
      </div>

      <div style={{ fontSize: '1.75rem', fontWeight: 800, color: 'var(--text-primary)', lineHeight: 1.1, marginBottom: '4px' }}>
        {formatValue(animatedValue)}
      </div>

      <div style={{ fontSize: '0.875rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: subtitle ? '4px' : 0 }}>
        {title}
      </div>

      {subtitle && (
        <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
          {subtitle}
        </div>
      )}
    </div>
  )
}
