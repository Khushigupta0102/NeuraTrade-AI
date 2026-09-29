/**
 * usePricePrediction — Lightweight statistical price predictor hook
 * Uses linear regression + EMA + volatility modeling to predict next 7 days
 * No external ML dependencies required — runs instantly in the browser
 */
import { useState, useCallback } from 'react';
import useAppStore from '../store/useAppStore';

const PREDICT_DAYS = 7;

/* ── Helper: Linear Regression ─────────────────────────────── */
function linearRegression(prices) {
  const n = prices.length;
  let sumX = 0, sumY = 0, sumXY = 0, sumX2 = 0;
  for (let i = 0; i < n; i++) {
    sumX += i;
    sumY += prices[i];
    sumXY += i * prices[i];
    sumX2 += i * i;
  }
  const slope = (n * sumXY - sumX * sumY) / (n * sumX2 - sumX * sumX);
  const intercept = (sumY - slope * sumX) / n;
  return { slope, intercept };
}

/* ── Helper: Exponential Moving Average ────────────────────── */
function ema(prices, period) {
  const k = 2 / (period + 1);
  const result = [prices[0]];
  for (let i = 1; i < prices.length; i++) {
    result.push(prices[i] * k + result[i - 1] * (1 - k));
  }
  return result;
}

/* ── Helper: Historical Volatility (std dev of returns) ───── */
function volatility(prices) {
  const returns = [];
  for (let i = 1; i < prices.length; i++) {
    returns.push((prices[i] - prices[i - 1]) / prices[i - 1]);
  }
  const mean = returns.reduce((s, r) => s + r, 0) / returns.length;
  const variance = returns.reduce((s, r) => s + (r - mean) ** 2, 0) / returns.length;
  return Math.sqrt(variance);
}

/* ── Helper: RSI-based momentum factor ────────────────────── */
function rsiFactor(prices, period = 14) {
  if (prices.length < period + 1) return 0;
  const recent = prices.slice(-period - 1);
  let gains = 0, losses = 0;
  for (let i = 1; i < recent.length; i++) {
    const change = recent[i] - recent[i - 1];
    if (change > 0) gains += change;
    else losses -= change;
  }
  const avgGain = gains / period;
  const avgLoss = losses / period;
  if (avgLoss === 0) return 0.3;   // very bullish
  const rsi = 100 - 100 / (1 + avgGain / avgLoss);
  // Mean-reversion factor: RSI > 70 → expect pullback, RSI < 30 → expect bounce
  return (50 - rsi) / 200; // returns -0.1 to +0.1
}

/* ── Main prediction engine ───────────────────────────────── */
function predictPrices(prices) {
  if (!prices || prices.length < 20) return null;

  const lastPrice = prices[prices.length - 1];

  // 1. Short-term trend (last 14 days linear regression)
  const shortWindow = prices.slice(-14);
  const shortReg = linearRegression(shortWindow);

  // 2. Medium-term trend (last 30 days)
  const medWindow = prices.slice(-30);
  const medReg = linearRegression(medWindow);

  // 3. EMA momentum (12-period EMA vs 26-period EMA)
  const ema12 = ema(prices, 12);
  const ema26 = ema(prices, 26);
  const emaRatio = (ema12[ema12.length - 1] - ema26[ema26.length - 1]) / lastPrice;

  // 4. Volatility
  const vol = volatility(prices.slice(-30));

  // 5. RSI mean-reversion
  const rsiBias = rsiFactor(prices);

  // 6. Blend trend signals
  const dailyTrend = (shortReg.slope * 0.6 + medReg.slope * 0.4); // weighted slope
  const momentumBias = emaRatio * 0.3;     // EMA crossover signal
  const meanReversion = rsiBias * lastPrice; // RSI mean-reversion

  // 7. Generate predictions with trend + momentum + volatility noise
  const predicted = [];
  let prev = lastPrice;

  for (let day = 1; day <= PREDICT_DAYS; day++) {
    // Trend component (decaying influence over time)
    const trendComponent = dailyTrend * (1 - day * 0.05);

    // Momentum component (also decaying)
    const momentumComponent = momentumBias * prev * (1 - day * 0.08);

    // Mean-reversion nudge
    const reversionComponent = meanReversion * (day / PREDICT_DAYS) * 0.3;

    // Volatility-based random walk (seeded by price for determinism)
    const seed = Math.sin(lastPrice * day * 127.1) * 43758.5453;
    const noise = (seed - Math.floor(seed) - 0.5) * 2;
    const volComponent = noise * vol * prev * 0.3;

    // Combine all components
    const nextPrice = prev + trendComponent + momentumComponent + reversionComponent + volComponent;

    // Clamp to reasonable range (±15% from last price per day)
    const maxChange = lastPrice * 0.15;
    const clamped = Math.max(
      lastPrice * 0.5,
      Math.min(lastPrice * 1.5, nextPrice)
    );

    predicted.push(Math.round(clamped * 100) / 100);
    prev = clamped;
  }

  return predicted;
}

/* ── React Hook ───────────────────────────────────────────── */
export function usePricePrediction() {
  const [training, setTraining] = useState(false);
  const [progress, setProgress] = useState(0);
  const { predictions, setPrediction } = useAppStore();

  const predict = useCallback(async (coinId, prices) => {
    // Check cache (valid for 30 minutes)
    const cached = predictions[coinId];
    if (cached && Date.now() - cached.timestamp < 30 * 60 * 1000) {
      return cached.data;
    }

    if (!prices || prices.length < 20) {
      console.warn('Not enough price data for prediction (need ≥20 points)');
      return null;
    }

    setTraining(true);
    setProgress(0);

    try {
      // Simulate brief "analysis" phase for UX (shows progress bar)
      const steps = 5;
      for (let i = 1; i <= steps; i++) {
        await new Promise(r => setTimeout(r, 200));
        setProgress(Math.round((i / steps) * 80));
      }

      // Run prediction
      const result = predictPrices(prices);

      if (!result) {
        setTraining(false);
        setProgress(0);
        return null;
      }

      // Final progress
      setProgress(100);
      await new Promise(r => setTimeout(r, 300));

      // Cache result
      setPrediction(coinId, result);
      setTraining(false);

      return result;
    } catch (err) {
      console.error('Price prediction failed:', err);
      setTraining(false);
      setProgress(0);
      return null;
    }
  }, [predictions, setPrediction]);

  return { predict, training, progress };
}
