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
    <div className="min-h-screen relative flex items-center justify-center p-4 overflow-hidden animate-fadeIn" style={{ animationDuration: '300ms', animationFillMode: 'both' }}>
      {/* Fondo dinámico con imágenes del carrusel */}
      <div className="absolute inset-0 z-0">
        {carouselImages.map((image, index) => (
          <div
            key={index}
            className={`absolute inset-0 bg-cover bg-center transition-opacity duration-1000 ${
              index === currentImageIndex ? 'opacity-70' : 'opacity-0'
            }`}
            style={{ backgroundImage: `url(${image})` }}
          />
        ))}
        {/* Overlay para mejorar legibilidad */}
        <div className="absolute inset-0 bg-gradient-to-br from-[#B78456]/15 via-[#5b2b1c]/10 to-[#B78456]/15"></div>
        <div className="absolute inset-0 bg-gradient-to-t from-black/10 via-transparent to-black/5"></div>
      </div>
      {/* Logo de Opera en esquina superior izquierda */}
      <div className="absolute top-6 left-6 z-20">
        <button
          onClick={() => {
            if (isAdmin() && window.confirm('¿Deseas cerrar sesión y volver al login?')) {
              logout();
            }
          }}
          onDoubleClick={() => setShowLogin(true)}
          className={`cursor-pointer transition-transform duration-200 hover:scale-105`}
          title="Doble clic para acceder al formulario de administrador"
        >
          <img 
            src="/imagenes/logo.ico" 
            alt="Opera Logo" 
            className="w-16 h-16 rounded-full drop-shadow-lg object-cover border-2 border-white/20"
          />
        </button>
      </div>

      <div className="max-w-4xl w-full flex items-center justify-center relative z-10 animate-fadeInUp" style={{ animationDelay: '0.1s', animationDuration: '700ms', animationFillMode: 'both' }}>
        
        {/* Sección de Bienvenida y Login centrada */}
        <div className="text-center space-y-8 bg-white/20 backdrop-blur-md rounded-2xl p-12 border-2 border-[#B78456]/60 shadow-2xl overflow-hidden max-w-2xl w-full animate-fadeInUp" style={{ animationDelay: '0.2s', animationDuration: '700ms', animationFillMode: 'both' }}>
          <div className="space-y-4">
            <h1 className="text-5xl lg:text-6xl font-extrabold text-white leading-tight drop-shadow-lg overflow-hidden animate-fadeInUp" style={{ animationDelay: '0.3s', animationDuration: '700ms', animationFillMode: 'both' }}>
              Bienvenido a <span className="gradient-animated text-outline-elegant text-crisp">Opera</span>
            </h1>
            <p className="text-base md:text-lg leading-relaxed font-bold tracking-wide text-[#FBDFA2] drop-shadow-[0_2px_8px_rgba(0,0,0,0.55)] text-crisp animate-fadeInUp" style={{ animationDelay: '0.4s', animationDuration: '700ms', animationFillMode: 'both', textShadow: '0 1px 0 rgba(69,34,22,0.45), 0 4px 12px rgba(0,0,0,0.45)' }}>
              Descubre la excelencia en cada detalle. Una experiencia única te espera.
            </p>
          </div>

          <div className="flex justify-center overflow-hidden animate-fadeInUp" style={{ animationDelay: '0.5s', animationDuration: '700ms', animationFillMode: 'both' }}>
             <button
               onClick={async () => {
                 await login(USER_TYPES.VIEWER);
                 if (onEnterApp) {
                   onEnterApp();
                 }
               }}
            className="px-12 py-6 bg-[#783719] hover:bg-[#5f2d14] text-white text-2xl font-bold rounded-2xl transition-all duration-200 shadow-2xl hover:shadow-3xl border-2 border-[#783719]/40 backdrop-blur-sm transform hover:scale-105"
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
