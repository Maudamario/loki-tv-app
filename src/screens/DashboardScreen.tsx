import { useState, useEffect, useMemo, useRef } from 'react';
import { useAuth } from '../authContext';
import { subscribeAllowedApps, subscribeApps } from '../dataService';
import type { AppItem } from '../types';
import { Logo } from '../components/Logo';
import {
  Download,
  Package,
  LogOut,
  AlertTriangle,
  Loader2,
  FileArchive,
  CheckCircle2,
  ExternalLink,
} from 'lucide-react';

interface DashboardScreenProps {
  onLogout: () => void;
}

export function DashboardScreen({ onLogout }: DashboardScreenProps) {
  const { user } = useAuth();
  const [apps, setApps] = useState<AppItem[]>([]);
  const [allowedApps, setAllowedApps] = useState<string[] | null>(null);
  const [appsLoading, setAppsLoading] = useState(true);

  useEffect(() => {
    const unsub = subscribeApps((data) => {
      setApps(data);
      setAppsLoading(false);
    });
    return () => {
      if (typeof unsub === 'function') unsub();
    };
  }, []);

  useEffect(() => {
    if (!user?.id) {
      setAllowedApps([]);
      return;
    }
    const unsub = subscribeAllowedApps(user.id, setAllowedApps);
    return () => {
      if (typeof unsub === 'function') unsub();
    };
  }, [user?.id]);

  const visibleApps = useMemo(() => {
    if (!allowedApps || allowedApps.length === 0) return [];
    const allowed = new Set(allowedApps);
    return apps.filter((app) => allowed.has(app.id));
  }, [apps, allowedApps]);

  const loading = appsLoading || allowedApps === null;

  return (
    <div className="min-h-screen bg-gradient-loki flex flex-col animate-fade-in">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-loki-black/95 backdrop-blur-xl border-b border-loki-border">
        <div className="max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-10 py-3 sm:py-4 flex flex-wrap items-center justify-between gap-3">
          <Logo size="md" />

          <div className="flex items-center gap-3 sm:gap-6">
            <div className="flex items-center gap-2 text-xs sm:text-sm">
              <div className="w-2 h-2 rounded-full bg-loki-green animate-pulse shrink-0" />
              <span className="text-loki-gray hidden xs:inline">Conectado:</span>
              <span className="font-semibold text-loki-white truncate max-w-[120px] sm:max-w-none">
                {user?.username}
              </span>
            </div>

            <button
              type="button"
              onClick={onLogout}
              className="flex items-center gap-2 px-3.5 sm:px-5 py-2 bg-loki-card border border-loki-border hover:border-loki-danger rounded-xl text-xs sm:text-sm font-medium transition-colors"
            >
              <LogOut size={16} className="text-loki-danger shrink-0" />
              <span>Cerrar Sesión</span>
            </button>
          </div>
        </div>
      </header>

      {/* Content */}
      <main className="flex-1 max-w-[1600px] mx-auto w-full px-4 sm:px-6 lg:px-10 py-6 sm:py-8">
        <div className="mb-6 sm:mb-8">
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">
            Aplicaciones <span className="text-loki-green text-glow">Disponibles</span>
          </h1>
          <p className="text-loki-gray mt-1 text-sm sm:text-base">
            Seleccione una aplicación para descargar su APK
          </p>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-24">
            <Loader2 className="animate-spin text-loki-green" size={42} />
          </div>
        ) : visibleApps.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-24 text-center">
            <Package size={56} className="text-loki-gray-dim mb-4" />
            <p className="text-loki-gray text-base sm:text-lg">
              No hay aplicaciones asignadas a tu cuenta
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6">
            {visibleApps.map((app) => (
              <AppCard key={app.id} app={app} />
            ))}
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="border-t border-loki-border py-4 sm:py-5 bg-loki-black/60">
        <div className="max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-10 text-center">
          <p className="text-loki-gray-dim text-xs tracking-wide">
            LOKI TV · SOSTENIENDO HISTORIAS · {new Date().getFullYear()}
          </p>
        </div>
      </footer>
    </div>
  );
}

function triggerDirectLink(url: string) {
  try {
    const anchor = document.createElement('a');
    anchor.href = url;
    anchor.rel = 'noopener noreferrer';
    anchor.style.display = 'none';
    document.body.appendChild(anchor);
    anchor.click();
    document.body.removeChild(anchor);
  } catch {
    window.location.assign(url);
  }
}

function AppCard({ app }: { app: AppItem }) {
  const [imgError, setImgError] = useState(false);
  const [downloading, setDownloading] = useState(false);
  const [progress, setProgress] = useState<number>(0);
  const [statusText, setStatusText] = useState<string>('');
  const intervalRef = useRef<number | null>(null);
  const resetTimerRef = useRef<number | null>(null);

  useEffect(() => {
    return () => {
      if (intervalRef.current) window.clearInterval(intervalRef.current);
      if (resetTimerRef.current) window.clearTimeout(resetTimerRef.current);
    };
  }, []);

  const handleStartDownload = () => {
    if (!app.downloadUrl || downloading) return;
    if (intervalRef.current) window.clearInterval(intervalRef.current);
    if (resetTimerRef.current) window.clearTimeout(resetTimerRef.current);

    setDownloading(true);
    setProgress(25);
    setStatusText('Solicitando descarga del APK...');

    let stepPct = 25;
    intervalRef.current = window.setInterval(() => {
      stepPct += 25;
      if (stepPct >= 100) {
        if (intervalRef.current) {
          window.clearInterval(intervalRef.current);
          intervalRef.current = null;
        }
        setProgress(100);
        setStatusText('Enlace enviado al dispositivo (verifique descargas)');
      } else {
        setProgress(stepPct);
        setStatusText(`Abriendo enlace de descarga... ${stepPct}%`);
      }
    }, 180);

    triggerDirectLink(app.downloadUrl);

    resetTimerRef.current = window.setTimeout(() => {
      setDownloading(false);
      setProgress(0);
      setStatusText('');
    }, 3200);
  };

  return (
    <div className="card-sheen group bg-loki-card border-2 border-loki-border rounded-2xl overflow-hidden flex flex-col">
      {/* Icon */}
      <div className="relative h-28 sm:h-32 flex items-center justify-center bg-loki-dark border-b border-loki-border overflow-hidden">
        {imgError ? (
          <FileArchive size={44} className="text-loki-gray-dim" />
        ) : (
          <img
            src={app.iconUrl}
            alt={app.name}
            onError={() => setImgError(true)}
            className="w-16 h-16 sm:w-20 sm:h-20 object-contain transition-transform group-hover:scale-110"
            loading="lazy"
          />
        )}
        <div className="absolute top-3 right-3 bg-loki-green/10 border border-loki-green/30 text-loki-green text-xs font-mono px-2 py-1 rounded-md">
          {app.version}
        </div>
      </div>

      {/* Body */}
      <div className="p-4 sm:p-5 flex flex-col flex-1">
        <h3 className="text-lg sm:text-xl font-bold mb-1">{app.name}</h3>
        <p className="text-loki-gray text-xs sm:text-sm mb-2">{app.size}</p>
        <p className="text-loki-gray-dim text-xs sm:text-sm leading-relaxed mb-4 flex-1">
          {app.description}
        </p>

        {/* Progress Bar */}
        {(downloading || progress > 0) && (
          <div className="mb-3 space-y-1.5">
            <div className="flex items-center justify-between text-xs text-loki-gray">
              <span className="flex items-center gap-1.5 truncate">
                {progress >= 100 ? (
                  <CheckCircle2 size={14} className="text-loki-green shrink-0" />
                ) : (
                  <Loader2 size={14} className="animate-spin text-loki-green shrink-0" />
                )}
                <span className="truncate">{statusText}</span>
              </span>
              <span className="font-mono text-loki-green ml-2">{progress}%</span>
            </div>
            <div className="w-full h-2.5 bg-loki-dark rounded-full overflow-hidden border border-loki-border">
              <div
                className="h-full bg-loki-green transition-all duration-200"
                style={{ width: `${progress}%` }}
              />
            </div>
          </div>
        )}

        {/* Download Button */}
        <button
          type="button"
          disabled={downloading || !app.downloadUrl}
          onClick={handleStartDownload}
          className="w-full flex items-center justify-center gap-2 bg-loki-green text-loki-black font-bold py-2.5 sm:py-3 rounded-xl hover:bg-loki-green/90 disabled:opacity-60 transition-colors text-sm sm:text-base focus:outline-none focus:ring-4 focus:ring-green-500"
        >
          {downloading ? (
            <>
              <Loader2 size={18} className="animate-spin" />
              DESCARGANDO...
            </>
          ) : (
            <>
              <Download size={18} />
              DESCARGAR APK
            </>
          )}
        </button>

        {app.downloadUrl && (
          <a
            href={app.downloadUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="mt-2 inline-flex items-center justify-center gap-1 text-[11px] text-loki-gray hover:text-loki-green transition-colors"
          >
            <span>Abrir enlace directo</span>
            <ExternalLink size={12} />
          </a>
        )}
      </div>
    </div>
  );
}

export function ExpiredScreen({ onBack }: { onBack: () => void }) {
  return (
    <div className="min-h-screen bg-gradient-loki flex flex-col items-center justify-center p-6 sm:p-8 animate-fade-in">
      <div className="pointer-events-none fixed inset-0 overflow-hidden">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-loki-danger/10 rounded-full blur-[150px]" />
      </div>

      <div className="relative z-10 max-w-lg text-center">
        <div className="flex justify-center mb-6 sm:mb-8">
          <div className="relative">
            <div className="absolute inset-0 bg-loki-danger/20 rounded-full blur-2xl animate-pulse" />
            <AlertTriangle
              size={72}
              className="text-loki-danger relative z-10 drop-shadow-[0_0_20px_rgba(239,68,68,0.6)]"
            />
          </div>
        </div>

        <h1 className="text-2xl sm:text-4xl font-bold text-loki-danger mb-3 tracking-tight animate-pulse">
          SUSCRIPCIÓN VENCIDA
        </h1>
        <p className="text-loki-warning text-lg sm:text-xl font-semibold mb-2">
          ACCESO DENEGADO
        </p>
        <p className="text-loki-gray text-sm sm:text-lg leading-relaxed mb-8">
          Su suscripción ha expirado. Contacte al soporte de LOKI TV para renovar
          su plan y recuperar el acceso completo a las aplicaciones.
        </p>

        <div className="bg-loki-card border-2 border-loki-border rounded-xl p-4 sm:p-6 mb-8 text-left">
          <p className="text-loki-gray text-xs sm:text-sm mb-1.5 tracking-wide">
            Contacto de soporte:
          </p>
          <p className="text-loki-white text-sm sm:text-lg font-mono break-all">
            lokilaufeyson.avt@gmail.com
          </p>
        </div>

        <button
          type="button"
          onClick={onBack}
          className="px-8 sm:px-10 py-3.5 sm:py-4 bg-loki-danger text-white font-bold text-base sm:text-lg rounded-xl hover:bg-loki-danger/80 transition-colors"
        >
          Volver al Login
        </button>
      </div>
    </div>
  );
}