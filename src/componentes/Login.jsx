import { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';

export default function Login({ onClose, onSuccess }) {
  const { login, USER_TYPES } = useAuth();
  const [selectedType, setSelectedType] = useState(USER_TYPES.ADMIN);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [showUsernameInput, setShowUsernameInput] = useState(true);
  const [showPassword, setShowPassword] = useState(false);

  const handleTypeSelect = (type) => {
    setSelectedType(type);
    setError('');
    if (type === USER_TYPES.ADMIN) {
      setShowUsernameInput(true);
    } else {
      setShowUsernameInput(false);
      setUsername('');
      setPassword('');
      // Login automático para espectador
      try {
        login(type, {});
        if (onSuccess) onSuccess();
      } catch (error) {
        setError(error.message);
      }
    }
  };

  const handleAdminLogin = async () => {
    setError('');
    
    if (!username.trim() || !password.trim()) {
      setError('Por favor ingresa usuario y contraseña');
      return;
    }

    try {
      await login(USER_TYPES.ADMIN, { username, password });
      if (onSuccess) onSuccess();
    } catch (error) {
      setError(error.message);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && selectedType === USER_TYPES.ADMIN) {
      handleAdminLogin();
    }
  };

  return (
    <div className="fixed inset-0 bg-gradient-to-br from-neutral-900 via-neutral-800 to-black flex items-center justify-center z-50 overflow-hidden animate-fadeIn">
      <div className="bg-white/95 backdrop-blur-sm rounded-xl p-6 w-80 mx-4 shadow-2xl border border-white/20 overflow-hidden animate-slideInScale">
        <div className="text-center mb-4 overflow-hidden">
          <h2 className="text-2xl font-bold text-red-700 mb-2 animate-slideInUp">Acceso Administrador</h2>
          
          <p className="text-gray-600 text-sm animate-slideInUp" style={{animationDelay: '0.05s', animationFillMode: 'both'}}>Ingresa tus credenciales</p>
        </div>

        {/* Inputs para admin */}
        <div className="mb-4 space-y-3 overflow-hidden">
          <div className="animate-slideInUp" style={{animationDelay: '0.1s', animationFillMode: 'both'}}>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Nombre de usuario
            </label>
            <input
               type="text"
               value={username}
               onChange={(e) => setUsername(e.target.value)}
               onKeyPress={handleKeyPress}
               className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent input-transition"
               placeholder="Administrador"
               autoFocus
             />
          </div>
          <div className="animate-slideInUp" style={{animationDelay: '0.2s', animationFillMode: 'both'}}>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Contraseña
            </label>
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                onKeyPress={handleKeyPress}
                className="w-full pr-10 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent input-transition"
                placeholder="Contraseña"
              />
              <button
                type="button"
                aria-label={showPassword ? 'Ocultar contraseña' : 'Mostrar contraseña'}
                onClick={() => setShowPassword((v) => !v)}
                className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
              >
                {showPassword ? (
                  // Ícono ojo tachado
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" className="w-5 h-5">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 3l18 18M10.584 10.587a3 3 0 104.243 4.243M12 5c4.5 0 8.5 2.5 10 7-1.035 3.223-3.34 5.6-6.25 6.75M6.25 17.75C3.34 16.6 1.035 14.223 0 11c1.5-4.5 5.5-7 10-7" />
                  </svg>
                ) : (
                  // Ícono ojo
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" className="w-5 h-5">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8S1 12 1 12z" />
                    <circle cx="12" cy="12" r="3" strokeWidth="2" />
                  </svg>
                )}
              </button>
            </div>
          </div>
        </div>

        {/* Error message */}
        {error && (
          <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded-md animate-slideInUp">
            {error}
          </div>
        )}

        {/* Botones */}
        <div className="flex flex-col gap-3">
          <button
            onClick={handleAdminLogin}
            className="w-full px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 button-transition animate-slideInUp"
            style={{animationDelay: '0.3s', animationFillMode: 'both'}}
          >
            Ingresar
          </button>
          <button
            onClick={onClose}
            className="w-full px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 button-transition animate-slideInUp"
            style={{animationDelay: '0.4s', animationFillMode: 'both'}}
          >
            Cancelar
          </button>
        </div>
      </div>
    </div>
  );
}