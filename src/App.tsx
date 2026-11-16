import { useState, useEffect } from 'react';
import { AuthProvider, useAuth } from './authContext';
import { useDpadNav } from './useDpadNav';
import { LoginScreen } from './screens/LoginScreen';
import { DashboardScreen, ExpiredScreen } from './screens/DashboardScreen';
import { AdminPanel } from './screens/AdminPanel';
import { VirtualMouse } from './VirtualMouse'; // <--- 1. Importas el cursor virtual

type Route = 'app' | 'admin';

function AppContent() {
  const { user, logout } = useAuth();
  const [route, setRoute] = useState<Route>('app');
  useDpadNav();

  // Sync URL hash for /admin route
  useEffect(() => {
    const checkHash = () => {
      const hash = window.location.hash.slice(1);
      if (hash === '/admin') {
        setRoute('admin');
      } else {
        setRoute('app');
      }
    };
    checkHash();
    window.addEventListener('hashchange', checkHash);
    return () => window.removeEventListener('hashchange', checkHash);
  }, [], );

  const navigateAdmin = () => {
    window.location.hash = '/admin';
    setRoute('admin');
  };

  const exitAdmin = () => {
    window.location.hash = '';
    setRoute('app');
  };

  if (route === 'admin') {
    return <AdminPanel onExit={exitAdmin} />;
  }

  if (!user) {
    return <LoginScreen onNavigateAdmin={navigateAdmin} />;
  }

  if (!user.isActive) {
    return <ExpiredScreen onBack={() => logout()} />;
  }

  return <DashboardScreen onLogout={() => logout()} />;
}

export default function App() {
  return (
    <AuthProvider>
      <VirtualMouse /> {/* <--- 2. Lo colocas aquí dentro para que esté activo en todo momento */}
      <AppContent />
    </AuthProvider>
  );
}