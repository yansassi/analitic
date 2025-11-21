import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.tsx'
import './index.css'

// Suprimir warnings de keys de bibliotecas externas (Recharts, etc)
if (import.meta.env.PROD) {
  const originalWarn = console.warn;
  console.warn = (...args) => {
    const msg = args[0]?.toString() || '';
    // Ignorar warnings sobre keys de componentes externos
    if (msg.includes('key') && msg.includes('prop') && msg.includes('list')) {
      return;
    }
    originalWarn(...args);
  };
}

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
)
