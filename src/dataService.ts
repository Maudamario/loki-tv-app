import {
  collection,
  doc,
  addDoc,
  updateDoc,
  deleteDoc,
  getDocs,
  onSnapshot,
  type Unsubscribe,
} from 'firebase/firestore';
import { db, hasFirebaseConfig } from './firebase';
import { mockUsers, mockApps } from './mockData';
import type { AppUser, AppItem } from './types';

type UsersCallback = (users: AppUser[]) => void;
type AppsCallback = (apps: AppItem[]) => void;

const usersCol = 'usuarios';
const appsCol = 'apps';

export async function authenticateUser(
  username: string,
  password: string
): Promise<AppUser | null> {
  if (hasFirebaseConfig && db) {
    const snapshot = await getDocs(collection(db, usersCol));
    const found = snapshot.docs.find((d) => {
      const data = d.data() as Omit<AppUser, 'id'>;
      return data.username === username && data.password === password;
    });
    if (found) {
      return { id: found.id, ...(found.data() as Omit<AppUser, 'id'>) };
    }
    return null;
  }
  // Mock fallback
  return (
    mockUsers.find((u) => u.username === username && u.password === password) ?? null
  );
}

/** Registra este dispositivo en Firestore respetando el límite maxDevices (FIFO). */
export async function registerUserSession(user: AppUser, deviceId: string): Promise<void> {
  const maxDevices = Math.max(1, user.maxDevices ?? 1);
  const current = Array.isArray(user.activeSessions) ? [...user.activeSessions] : [];
  const filtered = current.filter((id) => id !== deviceId);
  filtered.push(deviceId);
  const nextSessions = filtered.slice(-maxDevices);

  if (hasFirebaseConfig && db) {
    await updateDoc(doc(db, usersCol, user.id), { activeSessions: nextSessions });
    return;
  }
  const idx = mockUsers.findIndex((u) => u.id === user.id);
  if (idx >= 0) mockUsers[idx].activeSessions = nextSessions;
}

/** Escucha cambios en tiempo real en las sesiones activas del usuario para expulsar excesos. */
export function subscribeUserSession(
  userId: string,
  deviceId: string,
  onKicked: () => void
): Unsubscribe | (() => void) {
  if (hasFirebaseConfig && db) {
    return onSnapshot(doc(db, usersCol, userId), (snapshot) => {
      if (!snapshot.exists()) {
        onKicked();
        return;
      }
      const data = snapshot.data() as Partial<AppUser>;
      if (data.isActive === false) {
        onKicked();
        return;
      }
      const sessions = data.activeSessions;
      if (Array.isArray(sessions) && !sessions.includes(deviceId)) {
        onKicked();
      }
    });
  }
  return () => {};
}

export function subscribeUsers(cb: UsersCallback): Unsubscribe | (() => void) {
  if (hasFirebaseConfig && db) {
    return onSnapshot(collection(db, usersCol), (snapshot) => {
      cb(
        snapshot.docs.map((d) => ({
          id: d.id,
          ...(d.data() as Omit<AppUser, 'id'>),
        }))
      );
    });
  }
  // Mock fallback
  cb(mockUsers);
  return () => {};
}

/** Lee allowedApps del documento del usuario. Si el campo no existe, devuelve []. */
export function subscribeAllowedApps(
  userId: string,
  cb: (allowedApps: string[]) => void
): Unsubscribe | (() => void) {
  if (hasFirebaseConfig && db) {
    return onSnapshot(
      doc(db, usersCol, userId),
      (snapshot) => {
        const raw = snapshot.data()?.allowedApps;
        cb(Array.isArray(raw) ? raw.filter((id): id is string => typeof id === 'string') : []);
      },
      () => {
        cb([]);
      }
    );
  }
  const raw = mockUsers.find((u) => u.id === userId)?.allowedApps;
  cb(Array.isArray(raw) ? raw : []);
  return () => {};
}

export function subscribeApps(cb: AppsCallback): Unsubscribe | (() => void) {
  if (hasFirebaseConfig && db) {
    return onSnapshot(collection(db, appsCol), (snapshot) => {
      cb(
        snapshot.docs.map((d) => ({
          id: d.id,
          ...(d.data() as Omit<AppItem, 'id'>),
        }))
      );
    });
  }
  // Mock fallback
  cb(mockApps);
  return () => {};
}

type UserField = string | boolean | number | string[];

/** Quita `undefined` para que Firestore persista todos los campos correctamente. */
function userPayload(data: Partial<Omit<AppUser, 'id'>>): Record<string, UserField> {
  const payload: Record<string, UserField> = {};
  if (data.username !== undefined) payload.username = data.username;
  if (data.password !== undefined) payload.password = data.password;
  if (data.isActive !== undefined) payload.isActive = data.isActive;
  if (data.expirationDate !== undefined) payload.expirationDate = data.expirationDate;
  if (data.allowedApps !== undefined) payload.allowedApps = [...data.allowedApps];
  if (data.maxDevices !== undefined) payload.maxDevices = Math.max(1, Number(data.maxDevices) || 1);
  if (data.activeSessions !== undefined) payload.activeSessions = [...data.activeSessions];
  return payload;
}

export async function addUser(
  user: Omit<AppUser, 'id'>
): Promise<string> {
  const payload = userPayload({
    ...user,
    allowedApps: user.allowedApps ?? [],
    maxDevices: user.maxDevices ?? 1,
    activeSessions: [],
  });
  if (hasFirebaseConfig && db) {
    const ref = await addDoc(collection(db, usersCol), payload);
    return ref.id;
  }
  const id = `mock-user-${Date.now()}`;
  mockUsers.push({ id, ...(payload as Omit<AppUser, 'id'>) });
  return id;
}

export async function updateUser(
  id: string,
  updates: Partial<Omit<AppUser, 'id'>>
): Promise<void> {
  const payload = userPayload(updates);
  if (hasFirebaseConfig && db) {
    await updateDoc(doc(db, usersCol, id), payload);
    return;
  }
  const idx = mockUsers.findIndex((u) => u.id === id);
  if (idx >= 0) {
    mockUsers[idx] = { ...mockUsers[idx], ...payload };
  }
}

export async function deleteUser(id: string): Promise<void> {
  if (hasFirebaseConfig && db) {
    await deleteDoc(doc(db, usersCol, id));
    return;
  }
  const idx = mockUsers.findIndex((u) => u.id === id);
  if (idx >= 0) mockUsers.splice(idx, 1);
}

export async function addApp(
  app: Omit<AppItem, 'id'>
): Promise<string> {
  if (hasFirebaseConfig && db) {
    const ref = await addDoc(collection(db, appsCol), app);
    return ref.id;
  }
  const id = `mock-app-${Date.now()}`;
  mockApps.push({ id, ...app });
  return id;
}

export async function updateApp(
  id: string,
  updates: Partial<Omit<AppItem, 'id'>>
): Promise<void> {
  if (hasFirebaseConfig && db) {
    await updateDoc(doc(db, appsCol, id), updates as Record<string, string | undefined>);
    return;
  }
  const idx = mockApps.findIndex((a) => a.id === id);
  if (idx >= 0) {
    mockApps[idx] = { ...mockApps[idx], ...updates };
  }
}

export async function deleteApp(id: string): Promise<void> {
  if (hasFirebaseConfig && db) {
    await deleteDoc(doc(db, appsCol, id));
    return;
  }
  const idx = mockApps.findIndex((a) => a.id === id);
  if (idx >= 0) mockApps.splice(idx, 1);
}