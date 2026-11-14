import type { AppUser, AppItem } from './types';

export const mockUsers: AppUser[] = [
  {
    id: 'mock-user-1',
    username: 'demo',
    password: 'demo123',
    isActive: true,
    expirationDate: '2026-12-31',
  },
  {
    id: 'mock-user-2',
    username: 'test',
    password: 'test123',
    isActive: false,
    expirationDate: '2026-01-01',
  },
];

export const mockApps: AppItem[] = [
  {
    id: 'mock-app-1',
    name: 'LOKI Player',
    version: 'v2.4.1',
    size: '45 MB',
    description: 'Reproductor multimedia con soporte para listas IPTV y formatos avanzados.',
    iconUrl: 'https://cdn-icons-png.flaticon.com/512/725/725132.png',
    downloadUrl: 'https://github.com/lokiplayer/releases/download/v2.4.1/loki-player-2.4.1.apk',
  },
  {
    id: 'mock-app-2',
    name: 'CineStream',
    version: 'v1.8.0',
    size: '62 MB',
    description: 'Catálogo de películas y series en HD con reproducción fluida.',
    iconUrl: 'https://cdn-icons-png.flaticon.com/512/2798/2798729.png',
    downloadUrl: 'https://github.com/cinestream/releases/download/v1.8.0/cinestream-1.8.0.apk',
  },
  {
    id: 'mock-app-3',
    name: 'TV Live Pro',
    version: 'v3.1.2',
    size: '38 MB',
    description: 'Transmisión en vivo de canales internacionales con guía EPG.',
    iconUrl: 'https://cdn-icons-png.flaticon.com/512/306/306558.png',
    downloadUrl: 'https://github.com/tvlivepro/releases/download/v3.1.2/tv-live-pro-3.1.2.apk',
  },
  {
    id: 'mock-app-4',
    name: 'MediaHub',
    version: 'v5.0.0',
    size: '78 MB',
    description: 'Centro multimedia con descargas offline y gestión de biblioteca.',
    iconUrl: 'https://cdn-icons-png.flaticon.com/512/306/306561.png',
    downloadUrl: 'https://github.com/mediahub/releases/download/v5.0.0/mediahub-5.0.0.apk',
  },
  {
    id: 'mock-app-5',
    name: 'SportVision',
    version: 'v2.0.3',
    size: '52 MB',
    description: 'Eventos deportivos en vivo con multiventana y repeticiones.',
    iconUrl: 'https://cdn-icons-png.flaticon.com/512/2991/2991148.png',
    downloadUrl: 'https://github.com/sportvision/releases/download/v2.0.3/sportvision-2.0.3.apk',
  },
  {
    id: 'mock-app-6',
    name: 'KidsZone',
    version: 'v1.3.5',
    size: '33 MB',
    description: 'Contenido infantil seguro con control parental integrado.',
    iconUrl: 'https://cdn-icons-png.flaticon.com/512/2991/2991148.png',
    downloadUrl: 'https://github.com/kidszone/releases/download/v1.3.5/kidszone-1.3.5.apk',
  },
];
