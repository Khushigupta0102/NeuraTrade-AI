import React, { useState, useRef, useEffect } from 'react';
import useAppStore from '../store/useAppStore';
import toast from 'react-hot-toast';

/* ── Accordion Section ── */
function AccordionSection({ id, icon, title, isOpen, onToggle, variant = 'default', children }) {
  const contentRef = useRef(null);
  const [height, setHeight] = useState(0);

  useEffect(() => {
    if (contentRef.current) {
      setHeight(isOpen ? contentRef.current.scrollHeight : 0);
    }
  }, [isOpen]);

  const isDanger = variant === 'danger';

  return (
    <div
      className="settings-accordion"
      style={{
        border: `1px solid ${isDanger ? 'rgba(239,68,68,0.2)' : 'var(--border)'}`,
        borderRadius: 'var(--radius-xl)',
        overflow: 'hidden',
        transition: 'border-color 0.25s ease, box-shadow 0.25s ease',
        boxShadow: isOpen
          ? isDanger
            ? '0 0 24px rgba(239,68,68,0.06)'
            : '0 0 24px rgba(99,102,241,0.06)'
          : 'none',
      }}
    >
      {/* Header */}
      <button
        onClick={onToggle}
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          width: '100%',
          padding: '18px 24px',
          background: isOpen
            ? isDanger
              ? 'rgba(239,68,68,0.04)'
              : 'rgba(99,102,241,0.04)'
            : 'transparent',
          border: 'none',
          cursor: 'pointer',
          transition: 'background 0.25s ease',
          fontFamily: 'var(--font-sans)',
        }}
        onMouseEnter={(e) => {
          if (!isOpen) e.currentTarget.style.background = isDanger
            ? 'rgba(239,68,68,0.04)'
            : 'rgba(255,255,255,0.03)';
        }}
        onMouseLeave={(e) => {
          if (!isOpen) e.currentTarget.style.background = 'transparent';
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <span style={{ fontSize: '18px', lineHeight: 1 }}>{icon}</span>
          <span
            style={{
              fontSize: '15px',
              fontWeight: 600,
              color: isDanger ? 'var(--red)' : 'var(--text-1)',
              letterSpacing: '-0.01em',
            }}
          >
            {title}
          </span>
        </div>

        {/* Chevron */}
        <svg
          width="18"
          height="18"
          viewBox="0 0 24 24"
          fill="none"
          stroke={isDanger ? 'var(--red)' : 'var(--text-3)'}
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          style={{
            transition: 'transform 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
            transform: isOpen ? 'rotate(180deg)' : 'rotate(0deg)',
          }}
        >
          <polyline points="6 9 12 15 18 9" />
        </svg>
      </button>

      {/* Collapsible Content */}
      <div
        style={{
          maxHeight: `${height}px`,
          overflow: 'hidden',
          transition: 'max-height 0.35s cubic-bezier(0.4, 0, 0.2, 1)',
        }}
      >
        <div ref={contentRef} style={{ padding: '0 24px 24px' }}>
          {/* Divider */}
          <div
            style={{
              height: '1px',
              background: isDanger ? 'rgba(239,68,68,0.12)' : 'var(--border)',
              marginBottom: '20px',
            }}
          />
          {children}
        </div>
      </div>
    </div>
  );
}

/* ── Toggle Switch ── */
function ToggleSwitch({ checked, onChange, label }) {
  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '12px 16px',
        borderRadius: 'var(--radius-md)',
        background: 'rgba(255,255,255,0.02)',
        border: '1px solid var(--border)',
        transition: 'border-color 0.2s ease',
      }}
    >
      <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
        <span style={{ fontSize: '13px', fontWeight: 500, color: 'var(--text-1)' }}>
          {label}
        </span>
        <span style={{ fontSize: '11px', color: 'var(--text-3)' }}>
          {checked ? 'Dark theme is active' : 'Light theme is active'}
        </span>
      </div>

      <button
        onClick={onChange}
        aria-label={`Toggle ${label}`}
        style={{
          position: 'relative',
          width: '48px',
          height: '26px',
          borderRadius: '13px',
          border: 'none',
          cursor: 'pointer',
          background: checked
            ? 'linear-gradient(135deg, var(--accent), #818cf8)'
            : 'rgba(255,255,255,0.1)',
          transition: 'background 0.3s ease, box-shadow 0.3s ease',
          boxShadow: checked ? '0 0 12px rgba(99,102,241,0.35)' : 'none',
          flexShrink: 0,
        }}
      >
        <div
          style={{
            position: 'absolute',
            top: '3px',
            left: checked ? '25px' : '3px',
            width: '20px',
            height: '20px',
            borderRadius: '50%',
            background: '#fff',
            transition: 'left 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
            boxShadow: '0 1px 4px rgba(0,0,0,0.3)',
          }}
        />
      </button>
    </div>
  );
}

/* ── Styled Select ── */
function StyledSelect({ label, description, value, onChange, options }) {
  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '12px 16px',
        borderRadius: 'var(--radius-md)',
        background: 'rgba(255,255,255,0.02)',
        border: '1px solid var(--border)',
        transition: 'border-color 0.2s ease',
        gap: '16px',
      }}
    >
      <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
        <span style={{ fontSize: '13px', fontWeight: 500, color: 'var(--text-1)' }}>
          {label}
        </span>
        {description && (
          <span style={{ fontSize: '11px', color: 'var(--text-3)' }}>
            {description}
          </span>
        )}
      </div>

      <select
        value={value}
        onChange={onChange}
        style={{
          padding: '8px 32px 8px 12px',
          borderRadius: 'var(--radius-sm)',
          background: 'rgba(255,255,255,0.05)',
          border: '1px solid var(--border)',
          color: 'var(--text-1)',
          fontSize: '13px',
          fontFamily: 'var(--font-sans)',
          fontWeight: 500,
          cursor: 'pointer',
          outline: 'none',
          transition: 'border-color 0.2s ease, box-shadow 0.2s ease',
          appearance: 'none',
          backgroundImage: `url("data:image/svg+xml,%3Csvg width='10' height='6' viewBox='0 0 10 6' fill='none' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M1 1L5 5L9 1' stroke='%2394a3b8' stroke-width='1.5' stroke-linecap='round' stroke-linejoin='round'/%3E%3C/svg%3E")`,
          backgroundRepeat: 'no-repeat',
          backgroundPosition: 'right 10px center',
          minWidth: '120px',
        }}
        onFocus={(e) => {
          e.target.style.borderColor = 'var(--accent)';
          e.target.style.boxShadow = '0 0 0 3px var(--accent-dim)';
        }}
        onBlur={(e) => {
          e.target.style.borderColor = 'var(--border)';
          e.target.style.boxShadow = 'none';
        }}
      >
        {options.map((opt) => (
          <option key={opt.value} value={opt.value}>
            {opt.label}
          </option>
        ))}
      </select>
    </div>
  );
}

/* ── Danger Button ── */
function DangerButton({ onClick, icon, label, description }) {
  const [hovering, setHovering] = useState(false);

  return (
    <button
      onClick={onClick}
      onMouseEnter={() => setHovering(true)}
      onMouseLeave={() => setHovering(false)}
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: '12px',
        padding: '12px 16px',
        borderRadius: 'var(--radius-md)',
        border: '1px solid rgba(239,68,68,0.2)',
        background: hovering ? 'rgba(239,68,68,0.12)' : 'rgba(239,68,68,0.04)',
        cursor: 'pointer',
        transition: 'all 0.25s ease',
        flex: 1,
        minWidth: '200px',
        fontFamily: 'var(--font-sans)',
        textAlign: 'left',
      }}
    >
      <span style={{ fontSize: '18px' }}>{icon}</span>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
        <span
          style={{
            fontSize: '13px',
            fontWeight: 600,
            color: hovering ? '#fca5a5' : 'var(--red)',
            transition: 'color 0.25s ease',
          }}
        >
          {label}
        </span>
        <span style={{ fontSize: '11px', color: 'var(--text-3)' }}>{description}</span>
      </div>
    </button>
  );
}

/* ════════════════════════════════════════════════
 *  SETTINGS PAGE
 * ════════════════════════════════════════════════ */
export default function Settings() {
  const { settings, updateSettings, theme, setTheme, clearPortfolio } = useAppStore();

  const [open, setOpen] = useState(null);
  const [localSettings, setLocalSettings] = useState(settings);
  const [saved, setSaved] = useState(false);

  const handleSave = () => {
    updateSettings(localSettings);
    setSaved(true);
    toast.success('Preferences saved');
    setTimeout(() => setSaved(false), 2000);
  };

  const handleClearCache = () => {
    localStorage.clear();
    toast.success('Cache cleared');
    setTimeout(() => window.location.reload(), 1000);
  };

  const toggle = (section) => {
    setOpen(open === section ? null : section);
  };

  const hasChanges =
    localSettings.pollingInterval !== settings.pollingInterval ||
    localSettings.currency !== settings.currency;

  return (
    <div
      className="page-enter"
      style={{
        maxWidth: '680px',
        margin: '0 auto',
        padding: '8px 16px 48px',
        display: 'flex',
        flexDirection: 'column',
        gap: '16px',
      }}
    >
      {/* ── Page Header ── */}
      <div style={{ marginBottom: '8px' }}>
        <h1
          style={{
            fontSize: '28px',
            fontWeight: 700,
            color: 'var(--text-1)',
            letterSpacing: '-0.025em',
            lineHeight: 1.2,
            margin: 0,
          }}
        >
          Settings
        </h1>
        <p
          style={{
            fontSize: '13px',
            color: 'var(--text-3)',
            marginTop: '6px',
            lineHeight: 1.5,
          }}
        >
          Manage your appearance, preferences, and account data.
        </p>
      </div>

      {/* ═══════════════ APPEARANCE ═══════════════ */}
      <AccordionSection
        id="appearance"
        icon="🎨"
        title="Appearance"
        isOpen={open === 'appearance'}
        onToggle={() => toggle('appearance')}
      >
        <ToggleSwitch
          label="Dark Mode"
          checked={theme === 'dark'}
          onChange={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
        />
      </AccordionSection>

      {/* ═══════════════ PREFERENCES ═══════════════ */}
      <AccordionSection
        id="preferences"
        icon="⚙️"
        title="Preferences"
        isOpen={open === 'preferences'}
        onToggle={() => toggle('preferences')}
      >
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          <StyledSelect
            label="Refresh Interval"
            description="How often market data refreshes"
            value={localSettings.pollingInterval}
            onChange={(e) =>
              setLocalSettings({
                ...localSettings,
                pollingInterval: Number(e.target.value),
              })
            }
            options={[
              { value: 15, label: '15 seconds' },
              { value: 30, label: '30 seconds' },
              { value: 60, label: '1 minute' },
              { value: 120, label: '2 minutes' },
            ]}
          />

          <StyledSelect
            label="Currency"
            description="Display prices in your preferred currency"
            value={localSettings.currency}
            onChange={(e) =>
              setLocalSettings({
                ...localSettings,
                currency: e.target.value,
              })
            }
            options={[
              { value: 'usd', label: 'USD ($)' },
              { value: 'eur', label: 'EUR (€)' },
              { value: 'btc', label: 'BTC (₿)' },
            ]}
          />

          {/* Save Button */}
          <button
            onClick={handleSave}
            disabled={!hasChanges && !saved}
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '8px',
              width: '100%',
              padding: '12px 24px',
              marginTop: '8px',
              borderRadius: 'var(--radius-md)',
              border: 'none',
              fontSize: '13px',
              fontWeight: 600,
              fontFamily: 'var(--font-sans)',
              cursor: hasChanges ? 'pointer' : 'default',
              transition: 'all 0.25s ease',
              background: saved
                ? 'linear-gradient(135deg, var(--green), #16a34a)'
                : hasChanges
                  ? 'linear-gradient(135deg, var(--accent), #818cf8)'
                  : 'rgba(255,255,255,0.05)',
              color: saved || hasChanges ? '#fff' : 'var(--text-3)',
              boxShadow: hasChanges
                ? '0 4px 16px rgba(99,102,241,0.3)'
                : saved
                  ? '0 4px 16px rgba(34,197,94,0.3)'
                  : 'none',
              letterSpacing: '-0.01em',
            }}
          >
            {saved ? (
              <>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <polyline points="20 6 9 17 4 12" />
                </svg>
                Saved Successfully
              </>
            ) : (
              'Save Changes'
            )}
          </button>
        </div>
      </AccordionSection>

      {/* ═══════════════ DANGER ZONE ═══════════════ */}
      <AccordionSection
        id="danger"
        icon="⚠️"
        title="Danger Zone"
        isOpen={open === 'danger'}
        onToggle={() => toggle('danger')}
        variant="danger"
      >
        <p
          style={{
            fontSize: '12px',
            color: 'var(--text-3)',
            marginBottom: '16px',
            lineHeight: 1.6,
          }}
        >
          These actions are irreversible. Proceed with caution.
        </p>

        <div
          style={{
            display: 'flex',
            gap: '12px',
            flexWrap: 'wrap',
          }}
        >
          <DangerButton
            onClick={() => {
              clearPortfolio();
              toast.success('Portfolio cleared');
            }}
            icon="🗑️"
            label="Reset Portfolio"
            description="Remove all holdings"
          />
          <DangerButton
            onClick={handleClearCache}
            icon="🧹"
            label="Clear Cache"
            description="Wipe local data & reload"
          />
        </div>
      </AccordionSection>

      {/* ── Footer ── */}
      <div
        style={{
          textAlign: 'center',
          paddingTop: '16px',
          borderTop: '1px solid var(--border)',
        }}
      >
        <p style={{ fontSize: '11px', color: 'var(--text-3)', letterSpacing: '0.02em' }}>
          NeuraTrade AI • Settings are saved locally in your browser.
        </p>
      </div>
    </div>
  );
}