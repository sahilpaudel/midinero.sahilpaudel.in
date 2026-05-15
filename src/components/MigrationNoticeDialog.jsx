import React, { useState } from 'react';
import { Icon } from '../icons/Icon.jsx';
import { exportAllData } from '../lib/storage.js';

export default function MigrationNoticeDialog({ onClose }) {
  const [busy, setBusy] = useState(false);

  const handleDownload = async () => {
    setBusy(true);
    try { await exportAllData(); } finally { setBusy(false); }
  };

  return (
    <div
      style={{
        position: 'fixed', inset: 0, zIndex: 1000,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        padding: '20px 16px',
        background: 'rgba(0,0,0,0.6)',
        backdropFilter: 'blur(4px)',
      }}
    >
      <div style={{
        background: 'var(--ink-soft)',
        border: '1px solid var(--line)',
        borderRadius: 18,
        width: '100%', maxWidth: 440,
        boxShadow: 'var(--shadow-modal)',
        overflow: 'hidden',
      }}>
        {/* Accent strip */}
        <div style={{
          height: 4,
          background: 'linear-gradient(90deg, var(--accent, #f59e0b), var(--accent2, #ef4444))',
        }} />

        <div style={{ padding: '28px 28px 24px' }}>
          {/* Icon + title */}
          <div style={{ display: 'flex', alignItems: 'flex-start', gap: 14, marginBottom: 16 }}>
            <div style={{
              width: 40, height: 40, borderRadius: 10, flexShrink: 0,
              background: 'var(--surface)', border: '1px solid var(--line)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              color: 'var(--text-dim)',
            }}>
              <Icon name="repeat" size={18} stroke={1.5} />
            </div>
            <div>
              <div style={{ fontSize: 16, fontWeight: 700, lineHeight: 1.3 }}>
                We're moving to cofr.in
              </div>
              <div style={{ fontSize: 12, color: 'var(--text-faint)', marginTop: 3 }}>
                Important notice about your data
              </div>
            </div>
          </div>

          {/* Body */}
          <div style={{
            fontSize: 13, color: 'var(--text-dim)', lineHeight: 1.7,
            background: 'var(--surface)', border: '1px solid var(--line)',
            borderRadius: 10, padding: '14px 16px', marginBottom: 20,
          }}>
            <p style={{ margin: '0 0 10px' }}>
              Coffer is moving to a new home at{' '}
              <strong style={{ color: 'var(--text)' }}>cofr.in</strong>.
              This site will be <strong style={{ color: 'var(--text)' }}>retired soon</strong> and your
              data stored here will not carry over automatically.
            </p>
            <p style={{ margin: 0 }}>
              Please <strong style={{ color: 'var(--text)' }}>download your backup</strong> now and
              import it at <strong style={{ color: 'var(--text)' }}>cofr.in</strong> to keep all
              your accounts and history.
            </p>
          </div>

          {/* Actions */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            <button
              className="btn-primary"
              disabled={busy}
              onClick={handleDownload}
              style={{
                fontSize: 13, padding: '11px 16px', borderRadius: 10,
                width: '100%', justifyContent: 'center', gap: 8,
              }}
            >
              {busy
                ? 'Downloading…'
                : <><Icon name="download" size={14} stroke={1.5} /> Download my data</>
              }
            </button>

            <button
              onClick={onClose}
              style={{
                fontSize: 12, padding: '9px 16px', borderRadius: 10,
                border: '1px solid var(--line)', background: 'transparent',
                color: 'var(--text-faint)', cursor: 'pointer', width: '100%',
              }}
            >
              I understand, don't show again
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
