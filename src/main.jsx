// Polyfills for pdfjs-dist v5 on older mobile browsers.
// Promise.withResolvers: Safari < 17.4, Chrome < 119
if (typeof Promise.withResolvers !== 'function') {
  Promise.withResolvers = function () {
    let resolve, reject;
    const promise = new Promise((res, rej) => { resolve = res; reject = rej; });
    return { promise, resolve, reject };
  };
}
// structuredClone: Safari < 15.4
if (typeof structuredClone !== 'function') {
  window.structuredClone = (obj) => JSON.parse(JSON.stringify(obj));
}

import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App.jsx';
import './styles/global.css';

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
