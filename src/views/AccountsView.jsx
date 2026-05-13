import React, { useMemo, useState } from 'react';
import { ACCOUNT_TYPES } from '../lib/accountTypes.js';
import { fmtINR } from '../lib/format.js';
import { Icon } from '../icons/Icon.jsx';
import AccountRow from '../components/AccountRow.jsx';
import EmptyState from '../components/EmptyState.jsx';
import { loadStatements } from '../lib/statementStore.js';

// Ordered type keys as defined in ACCOUNT_TYPES
const TYPE_ORDER = Object.keys(ACCOUNT_TYPES);

function getTypeTotal(accounts, type, stmtByAccount) {
  return accounts.reduce((sum, a) => {
    if (a.type !== type) return sum;
    const bal = a.type === 'creditCard'
      ? (a.balance != null && a.balance !== '' ? Number(a.balance) : (stmtByAccount[a.id]?.summary?.totalDue ?? 0))
      : (Number(a.balance) || 0);
    return sum + bal;
  }, 0);
}

function resolveMember(account, members) {
  if (members.length < 2) return null;
  return members.find(m => m.id === account.ownerId) || (account.ownerId ? null : members[0]);
}

export default function AccountsView({ accounts, onAdd, onEdit, members = [] }) {
  const [filter, setFilter] = useState('all');
  const [q, setQ] = useState('');

  const stmtByAccount = useMemo(() => {
    const map = {};
    for (const s of loadStatements()) {
      if (s.accountId && !map[s.accountId]) map[s.accountId] = s;
    }
    return map;
  }, []);

  const totals = useMemo(() => {
    let assets = 0, liabs = 0;
    for (const a of accounts) {
      const meta = ACCOUNT_TYPES[a.type];
      const bal = a.type === 'creditCard'
        ? (a.balance != null && a.balance !== '' ? Number(a.balance) : (stmtByAccount[a.id]?.summary?.totalDue ?? 0))
        : (Number(a.balance) || 0);
      if (meta?.kind === 'liability') liabs += bal;
      else assets += bal;
    }
    return { assets, liabs };
  }, [accounts, stmtByAccount]);

  const filtered = useMemo(() => {
    return accounts.filter((a) => {
      const meta = ACCOUNT_TYPES[a.type];
      if (filter !== 'all' && meta?.kind !== filter) return false;
      if (q) {
        const haystack = `${a.nickname} ${a.institution || ''} ${a.issuer || ''} ${
          a.amc || ''
        } ${a.lender || ''} ${meta?.label || ''}`.toLowerCase();
        if (!haystack.includes(q.toLowerCase())) return false;
      }
      return true;
    });
  }, [accounts, filter, q]);

  const assetCount = accounts.filter(a => ACCOUNT_TYPES[a.type]?.kind === 'asset').length;
  const liabCount  = accounts.filter(a => ACCOUNT_TYPES[a.type]?.kind === 'liability').length;

  // Build grouped data: { type → accounts[] } respecting TYPE_ORDER
  const grouped = useMemo(() => {
    const map = {};
    for (const a of filtered) {
      if (!map[a.type]) map[a.type] = [];
      map[a.type].push(a);
    }
    // Return in defined type order
    return TYPE_ORDER.filter(k => map[k]).map(k => ({ type: k, items: map[k] }));
  }, [filtered]);

  const assetGroups = grouped.filter(g => ACCOUNT_TYPES[g.type]?.kind === 'asset');
  const liabGroups  = grouped.filter(g => ACCOUNT_TYPES[g.type]?.kind === 'liability');

  const isGrouped = !q; // group whenever not searching

  if (accounts.length === 0) return <EmptyState onAdd={onAdd} />;

  return (
    <div className="pt-14 pb-24 fade">

      {/* ── Page header ── */}
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 32 }}>
        <div>
          <div className="eyebrow mb-3">All accounts</div>
          <h1 style={{
            fontFamily: 'Fraunces, serif', fontSize: 40,
            letterSpacing: '-0.03em', lineHeight: 1, margin: 0,
          }}>
            {accounts.length}
            <span style={{ fontSize: 22, letterSpacing: '-0.01em', color: 'var(--text-dim)', marginLeft: 10 }}>
              {accounts.length === 1 ? 'account' : 'accounts'}
            </span>
          </h1>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginTop: 10, fontSize: 12 }}>
            <span style={{ color: 'var(--positive)' }}>{assetCount} assets</span>
            <span style={{ color: 'var(--line)', fontSize: 16 }}>·</span>
            <span style={{ color: 'var(--negative)' }}>{liabCount} liabilities</span>
          </div>
        </div>
        <button className="btn-primary" onClick={onAdd}>
          <Icon name="plus" size={14} stroke={2} /> Add new
        </button>
      </div>

      {/* ── Summary strip ── */}
      {(totals.assets + totals.liabs) > 0 && (
        <div style={{
          display: 'flex', marginBottom: 28,
          border: '1px solid var(--line)', borderRadius: 10, overflow: 'hidden',
        }}>
          {[
            { label: 'Total assets',     value: totals.assets,                      color: 'var(--positive)' },
            { label: 'Total liabilities', value: totals.liabs,                      color: 'var(--negative)' },
            { label: 'Net',              value: totals.assets - totals.liabs,
              color: totals.assets - totals.liabs >= 0 ? 'var(--text)' : 'var(--negative)' },
          ].map((item, i, arr) => (
            <div key={item.label} style={{
              flex: 1, padding: '12px 18px',
              borderRight: i < arr.length - 1 ? '1px solid var(--line)' : 'none',
            }}>
              <div style={{ fontSize: 9.5, letterSpacing: '0.18em', textTransform: 'uppercase', color: 'var(--text-faint)', marginBottom: 3 }}>
                {item.label}
              </div>
              <div style={{ fontSize: 15, fontVariantNumeric: 'tabular-nums', letterSpacing: '-0.02em', color: item.color }}>
                {fmtINR(item.value)}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* ── Search + filter ── */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 28 }}>
        <div className="search" style={{ flex: 1 }}>
          <Icon name="search" size={14} stroke={1.5} />
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Search accounts, banks, funds…"
          />
          {q && (
            <button
              onClick={() => setQ('')}
              style={{ color: 'var(--text-faint)', fontSize: 18, lineHeight: 1, padding: '0 2px', flexShrink: 0 }}
            >
              ×
            </button>
          )}
        </div>
        <div className="chips">
          {[['all', 'All'], ['asset', 'Assets'], ['liability', 'Liabilities']].map(([k, label]) => (
            <button key={k} className={`chip ${filter === k ? 'active' : ''}`} onClick={() => setFilter(k)}>
              {label}
            </button>
          ))}
        </div>
      </div>

      {/* ── Account list ── */}
      {filtered.length === 0 ? (
        <div style={{ padding: '52px 0', textAlign: 'center' }}>
          <div style={{ fontSize: 13, color: 'var(--text-faint)', marginBottom: 10 }}>
            No accounts match{q ? ` "${q}"` : ' this filter'}.
          </div>
          {q && (
            <button onClick={() => setQ('')} style={{ fontSize: 12, color: 'var(--accent-text)' }}>
              Clear search
            </button>
          )}
        </div>
      ) : !isGrouped ? (
        // Flat search results
        <div className="list">
          {filtered.map((a) => (
            <AccountRow key={a.id} account={a} onClick={() => onEdit(a)} statement={stmtByAccount[a.id]} member={resolveMember(a, members)} />
          ))}
        </div>
      ) : filter === 'liability' ? (
        // Liability-only grouped view
        <TypeGroups groups={liabGroups} onEdit={onEdit} stmtByAccount={stmtByAccount} members={members} />
      ) : filter === 'asset' ? (
        // Asset-only grouped view
        <TypeGroups groups={assetGroups} onEdit={onEdit} stmtByAccount={stmtByAccount} members={members} />
      ) : (
        // All — two top-level sections with type sub-groups
        <>
          {assetGroups.length > 0 && (
            <KindSection
              label="Assets"
              accentColor="var(--positive)"
              total={totals.assets}
              groups={assetGroups}
              onEdit={onEdit}
              stmtByAccount={stmtByAccount}
              members={members}
            />
          )}
          {liabGroups.length > 0 && (
            <KindSection
              label="Liabilities"
              accentColor="var(--negative)"
              total={totals.liabs}
              groups={liabGroups}
              onEdit={onEdit}
              stmtByAccount={stmtByAccount}
              members={members}
            />
          )}
        </>
      )}
    </div>
  );
}

/* ── Assets / Liabilities top-level divider ── */
function KindSection({ label, accentColor, total, groups, onEdit, stmtByAccount, members }) {
  return (
    <div style={{ marginBottom: 36 }}>
      <div style={{
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        marginBottom: 20, paddingBottom: 12,
        borderBottom: '1px solid var(--line)',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <span style={{ width: 5, height: 5, borderRadius: '50%', background: accentColor, display: 'inline-block' }} />
          <span style={{ fontSize: 11, letterSpacing: '0.18em', textTransform: 'uppercase', color: 'var(--text-faint)' }}>
            {label}
          </span>
        </div>
        <span style={{ fontSize: 13, fontVariantNumeric: 'tabular-nums', color: accentColor, letterSpacing: '-0.02em' }}>
          {fmtINR(total)}
        </span>
      </div>
      <TypeGroups groups={groups} onEdit={onEdit} stmtByAccount={stmtByAccount} members={members} />
    </div>
  );
}

/* ── Type sub-groups (e.g. Bank accounts, Mutual funds) ── */
function TypeGroups({ groups, onEdit, stmtByAccount, members = [] }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
      {groups.map(({ type, items }) => {
        const meta = ACCOUNT_TYPES[type];
        const typeTotal = items.reduce((sum, a) => {
          const bal = a.type === 'creditCard'
            ? (a.balance != null && a.balance !== '' ? Number(a.balance) : (stmtByAccount[a.id]?.summary?.totalDue ?? 0))
            : (Number(a.balance) || 0);
          return sum + bal;
        }, 0);

        return (
          <div key={type}>
            {/* Type header */}
            <div style={{
              display: 'flex', alignItems: 'center', justifyContent: 'space-between',
              marginBottom: 8, padding: '0 4px',
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <span style={{
                  width: 22, height: 22, borderRadius: 6,
                  border: '1px solid var(--line)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  color: meta.accent, flexShrink: 0,
                }}>
                  <Icon name={meta.icon} size={11} stroke={1.5} />
                </span>
                <span style={{ fontSize: 12, fontWeight: 500, color: 'var(--text-dim)' }}>
                  {meta.label}
                </span>
                <span style={{
                  fontSize: 10, color: 'var(--text-faint)',
                  background: 'var(--surface)', border: '1px solid var(--line)',
                  borderRadius: 4, padding: '1px 5px',
                }}>
                  {items.length}
                </span>
              </div>
              <span style={{ fontSize: 12, fontVariantNumeric: 'tabular-nums', color: 'var(--text-dim)', letterSpacing: '-0.01em' }}>
                {fmtINR(typeTotal)}
              </span>
            </div>

            {/* Accounts in this type */}
            <div className="list">
              {items.map((a) => (
                <AccountRow key={a.id} account={a} onClick={() => onEdit(a)} statement={stmtByAccount[a.id]} member={resolveMember(a, members)} />
              ))}
            </div>
          </div>
        );
      })}
    </div>
  );
}
