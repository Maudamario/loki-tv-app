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

export async function addUser(
  user: Omit<AppUser, 'id'>
): Promise<string> {
  if (hasFirebaseConfig && db) {
    const ref = await addDoc(collection(db, usersCol), user);
    return ref.id;
  }
  const id = `mock-user-${Date.now()}`;
  mockUsers.push({ id, ...user });
  return id;
}

export async function updateUser(
  id: string,
  updates: Partial<Omit<AppUser, 'id'>>
): Promise<void> {
  if (hasFirebaseConfig && db) {
    await updateDoc(doc(db, usersCol, id), updates as Record<string, string | boolean | undefined>);
    return;
  }
  const idx = mockUsers.findIndex((u) => u.id === id);
  if (idx >= 0) {
    mockUsers[idx] = { ...mockUsers[idx], ...updates };
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
