import React, { useMemo } from 'react';
import {
  ResponsiveContainer, ComposedChart, Line, Bar, XAxis, YAxis,
  CartesianGrid, Tooltip, Legend
} from 'recharts';
import { SMA, EMA, RSI as calcRSI, MACD as calcMACD, BollingerBands } from '../utils/indicators';
import { formatPrice, formatDate } from '../utils/formatters';

const CandlestickChart = React.memo(function CandlestickChart({ chartData, days = 30, showIndicators = true }) {
  const data = useMemo(() => {
    if (!chartData?.prices) return [];
    const prices = chartData.prices.slice(-(days + 1));
    const volumes = chartData.total_volumes?.slice(-(days + 1)) || [];
    const closes = prices.map(p => p[1]);
    const sma7 = SMA(closes, 7);
    const sma25 = SMA(closes, 25);
    const ema12 = EMA(closes, 12);
    const { macdLine, signalLine, histogram } = calcMACD(closes);
    const { upper, lower } = BollingerBands(closes, 20);

    return prices.map((p, i) => ({
      date: formatDate(p[0]),
      price: p[1],
      volume: volumes[i]?.[1] || 0,
      sma7: sma7[i],
      sma25: sma25[i],
      ema12: ema12[i],
      bbUpper: upper[i],
      bbLower: lower[i],
      macd: macdLine[i],
      signal: signalLine[i],
      hist: histogram[i],
    }));
  }, [chartData, days]);

  if (data.length === 0) {
    return (
      <div className="card" style={{ padding: 48, textAlign: 'center' }}>
        <div style={{ fontSize: 28, marginBottom: 8, opacity: 0.3 }}>📉</div>
        <div style={{ color: 'var(--text-2)', fontSize: 13, fontWeight: 600 }}>No chart data available</div>
      </div>
    );
  }

  return (
    <div className="card" style={{ padding: 20 }}>
      <div style={{ width: '100%', minWidth: 0 }}>
        <ResponsiveContainer width="100%" height={350}>
          <ComposedChart data={data}>
            <defs>
              <linearGradient id="areaGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#6366f1" stopOpacity={0.2} />
                <stop offset="95%" stopColor="#6366f1" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" opacity={0.4} vertical={false} />
            <XAxis dataKey="date" tick={{ fontSize: 10, fill: 'var(--text-3)' }} axisLine={{ stroke: 'var(--border)' }} tickLine={false} />
            <YAxis yAxisId="price" orientation="right" tick={{ fontSize: 10, fill: 'var(--text-3)' }} axisLine={false} tickLine={false} tickFormatter={v => '$' + v.toLocaleString()} domain={['auto', 'auto']} />
            <YAxis yAxisId="vol" orientation="left" tick={{ fontSize: 9, fill: 'var(--text-3)' }} axisLine={false} tickLine={false} tickFormatter={v => (v / 1e9).toFixed(1) + 'B'} width={50} />
            <Tooltip 
              contentStyle={{ 
                background: 'rgba(11,13,20,0.95)', 
                border: '1px solid var(--border)', 
                borderRadius: 14, fontSize: 11,
                backdropFilter: 'blur(12px)',
                boxShadow: '0 8px 32px rgba(0,0,0,0.6)'
              }}
              itemStyle={{ fontWeight: 700 }}
              labelStyle={{ color: 'var(--text-3)', fontSize: 10, fontWeight: 600 }}
              formatter={(val, name) => [name === 'Volume' ? '$' + (val / 1e9).toFixed(2) + 'B' : formatPrice(val), name]} 
            />
            <Legend wrapperStyle={{ fontSize: 10, fontWeight: 600, opacity: 0.7 }} />
            <Bar yAxisId="vol" dataKey="volume" fill="rgba(99,102,241,0.12)" name="Volume" radius={[2,2,0,0]} />
            <Line yAxisId="price" type="monotone" dataKey="price" stroke="#6366f1" strokeWidth={2} dot={false} name="Price" />
            {showIndicators && (
              <>
                <Line yAxisId="price" type="monotone" dataKey="sma7" stroke="var(--green)" strokeWidth={1} dot={false} name="SMA(7)" strokeDasharray="4 2" />
                <Line yAxisId="price" type="monotone" dataKey="sma25" stroke="var(--orange)" strokeWidth={1} dot={false} name="SMA(25)" strokeDasharray="4 2" />
                <Line yAxisId="price" type="monotone" dataKey="bbUpper" stroke="rgba(239,68,68,0.35)" strokeWidth={1} dot={false} name="BB Upper" strokeDasharray="2 2" />
                <Line yAxisId="price" type="monotone" dataKey="bbLower" stroke="rgba(239,68,68,0.35)" strokeWidth={1} dot={false} name="BB Lower" strokeDasharray="2 2" />
              </>
            )}
          </ComposedChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
});

export default CandlestickChart;
