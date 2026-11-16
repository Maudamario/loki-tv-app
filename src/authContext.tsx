import {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  type ReactNode,
} from 'react';
import type { AppUser } from './types';
import {
  authenticateUser,
  registerUserSession,
  subscribeUserSession,
} from './dataService';

interface AuthContextValue {
  user: AppUser | null;
  loading: boolean;
  kickedMessage: string | null;
  clearKickedMessage: () => void;
  login: (username: string, password: string) => Promise<boolean>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

const STORAGE_KEY = 'loki_tv_session';
const DEVICE_ID_KEY = 'loki_tv_device_id';

function getOrCreateDeviceId(): string {
  let id = localStorage.getItem(DEVICE_ID_KEY);
  if (!id) {
    id =
      typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function'
        ? crypto.randomUUID()
        : `dev-${Date.now()}-${Math.random().toString(36).slice(2, 10)}`;
    localStorage.setItem(DEVICE_ID_KEY, id);
  }
  return id;
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AppUser | null>(null);
  const [loading, setLoading] = useState(false);
  const [kickedMessage, setKickedMessage] = useState<string | null>(null);

  useEffect(() => {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      try {
        setUser(JSON.parse(stored) as AppUser);
      } catch {
        localStorage.removeItem(STORAGE_KEY);
      }
    }
  }, []);

  const logout = useCallback(() => {
    setUser(null);
    localStorage.removeItem(STORAGE_KEY);
  }, []);

  useEffect(() => {
    if (!user) return;
    const deviceId = getOrCreateDeviceId();
    const unsub = subscribeUserSession(user.id, deviceId, () => {
      setKickedMessage(
        'Se ha iniciado sesión en otro dispositivo. Límite de dispositivos autorizados alcanzado.'
      );
      logout();
    });
    return () => {
      unsub();
    };
  }, [user, logout]);

  const login = async (username: string, password: string): Promise<boolean> => {
    setLoading(true);
    setKickedMessage(null);
    try {
      const found = await authenticateUser(username.trim(), password);
      if (found) {
        const deviceId = getOrCreateDeviceId();
        await registerUserSession(found, deviceId);
        setUser(found);
        localStorage.setItem(STORAGE_KEY, JSON.stringify(found));
        return true;
      }
      return false;
    } finally {
      setLoading(false);
    }
  };

  const clearKickedMessage = () => setKickedMessage(null);

  return (
    <AuthContext.Provider
      value={{ user, loading, kickedMessage, clearKickedMessage, login, logout }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}