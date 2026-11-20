function flattenArray(arr: unknown[], currentDepth: number): unknown[] {
  return arr.reduce<unknown[]>((acc, val) => {
    if (Array.isArray(val) && currentDepth > 0) {
      return acc.concat(flattenArray(val, currentDepth - 1));
    }
    acc.push(val);
    return acc;
  }, []);
}

const arrayProto = Array.prototype as unknown as {
  flat?: (depth?: number) => unknown[];
};

if (typeof arrayProto.flat !== 'function') {
  arrayProto.flat = function (this: unknown, depth = 1): unknown[] {
    const d = Number(depth);
    const safeDepth = Number.isFinite(d) && d > 0 ? Math.floor(d) : 0;
    const baseList = Array.isArray(this) ? this : Array.from(this as ArrayLike<unknown>);
    return flattenArray(baseList, safeDepth);
  };
}

const objectStatic = Object as unknown as {
  fromEntries?: (entries: Iterable<readonly [PropertyKey, unknown]>) => Record<string, unknown>;
};

if (typeof objectStatic.fromEntries !== 'function') {
  objectStatic.fromEntries = function (
    entries: Iterable<readonly [PropertyKey, unknown]>
  ): Record<string, unknown> {
    const obj: Record<string, unknown> = {};
    for (const [k, v] of entries) {
      obj[String(k)] = v;
    }
    return obj;
  };
}

function escapeHtml(text: string): string {
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

function renderFatalScreen(title: string, detail: string) {
  const rootEl = document.getElementById('root');
  if (!rootEl) return;
  const safeTitle = escapeHtml(title);
  const safeDetail = escapeHtml(detail);
  rootEl.innerHTML = `
    <div style="min-height:100vh;background:#0b0f19;color:#f3f4f6;display:flex;flex-direction:column;align-items:center;justify-content:center;padding:24px;text-align:center;font-family:system-ui,-apple-system,sans-serif;">
      <h2 style="color:#f87171;font-size:20px;font-weight:700;margin-bottom:10px;">${safeTitle}</h2>
      <pre style="background:#111827;border:1px solid #374151;border-radius:12px;padding:14px;max-width:640px;width:100%;white-space:pre-wrap;word-break:break-word;font-size:12px;color:#d1d5db;margin-bottom:18px;">${safeDetail}</pre>
      <button onclick="window.location.reload()" style="background:#22c55e;color:#052e16;font-weight:700;border:none;border-radius:12px;padding:12px 24px;font-size:14px;cursor:pointer;">
        Reintentar
      </button>
    </div>
  `;
}

function extractErrorDetail(err: unknown): string {
  if (err && typeof err === 'object') {
    const e = err as { stack?: string; message?: string };
    if (e.stack) return String(e.stack);
    if (e.message) return String(e.message);
  }
  return String(err || 'Error desconocido');
}

renderFatalScreen('Cargando LOKI TV...', 'Inicializando motor en el dispositivo...');

window.addEventListener('error', (event) => {
  const stackOrMsg =
    (event.error && event.error.stack) || event.message || 'Error en tiempo de ejecución';
  renderFatalScreen('Error en el dispositivo', String(stackOrMsg));
});

window.addEventListener('unhandledrejection', (event) => {
  renderFatalScreen('Error de carga o datos', extractErrorDetail(event.reason));
});

const rootElement = document.getElementById('root');

if (!rootElement) {
  renderFatalScreen('Error de estructura', 'No se encontró el contenedor #root.');
} else {
  import('./index.css')
    .then(() => Promise.all([import('./App.tsx'), import('react'), import('react-dom/client')]))
    .then(([appMod, reactMod, reactDomMod]) => {
      const App = appMod.default;
      const { StrictMode } = reactMod;
      const { createRoot } = reactDomMod;
      createRoot(rootElement).render(
        <StrictMode>
          <App />
        </StrictMode>
      );
    })
    .catch((err) => {
      renderFatalScreen('Error al montar LOKI TV', extractErrorDetail(err));
    });
}