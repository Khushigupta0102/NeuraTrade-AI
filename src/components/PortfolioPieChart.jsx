import React from 'react';
import { ResponsiveContainer, PieChart, Pie, Cell, Tooltip, Legend } from 'recharts';
import { formatPrice } from '../utils/formatters';

const COLORS = ['#6366f1', '#22c55e', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899', '#14b8a6', '#f97316', '#06b6d4', '#84cc16'];

const PortfolioPieChart = React.memo(function PortfolioPieChart({ holdings, coins }) {
  const data = holdings.map(h => {
    const coin = coins.find(c => c.id === h.coinId);
    const value = (coin?.current_price || h.buyPrice) * h.quantity;
    return { name: coin?.name || h.coinId, value };
  }).filter(d => d.value > 0);

  if (data.length === 0) {
    return (
      <div className="card" style={{ padding: 48, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: 300 }}>
        <div style={{ fontSize: 36, marginBottom: 12, opacity: 0.3 }}>📊</div>
        <p style={{ color: 'var(--text-2)', fontSize: 14, fontWeight: 600 }}>No holdings to display</p>
        <p style={{ color: 'var(--text-3)', fontSize: 12, marginTop: 4 }}>Add coins to your portfolio to see allocation</p>
      </div>
    );
  }

  return (
    <div className="card" style={{ padding: 20 }}>
      <h3 style={{ fontSize: 13, fontWeight: 700, color: 'var(--text-1)', marginBottom: 16 }}>Portfolio Allocation</h3>
      <ResponsiveContainer width="100%" height={280}>
        <PieChart>
          <Pie data={data} cx="50%" cy="50%" innerRadius={60} outerRadius={100} paddingAngle={3} dataKey="value" label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}>
            {data.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
          </Pie>
          <Tooltip 
            formatter={(value) => formatPrice(value)} 
            contentStyle={{ 
              background: 'rgba(11,13,20,0.95)', 
              border: '1px solid var(--border)', 
              borderRadius: 14,
              backdropFilter: 'blur(12px)',
              boxShadow: '0 8px 32px rgba(0,0,0,0.6)',
              fontSize: 12
            }} 
          />
          <Legend wrapperStyle={{ fontSize: 11, fontWeight: 600 }} />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
});

export default PortfolioPieChart;
