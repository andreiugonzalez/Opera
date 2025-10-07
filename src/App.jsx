import { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { ProductsProvider } from './contexts/ProductsContext';
import Header from './componentes/Header';
import Notification from './componentes/Notification';
import PaginaProductos from './pages/PaginaProductos';
import PaginaInicio from './pages/PaginaInicio';
import PaginaBienvenida from './pages/PaginaBienvenida';
import PaginaPedido from './pages/PaginaPedido';
import SobreNosotrosDetalle from './pages/SobreNosotrosDetalle';
import './App.css';

function AppContent() {
  const [showWelcome, setShowWelcome] = useState(true);
  const { isAuthenticated, isLoading, shouldResetApp, setShouldResetApp } = useAuth();

  // Resetear la aplicación cuando se hace logout
  useEffect(() => {
    if (shouldResetApp) {
      setShowWelcome(true);
      setShouldResetApp(false);
    }
  }, [shouldResetApp, setShouldResetApp]);

  // Si ya hay sesión activa (admin o espectador), no mostrar la bienvenida
  useEffect(() => {
    if (!isLoading && isAuthenticated()) {
      setShowWelcome(false);
    }
  }, [isLoading, isAuthenticated]);

  // Mostrar loading mientras se verifica la autenticación
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-amber-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Cargando...</p>
        </div>
      </div>
    );
  }

  // Siempre mostrar PaginaInicio primero cuando showWelcome es true
  if (showWelcome) {
    return (
      <PaginaInicio 
        onEnterApp={() => {
          setShowWelcome(false);
        }} 
      />
    );
  }

  // Después del login, mostrar la aplicación principal
  return (
    <Router>
      <div className="w-full min-h-screen bg-gray-50 overflow-x-hidden">
        <RouteLoaderOverlay />
        <Routes>
          <Route path="/" element={<PaginaBienvenida />} />
          <Route path="/inicio" element={<PaginaInicio />} />
          <Route path="/productos" element={<PaginaProductos />} />
          <Route path="/sobrenosotros" element={<SobreNosotrosDetalle />} />
          <Route path="/pedido" element={<PaginaPedido />} />
        </Routes>
      </div>
    </Router>
  );
}

function RouteLoaderOverlay() {
  const location = useLocation();
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    setLoading(true);
    const t = setTimeout(() => setLoading(false), 700);
    return () => clearTimeout(t);
  }, [location]);

  if (!loading) return null;
  return (
    <div className="fixed inset-0 z-[1000] bg-black/60 backdrop-blur-sm flex flex-col items-center justify-center">
      <div className="w-20 h-20 rounded-full overflow-hidden border-2 border-amber-300 shadow-md">
        <img src="/imagenes/logo.ico" alt="Opera" className="w-full h-full object-cover animate-spin" />
      </div>
      <p className="mt-4 text-amber-100 font-semibold tracking-wide">Cargando...</p>
    </div>
  );
}

function App() {
  return (
    <AuthProvider>
      <ProductsProvider>
        <AppContent />
        <Notification />
      </ProductsProvider>
    </AuthProvider>
  );
}

export default App;
