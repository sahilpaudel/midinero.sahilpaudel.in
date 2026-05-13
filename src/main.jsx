import React, { useState } from 'react';
import ReactDOM from 'react-dom/client';
import App from './App.jsx';
import LockScreen from './components/LockScreen.jsx';
import { isUnlocked } from './lib/vault.js';
import './styles/global.css';

function Root() {
  const [unlocked, setUnlocked] = useState(() => isUnlocked());

  if (!unlocked) {
    return <LockScreen onUnlock={() => setUnlocked(true)} />;
  }

  return <App />;
}

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <Root />
  </React.StrictMode>
);
