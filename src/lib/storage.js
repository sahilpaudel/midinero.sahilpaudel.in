// All data stays on this device. localStorage only — no server, no telemetry.

import { ACCOUNT_TYPES } from './accountTypes.js';
import { isAggregateMutualFund, isImportedDetailedMutualFund, normalizeIsin } from './importMerge.js';

const LEGACY_STORE_KEY = 'ledger.v1.accounts';
const TYPE_STORE_PREFIX = 'ledger.v2.accounts.';
const TYPE_KEYS = Object.keys(ACCOUNT_TYPES);

export function loadAccounts() {
  try {
    const typedAccounts = loadTypedAccounts();
    if (typedAccounts.length > 0) return sanitizeAccounts(typedAccounts);

    const legacyAccounts = JSON.parse(localStorage.getItem(LEGACY_STORE_KEY) || '[]');
    const migrated = sanitizeAccounts(legacyAccounts);

    if (migrated.length > 0) saveAccounts(migrated);
    return migrated;
  } catch {
    return [];
  }
}

export function saveAccounts(list) {
  const sanitized = sanitizeAccounts(list);
  const grouped = groupByType(sanitized);

  TYPE_KEYS.forEach((type) => {
    localStorage.setItem(typeStoreKey(type), JSON.stringify(grouped[type] || []));
  });

  localStorage.removeItem(LEGACY_STORE_KEY);
}

function loadTypedAccounts() {
  return TYPE_KEYS.flatMap((type) => {
    try {
      const stored = JSON.parse(localStorage.getItem(typeStoreKey(type)) || '[]');
      return Array.isArray(stored)
        ? stored.map((account) => ({ ...account, type: account.type || type }))
        : [];
    } catch {
      return [];
    }
  });
}

function groupByType(list) {
  return sanitizeAccounts(list).reduce((groups, account) => {
    if (!TYPE_KEYS.includes(account?.type)) return groups;
    groups[account.type] = groups[account.type] || [];
    groups[account.type].push(account);
    return groups;
  }, {});
}

function typeStoreKey(type) {
  return `${TYPE_STORE_PREFIX}${type}`;
}

function sanitizeAccounts(list) {
  if (!Array.isArray(list)) return [];

  const hasMutualFundAggregate = list.some(isAggregateMutualFund);

  return list.filter((account) => {
    if (!TYPE_KEYS.includes(account?.type)) return false;
    if (hasMutualFundAggregate && isImportedDetailedMutualFund(account)) return false;

    const isin = normalizeIsin(account?.isin);
    const importedAsMutualFundIsin = String(account?.importKey || '').startsWith('mf:isin:');
    if (importedAsMutualFundIsin && isin && !isin.startsWith('INF')) return false;

    return true;
  });
}
