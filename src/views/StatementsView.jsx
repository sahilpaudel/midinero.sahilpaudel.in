import React, { useState } from 'react';
import { loadStatements } from '../lib/statementStore.js';
import { fmtINR } from '../lib/format.js';
import { CATEGORY_COLORS } from '../lib/categorize.js';
import { ACCOUNT_TYPES } from '../lib/accountTypes.js';
import StatementAnalysis from '../components/StatementAnalysis.jsx';

const STATEMENT_TYPES = new Set(['bank', 'creditCard', 'loan', 'nps']);

const MONTH_MAP = { jan:1,feb:2,mar:3,apr:4,may:5,jun:6,jul:7,aug:8,sep:9,oct:10,nov:11,dec:12 };
function toDueDateISO(raw) {
  if (!raw) return '';
  const m1 = raw.match(/(\d{1,2})\s+([A-Za-z]{3,}),?\s+(\d{4})/);
  if (m1) {
    const mo = MONTH_MAP[m1[2].toLowerCase().slice(0, 3)];
    if (mo) return `${m1[3]}-${String(mo).padStart(2,'0')}-${m1[1].padStart(2,'0')}`;
  }
  const m2 = raw.match(/(\d{1,2})[\/\-](\d{1,2})[\/\-](\d{2,4})/);
  if (m2) {
    const yyyy = m2[3].length === 2 ? '20' + m2[3] : m2[3];
    return `${yyyy}-${m2[2].padStart(2,'0')}-${m2[1].padStart(2,'0')}`;
  }
  return '';
}

function fmtCompact(n) {
  if (n >= 1e7) return `₹${(n / 1e7).toFixed(1)}Cr`;
  if (n >= 1e5) return `₹${(n / 1e5).toFixed(1)}L`;
  if (n >= 1e3) return `₹${(n / 1e3).toFixed(0)}K`;
  return `₹${Math.round(n)}`;
}

export default function StatementsView({ onOpen, accounts = [], onAccountUpdate }) {
  const [selectedId, setSelectedId] = useState('');
  const [refreshKey, setRefreshKey] = useState(0);

  const eligible = accounts.filter(a => STATEMENT_TYPES.has(a.type));
  const selected = eligible.find(a => a.id === selectedId) || null;
  const statements = loadStatements();

  const handleStatementData = ({ balance, dueDate }) => {
    if (!selected) return;
    const changes = {};
    if (balance != null) changes.balance = balance;
    if (dueDate) {
      const iso = toDueDateISO(dueDate);
      if (iso) changes.dueDate = iso;
    }
    if (Object.keys(changes).length) onAccountUpdate?.(selected.id, changes);
  };

  const handleViewReport = (id) => {
    setRefreshKey(k => k + 1);
    onOpen(id);
  };

  return (
    <div style={{ maxWidth: 720, margin: '0 auto', paddingTop: 8 }}>

      {/* Page header */}
      <div style={{ marginBottom: 24 }}>
        <div style={{ fontSize: 10, letterSpacing: '0.14em', textTransform: 'uppercase', color: 'var(--text-faint)', marginBottom: 4 }}>
          Saved reports
        </div>
        <h2 style={{ fontFamily: 'Fraunces, serif', fontSize: 26, letterSpacing: '-0.02em', margin: 0 }}>
          Statements
        </h2>
      </div>

      {/* Spending insights (only when there are parsed transactions) */}
      <SpendingInsights statements={statements} />

      {/* Fetch section */}
      <div style={{
        marginBottom: 28, padding: '16px 18px',
        border: '1px solid var(--line)', borderRadius: 12,
        background: 'var(--surface)',
      }}>
        <div style={{ fontSize: 10, letterSpacing: '0.14em', textTransform: 'uppercase', color: 'var(--text-faint)', marginBottom: 12 }}>
          Fetch statement
        </div>
        {eligible.length === 0 ? (
          <div style={{ fontSize: 12, color: 'var(--text-faint)' }}>
            Add a bank, credit card, or loan account first.
          </div>
        ) : (
          <>
            <select
              value={selectedId}
              onChange={e => setSelectedId(e.target.value)}
              style={{
                width: '100%', fontSize: 13, padding: '7px 10px',
                border: '1px solid var(--line)', borderRadius: 8,
                background: 'var(--surface)', color: 'var(--text)',
                outline: 'none', cursor: 'pointer',
              }}
            >
              <option value=''>Select account…</option>
              {eligible.map(a => (
                <option key={a.id} value={a.id}>
                  {a.nickname || ACCOUNT_TYPES[a.type]?.label} · {ACCOUNT_TYPES[a.type]?.label}
                </option>
              ))}
            </select>
            {selected && (
              <StatementAnalysis
                key={selected.id}
                account={selected}
                onViewReport={handleViewReport}
                onStatementData={handleStatementData}
              />
            )}
          </>
        )}
      </div>

      {/* Saved statement list */}
      {statements.length > 0 && (
        <div key={refreshKey} style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          {statements.map(s => <StatementCard key={s.id} s={s} onOpen={onOpen} />)}
        </div>
      )}

      {statements.length === 0 && !eligible.length && (
        <div style={{ textAlign: 'center', paddingTop: 40, color: 'var(--text-faint)' }}>
          <div style={{ fontSize: 12 }}>No statements saved yet.</div>
        </div>
      )}

      <div style={{ height: 48 }} />
    </div>
  );
}

/* ── Spending Insights ──────────────────────────────────────────── */

function SpendingInsights({ statements }) {
  const eligible = statements.filter(
    s => s.accountType === 'bank' || s.accountType === 'creditCard'
  );
  const allTxns  = eligible.flatMap(s => s.transactions || []);
  const debits   = allTxns.filter(t => t.type === 'debit');
  const credits  = allTxns.filter(t => t.type === 'credit');

  if (debits.length === 0) return null;

  const totalSpend  = debits.reduce((s, t) => s + t.amount, 0);
  const totalIncome = credits.reduce((s, t) => s + t.amount, 0);

  // Category totals for spending
  const catMap = {};
  for (const t of debits) catMap[t.category] = (catMap[t.category] || 0) + t.amount;
  const cats = Object.entries(catMap)
    .map(([category, total]) => ({ category, total, pct: (total / totalSpend) * 100 }))
    .sort((a, b) => b.total - a.total);

  const statementSources = eligible.length;

  return (
    <section style={{ marginBottom: 28 }}>
      <div style={{
        fontSize: 10, letterSpacing: '0.14em', textTransform: 'uppercase',
        color: 'var(--text-faint)', marginBottom: 14,
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
      }}>
        <span>Spending insights</span>
        <span>{debits.length} transactions · {statementSources} statement{statementSources !== 1 ? 's' : ''}</span>
      </div>

      {/* Summary pills */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(130px, 1fr))', gap: 10, marginBottom: 16 }}>
        <InsightPill label="Total spend" value={fmtINR(totalSpend)} accent="var(--amber)" />
        {totalIncome > 0 && <InsightPill label="Total inflow" value={fmtINR(totalIncome)} accent="var(--positive)" />}
        <InsightPill label="Transactions" value={debits.length} />
        {cats[0] && <InsightPill label="Top category" value={cats[0].category} />}
      </div>

      {/* Donut + category breakdown */}
      <div style={{
        padding: '20px 20px 20px 16px',
        border: '1px solid var(--line)', borderRadius: 12,
        background: 'var(--surface)',
        display: 'flex', gap: 24, alignItems: 'flex-start', flexWrap: 'wrap',
      }}>
        <DonutChart cats={cats} total={totalSpend} />

        <div style={{ flex: 1, minWidth: 180, display: 'flex', flexDirection: 'column', gap: 10, paddingTop: 4 }}>
          {cats.map((cat, i) => (
            <div key={cat.category}>
              <div style={{
                display: 'flex', justifyContent: 'space-between',
                alignItems: 'baseline', marginBottom: 5, fontSize: 12,
              }}>
                <span style={{ display: 'flex', alignItems: 'center', gap: 7, color: 'var(--text-dim)' }}>
                  <span style={{
                    width: 8, height: 8, borderRadius: '50%', flexShrink: 0,
                    background: CATEGORY_COLORS[cat.category] || CATEGORY_COLORS.Other,
                  }} />
                  {cat.category}
                </span>
                <span style={{ display: 'flex', gap: 12, alignItems: 'baseline' }}>
                  <span style={{ fontSize: 10.5, color: 'var(--text-faint)' }}>
                    {cat.pct.toFixed(0)}%
                  </span>
                  <span style={{ fontVariantNumeric: 'tabular-nums', color: 'var(--text-dim)', minWidth: 72, textAlign: 'right' }}>
                    {fmtINR(cat.total)}
                  </span>
                </span>
              </div>
              <div style={{ height: 3, borderRadius: 2, background: 'var(--line)' }}>
                <div style={{
                  height: '100%', borderRadius: 2,
                  width: `${cat.pct}%`,
                  background: CATEGORY_COLORS[cat.category] || CATEGORY_COLORS.Other,
                  transition: 'width 0.4s ease',
                }} />
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function DonutChart({ cats, total }) {
  const SIZE = 148;
  const R    = 52;
  const STROKE = 18;
  const CX = SIZE / 2;
  const CY = SIZE / 2;
  const circumference = 2 * Math.PI * R;

  // Accumulate percentages for segment offsets.
  let cumPct = 0;

  return (
    <div style={{ position: 'relative', flexShrink: 0, width: SIZE, height: SIZE }}>
      <svg width={SIZE} height={SIZE}>
        {/* Background ring */}
        <circle cx={CX} cy={CY} r={R} fill="none" stroke="var(--line)" strokeWidth={STROKE} />

        {/* One circle per category, each showing only its slice via dasharray */}
        {cats.map(cat => {
          const startPct = cumPct;
          cumPct += cat.pct;
          const dash   = (cat.pct / 100) * circumference;
          const offset = -(startPct / 100) * circumference;
          const color  = CATEGORY_COLORS[cat.category] || CATEGORY_COLORS.Other;
          return (
            <circle
              key={cat.category}
              cx={CX} cy={CY} r={R}
              fill="none"
              stroke={color}
              strokeWidth={STROKE}
              strokeDasharray={`${dash} ${circumference}`}
              strokeDashoffset={offset}
              transform={`rotate(-90 ${CX} ${CY})`}
              strokeLinecap="butt"
            />
          );
        })}
      </svg>

      {/* Center label */}
      <div style={{
        position: 'absolute', inset: 0,
        display: 'flex', flexDirection: 'column',
        alignItems: 'center', justifyContent: 'center',
        pointerEvents: 'none',
      }}>
        <span style={{
          fontSize: 8.5, letterSpacing: '0.12em', textTransform: 'uppercase',
          color: 'var(--text-faint)', marginBottom: 2,
        }}>
          Spent
        </span>
        <span style={{
          fontSize: 13, fontWeight: 600,
          fontVariantNumeric: 'tabular-nums', color: 'var(--text)',
        }}>
          {fmtCompact(total)}
        </span>
      </div>
    </div>
  );
}

function InsightPill({ label, value, accent }) {
  return (
    <div style={{
      padding: '10px 12px',
      border: '1px solid var(--line)', borderRadius: 10,
      background: 'var(--surface)',
    }}>
      <div style={{
        fontSize: 9.5, letterSpacing: '0.14em', textTransform: 'uppercase',
        color: 'var(--text-faint)', marginBottom: 6,
      }}>
        {label}
      </div>
      <div style={{
        fontSize: 14, fontWeight: 500,
        fontVariantNumeric: 'tabular-nums',
        color: accent || 'var(--text)', lineHeight: 1.2,
      }}>
        {value}
      </div>
    </div>
  );
}

/* ── Statement card ─────────────────────────────────────────────── */

function StatementCard({ s, onOpen }) {
  const txns      = s.transactions || [];
  const debitTxns = txns.filter(t => t.type === 'debit');
  const totalSpend = debitTxns.reduce((sum, t) => sum + t.amount, 0);

  const catMap = {};
  for (const t of debitTxns) catMap[t.category] = (catMap[t.category] || 0) + t.amount;
  const topCats = Object.entries(catMap).sort((a, b) => b[1] - a[1]).slice(0, 3);

  const savedAt = s.savedAt
    ? new Date(s.savedAt).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })
    : '';

  return (
    <button
      onClick={() => onOpen(s.id)}
      style={{
        width: '100%', textAlign: 'left',
        padding: '16px 18px',
        border: '1px solid var(--line)', borderRadius: 12,
        background: 'var(--surface)', cursor: 'pointer',
        transition: 'border-color 0.15s ease',
      }}
      onMouseEnter={e => e.currentTarget.style.borderColor = '#333'}
      onMouseLeave={e => e.currentTarget.style.borderColor = 'var(--line)'}
    >
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 10 }}>
        <div>
          <div style={{ fontSize: 14, fontWeight: 500, marginBottom: 2 }}>{s.accountNickname}</div>
          <div style={{ fontSize: 11, color: 'var(--text-faint)' }}>
            {s.source?.date || savedAt}
            {s.source?.subject && <span style={{ opacity: 0.7 }}> · {s.source.subject}</span>}
          </div>
        </div>
        {totalSpend > 0 && (
          <div style={{ textAlign: 'right' }}>
            <div style={{ fontSize: 11, color: 'var(--text-faint)', marginBottom: 1 }}>Total spend</div>
            <div style={{ fontSize: 15, fontWeight: 500, fontVariantNumeric: 'tabular-nums', color: 'var(--negative)' }}>
              {fmtINR(totalSpend)}
            </div>
          </div>
        )}
      </div>

      {topCats.length > 0 && (
        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
          {topCats.map(([cat]) => (
            <span key={cat} style={{
              fontSize: 10.5, padding: '2px 8px', borderRadius: 5,
              background: (CATEGORY_COLORS[cat] || CATEGORY_COLORS.Other) + '22',
              color: CATEGORY_COLORS[cat] || CATEGORY_COLORS.Other,
              display: 'flex', alignItems: 'center', gap: 5,
            }}>
              <span style={{ width: 5, height: 5, borderRadius: '50%', background: 'currentColor' }} />
              {cat}
            </span>
          ))}
          {txns.length > 0 && (
            <span style={{ fontSize: 10.5, color: 'var(--text-faint)', alignSelf: 'center' }}>
              {txns.length} transactions
            </span>
          )}
        </div>
      )}

      {txns.length === 0 && (
        <div style={{ fontSize: 11, color: 'var(--text-faint)' }}>Summary only · no transactions extracted</div>
      )}
    </button>
  );
}
