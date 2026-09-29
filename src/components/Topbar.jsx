import React, { useState, useEffect } from 'react';
import useAppStore from '../store/useAppStore';

export default function Topbar() {
  const { searchQuery, setSearchQuery, lastUpdated, activeApi, setSidebarOpen, priceAlerts } = useAppStore();
  const [clock, setClock] = useState(new Date());
  const [secondsAgo, setSecondsAgo] = useState(0);

  useEffect(() => {
    const t = setInterval(() => {
      setClock(new Date());
      if (lastUpdated) setSecondsAgo(Math.floor((Date.now() - lastUpdated) / 1000));
    }, 1000);
    return () => clearInterval(t);
  }, [lastUpdated]);

  const freshness = secondsAgo < 30 ? 'dot-fresh' : secondsAgo < 60 ? 'dot-stale' : 'dot-error';
  const untriggered = priceAlerts.filter(a => !a.triggered).length;

  return (
    <header 
      className="sticky top-0 z-[40]"
      style={{ 
        display: 'flex', alignItems: 'center', gap: 16,
        padding: '12px 24px',
        background: 'rgba(11,13,20,0.85)',
        backdropFilter: 'blur(20px)',
        WebkitBackdropFilter: 'blur(20px)',
        borderBottom: '1px solid var(--border)'
      }}
    >
      {/* Mobile hamburger */}
      <button 
        className="lg:hidden"
        onClick={() => setSidebarOpen(true)} 
        style={{
          width: 40, height: 40, borderRadius: 10,
          background: 'rgba(255,255,255,0.05)',
          border: '1px solid var(--border)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontSize: 18, color: 'var(--text-1)', cursor: 'pointer',
          transition: 'background 0.2s'
        }}
      >
        ☰
      </button>

      {/* Search */}
      <div style={{ position: 'relative', flex: 1, maxWidth: 480 }}>
        <span style={{ 
          position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', 
          fontSize: 15, color: 'var(--text-3)', pointerEvents: 'none' 
        }}>🔍</span>
        <input
          id="search-input"
          type="text"
          placeholder="Search markets... (press /)"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="input-base"
          style={{ 
            width: '100%', padding: '10px 16px 10px 42px',
            fontSize: 13, fontWeight: 500
          }}
        />
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginLeft: 'auto' }}>
        {/* API indicator */}
        <div 
          className="hidden md:flex"
          style={{ 
            alignItems: 'center', gap: 10,
            padding: '8px 14px', borderRadius: 12,
            background: 'rgba(255,255,255,0.03)',
            border: '1px solid var(--border)'
          }}
        >
          <div className={`${freshness}`} style={{ width: 7, height: 7, borderRadius: '50%' }} />
          <div style={{ display: 'flex', flexDirection: 'column' }}>
            <span style={{ fontSize: 9, fontWeight: 800, letterSpacing: '0.12em', textTransform: 'uppercase', color: 'var(--text-3)', lineHeight: 1, marginBottom: 3 }}>Source</span>
            <span className="mono" style={{ fontSize: 11, fontWeight: 600, color: 'var(--text-2)', lineHeight: 1, textTransform: 'capitalize' }}>{activeApi}</span>
          </div>
        </div>

        {/* Clock */}
        <div 
          className="hidden lg:flex"
          style={{ 
            flexDirection: 'column', alignItems: 'flex-end',
            paddingLeft: 12,
            borderLeft: '1px solid var(--border)'
          }}
        >
          <span style={{ fontSize: 9, fontWeight: 800, letterSpacing: '0.12em', textTransform: 'uppercase', color: 'var(--text-3)', lineHeight: 1, marginBottom: 3 }}>Local Time</span>
          <span className="mono" style={{ fontSize: 12, fontWeight: 700, color: 'var(--text-1)', lineHeight: 1 }}>
            {clock.toLocaleTimeString('en-US', { hour12: false })}
          </span>
        </div>

        {/* Alerts bell */}
        <button 
          style={{
            position: 'relative', width: 42, height: 42, borderRadius: 14,
            background: 'rgba(255,255,255,0.04)',
            border: '1px solid var(--border)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: 18, color: 'var(--text-2)', cursor: 'pointer',
            transition: 'background 0.2s, border-color 0.2s'
          }}
          onMouseEnter={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.08)'; e.currentTarget.style.borderColor = 'var(--border-hover)'; }}
          onMouseLeave={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.04)'; e.currentTarget.style.borderColor = 'var(--border)'; }}
        >
          🔔
          {untriggered > 0 && (
            <span style={{
              position: 'absolute', top: -4, right: -4,
              width: 18, height: 18, borderRadius: '50%',
              fontSize: 10, fontWeight: 800, lineHeight: '18px', textAlign: 'center',
              background: 'var(--red)', color: '#fff',
              boxShadow: '0 2px 8px rgba(239,68,68,0.5)'
            }}>
              {untriggered}
            </span>
          )}
        </button>
      </div>
    </header>
  );
}
