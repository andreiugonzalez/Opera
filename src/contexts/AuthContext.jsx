import { createContext, useContext, useState, useEffect } from 'react';

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth debe ser usado dentro de un AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [shouldResetApp, setShouldResetApp] = useState(false);

  // Tipos de usuario
  const USER_TYPES = {
    VIEWER: 'viewer',
    ADMIN: 'admin'
  };

  // Cargar usuario del localStorage y verificar token (si admin) al iniciar
  useEffect(() => {
    const restoreSession = async () => {
      try {
        const savedUserRaw = localStorage.getItem('opera_user');
        const savedToken = localStorage.getItem('opera_token');
        if (!savedUserRaw) {
          setIsLoading(false);
          return;
        }
        const savedUser = JSON.parse(savedUserRaw);
        // Si es admin y hay token, verificar contra backend
        if (savedUser?.type === USER_TYPES.ADMIN && savedToken) {
          const resp = await fetch('http://localhost:3001/api/auth/verify', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json'
            },
            credentials: 'include'
          });
          const result = await resp.json();
          if (resp.ok && result?.success && result?.data?.valid) {
            setUser(savedUser);
          } else {
            // Token inválido, limpiar sesión
            localStorage.removeItem('opera_user');
            localStorage.removeItem('opera_token');
            setUser(null);
          }
        } else {
          // Espectador u otro: restaurar sin verificación
          setUser(savedUser);
        }
      } catch (e) {
        // En caso de error, no mantener sesión inconsistente
        localStorage.removeItem('opera_user');
        localStorage.removeItem('opera_token');
        setUser(null);
      } finally {
        setIsLoading(false);
      }
    };
    restoreSession();
  }, []);

  // Función de login
  const login = async (userType, credentials = {}) => {
    if (userType === USER_TYPES.ADMIN) {
      try {
        const response = await fetch('http://localhost:3001/api/auth/login', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          credentials: 'include',
          body: JSON.stringify({
            username: credentials.username,
            password: credentials.password
          })
        });

        const result = await response.json();

        if (!result.success) {
          throw new Error(result.error || 'Error de autenticación');
        }

        const userData = {
          id: result.data.user.id,
          type: USER_TYPES.ADMIN,
          username: result.data.user.username,
          role: result.data.user.role,
          token: result.data.token,
          loginTime: new Date().toISOString()
        };
        
        setUser(userData);
        localStorage.setItem('opera_user', JSON.stringify(userData));
        localStorage.setItem('opera_token', result.data.token);
        return userData;

      } catch (error) {
        throw new Error(error.message || 'Error de conexión');
      }
    } else {
      // Login para espectador (sin autenticación)
      const userData = {
        id: Date.now(),
        type: userType,
        username: 'Espectador',
        loginTime: new Date().toISOString()
      };
      
      setUser(userData);
      localStorage.setItem('opera_user', JSON.stringify(userData));
      return userData;
    }
  };

  // Función de logout
  const logout = () => {
    // Llamar a backend para limpiar cookie y luego limpiar estado local
    fetch('http://localhost:3001/api/auth/logout', {
      method: 'POST',
      credentials: 'include'
    }).finally(() => {
      setUser(null);
      localStorage.removeItem('opera_user');
      localStorage.removeItem('opera_token');
      setShouldResetApp(true);
      setTimeout(() => {
        window.location.href = '/';
      }, 100);
    });
  };

  // Verificar si es administrador
  const isAdmin = () => {
    return user?.type === USER_TYPES.ADMIN;
  };

  // Verificar si es espectador
  const isViewer = () => {
    return user?.type === USER_TYPES.VIEWER;
  };

  // Verificar si está autenticado
  const isAuthenticated = () => {
    return user !== null;
  };

  const value = {
    user,
    login,
    logout,
    isAdmin,
    isViewer,
    isAuthenticated,
    isLoading,
    shouldResetApp,
    setShouldResetApp,
    USER_TYPES
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};