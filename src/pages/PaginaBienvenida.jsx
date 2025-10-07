import { useRef, useState, useEffect } from "react";
import { useAuth } from "../contexts/AuthContext";
import { useNavigate } from "react-router-dom";
import AdminIndicator from "../componentes/AdminIndicator";

export default function PaginaBienvenida({ onContinue }) {
  const { logout, isViewer } = useAuth();
  const navigate = useNavigate();

  const secciones = {
    inicio: useRef(null),
    sobre: useRef(null),
    productos: useRef(null),
    pedidos: useRef(null),
    ubicacion: useRef(null),
  };

  // Estado para controlar las animaciones de entrada
  const [seccionesVisibles, setSeccionesVisibles] = useState({
    inicio: false,
    sobre: false,
    productos: false,
    pedidos: false,
    ubicacion: false,
  });

  // Función para manejar el scroll suave con efecto profesional
  const scrollTo = (ref) => {
    ref.current?.scrollIntoView({ 
      behavior: "smooth",
      block: "start" 
    });
  };

  // Observer para detectar cuando las secciones son visibles
  useEffect(() => {
    const observerOptions = {
      root: null,
      rootMargin: "0px",
      threshold: 0.25, // Cuando al menos 25% de la sección es visible
    };

    const handleIntersect = (entries) => {
      entries.forEach((entry) => {
        // Identificar qué sección es
        Object.keys(secciones).forEach((key) => {
          if (secciones[key].current === entry.target) {
            if (entry.isIntersecting) {
              setSeccionesVisibles(prev => ({
                ...prev,
                [key]: true
              }));
            }
          }
        });
      });
    };

    const observer = new IntersectionObserver(handleIntersect, observerOptions);

    // Observar todas las secciones
    Object.values(secciones).forEach((ref) => {
      if (ref.current) {
        observer.observe(ref.current);
      }
    });

    return () => {
      // Limpiar el observer cuando el componente se desmonte
      Object.values(secciones).forEach((ref) => {
        if (ref.current) {
          observer.unobserve(ref.current);
        }
      });
    };
  }, []);

  const [menuAbierto, setMenuAbierto] = useState(false);
  const [showNavbar, setShowNavbar] = useState(true);
  const toggleMenu = () => setMenuAbierto(!menuAbierto);

  // Mantener navbar siempre visible
  useEffect(() => {
    setShowNavbar(true);
  }, []);

  return (
    <div className="w-screen min-h-screen overflow-x-hidden">
      <AdminIndicator />
      <>
      {/* Menú fijo */}
      <nav className={`fixed top-0 left-0 right-0 text-white p-3 sm:p-4 flex justify-between items-center z-50 font-serif transition-all duration-500 bg-black/80 backdrop-blur-sm ${showNavbar ? 'translate-y-0 opacity-100' : '-translate-y-full opacity-0'}`} style={{textShadow: '2px 2px 4px rgba(0,0,0,0.8)'}}>
        {/* Grupo izquierdo - oculta en móvil */}
        <ul className="hidden md:flex gap-8 font-medium tracking-wide w-1/3 transition-all duration-500 ease-in-out">
          <li
            className="cursor-pointer relative group transition-all duration-300 ease-in-out"
            onClick={() => scrollTo(secciones.sobre)}
          >
            <span className="relative z-10 transition-colors duration-300 group-hover:text-amber-400">
            Sobre Nosotros
            </span>
            <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-amber-400 transition-all duration-300 ease-out group-hover:w-full"></span>
          </li>
          <li
            className="cursor-pointer relative group transition-all duration-300 ease-in-out"
            onClick={() => scrollTo(secciones.productos)}
          >
            <span className="relative z-10 transition-colors duration-300 group-hover:text-amber-400">
            Productos
            </span>
            <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-amber-400 transition-all duration-300 ease-out group-hover:w-full"></span>
          </li>
        </ul>

        {/* Centro */}
        <div
          className="font-extrabold text-xl sm:text-2xl text-white cursor-pointer w-1/3 text-center transition-colors duration-500"
          onClick={() => scrollTo(secciones.inicio)}
        >
          Opera
        </div>

        {/* Grupo derecho - oculta en móvil */}
        <ul className="hidden md:flex gap-8 font-medium tracking-wide w-1/3 justify-end transition-all duration-500 ease-in-out">
          <li
            className="cursor-pointer relative group transition-all duration-300 ease-in-out"
            onClick={() => scrollTo(secciones.pedidos)}
          >
            <span className="relative z-10 transition-colors duration-300 group-hover:text-amber-400">
            Pedidos
            </span>
            <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-amber-400 transition-all duration-300 ease-out group-hover:w-full"></span>
          </li>
          <li
            className="cursor-pointer relative group transition-all duration-300 ease-in-out"
            onClick={() => scrollTo(secciones.ubicacion)}
          >
            <span className="relative z-10 transition-colors duration-300 group-hover:text-amber-400">
              Ubicación & Contacto
            </span>
            <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-amber-400 transition-all duration-300 ease-out group-hover:w-full"></span>
            </li>
          {isViewer() && (
            <li
              className="cursor-pointer relative group transition-all duration-300 ease-in-out"
              onClick={() => logout()}
            >
              <span className="relative z-10 transition-colors duration-300 group-hover:text-amber-400">
                Salir
              </span>
              <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-amber-400 transition-all duration-300 ease-out group-hover:w-full"></span>
            </li>
          )}
        </ul>

        {/* Botón hamburguesa visible solo en móvil */}
        <button
          className="md:hidden text-amber-400 font-semibold transition-colors duration-500 p-2 rounded-md hover:bg-amber-900/30"
          onClick={toggleMenu}
          aria-label="Menú"
        >
          {menuAbierto ? "✕" : "☰"}
        </button>
      </nav>

      {/* Menú móvil desplegable */}
      <div className={`md:hidden fixed top-14 left-0 right-0 bg-black/95 backdrop-blur-sm text-amber-400 p-4 flex flex-col z-40 shadow-lg transform transition-all duration-300 ${menuAbierto && showNavbar ? 'translate-y-0 opacity-100' : 'translate-y-[-100%] opacity-0'}`}>
        <ul className="flex flex-col gap-4 font-semibold tracking-wide">
          {Object.entries(secciones).map(([key, ref]) => (
            <li
              key={key}
              className="cursor-pointer border-b border-amber-800/30 py-3 hover:bg-amber-900/20 px-3 rounded transition-all active:scale-95"
              onClick={() => {
                toggleMenu();
                scrollTo(ref);
              }}
            >
              {key === "ubicacion"
                ? "Ubicación & Contacto"
                : key.charAt(0).toUpperCase() + key.slice(1)}
            </li>
          ))}

          {isViewer() && (
            <li className="mt-2">
              <button
                className="w-full py-3 bg-amber-600 text-white rounded-lg font-semibold hover:bg-amber-700 transition-colors"
                onClick={() => {
                  logout();
                  toggleMenu();
                }}
              >
                Salir
              </button>
            </li>
          )}
        </ul>
      </div>

      <main className="transition-all duration-700">
        {/* Sección Inicio */}
        <section
          ref={secciones.inicio}
          className={`w-full h-screen bg-cover bg-center flex flex-col items-center justify-center text-white relative font-serif transition-all duration-1000 ${seccionesVisibles.inicio ? 'opacity-100' : 'opacity-0'}`}
          style={{ backgroundImage: "url('/imagenes/inicio.jpg')" }}
        >
          <div className="absolute inset-0 bg-gradient-to-b from-neutral-900 via-transparent to-neutral-900 opacity-80 transition-opacity duration-700"></div>
          <div className={`relative text-center w-full px-4 sm:px-6 transition-all duration-1000 transform ${seccionesVisibles.inicio ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0'}`}>
            <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-extrabold mb-4 max-w-full break-words overflow-hidden">Bienvenido a Opera</h1>
            <p
              className="text-xl sm:text-2xl md:text-3xl italic tracking-widest select-none text-white"
              style={{ textShadow: '0 3px 10px rgba(0,0,0,0.9), 0 1px 4px rgba(0,0,0,0.95)' }}
            >
              “A nadie le amarga un dulce”
            </p>
          </div>
        </section>

        {/* Sección Sobre Nosotros */}
        <section
          ref={secciones.sobre}
          className={`w-full py-16 sm:py-20 md:py-24 flex flex-col items-center justify-center bg-amber-50 px-4 sm:px-6 md:px-10 transition-all duration-1000 ${seccionesVisibles.sobre ? 'opacity-100' : 'opacity-0'}`}
        >
          <div className={`max-w-4xl text-center text-neutral-900 font-serif transition-all duration-1000 transform ${seccionesVisibles.sobre ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0'}`}>
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold mb-6 sm:mb-8 border-b-4 border-amber-400 inline-block pb-2">
              Sobre Nosotros
            </h2>
            <p className="text-base sm:text-lg md:text-xl leading-relaxed max-w-3xl mx-auto mb-6">
              Somos una pastelería artesanal dedicada a crear los mejores sabores para ti. Cada dulce es una obra de amor y cuidado, utilizando ingredientes frescos y de alta calidad para que disfrutes con cada bocado.
            </p>
            <button
              onClick={() => navigate("/sobrenosotros")}
              className="px-8 py-3 bg-amber-600 text-white rounded-lg font-semibold hover:bg-amber-700 transition-all duration-500 shadow-md hover:shadow-lg hover:shadow-amber-400/50 transform hover:-translate-y-1"
            >
              Ver más
            </button>
          </div>
        </section>

        {/* Sección Productos */}
        <section
          ref={secciones.productos}
          className={`w-full py-16 sm:py-20 md:py-24 flex flex-col md:flex-row items-center justify-center px-4 sm:px-8 md:px-12 gap-8 md:gap-12 bg-white shadow-inner rounded-lg transition-all duration-1000 ${seccionesVisibles.productos ? 'opacity-100' : 'opacity-0'}`}
        >
          <div className={`md:w-1/2 max-w-lg order-1 md:order-1 font-serif transition-all duration-1000 transform ${seccionesVisibles.productos ? 'translate-x-0 opacity-100' : 'translate-x-[-50px] opacity-0'}`}>
            <h2 className="text-3xl sm:text-3xl md:text-4xl font-extrabold mb-4 sm:mb-6 text-amber-600 tracking-wide">
              Explora en nuestros productos
            </h2>
            <p className="mb-6 sm:mb-8 text-neutral-700 text-base sm:text-lg leading-relaxed">
              Descubre una selección especial de pasteles y panes artesanales,
              diseñados para cada ocasión y gusto. Desde clásicos tradicionales
              hasta creaciones innovadoras.
            </p>
            <button
              onClick={() => navigate("/productos")}
              className="px-8 py-4 bg-amber-600 text-white rounded-lg font-semibold hover:bg-amber-700 transition-all duration-500 shadow-md hover:shadow-lg hover:shadow-amber-400/50 transform hover:-translate-y-1"
            >
              Explorar
            </button>
          </div>
          <div className={`md:w-1/2 order-2 md:order-2 w-full max-w-full rounded-lg shadow-lg overflow-hidden transition-all duration-1000 transform hover:scale-105 ${seccionesVisibles.productos ? 'translate-x-0 opacity-' : 'translate-x-[50px] opacity-0'}`}>
            <img
              src="/imagenes/pastel1.jpg"
              alt="Pastel"
              className="w-full h-85 "
            />
          </div>
        </section>

        {/* Sección Pedidos */}
        <section
          ref={secciones.pedidos}
          className={`w-full py-16 sm:py-20 md:py-24 flex flex-col items-center justify-center px-4 sm:px-8 md:px-12 gap-8 md:gap-12 bg-amber-100 shadow-lg rounded-lg transition-all duration-1000 ${seccionesVisibles.pedidos ? 'opacity-100' : 'opacity-0'}`}
        >
          <div className={`max-w-3xl text-center font-serif transition-all duration-1000 transform ${seccionesVisibles.pedidos ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0'}`}>
            <h2 className="text-4xl md:text-5xl font-extrabold tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-amber-800 via-amber-600 to-amber-400 drop-shadow-sm leading-tight mb-2">
              Haz tu pedido de tortas
            </h2>
            <div className="h-[3px] w-24 md:w-28 bg-amber-500 rounded-full mx-auto mb-3"></div>
            <p className="mt-2 text-amber-800 text-base md:text-lg bg-amber-50 border border-amber-200 rounded-lg px-4 py-3 shadow-sm max-w-xl mx-auto">
              Descubre nuestro selecto catálogo y elige la torta que más despierte tus sentidos, acompañada de toda la información necesaria para que tu elección sea perfecta.
            </p>
          </div>

         <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8 max-w-5xl w-full mx-auto ">
  <div className="rounded-xl shadow-xl overflow-hidden bg-white flex items-center justify-center transition-all duration-1000 transform hover:scale-90">
    <img
      src="/imagenes/torta1.jpg"
      alt="Torta 1"
      className="aspect-square w-full h-auto object-cover"
    />
  </div>
  <div className="rounded-xl shadow-xl overflow-hidden bg-white flex items-center justify-center transition-all duration-1000 transform hover:scale-90">
    <img
      src="/imagenes/torta2.jpg"
      alt="Torta 2"
      className="aspect-square w-full h-auto object-cover"
    />
  </div>
  <div className="rounded-xl shadow-xl overflow-hidden bg-white flex items-center justify-center transition-all duration-1000 transform hover:scale-90">
    <img
      src="/imagenes/torta4.jpg"
      alt="Torta 3"
      className="aspect-square w-full h-auto object-cover"
    />
  </div>
</div>

          <button
            onClick={() => navigate("/pedido")}
            className={`mt-10 px-8 py-4 bg-amber-600 text-white rounded-lg font-semibold hover:bg-amber-700 transition-all duration-500 shadow-md hover:shadow-lg hover:shadow-amber-400/50 transform hover:-translate-y-1 ${seccionesVisibles.pedidos ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}
          >
            Solicitar pedido
          </button>
        </section>

        {/* Sección Ubicación y Contacto con imagen izquierda e info derecha con padding para separación */}
        <section
          ref={secciones.ubicacion}
          className={`w-full py-16 sm:py-20 md:py-24 flex flex-col md:flex-row items-center justify-center px-4 sm:px-8 md:px-12 bg-white text-neutral-900 shadow-inner rounded-lg transition-all duration-1000 ${seccionesVisibles.ubicacion ? 'opacity-100' : 'opacity-0'}`}
        >
          {/* Imagen izquierda */}
          <div className={`w-full md:w-1/2 order-2 md:order-1 max-w-full rounded-lg shadow-lg overflow-hidden transition-all duration-1000 transform hover:scale-105 mb-8 md:mb-0 ${seccionesVisibles.ubicacion ? 'translate-x-0 opacity-100' : 'translate-x-[-50px] opacity-0'}`}>
            <img
              src="/imagenes/lugar.jpg"
              alt="Ubicación"
              className="w-full h-auto max-w-full object-cover"
            />
          </div>

          {/* Info derecha con padding */}
          <div className={`w-full md:w-1/2 order-1 md:order-2 max-w-3xl font-serif text-center md:text-left px-4 sm:px-6 md:px-8 lg:px-16 transition-all duration-1000 transform ${seccionesVisibles.ubicacion ? 'translate-x-0 opacity-100' : 'translate-x-[50px] opacity-0'}`}>
            <h2 className="text-3xl sm:text-3xl md:text-4xl font-extrabold mb-6 sm:mb-8 border-b-4 border-amber-400 inline-block pb-2 tracking-wide">
              Ubicación y Contacto
            </h2>
            <div className="mb-8">
              <p className="text-lg mb-3">Nos encuentras en Viviana Chepillo 3130, La Serena.</p>
              <p className="text-lg mb-3">
                Horario de atención: Lunes a viernes de 4:30 a 7:30 pm
              </p>
              
              {/* Google Maps */}
              <div className="mt-8 mb-6">
                <iframe
                  src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3349.8234567890123!2d-71.2425471!3d-29.9430368!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x9691cb7679eb8c8b%3A0xeb766d880899d083!2sOpera.%20Panaderia%20y%20Pasteler%C3%ADa!5e0!3m2!1ses!2scl!4v1642678901234!5m2!1ses!2scl"
                  width="100%"
                  height="300"
                  style={{ border: 0 }}
                  allowFullScreen=""
                  loading="lazy"
                  referrerPolicy="no-referrer-when-downgrade"
                  className="rounded-lg shadow-lg"
                ></iframe>
              </div>
              
              {/* Contactos */}
              <div className="mt-4 flex justify-center md:justify-start gap-10 sm:gap-8 text-3xl sm:text-4xl text-amber-600 px-2 sm:px-2 md:px-20 lg:px-50">
                <a
                  href="https://wa.me/56986193142"
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label="WhatsApp"
                  className="hover:text-green-600 transition-colors hover:scale-90 transform duration-300"
                >
                  📱
                </a>
                <a
                  href="https://www.instagram.com/opera.pasteleria/"
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label="Instagram"
                  className="hover:text-pink-500 transition-colors hover:scale-90 transform duration-300"
                >
                  📸
                </a>
                <a
                  href="mailto:contacto@opera.com"
                  aria-label="Correo Electrónico"
                  className="hover:text-gray-600 transition-colors hover:scale-90 transform duration-300"
                >
                  ✉️
                </a>
              </div>
            </div>
          </div>
        </section>
      </main>



      {/* Footer */}
      <footer className="bg-neutral-900 text-amber-400 py-4 sm:py-6 mt-8 sm:mt-12 text-center font-mono tracking-wide shadow-inner transition-all duration-700 backdrop-blur-sm">
        <p className="text-sm sm:text-base">© 2025 Pastelería y Panadería Opera. Todos los derechos reservados.</p>
        <p className="mt-1 sm:mt-2 text-xs sm:text-sm">Horneando sueños</p>
      </footer>
      </>
    </div>
  );
}
