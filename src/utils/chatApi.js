/**
 * AI Chat — Mistral-7B via HuggingFace with smart local fallback
 */

const HF_TOKEN = import.meta.env.VITE_HF_API_KEY || '';
// Mistral-7B Instruct: much better at finance/crypto than BlenderBot
const CHAT_MODEL = 'mistralai/Mistral-7B-Instruct-v0.2';
const API_URL = `https://api-inference.huggingface.co/models/${CHAT_MODEL}`;

// ── Local Knowledge Base (instant, no network needed) ─────────────────────────
const LOCAL_KB = {
  rsi: `RSI (Relative Strength Index) is a momentum oscillator that measures the speed and magnitude of price changes on a 0–100 scale.\n\n• RSI < 30 → Asset may be oversold (potential buy signal)\n• RSI > 70 → Asset may be overbought (potential sell signal)\n• RSI 30–70 → Neutral zone\n\nTraders use RSI divergences to spot trend reversals. Note: RSI works best in ranging markets, not strong trends.`,
  macd: `MACD (Moving Average Convergence Divergence) is a trend-following momentum indicator.\n\nComponents:\n• MACD Line: 12-period EMA minus 26-period EMA\n• Signal Line: 9-period EMA of the MACD Line\n• Histogram: MACD Line minus Signal Line\n\nSignals:\n• MACD crosses above Signal Line → Bullish\n• MACD crosses below Signal Line → Bearish\n• Histogram expanding → Strengthening trend`,
  bollinger: `Bollinger Bands consist of a middle SMA band with an upper and lower band set 2 standard deviations away.\n\n• Price touching upper band → Potentially overbought\n• Price touching lower band → Potentially oversold\n• Band squeeze (narrow) → Low volatility, breakout incoming\n• Band expansion → High volatility, trend acceleration`,
  defi: `DeFi (Decentralized Finance) refers to financial services built on blockchain networks — no banks or intermediaries needed.\n\nKey components:\n• DEXs (Decentralized Exchanges): Trade crypto peer-to-peer (e.g., Uniswap, dYdX)\n• Lending protocols: Earn yield or borrow against collateral (e.g., Aave, Compound)\n• Stablecoins: USD-pegged assets (USDC, DAI, USDT)\n• Yield Farming: Providing liquidity to earn rewards\n• Smart Contracts: Self-executing code that powers DeFi protocols`,
  bitcoin: `Bitcoin (BTC) is the original cryptocurrency, created in 2009 by Satoshi Nakamoto.\n\nKey facts:\n• Fixed supply: 21 million coins total\n• Consensus: Proof-of-Work (PoW) mining\n• Block time: ~10 minutes\n• Halving: Every ~4 years, block rewards cut in half\n• Use case: Digital gold, store of value, peer-to-peer payments\n\nBitcoin dominance (its market share vs. all crypto) is a key market sentiment indicator.`,
  ethereum: `Ethereum (ETH) is a programmable blockchain supporting smart contracts and dApps.\n\nKey facts:\n• Consensus: Proof-of-Stake (PoS) since "The Merge" (2022)\n• Native token: ETH (used for gas fees)\n• Ecosystem: Home to most DeFi, NFTs, and Layer 2 networks\n• Layer 2s: Arbitrum, Optimism, Base (scale Ethereum cheaply)\n• EIP-1559: Burns a portion of transaction fees, making ETH deflationary at times`,
  signals: `Trading signals combine multiple technical indicators to suggest trade actions.\n\nHow NeuraTrade generates signals:\n1. RSI analysis (oversold/overbought)\n2. MACD trend direction\n3. SMA crossovers (golden/death cross)\n4. Bollinger Band position\n5. AI sentiment from news text\n\nSignal strength:\n• Strong Buy / Buy / Hold / Sell / Strong Sell\n\nAlways remember: signals are tools, not guarantees. Combine with your own research.`,
  risk: `Risk management is the most important skill in trading.\n\nKey principles:\n• Never risk more than 1–2% of your portfolio on a single trade\n• Use stop-losses to limit downside\n• Diversify across assets and sectors\n• Position sizing: scale position size to your conviction and risk tolerance\n• Avoid FOMO (Fear Of Missing Out) — emotional decisions are costly\n• The Kelly Criterion can help size positions mathematically`,
};

function localAnswer(msg) {
  const lower = msg.toLowerCase();
  if (/\brsi\b|relative strength/.test(lower)) return LOCAL_KB.rsi;
  if (/\bmacd\b/.test(lower)) return LOCAL_KB.macd;
  if (/bollinger/.test(lower)) return LOCAL_KB.bollinger;
  if (/\bdefi\b|decentralized finance/.test(lower)) return LOCAL_KB.defi;
  if (/\bbitcoin\b|\bbtc\b/.test(lower) && /what|explain|tell me|how/.test(lower)) return LOCAL_KB.bitcoin;
  if (/\bethereum\b|\beth\b/.test(lower) && /what|explain|tell me|how/.test(lower)) return LOCAL_KB.ethereum;
  if (/signal|indicator|analyze/.test(lower) && /how|what|explain/.test(lower)) return LOCAL_KB.signals;
  if (/risk|manage|safe|loss|stop/.test(lower)) return LOCAL_KB.risk;
  return null;
}

/**
 * Send a message — tries local KB first, then HuggingFace Mistral-7B, then graceful fallback
 */
export async function sendChatMessage(userMessage, context = '') {
  // 1. Try local knowledge base (instant)
  const localReply = localAnswer(userMessage);
  if (localReply) return localReply;

  // 2. Try HuggingFace Mistral-7B Instruct
  try {
    const systemPrompt = `You are NeuraTrade AI, a professional crypto trading assistant. Be concise, accurate, and helpful. Only discuss crypto, finance, trading, and market analysis. Do not use excessive emojis.`;
    const prompt = `<s>[INST] ${systemPrompt}\n\n${context ? `Context: ${context}\n\n` : ''}User question: ${userMessage} [/INST]`;

    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 15000); // 15s timeout

    const headers = { 'Content-Type': 'application/json' };
    if (HF_TOKEN) {
      headers['Authorization'] = `Bearer ${HF_TOKEN}`;
    }

    const response = await fetch(API_URL, {
      method: 'POST',
      headers,
      body: JSON.stringify({
        inputs: prompt,
        parameters: {
          max_new_tokens: 300,
          temperature: 0.6,
          top_p: 0.9,
          return_full_text: false,
        },
      }),
      signal: controller.signal,
    });
    clearTimeout(timeout);

    if (response.ok) {
      const data = await response.json();
      const text = data?.[0]?.generated_text || data?.generated_text;
      if (text && text.trim().length > 10) {
        // Strip any leftover prompt tokens
        return text.replace(/^\s*\[\/INST\]\s*/i, '').trim();
      }
    }

    // 503 = model loading
    if (response.status === 503) {
      return getFallbackResponse(userMessage);
    }
  } catch (err) {
    if (err.name === 'AbortError') {
      return getFallbackResponse(userMessage);
    }
    console.warn('HF API error, using fallback:', err.message);
  }

  // 3. Intelligent fallback
  return getFallbackResponse(userMessage);
}

function getFallbackResponse(msg) {
  const lower = msg.toLowerCase();
  if (/price|worth|value|cost/.test(lower)) return "I can see your question is about pricing. Use the Markets page to get real-time prices, or type 'price of BTC' for an instant answer.";
  if (/buy|sell|trade|invest/.test(lower)) return "Trading decisions should be based on your own research, risk tolerance, and financial goals. I can help you understand technical indicators and market data — check the AI Signals page for signal analysis.";
  if (/predict|forecast|future|will/.test(lower)) return "Price prediction is inherently uncertain. NeuraTrade uses LSTM machine learning to generate 7-day forecasts — open a coin's detail modal in the Markets page to run a prediction. Past performance does not guarantee future results.";
  if (/hello|hi|hey|good/.test(lower)) return "Hello! I'm NeuraTrade AI. Ask me about crypto market analysis, trading indicators, DeFi concepts, or type the name of a coin to get a technical analysis.";
  return "I can help with crypto market analysis, technical indicators (RSI, MACD, Bollinger Bands), DeFi concepts, and trading strategies. Try asking something like 'Explain RSI', 'Analyze BTC', or 'What is DeFi?'";
}
