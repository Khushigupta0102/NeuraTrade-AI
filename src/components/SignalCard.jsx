/**
 * SignalCard — AI trading signal display card with premium design
 */
import React from 'react';
import { formatPrice, formatPercent, isPositive } from '../utils/formatters';

const SIGNAL_COLORS = {
  'STRONG BUY': 'signal-strong-buy',
  'BUY': 'signal-buy',
  'HOLD': 'signal-hold',
  'SELL': 'signal-sell',
  'STRONG SELL': 'signal-strong-sell',
};

const BORDER_COLOR = {
  'STRONG BUY': 'var(--green)',
  'BUY': 'var(--green)',
  'HOLD': '#64748b',
  'SELL': 'var(--orange)',
  'STRONG SELL': 'var(--red)',
};

const SignalCard = React.memo(function SignalCard({ signal }) {
  const { name, symbol, price, image, signal: signalType, rsi, macdDir, sentiment, confidence, change24h } = signal;
  const borderColor = BORDER_COLOR[signalType] || '#64748b';

  return (
    <div
      className="card"
      style={{ 
        padding: 20, display: 'flex', flexDirection: 'column', gap: 14,
        position: 'relative', overflow: 'hidden',
        borderLeft: `3px solid ${borderColor}`
      }}
    >
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, position: 'relative', zIndex: 1 }}>
        {image && (
          <img src={image} alt={name} 
            style={{ width: 32, height: 32, borderRadius: '50%', flexShrink: 0 }} 
            loading="lazy"
            onError={(e) => e.target.style.display = 'none'} />
        )}
        <div style={{ minWidth: 0, flex: 1 }}>
          <div style={{ fontWeight: 700, fontSize: 14, color: 'var(--text-1)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{name}</div>
          <div style={{ fontSize: 10, fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', color: 'var(--text-3)' }}>{symbol}</div>
        </div>
        <span className={`signal-badge ${SIGNAL_COLORS[signalType]}`} style={{ flexShrink: 0 }}>
          {signalType}
        </span>
      </div>

      {/* Price row */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', position: 'relative', zIndex: 1 }}>
        <span className="mono" style={{ fontSize: 18, fontWeight: 800, color: 'var(--text-1)' }}>{formatPrice(price)}</span>
        <span className="mono" style={{ fontSize: 12, fontWeight: 700, color: isPositive(change24h) ? 'var(--green)' : 'var(--red)' }}>
          {isPositive(change24h) ? '+' : ''}{formatPercent(change24h)}
        </span>
      </div>

      {/* Indicators grid */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 6, position: 'relative', zIndex: 1 }}>
        {[
          { label: 'RSI(14)', value: rsi?.toFixed(1) || '—', color: rsi < 30 ? 'var(--green)' : rsi > 70 ? 'var(--red)' : 'var(--text-1)' },
          { label: 'MACD', value: macdDir === 'bullish' ? '↑ Bull' : macdDir === 'bearish' ? '↓ Bear' : '— Flat', color: macdDir === 'bullish' ? 'var(--green)' : macdDir === 'bearish' ? 'var(--red)' : 'var(--text-2)' },
          { label: 'Sentiment', value: sentiment, color: sentiment === 'BULLISH' ? 'var(--green)' : sentiment === 'BEARISH' ? 'var(--red)' : 'var(--text-2)' },
          { label: 'Confidence', value: `${confidence}%`, color: 'var(--accent)' },
        ].map(item => (
          <div key={item.label} style={{ 
            display: 'flex', justifyContent: 'space-between', alignItems: 'center',
            padding: '8px 10px', borderRadius: 8, 
            background: 'rgba(255,255,255,0.02)', fontSize: 11 
          }}>
            <span style={{ color: 'var(--text-3)', fontWeight: 500 }}>{item.label}</span>
            <span className="mono" style={{ fontWeight: 700, color: item.color }}>{item.value}</span>
          </div>
        ))}
      </div>

      {/* Confidence bar */}
      <div style={{ width: '100%', height: 4, borderRadius: 99, background: 'rgba(255,255,255,0.04)', position: 'relative', zIndex: 1 }}>
        <div style={{
          height: '100%', borderRadius: 99,
          width: `${confidence}%`,
          background: signalType.includes('BUY') ? 'var(--green)' : signalType.includes('SELL') ? 'var(--red)' : '#64748b',
          transition: 'width 0.5s ease',
          boxShadow: signalType.includes('BUY') ? '0 0 8px rgba(34,197,94,0.4)' : signalType.includes('SELL') ? '0 0 8px rgba(239,68,68,0.4)' : 'none'
        }} />
      </div>
    </div>
  );
});

export default SignalCard;
