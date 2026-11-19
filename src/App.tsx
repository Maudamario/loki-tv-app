import { Component, useState, useEffect, type ReactNode } from 'react';
import { AuthProvider, useAuth } from './authContext';
import { LoginScreen } from './screens/LoginScreen';
import { DashboardScreen, ExpiredScreen } from './screens/DashboardScreen';
import { AdminPanel } from './screens/AdminPanel';
import { VirtualMouse } from './VirtualMouse';

type Route = 'app' | 'admin';

interface ErrorBoundaryState {
  hasError: boolean;
  errorMessage: string;
}

class AppErrorBoundary extends Component<{ children: ReactNode }, ErrorBoundaryState> {
  state: ErrorBoundaryState = { hasError: false, errorMessage: '' };

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return {
      hasError: true,
      errorMessage: error?.message || 'Error inesperado al cargar la interfaz',
    };
  }

  handleReload = () => {
    this.setState({ hasError: false, errorMessage: '' });
    window.location.reload();
  };

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-[#0b0f19] text-white flex flex-col items-center justify-center p-6 text-center">
          <h2 className="text-xl font-bold text-red-400 mb-2">
            No se pudo iniciar la pantalla
          </h2>
          <p className="text-sm text-gray-300 max-w-md mb-6 break-words">
            {this.state.errorMessage}
          </p>
          <button
            type="button"
            onClick={this.handleReload}
            className="px-6 py-3 rounded-xl bg-green-500 text-black font-bold text-sm"
          >
            Reintentar ahora
          </button>
        </div>
      );
    }
    return this.props.children;
  }
}

function AppContent() {
  const { user, logout } = useAuth();
  const [route, setRoute] = useState<Route>('app');

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
  }, []);

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
    <AppErrorBoundary>
      <AuthProvider>
        <VirtualMouse />
        <AppContent />
      </AuthProvider>
    </AppErrorBoundary>
  );
}