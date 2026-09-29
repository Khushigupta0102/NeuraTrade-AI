/**
 * CoinTable — Sortable crypto coin list with full data visibility and scroll support
 */
import React, { useState, useMemo } from 'react';
import { formatPrice, formatPercent, humanize, isPositive } from '../utils/formatters';

const COLUMNS = [
  { key: 'market_cap_rank', label: '#', width: '50px' },
  { key: 'name', label: 'Coin', width: '180px' },
  { key: 'current_price', label: 'Price', width: '120px' },
  { key: 'price_change_percentage_24h', label: '24h %', width: '100px' },
  { key: 'price_change_percentage_7d_in_currency', label: '7d %', width: '90px' },
  { key: 'market_cap', label: 'Market Cap', width: '130px' },
  { key: 'total_volume', label: 'Volume 24h', width: '130px' },
];

const CoinTable = React.memo(function CoinTable({ coins, onCoinClick, watchlist = [], onToggleWatchlist }) {
  const [sortKey, setSortKey] = useState('market_cap_rank');
  const [sortDir, setSortDir] = useState('asc');

  const handleSort = (key) => {
    if (sortKey === key) setSortDir(d => d === 'asc' ? 'desc' : 'asc');
    else { setSortKey(key); setSortDir('asc'); }
  };

  const sorted = useMemo(() => {
    return [...coins].sort((a, b) => {
      const aVal = a[sortKey] ?? 0;
      const bVal = b[sortKey] ?? 0;
      if (typeof aVal === 'string') return sortDir === 'asc' ? aVal.localeCompare(bVal) : bVal.localeCompare(aVal);
      return sortDir === 'asc' ? aVal - bVal : bVal - aVal;
    });
  }, [coins, sortKey, sortDir]);

  if (!coins.length) {
    return (
      <div className="card" style={{ padding: 48, textAlign: 'center' }}>
        <div style={{ fontSize: 36, marginBottom: 12, opacity: 0.4 }}>📭</div>
        <div style={{ color: 'var(--text-2)', fontSize: 14, fontWeight: 600 }}>No coins to display</div>
        <div style={{ color: 'var(--text-3)', fontSize: 12, marginTop: 4 }}>Data will appear once loaded</div>
      </div>
    );
  }

  return (
    <div className="card" style={{ overflow: 'hidden' }}>
      <div className="table-scroll">
        <table style={{ width: '100%', fontSize: 13, borderCollapse: 'collapse', minWidth: 780 }}>
          <thead>
            <tr style={{ borderBottom: '1px solid var(--border)', background: 'rgba(255,255,255,0.02)' }}>
              <th style={{ padding: '14px 16px', textAlign: 'left', width: 48 }}>
                <span style={{ opacity: 0.3, fontSize: 14 }}>★</span>
              </th>
              {COLUMNS.map(col => (
                <th
                  key={col.key}
                  onClick={() => handleSort(col.key)}
                  style={{ 
                    padding: '14px 16px', textAlign: 'left', cursor: 'pointer',
                    width: col.width, userSelect: 'none',
                    transition: 'color 0.2s'
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                    <span style={{ 
                      fontSize: 10, fontWeight: 800, letterSpacing: '0.12em', 
                      textTransform: 'uppercase', color: sortKey === col.key ? 'var(--accent)' : 'var(--text-3)'
                    }}>
                      {col.label}
                    </span>
                    {sortKey === col.key && (
                      <span style={{ color: 'var(--accent)', fontSize: 11 }}>
                        {sortDir === 'asc' ? '↑' : '↓'}
                      </span>
                    )}
                  </div>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {sorted.map((coin) => {
              const isWatched = watchlist.includes(coin.id);
              const change24 = coin.price_change_percentage_24h;
              const change7d = coin.price_change_percentage_7d_in_currency;
              
              return (
                <tr
                  key={coin.id}
                  onClick={() => onCoinClick?.(coin)}
                  style={{ borderBottom: '1px solid var(--border)', cursor: 'pointer', transition: 'background 0.15s' }}
                  onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,255,255,0.03)'}
                  onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                >
                  <td style={{ padding: '14px 16px' }}>
                    <button
                      onClick={(e) => { e.stopPropagation(); onToggleWatchlist?.(coin.id); }}
                      style={{ 
                        fontSize: 16, background: 'none', border: 'none', cursor: 'pointer',
                        color: isWatched ? '#facc15' : 'var(--text-3)',
                        filter: isWatched ? 'drop-shadow(0 0 6px rgba(250,204,21,0.4))' : 'none',
                        transition: 'all 0.2s', lineHeight: 1
                      }}
                    >
                      {isWatched ? '★' : '☆'}
                    </button>
                  </td>
                  <td style={{ padding: '14px 16px' }}>
                    <span className="mono" style={{ fontWeight: 700, opacity: 0.25, fontSize: 11, color: 'var(--text-3)' }}>
                      {coin.market_cap_rank?.toString().padStart(2, '0')}
                    </span>
                  </td>
                  <td style={{ padding: '14px 16px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                      <div style={{ position: 'relative', flexShrink: 0 }}>
                        {coin.image && (
                          <img
                            src={coin.image}
                            alt={coin.name}
                            style={{ width: 36, height: 36, borderRadius: 10, boxShadow: 'var(--shadow-sm)' }}
                            loading="lazy"
                            onError={(e) => e.target.style.display = 'none'}
                          />
                        )}
                      </div>
                      <div style={{ display: 'flex', flexDirection: 'column', minWidth: 0 }}>
                        <span style={{ fontWeight: 700, fontSize: 13, color: 'var(--text-1)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{coin.name}</span>
                        <span style={{ fontSize: 10, fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', color: 'var(--text-3)' }}>{coin.symbol}</span>
                      </div>
                    </div>
                  </td>
                  <td style={{ padding: '14px 16px' }}>
                    <span className="mono" style={{ fontWeight: 700, fontSize: 13, color: 'var(--text-1)' }}>
                      {formatPrice(coin.current_price)}
                    </span>
                  </td>
                  <td style={{ padding: '14px 16px' }}>
                    <span 
                      className="pill"
                      style={{ 
                        background: isPositive(change24) ? 'var(--green-dim)' : 'var(--red-dim)',
                        color: isPositive(change24) ? 'var(--green)' : 'var(--red)',
                        borderColor: isPositive(change24) ? 'rgba(34,197,94,0.2)' : 'rgba(239,68,68,0.2)',
                        fontSize: 11, fontWeight: 700
                      }}
                    >
                      {isPositive(change24) ? '▲' : '▼'} {formatPercent(change24)}
                    </span>
                  </td>
                  <td style={{ padding: '14px 16px' }}>
                    <span className="mono" style={{ 
                      fontWeight: 600, fontSize: 12, 
                      color: isPositive(change7d) ? 'var(--green)' : 'var(--red)' 
                    }}>
                      {formatPercent(change7d)}
                    </span>
                  </td>
                  <td style={{ padding: '14px 16px' }}>
                    <span className="mono" style={{ fontWeight: 600, fontSize: 12, color: 'var(--text-2)' }}>
                      {humanize(coin.market_cap)}
                    </span>
                  </td>
                  <td style={{ padding: '14px 16px' }}>
                    <span className="mono" style={{ fontWeight: 600, fontSize: 12, color: 'var(--text-2)' }}>
                      {humanize(coin.total_volume)}
                    </span>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
});

export default CoinTable;
