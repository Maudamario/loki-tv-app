import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import App from './App.tsx';
import './index.css';

function renderFatalScreen(title: string, detail: string) {
  const rootEl = document.getElementById('root');
  if (!rootEl) return;
  rootEl.innerHTML = `
    <div style="min-height:100vh;background:#0b0f19;color:#f3f4f6;display:flex;flex-direction:column;align-items:center;justify-content:center;padding:24px;text-align:center;font-family:system-ui,-apple-system,sans-serif;">
      <h2 style="color:#f87171;font-size:20px;font-weight:700;margin-bottom:10px;">${title}</h2>
      <pre style="background:#111827;border:1px solid #374151;border-radius:12px;padding:14px;max-width:640px;width:100%;white-space:pre-wrap;word-break:break-word;font-size:12px;color:#d1d5db;margin-bottom:18px;">${detail}</pre>
      <button onclick="window.location.reload()" style="background:#22c55e;color:#052e16;font-weight:700;border:none;border-radius:12px;padding:12px 24px;font-size:14px;cursor:pointer;">
        Reintentar
      </button>
    </div>
  `;
}

window.addEventListener('error', (event) => {
  const detail = event.error?.stack || event.message || 'Error en tiempo de ejecución';
  renderFatalScreen('Error en el dispositivo', detail);
});

window.addEventListener('unhandledrejection', (event) => {
  const reason =
    event.reason instanceof Error
      ? event.reason.stack || event.reason.message
      : String(event.reason || 'Promesa rechazada');
  renderFatalScreen('Error de carga o datos', reason);
});

const rootElement = document.getElementById('root');

if (!rootElement) {
  renderFatalScreen('Error de estructura', 'No se encontró el contenedor #root.');
} else {
  try {
    createRoot(rootElement).render(
      <StrictMode>
        <App />
      </StrictMode>
    );
  } catch (err) {
    const detail = err instanceof Error ? err.stack || err.message : String(err);
    renderFatalScreen('Error al montar LOKI TV', detail);
  }
}