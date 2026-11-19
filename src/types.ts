export interface AppUser {
  id: string;
  username: string;
  password: string;
  isActive: boolean;
  /** Fecha de inicio de actividades / alta del cliente (YYYY-MM-DD). */
  startDate?: string;
  expirationDate?: string;
  /** IDs de documentos de la colección apps que este usuario puede descargar. */
  allowedApps?: string[];
  /** Cantidad máxima de dispositivos simultáneos autorizados (por defecto 1). */
  maxDevices?: number;
  /** Lista de IDs de dispositivos activos actualmente. */
  activeSessions?: string[];
}

export interface AppItem {
  id: string;
  name: string;
  version: string;
  size: string;
  description: string;
  iconUrl: string;
  downloadUrl: string;
}