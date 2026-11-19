import { useState, useEffect, useRef, type ReactNode, type FormEvent } from 'react';
import {
  subscribeUsers,
  subscribeApps,
  addUser,
  updateUser,
  deleteUser,
  setAllUsersActive,
  addApp,
  updateApp,
  deleteApp,
} from '../dataService';
import { ADMIN_PASSWORD } from '../firebase';
import type { AppUser, AppItem } from '../types';
import { Logo } from '../components/Logo';
import {
  Lock,
  ArrowLeft,
  Users,
  Package,
  Plus,
  Trash2,
  Pencil,
  Check,
  X,
  ToggleLeft,
  ToggleRight,
  Calendar,
  Download,
  Tag,
  Link2,
  Image as ImageIcon,
  FileArchive,
  AlertCircle,
  Loader2,
  Tv,
  Clock,
} from 'lucide-react';

interface AdminPanelProps {
  onExit: () => void;
}

type Tab = 'users' | 'apps';

export function AdminPanel({ onExit }: AdminPanelProps) {
  const [authed, setAuthed] = useState(false);
  const [password, setPassword] = useState('');
  const [authError, setAuthError] = useState('');
  const [tab, setTab] = useState<Tab>('users');
  const passwordRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (authed) return;
    passwordRef.current?.focus();
  }, [authed]);

  const handleAuth = (e: FormEvent) => {
    e.preventDefault();
    if (password === ADMIN_PASSWORD) {
      setAuthed(true);
      setAuthError('');
    } else {
      setAuthError('Contraseña maestra incorrecta');
    }
  };

  if (!authed) {
    return (
      <div className="min-h-screen bg-gradient-loki flex flex-col items-center justify-center p-6 sm:p-8 animate-fade-in">
        <div className="pointer-events-none fixed inset-0 overflow-hidden">
          <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-loki-green/5 rounded-full blur-[120px]" />
        </div>
        <div className="relative z-10 w-full max-w-md">
          <div className="flex justify-center mb-8 sm:mb-10">
            <Logo size="lg" />
          </div>

          <div className="bg-loki-card border border-loki-border rounded-2xl p-6 sm:p-8 shadow-2xl">
            <div className="flex items-center gap-3 mb-6">
              <Lock className="text-loki-green" size={24} />
              <h2 className="text-xl font-semibold">Panel de Administración</h2>
            </div>

            {authError && (
              <div className="mb-4 flex items-center gap-2 bg-loki-danger/10 border border-loki-danger/30 rounded-lg p-3">
                <AlertCircle className="text-loki-danger shrink-0" size={18} />
                <span className="text-loki-danger text-sm">{authError}</span>
              </div>
            )}

            <form onSubmit={handleAuth} className="space-y-4">
              <div>
                <label className="block text-sm text-loki-gray mb-2">Contraseña Maestra</label>
                <input
                  ref={passwordRef}
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  autoFocus
                  className="w-full bg-loki-dark border-2 border-loki-border rounded-xl px-4 py-3 text-base sm:text-lg focus:outline-none focus:border-loki-green"
                />
              </div>
              <button
                type="submit"
                className="w-full bg-loki-green text-loki-black font-bold py-3.5 rounded-xl hover:bg-loki-green/90 transition-colors"
              >
                ACCEDER
              </button>
              <button
                type="button"
                onClick={onExit}
                className="w-full text-loki-gray hover:text-loki-white text-sm py-2 transition-colors"
              >
                ← Volver
              </button>
            </form>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-loki flex flex-col animate-fade-in">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-loki-black/95 backdrop-blur-xl border-b border-loki-border">
        <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-10 py-3.5 sm:py-4 flex items-center justify-between gap-3">
          <div className="flex items-center gap-4 sm:gap-6">
            <Logo size="md" />
            <span className="hidden sm:inline text-loki-gray-dim text-sm border-l border-loki-border pl-6">
              Panel Admin
            </span>
          </div>
          <button
            type="button"
            onClick={onExit}
            className="flex items-center gap-2 px-3.5 sm:px-4 py-2 bg-loki-card border border-loki-border hover:border-loki-green rounded-lg text-xs sm:text-sm transition-colors"
          >
            <ArrowLeft size={16} />
            Salir
          </button>
        </div>
      </header>

      {/* Tabs */}
      <div className="sticky top-[65px] sm:top-[73px] z-40 bg-loki-black/90 backdrop-blur-xl border-b border-loki-border">
        <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-10 flex gap-2 overflow-x-auto">
          <TabButton active={tab === 'users'} onClick={() => setTab('users')} icon={<Users size={18} />}>
            Gestión de Usuarios
          </TabButton>
          <TabButton active={tab === 'apps'} onClick={() => setTab('apps')} icon={<Package size={18} />}>
            Gestión de APKs
          </TabButton>
        </div>
      </div>

      {/* Content */}
      <main className="flex-1 max-w-[1400px] mx-auto w-full px-4 sm:px-6 lg:px-10 py-6 sm:py-8">
        {tab === 'users' ? <UsersManager /> : <AppsManager />}
      </main>
    </div>
  );
}

function TabButton({
  active,
  onClick,
  icon,
  children,
}: {
  active: boolean;
  onClick: () => void;
  icon: ReactNode;
  children: ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`flex items-center gap-2 px-4 sm:px-6 py-3.5 sm:py-4 text-xs sm:text-sm font-medium border-b-2 whitespace-nowrap transition-colors ${
        active
          ? 'border-loki-green text-loki-green'
          : 'border-transparent text-loki-gray hover:text-loki-white'
      }`}
    >
      {icon}
      {children}
    </button>
  );
}

// ==================== USERS MANAGER ====================

const emptyUserForm = {
  username: '',
  password: '',
  startDate: '',
  expirationDate: '',
  maxDevices: 1,
  allowedApps: [] as string[],
};

function formatTenure(startDate?: string): string {
  if (!startDate) return '';
  const start = new Date(`${startDate}T00:00:00`);
  if (Number.isNaN(start.getTime())) return `Inicio: ${startDate}`;

  const now = new Date();
  const totalMonths = Math.max(
    0,
    (now.getFullYear() - start.getFullYear()) * 12 + (now.getMonth() - start.getMonth())
  );

  if (totalMonths < 1) {
    return `Inicio: ${startDate} (Menos de 1 mes)`;
  }
  if (totalMonths < 12) {
    return `Inicio: ${startDate} (${totalMonths} ${totalMonths === 1 ? 'mes' : 'meses'})`;
  }
  const years = Math.floor(totalMonths / 12);
  const months = totalMonths % 12;
  return `Inicio: ${startDate} (${years} ${years === 1 ? 'año' : 'años'}${
    months > 0 ? ` ${months}m` : ''
  })`;
}

function UsersManager() {
  const [users, setUsers] = useState<AppUser[]>([]);
  const [apps, setApps] = useState<AppItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState(emptyUserForm);
  const [saving, setSaving] = useState(false);
  const [bulkSaving, setBulkSaving] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editPassword, setEditPassword] = useState('');
  const [editingDevicesId, setEditingDevicesId] = useState<string | null>(null);
  const [editMaxDevices, setEditMaxDevices] = useState<number>(1);
  const [searchTerm, setSearchTerm] = useState('');
  const [appsUserId, setAppsUserId] = useState<string | null>(null);
  const [draftApps, setDraftApps] = useState<string[]>([]);
  const [appsError, setAppsError] = useState('');

  useEffect(() => {
    const unsub = subscribeUsers((data) => {
      setUsers(data);
      setLoading(false);
    });
    return () => {
      unsub();
    };
  }, []);

  useEffect(() => {
    const unsub = subscribeApps(setApps);
    return () => {
      unsub();
    };
  }, []);

  const toggleFormApp = (appId: string) => {
    setForm((prev) => ({
      ...prev,
      allowedApps: prev.allowedApps.includes(appId)
        ? prev.allowedApps.filter((id) => id !== appId)
        : [...prev.allowedApps, appId],
    }));
  };

  const handleCreate = async (e: FormEvent) => {
    e.preventDefault();
    if (!form.username.trim() || !form.password.trim()) return;
    setSaving(true);
    try {
      const today = new Date().toISOString().slice(0, 10);
      await addUser({
        username: form.username.trim(),
        password: form.password.trim(),
        isActive: true,
        startDate: form.startDate || today,
        expirationDate: form.expirationDate || undefined,
        maxDevices: Math.max(1, Number(form.maxDevices) || 1),
        allowedApps: form.allowedApps,
      });
      setForm(emptyUserForm);
    } finally {
      setSaving(false);
    }
  };

  const handleBulkToggle = async (activate: boolean) => {
    if (users.length === 0 || bulkSaving) return;
    const mensaje = activate
      ? '¿Querés HABILITAR todos los usuarios de una vez?'
      : '¿Querés DESHABILITAR todos los usuarios de una vez? Nadie podrá usar la app hasta reactivarlos.';
    if (!confirm(mensaje)) return;

    setBulkSaving(true);
    try {
      await setAllUsersActive(activate);
    } finally {
      setBulkSaving(false);
    }
  };

  const openApps = (user: AppUser) => {
    setAppsUserId(user.id);
    setDraftApps(user.allowedApps ?? []);
    setAppsError('');
  };

  const closeApps = () => {
    setAppsUserId(null);
    setAppsError('');
  };

  const toggleAssignedApp = async (appId: string) => {
    if (!appsUserId) return;
    const prev = draftApps;
    const next = prev.includes(appId) ? prev.filter((id) => id !== appId) : [...prev, appId];
    setDraftApps(next);
    setAppsError('');
    try {
      await updateUser(appsUserId, { allowedApps: next });
    } catch {
      setDraftApps(prev);
      setAppsError('No se pudo guardar. Intente de nuevo.');
    }
  };

  const handleToggle = async (user: AppUser) => {
    await updateUser(user.id, { isActive: !user.isActive });
  };

  const handleDelete = async (user: AppUser) => {
    if (!confirm(`¿Eliminar al usuario "${user.username}"?`)) return;
    await deleteUser(user.id);
  };

  const handleSavePassword = async (user: AppUser) => {
    if (!editPassword.trim()) return;
    await updateUser(user.id, { password: editPassword.trim() });
    setEditingId(null);
    setEditPassword('');
  };

  const handleSaveMaxDevices = async (user: AppUser) => {
    const safeLimit = Math.max(1, Number(editMaxDevices) || 1);
    const currentSessions = Array.isArray(user.activeSessions) ? user.activeSessions : [];
    const trimmedSessions = currentSessions.slice(-safeLimit);
    await updateUser(user.id, {
      maxDevices: safeLimit,
      activeSessions: trimmedSessions,
    });
    setEditingDevicesId(null);
  };

  const filtered = users.filter((u) =>
    u.username.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="grid lg:grid-cols-[390px_1fr] gap-6 lg:gap-8">
      {/* Create form */}
      <div className="space-y-6">
        <div className="bg-loki-card border border-loki-border rounded-2xl p-5 sm:p-6">
          <h3 className="flex items-center gap-2 text-lg font-semibold mb-5">
            <Plus className="text-loki-green" size={20} />
            Nuevo Usuario
          </h3>
          <form onSubmit={handleCreate} className="space-y-4">
            <FormField label="Usuario">
              <input
                type="text"
                value={form.username}
                onChange={(e) => setForm({ ...form, username: e.target.value })}
                className="w-full bg-loki-dark border border-loki-border rounded-xl px-3.5 py-2.5 text-sm focus:outline-none focus:border-loki-green"
                placeholder="nombre_usuario"
              />
            </FormField>
            <FormField label="Contraseña">
              <input
                type="text"
                value={form.password}
                onChange={(e) => setForm({ ...form, password: e.target.value })}
                className="w-full bg-loki-dark border border-loki-border rounded-xl px-3.5 py-2.5 text-sm focus:outline-none focus:border-loki-green"
                placeholder="contraseña"
              />
            </FormField>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <FormField label="Inicio de actividades">
                <div className="relative">
                  <Calendar
                    className="absolute left-3 top-1/2 -translate-y-1/2 text-loki-gray-dim pointer-events-none"
                    size={15}
                  />
                  <input
                    type="date"
                    value={form.startDate}
                    onChange={(e) => setForm({ ...form, startDate: e.target.value })}
                    className="w-full bg-loki-dark border border-loki-border rounded-xl pl-9 pr-3 py-2.5 text-xs sm:text-sm focus:outline-none focus:border-loki-green"
                  />
                </div>
              </FormField>
              <FormField label="Expiración (opcional)">
                <div className="relative">
                  <Calendar
                    className="absolute left-3 top-1/2 -translate-y-1/2 text-loki-gray-dim pointer-events-none"
                    size={15}
                  />
                  <input
                    type="date"
                    value={form.expirationDate}
                    onChange={(e) => setForm({ ...form, expirationDate: e.target.value })}
                    className="w-full bg-loki-dark border border-loki-border rounded-xl pl-9 pr-3 py-2.5 text-xs sm:text-sm focus:outline-none focus:border-loki-green"
                  />
                </div>
              </FormField>
            </div>
            <FormField label="Dispositivos permitidos">
              <div className="relative">
                <Tv
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-loki-gray-dim pointer-events-none"
                  size={16}
                />
                <input
                  type="number"
                  min={1}
                  max={20}
                  value={form.maxDevices}
                  onChange={(e) => setForm({ ...form, maxDevices: Number(e.target.value) })}
                  className="w-full bg-loki-dark border border-loki-border rounded-xl pl-10 pr-3 py-2.5 text-sm focus:outline-none focus:border-loki-green"
                />
              </div>
            </FormField>
            <FormField label="APKs asignadas">
              <AppCheckList apps={apps} selected={form.allowedApps} onToggle={toggleFormApp} />
            </FormField>
            <button
              type="submit"
              disabled={saving}
              className="w-full bg-loki-green text-loki-black font-bold py-3 rounded-xl hover:bg-loki-green/90 disabled:opacity-50 transition-colors flex items-center justify-center gap-2"
            >
              {saving ? <Loader2 size={18} className="animate-spin" /> : <Plus size={18} />}
              Crear Usuario
            </button>
          </form>
        </div>
      </div>

      {/* Users list */}
      <div className="bg-loki-card border border-loki-border rounded-2xl p-5 sm:p-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-5">
          <h3 className="text-lg font-semibold">Usuarios ({filtered.length})</h3>

          <div className="flex flex-wrap items-center gap-2">
            <button
              type="button"
              disabled={bulkSaving || users.length === 0}
              onClick={() => handleBulkToggle(true)}
              className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-loki-green/15 text-loki-green border border-loki-green/40 hover:bg-loki-green/25 disabled:opacity-40 transition-colors"
            >
              Habilitar todos
            </button>
            <button
              type="button"
              disabled={bulkSaving || users.length === 0}
              onClick={() => handleBulkToggle(false)}
              className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-loki-danger/15 text-loki-danger border border-loki-danger/40 hover:bg-loki-danger/25 disabled:opacity-40 transition-colors"
            >
              Deshabilitar todos
            </button>
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Buscar..."
              className="bg-loki-dark border border-loki-border rounded-lg px-3 py-1.5 text-sm w-36 sm:w-44 focus:outline-none focus:border-loki-green"
            />
          </div>
        </div>

        {loading ? (
          <div className="flex justify-center py-20">
            <Loader2 className="animate-spin text-loki-green" size={32} />
          </div>
        ) : filtered.length === 0 ? (
          <p className="text-center text-loki-gray py-20">No hay usuarios</p>
        ) : (
          <div className="space-y-3">
            {filtered.map((user) => {
              const limit = user.maxDevices ?? 1;
              const activeCount = Array.isArray(user.activeSessions) ? user.activeSessions.length : 0;
              const tenureText = formatTenure(user.startDate);

              return (
                <div
                  key={user.id}
                  className="bg-loki-dark border border-loki-border rounded-xl p-4 flex flex-wrap items-center gap-4 hover:border-loki-border/80 transition-colors"
                >
                  {/* Info */}
                  <div className="flex-1 min-w-[180px]">
                    <p className="font-semibold text-loki-white">{user.username}</p>
                    <div className="flex flex-wrap items-center gap-x-3 gap-y-1 mt-1 text-xs text-loki-gray-dim">
                      {tenureText && (
                        <span className="flex items-center gap-1 text-loki-gray">
                          <Clock size={12} className="text-loki-green/80" />
                          {tenureText}
                        </span>
                      )}
                      {user.expirationDate && (
                        <span className="flex items-center gap-1">
                          <Calendar size={12} />
                          Expira: {user.expirationDate}
                        </span>
                      )}
                      <span className="flex items-center gap-1 text-loki-green/80">
                        <Tv size={12} />
                        {activeCount}/{limit} TVs activas
                      </span>
                    </div>
                  </div>

                  {/* Toggle individual */}
                  <button
                    type="button"
                    onClick={() => handleToggle(user)}
                    className="flex items-center gap-2"
                  >
                    {user.isActive ? (
                      <ToggleRight className="text-loki-green" size={32} />
                    ) : (
                      <ToggleLeft className="text-loki-gray-dim" size={32} />
                    )}
                    <span
                      className={`text-xs font-medium ${
                        user.isActive ? 'text-loki-green' : 'text-loki-gray-dim'
                      }`}
                    >
                      {user.isActive ? 'Activo' : 'Inactivo'}
                    </span>
                  </button>

                  {/* Edit maxDevices */}
                  {editingDevicesId === user.id ? (
                    <div className="flex items-center gap-1.5">
                      <input
                        type="number"
                        min={1}
                        max={20}
                        value={editMaxDevices}
                        onChange={(e) => setEditMaxDevices(Number(e.target.value))}
                        autoFocus
                        className="bg-loki-black border border-loki-green rounded-lg px-2 py-1 text-sm w-16 focus:outline-none"
                      />
                      <button
                        type="button"
                        onClick={() => handleSaveMaxDevices(user)}
                        className="text-loki-green hover:scale-110 transition-transform"
                      >
                        <Check size={18} />
                      </button>
                      <button
                        type="button"
                        onClick={() => setEditingDevicesId(null)}
                        className="text-loki-danger hover:scale-110 transition-transform"
                      >
                        <X size={18} />
                      </button>
                    </div>
                  ) : (
                    <button
                      type="button"
                      onClick={() => {
                        setEditingDevicesId(user.id);
                        setEditMaxDevices(limit);
                      }}
                      className="flex items-center gap-1 text-loki-gray hover:text-loki-green text-sm transition-colors"
                      title="Cambiar límite de TVs permitidas"
                    >
                      <Tv size={16} />
                      {limit} {limit === 1 ? 'TV' : 'TVs'}
                    </button>
                  )}

                  <button
                    type="button"
                    onClick={() => openApps(user)}
                    className="flex items-center gap-1 text-loki-gray hover:text-loki-green text-sm transition-colors"
                  >
                    <Package size={16} />
                    Apps
                  </button>

                  {/* Edit password */}
                  {editingId === user.id ? (
                    <div className="flex items-center gap-2">
                      <input
                        type="text"
                        value={editPassword}
                        onChange={(e) => setEditPassword(e.target.value)}
                        placeholder="Nueva clave"
                        autoFocus
                        className="bg-loki-black border border-loki-green rounded-lg px-3 py-1.5 text-sm w-28 focus:outline-none"
                      />
                      <button
                        type="button"
                        onClick={() => handleSavePassword(user)}
                        className="text-loki-green hover:scale-110 transition-transform"
                      >
                        <Check size={20} />
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          setEditingId(null);
                          setEditPassword('');
                        }}
                        className="text-loki-danger hover:scale-110 transition-transform"
                      >
                        <X size={20} />
                      </button>
                    </div>
                  ) : (
                    <button
                      type="button"
                      onClick={() => {
                        setEditingId(user.id);
                        setEditPassword('');
                      }}
                      className="flex items-center gap-1 text-loki-gray hover:text-loki-green text-sm transition-colors"
                    >
                      <Pencil size={16} />
                      Clave
                    </button>
                  )}

                  {/* Delete */}
                  <button
                    type="button"
                    onClick={() => handleDelete(user)}
                    className="text-loki-gray hover:text-loki-danger transition-colors"
                  >
                    <Trash2 size={18} />
                  </button>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {appsUserId && (
        <UserAppsModal
          username={users.find((u) => u.id === appsUserId)?.username ?? ''}
          apps={apps}
          selected={draftApps}
          error={appsError}
          onToggle={toggleAssignedApp}
          onClose={closeApps}
        />
      )}
    </div>
  );
}

function UserAppsModal({
  username,
  apps,
  selected,
  error,
  onToggle,
  onClose,
}: {
  username: string;
  apps: AppItem[];
  selected: string[];
  error: string;
  onToggle: (appId: string) => void;
  onClose: () => void;
}) {
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [onClose]);

  return (
    <div
      className="fixed inset-0 z-[80] bg-black/70 flex items-center justify-center p-6"
      onClick={onClose}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-label={`APKs de ${username}`}
        className="bg-loki-card border border-loki-border rounded-2xl p-6 w-full max-w-md shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-start justify-between gap-4 mb-4">
          <div>
            <h3 className="text-lg font-semibold">Apps de {username}</h3>
            <p className="text-sm text-loki-gray mt-1">
              Los cambios se guardan al marcar o desmarcar.
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="text-loki-gray hover:text-loki-white transition-colors"
            aria-label="Cerrar"
          >
            <X size={20} />
          </button>
        </div>
        {error && <p className="text-sm text-loki-danger mb-3">{error}</p>}
        <AppCheckList apps={apps} selected={selected} onToggle={onToggle} />
      </div>
    </div>
  );
}

function AppCheckList({
  apps,
  selected,
  onToggle,
}: {
  apps: AppItem[];
  selected: string[];
  onToggle: (appId: string) => void;
}) {
  if (apps.length === 0) {
    return <p className="text-sm text-loki-gray">No hay APKs cargadas</p>;
  }

  return (
    <div className="max-h-64 overflow-y-auto space-y-2 pr-1">
      {apps.map((app) => {
        const checked = selected.includes(app.id);
        return (
          <label
            key={app.id}
            className="flex items-center gap-3 bg-loki-dark border border-loki-border rounded-lg px-3 py-2 cursor-pointer hover:border-loki-green/60"
          >
            <input
              type="checkbox"
              checked={checked}
              onChange={() => onToggle(app.id)}
              className="w-4 h-4 accent-green-500"
            />
            <span className="text-sm text-loki-white flex-1 truncate">{app.name}</span>
            <span className="text-xs text-loki-gray-dim font-mono shrink-0">{app.version}</span>
          </label>
        );
      })}
    </div>
  );
}

// ==================== APPS MANAGER ====================

function AppsManager() {
  const [apps, setApps] = useState<AppItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState({
    name: '',
    version: '',
    size: '',
    description: '',
    iconUrl: '',
    downloadUrl: '',
  });
  const [saving, setSaving] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);

  useEffect(() => {
    const unsub = subscribeApps((data) => {
      setApps(data);
      setLoading(false);
    });
    return () => {
      unsub();
    };
  }, []);

  const resetForm = () => {
    setForm({ name: '', version: '', size: '', description: '', iconUrl: '', downloadUrl: '' });
    setEditingId(null);
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!form.name.trim()) return;
    setSaving(true);
    try {
      if (editingId) {
        await updateApp(editingId, {
          name: form.name.trim(),
          version: form.version.trim(),
          size: form.size.trim(),
          description: form.description.trim(),
          iconUrl: form.iconUrl.trim(),
          downloadUrl: form.downloadUrl.trim(),
        });
      } else {
        await addApp({
          name: form.name.trim(),
          version: form.version.trim() || 'v1.0.0',
          size: form.size.trim() || '—',
          description: form.description.trim(),
          iconUrl: form.iconUrl.trim(),
          downloadUrl: form.downloadUrl.trim(),
        });
      }
      resetForm();
    } finally {
      setSaving(false);
    }
  };

  const handleEdit = (app: AppItem) => {
    setEditingId(app.id);
    setForm({
      name: app.name,
      version: app.version,
      size: app.size,
      description: app.description,
      iconUrl: app.iconUrl,
      downloadUrl: app.downloadUrl,
    });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleQuickUpdate = async (
    app: AppItem,
    field: 'version' | 'downloadUrl',
    value: string
  ) => {
    if (!value.trim()) return;
    await updateApp(app.id, { [field]: value.trim() });
  };

  const handleDelete = async (app: AppItem) => {
    if (!confirm(`¿Eliminar la app "${app.name}"?`)) return;
    await deleteApp(app.id);
    if (editingId === app.id) resetForm();
  };

  return (
    <div className="grid lg:grid-cols-[420px_1fr] gap-6 lg:gap-8">
      {/* Form */}
      <div className="bg-loki-card border border-loki-border rounded-2xl p-5 sm:p-6 lg:sticky lg:top-[180px] self-start">
        <h3 className="flex items-center gap-2 text-lg font-semibold mb-5">
          {editingId ? (
            <Pencil className="text-loki-green" size={20} />
          ) : (
            <Plus className="text-loki-green" size={20} />
          )}
          {editingId ? 'Editar App' : 'Nueva App'}
        </h3>
        <form onSubmit={handleSubmit} className="space-y-4">
          <FormField label="Nombre">
            <input
              type="text"
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              className="w-full bg-loki-dark border border-loki-border rounded-xl px-3.5 py-2.5 text-sm focus:outline-none focus:border-loki-green"
              placeholder="LOKI Player"
            />
          </FormField>
          <div className="grid grid-cols-2 gap-3">
            <FormField label="Versión">
              <div className="relative">
                <Tag
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-loki-gray-dim pointer-events-none"
                  size={14}
                />
                <input
                  type="text"
                  value={form.version}
                  onChange={(e) => setForm({ ...form, version: e.target.value })}
                  className="w-full bg-loki-dark border border-loki-border rounded-xl pl-9 pr-3 py-2.5 text-sm focus:outline-none focus:border-loki-green"
                  placeholder="v2.4.1"
                />
              </div>
            </FormField>
            <FormField label="Tamaño">
              <input
                type="text"
                value={form.size}
                onChange={(e) => setForm({ ...form, size: e.target.value })}
                className="w-full bg-loki-dark border border-loki-border rounded-xl px-3.5 py-2.5 text-sm focus:outline-none focus:border-loki-green"
                placeholder="45 MB"
              />
            </FormField>
          </div>
          <FormField label="Descripción">
            <textarea
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
              className="w-full bg-loki-dark border border-loki-border rounded-xl px-3.5 py-2.5 text-sm min-h-[80px] resize-y focus:outline-none focus:border-loki-green"
              placeholder="Breve descripción de la app"
            />
          </FormField>
          <FormField label="URL del Ícono">
            <div className="relative">
              <ImageIcon
                className="absolute left-3 top-1/2 -translate-y-1/2 text-loki-gray-dim pointer-events-none"
                size={14}
              />
              <input
                type="url"
                value={form.iconUrl}
                onChange={(e) => setForm({ ...form, iconUrl: e.target.value })}
                className="w-full bg-loki-dark border border-loki-border rounded-xl pl-9 pr-3 py-2.5 text-sm focus:outline-none focus:border-loki-green"
                placeholder="https://..."
              />
            </div>
          </FormField>
          <FormField label="URL de Descarga">
            <div className="relative">
              <Link2
                className="absolute left-3 top-1/2 -translate-y-1/2 text-loki-gray-dim pointer-events-none"
                size={14}
              />
              <input
                type="url"
                value={form.downloadUrl}
                onChange={(e) => setForm({ ...form, downloadUrl: e.target.value })}
                className="w-full bg-loki-dark border border-loki-border rounded-xl pl-9 pr-3 py-2.5 text-sm focus:outline-none focus:border-loki-green"
                placeholder="https://github.com/..."
              />
            </div>
          </FormField>
          <div className="flex gap-2">
            <button
              type="submit"
              disabled={saving}
              className="flex-1 bg-loki-green text-loki-black font-bold py-3 rounded-xl hover:bg-loki-green/90 disabled:opacity-50 transition-colors flex items-center justify-center gap-2"
            >
              {saving ? (
                <Loader2 size={18} className="animate-spin" />
              ) : editingId ? (
                <Check size={18} />
              ) : (
                <Plus size={18} />
              )}
              {editingId ? 'Guardar' : 'Agregar'}
            </button>
            {editingId && (
              <button
                type="button"
                onClick={resetForm}
                className="px-4 py-3 bg-loki-dark border border-loki-border rounded-xl text-loki-gray hover:text-loki-white transition-colors"
              >
                <X size={18} />
              </button>
            )}
          </div>
        </form>
      </div>

      {/* Apps list */}
      <div className="bg-loki-card border border-loki-border rounded-2xl p-5 sm:p-6">
        <h3 className="text-lg font-semibold mb-5">APKs Cargadas ({apps.length})</h3>

        {loading ? (
          <div className="flex justify-center py-20">
            <Loader2 className="animate-spin text-loki-green" size={32} />
          </div>
        ) : apps.length === 0 ? (
          <div className="flex flex-col items-center py-20 text-loki-gray">
            <FileArchive size={48} className="mb-3 text-loki-gray-dim" />
            <p>No hay aplicaciones cargadas</p>
          </div>
        ) : (
          <div className="space-y-4">
            {apps.map((app) => (
              <AppAdminCard
                key={app.id}
                app={app}
                onEdit={() => handleEdit(app)}
                onDelete={() => handleDelete(app)}
                onQuickUpdate={handleQuickUpdate}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function AppAdminCard({
  app,
  onEdit,
  onDelete,
  onQuickUpdate,
}: {
  app: AppItem;
  onEdit: () => void;
  onDelete: () => void;
  onQuickUpdate: (app: AppItem, field: 'version' | 'downloadUrl', value: string) => void;
}) {
  const [editingField, setEditingField] = useState<'version' | 'downloadUrl' | null>(null);
  const [tempValue, setTempValue] = useState('');
  const [imgError, setImgError] = useState(false);

  const startEdit = (field: 'version' | 'downloadUrl') => {
    setEditingField(field);
    setTempValue(app[field]);
  };

  const saveEdit = () => {
    if (editingField) {
      onQuickUpdate(app, editingField, tempValue);
      setEditingField(null);
    }
  };

  return (
    <div className="bg-loki-dark border border-loki-border rounded-xl p-4 hover:border-loki-border/80 transition-colors">
      <div className="flex items-start gap-4">
        {/* Icon */}
        <div className="w-14 h-14 rounded-lg bg-loki-black border border-loki-border flex items-center justify-center shrink-0 overflow-hidden">
          {imgError ? (
            <FileArchive size={24} className="text-loki-gray-dim" />
          ) : (
            <img
              src={app.iconUrl}
              alt={app.name}
              onError={() => setImgError(true)}
              className="w-full h-full object-contain"
              loading="lazy"
            />
          )}
        </div>

        {/* Info */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <h4 className="font-semibold text-loki-white">{app.name}</h4>
            <span className="text-xs font-mono bg-loki-green/10 text-loki-green px-2 py-0.5 rounded">
              {app.version}
            </span>
            <span className="text-xs text-loki-gray-dim">{app.size}</span>
          </div>
          <p className="text-sm text-loki-gray-dim mt-1 line-clamp-2">{app.description}</p>

          {/* Quick edit fields */}
          <div className="mt-3 space-y-2">
            {/* Version quick edit */}
            <div className="flex items-center gap-2">
              <Tag size={14} className="text-loki-gray-dim shrink-0" />
              {editingField === 'version' ? (
                <div className="flex items-center gap-1 flex-1">
                  <input
                    type="text"
                    value={tempValue}
                    onChange={(e) => setTempValue(e.target.value)}
                    autoFocus
                    onKeyDown={(e) => e.key === 'Enter' && saveEdit()}
                    className="flex-1 bg-loki-black border border-loki-green rounded px-2 py-1 text-sm focus:outline-none"
                  />
                  <button type="button" onClick={saveEdit} className="text-loki-green">
                    <Check size={16} />
                  </button>
                  <button
                    type="button"
                    onClick={() => setEditingField(null)}
                    className="text-loki-danger"
                  >
                    <X size={16} />
                  </button>
                </div>
              ) : (
                <button
                  type="button"
                  onClick={() => startEdit('version')}
                  className="text-sm text-loki-gray hover:text-loki-green transition-colors"
                >
                  {app.version} ✎
                </button>
              )}
            </div>

            {/* Download URL quick edit */}
            <div className="flex items-center gap-2">
              <Download size={14} className="text-loki-gray-dim shrink-0" />
              {editingField === 'downloadUrl' ? (
                <div className="flex items-center gap-1 flex-1">
                  <input
                    type="url"
                    value={tempValue}
                    onChange={(e) => setTempValue(e.target.value)}
                    autoFocus
                    onKeyDown={(e) => e.key === 'Enter' && saveEdit()}
                    className="flex-1 bg-loki-black border border-loki-green rounded px-2 py-1 text-xs focus:outline-none"
                  />
                  <button type="button" onClick={saveEdit} className="text-loki-green">
                    <Check size={16} />
                  </button>
                  <button
                    type="button"
                    onClick={() => setEditingField(null)}
                    className="text-loki-danger"
                  >
                    <X size={16} />
                  </button>
                </div>
              ) : (
                <button
                  type="button"
                  onClick={() => startEdit('downloadUrl')}
                  className="text-xs text-loki-gray hover:text-loki-green transition-colors truncate max-w-[300px]"
                >
                  {app.downloadUrl || 'Sin URL'} ✎
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="flex flex-col gap-2 shrink-0">
          <button
            type="button"
            onClick={onEdit}
            className="text-loki-gray hover:text-loki-green transition-colors p-1"
            title="Editar"
          >
            <Pencil size={18} />
          </button>
          <button
            type="button"
            onClick={onDelete}
            className="text-loki-gray hover:text-loki-danger transition-colors p-1"
            title="Eliminar"
          >
            <Trash2 size={18} />
          </button>
        </div>
      </div>
    </div>
  );
}

// ==================== SHARED ====================

function FormField({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div>
      <label className="block text-xs text-loki-gray mb-1.5 tracking-wide uppercase">{label}</label>
      {children}
    </div>
  );
}