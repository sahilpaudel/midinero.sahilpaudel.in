import React, { useMemo, useState } from 'react';
import { ACCOUNT_TYPES } from '../lib/accountTypes.js';
import { Icon } from '../icons/Icon.jsx';
import AccountRow from '../components/AccountRow.jsx';
import EmptyState from '../components/EmptyState.jsx';
import { loadStatements } from '../lib/statementStore.js';

export default function AccountsView({ accounts, onAdd, onEdit }) {
  const [filter, setFilter] = useState('all');
  const [q, setQ] = useState('');

  // Latest statement keyed by accountId — used to show live statement data in rows
  const stmtByAccount = useMemo(() => {
    const map = {};
    for (const s of loadStatements()) {
      if (s.accountId && !map[s.accountId]) map[s.accountId] = s;
    }
    return map;
  }, []);

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

  if (accounts.length === 0) return <EmptyState onAdd={onAdd} />;

  return (
    <div className="pt-14 fade">
      <div style={{
        display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between',
        marginBottom: 32,
      }}>
        <div>
          <div className="eyebrow mb-3">All accounts</div>
          <h1 style={{
            fontFamily: 'Fraunces, serif', fontSize: 40,
            letterSpacing: '-0.03em', lineHeight: 1, margin: 0,
          }}>
            {filtered.length} {filtered.length === 1 ? 'entry' : 'entries'}
          </h1>
        </div>
        <button className="btn-primary" onClick={onAdd}>
          <Icon name="plus" size={14} stroke={2} /> Add new
        </button>
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 20, flexWrap: 'wrap' }}>
        <div className="chips">
          {[
            ['all', 'All'],
            ['asset', 'Assets'],
            ['liability', 'Liabilities'],
          ].map(([k, label]) => (
            <button
              key={k}
              className={`chip ${filter === k ? 'active' : ''}`}
              onClick={() => setFilter(k)}
            >
              {label}
            </button>
          ))}
        </div>
        <div className="search">
          <Icon name="search" size={14} stroke={1.5} />
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Search accounts, banks, funds…"
          />
        </div>
      </div>

      <div className="list">
        {filtered.map((a) => (
          <AccountRow key={a.id} account={a} onClick={() => onEdit(a)} statement={stmtByAccount[a.id]} />
        ))}
        {filtered.length === 0 && (
          <div style={{
            padding: 40, textAlign: 'center',
            color: 'var(--text-faint)', fontSize: 14,
          }}>
            No matches.
          </div>
        )}
      </div>
    </div>
  );
}
