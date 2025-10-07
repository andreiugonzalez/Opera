import { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';

export default function Login({ onClose, onSuccess }) {
  const { login, USER_TYPES } = useAuth();
  const [selectedType, setSelectedType] = useState(USER_TYPES.ADMIN);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [showUsernameInput, setShowUsernameInput] = useState(true);

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
          <div className="inline-flex items-center justify-center w-12 h-12 bg-red-100 rounded-full mb-3 animate-slideInScale transition-transform hover:scale-110">
            <svg className="w-6 h-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
          </div>
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
               placeholder="OperaAdmin"
               autoFocus
             />
          </div>
          <div className="animate-slideInUp" style={{animationDelay: '0.2s', animationFillMode: 'both'}}>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Contraseña
            </label>
            <input
               type="password"
               value={password}
               onChange={(e) => setPassword(e.target.value)}
               onKeyPress={handleKeyPress}
               className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent input-transition"
               placeholder="Contraseña"
             />
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