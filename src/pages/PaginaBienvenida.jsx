import { useRef, useState, useEffect } from "react";
import { useAuth } from "../contexts/AuthContext";
import { useNews } from "../contexts/NewsContext";
import { useNavigate } from "react-router-dom";
import AdminIndicator from "../componentes/AdminIndicator";

export default function PaginaBienvenida({ onContinue }) {
  const { logout, isViewer } = useAuth();
  const { newsList, newsText, visible, lastUpdated } = useNews();
  const navigate = useNavigate();

  const secciones = {
    inicio: useRef(null),
    sobre: useRef(null),
    productos: useRef(null),
    pedidos: useRef(null),
    ubicacion: useRef(null),
    contacto: useRef(null),
    pie: useRef(null),
  };

  // Estado para controlar las animaciones de entrada
  const [seccionesVisibles, setSeccionesVisibles] = useState({
    inicio: false,
    sobre: false,
    productos: false,
    pedidos: false,
    ubicacion: false,
    contacto: false,
    pie: false,
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

  // Control de cierre manual del banner de noticia por espectador
  const [dismissedTs, setDismissedTs] = useState(() => {
    try {
      const saved = localStorage.getItem('opera_news_dismissed_ts');
      return saved ? parseInt(saved, 10) || 0 : 0;
    } catch {
      return 0;
    }
  });

  const dismissNewsBanner = () => {
    try { localStorage.setItem('opera_news_dismissed_ts', String(lastUpdated || Date.now())); } catch {}
    setDismissedTs(lastUpdated || Date.now());
  };

  const [menuAbierto, setMenuAbierto] = useState(false);
  const [showNavbar, setShowNavbar] = useState(true);
  const toggleMenu = () => setMenuAbierto(!menuAbierto);

  // Mantener navbar siempre visible
  useEffect(() => {
    setShowNavbar(true);
  }, []);

  return (
    <div className="w-screen min-h-screen overflow-x-hidden page-frame-elegant">
      <AdminIndicator />
      {/* Modal de noticias para espectadores: muestra TODAS las noticias juntas */}
      {isViewer() && visible && (newsList?.length > 0 || newsText) && (dismissedTs < (lastUpdated || 0)) && (
        <div className="fixed inset-0 z-[1000] bg-black/40 backdrop-blur-sm flex items-center justify-center">
          <div role="dialog" aria-modal="true" className="relative mx-4 inline-block max-w-xl w-auto bg-[#F8EDD6] border border-[#783719]/20 rounded-2xl shadow-2xl flex flex-col">
            <div className="px-5 py-3 border-b border-[#783719]/10 flex items-center justify-between bg-[#783719] rounded-t-2xl">
              <h3 className="text-[#F8EDD6] font-semibold">Noticias</h3>
              <button
                onClick={dismissNewsBanner}
                aria-label="Cerrar noticia"
                className="text-[#F8EDD6]/80 hover:text-white transition"
              >
                <svg className="w-5 h-5" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd"/></svg>
              </button>
            </div>
            <div className="px-5 py-4 max-h-[60vh] overflow-auto">
              <ol className="space-y-3">
                {(newsList && newsList.length > 0 ? newsList : [newsText]).map((it, idx) => (
                  <li key={idx} className="flex items-start gap-3 p-3 rounded-xl bg-white/80 border border-[#783719]/10 shadow-sm">
                    <span className="min-w-[1.75rem] h-7 px-2 rounded-full bg-[#783719] text-[#F8EDD6] text-sm flex items-center justify-center shadow">{idx + 1}</span>
                    <p className="flex-1 text-[#452216] leading-relaxed">{it}</p>
                  </li>
                ))}
              </ol>
            </div>
          </div>
        </div>
      )}
      <>
      {/* Menú fijo */}
      <nav className={`fixed top-0 left-0 right-0 text-white p-3 sm:p-4 flex justify-between items-center z-50 font-serif transition duration-500 bg-[#783719]/80 backdrop-blur-sm ${showNavbar ? 'translate-y-0 opacity-100' : '-translate-y-full opacity-0'}`} style={{textShadow: '2px 2px 4px rgba(0,0,0,0.8)'}}>
        {/* Grupo izquierdo - oculta en móvil */}
          <ul className="hidden md:flex gap-8 font-medium tracking-wide w-1/3 transition duration-500 ease-in-out">
          <li
                className="cursor-pointer relative group transition duration-300 ease-in-out"
            onClick={() => scrollTo(secciones.sobre)}
          >
            <span className="relative z-10 transition-colors duration-300 group-hover:text-amber-400">
            Sobre Nosotros
            </span>
                <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-amber-400 transition-[width] duration-300 ease-out group-hover:w-full"></span>
          </li>
          <li
                className="cursor-pointer relative group transition duration-300 ease-in-out"
            onClick={() => scrollTo(secciones.productos)}
          >
            <span className="relative z-10 transition-colors duration-300 group-hover:text-amber-400">
            Productos
            </span>
                <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-amber-400 transition-[width] duration-300 ease-out group-hover:w-full"></span>
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
          <ul className="hidden md:flex gap-8 font-medium tracking-wide w-1/3 justify-end transition duration-500 ease-in-out">
          <li
                className="cursor-pointer relative group transition duration-300 ease-in-out"
            onClick={() => scrollTo(secciones.pedidos)}
          >
            <span className="relative z-10 transition-colors duration-300 group-hover:text-amber-400">
            Solicitar Pedido
            </span>
                <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-amber-400 transition-[width] duration-300 ease-out group-hover:w-full"></span>
          </li>
          <li
                className="cursor-pointer relative group transition duration-300 ease-in-out"
            onClick={() => scrollTo(secciones.ubicacion)}
          >
            <span className="relative z-10 transition-colors duration-300 group-hover:text-amber-400">
              Ubicación & Contacto
            </span>
                <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-amber-400 transition-[width] duration-300 ease-out group-hover:w-full"></span>
            </li>
          {isViewer() && (
            <li
                className="cursor-pointer relative group transition duration-300 ease-in-out"
              onClick={() => logout()}
            >
              <span className="relative z-10 transition-colors duration-300 group-hover:text-amber-400">
                Salir
              </span>
                <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-amber-400 transition-[width] duration-300 ease-out group-hover:w-full"></span>
            </li>
          )}
        </ul>

        {/* Botón hamburguesa visible solo en móvil */}
        <button
          className="md:hidden font-semibold transition-colors duration-500 p-2 rounded-md"
          style={{ color: '#B78456', border: '1px solid #B78456' }}
          onClick={toggleMenu}
          aria-label="Menú"
        >
          {menuAbierto ? "✕" : "☰"}
        </button>
      </nav>

      {/* Menú móvil desplegable */}
        <div className={`md:hidden fixed top-14 left-0 right-0 p-4 flex flex-col z-40 shadow-lg transform transition duration-300 ${menuAbierto && showNavbar ? 'translate-y-0 opacity-100' : 'translate-y-[-100%] opacity-0'}`}
             style={{ backgroundColor: 'rgba(0,0,0,0.95)', color: '#B78456' }}>
        <ul className="flex flex-col gap-4 font-semibold tracking-wide">
          {[
            { key: 'inicio', label: 'Inicio', ref: secciones.inicio },
            { key: 'sobre', label: 'Sobre Nosotros', ref: secciones.sobre },
            { key: 'productos', label: 'Productos', ref: secciones.productos },
            { key: 'pedidos', label: 'Solicitar Pedido', ref: secciones.pedidos },
            { key: 'ubicacion', label: 'Ubicación', ref: secciones.ubicacion },
            { key: 'contacto', label: 'Contacto', ref: secciones.contacto },
          ].map(({ key, label, ref }) => (
            <li
              key={key}
              className="cursor-pointer border-b border-amber-800/30 py-3 px-3 rounded transition active:scale-95"
              onClick={() => {
                toggleMenu();
                scrollTo(ref);
              }}
            >
              {label}
            </li>
          ))}

          <li className="mt-2">
            <button
              className="w-full py-3 text-white rounded-lg font-semibold transition-colors"
              style={{ backgroundColor: '#452216' }}
              onClick={() => {
                logout();
                toggleMenu();
              }}
            >
              Salir
            </button>
          </li>
        </ul>
      </div>

      <main className="transition duration-700 page-content-elevate">
        {/* Sección Inicio */}
        <section
          ref={secciones.inicio}
          className={`w-full h-screen bg-cover bg-center flex flex-col items-center justify-center text-white relative font-serif transition duration-1000 ${seccionesVisibles.inicio ? 'opacity-100' : 'opacity-0'}`}
          style={{ backgroundImage: "url('/imagenes/inicio.jpg')" }}
        >
          <div className="absolute inset-0 bg-gradient-to-b from-neutral-900 via-transparent to-neutral-900 opacity-80 transition-opacity duration-700"></div>
        <div className={`relative text-center w-full px-4 sm:px-6 transition duration-1000 transform ${seccionesVisibles.inicio ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0'}`}>
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
          className={`w-full py-16 sm:py-20 md:py-24 flex flex-col items-center justify-center bg-[#FBDFA2] px-4 sm:px-6 md:px-10 transition duration-1000 ${seccionesVisibles.sobre ? 'opacity-100' : 'opacity-0'}`}
        >
          <div className={`max-w-4xl text-center text-neutral-900 font-serif transition duration-1000 transform ${seccionesVisibles.sobre ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0'} p-6 sm:p-8 card-elegant`}>
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold mb-6 sm:mb-8 underline-elegant">
              Sobre Nosotros
            </h2>
            <p className="text-base sm:text-lg md:text-xl leading-relaxed max-w-3xl mx-auto mb-6">
              Somos una pastelería artesanal dedicada a crear los mejores sabores para ti. Cada dulce es una obra de amor y cuidado, utilizando ingredientes frescos y de alta calidad para que disfrutes con cada bocado.
            </p>
            <button
              onClick={() => navigate("/sobrenosotros")}
              className="px-8 py-3 rounded-lg font-semibold transition duration-500 shadow-md hover:shadow-lg transform hover:-translate-y-1 btn-hover-elegant btn-floating-elegant-783719 active:scale-95"
            >
              Ver más
            </button>
          </div>
        </section>

        {/* Sección Productos */}
        <section
          ref={secciones.productos}
          className={`w-full py-16 sm:py-20 md:py-24 flex flex-col md:flex-row items-center justify-center px-4 sm:px-8 md:px-12 gap-8 md:gap-12 bg-white shadow-inner rounded-lg transition duration-1000 ${seccionesVisibles.productos ? 'opacity-100' : 'opacity-0'}`}
        >
          <div className={`md:w-1/2 max-w-lg order-1 md:order-1 font-serif transition-all duration-1000 transform ${seccionesVisibles.productos ? 'translate-x-0 opacity-100' : 'translate-x-[-50px] opacity-0'} card-b78356 p-6 rounded-2xl`}>
            <h2 className="text-3xl sm:text-3xl md:text-4xl font-extrabold mb-4 sm:mb-6 tracking-wide text-[#452216] underline-elegant">
              Explora en nuestros productos
            </h2>
            <p className="mb-6 sm:mb-8 text-neutral-700 text-base sm:text-lg leading-relaxed">
              Descubre una selección especial de pasteles y panes artesanales,
              diseñados para cada ocasión y gusto. Desde clásicos tradicionales
              hasta creaciones innovadoras.
            </p>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 w-full mb-6">
              {[
                { name: 'Galletas', img: '/imagenes/galletas1.PNG' },
                { name: 'Panes', img: '/imagenes/pan2.jpg' },
                { name: 'Pasteles', img: '/imagenes/pastel4.jpg' },
                { name: 'Tortas', img: '/imagenes/torta7.jpg' }
              ].map(({ name, img }, idx) => (
                <div key={idx} className="category-chip-stack">
                  <span className="chip-elegant-amber chip-full">{name}</span>
                  <img src={img} alt={name} className="category-icon-circle" />
                </div>
              ))}
            </div>
            <button
              onClick={() => navigate("/productos")}
              className="px-8 py-4 rounded-lg font-semibold transition duration-500 shadow-md hover:shadow-lg transform hover:-translate-y-1 btn-sheen btn-floating-452216 active:scale-95"
            >
              Explorar
            </button>
          </div>
          <div className={`md:w-1/2 order-2 md:order-2 w-full max-w-full rounded-lg shadow-lg overflow-hidden transition duration-1000 transform hover:scale-105 ${seccionesVisibles.productos ? 'translate-x-0 opacity-100' : 'translate-x-[50px] opacity-0'}`}>
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
          className={`w-full py-16 sm:py-20 md:py-24 flex flex-col items-center justify-center px-4 sm:px-8 md:px-12 gap-8 md:gap-12 pedidos-hero shadow-lg rounded-2xl transition duration-1000 ${seccionesVisibles.pedidos ? 'opacity-100' : 'opacity-0'}`}
        >
          <div className={`max-w-3xl text-center font-serif transition duration-1000 transform ${seccionesVisibles.pedidos ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0'}`}>
            <h2 className="text-4xl md:text-5xl font-extrabold tracking-tight pedidos-title-sheen-dark drop-shadow-sm leading-tight mb-2 underline-elegant">
              Haz tu pedido de tortas
            </h2>
            
            <p className="mt-2 text-amber-900 text-base md:text-lg pedidos-intro rounded-lg px-4 py-3 shadow-sm max-w-xl mx-auto">
              Descubre nuestro selecto catálogo y elige la torta que más despierte tus sentidos, acompañada de toda la información necesaria para que tu elección sea perfecta.
            </p>
          </div>

         <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8 max-w-5xl w-full mx-auto pedidos-grid">
  <div className="pedidos-card btn-sheen overflow-hidden flex items-center justify-center transition duration-700">
    <img
      src="/imagenes/torta1.jpg"
      alt="Torta 1"
      className="aspect-square w-full h-auto object-cover cake-photo"
    />
  </div>
  <div className="pedidos-card btn-sheen overflow-hidden flex items-center justify-center transition duration-700">
    <img
      src="/imagenes/torta2.jpg"
      alt="Torta 2"
      className="aspect-square w-full h-auto object-cover cake-photo"
    />
  </div>
  <div className="pedidos-card btn-sheen overflow-hidden flex items-center justify-center transition duration-700">
    <img
      src="/imagenes/torta4.jpg"
      alt="Torta 3"
      className="aspect-square w-full h-auto object-cover cake-photo"
    />
  </div>
</div>

          <button
            onClick={() => navigate("/pedido")}
            className={`mt-10 px-8 py-4 rounded-lg font-semibold transition duration-500 shadow-md hover:shadow-lg transform hover:-translate-y-1 btn-hover-elegant btn-floating-elegant-783719 active:scale-95 ${seccionesVisibles.pedidos ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}
          >
            Solicitar pedido
          </button>
        </section>

        {/* Sección Ubicación y Contacto en grid: móvil Ubicación → Foto → Contacto */}
        <section
          ref={secciones.ubicacion}
          className={`w-full py-16 sm:py-20 md:py-24 grid grid-cols-1 md:grid-cols-2 md:auto-rows-min gap-6 md:gap-x-12 md:gap-y-8 items-start justify-center px-4 sm:px-8 md:px-12 bg-cream-soft text-neutral-900 shadow-inner rounded-2xl transition duration-1000 ${seccionesVisibles.ubicacion ? 'opacity-100' : 'opacity-0'}`}
        >
          {/* Información de Ubicación (columna derecha en desktop) */}
          <div className={`w-full md:col-start-2 md:row-start-1 max-w-3xl font-serif text-center md:text-left px-4 sm:px-6 md:px-8 lg:px-16 md:flex md:flex-col md:justify-center md:self-center transition duration-1000 transform ${seccionesVisibles.ubicacion ? 'translate-x-0 opacity-100' : 'translate-x-[50px] opacity-0'} card-luminous-amber rounded-2xl`}>
            <h2 className="text-3xl sm:text-3xl md:text-4xl font-extrabold mb-2 tracking-wide text-amber-strong text-crisp underline-left-elegant">
              Ubicación
            </h2>
            <div className="mt-1 text-sm text-neutral-700 text-crisp">Encuéntranos y contáctanos fácilmente.</div>
            <div className="mb-8">
              <p className="text-lg mb-3 text-neutral-800 text-crisp">Nos encuentras en Viviana Chepillo 3130, La Serena.</p>
              <p className="text-lg mb-3 text-neutral-800 text-crisp">
                Horario de atención: Lunes a viernes de 4:30 a 7:30 pm
              </p>


           


              
              {/* Google Maps */}
              <div className="mt-10 mb-6 rounded-2xl map-frame-luminous overflow-hidden">
                <iframe
                  src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3349.8234567890123!2d-71.2425471!3d-29.9430368!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x9691cb7679eb8c8b%3A0xeb766d880899d083!2sOpera.%20Panaderia%20y%20Pasteler%C3%ADa!5e0!3m2!1ses!2scl!4v1642678901234!5m2!1ses!2scl"
                  width="100%"
                  height="600"
                  style={{ border: 0 }}
                  allowFullScreen=""
                  loading="lazy"
                  referrerPolicy="no-referrer-when-downgrade"
                  className="rounded-none"
                ></iframe>
              </div>
            </div>
          </div>
          {/* Imagen (columna izquierda en desktop, segunda en móvil) */}
          <div className={`w-full md:col-start-1 max-w-full card-elegant overflow-hidden transition duration-1000 transform hover:scale-105 mb-8 md:mb-0 ${seccionesVisibles.ubicacion ? 'translate-x-0 opacity-100' : 'translate-x-[-50px] opacity-0'}`}>            
            <img
              src="/imagenes/lugar.jpg"
              alt="Ubicación"
              className="w-full h-auto max-w-full object-cover"
            />
          </div>

          {/* Contacto movido fuera de la grilla */}
        </section>
      </main>



      {/* Footer */}
      {/* Contacto a ancho completo */}
      <section ref={secciones.contacto} className={`w-full py-16 sm:py-20 md:py-24 flex flex-col items-center justify-center bg-[#FBDFA2] px-4 sm:px-6 md:px-10 transition-all duration-700 ${seccionesVisibles.contacto ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}>
        <div className={`max-w-4xl w-full text-center text-neutral-900 font-serif mx-auto`}>
          <h2 className="text-3xl sm:text-4xl font-bold mb-6 underline-elegant">
            Contacto
          </h2>
          <p className="text-base sm:text-lg leading-relaxed max-w-3xl mx-auto mb-6">
            Puedes contactarnos por WhatsApp, Instagram o correo electrónico.
          </p>
        </div>

        {/* Contactos */}
        <div className="mt-2 grid grid-cols-1 sm:grid-cols-3 gap-5 max-w-5xl w-full mx-auto">
          {/* WhatsApp */}
          <a
            href="https://wa.me/56933517967"
            target="_blank"
            rel="noopener noreferrer"
            aria-label="WhatsApp"
            title="Contactar por WhatsApp"
          className="group block card-elegant p-5"
          >
            <div className="flex items-center gap-4 justify-center sm:justify-start">
              <div className="text-4xl leading-none text-amber-700 group-hover:text-green-600 transition-colors">📱</div>
              <div className="text-center sm:text-left">
                <div className="text-lg font-semibold text-amber-900">WhatsApp</div>
                <div className="text-sm text-neutral-600">+56933517967</div>
              </div>
            </div>
          </a>

          {/* Instagram */}
          <a
            href="https://www.instagram.com/opera.pasteleria/"
            target="_blank"
            rel="noopener noreferrer"
            aria-label="Instagram"
            title="Ver en Instagram"
          className="group block card-elegant p-5"
          >
            <div className="flex items-center gap-4 justify-center sm:justify-start">
              <div className="text-4xl leading-none text-amber-700 group-hover:text-pink-600 transition-colors">📸</div>
              <div className="text-center sm:text-left">
                <div className="text-lg font-semibold text-amber-900">Instagram</div>
                <div className="text-sm text-neutral-600">@opera.pasteleria</div>
              </div>
            </div>
          </a>

          {/* Correo: no clickeable, con copia y animación sutil */}
          <div
            aria-label="Correo Electrónico"
            title="Copiar correo"
          className="group block card-elegant p-5"
          >
            <div className="flex items-center gap-4 justify-center sm:justify-start">
              <div className="text-4xl leading-none text-amber-700 group-hover:text-neutral-700 transition-colors">✉️</div>
              <div className="text-center sm:text-left">
                <div className="text-lg font-semibold text-amber-900">Correo</div>
                <div className="text-sm text-neutral-700 break-words select-all">operalaserena@gmail.com</div>
                <button
                  type="button"
                  onClick={async () => {
                    try {
                      await navigator.clipboard.writeText('constanza.zurita12@gmail.com');
                    } catch {}
                  }}
                  className="mt-3 mx-auto sm:mx-0 inline-flex items-center gap-2 px-3 py-1.5 text-sm rounded-lg btn-hover-elegant btn-floating-elegant-783719 transition-all duration-500 shadow-md hover:shadow-lg transform hover:-translate-y-1 active:scale-95"
                >
                  <span>Copiar</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>
      <footer ref={secciones.pie} className={`relative overflow-hidden bg-[#783719]/80 text-[#F8EDD6] py-4 sm:py-6 mt-8 sm:mt-12 text-center font-mono tracking-wide shadow-inner transition-all duration-700 backdrop-blur-sm footer-elegant ${seccionesVisibles.pie ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-3'}`}>
        {/* Fade superior sutil */}
        <div className="pointer-events-none absolute inset-x-0 top-0 h-6 bg-gradient-to-b from-[#F8EDD6]/40 to-transparent opacity-50"></div>
        {/* Línea luminosa suave con animación */}
        <div className="pointer-events-none absolute inset-x-[-8%] top-0 h-[2px] bg-gradient-to-r from-transparent via-[#F8EDD6]/80 to-transparent blur-[0.5px] opacity-70 animate-pulse"></div>
        <div className="relative z-10">
          <p className="text-sm sm:text-base">© 2025 Pastelería y Panadería Opera. Todos los derechos reservados.</p>
          <p className="mt-1 sm:mt-2 text-xs sm:text-sm">Horneando sueños</p>
        </div>
      </footer>
      </>
    </div>
  );
}
