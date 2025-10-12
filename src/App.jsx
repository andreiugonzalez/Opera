import { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { ProductsProvider } from './contexts/ProductsContext';
import { NewsProvider } from './contexts/NewsContext';
import Header from './componentes/Header';
import Notification from './componentes/Notification';
import RequiredValidation from './componentes/RequiredValidation';
import PaginaProductos from './pages/PaginaProductos';
import PaginaInicio from './pages/PaginaInicio';
import PaginaBienvenida from './pages/PaginaBienvenida';
import PaginaPedido from './pages/PaginaPedido';
import SobreNosotrosDetalle from './pages/SobreNosotrosDetalle';
import SobreMi from './pages/SobreMi';
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
      <div className="min-h-screen flex items-center justify-center bg-opera-base">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-opera-tan mx-auto"></div>
          <p className="mt-4 text-opera">Cargando...</p>
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
      <div className="w-full min-h-screen bg-opera-base overflow-x-hidden">
        <RouteLoaderOverlay />
        <Routes>
          <Route path="/" element={<PaginaBienvenida />} />
          <Route path="/inicio" element={<PaginaInicio />} />
          <Route path="/productos" element={<PaginaProductos />} />
          <Route path="/sobrenosotros" element={<SobreNosotrosDetalle />} />
          <Route path="/sobremi" element={<SobreMi />} />
          <Route path="/pedido" element={<PaginaPedido />} />
        </Routes>
      </div>
    </Router>
  );
}

function RouteLoaderOverlay() {
  const location = useLocation();
  const [loading, setLoading] = useState(false);
  const excludedPaths = ['/sobrenosotros', '/sobremi'];

  useEffect(() => {
    // No mostrar overlay en las páginas de "Sobre"
    if (excludedPaths.includes(location.pathname)) {
      setLoading(false);
      return;
    }
    setLoading(true);
    const t = setTimeout(() => setLoading(false), 700);
    return () => clearTimeout(t);
  }, [location]);

  if (!loading) return null;
  return (
    <div className="fixed inset-0 z-[1000] bg-black/60 backdrop-blur-sm flex flex-col items-center justify-center pointer-events-none" aria-hidden="true">
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
        <NewsProvider>
          <RequiredValidation />
          <AppContent />
          <Notification />
        </NewsProvider>
      </ProductsProvider>
    </AuthProvider>
  );
}

export default App;
