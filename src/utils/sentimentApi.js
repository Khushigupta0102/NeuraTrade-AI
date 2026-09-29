/**
 * HuggingFace Sentiment Analysis — FinBERT
 * Uses fetch with Authorization header for the HF Inference API
 */

const SENTIMENT_MODEL = 'ProsusAI/finbert';
const HF_TOKEN = import.meta.env.VITE_HF_API_KEY || '';
const API_URL = `https://api-inference.huggingface.co/models/${SENTIMENT_MODEL}`;

/**
 * Analyze sentiment of a text string
 * @param {string} text - Text to analyze
 * @returns {Promise<{label: string, score: number}>} - e.g. { label: 'positive', score: 0.89 }
 */
export async function analyzeSentiment(text) {
  try {
    const headers = { 'Content-Type': 'application/json' };
    if (HF_TOKEN) {
      headers['Authorization'] = `Bearer ${HF_TOKEN}`;
    }

    const response = await fetch(API_URL, {
      method: 'POST',
      headers,
      body: JSON.stringify({ inputs: text }),
    });

    if (!response.ok) {
      console.warn('Sentiment API error:', response.status);
      return { label: 'neutral', score: 0.5 };
    }

    const data = await response.json();
    // FinBERT returns [[{label, score}, ...]] — pick top result
    if (Array.isArray(data) && Array.isArray(data[0]) && data[0].length > 0) {
      const top = data[0].reduce((a, b) => a.score > b.score ? a : b);
      return {
        label: top.label.toLowerCase(), // 'positive', 'negative', 'neutral'
        score: top.score,
      };
    }
    return { label: 'neutral', score: 0.5 };
  } catch (err) {
    console.error('Sentiment analysis failed:', err);
    return { label: 'neutral', score: 0.5 };
  }
}

/**
 * Map FinBERT label to trading sentiment
 */
export function mapSentiment(label) {
  switch (label) {
    case 'positive': return 'BULLISH';
    case 'negative': return 'BEARISH';
    default: return 'NEUTRAL';
  }
}
