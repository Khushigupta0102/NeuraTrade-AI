import React from 'react';
import useAppStore from '../store/useAppStore';
import { humanize } from '../utils/formatters';

const NAV_ITEMS = [
  { id: 'dashboard', label: 'Dashboard', icon: '📊' },
  { id: 'markets', label: 'Markets', icon: '📈' },
  { id: 'portfolio', label: 'Portfolio', icon: '💼' },
  { id: 'signals', label: 'AI Signals', icon: '🤖' },
  { id: 'chatbot', label: 'Chat Bot', icon: '💬' },
  { id: 'settings', label: 'Settings', icon: '⚙️' },
];

export default function Sidebar() {
  const { 
    activePage, 
    setActivePage, 
    theme, 
    setTheme, 
    globalStats, 
    sidebarOpen, 
    setSidebarOpen,
    sidebarCollapsed,
    toggleSidebarCollapsed
  } = useAppStore();

  const width = sidebarCollapsed ? 72 : 256;

  return (
    <>
      {/* Mobile overlay */}
      {sidebarOpen && (
        <div 
          className="fixed inset-0 z-40 lg:hidden" 
          style={{ background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(4px)' }}
          onClick={() => setSidebarOpen(false)} 
        />
      )}

      <aside 
        className={`fixed top-0 left-0 h-full z-50 flex flex-col overflow-hidden
          ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'} lg:translate-x-0`}
        style={{ 
          width: sidebarOpen ? 256 : width, 
          background: 'var(--bg-secondary)', 
          borderRight: '1px solid var(--border)',
          transition: 'width 0.35s cubic-bezier(0.4,0,0.2,1), transform 0.35s cubic-bezier(0.4,0,0.2,1)'
        }}
      >
        {/* Collapse toggle (desktop) */}
        <button 
          onClick={toggleSidebarCollapsed}
          className="absolute -right-3 top-[72px] w-6 h-6 rounded-full items-center justify-center hidden lg:flex z-50"
          style={{ 
            background: 'var(--accent)', 
            color: '#fff', 
            boxShadow: '0 2px 8px rgba(99,102,241,0.4)',
            transition: 'transform 0.2s'
          }}
          onMouseEnter={e => e.currentTarget.style.transform = 'scale(1.15)'}
          onMouseLeave={e => e.currentTarget.style.transform = 'scale(1)'}
        >
          <span style={{ fontSize: 10, display: 'inline-block', transform: sidebarCollapsed ? 'rotate(180deg)' : 'none', transition: 'transform 0.3s' }}>
            ◀
          </span>
        </button>

        {/* Logo */}
        <div 
          className="flex items-center gap-3 shrink-0"
          style={{ 
            padding: sidebarCollapsed && !sidebarOpen ? '20px 0' : '20px 20px', 
            borderBottom: '1px solid var(--border)',
            justifyContent: sidebarCollapsed && !sidebarOpen ? 'center' : 'flex-start',
            minHeight: 72
          }}
        >
          <div 
            className="flex items-center justify-center shrink-0"
            style={{ 
              width: 36, height: 36, borderRadius: 12,
              background: 'linear-gradient(135deg,#6366f1,#a855f7)', 
              color: '#fff', fontWeight: 900, fontSize: 15,
              boxShadow: '0 4px 12px rgba(99,102,241,0.3)'
            }}
          >N</div>
          {(!sidebarCollapsed || sidebarOpen) && (
            <div style={{ overflow: 'hidden', whiteSpace: 'nowrap' }}>
              <div style={{ fontWeight: 800, fontSize: 16, color: 'var(--text-1)', letterSpacing: '-0.02em' }}>NeuraTrade</div>
              <div style={{ fontSize: 10, fontWeight: 700, letterSpacing: '0.12em', textTransform: 'uppercase', color: 'var(--accent)' }}>Quantum AI</div>
            </div>
          )}
        </div>

        {/* Navigation */}
        <nav className="flex-1 overflow-y-auto" style={{ padding: '12px 8px' }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
            {NAV_ITEMS.map(item => {
              const isActive = activePage === item.id;
              return (
                <button 
                  key={item.id} 
                  onClick={() => { setActivePage(item.id); setSidebarOpen(false); }}
                  className="group"
                  style={{
                    display: 'flex', alignItems: 'center', gap: 12,
                    padding: sidebarCollapsed && !sidebarOpen ? '12px 0' : '12px 16px',
                    justifyContent: sidebarCollapsed && !sidebarOpen ? 'center' : 'flex-start',
                    borderRadius: 14,
                    fontSize: 13, fontWeight: 600,
                    color: isActive ? '#fff' : 'var(--text-2)',
                    background: isActive ? 'var(--accent)' : 'transparent',
                    boxShadow: isActive ? '0 4px 16px rgba(99,102,241,0.3)' : 'none',
                    border: 'none', cursor: 'pointer', width: '100%', textAlign: 'left',
                    position: 'relative',
                    transition: 'all 0.2s ease'
                  }}
                  onMouseEnter={e => { if (!isActive) { e.currentTarget.style.background = 'rgba(255,255,255,0.05)'; e.currentTarget.style.color = 'var(--text-1)'; }}}
                  onMouseLeave={e => { if (!isActive) { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = 'var(--text-2)'; }}}
                >
                  <span style={{ fontSize: 18, lineHeight: 1, transition: 'transform 0.2s' }}>{item.icon}</span>
                  {(!sidebarCollapsed || sidebarOpen) && (
                    <span style={{ whiteSpace: 'nowrap' }}>{item.label}</span>
                  )}
                  
                  {/* Tooltip for collapsed mode */}
                  {sidebarCollapsed && !sidebarOpen && (
                    <div 
                      className="group-hover:opacity-100 group-hover:translate-x-0"
                      style={{
                        position: 'absolute', left: '100%', marginLeft: 12,
                        padding: '6px 12px', borderRadius: 8,
                        background: 'var(--bg-elevated)', border: '1px solid var(--border)',
                        color: 'var(--text-1)', fontSize: 12, fontWeight: 600,
                        whiteSpace: 'nowrap', pointerEvents: 'none', zIndex: 100,
                        boxShadow: 'var(--shadow-md)',
                        opacity: 0, transform: 'translateX(-4px)',
                        transition: 'all 0.15s ease'
                      }}
                    >
                      {item.label}
                    </div>
                  )}
                </button>
              );
            })}
          </div>
        </nav>

        {/* Global Stats */}
        {globalStats && (!sidebarCollapsed || sidebarOpen) && (
          <div style={{ padding: '16px 16px', borderTop: '1px solid var(--border)', background: 'var(--accent-dim)' }}>
            <div style={{ fontSize: 10, fontWeight: 800, letterSpacing: '0.15em', textTransform: 'uppercase', color: 'var(--text-3)', marginBottom: 10 }}>
              Market Pulse
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {[
                { label: 'Market Cap', value: humanize(globalStats.total_market_cap) },
                { label: 'BTC Dom.', value: `${globalStats.btc_dominance?.toFixed(1)}%` },
                { label: '24h Volume', value: humanize(globalStats.total_volume) }
              ].map(stat => (
                <div key={stat.label} style={{ display: 'flex', justifyContent: 'space-between', fontSize: 11, fontWeight: 600 }}>
                  <span style={{ color: 'var(--text-3)' }}>{stat.label}</span>
                  <span className="mono" style={{ color: 'var(--text-1)' }}>{stat.value}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Theme Toggle */}
        <div style={{ padding: sidebarCollapsed && !sidebarOpen ? '12px 8px' : '12px 16px', borderTop: '1px solid var(--border)' }}>
          <button 
            onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
            style={{
              display: 'flex', alignItems: 'center', gap: 10,
              justifyContent: sidebarCollapsed && !sidebarOpen ? 'center' : 'center',
              width: '100%', padding: '10px 14px', borderRadius: 12,
              fontSize: 13, fontWeight: 600,
              color: 'var(--text-2)',
              background: 'var(--bg-primary)',
              border: '1px solid var(--border)', cursor: 'pointer',
              transition: 'border-color 0.2s'
            }}
            onMouseEnter={e => e.currentTarget.style.borderColor = 'var(--accent)'}
            onMouseLeave={e => e.currentTarget.style.borderColor = 'var(--border)'}
          >
            <span style={{ fontSize: 16 }}>{theme === 'dark' ? '☀️' : '🌙'}</span>
            {(!sidebarCollapsed || sidebarOpen) && (
              <span>{theme === 'dark' ? 'Light Mode' : 'Dark Mode'}</span>
            )}
          </button>
        </div>
      </aside>
    </>
  );
}
