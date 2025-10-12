import { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import NewsModal from './NewsModal';

export default function AdminIndicator() {
  const { isAdmin, logout } = useAuth();
  const [showNewsModal, setShowNewsModal] = useState(false);

  if (!isAdmin()) {
    return null;
  }

  const handleLogout = () => {
    if (window.confirm('¿Deseas cerrar sesión y volver al login?')) {
      logout();
    }
  };

  return (
    <div className="fixed bottom-4 left-4 z-50 flex items-center gap-3">
      {/* Botón Añadir noticia */}
      {isAdmin() && (
        <button
          onClick={() => setShowNewsModal(true)}
          className="w-14 h-14 rounded-full bg-[#F8EDD6]/95 backdrop-blur-sm shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105 border-2 border-amber-400/60 text-[#783719] flex items-center justify-center"
          title="Añadir noticia"
          aria-label="Añadir noticia"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="w-7 h-7" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16M4 12h16" />
          </svg>
        </button>
      )}

      {/* Botón Cerrar sesión */}
      <button
        onClick={handleLogout}
        className="w-16 h-16 bg-white/90 backdrop-blur-sm rounded-full shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-95 border-2 border-amber-400/60 p-1 overflow-hidden"
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

      {/* Modal para añadir noticia */}
      {showNewsModal && (
        <NewsModal open={showNewsModal} onClose={() => setShowNewsModal(false)} />
      )}
    </div>
  );
}