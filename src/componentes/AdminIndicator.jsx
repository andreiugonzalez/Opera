import { useAuth } from '../contexts/AuthContext';

export default function AdminIndicator() {
  const { isAdmin, logout } = useAuth();

  if (!isAdmin()) {
    return null;
  }

  const handleLogout = () => {
    if (window.confirm('¿Deseas cerrar sesión y volver al login?')) {
      logout();
    }
  };

  return (
    <div className="fixed bottom-4 left-4 z-50">
      <button
        onClick={handleLogout}
        className="w-16 h-13 bg-white/90 bamckdrop-blur-s rounded-full shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-90 border-2 border-amber-400/50 p-1 overflow-hidden"
        title="Cerrar sesión"
        aria-label="Cerrar sesión"
      >
        <img 
          src="/imagenes/logo.ico" 
          alt="Opera Logo" 
          className="w-full h-full rounded-full object-cover overflow-hidden"
        />
        <span className="sr-only">Admin activo - Click para cerrar sesión</span>
      </button>
    </div>
  );
}