export interface AppUser {
  id: string;
  username: string;
  password: string;
  isActive: boolean;
  expirationDate?: string;
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
