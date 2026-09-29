/**
 * SkeletonLoader — Reusable loading skeleton components
 */
import React from 'react';

export function SkeletonCard() {
  return (
    <div className="card" style={{ padding: 24 }}>
      <div className="skeleton" style={{ height: 14, width: 80, marginBottom: 14, borderRadius: 6 }} />
      <div className="skeleton" style={{ height: 28, width: 120, marginBottom: 10, borderRadius: 8 }} />
      <div className="skeleton" style={{ height: 12, width: 64, borderRadius: 6 }} />
    </div>
  );
}

export function SkeletonRow() {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 16, padding: 16, borderBottom: '1px solid var(--border)' }}>
      <div className="skeleton" style={{ width: 36, height: 36, borderRadius: 10, flexShrink: 0 }} />
      <div className="skeleton" style={{ height: 14, width: 96, borderRadius: 6 }} />
      <div className="skeleton" style={{ height: 14, width: 64, borderRadius: 6, marginLeft: 'auto' }} />
      <div className="skeleton" style={{ height: 14, width: 48, borderRadius: 6 }} />
      <div className="skeleton" style={{ height: 14, width: 48, borderRadius: 6 }} />
    </div>
  );
}

export function SkeletonChart() {
  return (
    <div className="card" style={{ padding: 24 }}>
      <div className="skeleton" style={{ height: 14, width: 120, marginBottom: 16, borderRadius: 6 }} />
      <div className="skeleton" style={{ height: 200, width: '100%', borderRadius: 12 }} />
    </div>
  );
}

export default function SkeletonLoader({ type = 'card', count = 1 }) {
  const Component = type === 'row' ? SkeletonRow : type === 'chart' ? SkeletonChart : SkeletonCard;
  return (
    <>
      {Array.from({ length: count }, (_, i) => (
        <Component key={i} />
      ))}
    </>
  );
}
