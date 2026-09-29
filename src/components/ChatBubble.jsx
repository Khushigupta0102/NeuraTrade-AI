/**
 * ChatBubble — Chat message bubble component
 */
import React, { useState } from 'react';

const ChatBubble = React.memo(function ChatBubble({ message }) {
  const { role, content, timestamp, component } = message;
  const isUser = role === 'user';
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(content);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const time = timestamp ? new Date(timestamp).toLocaleTimeString('en-US', {
    hour: '2-digit',
    minute: '2-digit',
  }) : '';

  return (
    <div className={`flex ${isUser ? 'justify-end' : 'justify-start'} mb-4`}>
      <div className={`max-w-[75%] relative group`}>
        {/* Avatar */}
        {!isUser && (
          <div className="flex items-center gap-2 mb-1">
            <div className="w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold"
              style={{ background: 'var(--accent)', color: 'white' }}>
              N
            </div>
            <span className="text-xs font-medium" style={{ color: 'var(--text-secondary)' }}>NeuraTrade AI</span>
          </div>
        )}

        {/* Bubble */}
        <div
          className={`px-4 py-3 rounded-2xl text-sm leading-relaxed ${
            isUser
              ? 'rounded-br-md'
              : 'rounded-bl-md'
          }`}
          style={{
            background: isUser ? 'var(--accent)' : 'var(--bg-card)',
            color: isUser ? 'white' : 'var(--text-primary)',
            border: isUser ? 'none' : '1px solid var(--border-color)',
          }}
        >
          {content}
        </div>

        {/* Inline component (e.g. price card, chart) */}
        {component && (
          <div className="mt-2">
            {component}
          </div>
        )}

        {/* Footer */}
        <div className={`flex items-center gap-2 mt-1 ${isUser ? 'justify-end' : 'justify-start'}`}>
          <span className="text-[10px]" style={{ color: 'var(--text-secondary)' }}>{time}</span>
          <button
            onClick={handleCopy}
            className="opacity-0 group-hover:opacity-100 transition-opacity text-[10px] px-2 py-0.5 rounded"
            style={{ color: 'var(--text-secondary)', background: 'var(--bg-card)' }}
          >
            {copied ? '✓ Copied' : '📋 Copy'}
          </button>
        </div>
      </div>
    </div>
  );
});

export default ChatBubble;
