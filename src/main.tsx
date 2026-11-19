import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import App from './App.tsx';
import './index.css';

function showFatalBootError(title: string, detail: string) {
  const rootEl = document.getElementById('root');
  if (!rootEl) return;
  rootEl.innerHTML = `
    <div style="min-height:100vh;background:#0b0f19;color:#f3f4f6;display:flex;flex-direction:column;align-items:center;justify-content:center;padding:24px;text-align:center;font-family:system-ui,-apple-system,sans-serif;">
      <h2 style="color:#f87171;font-size:20px;font-weight:700;margin-bottom:8px;">${title}</h2>
      <pre style="background:#111827;border:1px solid #374151;border-radius:12px;padding:14px;max-width:640px;width:100%;white-space:pre-wrap;word-break:break-word;font-size:12px;color:#d1d5db;margin-bottom:18px;">${detail}</pre>
      <button onclick="window.location.reload()" style="background:#22c55e;color:#052e16;font-weight:700;border:none;border-radius:12px;padding:12px 24px;font-size:14px;cursor:pointer;">
        Reintentar
      </button>
    </div>
  `;
}

window.addEventListener('error', (event) => {
  const msg = event.error?.stack || event.message || 'Error desconocido en ventana';
  showFatalBootError('Error de ejecución en el dispositivo', msg);
});

window.addEventListener('unhandledrejection', (event) => {
  const reason =
    event.reason instanceof Error
      ? event.reason.stack || event.reason.message
      : String(event.reason || 'Promesa rechazada sin capturar');
  showFatalBootError('Error de conexión o datos al iniciar', reason);
});

try {
  const rootElement = document.getElementById('root');
  if (!rootElement) {
    throw new Error('No se encontró el elemento #root en el DOM.');
  }

  createRoot(rootElement).render(
    <StrictMode>
      <App />
    </StrictMode>
  );
} catch (err) {
  const detail = err instanceof Error ? err.stack || err.message : String(err);
  showFatalBootError('Error al montar la aplicación', detail);
}