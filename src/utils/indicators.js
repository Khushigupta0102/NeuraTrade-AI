/**
 * Technical Indicators — Pure JS implementations
 * All functions take a plain number[] and return number[]
 */

/** Simple Moving Average */
export function SMA(prices, period) {
  const result = [];
  for (let i = 0; i < prices.length; i++) {
    if (i < period - 1) { result.push(null); continue; }
    let sum = 0;
    for (let j = i - period + 1; j <= i; j++) sum += prices[j];
    result.push(sum / period);
  }
  return result;
}

/** Exponential Moving Average */
export function EMA(prices, period) {
  const result = [];
  const multiplier = 2 / (period + 1);
  // first EMA value is the SMA of the first `period` prices
  let sum = 0;
  for (let i = 0; i < prices.length; i++) {
    if (i < period - 1) { result.push(null); sum += prices[i]; continue; }
    if (i === period - 1) {
      sum += prices[i];
      result.push(sum / period);
      continue;
    }
    const prev = result[i - 1];
    result.push((prices[i] - prev) * multiplier + prev);
  }
  return result;
}

/** Relative Strength Index (default period = 14) */
export function RSI(prices, period = 14) {
  const result = [];
  const changes = [];
  for (let i = 1; i < prices.length; i++) changes.push(prices[i] - prices[i - 1]);

  // first value needs `period` changes
  if (changes.length < period) return prices.map(() => null);

  let avgGain = 0, avgLoss = 0;
  for (let i = 0; i < period; i++) {
    if (changes[i] > 0) avgGain += changes[i];
    else avgLoss += Math.abs(changes[i]);
  }
  avgGain /= period;
  avgLoss /= period;

  // pad with nulls for prices[0..period]
  for (let i = 0; i <= period; i++) result.push(null);

  const rs = avgLoss === 0 ? 100 : avgGain / avgLoss;
  result.push(avgLoss === 0 ? 100 : 100 - 100 / (1 + rs));

  for (let i = period; i < changes.length; i++) {
    const gain = changes[i] > 0 ? changes[i] : 0;
    const loss = changes[i] < 0 ? Math.abs(changes[i]) : 0;
    avgGain = (avgGain * (period - 1) + gain) / period;
    avgLoss = (avgLoss * (period - 1) + loss) / period;
    const rsi = avgLoss === 0 ? 100 : 100 - 100 / (1 + avgGain / avgLoss);
    result.push(rsi);
  }
  return result;
}

/** MACD — returns { macdLine, signalLine, histogram } */
export function MACD(prices) {
  const ema12 = EMA(prices, 12);
  const ema26 = EMA(prices, 26);
  const macdLine = prices.map((_, i) =>
    ema12[i] != null && ema26[i] != null ? ema12[i] - ema26[i] : null
  );

  // Signal line = EMA(9) of MACD line (filter out nulls for computation)
  const validMacd = macdLine.filter(v => v != null);
  const signalRaw = EMA(validMacd, 9);
  const signalLine = [];
  let idx = 0;
  for (let i = 0; i < macdLine.length; i++) {
    if (macdLine[i] == null) { signalLine.push(null); }
    else { signalLine.push(signalRaw[idx++] ?? null); }
  }

  const histogram = prices.map((_, i) =>
    macdLine[i] != null && signalLine[i] != null ? macdLine[i] - signalLine[i] : null
  );
  return { macdLine, signalLine, histogram };
}

/** Bollinger Bands (default period=20) */
export function BollingerBands(prices, period = 20) {
  const sma = SMA(prices, period);
  const upper = [], lower = [], middle = [];
  for (let i = 0; i < prices.length; i++) {
    if (sma[i] == null) { upper.push(null); lower.push(null); middle.push(null); continue; }
    let variance = 0;
    for (let j = i - period + 1; j <= i; j++) variance += (prices[j] - sma[i]) ** 2;
    const stddev = Math.sqrt(variance / period);
    middle.push(sma[i]);
    upper.push(sma[i] + 2 * stddev);
    lower.push(sma[i] - 2 * stddev);
  }
  return { upper, middle, lower };
}

/** Volume SMA */
export function VolumeSMA(volumes, period = 20) {
  return SMA(volumes, period);
}
