import { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import Login from '../componentes/Login';

export default function PaginaInicio({ onEnterApp }) {
  const { isAdmin, logout, login, USER_TYPES } = useAuth();
  const [showLogin, setShowLogin] = useState(false);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  // Imágenes del carousel
  const carouselImages = [
    '/imagenes/pastel1.jpg',
    '/imagenes/pastel2.jpg', 
    '/imagenes/pastel3.jpg',
    '/imagenes/pastel4.jpg',
    '/imagenes/pastel5.jpg',
    '/imagenes/pastel6.jpg',
    '/imagenes/torta1.jpg',
    '/imagenes/torta2.jpg',
    '/imagenes/torta3.jpg',
    '/imagenes/torta4.jpg',
    '/imagenes/torta5.jpg',
    '/imagenes/torta6.jpg',
    '/imagenes/torta7.jpg',
    '/imagenes/torta8.jpg'
  ];

  // Cambiar imagen del carousel automáticamente cada 4 segundos
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentImageIndex((prevIndex) => 
        (prevIndex + 1) % carouselImages.length
      );
    }, 4000);

    return () => clearInterval(interval);
  }, [carouselImages.length]);



  const handleLoginSuccess = () => {
    setShowLogin(false);
    if (onEnterApp) {
      onEnterApp();
    }
  };



  return (
    <div className="min-h-screen relative flex items-center justify-center p-4 overflow-hidden">
      {/* Fondo dinámico con imágenes del carrusel */}
      <div className="absolute inset-0 z-0">
        {carouselImages.map((image, index) => (
          <div
            key={index}
            className={`absolute inset-0 bg-cover bg-center transition-opacity duration-1000 ${
              index === currentImageIndex ? 'opacity-40' : 'opacity-0'
            }`}
            style={{ backgroundImage: `url(${image})` }}
          />
        ))}
        {/* Overlay para mejorar legibilidad */}
        <div className="absolute inset-0 bg-gradient-to-br from-amber-900/40 via-amber-800/30 to-amber-900/40"></div>
        <div className="absolute inset-0 bg-gradient-to-t from-black/30 via-transparent to-black/20"></div>
      </div>
      {/* Logo de Opera en esquina superior izquierda */}
      <div className="absolute top-6 left-6 z-20">
        <button
          onClick={() => {
            if (isAdmin() && window.confirm('¿Deseas cerrar sesión y volver al login?')) {
              logout();
            }
          }}
          className={`${isAdmin() ? 'cursor-pointer hover:scale-105' : 'cursor-default'} transition-transform duration-200`}
        >
          <img 
            src="/imagenes/logo.ico" 
            alt="Opera Logo" 
            className="w-16 h-16 rounded-full drop-shadow-lg object-cover border-2 border-white/20"
          />
        </button>
      </div>

      {/* Botón de Administrador en esquina */}
      <button
        onClick={() => setShowLogin(true)}
        className="absolute top-6 right-6 z-20 px-4 py-2 bg-amber-500/80 hover:bg-amber-600/90 active:bg-amber-700 text-white text-sm font-medium rounded-lg transition-all duration-300 shadow-lg hover:shadow-xl active:shadow-2xl border border-amber-400/50 backdrop-blur-sm transform hover:scale-110 active:scale-95 hover:rotate-3 active:rotate-0 animate-pulse hover:animate-none"
      >
        Admin
      </button>

      <div className="max-w-4xl w-full flex items-center justify-center relative z-10">
        
        {/* Sección de Bienvenida y Login centrada */}
        <div className="text-center space-y-8 bg-white/5 backdrop-blur-md rounded-2xl p-12 border border-white/10 shadow-2xl overflow-hidden max-w-2xl w-full">
          <div className="space-y-4 overflow-hidden">
            <h1 className="text-5xl lg:text-6xl font-bold text-white leading-tight drop-shadow-lg overflow-hidden">
              Bienvenido a <span className="text-amber-300">Opera</span>
            </h1>
            <p className="text-xl text-white/90 leading-relaxed drop-shadow-md overflow-hidden">
              Descubre la excelencia en cada detalle. Una experiencia única te espera.
            </p>
          </div>

          <div className="flex justify-center overflow-hidden">
             <button
               onClick={async () => {
                 await login(USER_TYPES.VIEWER);
                 if (onEnterApp) {
                   onEnterApp();
                 }
               }}
               className="px-12 py-6 bg-amber-500 hover:bg-amber-600 text-white text-2xl font-bold rounded-2xl transition-all duration-200 shadow-2xl hover:shadow-3xl border-2 border-amber-400/50 backdrop-blur-sm transform hover:scale-105"
             >
               Acceso Espectador
             </button>
           </div>
        </div>
      </div>

      {/* Modal de Login */}
      {showLogin && (
        <Login 
          onClose={() => setShowLogin(false)} 
          onSuccess={handleLoginSuccess}
        />
      )}
    </div>
  );
}
