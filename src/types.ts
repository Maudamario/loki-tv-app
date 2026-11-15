export interface AppUser {
  id: string;
  username: string;
  password: string;
  isActive: boolean;
  expirationDate?: string;
  /** IDs de documentos de la colección apps que este usuario puede descargar. */
  allowedApps?: string[];
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
