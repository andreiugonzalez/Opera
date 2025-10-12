import { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import Login from './Login';
import NewsModal from './NewsModal';

export default function Header() {
  const { user, logout, isAdmin, isAuthenticated, isViewer } = useAuth();
  const [showLogin, setShowLogin] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [showNewsModal, setShowNewsModal] = useState(false);

  const handleLogout = () => {
    logout();
    setShowUserMenu(false);
  };

  return (
    <>
      {showNewsModal && (
        <NewsModal open={showNewsModal} onClose={() => setShowNewsModal(false)} />
      )}
      <header className="w-full bg-amber-50 shadow-md border-b border-amber-200 overflow-x-hidden">
        <div className="w-full mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            {/* Logo */}
            <div className="flex items-center">
              <h1 className="text-2xl font-bold text-amber-900 underline-elegant">Opera</h1>
            </div>

            {/* User Info / Login */}
            <div className="flex items-center space-x-4">
              {isAuthenticated() ? (
                <div className="relative">
                  <button
                    onClick={() => setShowUserMenu(!showUserMenu)}
                    className="flex items-center space-x-2 px-3 py-2 rounded-md text-amber-900 hover:bg-amber-100 transition-colors"
                  >
                    <div className={`w-3 h-3 rounded-full ${
                      isAdmin() ? 'bg-red-500' : 'bg-green-500'
                    }`}></div>
                    <span className="font-medium">{user.username}</span>
                    <span className={`text-xs px-2 py-1 rounded-full ${
                      isAdmin() 
                        ? 'bg-red-100 text-red-800' 
                        : 'bg-amber-100 text-amber-900'
                    }`}>
                      {isAdmin() ? 'Admin' : 'Espectador'}
                    </span>
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </button>

                  {/* Dropdown Menu */}
                  {showUserMenu && (
                    <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg border border-amber-200 z-10">
                      <div className="py-1">
                        <div className="px-4 py-2 text-sm text-amber-900 border-b border-amber-200">
                          Conectado como {isAdmin() ? 'Administrador' : 'Espectador'}
                        </div>
                        {isAdmin() && (
                          <button
                            onClick={() => setShowNewsModal(true)}
                            className="block w-full text-left px-4 py-2 text-sm text-[#783719] hover:bg-amber-50 transition-colors"
                          >
                            Añadir noticia
                          </button>
                        )}
                        {isViewer() && (
                          <button
                            onClick={handleLogout}
                            className="block w-full text-left px-4 py-2 text-sm text-amber-900 hover:bg-amber-50 transition-colors"
                          >
                            Salir
                          </button>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                <button
                  onClick={() => setShowLogin(true)}
                  className="px-4 py-2 bg-amber-600 text-white rounded-md hover:bg-amber-700 transition-colors font-medium"
                >
                  Iniciar Sesión
                </button>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* Login Modal */}
      {showLogin && (
        <Login onClose={() => setShowLogin(false)} />
      )}

      {/* Overlay para cerrar menu */}
      {showUserMenu && (
        <div 
          className="fixed inset-0 z-5" 
          onClick={() => setShowUserMenu(false)}
        ></div>
      )}
    </>
  );
}