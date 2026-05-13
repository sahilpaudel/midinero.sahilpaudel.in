// AES-256-GCM encryption for all localStorage data.
// Key is derived from user PIN via PBKDF2 and held only in memory.
// vaultGetRaw / vaultSetRaw are synchronous (reads from in-memory cache)
// so existing store modules need no async changes.

const SALT_KEY  = 'midinero.vault.salt';
const CHECK_KEY = 'midinero.vault.check';

let _key   = null; // CryptoKey — in memory only, never persisted
let _cache = {};   // { [lsKey]: decrypted JSON string }

export function isVaultInitialized() {
  return !!localStorage.getItem(SALT_KEY);
}

export function isUnlocked() {
  return _key !== null;
}

// First-time setup: derive key, store salt + check, encrypt any existing plaintext data.
export async function initVault(pin) {
  const salt = crypto.getRandomValues(new Uint8Array(16));
  _key = await _deriveKey(pin, salt);
  localStorage.setItem(SALT_KEY, _toB64(salt));
  localStorage.setItem(CHECK_KEY, await _enc(_key, 'ok'));
  _cache = {};
  // Migrate any pre-existing plaintext data in one pass
  const keys = _collectDataKeys();
  for (const k of keys) {
    const raw = localStorage.getItem(k);
    if (!raw) continue;
    _cache[k] = raw;
    localStorage.setItem(k, await _enc(_key, raw));
  }
}

// Subsequent launches: re-derive key, verify PIN, populate in-memory cache.
export async function unlockVault(pin) {
  const saltRaw = localStorage.getItem(SALT_KEY);
  if (!saltRaw) throw new Error('not-initialized');
  const key = await _deriveKey(pin, _fromB64(saltRaw));
  const checkRaw = localStorage.getItem(CHECK_KEY);
  if (checkRaw) {
    let result;
    try { result = await _dec(key, checkRaw); } catch { throw new Error('wrong-pin'); }
    if (result !== 'ok') throw new Error('wrong-pin');
  }
  _key = key;
  _cache = {};
  const keys = _collectDataKeys();
  for (const k of keys) {
    const raw = localStorage.getItem(k);
    if (!raw) continue;
    try {
      _cache[k] = await _dec(key, raw);
    } catch {
      _cache[k] = raw; // legacy plaintext — will be re-encrypted on next write
    }
  }
}

export function lockVault() {
  _key   = null;
  _cache = {};
}

// Wipes all app data and vault config — used when user forgets PIN.
export function resetVault() {
  const toDelete = [];
  for (let i = 0; i < localStorage.length; i++) {
    const k = localStorage.key(i);
    if (k.startsWith('midinero') || k.startsWith('ledger')) toDelete.push(k);
  }
  toDelete.forEach(k => localStorage.removeItem(k));
  _key   = null;
  _cache = {};
}

// Synchronous read — returns decrypted string from cache, or falls back to
// direct localStorage (handles keys not yet in cache, e.g. right after initVault).
export function vaultGetRaw(lsKey) {
  if (lsKey in _cache) return _cache[lsKey];
  return localStorage.getItem(lsKey);
}

// Synchronous cache update + fire-and-forget async encrypt → localStorage.
export function vaultSetRaw(lsKey, value) {
  _cache[lsKey] = value;
  if (_key) {
    _enc(_key, value)
      .then(enc => localStorage.setItem(lsKey, enc))
      .catch(() => {});
  } else {
    localStorage.setItem(lsKey, value);
  }
}

export function vaultRemove(lsKey) {
  delete _cache[lsKey];
  localStorage.removeItem(lsKey);
}

// ── internals ──────────────────────────────────────────────────────────────

function _collectDataKeys() {
  const keys = [];
  for (let i = 0; i < localStorage.length; i++) {
    const k = localStorage.key(i);
    if (_shouldEncrypt(k)) keys.push(k);
  }
  return keys;
}

function _shouldEncrypt(k) {
  if (k === SALT_KEY || k === CHECK_KEY) return false;
  // These have their own encryption layer already
  if (k === 'midinero.crypto.key' || k.startsWith('midinero.pdf.pwd.')) return false;
  if (k === 'theme') return false;
  return k.startsWith('midinero') || k.startsWith('ledger');
}

async function _deriveKey(pin, salt) {
  const km = await crypto.subtle.importKey(
    'raw', new TextEncoder().encode(String(pin)), 'PBKDF2', false, ['deriveKey']
  );
  return crypto.subtle.deriveKey(
    { name: 'PBKDF2', salt, iterations: 100_000, hash: 'SHA-256' },
    km,
    { name: 'AES-GCM', length: 256 },
    false,
    ['encrypt', 'decrypt']
  );
}

async function _enc(key, plaintext) {
  const iv = crypto.getRandomValues(new Uint8Array(12));
  const ct = await crypto.subtle.encrypt(
    { name: 'AES-GCM', iv },
    key,
    new TextEncoder().encode(plaintext)
  );
  return JSON.stringify({ iv: _toB64(iv), ct: _toB64(new Uint8Array(ct)) });
}

async function _dec(key, stored) {
  const { iv, ct } = JSON.parse(stored);
  const plain = await crypto.subtle.decrypt(
    { name: 'AES-GCM', iv: _fromB64(iv) },
    key,
    _fromB64(ct)
  );
  return new TextDecoder().decode(plain);
}

function _toB64(bytes) {
  return btoa(String.fromCharCode(...bytes));
}

function _fromB64(b64) {
  return Uint8Array.from(atob(b64), c => c.charCodeAt(0));
}
