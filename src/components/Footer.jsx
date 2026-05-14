import React, { useRef, useState } from 'react';
import { exportAllData, importAllData } from '../lib/storage.js';

export default function Footer({ onAbout }) {
  const fileRef = useRef();
  const [importing, setImporting] = useState(false);
  const [error, setError]         = useState('');

  const handleImport = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    fileRef.current.value = '';
    if (!window.confirm('This will overwrite all current data. Continue?')) return;
    setImporting(true);
    setError('');
    try {
      await importAllData(file);
    } catch (err) {
      setError(err.message || 'Import failed.');
      setImporting(false);
    }
  };

  return (
    <footer className="footer">
      <div className="footer-inner">
        <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
          <div className="flex items-center gap-2">
            <span style={{
              width: 6, height: 6, borderRadius: '50%',
              background: 'var(--positive)', display: 'inline-block',
            }} />
            All data stored locally · never leaves this device
          </div>
          <div style={{ fontSize: 11, color: 'var(--text-faint)', opacity: 0.7 }}>
            © {new Date().getFullYear()} MiDinero · v0.1
          </div>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', flexWrap: 'wrap', justifyContent: 'center', gap: 16 }}>
          {error && <span style={{ fontSize: 11, color: 'var(--negative)', width: '100%', textAlign: 'center' }}>{error}</span>}
          {onAbout && (
            <>
              <button
                onClick={onAbout}
                style={{ fontSize: 11, color: 'var(--text-faint)', textDecoration: 'underline', textDecorationColor: 'var(--line)' }}
              >
                About
              </button>
              <span style={{ color: 'var(--line)' }}>·</span>
            </>
          )}
          <button
            onClick={exportAllData}
            style={{ fontSize: 11, color: 'var(--text-faint)', textDecoration: 'underline', textDecorationColor: 'var(--line)' }}
          >
            Export backup
          </button>
          <span style={{ color: 'var(--line)' }}>·</span>
          <button
            onClick={() => fileRef.current?.click()}
            disabled={importing}
            style={{ fontSize: 11, color: 'var(--text-faint)', textDecoration: 'underline', textDecorationColor: 'var(--line)' }}
          >
            {importing ? 'Importing…' : 'Import backup'}
          </button>
          <input ref={fileRef} type="file" accept=".json,application/json" style={{ display: 'none' }} onChange={handleImport} />
        </div>
      </div>
    </footer>
  );
}
