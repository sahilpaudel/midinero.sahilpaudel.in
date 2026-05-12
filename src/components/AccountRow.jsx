import React from 'react';
import { ACCOUNT_TYPES } from '../lib/accountTypes.js';
import { fmtINR, fmtDate } from '../lib/format.js';
import { Icon } from '../icons/Icon.jsx';

function getContext(account) {
  const { type } = account;

  if (type === 'creditCard') {
    if (account.dueDate) {
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const due = new Date(account.dueDate);
      const days = Math.ceil((due - today) / 86400000);
      const label = days < 0 ? 'Overdue' : days === 0 ? 'Due today' : `Due ${fmtDate(account.dueDate)}`;
      const color = days < 0 || days === 0 ? 'var(--negative)' : days <= 5 ? 'var(--amber)' : 'var(--text-faint)';
      return { label, color };
    }
    if (account.limit) return { label: `Limit ${fmtINR(account.limit, { compact: true })}`, color: 'var(--text-faint)' };
    return null;
  }

  if (type === 'loan') {
    if (account.emi) return { label: `${fmtINR(account.emi, { compact: true })}/mo EMI`, color: 'var(--text-faint)' };
    if (account.endDate) return { label: `Ends ${fmtDate(account.endDate)}`, color: 'var(--text-faint)' };
    return null;
  }

  if (type === 'mutualFund') {
    if (account.units) {
      const u = Number(account.units);
      return { label: `${u.toLocaleString('en-IN', { maximumFractionDigits: 3 })} units`, color: 'var(--text-faint)' };
    }
    return null;
  }

  if (type === 'stock') {
    if (account.quantity) return { label: `${account.quantity} qty`, color: 'var(--text-faint)' };
    if (account.ticker) return { label: account.ticker, color: 'var(--text-faint)' };
    return null;
  }

  if (type === 'bank') {
    const parts = [];
    if (account.accountType) parts.push(account.accountType);
    if (account.accountNumber) parts.push(`••${String(account.accountNumber).slice(-4)}`);
    return parts.length ? { label: parts.join(' · '), color: 'var(--text-faint)' } : null;
  }

  if (type === 'nps') {
    const parts = [];
    if (account.tier) parts.push(account.tier);
    if (account.scheme) parts.push(account.scheme);
    return parts.length ? { label: parts[0], color: 'var(--text-faint)' } : null;
  }

  if (type === 'gold') {
    const parts = [];
    if (account.weight) parts.push(`${account.weight}g`);
    if (account.form) parts.push(account.form);
    return parts.length ? { label: parts.join(' · '), color: 'var(--text-faint)' } : null;
  }

  if (type === 'crypto') {
    if (account.symbol) return { label: account.symbol, color: 'var(--text-faint)' };
    if (account.exchange) return { label: account.exchange, color: 'var(--text-faint)' };
    return null;
  }

  if (type === 'realestate') {
    if (account.address) return { label: account.address, color: 'var(--text-faint)' };
    return null;
  }

  return null;
}

export default function AccountRow({ account, onClick, compact = false }) {
  const meta = ACCOUNT_TYPES[account.type] || {};
  const isLiab = meta.kind === 'liability';
  const ctx = getContext(account);

  const subParts = [
    meta.label,
    account.institution,
    account.issuer,
    account.lender,
    account.amc,
    account.broker,
    account.exchange,
  ].filter(Boolean);

  return (
    <button className="row" onClick={onClick}>
      <div className="row-icon" style={{ color: meta.accent }}>
        <Icon name={meta.icon} size={16} stroke={1.5} />
      </div>
      <div className="row-main">
        <div className="row-title">{account.nickname || meta.label}</div>
        <div className="row-sub">{subParts.join(' · ')}</div>
      </div>
      {ctx && !compact && (
        <div style={{
          fontSize: 11, color: ctx.color,
          fontVariantNumeric: 'tabular-nums',
          textAlign: 'right', flexShrink: 0,
          maxWidth: 120, whiteSpace: 'nowrap',
          overflow: 'hidden', textOverflow: 'ellipsis',
        }}>
          {ctx.label}
        </div>
      )}
      <div className="row-value">
        <div
          className="row-amount tabular"
          style={{ color: isLiab ? 'var(--negative)' : 'var(--text)' }}
        >
          {isLiab ? '−' : ''}
          {fmtINR(account.balance, { compact: true }).replace('−', '')}
        </div>
        {!compact && (
          <div className="row-date">
            {account.updatedAt
              ? fmtDate(new Date(account.updatedAt).toISOString())
              : null}
          </div>
        )}
      </div>
    </button>
  );
}
