import React from 'react';
import {
  ResponsiveContainer, ComposedChart, Line, Area, XAxis, YAxis,
  CartesianGrid, Tooltip, Legend
} from 'recharts';
import { formatPrice, formatDate } from '../utils/formatters';

const PredictionChart = React.memo(function PredictionChart({ historicalPrices, predictions, title }) {
  const now = Date.now();
  const dayMs = 86400000;
  const data = [];
  const recent = historicalPrices.slice(-30);

  recent.forEach((price, i) => {
    data.push({ date: formatDate(now - (recent.length - i) * dayMs), price, predicted: null });
  });

  if (predictions?.length > 0) {
    data[data.length - 1].predicted = data[data.length - 1].price;
    predictions.forEach((pred, i) => {
      data.push({ date: formatDate(now + (i + 1) * dayMs), price: null, predicted: pred });
    });
  }

  return (
    <div className="card" style={{ padding: 20 }}>
      {title && <h3 style={{ fontSize: 13, fontWeight: 700, color: 'var(--text-1)', marginBottom: 16 }}>{title}</h3>}
      <ResponsiveContainer width="100%" height={250}>
        <ComposedChart data={data}>
          <defs>
            <linearGradient id="priceGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#6366f1" stopOpacity={0.3} />
              <stop offset="95%" stopColor="#6366f1" stopOpacity={0} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" opacity={0.4} vertical={false} />
          <XAxis dataKey="date" tick={{ fontSize: 10, fill: 'var(--text-3)' }} axisLine={{ stroke: 'var(--border)' }} tickLine={false} />
          <YAxis tick={{ fontSize: 10, fill: 'var(--text-3)' }} axisLine={false} tickLine={false} tickFormatter={(v) => '$' + v.toLocaleString()} domain={['auto', 'auto']} />
          <Tooltip 
            contentStyle={{ 
              background: 'rgba(11,13,20,0.95)', 
              border: '1px solid var(--border)', 
              borderRadius: 14, fontSize: 11,
              backdropFilter: 'blur(12px)',
              boxShadow: '0 8px 32px rgba(0,0,0,0.6)'
            }} 
            formatter={(value) => [formatPrice(value), '']} 
          />
          <Legend wrapperStyle={{ fontSize: 10, fontWeight: 600, opacity: 0.7 }} />
          <Area type="monotone" dataKey="price" stroke="#6366f1" fill="url(#priceGrad)" strokeWidth={2} dot={false} name="Actual Price" connectNulls={false} />
          <Line type="monotone" dataKey="predicted" stroke="var(--orange)" strokeWidth={2} strokeDasharray="8 4" dot={{ fill: '#f59e0b', r: 3 }} name="AI Prediction" connectNulls={false} />
        </ComposedChart>
      </ResponsiveContainer>
    </div>
  );
});

export default PredictionChart;
