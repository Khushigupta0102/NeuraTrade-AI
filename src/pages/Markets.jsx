import React, { useState, useEffect, useMemo } from 'react';
import toast from 'react-hot-toast';
import useAppStore from '../store/useAppStore';
import CoinTable from '../components/CoinTable';
import CandlestickChart from '../components/CandlestickChart';
import PredictionChart from '../components/PredictionChart';
import SkeletonLoader from '../components/SkeletonLoader';
import { fetchCoinDetail } from '../hooks/useCoinData';
import { usePricePrediction } from '../hooks/usePricePrediction';
import { formatPrice, formatPercent, isPositive, humanize } from '../utils/formatters';
import { RSI, MACD } from '../utils/indicators';

export default function Markets() {
  const { coins, coinsLoading, searchQuery, watchlist, toggleWatchlist, selectedCoin, setSelectedCoin, diaPrices, portfolio, addHolding } = useAppStore();
  const [filter, setFilter] = useState('all');
  const [chartDays, setChartDays] = useState(30);
  const [coinData, setCoinData] = useState(null);
  const [loadingDetail, setLoadingDetail] = useState(false);
  const { predict, training, progress } = usePricePrediction();
  const [predictions, setPredictions] = useState(null);

  // Filter coins
  const filtered = useMemo(() => {
    let list = [...coins];
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      list = list.filter(c => c.name?.toLowerCase().includes(q) || c.symbol?.toLowerCase().includes(q));
    }
    switch (filter) {
      case 'gainers': list.sort((a, b) => (b.price_change_percentage_24h || 0) - (a.price_change_percentage_24h || 0)); break;
      case 'losers': list.sort((a, b) => (a.price_change_percentage_24h || 0) - (b.price_change_percentage_24h || 0)); break;
      case 'watchlist': list = list.filter(c => watchlist.includes(c.id)); break;
      default: break;
    }
    return list;
  }, [coins, searchQuery, filter, watchlist]);

  // Load detail when coin selected
  useEffect(() => {
    if (!selectedCoin?.id) return;
    setLoadingDetail(true);
    setPredictions(null);
    fetchCoinDetail(selectedCoin.id).then(data => {
      setCoinData(data);
      setLoadingDetail(false);
    });
  }, [selectedCoin?.id]);

  const handlePredict = async () => {
    if (!coinData?.chart?.prices) {
      toast.error('No chart data available for prediction', { id: 'pred-err' });
      return;
    }
    const closes = coinData.chart.prices.map(p => p[1]);
    if (closes.length < 20) {
      toast.error('Not enough historical data (need ≥20 days)', { id: 'pred-err' });
      return;
    }
    const result = await predict(selectedCoin.id, closes);
    if (result) {
      setPredictions(result);
      toast.success(`${selectedCoin.name} — 7-day forecast generated!`, { id: 'pred-ok' });
    } else {
      toast.error('Prediction failed — please try again', { id: 'pred-err' });
    }
  };

  const handleAddToPortfolio = () => {
    if (selectedCoin) {
      addHolding({ coinId: selectedCoin.id, quantity: 1, buyPrice: selectedCoin.current_price, buyDate: new Date().toISOString().split('T')[0] });
    }
  };

  const currentPrices = coinData?.chart?.prices?.map(p => p[1]) || [];
  const rsiValues = currentPrices.length > 14 ? RSI(currentPrices, 14) : [];
  const currentRSI = rsiValues.filter(v => v != null).pop();
  const { macdLine, signalLine } = currentPrices.length > 26 ? MACD(currentPrices) : { macdLine: [], signalLine: [] };
  const latestMACD = macdLine.filter(v => v != null).pop();
  const latestSignal = signalLine.filter(v => v != null).pop();

  const diaPrice = selectedCoin?.symbol?.toUpperCase() ? diaPrices[selectedCoin.symbol.toUpperCase()] : null;

  return (
    <div className="page-enter" style={{ display: 'flex', flexDirection: 'column', gap: 24, paddingBottom: 40 }}>
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', flexWrap: 'wrap', gap: 16 }}>
        <div>
          <h1 style={{ fontSize: 26, fontWeight: 800, color: 'var(--text-1)', letterSpacing: '-0.02em' }}>Markets</h1>
          <p style={{ fontSize: 13, color: 'var(--text-3)', marginTop: 4 }}>Explore and analyze cryptocurrency markets.</p>
        </div>
        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
          {[
            { id: 'all', label: '📋 All' },
            { id: 'gainers', label: '🟢 Gainers' },
            { id: 'losers', label: '🔴 Losers' },
            { id: 'watchlist', label: '⭐ Watchlist' }
          ].map(f => (
            <button 
              key={f.id} 
              onClick={() => setFilter(f.id)}
              style={{
                padding: '8px 16px', borderRadius: 12,
                fontSize: 12, fontWeight: 700, textTransform: 'capitalize',
                background: filter === f.id ? 'var(--accent)' : 'var(--bg-card)',
                color: filter === f.id ? '#fff' : 'var(--text-2)',
                border: `1px solid ${filter === f.id ? 'var(--accent)' : 'var(--border)'}`,
                cursor: 'pointer', transition: 'all 0.2s',
                boxShadow: filter === f.id ? '0 4px 12px rgba(99,102,241,0.3)' : 'none'
              }}
              onMouseEnter={e => { if (filter !== f.id) { e.currentTarget.style.borderColor = 'var(--accent)'; e.currentTarget.style.color = 'var(--text-1)'; } }}
              onMouseLeave={e => { if (filter !== f.id) { e.currentTarget.style.borderColor = 'var(--border)'; e.currentTarget.style.color = 'var(--text-2)'; } }}
            >
              {f.label}
            </button>
          ))}
        </div>
      </div>

      <CoinTable coins={filtered} onCoinClick={setSelectedCoin} watchlist={watchlist} onToggleWatchlist={toggleWatchlist} />

      {/* Coin Detail Modal */}
      {selectedCoin && (
        <div 
          style={{
            position: 'fixed', inset: 0, zIndex: 100,
            background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(8px)',
            display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 16
          }}
          onClick={() => setSelectedCoin(null)}
        >
          <div 
            className="card-static"
            style={{
              width: '100%', maxWidth: 840, maxHeight: '90vh', overflowY: 'auto',
              padding: 24, display: 'flex', flexDirection: 'column', gap: 20
            }}
            onClick={e => e.stopPropagation()}
          >
            {/* Header */}
            <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
                {selectedCoin.image && (
                  <img src={selectedCoin.image} alt="" style={{ width: 48, height: 48, borderRadius: 14, boxShadow: 'var(--shadow-md)' }} />
                )}
                <div>
                  <h2 style={{ fontSize: 24, fontWeight: 800, color: 'var(--text-1)', letterSpacing: '-0.02em', lineHeight: 1.2 }}>{selectedCoin.name}</h2>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 4 }}>
                    <span style={{ fontSize: 11, fontWeight: 800, letterSpacing: '0.1em', textTransform: 'uppercase', color: 'var(--text-3)', background: 'rgba(255,255,255,0.05)', padding: '2px 8px', borderRadius: 6 }}>{selectedCoin.symbol}</span>
                    <span style={{ fontSize: 11, fontWeight: 600, color: 'var(--text-3)' }}>Rank #{selectedCoin.market_cap_rank}</span>
                  </div>
                </div>
              </div>
              <button 
                onClick={() => setSelectedCoin(null)} 
                style={{ 
                  width: 36, height: 36, borderRadius: 10, background: 'rgba(255,255,255,0.05)',
                  border: 'none', color: 'var(--text-2)', fontSize: 18, cursor: 'pointer',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  transition: 'background 0.2s, color 0.2s'
                }}
                onMouseEnter={e => { e.currentTarget.style.background = 'rgba(239,68,68,0.1)'; e.currentTarget.style.color = 'var(--red)'; }}
                onMouseLeave={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.05)'; e.currentTarget.style.color = 'var(--text-2)'; }}
              >✕</button>
            </div>

            {/* Price Cards Grid */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: 12 }}>
              <div style={{ background: 'var(--bg-secondary)', padding: 16, borderRadius: 16, border: '1px solid var(--border)' }}>
                <div style={{ fontSize: 10, fontWeight: 800, letterSpacing: '0.05em', textTransform: 'uppercase', color: 'var(--text-3)', marginBottom: 6 }}>CoinGecko Price</div>
                <div className="mono" style={{ fontSize: 20, fontWeight: 800, color: 'var(--text-1)' }}>{formatPrice(selectedCoin.current_price)}</div>
              </div>
              {diaPrice && (
                <div style={{ background: 'var(--bg-secondary)', padding: 16, borderRadius: 16, border: '1px solid var(--border)' }}>
                  <div style={{ fontSize: 10, fontWeight: 800, letterSpacing: '0.05em', textTransform: 'uppercase', color: 'var(--text-3)', marginBottom: 6 }}>DIA Oracle</div>
                  <div className="mono" style={{ fontSize: 20, fontWeight: 800, color: 'var(--green)' }}>{formatPrice(diaPrice)}</div>
                </div>
              )}
              <div style={{ background: 'var(--bg-secondary)', padding: 16, borderRadius: 16, border: '1px solid var(--border)' }}>
                <div style={{ fontSize: 10, fontWeight: 800, letterSpacing: '0.05em', textTransform: 'uppercase', color: 'var(--text-3)', marginBottom: 6 }}>24h Change</div>
                <div className="mono" style={{ fontSize: 20, fontWeight: 800, color: isPositive(selectedCoin.price_change_percentage_24h) ? 'var(--green)' : 'var(--red)' }}>
                  {formatPercent(selectedCoin.price_change_percentage_24h)}
                </div>
              </div>
            </div>

            {/* Indicators Grid */}
            {currentRSI != null && (
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: 12 }}>
                <div style={{ background: 'var(--bg-secondary)', padding: 16, borderRadius: 16, border: '1px solid var(--border)', textAlign: 'center' }}>
                  <div style={{ fontSize: 10, fontWeight: 700, color: 'var(--text-3)', marginBottom: 4 }}>RSI(14)</div>
                  <div className="mono" style={{ fontSize: 16, fontWeight: 700, color: currentRSI < 30 ? 'var(--green)' : currentRSI > 70 ? 'var(--red)' : 'var(--text-1)' }}>
                    {currentRSI?.toFixed(1)}
                  </div>
                </div>
                <div style={{ background: 'var(--bg-secondary)', padding: 16, borderRadius: 16, border: '1px solid var(--border)', textAlign: 'center' }}>
                  <div style={{ fontSize: 10, fontWeight: 700, color: 'var(--text-3)', marginBottom: 4 }}>MACD</div>
                  <div className="mono" style={{ fontSize: 16, fontWeight: 700, color: latestMACD > latestSignal ? 'var(--green)' : 'var(--red)' }}>
                    {latestMACD?.toFixed(2) || '—'}
                  </div>
                </div>
                <div style={{ background: 'var(--bg-secondary)', padding: 16, borderRadius: 16, border: '1px solid var(--border)', textAlign: 'center' }}>
                  <div style={{ fontSize: 10, fontWeight: 700, color: 'var(--text-3)', marginBottom: 4 }}>Market Cap</div>
                  <div className="mono" style={{ fontSize: 16, fontWeight: 700, color: 'var(--text-1)' }}>{humanize(selectedCoin.market_cap)}</div>
                </div>
              </div>
            )}

            {/* Chart Tools */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderTop: '1px solid var(--border)', paddingTop: 20, marginTop: 4 }}>
              <h3 style={{ fontSize: 16, fontWeight: 800, color: 'var(--text-1)' }}>Price Chart</h3>
              <div style={{ display: 'flex', background: 'var(--bg-secondary)', padding: 4, borderRadius: 10, border: '1px solid var(--border)' }}>
                {[7, 30, 90].map(d => (
                  <button key={d} onClick={() => setChartDays(d)}
                    style={{ 
                      padding: '4px 12px', borderRadius: 6, fontSize: 11, fontWeight: 700, border: 'none', cursor: 'pointer',
                      background: chartDays === d ? 'var(--accent)' : 'transparent', 
                      color: chartDays === d ? '#fff' : 'var(--text-2)',
                      transition: 'all 0.2s'
                    }}>
                    {d}D
                  </button>
                ))}
              </div>
            </div>

            {/* Chart */}
            <div style={{ minHeight: 350 }}>
              {loadingDetail ? <SkeletonLoader type="chart" /> : coinData?.chart && <CandlestickChart chartData={coinData.chart} days={chartDays} />}
            </div>

            {/* Action Buttons */}
            <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', borderTop: '1px solid var(--border)', paddingTop: 20 }}>
              <button 
                onClick={handlePredict} disabled={training || !coinData?.chart}
                style={{ 
                  flex: 1, minWidth: 200, padding: '12px 20px', borderRadius: 12, fontSize: 13, fontWeight: 800, 
                  background: 'linear-gradient(135deg, #f59e0b, #ef4444)', color: '#fff', border: 'none', cursor: training ? 'not-allowed' : 'pointer',
                  opacity: training || !coinData?.chart ? 0.6 : 1, transition: 'transform 0.2s, box-shadow 0.2s',
                  boxShadow: '0 4px 12px rgba(245,158,11,0.3)'
                }}
                onMouseEnter={e => { if (!training && coinData?.chart) e.currentTarget.style.transform = 'translateY(-2px)' }}
                onMouseLeave={e => { e.currentTarget.style.transform = 'none' }}
              >
                {training ? `Analyzing Patterns... ${progress}%` : '🧠 AI Price Prediction'}
              </button>
              
              <button 
                onClick={() => toggleWatchlist(selectedCoin.id)}
                style={{ 
                  flex: 1, minWidth: 150, padding: '12px 20px', borderRadius: 12, fontSize: 13, fontWeight: 700, 
                  background: 'var(--bg-secondary)', color: watchlist.includes(selectedCoin.id) ? '#facc15' : 'var(--text-1)', 
                  border: `1px solid ${watchlist.includes(selectedCoin.id) ? 'rgba(250,204,21,0.3)' : 'var(--border)'}`, 
                  cursor: 'pointer', transition: 'all 0.2s'
                }}
                onMouseEnter={e => e.currentTarget.style.borderColor = 'rgba(250,204,21,0.5)'}
                onMouseLeave={e => e.currentTarget.style.borderColor = watchlist.includes(selectedCoin.id) ? 'rgba(250,204,21,0.3)' : 'var(--border)'}
              >
                {watchlist.includes(selectedCoin.id) ? '⭐ In Watchlist' : '☆ Add to Watchlist'}
              </button>

              <button 
                onClick={handleAddToPortfolio}
                style={{ 
                  flex: 1, minWidth: 150, padding: '12px 20px', borderRadius: 12, fontSize: 13, fontWeight: 700, 
                  background: 'var(--bg-secondary)', color: 'var(--text-1)', 
                  border: '1px solid var(--border)', cursor: 'pointer', transition: 'all 0.2s'
                }}
                onMouseEnter={e => { e.currentTarget.style.borderColor = 'var(--accent)'; e.currentTarget.style.color = 'var(--accent)'; }}
                onMouseLeave={e => { e.currentTarget.style.borderColor = 'var(--border)'; e.currentTarget.style.color = 'var(--text-1)'; }}
              >
                💼 Add to Portfolio
              </button>
            </div>

            {/* Training progress */}
            {training && (
              <div style={{ width: '100%', height: 6, borderRadius: 99, background: 'var(--bg-secondary)', overflow: 'hidden' }}>
                <div style={{ width: `${progress}%`, height: '100%', background: 'linear-gradient(90deg, #f59e0b, #ef4444)', transition: 'width 0.3s ease' }} />
              </div>
            )}

            {/* Prediction */}
            {predictions && coinData?.chart?.prices && (
              <div style={{ marginTop: 8 }}>
                <PredictionChart historicalPrices={coinData.chart.prices.map(p => p[1])} predictions={predictions} title={`${selectedCoin.name} — 7-Day AI Forecast`} />
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
