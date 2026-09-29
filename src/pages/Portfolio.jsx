import React, { useState, useMemo } from 'react';
import useAppStore from '../store/useAppStore';
import PortfolioPieChart from '../components/PortfolioPieChart';
import { formatPrice, formatPercent, isPositive } from '../utils/formatters';
import { ResponsiveContainer, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip } from 'recharts';

export default function Portfolio() {
  const { coins, portfolio, addHolding, removeHolding, clearPortfolio } = useAppStore();
  const [form, setForm] = useState({ coinId: '', quantity: '', buyPrice: '', buyDate: '' });

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!form.coinId || !form.quantity) return;
    addHolding({
      coinId: form.coinId,
      quantity: parseFloat(form.quantity),
      buyPrice: parseFloat(form.buyPrice) || 0,
      buyDate: form.buyDate || new Date().toISOString().split('T')[0],
    });
    setForm({ coinId: '', quantity: '', buyPrice: '', buyDate: '' });
  };

  // Calculate holdings with current prices
  const holdings = useMemo(() => {
    return portfolio.map(h => {
      const coin = coins.find(c => c.id === h.coinId);
      const currentPrice = coin?.current_price || h.buyPrice;
      const value = currentPrice * h.quantity;
      const cost = h.buyPrice * h.quantity;
      const pnl = value - cost;
      const pnlPercent = cost > 0 ? (pnl / cost) * 100 : 0;
      return { ...h, coin, currentPrice, value, pnl, pnlPercent };
    });
  }, [portfolio, coins]);

  const totalValue = holdings.reduce((s, h) => s + h.value, 0);
  const totalPnl = holdings.reduce((s, h) => s + h.pnl, 0);

  // Simulated historical value
  const histChart = useMemo(() => {
    return Array.from({ length: 30 }, (_, i) => ({
      day: i + 1,
      value: totalValue * (0.85 + 0.15 * Math.sin(i / 5) + i / 200 + Math.random() * 0.02),
    }));
  }, [totalValue]);

  const exportCSV = () => {
    const header = 'Coin,Quantity,Buy Price,Current Price,Value,PnL,PnL %\n';
    const rows = holdings.map(h =>
      `${h.coinId},${h.quantity},${h.buyPrice},${h.currentPrice},${h.value.toFixed(2)},${h.pnl.toFixed(2)},${h.pnlPercent.toFixed(2)}%`
    ).join('\n');
    const blob = new Blob([header + rows], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url; a.download = 'portfolio.csv'; a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="page-enter" style={{ display: 'flex', flexDirection: 'column', gap: 24, paddingBottom: 40 }}>
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', flexWrap: 'wrap', gap: 16 }}>
        <div>
          <h1 style={{ fontSize: 26, fontWeight: 800, color: 'var(--text-1)', letterSpacing: '-0.02em' }}>Portfolio</h1>
          <p style={{ fontSize: 13, color: 'var(--text-3)', marginTop: 4 }}>Track your crypto assets and performance.</p>
        </div>
        <div style={{ display: 'flex', gap: 8 }}>
          <button 
            onClick={exportCSV} 
            style={{ 
              padding: '8px 16px', borderRadius: 10, fontSize: 12, fontWeight: 700, 
              background: 'var(--accent)', color: '#fff', border: 'none', cursor: 'pointer',
              boxShadow: '0 4px 12px rgba(99,102,241,0.3)', transition: 'transform 0.2s'
            }}
            onMouseEnter={e => e.currentTarget.style.transform = 'translateY(-2px)'}
            onMouseLeave={e => e.currentTarget.style.transform = 'none'}
          >
            📥 Export CSV
          </button>
          <button 
            onClick={clearPortfolio} 
            style={{ 
              padding: '8px 16px', borderRadius: 10, fontSize: 12, fontWeight: 700, 
              background: 'var(--bg-card)', color: 'var(--red)', border: '1px solid var(--border)', cursor: 'pointer',
              transition: 'background 0.2s, border-color 0.2s'
            }}
            onMouseEnter={e => { e.currentTarget.style.background = 'rgba(239,68,68,0.1)'; e.currentTarget.style.borderColor = 'rgba(239,68,68,0.3)'; }}
            onMouseLeave={e => { e.currentTarget.style.background = 'var(--bg-card)'; e.currentTarget.style.borderColor = 'var(--border)'; }}
          >
            🗑 Clear
          </button>
        </div>
      </div>

      {/* Summary cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 16 }}>
        <div className="card" style={{ padding: 24 }}>
          <div style={{ fontSize: 10, fontWeight: 800, letterSpacing: '0.12em', textTransform: 'uppercase', color: 'var(--text-3)', marginBottom: 12 }}>Total Value</div>
          <div className="mono" style={{ fontSize: 28, fontWeight: 800, color: 'var(--text-1)', lineHeight: 1.2 }}>{formatPrice(totalValue)}</div>
        </div>
        <div className="card" style={{ padding: 24, position: 'relative', overflow: 'hidden' }}>
          <div style={{ position: 'absolute', top: -20, right: -20, width: 80, height: 80, borderRadius: '50%', background: isPositive(totalPnl) ? 'var(--green)' : 'var(--red)', filter: 'blur(40px)', opacity: 0.15 }} />
          <div style={{ fontSize: 10, fontWeight: 800, letterSpacing: '0.12em', textTransform: 'uppercase', color: 'var(--text-3)', marginBottom: 12, position: 'relative', zIndex: 1 }}>Total PnL</div>
          <div className="mono" style={{ fontSize: 28, fontWeight: 800, color: isPositive(totalPnl) ? 'var(--green)' : 'var(--red)', lineHeight: 1.2, position: 'relative', zIndex: 1 }}>{formatPrice(totalPnl)}</div>
        </div>
        <div className="card" style={{ padding: 24 }}>
          <div style={{ fontSize: 10, fontWeight: 800, letterSpacing: '0.12em', textTransform: 'uppercase', color: 'var(--text-3)', marginBottom: 12 }}>Holdings</div>
          <div className="mono" style={{ fontSize: 28, fontWeight: 800, color: 'var(--text-1)', lineHeight: 1.2 }}>{portfolio.length}</div>
        </div>
      </div>

      {/* Add holding form */}
      <form onSubmit={handleSubmit} className="card" style={{ padding: 24 }}>
        <h3 style={{ fontSize: 14, fontWeight: 800, color: 'var(--text-1)', marginBottom: 16 }}>Add New Asset</h3>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: 12 }}>
          <select 
            value={form.coinId} onChange={e => setForm(f => ({ ...f, coinId: e.target.value }))}
            className="input-base" style={{ padding: '10px 14px', fontSize: 13, height: 40 }}
          >
            <option value="">Select coin...</option>
            {coins.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
          </select>
          <input 
            type="number" step="any" placeholder="Quantity" value={form.quantity} onChange={e => setForm(f => ({ ...f, quantity: e.target.value }))}
            className="input-base mono" style={{ padding: '10px 14px', fontSize: 13, height: 40 }} 
          />
          <input 
            type="number" step="any" placeholder="Buy Price ($)" value={form.buyPrice} onChange={e => setForm(f => ({ ...f, buyPrice: e.target.value }))}
            className="input-base mono" style={{ padding: '10px 14px', fontSize: 13, height: 40 }} 
          />
          <input 
            type="date" value={form.buyDate} onChange={e => setForm(f => ({ ...f, buyDate: e.target.value }))}
            className="input-base" style={{ padding: '10px 14px', fontSize: 13, height: 40 }} 
          />
          <button 
            type="submit" 
            style={{ 
              padding: '10px 16px', borderRadius: 12, fontSize: 13, fontWeight: 700, height: 40,
              background: 'var(--accent)', color: '#fff', border: 'none', cursor: 'pointer',
              transition: 'background 0.2s'
            }}
            onMouseEnter={e => e.currentTarget.style.background = '#4f46e5'}
            onMouseLeave={e => e.currentTarget.style.background = 'var(--accent)'}
          >
            + Add Asset
          </button>
        </div>
      </form>

      {/* Charts row */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(350px, 1fr))', gap: 16 }}>
        <PortfolioPieChart holdings={portfolio} coins={coins} />
        {totalValue > 0 && (
          <div className="card" style={{ padding: 20 }}>
            <h3 style={{ fontSize: 13, fontWeight: 700, color: 'var(--text-1)', marginBottom: 16 }}>Portfolio History (Simulated)</h3>
            <ResponsiveContainer width="100%" height={250}>
              <LineChart data={histChart}>
                <defs>
                  <linearGradient id="histGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#6366f1" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#6366f1" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" opacity={0.3} vertical={false} />
                <XAxis dataKey="day" tick={{ fontSize: 10, fill: 'var(--text-3)' }} axisLine={{ stroke: 'var(--border)' }} tickLine={false} />
                <YAxis tick={{ fontSize: 10, fill: 'var(--text-3)' }} axisLine={false} tickLine={false} tickFormatter={v => '$' + v.toLocaleString()} domain={['auto', 'auto']} />
                <Tooltip 
                  contentStyle={{ 
                    background: 'rgba(11,13,20,0.95)', 
                    border: '1px solid var(--border)', 
                    borderRadius: 14, fontSize: 11,
                    backdropFilter: 'blur(12px)',
                    boxShadow: '0 8px 32px rgba(0,0,0,0.6)'
                  }} 
                  formatter={v => [formatPrice(v), 'Value']} 
                />
                <Line type="monotone" dataKey="value" stroke="#6366f1" strokeWidth={3} dot={false} activeDot={{ r: 6, fill: '#6366f1', stroke: '#fff', strokeWidth: 2 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        )}
      </div>

      {/* Holdings table */}
      {holdings.length > 0 && (
        <div className="card" style={{ overflow: 'hidden' }}>
          <div className="table-scroll">
            <table style={{ width: '100%', fontSize: 13, borderCollapse: 'collapse', minWidth: 780 }}>
              <thead>
                <tr style={{ borderBottom: '1px solid var(--border)', background: 'rgba(255,255,255,0.02)' }}>
                  {['Asset', 'Qty', 'Avg Buy', 'Current Price', 'Total Value', 'PnL ($)', 'PnL (%)', ''].map(h => (
                    <th key={h} style={{ padding: '14px 16px', textAlign: 'left', fontSize: 10, fontWeight: 800, letterSpacing: '0.12em', textTransform: 'uppercase', color: 'var(--text-3)' }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {holdings.map((h, i) => (
                  <tr key={h.id} style={{ borderBottom: i === holdings.length - 1 ? 'none' : '1px solid var(--border)', transition: 'background 0.15s' }}
                      onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,255,255,0.03)'}
                      onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                  >
                    <td style={{ padding: '14px 16px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                        {h.coin?.image && <img src={h.coin.image} alt="" style={{ width: 28, height: 28, borderRadius: 8 }} />}
                        <span style={{ fontWeight: 700, color: 'var(--text-1)' }}>{h.coin?.name || h.coinId}</span>
                      </div>
                    </td>
                    <td className="mono" style={{ padding: '14px 16px', color: 'var(--text-2)' }}>{h.quantity}</td>
                    <td className="mono" style={{ padding: '14px 16px', color: 'var(--text-2)' }}>{formatPrice(h.buyPrice)}</td>
                    <td className="mono" style={{ padding: '14px 16px', fontWeight: 600, color: 'var(--text-1)' }}>{formatPrice(h.currentPrice)}</td>
                    <td className="mono" style={{ padding: '14px 16px', fontWeight: 700, color: 'var(--text-1)' }}>{formatPrice(h.value)}</td>
                    <td className="mono" style={{ padding: '14px 16px', fontWeight: 700, color: isPositive(h.pnl) ? 'var(--green)' : 'var(--red)' }}>
                      {isPositive(h.pnl) ? '+' : ''}{formatPrice(h.pnl)}
                    </td>
                    <td style={{ padding: '14px 16px' }}>
                      <span className="pill" style={{ 
                        background: isPositive(h.pnlPercent) ? 'var(--green-dim)' : 'var(--red-dim)',
                        color: isPositive(h.pnlPercent) ? 'var(--green)' : 'var(--red)',
                        fontSize: 11, fontWeight: 700,
                        border: 'none'
                      }}>
                        {isPositive(h.pnlPercent) ? '▲' : '▼'} {formatPercent(h.pnlPercent)}
                      </span>
                    </td>
                    <td style={{ padding: '14px 16px', textAlign: 'right' }}>
                      <button 
                        onClick={() => removeHolding(h.id)} 
                        style={{ 
                          background: 'rgba(239,68,68,0.1)', color: 'var(--red)', border: 'none', 
                          width: 28, height: 28, borderRadius: 8, cursor: 'pointer',
                          display: 'flex', alignItems: 'center', justifyContent: 'center',
                          transition: 'background 0.2s'
                        }}
                        onMouseEnter={e => e.currentTarget.style.background = 'rgba(239,68,68,0.2)'}
                        onMouseLeave={e => e.currentTarget.style.background = 'rgba(239,68,68,0.1)'}
                      >✕</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
