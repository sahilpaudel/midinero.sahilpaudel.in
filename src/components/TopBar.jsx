import React from 'react';
import { Icon } from '../icons/Icon.jsx';

const TABS = [
  { k: 'dashboard',     label: 'Overview' },
  { k: 'accounts',      label: 'Accounts' },
  { k: 'subscriptions', label: 'Subscriptions' },
  { k: 'statements',    label: 'Statements' },
  { k: 'import',        label: 'Import' },
];

export default function TopBar({ view, setView, onAdd, hasAny, theme, onToggleTheme }) {
  return (
    <header className="topbar backdrop">
      <div className="topbar-inner">
        <div className="flex items-center gap-10">
          <div className="brand">
            <div className="brand-mark"><span>M</span></div>
            <span className="brand-name">MiDinero</span>
            <span className="pill" style={{ marginLeft: 4 }}>private</span>
          </div>
          <nav className="nav mobile-hidden">
            {TABS.map((t) => (
              <button
                key={t.k}
                className={`tab ${view === t.k || (t.k === 'statements' && view === 'statement') ? 'active' : ''}`}
                onClick={() => setView(t.k)}
              >
                {t.label}
              </button>
            ))}
          </nav>
        </div>

        <div className="flex items-center gap-3">
          <span className="pill">
            <Icon name="lock" size={11} stroke={1.6} /> on-device
          </span>
          <button
            onClick={onToggleTheme}
            title={theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}
            style={{
              width: 32, height: 32, borderRadius: 8,
              border: '1px solid var(--line)',
              background: 'transparent',
              color: 'var(--text-dim)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              transition: 'all 0.2s ease', cursor: 'pointer',
            }}
            onMouseEnter={e => { e.currentTarget.style.color = 'var(--text)'; e.currentTarget.style.borderColor = 'var(--text-faint)'; }}
            onMouseLeave={e => { e.currentTarget.style.color = 'var(--text-dim)'; e.currentTarget.style.borderColor = 'var(--line)'; }}
          >
            <Icon name={theme === 'dark' ? 'sun' : 'moon'} size={14} stroke={1.6} />
          </button>
          {hasAny && (
            <button className="btn-primary mobile-hidden" onClick={onAdd}>
              <Icon name="plus" size={14} stroke={2} /> Add account
            </button>
          )}
        </div>
      </div>
    </header>
  );
}
