import React from 'react';

export default function Footer() {
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
        <div className="flex items-center" style={{ gap: 20 }}>
          <span>v0.1 · web preview</span>
          <span>iOS · coming next</span>
        </div>
      </div>
    </footer>
  );
}
