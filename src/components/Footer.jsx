import React, { useRef, useState } from 'react';
import { exportAllData, importAllData } from '../lib/storage.js';

export default function Footer() {
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
        <div className="flex items-center gap-2">
          <span style={{
            width: 6, height: 6, borderRadius: '50%',
            background: 'var(--positive)', display: 'inline-block',
          }} />
          All data stored locally · localStorage only
        </div>
        <div className="flex items-center" style={{ gap: 16 }}>
          {error && <span style={{ fontSize: 11, color: 'var(--negative)' }}>{error}</span>}
          <button
            onClick={exportAllData}
            style={{ fontSize: 11, color: 'var(--text-faint)', textDecoration: 'underline', textDecorationColor: 'var(--line)' }}
          >
            Export backup
          </button>
          <button
            onClick={() => fileRef.current?.click()}
            disabled={importing}
            style={{ fontSize: 11, color: 'var(--text-faint)', textDecoration: 'underline', textDecorationColor: 'var(--line)' }}
          >
            {importing ? 'Importing…' : 'Import backup'}
          </button>
          <input ref={fileRef} type="file" accept=".json,application/json" style={{ display: 'none' }} onChange={handleImport} />
          <span style={{ color: 'var(--text-faint)' }}>v0.1 · web preview</span>
        </div>
      </div>
    </footer>
  );
}
