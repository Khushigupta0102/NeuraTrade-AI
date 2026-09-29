import React, { useMemo } from 'react';
import useAppStore from '../store/useAppStore';
import MetricCard from '../components/MetricCard';
import CoinTable from '../components/CoinTable';
import SkeletonLoader from '../components/SkeletonLoader';
import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip } from 'recharts';
import { formatPrice, formatPercent, isPositive } from '../utils/formatters';

export default function Dashboard() {
  const { coins, coinsLoading, trending, watchlist, toggleWatchlist, setActivePage, setSelectedCoin } = useAppStore();

  // Compute metrics
  const metrics = useMemo(() => {
    if (!coins.length) return null;
    const totalValue = coins.slice(0, 10).reduce((s, c) => s + (c.current_price || 0), 0);
    const changes = coins.map(c => c.price_change_percentage_24h || 0);
    const avg24h = changes.reduce((s, v) => s + v, 0) / changes.length;
    const best = [...coins].sort((a, b) => (b.price_change_percentage_24h || 0) - (a.price_change_percentage_24h || 0))[0];
    const worst = [...coins].sort((a, b) => (a.price_change_percentage_24h || 0) - (b.price_change_percentage_24h || 0))[0];
    return { totalValue, avg24h, best, worst };
  }, [coins]);

  // Simulated portfolio chart
  const portfolioChart = useMemo(() => {
    if (!coins[0]?.sparkline_in_7d?.price) return [];
    const spark = coins[0].sparkline_in_7d.price;
    return spark.filter((_, i) => i % 4 === 0).map((p, i) => ({
      day: i, value: p * 0.01,
    }));
  }, [coins]);

  const handleCoinClick = (coin) => {
    setSelectedCoin(coin);
    setActivePage('markets');
  };

  if (coinsLoading && !coins.length) {
    return (
      <div className="page-enter" style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(220px,1fr))', gap: 16 }}>
          <SkeletonLoader count={4} />
        </div>
        <SkeletonLoader type="chart" />
        <SkeletonLoader type="row" count={5} />
      </div>
    );
  }

  return (
    <div className="page-enter" style={{ display: 'flex', flexDirection: 'column', gap: 28, paddingBottom: 40 }}>
      {/* Welcome Header */}
      <div>
        <h1 style={{ fontSize: 26, fontWeight: 800, letterSpacing: '-0.02em', color: 'var(--text-1)', lineHeight: 1.3 }}>
          Market <span className="text-gradient">Overview</span>
        </h1>
        <p style={{ fontSize: 11, fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', color: 'var(--text-3)', marginTop: 4 }}>
          Real-time intelligence · Updated every 60s
        </p>
      </div>

      {/* Metric Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(220px,1fr))', gap: 16 }}>
        <MetricCard title="Top 10 Assets" value={metrics?.totalValue} icon="$" />
        <MetricCard title="Market Sentiment" value={metrics?.avg24h?.toFixed(2) + '%'} change={metrics?.avg24h} icon="~" />
        <MetricCard title="Top Gainer" value={metrics?.best?.name || '—'} change={metrics?.best?.price_change_percentage_24h} icon="+" />
        <MetricCard title="Biggest Drop" value={metrics?.worst?.name || '—'} change={metrics?.worst?.price_change_percentage_24h} icon="-" />
      </div>

      {/* Area Chart + Trending */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: 16 }}>
        <div className="lg-grid-chart" style={{ display: 'grid', gridTemplateColumns: '1fr', gap: 16 }}>
          {/* Chart */}
          <div className="card" style={{ padding: 24, display: 'flex', flexDirection: 'column', gap: 16 }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 8 }}>
              <div>
                <h3 style={{ fontSize: 16, fontWeight: 800, color: 'var(--text-1)', letterSpacing: '-0.01em' }}>Market Momentum</h3>
                <p style={{ fontSize: 11, fontWeight: 600, color: 'var(--text-3)', marginTop: 2 }}>BTC 7-Day Performance Index</p>
              </div>
              <div style={{ 
                padding: '5px 14px', borderRadius: 99, fontSize: 10, fontWeight: 800,
                background: 'var(--accent-dim)', color: 'var(--accent)', 
                letterSpacing: '0.1em', textTransform: 'uppercase'
              }}>
                ● Live
              </div>
            </div>
            
            <div style={{ width: '100%', minWidth: 0 }}>
              <ResponsiveContainer width="100%" height={250}>
                <AreaChart data={portfolioChart}>
                  <defs>
                    <linearGradient id="dashGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#6366f1" stopOpacity={0.35} />
                      <stop offset="95%" stopColor="#6366f1" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" opacity={0.3} vertical={false} />
                  <XAxis dataKey="day" hide />
                  <YAxis hide domain={['auto', 'auto']} />
                  <Tooltip 
                    contentStyle={{ 
                      background: 'rgba(11,13,20,0.95)', 
                      border: '1px solid var(--border)', 
                      borderRadius: 14, fontSize: 11,
                      backdropFilter: 'blur(12px)',
                      boxShadow: '0 8px 32px rgba(0,0,0,0.6)'
                    }}
                    itemStyle={{ fontWeight: 700, color: '#fff' }}
                    labelStyle={{ display: 'none' }}
                    formatter={(v) => [formatPrice(v * 100), 'Value']} 
                  />
                  <Area 
                    type="monotone" 
                    dataKey="value" 
                    stroke="#6366f1" 
                    strokeWidth={2.5} 
                    fill="url(#dashGrad)" 
                    dot={false}
                    activeDot={{ r: 6, fill: '#6366f1', stroke: '#fff', strokeWidth: 2 }}
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Trending */}
          <div className="card" style={{ padding: 24, display: 'flex', flexDirection: 'column', gap: 16 }}>
            <div>
              <h3 style={{ fontSize: 16, fontWeight: 800, color: 'var(--text-1)' }}>Hot 🔥</h3>
              <p style={{ fontSize: 11, fontWeight: 600, color: 'var(--text-3)', marginTop: 2 }}>Trending Assets</p>
            </div>
            
            {trending.length === 0 ? (
              <div style={{ padding: 32, textAlign: 'center' }}>
                <div style={{ fontSize: 28, opacity: 0.3, marginBottom: 8 }}>🔥</div>
                <div style={{ color: 'var(--text-3)', fontSize: 12, fontWeight: 600 }}>Loading trending data...</div>
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                {trending.slice(0, 5).map(t => (
                  <div 
                    key={t.id} 
                    onClick={() => handleCoinClick({ id: t.id, ...t })}
                    style={{ 
                      display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                      padding: '10px 14px', borderRadius: 14,
                      background: 'rgba(255,255,255,0.02)',
                      border: '1px solid transparent', cursor: 'pointer',
                      transition: 'all 0.2s'
                    }}
                    onMouseEnter={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.05)'; e.currentTarget.style.borderColor = 'var(--border-hover)'; }}
                    onMouseLeave={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.02)'; e.currentTarget.style.borderColor = 'transparent'; }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                      <img src={t.thumb} alt="" style={{ width: 32, height: 32, borderRadius: 10, boxShadow: 'var(--shadow-sm)' }} />
                      <div>
                        <div style={{ fontWeight: 700, fontSize: 13, color: 'var(--text-1)' }}>{t.name}</div>
                        <div style={{ fontSize: 10, fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', color: 'var(--text-3)' }}>{t.symbol}</div>
                      </div>
                    </div>
                    <span className="mono" style={{ fontSize: 10, fontWeight: 700, color: 'var(--text-3)', background: 'rgba(255,255,255,0.04)', padding: '4px 10px', borderRadius: 8 }}>
                      Rank #{t.market_cap_rank}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Market Assets Table */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 8 }}>
          <div>
            <h3 style={{ fontSize: 20, fontWeight: 800, color: 'var(--text-1)', letterSpacing: '-0.01em' }}>
              Institutional <span style={{ opacity: 0.4 }}>Assets</span>
            </h3>
            <p style={{ fontSize: 11, fontWeight: 600, color: 'var(--text-3)', marginTop: 2 }}>Live Market Depth (Top 10)</p>
          </div>
          <button 
            onClick={() => setActivePage('markets')}
            style={{ 
              fontSize: 11, fontWeight: 800, letterSpacing: '0.08em', textTransform: 'uppercase',
              color: 'var(--accent)', background: 'var(--accent-dim)', border: '1px solid rgba(99,102,241,0.2)',
              padding: '8px 16px', borderRadius: 10, cursor: 'pointer',
              transition: 'all 0.2s'
            }}
            onMouseEnter={e => { e.currentTarget.style.background = 'var(--accent)'; e.currentTarget.style.color = '#fff'; }}
            onMouseLeave={e => { e.currentTarget.style.background = 'var(--accent-dim)'; e.currentTarget.style.color = 'var(--accent)'; }}
          >
            View All Markets →
          </button>
        </div>
        <CoinTable coins={coins.slice(0, 10)} onCoinClick={handleCoinClick} watchlist={watchlist} onToggleWatchlist={toggleWatchlist} />
      </div>
    </div>
  );
}
