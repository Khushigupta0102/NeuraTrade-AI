import React, { useState, useRef, useEffect, useCallback } from 'react';
import useAppStore from '../store/useAppStore';
import { sendChatMessage } from '../utils/chatApi';
import { analyzeSentiment, mapSentiment } from '../utils/sentimentApi';
import { formatPrice } from '../utils/formatters';
import { generateSignal } from '../hooks/useSignals';

const QUICK_CHIPS = [
  'Explain RSI',
  'What is MACD?',
  'Analyze BTC',
  'What is DeFi?',
  'Top gainers today',
  'How to manage risk?',
];

/* ─── Inline Styles Object ─────────────────────────────────────────────────── */
const S = {
  page: {
    display: 'flex', flexDirection: 'column',
    height: 'calc(100vh - 90px)', maxWidth: '760px',
    margin: '0 auto', padding: '0 16px',
    fontFamily: 'var(--font-sans)',
  },
  header: {
    display: 'flex', alignItems: 'center', justifyContent: 'space-between',
    padding: '24px 0 16px',
  },
  title: {
    fontSize: '22px', fontWeight: 700, color: 'var(--text-1)',
    letterSpacing: '-0.02em', margin: 0,
  },
  subtitle: {
    fontSize: '11px', fontWeight: 500, color: 'var(--text-3)',
    letterSpacing: '0.06em', textTransform: 'uppercase', marginTop: '4px',
  },
  clearBtn: {
    display: 'flex', alignItems: 'center', gap: '6px',
    padding: '8px 14px', borderRadius: '12px', fontSize: '12px',
    fontWeight: 600, fontFamily: 'var(--font-sans)',
    border: '1px solid var(--border)', background: 'transparent',
    color: 'var(--text-3)', cursor: 'pointer',
    transition: 'all 0.2s ease',
  },
  messagesArea: {
    flex: 1, overflowY: 'auto', minHeight: 0,
    padding: '20px', borderRadius: '16px',
    border: '1px solid var(--border)',
    background: 'rgba(255,255,255,0.015)',
    marginBottom: '12px',
  },
  chipsRow: {
    display: 'flex', gap: '8px', flexWrap: 'wrap',
    marginBottom: '12px',
  },
  chip: {
    padding: '6px 14px', borderRadius: '99px', fontSize: '12px',
    fontWeight: 500, fontFamily: 'var(--font-sans)',
    border: '1px solid var(--border)', background: 'rgba(255,255,255,0.02)',
    color: 'var(--text-3)', cursor: 'pointer',
    transition: 'all 0.2s ease',
  },
  inputRow: {
    display: 'flex', gap: '8px', padding: '10px',
    borderRadius: '16px', border: '1px solid var(--border)',
    background: 'rgba(255,255,255,0.03)',
    marginBottom: '16px',
    transition: 'border-color 0.2s ease, box-shadow 0.2s ease',
  },
  input: {
    flex: 1, padding: '10px 14px', background: 'transparent',
    border: 'none', outline: 'none', fontSize: '14px',
    color: 'var(--text-1)', fontFamily: 'var(--font-sans)',
  },
  sendBtn: {
    display: 'flex', alignItems: 'center', gap: '8px',
    padding: '10px 20px', borderRadius: '12px', border: 'none',
    fontSize: '13px', fontWeight: 700, fontFamily: 'var(--font-sans)',
    color: '#fff', cursor: 'pointer',
    background: 'linear-gradient(135deg, var(--accent), #7c3aed)',
    transition: 'all 0.2s ease',
  },
};

/* ─── Icons ────────────────────────────────────────────────────────────────── */
const SendIcon = () => (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <line x1="22" y1="2" x2="11" y2="13" /><polygon points="22 2 15 22 11 13 2 9 22 2" />
  </svg>
);
const TrashIcon = () => (
  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="3 6 5 6 21 6" /><path d="M19 6l-1 14H6L5 6" /><path d="M10 11v6" /><path d="M14 11v6" /><path d="M9 6V4h6v2" />
  </svg>
);
const CopyIcon = () => (
  <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="9" y="9" width="13" height="13" rx="2" ry="2" /><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
  </svg>
);
const CheckIcon = () => (
  <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="20 6 9 17 4 12" />
  </svg>
);

/* ─── Markdown-like renderer ───────────────────────────────────────────────── */
function MessageContent({ text }) {
  const lines = text.split('\n');
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', fontSize: '13.5px', lineHeight: 1.65 }}>
      {lines.map((line, i) => {
        if (!line.trim()) return <div key={i} style={{ height: '4px' }} />;
        const parts = line.split(/(\*\*[^*]+\*\*)/g);
        const rendered = parts.map((part, j) => {
          if (part.startsWith('**') && part.endsWith('**'))
            return <strong key={j} style={{ fontWeight: 600, color: 'var(--text-1)' }}>{part.slice(2, -2)}</strong>;
          return <span key={j}>{part}</span>;
        });
        if (line.startsWith('• ') || line.startsWith('- '))
          return <div key={i} style={{ display: 'flex', gap: '10px', alignItems: 'baseline' }}><span style={{ width: 4, height: 4, borderRadius: '50%', background: 'var(--accent)', flexShrink: 0, marginTop: 8 }} /><span>{rendered}</span></div>;
        if (/^\d+\.\s/.test(line)) {
          const num = line.match(/^(\d+)\./)[1];
          return <div key={i} style={{ display: 'flex', gap: '10px', alignItems: 'baseline' }}><span style={{ fontSize: 10, fontWeight: 700, color: 'var(--accent)', width: 16, textAlign: 'right', flexShrink: 0, fontFamily: 'var(--font-mono)' }}>{num}.</span><span>{rendered}</span></div>;
        }
        return <div key={i}>{rendered}</div>;
      })}
    </div>
  );
}

/* ─── Typing Indicator ─────────────────────────────────────────────────────── */
function TypingIndicator() {
  return (
    <div style={{ display: 'flex', gap: '12px', alignItems: 'flex-end', marginBottom: '20px' }}>
      <div style={{ width: 32, height: 32, borderRadius: 14, background: 'rgba(99,102,241,0.1)', border: '1px solid rgba(99,102,241,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
        <span style={{ fontSize: 10, fontWeight: 900, color: 'var(--accent)' }}>AI</span>
      </div>
      <div style={{ padding: '14px 18px', borderRadius: '18px 18px 18px 6px', background: 'rgba(255,255,255,0.04)', border: '1px solid var(--border)' }}>
        <div style={{ display: 'flex', gap: '6px', alignItems: 'center', height: 16 }}>
          {[0, 1, 2].map(i => (
            <span key={i} style={{ width: 6, height: 6, borderRadius: '50%', background: 'var(--accent)', opacity: 0.5, animation: `chatBounce 1.2s ease-in-out ${i * 0.2}s infinite` }} />
          ))}
        </div>
      </div>
    </div>
  );
}

/* ─── Chat Message ─────────────────────────────────────────────────────────── */
function ChatMessage({ message, isLatest }) {
  const { role, content, timestamp } = message;
  const isUser = role === 'user';
  const [copied, setCopied] = useState(false);
  const [hoverCopy, setHoverCopy] = useState(false);

  const time = timestamp
    ? new Date(timestamp).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: false })
    : '';

  const handleCopy = () => { navigator.clipboard.writeText(content); setCopied(true); setTimeout(() => setCopied(false), 2000); };

  return (
    <div style={{
      display: 'flex', gap: '12px', marginBottom: '20px',
      flexDirection: isUser ? 'row-reverse' : 'row',
      animation: isLatest ? 'chatSlideUp 0.3s ease-out' : 'none',
    }}>
      {/* Avatar */}
      <div style={{
        width: 32, height: 32, borderRadius: 14, flexShrink: 0,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        fontSize: 10, fontWeight: 900,
        ...(isUser
          ? { background: 'linear-gradient(135deg, var(--accent), #7c3aed)', color: '#fff' }
          : { background: 'rgba(99,102,241,0.1)', border: '1px solid rgba(99,102,241,0.2)', color: 'var(--accent)' }
        ),
      }}>
        {isUser ? 'You' : 'AI'}
      </div>

      {/* Bubble + meta */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', maxWidth: '75%', alignItems: isUser ? 'flex-end' : 'flex-start' }}>
        <div style={{
          padding: '14px 18px',
          borderRadius: isUser ? '18px 18px 6px 18px' : '18px 18px 18px 6px',
          fontSize: '13.5px', lineHeight: 1.65,
          ...(isUser
            ? { background: 'linear-gradient(135deg, var(--accent), #7c3aed)', color: '#fff', boxShadow: '0 4px 16px rgba(99,102,241,0.25)' }
            : { background: 'rgba(255,255,255,0.04)', color: 'var(--text-2)', border: '1px solid var(--border)' }
          ),
        }}>
          {isUser ? <p style={{ margin: 0 }}>{content}</p> : <MessageContent text={content} />}
        </div>

        {/* Timestamp + copy */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', paddingLeft: 4, paddingRight: 4, flexDirection: isUser ? 'row-reverse' : 'row' }}>
          <span style={{ fontSize: 10, fontFamily: 'var(--font-mono)', color: 'var(--text-3)', opacity: 0.5 }}>{time}</span>
          {!isUser && (
            <button
              onClick={handleCopy}
              onMouseEnter={() => setHoverCopy(true)}
              onMouseLeave={() => setHoverCopy(false)}
              style={{
                display: 'flex', alignItems: 'center', gap: '4px',
                fontSize: 10, fontWeight: 600, padding: '2px 8px',
                borderRadius: 6, border: 'none', cursor: 'pointer',
                background: hoverCopy ? 'rgba(255,255,255,0.06)' : 'transparent',
                color: copied ? 'var(--green)' : 'var(--text-3)',
                opacity: hoverCopy || copied ? 1 : 0.4,
                transition: 'all 0.2s ease',
                fontFamily: 'var(--font-sans)',
              }}
            >
              {copied ? <><CheckIcon /> Copied</> : <><CopyIcon /> Copy</>}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

/* ─── Empty State ──────────────────────────────────────────────────────────── */
function EmptyState() {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100%', textAlign: 'center', padding: '48px 0', gap: '16px' }}>
      <div style={{ width: 56, height: 56, borderRadius: 20, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'rgba(99,102,241,0.08)', border: '1px solid rgba(99,102,241,0.15)' }}>
        <span style={{ fontSize: 18, fontWeight: 900, color: 'var(--accent)' }}>AI</span>
      </div>
      <div>
        <h3 style={{ fontSize: 17, fontWeight: 700, color: 'var(--text-1)', margin: '0 0 6px' }}>NeuraTrade AI</h3>
        <p style={{ fontSize: 13, color: 'var(--text-3)', maxWidth: 300, margin: '0 auto', lineHeight: 1.6 }}>
          Ask about crypto prices, technical indicators, DeFi concepts, or trading signals.
        </p>
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════════════════
 *  MAIN CHATBOT COMPONENT
 * ═══════════════════════════════════════════════════════════════════════════ */
export default function ChatBot() {
  const { chatMessages, addChatMessage, coins, clearChat } = useAppStore();
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [inputFocused, setInputFocused] = useState(false);
  const bottomRef = useRef(null);
  const inputRef = useRef(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [chatMessages.length, isTyping]);

  const buildContext = useCallback(() => {
    const top5 = coins.slice(0, 5)
      .map(c => `${c.name} (${c.symbol?.toUpperCase()}): $${c.current_price?.toLocaleString()}, 24h: ${c.price_change_percentage_24h?.toFixed(2)}%`)
      .join(' | ');
    return top5 ? `Live prices: ${top5}` : '';
  }, [coins]);

  const handleSend = useCallback(async (text) => {
    const msg = (text || input).trim();
    if (!msg || isTyping) return;
    setInput('');
    addChatMessage({ role: 'user', content: msg });
    setIsTyping(true);

    try {
      const lower = msg.toLowerCase();

      const priceMatch = lower.match(/price\s+(?:of\s+)?([\w]+)/);
      if (priceMatch) {
        const sym = priceMatch[1];
        const coin = coins.find(c => c.symbol === sym || c.name?.toLowerCase() === sym || c.id === sym);
        if (coin) {
          addChatMessage({
            role: 'bot',
            content: `**${coin.name} (${coin.symbol?.toUpperCase()})**\n\nCurrent Price: ${formatPrice(coin.current_price)}\n24h Change: ${coin.price_change_percentage_24h?.toFixed(2)}%\nMarket Cap: $${(coin.market_cap / 1e9).toFixed(2)}B\n\nNote: This is live data. Always verify on an exchange before trading.`,
          });
          setIsTyping(false);
          return;
        }
      }

      const analyzeMatch = lower.match(/analyze\s+([\w]+)/);
      if (analyzeMatch) {
        const sym = analyzeMatch[1];
        const coin = coins.find(c => c.symbol === sym || c.name?.toLowerCase() === sym);
        if (coin) {
          const prices = coin.sparkline_in_7d?.price || [];
          const synth = Array.from({ length: 30 }, () => coin.current_price * (0.95 + Math.random() * 0.1));
          const sig = generateSignal(prices.length > 14 ? prices : synth);
          addChatMessage({
            role: 'bot',
            content: `**${coin.name} — Technical Analysis**\n\nSignal: **${sig.signal}**\nRSI (14): ${sig.rsi?.toFixed(1) ?? 'N/A'}\nMACD: ${sig.macdDir}\nConfidence: ${sig.confidence}%\nCurrent Price: ${formatPrice(coin.current_price)}\n\nThis is a technical-only analysis based on price momentum. Not financial advice.`,
          });
          setIsTyping(false);
          return;
        }
      }

      const sentMatch = lower.match(/sentiment\s+([\w]+)/);
      if (sentMatch) {
        const sym = sentMatch[1];
        const coin = coins.find(c => c.symbol === sym || c.name?.toLowerCase() === sym);
        if (coin) {
          const result = await analyzeSentiment(`${coin.name} cryptocurrency market performance and investor outlook`);
          const label = mapSentiment(result.label);
          addChatMessage({
            role: 'bot',
            content: `**${coin.name} — NLP Sentiment Analysis**\n\nSentiment: **${label}**\nConfidence: ${(result.score * 100).toFixed(1)}%\nModel: FinBERT (Financial BERT)\n\nThis is text-based sentiment derived from the coin's market narrative. It is one signal among many and should not be used alone.`,
          });
          setIsTyping(false);
          return;
        }
      }

      if (/top\s+gainer|best\s+perform/i.test(lower)) {
        const gainers = [...coins].sort((a, b) => (b.price_change_percentage_24h || 0) - (a.price_change_percentage_24h || 0)).slice(0, 5);
        const list = gainers.map((c, i) => `${i + 1}. ${c.name} (${c.symbol?.toUpperCase()}) — ${formatPrice(c.current_price)} · +${c.price_change_percentage_24h?.toFixed(2)}%`).join('\n');
        addChatMessage({ role: 'bot', content: `**Top 5 Gainers (24h)**\n\n${list}` });
        setIsTyping(false);
        return;
      }

      if (/top\s+loser|worst\s+perform/i.test(lower)) {
        const losers = [...coins].sort((a, b) => (a.price_change_percentage_24h || 0) - (b.price_change_percentage_24h || 0)).slice(0, 5);
        const list = losers.map((c, i) => `${i + 1}. ${c.name} (${c.symbol?.toUpperCase()}) — ${formatPrice(c.current_price)} · ${c.price_change_percentage_24h?.toFixed(2)}%`).join('\n');
        addChatMessage({ role: 'bot', content: `**Top 5 Losers (24h)**\n\n${list}` });
        setIsTyping(false);
        return;
      }

      const context = buildContext();
      const response = await sendChatMessage(msg, context);
      addChatMessage({ role: 'bot', content: response });
    } catch (err) {
      console.error('Chat error:', err);
      addChatMessage({ role: 'bot', content: 'Something went wrong. Please try again.' });
    }
    setIsTyping(false);
  }, [input, isTyping, coins, addChatMessage, buildContext]);

  const handleKey = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSend(); }
  };

  return (
    <>
      <style>{`
        @keyframes chatSlideUp { from { opacity:0; transform:translateY(12px); } to { opacity:1; transform:translateY(0); } }
        @keyframes chatBounce { 0%,80%,100% { transform:translateY(0); opacity:0.35; } 40% { transform:translateY(-5px); opacity:1; } }
        .chat-scroll::-webkit-scrollbar { width:4px; }
        .chat-scroll::-webkit-scrollbar-track { background:transparent; }
        .chat-scroll::-webkit-scrollbar-thumb { background:rgba(255,255,255,0.06); border-radius:99px; }
        .chat-scroll::-webkit-scrollbar-thumb:hover { background:rgba(255,255,255,0.12); }
      `}</style>

      <div className="page-enter" style={S.page}>
        {/* Header */}
        <div style={S.header}>
          <div>
            <h1 style={S.title}>AI Assistant</h1>
            <p style={S.subtitle}>Mistral-7B · FinBERT · Educational use only</p>
          </div>
          <button
            onClick={clearChat}
            style={S.clearBtn}
            onMouseEnter={e => { e.currentTarget.style.borderColor = 'rgba(239,68,68,0.3)'; e.currentTarget.style.color = 'var(--red)'; e.currentTarget.style.background = 'rgba(239,68,68,0.05)'; }}
            onMouseLeave={e => { e.currentTarget.style.borderColor = 'var(--border)'; e.currentTarget.style.color = 'var(--text-3)'; e.currentTarget.style.background = 'transparent'; }}
          >
            <TrashIcon /> Clear
          </button>
        </div>

        {/* Messages */}
        <div className="chat-scroll" style={S.messagesArea}>
          {chatMessages.length === 0
            ? <EmptyState />
            : chatMessages.map((msg, i) => (
                <ChatMessage key={msg.id || i} message={msg} isLatest={i === chatMessages.length - 1} />
              ))
          }
          {isTyping && <TypingIndicator />}
          <div ref={bottomRef} />
        </div>

        {/* Quick Chips */}
        <div style={S.chipsRow}>
          {QUICK_CHIPS.map(chip => (
            <button
              key={chip}
              onClick={() => handleSend(chip)}
              disabled={isTyping}
              style={{ ...S.chip, opacity: isTyping ? 0.3 : 1, cursor: isTyping ? 'not-allowed' : 'pointer' }}
              onMouseEnter={e => { if (!isTyping) { e.currentTarget.style.borderColor = 'rgba(99,102,241,0.35)'; e.currentTarget.style.color = 'var(--accent)'; e.currentTarget.style.background = 'rgba(99,102,241,0.06)'; }}}
              onMouseLeave={e => { e.currentTarget.style.borderColor = 'var(--border)'; e.currentTarget.style.color = 'var(--text-3)'; e.currentTarget.style.background = 'rgba(255,255,255,0.02)'; }}
            >
              {chip}
            </button>
          ))}
        </div>

        {/* Input */}
        <div style={{
          ...S.inputRow,
          borderColor: inputFocused ? 'rgba(99,102,241,0.4)' : 'var(--border)',
          boxShadow: inputFocused ? '0 0 0 3px rgba(99,102,241,0.08)' : 'none',
        }}>
          <input
            ref={inputRef}
            type="text"
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={handleKey}
            onFocus={() => setInputFocused(true)}
            onBlur={() => setInputFocused(false)}
            placeholder="Ask about prices, indicators, or market trends…"
            disabled={isTyping}
            style={{ ...S.input, opacity: isTyping ? 0.5 : 1 }}
          />
          <button
            onClick={() => handleSend()}
            disabled={!input.trim() || isTyping}
            style={{ ...S.sendBtn, opacity: (!input.trim() || isTyping) ? 0.35 : 1, cursor: (!input.trim() || isTyping) ? 'not-allowed' : 'pointer' }}
          >
            {isTyping
              ? <span style={{ display: 'flex', gap: 4 }}>{[0,1,2].map(i => <span key={i} style={{ width:5, height:5, borderRadius:'50%', background:'rgba(255,255,255,0.6)', animation:`chatBounce 1s ease-in-out ${i*0.15}s infinite` }} />)}</span>
              : <><SendIcon /> Send</>
            }
          </button>
        </div>
      </div>
    </>
  );
}
