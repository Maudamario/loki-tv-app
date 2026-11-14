import { useState, useRef, useEffect } from 'react';
import { useAuth } from '../authContext';
import { useDpadNav } from '../useDpadNav';
import { Logo } from '../components/Logo';
import { ADMIN_PASSWORD } from '../firebase';
import { Loader2, LogIn, AlertCircle, Lock, User } from 'lucide-react';

interface LoginScreenProps {
  onNavigateAdmin: () => void;
}

export function LoginScreen({ onNavigateAdmin }: LoginScreenProps) {
  const { login, loading } = useAuth();
  const { move } = useDpadNav();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const usernameRef = useRef<HTMLInputElement>(null);
  const clickCount = useRef(0);
  const clickTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    usernameRef.current?.focus();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!username.trim() || !password.trim()) {
      setError('Por favor complete todos los campos');
      return;
    }
    setError('');
    const success = await login(username, password);
    if (!success) {
      setError('Usuario o contraseña incorrectos');
    }
  };

  const handleLogoClick = (e: React.MouseEvent) => {
    e.preventDefault();
    clickCount.current++;
    if (clickTimer.current) clearTimeout(clickTimer.current);
    clickTimer.current = setTimeout(() => {
      clickCount.current = 0;
    }, 600);
    if (clickCount.current >= 5) {
      clickCount.current = 0;
      onNavigateAdmin();
    }
  };

  return (
    <div className="min-h-screen bg-gradient-loki flex flex-col items-center justify-center p-8 animate-fade-in">
      {/* Background accent */}
      <div className="pointer-events-none fixed inset-0 overflow-hidden">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-loki-green/5 rounded-full blur-[120px]" />
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-loki-green/3 rounded-full blur-[120px]" />
      </div>

      <div className="relative z-10 w-full max-w-md">
        {/* Logo */}
        <div className="flex justify-center mb-12" onKeyDown={(e) => e.key === 'Enter' && handleLogoClick}>
          <Logo size="xl" onClick={handleLogoClick} />
        </div>

        {/* Login Card */}
        <div className="bg-loki-card/80 backdrop-blur-xl border border-loki-border rounded-2xl p-8 shadow-2xl animate-slide-up">
          <h2 className="text-2xl font-semibold mb-2 text-center">
            Iniciar Sesión
          </h2>
          <p className="text-loki-gray text-sm text-center mb-8">
            Ingrese sus credenciales para acceder
          </p>

          {error && (
            <div className="mb-6 flex items-center gap-3 bg-loki-danger/10 border border-loki-danger/30 rounded-lg p-4 animate-fade-in">
              <AlertCircle className="text-loki-danger shrink-0" size={20} />
              <span className="text-loki-danger text-sm">{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Username */}
            <div>
              <label className="block text-sm font-medium text-loki-gray mb-2 tracking-wide">
                Usuario
              </label>
              <div className="relative">
                <User className="absolute left-4 top-1/2 -translate-y-1/2 text-loki-gray-dim" size={20} />
                <input
                  ref={usernameRef}
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  data-focusable
                  data-row={0}
                  data-col={0}
                  autoFocus
                  autoComplete="username"
                  className="w-full bg-loki-dark border-2 border-loki-border rounded-xl pl-12 pr-4 py-4 text-lg text-loki-white placeholder:text-loki-gray-dim tv-focusable focus:outline-none"
                  placeholder="Ingrese su usuario"
                />
              </div>
            </div>

            {/* Password */}
            <div>
              <label className="block text-sm font-medium text-loki-gray mb-2 tracking-wide">
                Contraseña
              </label>
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-loki-gray-dim" size={20} />
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  data-focusable
                  data-row={1}
                  data-col={0}
                  autoComplete="current-password"
                  className="w-full bg-loki-dark border-2 border-loki-border rounded-xl pl-12 pr-4 py-4 text-lg text-loki-white placeholder:text-loki-gray-dim tv-focusable focus:outline-none"
                  placeholder="Ingrese su contraseña"
                />
              </div>
            </div>

            {/* Submit */}
            <button
              type="submit"
              disabled={loading}
              data-focusable
              data-row={2}
              data-col={0}
              className="w-full bg-loki-green text-loki-black font-bold text-lg py-4 rounded-xl tv-focusable hover:bg-loki-green/90 disabled:opacity-50 flex items-center justify-center gap-3 transition-colors"
            >
              {loading ? (
                <Loader2 className="animate-spin" size={22} />
              ) : (
                <>
                  <LogIn size={22} />
                  INGRESAR
                </>
              )}
            </button>
          </form>
        </div>

        <p className="text-center text-loki-gray-dim text-xs mt-8 tracking-wide">
          LOKI TV · Optimizado para TV Box y Android TV
        </p>
      </div>
    </div>
  );
}
