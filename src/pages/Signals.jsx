import React, { useEffect } from 'react';
import useAppStore from '../store/useAppStore';
import { useSignals } from '../hooks/useSignals';
import SignalCard from '../components/SignalCard';
import SkeletonLoader from '../components/SkeletonLoader';

export default function Signals() {
  const { signals, signalsLoading, coins } = useAppStore();
  const { generateAllSignals } = useSignals();

  useEffect(() => {
    if (coins.length > 0 && signals.length === 0) {
      generateAllSignals();
    }
  }, [coins.length, signals.length, generateAllSignals]);

  return (
    <div className="page-enter" style={{ display: 'flex', flexDirection: 'column', gap: 24, paddingBottom: 40 }}>
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', flexWrap: 'wrap', gap: 16 }}>
        <div>
          <h1 style={{ fontSize: 26, fontWeight: 800, color: 'var(--text-1)', letterSpacing: '-0.02em' }}>AI Trading Signals</h1>
          <p style={{ fontSize: 13, color: 'var(--text-3)', marginTop: 4 }}>
            Generated from RSI, MACD, SMA analysis + FinBERT sentiment. <span style={{ color: 'var(--orange)' }}>Educational purposes only.</span>
          </p>
        </div>
        <button 
          onClick={generateAllSignals} disabled={signalsLoading}
          style={{ 
            padding: '10px 20px', borderRadius: 12, fontSize: 13, fontWeight: 700, 
            background: 'linear-gradient(135deg, #6366f1, #a855f7)', color: '#fff', 
            border: 'none', cursor: signalsLoading ? 'not-allowed' : 'pointer',
            opacity: signalsLoading ? 0.7 : 1, transition: 'transform 0.2s, box-shadow 0.2s',
            boxShadow: '0 4px 16px rgba(99,102,241,0.4)'
          }}
          onMouseEnter={e => { if (!signalsLoading) e.currentTarget.style.transform = 'translateY(-2px)'; }}
          onMouseLeave={e => { if (!signalsLoading) e.currentTarget.style.transform = 'none'; }}
        >
          {signalsLoading ? '⏳ Analyzing Markets...' : '🔄 Refresh Signals'}
        </button>
      </div>

      {/* Legend */}
      <div className="card" style={{ padding: '16px 20px', display: 'flex', alignItems: 'center', gap: 12, flexWrap: 'wrap' }}>
        <span style={{ fontSize: 11, fontWeight: 700, color: 'var(--text-3)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Legend:</span>
        {[
          { label: 'STRONG BUY', cls: 'signal-strong-buy' },
          { label: 'BUY', cls: 'signal-buy' },
          { label: 'HOLD', cls: 'signal-hold' },
          { label: 'SELL', cls: 'signal-sell' },
          { label: 'STRONG SELL', cls: 'signal-strong-sell' },
        ].map(s => (
          <span key={s.label} className={`signal-badge ${s.cls}`}>{s.label}</span>
        ))}
      </div>

      {signalsLoading && signals.length === 0 ? (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 16 }}>
          <SkeletonLoader count={8} />
        </div>
      ) : signals.length === 0 ? (
        <div className="card" style={{ padding: 48, textAlign: 'center' }}>
          <div style={{ fontSize: 36, marginBottom: 16, opacity: 0.3 }}>🤖</div>
          <p style={{ fontSize: 16, fontWeight: 600, color: 'var(--text-1)', marginBottom: 8 }}>No signals generated yet.</p>
          <p style={{ fontSize: 13, color: 'var(--text-3)' }}>Click "Refresh Signals" to analyze the top 20 coins.</p>
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 16 }}>
          {signals.map(s => <SignalCard key={s.coinId} signal={s} />)}
        </div>
      )}
    </div>
  );
}
