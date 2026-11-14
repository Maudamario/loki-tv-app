import { useState, useEffect } from 'react';
import { useAuth } from '../authContext';
import { useDpadNav } from '../useDpadNav';
import { subscribeApps } from '../dataService';
import type { AppItem } from '../types';
import { Logo } from '../components/Logo';
import { Download, Package, LogOut, AlertTriangle, Loader2, FileArchive } from 'lucide-react';

interface DashboardScreenProps {
  onLogout: () => void;
}

export function DashboardScreen({ onLogout }: DashboardScreenProps) {
  const { user } = useAuth();
  const { } = useDpadNav();
  const [apps, setApps] = useState<AppItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsub = subscribeApps((data) => {
      setApps(data);
      setLoading(false);
    });
    return () => {
      unsub();
    };
  }, []);

  return (
    <div className="min-h-screen bg-gradient-loki flex flex-col animate-fade-in">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-loki-black/90 backdrop-blur-xl border-b border-loki-border">
        <div className="max-w-[1600px] mx-auto px-6 lg:px-10 py-5 flex items-center justify-between">
          <Logo size="lg" />

          <div className="flex items-center gap-6">
            <div className="flex items-center gap-3 text-sm">
              <div className="w-2 h-2 rounded-full bg-loki-green animate-pulse" />
              <span className="text-loki-gray">Conectado:</span>
              <span className="font-semibold text-loki-white">{user?.username}</span>
            </div>

            <button
              data-focusable
              onClick={onLogout}
              className="flex items-center gap-2 px-5 py-2.5 bg-loki-card border-2 border-loki-border hover:border-loki-danger rounded-xl tv-focusable text-sm font-medium transition-colors"
            >
              <LogOut size={18} className="text-loki-danger" />
              Cerrar Sesión
            </button>
          </div>
        </div>
      </header>

      {/* Content */}
      <main className="flex-1 max-w-[1600px] mx-auto w-full px-6 lg:px-10 py-10">
        <div className="mb-10">
          <h1 className="text-4xl font-bold tracking-tight">
            Aplicaciones <span className="text-loki-green text-glow">Disponibles</span>
          </h1>
          <p className="text-loki-gray mt-2 text-lg">
            Seleccione una aplicación para descargar su APK
          </p>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-32">
            <Loader2 className="animate-spin text-loki-green" size={48} />
          </div>
        ) : apps.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-32 text-center">
            <Package size={64} className="text-loki-gray-dim mb-4" />
            <p className="text-loki-gray text-lg">No hay aplicaciones disponibles</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {apps.map((app) => (
              <AppCard key={app.id} app={app} />
            ))}
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="border-t border-loki-border py-6">
        <div className="max-w-[1600px] mx-auto px-6 lg:px-10 text-center">
          <p className="text-loki-gray-dim text-xs tracking-wide">
            LOKI TV · God of Stories · {new Date().getFullYear()}
          </p>
        </div>
      </footer>
    </div>
  );
}

function AppCard({ app }: { app: AppItem }) {
  const [imgError, setImgError] = useState(false);

  return (
    <div
      data-focusable
      className="card-sheen group bg-loki-card border-2 border-loki-border rounded-2xl overflow-hidden tv-focusable flex flex-col"
    >
      {/* Icon */}
      <div className="relative h-32 flex items-center justify-center bg-loki-dark border-b border-loki-border overflow-hidden">
        {imgError ? (
          <FileArchive size={48} className="text-loki-gray-dim" />
        ) : (
          <img
            src={app.iconUrl}
            alt={app.name}
            onError={() => setImgError(true)}
            className="w-20 h-20 object-contain transition-transform group-hover:scale-110"
            loading="lazy"
          />
        )}
        <div className="absolute top-3 right-3 bg-loki-green/10 border border-loki-green/30 text-loki-green text-xs font-mono px-2 py-1 rounded-md">
          {app.version}
        </div>
      </div>

      {/* Body */}
      <div className="p-5 flex flex-col flex-1">
        <h3 className="text-xl font-bold mb-1">{app.name}</h3>
        <p className="text-loki-gray text-sm mb-3">{app.size}</p>
        <p className="text-loki-gray-dim text-sm leading-relaxed line-clamp-2 mb-5 flex-1">
          {app.description}
        </p>

        {/* Download */}
        <a
          href={app.downloadUrl}
          download
          target="_blank"
          rel="noopener noreferrer"
          data-focusable
          className="w-full flex items-center justify-center gap-2 bg-loki-green text-loki-black font-bold py-3 rounded-xl tv-focusable hover:bg-loki-green/90 transition-colors text-base"
        >
          <Download size={18} />
          DESCARGAR APK
        </a>
      </div>
    </div>
  );
}

export function ExpiredScreen({ onBack }: { onBack: () => void }) {
  useDpadNav();

  return (
    <div className="min-h-screen bg-gradient-loki flex flex-col items-center justify-center p-8 animate-fade-in">
      {/* Warning glow */}
      <div className="pointer-events-none fixed inset-0 overflow-hidden">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-loki-danger/10 rounded-full blur-[150px]" />
      </div>

      <div className="relative z-10 max-w-lg text-center">
        <div className="flex justify-center mb-8">
          <div className="relative">
            <div className="absolute inset-0 bg-loki-danger/20 rounded-full blur-2xl animate-pulse" />
            <AlertTriangle size={80} className="text-loki-danger relative z-10 drop-shadow-[0_0_20px_rgba(239,68,68,0.6)]" />
          </div>
        </div>

        <h1 className="text-3xl lg:text-4xl font-bold text-loki-danger mb-4 tracking-tight animate-pulse">
          SUSCRIPCIÓN VENCIDA
        </h1>
        <p className="text-loki-warning text-xl font-semibold mb-2">
          ACCESO DENEGADO
        </p>
        <p className="text-loki-gray text-lg leading-relaxed mb-10">
          Su suscripción ha expirado. Contacte al soporte de LOKI TV para renovar
          su plan y recuperar el acceso completo a las aplicaciones.
        </p>

        <div className="bg-loki-card border-2 border-loki-border rounded-xl p-6 mb-8 text-left">
          <p className="text-loki-gray text-sm mb-2 tracking-wide">Contacto de soporte:</p>
          <p className="text-loki-white text-lg font-mono">support@lokitv.app</p>
        </div>

        <button
          data-focusable
          autoFocus
          onClick={onBack}
          className="px-10 py-4 bg-loki-danger text-white font-bold text-lg rounded-xl tv-focusable hover:bg-loki-danger/80 transition-colors"
        >
          Volver al Login
        </button>
      </div>
    </div>
  );
}
