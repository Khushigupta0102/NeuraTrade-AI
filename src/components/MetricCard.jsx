/**
 * MetricCard — Dashboard metric display card with premium styling
 */
import React from 'react';
import { formatPrice, formatPercent, isPositive } from '../utils/formatters';

const ICON_STYLES = {
  '$': { bg: 'var(--blue-dim)', color: 'var(--blue)' },
  '~': { bg: 'var(--purple-dim)', color: 'var(--purple)' },
  '+': { bg: 'var(--green-dim)', color: 'var(--green)' },
  '-': { bg: 'var(--red-dim)', color: 'var(--red)' },
};

const MetricCard = React.memo(function MetricCard({ title, value, change, icon, prefix = '' }) {
  const isUp = isPositive(change);
  const iconStyle = ICON_STYLES[icon] || ICON_STYLES['$'];

  return (
    <div 
      className="card"
      style={{ padding: '20px 24px', display: 'flex', flexDirection: 'column', gap: 14, position: 'relative', overflow: 'hidden' }}
    >
      {/* Decorative glow */}
      <div style={{
        position: 'absolute', top: -20, right: -20, width: 80, height: 80,
        borderRadius: '50%', background: iconStyle.bg, filter: 'blur(30px)',
        opacity: 0.5, pointerEvents: 'none'
      }} />
      
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', position: 'relative', zIndex: 1 }}>
        <span style={{ fontSize: 10, fontWeight: 800, letterSpacing: '0.12em', textTransform: 'uppercase', color: 'var(--text-3)' }}>
          {title}
        </span>
        <div style={{ 
          width: 34, height: 34, borderRadius: 10,
          background: iconStyle.bg, border: '1px solid transparent',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontWeight: 800, fontSize: 14, color: iconStyle.color,
          transition: 'transform 0.3s'
        }}>
          {icon}
        </div>
      </div>
      
      <div style={{ position: 'relative', zIndex: 1 }}>
        <div className="mono" style={{ fontSize: 22, fontWeight: 800, letterSpacing: '-0.02em', color: 'var(--text-1)', lineHeight: 1.2 }}>
          {prefix}{typeof value === 'number' ? formatPrice(value) : (value ?? '—')}
        </div>
        {change != null && (
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginTop: 6 }}>
            <span className="pill" style={{ 
              background: isUp ? 'var(--green-dim)' : 'var(--red-dim)', 
              color: isUp ? 'var(--green)' : 'var(--red)',
              padding: '2px 8px', fontSize: 10, fontWeight: 700, borderRadius: 6,
              border: 'none'
            }}>
              {isUp ? '▲' : '▼'} {formatPercent(change)}
            </span>
            <span style={{ fontSize: 10, fontWeight: 500, color: 'var(--text-3)' }}>24h</span>
          </div>
        )}
      </div>
    </div>
  );
});

export default MetricCard;
