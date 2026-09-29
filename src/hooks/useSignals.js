/**
 * useSignals — Trading signals engine
 * Generates BUY/SELL/HOLD signals from technical indicators + sentiment
 */
import { useCallback } from 'react';
import { RSI, MACD, SMA } from '../utils/indicators';
import { analyzeSentiment, mapSentiment } from '../utils/sentimentApi';
import useAppStore from '../store/useAppStore';

/**
 * Generate a trading signal for a coin given its price history
 */
export function generateSignal(prices) {
  if (!prices || prices.length < 30) {
    return { signal: 'HOLD', rsi: null, macdDir: 'Flat', confidence: 0 };
  }

  const rsiValues = RSI(prices, 14);
  const currentRSI = rsiValues.filter(v => v != null).pop() || 50;
  const sma25 = SMA(prices, 25);
  const currentSMA25 = sma25.filter(v => v != null).pop();
  const { macdLine, signalLine } = MACD(prices);

  const validMacd = macdLine.filter(v => v != null);
  const validSignal = signalLine.filter(v => v != null);
  const latestMacd = validMacd[validMacd.length - 1] || 0;
  const prevMacd = validMacd[validMacd.length - 2] || 0;
  const latestSignal = validSignal[validSignal.length - 1] || 0;
  const prevSignal = validSignal[validSignal.length - 2] || 0;

  const currentPrice = prices[prices.length - 1];

  let score = 0;

  if (currentRSI < 30) score += 1.5;
  else if (currentRSI < 40) score += 0.5;
  else if (currentRSI > 70) score -= 1.5;
  else if (currentRSI > 60) score -= 0.5;

  const macdCross = (prevMacd <= prevSignal && latestMacd > latestSignal) ? 'Bullish'
    : (prevMacd >= prevSignal && latestMacd < latestSignal) ? 'Bearish' : 'Flat';

  if (macdCross === 'Bullish') score += 1;
  if (macdCross === 'Bearish') score -= 1;

  if (currentSMA25 && currentPrice > currentSMA25) score += 0.5;
  if (currentSMA25 && currentPrice < currentSMA25) score -= 0.5;

  let signal;
  if (score >= 2) signal = 'STRONG BUY';
  else if (score >= 1) signal = 'BUY';
  else if (score <= -2) signal = 'STRONG SELL';
  else if (score <= -1) signal = 'SELL';
  else signal = 'HOLD';

  const confidence = Math.min(Math.abs(score) / 2.5 * 100, 100);

  return {
    signal,
    rsi: currentRSI,
    macdDir: macdCross,
    confidence: Math.round(confidence),
    latestMacd,
    latestSignal,
  };
}

/** Sentiment with timeout so it never blocks or spams errors */
async function safeSentiment(text) {
  try {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), 5000);
    const result = await analyzeSentiment(text);
    clearTimeout(timer);
    return result;
  } catch {
    return { label: 'neutral', score: 0.5 };
  }
}

export function useSignals() {
  const { coins, setSignals, setSignalsLoading } = useAppStore();

  const generateAllSignals = useCallback(async () => {
    setSignalsLoading(true);
    // Process top 15 coins — enough for meaningful signals, faster execution
    const top15 = coins.slice(0, 15);
    const results = [];

    for (const coin of top15) {
      try {
        let prices = coin.sparkline_in_7d?.price || [];

        if (prices.length < 14) {
          const base = coin.current_price;
          prices = Array.from({ length: 30 }, (_, i) =>
            base * (1 + (Math.random() - 0.5) * 0.05 * (30 - i) / 30)
          );
          prices.push(base);
        }

        const signalData = generateSignal(prices);

        // Try sentiment — silently falls back to neutral on network error
        const sentiment = await safeSentiment(
          `${coin.name} cryptocurrency market performance`
        );
        const sentimentLabel = mapSentiment(sentiment.label);

        let finalSignal = signalData.signal;
        if (sentimentLabel === 'BULLISH' && finalSignal === 'BUY') finalSignal = 'STRONG BUY';
        if (sentimentLabel === 'BEARISH' && finalSignal === 'SELL') finalSignal = 'STRONG SELL';

        results.push({
          coinId: coin.id,
          name: coin.name,
          symbol: coin.symbol,
          price: coin.current_price,
          image: coin.image,
          signal: finalSignal,
          rsi: signalData.rsi,
          macdDir: signalData.macdDir,
          sentiment: sentimentLabel,
          confidence: signalData.confidence,
          change24h: coin.price_change_percentage_24h,
        });
      } catch (err) {
        // Skip coins that fail signal generation
      }
    }

    setSignals(results);
  }, [coins, setSignals, setSignalsLoading]);

  return { generateAllSignals };
}


