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
    <div className="fixed inset-0 flex items-center justify-center z-50 overflow-hidden animate-fadeIn"
      style={{ background: 'linear-gradient(135deg, rgba(120,55,25,0.25), rgba(0,0,0,0.2))' }}>
      <div className="rounded-xl p-6 w-80 mx-4 shadow-2xl overflow-hidden animate-slideInScale border-2"
        style={{ backgroundColor: '#F8EDD6', borderColor: '#B78456' }}>
        <div className="text-center mb-4 overflow-hidden">
          <h2 className="text-2xl font-bold mb-2 animate-slideInUp" style={{ color: '#783719' }}>Acceso Administrador</h2>
          <p className="text-sm animate-slideInUp" style={{animationDelay: '0.05s', animationFillMode: 'both', color: '#452216'}}>Ingresa tus credenciales</p>
        </div>

        {/* Inputs para admin */}
        <div className="mb-4 space-y-3 overflow-hidden">
          <div className="animate-slideInUp" style={{animationDelay: '0.1s', animationFillMode: 'both'}}>
            <label className="block text-sm font-medium mb-2" style={{ color: '#783719' }}>
              Nombre de usuario
            </label>
            <input
               type="text"
               value={username}
               onChange={(e) => setUsername(e.target.value)}
               onKeyPress={handleKeyPress}
               className="w-full px-3 py-2 rounded-md focus:outline-none focus:ring-2 input-transition"
               style={{ borderWidth: '2px', borderColor: '#B78456', backgroundColor: '#FBDFA2' + '1A', color: '#452216' }}
               placeholder="Administrador"
               autoFocus
             />
          </div>
          <div className="animate-slideInUp" style={{animationDelay: '0.2s', animationFillMode: 'both'}}>
            <label className="block text-sm font-medium mb-2" style={{ color: '#783719' }}>
              Contraseña
            </label>
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                onKeyPress={handleKeyPress}
                className="w-full pr-10 px-3 py-2 rounded-md focus:outline-none focus:ring-2 input-transition"
                style={{ borderWidth: '2px', borderColor: '#B78456', backgroundColor: '#FBDFA2' + '1A', color: '#452216' }}
                placeholder="Contraseña"
              />
              <button
                type="button"
                aria-label={showPassword ? 'Ocultar contraseña' : 'Mostrar contraseña'}
                onClick={() => setShowPassword((v) => !v)}
                className="absolute right-2 top-1/2 -translate-y-1/2"
                style={{ color: '#783719' }}
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
          <div className="mb-4 p-3 rounded-md animate-slideInUp"
            style={{ backgroundColor: '#FBDFA2' + '33', border: '2px solid #B78456', color: '#783719' }}>
            {error}
          </div>
        )}

        {/* Botones */}
        <div className="flex flex-col gap-3">
          <button
            onClick={handleAdminLogin}
            className="w-full px-4 py-2 rounded-md button-transition animate-slideInUp shadow-md"
            style={{animationDelay: '0.3s', animationFillMode: 'both', backgroundColor: '#783719', color: '#F8EDD6'}}
          >
            Ingresar
          </button>
          <button
            onClick={onClose}
            className="w-full px-4 py-2 rounded-md button-transition animate-slideInUp shadow-md"
            style={{animationDelay: '0.4s', animationFillMode: 'both', backgroundColor: '#B78456', color: '#452216'}}
          >
            Cancelar
          </button>
        </div>
      </div>
    </div>
  );
}