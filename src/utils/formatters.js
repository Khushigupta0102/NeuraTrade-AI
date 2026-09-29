/**
 * Formatters — price, percentage, large number humanization
 */

/** Format price with $ and commas: $1,234.56 */
export function formatPrice(value, decimals = 2) {
  if (value == null || isNaN(value)) return '—';
  return '$' + Number(value).toLocaleString('en-US', {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  });
}

/** Format percentage with + / - prefix and color info */
export function formatPercent(value, decimals = 2) {
  if (value == null || isNaN(value)) return '—';
  const sign = value >= 0 ? '+' : '';
  return sign + value.toFixed(decimals) + '%';
}

/** Is positive change? */
export function isPositive(value) {
  return value != null && value >= 0;
}

/** Humanize large numbers: 1.2B, 456M, 78K */
export function humanize(value) {
  if (value == null || isNaN(value)) return '—';
  const abs = Math.abs(value);
  if (abs >= 1e12) return '$' + (value / 1e12).toFixed(2) + 'T';
  if (abs >= 1e9) return '$' + (value / 1e9).toFixed(2) + 'B';
  if (abs >= 1e6) return '$' + (value / 1e6).toFixed(2) + 'M';
  if (abs >= 1e3) return '$' + (value / 1e3).toFixed(1) + 'K';
  return '$' + value.toFixed(2);
}

/** Format timestamp to locale time string */
export function formatTime(ts) {
  return new Date(ts).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
}

/** Format date */
export function formatDate(ts) {
  return new Date(ts).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}

/** Time ago string */
export function timeAgo(seconds) {
  if (seconds < 5) return 'just now';
  if (seconds < 60) return `${Math.floor(seconds)}s ago`;
  if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`;
  return `${Math.floor(seconds / 3600)}h ago`;
}
