import React, { useState } from 'react';
import { ACCOUNT_TYPES } from '../lib/accountTypes.js';
import { Icon } from '../icons/Icon.jsx';
import SiteStats from '../components/SiteStats.jsx';

// ── Dummy data for screen previews ──────────────────────────────────

const DEMO_ASSETS = [
  { label: 'HDFC Savings',           sub: 'HDFC Bank · Savings',   value: 142000,  color: '#7dd3fc', icon: 'bank'       },
  { label: 'Parag Parikh Flexi Cap', sub: 'PPFAS Mutual Fund',      value: 892400,  color: '#d4ff3a', icon: 'mf'         },
  { label: 'HDFC Nifty 50 ETF',      sub: 'Zerodha',                value: 324000,  color: '#fbbf24', icon: 'stock'      },
  { label: 'NPS Tier-1',             sub: 'SBI Pension Fund',       value: 286500,  color: '#a78bfa', icon: 'nps'        },
  { label: 'SGB 2024',               sub: 'Sovereign Gold Bond',    value: 95200,   color: '#d9b67c', icon: 'gold'       },
];
const DEMO_LIABS = [
  { label: 'HDFC Infinia',           sub: 'Due 15 Jan',             value: 28500,   color: '#ff6b6b', icon: 'card'       },
  { label: 'SBI Personal Loan',      sub: 'EMI ₹18,400 / mo',       value: 392000,  color: '#fda4af', icon: 'loan'       },
];
const DEMO_TOTAL_ASSETS = DEMO_ASSETS.reduce((s, a) => s + a.value, 0);
const DEMO_TOTAL_LIABS  = DEMO_LIABS.reduce((s, a) => s + a.value, 0);
const DEMO_NET          = DEMO_TOTAL_ASSETS - DEMO_TOTAL_LIABS;

const DEMO_SUBS = [
  { name: 'Netflix',      cat: 'Entertainment', amount: 649,  color: '#ef4444' },
  { name: 'Spotify',      cat: 'Music',         amount: 119,  color: '#22c55e' },
  { name: 'Amazon Prime', cat: 'Shopping',      amount: 299,  color: '#f59e0b' },
  { name: 'Jio Postpaid', cat: 'Utilities',     amount: 999,  color: '#60a5fa' },
  { name: 'Swiggy One',   cat: 'Food',          amount: 402,  color: '#fb923c' },
];
const DEMO_CATS = [
  { name: 'Food & Dining', pct: 32, amount: 9120,  color: '#f59e0b' },
  { name: 'Shopping',      pct: 24, amount: 6840,  color: '#a78bfa' },
  { name: 'Travel',        pct: 18, amount: 5130,  color: '#60a5fa' },
  { name: 'Utilities',     pct: 14, amount: 3990,  color: '#6ee7a0' },
  { name: 'Entertainment', pct: 12, amount: 3420,  color: '#fb923c' },
];

const TYPE_DESC = {
  bank:        'Savings, current, salary, NRE/NRO accounts and FDs',
  mutualFund:  'Track folios — units × NAV value is computed automatically',
  stock:       'Individual stocks and ETF positions with LTP tracking',
  nps:         'National Pension System Tier-1 and Tier-2 accounts',
  crypto:      'Bitcoin, ETH, or any crypto asset valued in INR',
  realestate:  'Properties valued at current market price',
  gold:        'Physical gold, SGBs, digital gold, and gold ETFs',
  cash:        'Cash on hand, wallets, and emergency funds',
  creditCard:  'Track outstanding dues and due dates per cycle',
  loan:        'Home, car, personal loans with EMI and tenure tracking',
};

// ── Small utilities ────────────────────────────────────────────────

function fmtK(n) {
  if (n >= 1e7) return `₹${(n / 1e7).toFixed(1)}Cr`;
  if (n >= 1e5) return `₹${(n / 1e5).toFixed(1)}L`;
  if (n >= 1e3) return `₹${(n / 1e3).toFixed(0)}K`;
  return `₹${Math.round(n)}`;
}
function fmtFull(n) {
  return '₹' + Number(n).toLocaleString('en-IN');
}

// ── Design primitives ──────────────────────────────────────────────

const Eyebrow = ({ children }) => (
  <div style={{ fontSize: 10, letterSpacing: '0.18em', textTransform: 'uppercase', color: 'var(--text-faint)', marginBottom: 12 }}>
    {children}
  </div>
);

const Divider = () => (
  <div style={{ borderTop: '1px solid var(--line)', margin: '72px 0' }} />
);

const Accent = ({ children }) => (
  <em style={{ fontStyle: 'normal', color: 'var(--accent)', fontFamily: 'Fraunces, serif' }}>{children}</em>
);

// ── Browser-frame wrapper for screen previews ──────────────────────

function Screen({ children, label }) {
  return (
    <div>
      <div style={{
        border: '1px solid var(--line)', borderRadius: 14, overflow: 'hidden',
        background: 'var(--ink)',
        boxShadow: '0 32px 80px rgba(0,0,0,0.45), 0 0 0 1px rgba(255,255,255,0.03)',
        fontSize: 12,
      }}>
        {/* macOS chrome */}
        <div style={{
          background: 'var(--ink-soft)', borderBottom: '1px solid var(--line)',
          padding: '8px 14px', display: 'flex', alignItems: 'center', gap: 6,
        }}>
          {['#ff5f57', '#ffbd2e', '#28c840'].map(c => (
            <span key={c} style={{ width: 8, height: 8, borderRadius: '50%', background: c, display: 'inline-block', flexShrink: 0 }} />
          ))}
          <span style={{ flex: 1, textAlign: 'center', fontSize: 10, color: 'var(--text-faint)', letterSpacing: '0.06em' }}>
            midinero · private
          </span>
        </div>
        <div style={{ padding: '20px 20px 24px' }}>{children}</div>
      </div>
      {label && (
        <p style={{ textAlign: 'center', fontSize: 11, color: 'var(--text-faint)', margin: '10px 0 0' }}>{label}</p>
      )}
    </div>
  );
}

// ── Dashboard preview ──────────────────────────────────────────────

function DashboardPreview() {
  const comp = [
    { label: 'Mutual funds', pct: 54, color: '#d4ff3a', value: 892400 },
    { label: 'Stocks',       pct: 20, color: '#fbbf24', value: 324000 },
    { label: 'NPS',          pct: 17, color: '#a78bfa', value: 286500 },
    { label: 'Bank',         pct: 9,  color: '#7dd3fc', value: 142000 },
  ];
  return (
    <Screen label="Overview — net worth, composition, recent activity">
      {/* Hero */}
      <div style={{ display: 'flex', gap: 14, alignItems: 'flex-start', marginBottom: 20 }}>
        <div style={{ flex: 1 }}>
          <div style={{ fontSize: 8.5, letterSpacing: '0.16em', textTransform: 'uppercase', color: 'var(--text-faint)', marginBottom: 6, display: 'flex', gap: 8 }}>
            <span>Net worth</span>
            <span style={{ color: 'var(--line)' }}>·</span>
            <span>14 May 2026</span>
          </div>
          <div style={{ fontFamily: 'Fraunces, serif', fontSize: 28, letterSpacing: '-0.04em', lineHeight: 1, marginBottom: 8 }}>
            {fmtFull(DEMO_NET)}
          </div>
          <div style={{ display: 'flex', gap: 10, fontSize: 10 }}>
            <span style={{ display: 'flex', alignItems: 'center', gap: 4, color: 'var(--positive)' }}>
              <span style={{ width: 5, height: 5, borderRadius: '50%', background: 'currentColor', display: 'inline-block' }} />
              {DEMO_ASSETS.length} assets
            </span>
            <span style={{ display: 'flex', alignItems: 'center', gap: 4, color: 'var(--negative)' }}>
              <span style={{ width: 5, height: 5, borderRadius: '50%', background: 'currentColor', display: 'inline-block' }} />
              {DEMO_LIABS.length} liabilities
            </span>
          </div>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
          {[
            { label: 'Assets',      value: DEMO_TOTAL_ASSETS, color: 'var(--positive)' },
            { label: 'Liabilities', value: DEMO_TOTAL_LIABS,  color: 'var(--negative)' },
          ].map(s => (
            <div key={s.label} style={{
              padding: '8px 12px', border: '1px solid var(--line)',
              borderRadius: 8, background: 'var(--surface)', minWidth: 86,
            }}>
              <div style={{ fontSize: 7.5, letterSpacing: '0.14em', textTransform: 'uppercase', color: 'var(--text-faint)', marginBottom: 4 }}>{s.label}</div>
              <div style={{ fontSize: 12, fontVariantNumeric: 'tabular-nums', color: s.color, fontWeight: 500 }}>{fmtK(s.value)}</div>
            </div>
          ))}
        </div>
      </div>
      {/* Composition */}
      <div style={{ fontSize: 8.5, letterSpacing: '0.14em', textTransform: 'uppercase', color: 'var(--text-faint)', marginBottom: 8 }}>Composition</div>
      <div style={{ display: 'flex', height: 5, borderRadius: 5, overflow: 'hidden', gap: 1, marginBottom: 10 }}>
        {comp.map(d => <div key={d.label} style={{ flex: d.pct, background: d.color }} />)}
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '4px 8px' }}>
        {comp.map(d => (
          <div key={d.label} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: 10 }}>
            <span style={{ display: 'flex', alignItems: 'center', gap: 5, color: 'var(--text-faint)' }}>
              <span style={{ width: 5, height: 5, borderRadius: 1, background: d.color, display: 'inline-block', flexShrink: 0 }} />
              {d.label}
            </span>
            <span style={{ fontVariantNumeric: 'tabular-nums', color: 'var(--text-dim)' }}>{fmtK(d.value)}</span>
          </div>
        ))}
      </div>
    </Screen>
  );
}

// ── Accounts preview ───────────────────────────────────────────────

function AccountsPreview() {
  const Row = ({ item }) => (
    <div style={{
      display: 'flex', alignItems: 'center', justifyContent: 'space-between',
      padding: '7px 10px', borderBottom: '1px solid var(--line-soft)',
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 7 }}>
        <div style={{
          width: 22, height: 22, borderRadius: 5, border: '1px solid var(--line)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          color: item.color, flexShrink: 0,
        }}>
          <Icon name={item.icon} size={10} stroke={1.5} />
        </div>
        <div>
          <div style={{ fontSize: 11, fontWeight: 500 }}>{item.label}</div>
          <div style={{ fontSize: 9, color: 'var(--text-faint)' }}>{item.sub}</div>
        </div>
      </div>
      <div style={{ fontSize: 11, fontVariantNumeric: 'tabular-nums', color: 'var(--text-dim)' }}>{fmtK(item.value)}</div>
    </div>
  );

  const KindHeader = ({ label, total, color }) => (
    <div style={{
      display: 'flex', justifyContent: 'space-between', alignItems: 'center',
      padding: '6px 4px', borderBottom: '1px solid var(--line)', marginBottom: 6,
    }}>
      <span style={{ display: 'flex', alignItems: 'center', gap: 5, fontSize: 8.5, letterSpacing: '0.14em', textTransform: 'uppercase', color: 'var(--text-faint)' }}>
        <span style={{ width: 4, height: 4, borderRadius: '50%', background: color, display: 'inline-block' }} />
        {label}
      </span>
      <span style={{ fontSize: 10, fontVariantNumeric: 'tabular-nums', color }}>{fmtK(total)}</span>
    </div>
  );

  return (
    <Screen label="Accounts — every account grouped, searchable, and tallied">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 }}>
        <div>
          <div style={{ fontSize: 8.5, letterSpacing: '0.14em', textTransform: 'uppercase', color: 'var(--text-faint)', marginBottom: 2 }}>All accounts</div>
          <div style={{ fontFamily: 'Fraunces, serif', fontSize: 22, letterSpacing: '-0.03em' }}>
            {DEMO_ASSETS.length + DEMO_LIABS.length}
            <span style={{ fontSize: 13, color: 'var(--text-dim)', marginLeft: 6 }}>accounts</span>
          </div>
        </div>
        <div style={{ fontSize: 10, padding: '5px 11px', background: 'var(--accent)', color: '#0a0a0a', borderRadius: 20, fontWeight: 500, display: 'flex', alignItems: 'center', gap: 4 }}>
          + Add new
        </div>
      </div>
      <KindHeader label="Assets" total={DEMO_TOTAL_ASSETS} color="var(--positive)" />
      <div style={{ border: '1px solid var(--line)', borderRadius: 8, overflow: 'hidden', marginBottom: 12 }}>
        {DEMO_ASSETS.map(a => <Row key={a.label} item={a} />)}
      </div>
      <KindHeader label="Liabilities" total={DEMO_TOTAL_LIABS} color="var(--negative)" />
      <div style={{ border: '1px solid var(--line)', borderRadius: 8, overflow: 'hidden' }}>
        {DEMO_LIABS.map(a => <Row key={a.label} item={a} />)}
      </div>
    </Screen>
  );
}

// ── Statements preview ─────────────────────────────────────────────

function StatementsPreview() {
  return (
    <Screen label="Statements — parsed from PDF or synced from Gmail">
      <div style={{ marginBottom: 14 }}>
        <div style={{ fontSize: 8.5, letterSpacing: '0.14em', textTransform: 'uppercase', color: 'var(--text-faint)', marginBottom: 3 }}>Analysed statement</div>
        <div style={{ fontSize: 13, fontWeight: 500 }}>HDFC Infinia · Jan 2026</div>
        <div style={{ fontSize: 9.5, color: 'var(--text-faint)', marginTop: 2 }}>Fetched from Gmail · 02 Jan 2026</div>
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 7, marginBottom: 14 }}>
        {[
          { label: 'Total due', value: '₹28,500', color: 'var(--negative)' },
          { label: 'Min due',   value: '₹1,425',  color: 'var(--text-dim)' },
          { label: 'Due date',  value: '15 Jan',   color: 'var(--amber)'   },
        ].map(m => (
          <div key={m.label} style={{ padding: '8px 10px', border: '1px solid var(--line)', borderRadius: 8, background: 'var(--surface)' }}>
            <div style={{ fontSize: 8, letterSpacing: '0.14em', textTransform: 'uppercase', color: 'var(--text-faint)', marginBottom: 4 }}>{m.label}</div>
            <div style={{ fontSize: 12, fontWeight: 600, fontVariantNumeric: 'tabular-nums', color: m.color }}>{m.value}</div>
          </div>
        ))}
      </div>
      <div style={{ fontSize: 8.5, letterSpacing: '0.14em', textTransform: 'uppercase', color: 'var(--text-faint)', marginBottom: 8 }}>Spending by category</div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 7 }}>
        {DEMO_CATS.map(c => (
          <div key={c.name}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 3 }}>
              <span style={{ display: 'flex', alignItems: 'center', gap: 5, fontSize: 10.5, color: 'var(--text-dim)' }}>
                <span style={{ width: 5, height: 5, borderRadius: '50%', background: c.color, display: 'inline-block' }} />
                {c.name}
              </span>
              <span style={{ fontSize: 10, fontVariantNumeric: 'tabular-nums', color: 'var(--text-faint)' }}>
                ₹{c.amount.toLocaleString('en-IN')} · {c.pct}%
              </span>
            </div>
            <div style={{ height: 3, borderRadius: 3, background: 'var(--line)', overflow: 'hidden' }}>
              <div style={{ height: '100%', width: `${c.pct}%`, background: c.color, borderRadius: 3 }} />
            </div>
          </div>
        ))}
      </div>
    </Screen>
  );
}

// ── Subscriptions preview ──────────────────────────────────────────

function SubscriptionsPreview() {
  const total = DEMO_SUBS.reduce((s, x) => s + x.amount, 0);
  return (
    <Screen label="Subscriptions — monthly recurring spend at a glance">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 16 }}>
        <div>
          <div style={{ fontSize: 8.5, letterSpacing: '0.14em', textTransform: 'uppercase', color: 'var(--text-faint)', marginBottom: 3 }}>Monthly total</div>
          <div style={{ fontFamily: 'Fraunces, serif', fontSize: 22, letterSpacing: '-0.03em' }}>
            ₹{total.toLocaleString('en-IN')}
          </div>
          <div style={{ fontSize: 9.5, color: 'var(--text-faint)', marginTop: 2 }}>{DEMO_SUBS.length} active · ₹{(total * 12).toLocaleString('en-IN')} / yr</div>
        </div>
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
        {DEMO_SUBS.map(s => (
          <div key={s.name} style={{
            display: 'flex', alignItems: 'center', justifyContent: 'space-between',
            padding: '7px 10px', border: '1px solid var(--line)', borderRadius: 8, background: 'var(--surface)',
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <div style={{
                width: 22, height: 22, borderRadius: 5,
                background: s.color + '1a', border: `1px solid ${s.color}44`,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: 9, fontWeight: 700, color: s.color, flexShrink: 0,
              }}>
                {s.name[0]}
              </div>
              <div>
                <div style={{ fontSize: 11, fontWeight: 500 }}>{s.name}</div>
                <div style={{ fontSize: 9, color: 'var(--text-faint)' }}>{s.cat}</div>
              </div>
            </div>
            <div style={{ fontSize: 11, fontVariantNumeric: 'tabular-nums', color: 'var(--text-dim)' }}>
              ₹{s.amount.toLocaleString('en-IN')}<span style={{ fontSize: 8.5, color: 'var(--text-faint)' }}>/mo</span>
            </div>
          </div>
        ))}
      </div>
    </Screen>
  );
}

// ── Trust pillar card ──────────────────────────────────────────────

function TrustCard({ icon, title, body }) {
  return (
    <div style={{
      padding: '24px 22px', border: '1px solid var(--line)', borderRadius: 14,
      background: 'var(--surface)', display: 'flex', flexDirection: 'column', gap: 10,
    }}>
      <div style={{
        width: 36, height: 36, borderRadius: 10, border: '1px solid var(--line)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        color: 'var(--accent)', background: 'var(--surface-2)',
      }}>
        <Icon name={icon} size={16} stroke={1.5} />
      </div>
      <div style={{ fontSize: 14, fontWeight: 500 }}>{title}</div>
      <div style={{ fontSize: 13, color: 'var(--text-faint)', lineHeight: 1.65 }}>{body}</div>
    </div>
  );
}

// ── Journey step ───────────────────────────────────────────────────

function JourneyStep({ n, title, body }) {
  return (
    <div style={{ display: 'flex', gap: 20, alignItems: 'flex-start' }}>
      <div style={{
        width: 36, height: 36, borderRadius: '50%', flexShrink: 0,
        background: 'var(--accent)', color: '#0a0a0a',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        fontFamily: 'Fraunces, serif', fontSize: 16, fontWeight: 600,
      }}>
        {n}
      </div>
      <div style={{ paddingTop: 6 }}>
        <div style={{ fontSize: 15, fontWeight: 500, marginBottom: 6 }}>{title}</div>
        <div style={{ fontSize: 13, color: 'var(--text-faint)', lineHeight: 1.65 }}>{body}</div>
      </div>
    </div>
  );
}

// ── Architecture step ──────────────────────────────────────────────

function ArchStep({ n, title, body, last }) {
  return (
    <div style={{ display: 'flex', gap: 16 }}>
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 0 }}>
        <div style={{
          width: 28, height: 28, borderRadius: '50%', flexShrink: 0,
          border: '2px solid var(--accent)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontSize: 12, fontWeight: 600, color: 'var(--accent)',
        }}>
          {n}
        </div>
        {!last && <div style={{ width: 1, flex: 1, background: 'var(--line)', marginTop: 4, marginBottom: 4, minHeight: 28 }} />}
      </div>
      <div style={{ paddingTop: 4, paddingBottom: last ? 0 : 24 }}>
        <div style={{ fontSize: 13, fontWeight: 500, marginBottom: 4 }}>{title}</div>
        <div style={{ fontSize: 12, color: 'var(--text-faint)', lineHeight: 1.6 }}>{body}</div>
      </div>
    </div>
  );
}

// ── FAQ item ───────────────────────────────────────────────────────

function FAQItem({ q, a }) {
  const [open, setOpen] = useState(false);
  return (
    <div style={{ borderBottom: '1px solid var(--line)' }}>
      <button
        onClick={() => setOpen(o => !o)}
        style={{
          width: '100%', textAlign: 'left', padding: '16px 0',
          display: 'flex', justifyContent: 'space-between', alignItems: 'center',
          fontSize: 14, fontWeight: 500,
        }}
      >
        {q}
        <span style={{
          fontSize: 18, color: 'var(--text-faint)', lineHeight: 1, flexShrink: 0, marginLeft: 16,
          transition: 'transform 0.2s ease',
          display: 'inline-block',
          transform: open ? 'rotate(45deg)' : 'rotate(0deg)',
        }}>+</span>
      </button>
      {open && (
        <div style={{ fontSize: 13, color: 'var(--text-faint)', lineHeight: 1.7, paddingBottom: 16, maxWidth: 640 }}>
          {a}
        </div>
      )}
    </div>
  );
}

// ── Feature section layout ─────────────────────────────────────────

function FeatureSection({ eyebrow, title, body, bullets, preview, flip }) {
  return (
    <div style={{
      display: 'grid',
      gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
      gap: 48, alignItems: 'center',
    }}>
      {flip ? (
        <>
          <div>{preview}</div>
          <div>
            <Eyebrow>{eyebrow}</Eyebrow>
            <h2 style={{ fontFamily: 'Fraunces, serif', fontSize: 28, letterSpacing: '-0.03em', margin: '0 0 14px', lineHeight: 1.15 }}>
              {title}
            </h2>
            <p style={{ fontSize: 14, color: 'var(--text-dim)', lineHeight: 1.75, margin: '0 0 20px' }}>{body}</p>
            {bullets && (
              <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: 10 }}>
                {bullets.map(b => (
                  <li key={b} style={{ display: 'flex', alignItems: 'flex-start', gap: 10, fontSize: 13, color: 'var(--text-dim)' }}>
                    <span style={{ color: 'var(--accent)', marginTop: 2, flexShrink: 0 }}>✓</span>
                    {b}
                  </li>
                ))}
              </ul>
            )}
          </div>
        </>
      ) : (
        <>
          <div>
            <Eyebrow>{eyebrow}</Eyebrow>
            <h2 style={{ fontFamily: 'Fraunces, serif', fontSize: 28, letterSpacing: '-0.03em', margin: '0 0 14px', lineHeight: 1.15 }}>
              {title}
            </h2>
            <p style={{ fontSize: 14, color: 'var(--text-dim)', lineHeight: 1.75, margin: '0 0 20px' }}>{body}</p>
            {bullets && (
              <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: 10 }}>
                {bullets.map(b => (
                  <li key={b} style={{ display: 'flex', alignItems: 'flex-start', gap: 10, fontSize: 13, color: 'var(--text-dim)' }}>
                    <span style={{ color: 'var(--accent)', marginTop: 2, flexShrink: 0 }}>✓</span>
                    {b}
                  </li>
                ))}
              </ul>
            )}
          </div>
          <div>{preview}</div>
        </>
      )}
    </div>
  );
}

// ── Main view ──────────────────────────────────────────────────────

export default function AboutView({ onNavigate }) {
  return (
    <div className="pt-14 pb-32 fade" style={{ maxWidth: 900, margin: '0 auto' }}>

      {/* ── Hero ────────────────────────────────────────────────── */}
      <div style={{ paddingBottom: 64, borderBottom: '1px solid var(--line)' }}>
        <Eyebrow>About MiDinero</Eyebrow>
        <h1 style={{
          fontFamily: 'Fraunces, serif',
          fontSize: 'clamp(40px, 6vw, 72px)',
          letterSpacing: '-0.04em', lineHeight: 1.05,
          margin: '0 0 24px', maxWidth: 700,
        }}>
          Your finances.<br />
          <Accent>Privately</Accent> tracked.
        </h1>
        <p style={{ fontSize: 16, color: 'var(--text-dim)', lineHeight: 1.75, maxWidth: 560, margin: '0 0 36px' }}>
          MiDinero is a personal wealth tracker that lives entirely on your device.
          No servers. No accounts. No third-party data sharing. Just you and your money,
          in one quiet place.
        </p>
        <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', marginBottom: 32 }}>
          {[
            { icon: 'lock',  label: 'End-to-end encrypted'    },
            { icon: 'close', label: 'No cloud sync'            },
            { icon: 'close', label: 'No sign-up required'      },
            { icon: 'close', label: 'Zero telemetry'           },
          ].map(p => (
            <span key={p.label} style={{
              display: 'inline-flex', alignItems: 'center', gap: 6,
              fontSize: 11.5, padding: '5px 12px',
              border: '1px solid var(--line)', borderRadius: 20,
              color: 'var(--text-dim)',
            }}>
              <Icon name={p.icon} size={11} stroke={1.6} />
              {p.label}
            </span>
          ))}
        </div>
        <SiteStats />
      </div>

      {/* ── Trust pillars ───────────────────────────────────────── */}
      <div style={{ paddingTop: 64, paddingBottom: 64, borderBottom: '1px solid var(--line)' }}>
        <Eyebrow>Trust &amp; safety</Eyebrow>
        <h2 style={{ fontFamily: 'Fraunces, serif', fontSize: 32, letterSpacing: '-0.03em', margin: '0 0 36px', lineHeight: 1.15 }}>
          Three promises we keep
        </h2>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: 16 }}>
          <TrustCard
            icon="lock"
            title="Everything stays local"
            body="All your account data is encrypted and stored in your browser. It never leaves your device — there are no servers to breach."
          />
          <TrustCard
            icon="close"
            title="No account, no identity"
            body="We don't ask for your email, phone number, or any personally identifying information. You set a vault password. That's the only credential that exists."
          />
          <TrustCard
            icon="pie"
            title="No tracking whatsoever"
            body="MiDinero contains zero analytics, zero error-reporting SDKs, and zero marketing pixels. We don't know who you are or how you use the app."
          />
        </div>
      </div>

      {/* ── Privacy architecture ─────────────────────────────────── */}
      <div style={{ paddingTop: 64, paddingBottom: 64, borderBottom: '1px solid var(--line)' }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 48, alignItems: 'start' }}>
          <div>
            <Eyebrow>How your data is protected</Eyebrow>
            <h2 style={{ fontFamily: 'Fraunces, serif', fontSize: 32, letterSpacing: '-0.03em', margin: '0 0 14px', lineHeight: 1.15 }}>
              The privacy architecture
            </h2>
            <p style={{ fontSize: 14, color: 'var(--text-dim)', lineHeight: 1.75, margin: '0 0 32px' }}>
              From the moment you set up your vault to every balance update you make,
              your data is encrypted before it touches storage. Here's exactly how it works.
            </p>
            <div>
              <ArchStep n={1} title="You choose a vault password"
                body="On first launch you create a vault password. This is the only thing standing between your data and the world — choose a strong one." />
              <ArchStep n={2} title="A key is derived, never stored"
                body="Your password is run through PBKDF2 (100,000 iterations, SHA-256) to produce an AES-256-GCM encryption key. The raw password is never saved anywhere." />
              <ArchStep n={3} title="Every write is encrypted"
                body="Each account, balance, and statement you save is individually encrypted with AES-256-GCM before being written to browser storage." />
              <ArchStep n={4} title="The key lives only in your session"
                body="The derived key is held in memory for the duration of your tab session. When you close the tab, the key is gone. Your encrypted data remains — unreadable without your password." last />
            </div>
          </div>
          <div>
            {/* Architecture diagram */}
            <div style={{
              border: '1px solid var(--line)', borderRadius: 16, padding: 28,
              background: 'var(--surface)', display: 'flex', flexDirection: 'column', gap: 0,
            }}>
              {[
                { label: 'Your vault password', sub: 'Stays in your memory only', color: 'var(--accent)', icon: 'lock' },
                { label: 'PBKDF2 key derivation', sub: '100,000 iterations · SHA-256', color: '#a78bfa', icon: 'repeat' },
                { label: 'AES-256-GCM encryption', sub: 'Each record encrypted independently', color: '#60a5fa', icon: 'pdf' },
                { label: 'Browser Storage', sub: 'On your device · never leaves', color: 'var(--positive)', icon: 'bank' },
              ].map((row, i, arr) => (
                <div key={row.label}>
                  <div style={{
                    display: 'flex', alignItems: 'center', gap: 14,
                    padding: '14px 16px', border: '1px solid var(--line)',
                    borderRadius: 10, background: 'var(--surface-2)',
                  }}>
                    <div style={{
                      width: 34, height: 34, borderRadius: 8, flexShrink: 0,
                      background: row.color + '18', border: `1px solid ${row.color}44`,
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      color: row.color,
                    }}>
                      <Icon name={row.icon} size={14} stroke={1.5} />
                    </div>
                    <div>
                      <div style={{ fontSize: 13, fontWeight: 500 }}>{row.label}</div>
                      <div style={{ fontSize: 11, color: 'var(--text-faint)', marginTop: 2 }}>{row.sub}</div>
                    </div>
                  </div>
                  {i < arr.length - 1 && (
                    <div style={{ display: 'flex', justifyContent: 'center', padding: '4px 0' }}>
                      <div style={{ fontSize: 16, color: 'var(--text-faint)' }}>↓</div>
                    </div>
                  )}
                </div>
              ))}
            </div>
            <div style={{
              marginTop: 14, padding: '12px 16px', borderRadius: 10,
              background: 'var(--accent)12', border: '1px solid var(--accent)33',
              fontSize: 12, color: 'var(--text-dim)', lineHeight: 1.6,
            }}>
              <strong style={{ color: 'var(--accent-text)' }}>Gmail sync note:</strong>{' '}
              When you fetch a statement from Gmail, OAuth reads only the matching email,
              the PDF is parsed locally in your browser, and nothing is retained on any server.
              We never store your Gmail credentials.
            </div>
          </div>
        </div>
      </div>

      {/* ── User journey ─────────────────────────────────────────── */}
      <div style={{ paddingTop: 64, paddingBottom: 64, borderBottom: '1px solid var(--line)' }}>
        <Eyebrow>Getting started</Eyebrow>
        <h2 style={{ fontFamily: 'Fraunces, serif', fontSize: 32, letterSpacing: '-0.03em', margin: '0 0 48px', lineHeight: 1.15 }}>
          Your journey in four steps
        </h2>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 32, maxWidth: 620 }}>
          <JourneyStep n={1} title="Create your vault"
            body="On first use you set a vault password — the single key that protects all your data. No email, no sign-up. Just a password you choose." />
          <JourneyStep n={2} title="Add your accounts"
            body="Pick from 10 account types — bank, credit card, mutual fund, stocks, NPS, crypto, real estate, gold, cash, or loan. Fill in the details, set a nickname, assign to a family member if needed." />
          <JourneyStep n={3} title="Keep balances current"
            body="Update balances manually any time, or upload a PDF statement and let MiDinero parse it automatically. Credit card accounts can sync their outstanding amount and due date from Gmail." />
          <JourneyStep n={4} title="See your full picture"
            body="The Overview shows your net worth, wealth composition by asset class, and recently updated accounts. Drill into Accounts for the full list, Statements for spending analysis, and Subscriptions to track recurring charges." />
        </div>
      </div>

      {/* ── Dashboard feature ────────────────────────────────────── */}
      <div style={{ paddingTop: 64, paddingBottom: 64, borderBottom: '1px solid var(--line)' }}>
        <FeatureSection
          eyebrow="Feature · Overview"
          title="Your financial nerve centre"
          body="The Overview page is the first thing you see when you open MiDinero. It gives you a real-time snapshot of your net worth, a breakdown of where your wealth lives, and a quick look at the accounts you've touched recently."
          bullets={[
            'Net worth updated instantly as balances change',
            'Composition bar showing wealth split across asset types',
            'Assets vs. liabilities at a glance',
            'Per-member breakdown when family accounts are set up',
            'Recently updated accounts for quick edits',
          ]}
          preview={<DashboardPreview />}
        />
      </div>

      {/* ── Accounts feature ─────────────────────────────────────── */}
      <div style={{ paddingTop: 64, paddingBottom: 64, borderBottom: '1px solid var(--line)' }}>
        <FeatureSection
          flip
          eyebrow="Feature · Accounts"
          title="Every account, one view"
          body="The Accounts page lists all your financial accounts grouped by type — bank accounts, mutual funds, stocks, loans, credit cards — with subtotals at every level. Search, filter by category or family member, and tap any row to edit."
          bullets={[
            'Grouped by account type with type-level totals',
            'Filter by Assets, Liabilities, or a specific family member',
            'Full-text search across nickname, institution, and type',
            'Flat search results or grouped view — switches automatically',
            'Total assets, total liabilities, and net displayed at top',
          ]}
          preview={<AccountsPreview />}
        />
      </div>

      {/* ── Statements feature ───────────────────────────────────── */}
      <div style={{ paddingTop: 64, paddingBottom: 64, borderBottom: '1px solid var(--line)' }}>
        <FeatureSection
          eyebrow="Feature · Statements"
          title="Deep-dive into your spending"
          body="Upload a PDF statement or pull the latest one directly from Gmail with one click. MiDinero parses it locally — extracting balances, due dates, transaction lists, spending categories, and payment method breakdowns — all without sending a single byte to a server."
          bullets={[
            'Supports bank, credit card, loan, and NPS statements',
            'Gmail sync via OAuth — reads only the matching email',
            'Spending by category: Food, Travel, Shopping, and more',
            'Payment mode breakdown: UPI, credit, NEFT, ATM',
            'Credit card due date and outstanding synced to the account',
            'Password-protected PDFs supported — passwords remembered securely',
            'Cross-statement Spending Insights aggregated from all uploads',
          ]}
          preview={<StatementsPreview />}
        />
      </div>

      {/* ── Subscriptions feature ────────────────────────────────── */}
      <div style={{ paddingTop: 64, paddingBottom: 64, borderBottom: '1px solid var(--line)' }}>
        <FeatureSection
          flip
          eyebrow="Feature · Subscriptions"
          title="Know exactly what you pay every month"
          body="The Subscriptions page tracks all your recurring payments — streaming services, phone bills, loan EMIs, anything on a regular cycle. See your total monthly outflow, organise by category, and spot expenses you've forgotten about."
          bullets={[
            'Add subscriptions manually or scan Gmail for recurring charges',
            'Monthly and annual total at the top of the page',
            'Categorised: Entertainment, Utilities, Food, and more',
            'Renewal date tracking with overdue alerts',
            'Quick toggle to mark a subscription as paused or cancelled',
          ]}
          preview={<SubscriptionsPreview />}
        />
      </div>

      {/* ── Account types ────────────────────────────────────────── */}
      <div style={{ paddingTop: 64, paddingBottom: 64, borderBottom: '1px solid var(--line)' }}>
        <Eyebrow>What you can track</Eyebrow>
        <h2 style={{ fontFamily: 'Fraunces, serif', fontSize: 32, letterSpacing: '-0.03em', margin: '0 0 14px', lineHeight: 1.15 }}>
          10 account types
        </h2>
        <p style={{ fontSize: 14, color: 'var(--text-dim)', lineHeight: 1.75, margin: '0 0 36px', maxWidth: 560 }}>
          MiDinero handles the full spectrum of Indian personal finance — assets
          that grow and liabilities that shrink.
        </p>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(250px, 1fr))', gap: 12 }}>
          {Object.entries(ACCOUNT_TYPES).map(([k, v]) => (
            <div key={k} style={{
              display: 'flex', alignItems: 'flex-start', gap: 14,
              padding: '16px 16px',
              border: '1px solid var(--line)', borderRadius: 12, background: 'var(--surface)',
            }}>
              <div style={{
                width: 34, height: 34, borderRadius: 9, flexShrink: 0,
                border: '1px solid var(--line)', background: 'var(--surface-2)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                color: v.accent,
              }}>
                <Icon name={v.icon} size={15} stroke={1.5} />
              </div>
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
                  <span style={{ fontSize: 13, fontWeight: 500 }}>{v.label}</span>
                  <span style={{
                    fontSize: 9, letterSpacing: '0.1em', textTransform: 'uppercase',
                    padding: '1px 5px', borderRadius: 4,
                    background: v.kind === 'asset' ? 'var(--positive)18' : 'var(--negative)18',
                    color: v.kind === 'asset' ? 'var(--positive)' : 'var(--negative)',
                  }}>
                    {v.kind}
                  </span>
                </div>
                <div style={{ fontSize: 11.5, color: 'var(--text-faint)', lineHeight: 1.55 }}>
                  {TYPE_DESC[k]}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* ── Family accounts ──────────────────────────────────────── */}
      <div style={{ paddingTop: 64, paddingBottom: 64, borderBottom: '1px solid var(--line)' }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 48, alignItems: 'start' }}>
          <div>
            <Eyebrow>Feature · Family accounts</Eyebrow>
            <h2 style={{ fontFamily: 'Fraunces, serif', fontSize: 32, letterSpacing: '-0.03em', margin: '0 0 14px', lineHeight: 1.15 }}>
              Track your whole family's wealth
            </h2>
            <p style={{ fontSize: 14, color: 'var(--text-dim)', lineHeight: 1.75, margin: '0 0 20px' }}>
              Add family members — spouse, parents, children — and assign accounts to
              each one. MiDinero shows individual net worths and a combined family view.
              All on the same device, all encrypted together.
            </p>
            <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: 10 }}>
              {[
                'Unlimited family members — each with a name and colour',
                'Per-member net worth on the Overview dashboard',
                'Filter accounts by member in the Accounts view',
                'Assign ownership when adding or editing an account',
                'Unassigned accounts default to the primary member',
              ].map(b => (
                <li key={b} style={{ display: 'flex', alignItems: 'flex-start', gap: 10, fontSize: 13, color: 'var(--text-dim)' }}>
                  <span style={{ color: 'var(--accent)', marginTop: 2, flexShrink: 0 }}>✓</span>
                  {b}
                </li>
              ))}
            </ul>
          </div>
          {/* Family bar mockup */}
          <div style={{ border: '1px solid var(--line)', borderRadius: 14, padding: 24, background: 'var(--surface)' }}>
            <div style={{ fontSize: 10, letterSpacing: '0.16em', textTransform: 'uppercase', color: 'var(--text-faint)', marginBottom: 14 }}>
              Family net worth
            </div>
            {[
              { name: 'Rahul',  color: '#d4ff3a', assets: 1140100, liabs: 28500  },
              { name: 'Priya',  color: '#a78bfa', assets: 600000,  liabs: 392000 },
            ].map(m => {
              const net = m.assets - m.liabs;
              const total = 1140100 + 600000;
              const pct = (m.assets / total) * 100;
              return (
                <div key={m.name} style={{ marginBottom: 18 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      <div style={{
                        width: 26, height: 26, borderRadius: '50%',
                        background: m.color + '28', border: `1.5px solid ${m.color}`,
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        fontSize: 11, fontWeight: 700, color: m.color,
                      }}>
                        {m.name[0]}
                      </div>
                      <span style={{ fontSize: 13, fontWeight: 500 }}>{m.name}</span>
                    </div>
                    <div style={{ textAlign: 'right' }}>
                      <div style={{ fontSize: 13, fontVariantNumeric: 'tabular-nums', fontWeight: 500, color: net >= 0 ? 'var(--positive)' : 'var(--negative)' }}>
                        {fmtK(net)}
                      </div>
                      <div style={{ fontSize: 9.5, color: 'var(--text-faint)' }}>net worth</div>
                    </div>
                  </div>
                  <div style={{ height: 5, borderRadius: 5, background: 'var(--line)', overflow: 'hidden' }}>
                    <div style={{
                      height: '100%', width: `${pct}%`,
                      background: `linear-gradient(90deg, ${m.color}80, ${m.color})`,
                      borderRadius: 5, transition: 'width 0.6s ease',
                    }} />
                  </div>
                  <div style={{ display: 'flex', gap: 12, marginTop: 5, fontSize: 10, color: 'var(--text-faint)' }}>
                    <span style={{ color: 'var(--positive)' }}>↑ {fmtK(m.assets)}</span>
                    <span style={{ color: 'var(--negative)' }}>↓ {fmtK(m.liabs)}</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* ── Data backup ──────────────────────────────────────────── */}
      <div style={{ paddingTop: 64, paddingBottom: 64, borderBottom: '1px solid var(--line)' }}>
        <Eyebrow>Data portability</Eyebrow>
        <h2 style={{ fontFamily: 'Fraunces, serif', fontSize: 32, letterSpacing: '-0.03em', margin: '0 0 14px', lineHeight: 1.15 }}>
          Your data, truly yours
        </h2>
        <p style={{ fontSize: 14, color: 'var(--text-dim)', lineHeight: 1.75, margin: '0 0 32px', maxWidth: 560 }}>
          Because everything lives in your browser, you own the exit strategy too.
          Export an encrypted JSON backup from the footer at any time and import it on another device
          or browser. Nothing is locked away.
        </p>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 12 }}>
          {[
            { title: 'Export backup', body: 'Download a single encrypted JSON file containing all your accounts, statements, and settings.', icon: 'upload' },
            { title: 'Import backup', body: 'Restore from a backup file on any device. Your vault password decrypts everything in place.', icon: 'upload' },
            { title: 'CAS import', body: 'Import your CDSL / NSDL Consolidated Account Statement to auto-populate mutual funds and demat accounts.', icon: 'pdf' },
          ].map(c => (
            <div key={c.title} style={{
              padding: '18px 18px', border: '1px solid var(--line)', borderRadius: 12, background: 'var(--surface)',
            }}>
              <div style={{ color: 'var(--text-faint)', marginBottom: 10 }}>
                <Icon name={c.icon} size={16} stroke={1.5} />
              </div>
              <div style={{ fontSize: 13, fontWeight: 500, marginBottom: 6 }}>{c.title}</div>
              <div style={{ fontSize: 12, color: 'var(--text-faint)', lineHeight: 1.6 }}>{c.body}</div>
            </div>
          ))}
        </div>
      </div>

      {/* ── FAQ ──────────────────────────────────────────────────── */}
      <div style={{ paddingTop: 64, paddingBottom: 64, borderBottom: '1px solid var(--line)' }}>
        <Eyebrow>Common questions</Eyebrow>
        <h2 style={{ fontFamily: 'Fraunces, serif', fontSize: 32, letterSpacing: '-0.03em', margin: '0 0 36px', lineHeight: 1.15 }}>
          FAQ
        </h2>
        <div style={{ maxWidth: 680 }}>
          {[
            {
              q: 'What happens if I clear my browser data?',
              a: 'Your encrypted data is stored in browser storage. Clearing browser storage will erase it permanently. Export a backup from the footer regularly — it\'s a single encrypted JSON file you can re-import on any device.',
            },
            {
              q: 'Can I access MiDinero on multiple devices?',
              a: 'Not automatically — by design. There\'s no cloud sync. You can export a backup and import it on another device or browser. Both copies will then be independent.',
            },
            {
              q: 'What encryption does MiDinero use?',
              a: 'AES-256-GCM with a key derived from your vault password using PBKDF2 (100,000 iterations, SHA-256 HMAC). Each record is independently encrypted. The derived key is held only in memory and cleared when you close the tab.',
            },
            {
              q: 'Does the Gmail sync store my emails?',
              a: 'No. Gmail sync uses a standard OAuth flow (read-only scope). It fetches only the matching statement email for the selected account, extracts and parses the PDF attachment locally in your browser, then discards everything. We never store your Gmail credentials or email content.',
            },
            {
              q: 'Is there a mobile app?',
              a: 'MiDinero runs in any modern browser. On iOS and Android you can add it to your home screen (via Share → Add to Home Screen on iOS, or the browser menu on Android) for a native app-like experience.',
            },
            {
              q: 'What if I forget my vault password?',
              a: 'Without your vault password the encrypted data cannot be decrypted. There is no "forgot password" flow — by design, no one (including us) can recover it. If you have a backup export from before you forgot the password, and you remember it, you can re-import. Otherwise the data is unrecoverable.',
            },
            {
              q: 'Are statement PDFs sent to any server?',
              a: 'Never. PDFs are processed entirely inside your browser using the pdf.js library. The text is extracted locally, parsed locally, and stored locally in encrypted form. No file is uploaded anywhere.',
            },
            {
              q: 'Can I use MiDinero offline?',
              a: 'Yes. Once the page has loaded, MiDinero works completely offline. The only features that require internet are Gmail sync (fetching a statement email) and the initial page load.',
            },
          ].map(f => <FAQItem key={f.q} q={f.q} a={f.a} />)}
        </div>
      </div>

      {/* ── Closing CTA ──────────────────────────────────────────── */}
      <div style={{ paddingTop: 64, textAlign: 'center' }}>
        <div style={{
          width: 48, height: 48, borderRadius: 14,
          background: 'var(--accent)', color: '#0a0a0a',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          margin: '0 auto 24px',
        }}>
          <Icon name="lock" size={20} stroke={1.8} />
        </div>
        <h2 style={{
          fontFamily: 'Fraunces, serif',
          fontSize: 'clamp(28px, 4vw, 48px)',
          letterSpacing: '-0.03em', lineHeight: 1.1,
          margin: '0 auto 16px', maxWidth: 560,
        }}>
          Your financial story,<br />
          <Accent>privately</Accent> told.
        </h2>
        <p style={{ fontSize: 14, color: 'var(--text-faint)', lineHeight: 1.75, maxWidth: 440, margin: '0 auto 36px' }}>
          No pitch decks, no venture capital, no monetisation of your data.
          Just a tool that does what it says.
        </p>
        {onNavigate && (
          <button
            className="btn-primary"
            onClick={() => onNavigate('dashboard')}
            style={{ fontSize: 14, padding: '11px 28px' }}
          >
            Back to the app <Icon name="arrowRight" size={14} stroke={1.8} />
          </button>
        )}
      </div>

    </div>
  );
}
