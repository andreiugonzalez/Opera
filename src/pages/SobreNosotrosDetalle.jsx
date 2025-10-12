import { useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import AdminIndicator from "../componentes/AdminIndicator";

export default function SobreNosotrosDetalle() {
  const navigate = useNavigate();
  const [tab, setTab] = useState('pasteleria');

  // Asegurar que al entrar a la página se muestre desde arriba
  useEffect(() => {
    let prev = null;
    try {
      if (typeof window !== 'undefined' && 'scrollRestoration' in window.history) {
        prev = window.history.scrollRestoration;
        window.history.scrollRestoration = 'manual';
      }
    } catch {}
    // Forzar scroll al top en el próximo frame para evitar saltos iniciales
    if (typeof window !== 'undefined') {
      window.requestAnimationFrame(() => {
        window.scrollTo({ top: 0, left: 0, behavior: 'auto' });
        document.body.scrollTop = 0;
        document.documentElement.scrollTop = 0;
      });
    }
    return () => {
      try {
        if (typeof window !== 'undefined' && 'scrollRestoration' in window.history && prev) {
          window.history.scrollRestoration = prev;
        }
      } catch {}
    };
  }, []);

  const actividades = [
    {
      titulo: "Taller",
      descripcion:
        "Realizamos talleres certificados para que aprendas el arte de la panaderia y pasteleria, y lleves tus habilidades al siguiente nivel.",
      imagen: "/imagenes/taller.jpg",
    },
    {
      titulo: "Sorteos",
      descripcion:
        "Participa en nuestros sorteos periódicos para ganar productos exclusivos, descuentos y más sorpresas deliciosas.",
      imagen: "/imagenes/sorteo.jpg",
    },
    {
      titulo: "Pasteles y productos Temáticos",
      descripcion:
        "Creamos pasteles con temáticas especiales para cada ocasión y día festivo, haciendo que tus celebraciones sean inolvidables.",
      imagen: "/imagenes/navidad.jpg",
    },
  ];

  return (
    <div className="min-h-screen bg-[#f0d8b5] font-serif px-6 py-12 relative">
      {/* Flecha de navegación hacia atrás */}
      <button
        onClick={() => navigate("/")}
        className="fixed top-6 left-6 z-50 btn-back-783719 btn-sheen"
        aria-label="Volver a inicio"
      >
        <svg
          className="w-6 h-6 text-white"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M15 19l-7-7 7-7"
          />
        </svg>
      </button>
      <header className="max-w-4xl mx-auto text-center mb-10">
        <h1 className="text-5xl font-extrabold text-[#783719] text-crisp mb-6 underline-elegant">
          Sobre Nosotros
        </h1>
        <p className="text-lg text-neutral-800 max-w-xl mx-auto mb-6">
         
        </p>

        {/* Tabs selector */}
        <div className="mx-auto flex justify-center">
          <div className="inline-flex items-center gap-1 bg-white/70 backdrop-blur-sm border border-[#783719]/20 rounded-full p-1 shadow-sm">
            <button
              type="button"
              className={`${tab==='pasteleria' ? 'bg-[#783719] text-white shadow-md' : 'text-[#783719] hover:bg-[#783719]/10'} px-4 py-2 rounded-full font-semibold transition-all btn-sheen hover:scale-105 active:scale-95`}
              onClick={() => setTab('pasteleria')}
            >
              Sobre la pastelería
            </button>
            <button
              type="button"
              className={`text-[#783719] hover:bg-[#783719]/10 px-4 py-2 rounded-full font-semibold transition-all btn-sheen hover:scale-105 active:scale-95`}
              onClick={() => navigate('/sobremi')}
            >
              Sobre mí
            </button>
          </div>
        </div>
      </header>

      {/* (Se retiraron los gráficos de Producción mensual y Preferencias de sabores a solicitud) */}

      <section className="max-w-9xl mx-auto grid gap-12 md:grid-cols-3 fade-in-strong stagger-children-strong">
        {actividades.map(({ titulo, descripcion, imagen }) => (
          <article
            key={titulo}
            className="bg-white rounded-xl border border-amber-200/60 shadow-[0_8px_24px_rgba(120,55,25,0.12)] overflow-hidden transform transition-all duration-300 hover:shadow-[0_12px_36px_rgba(120,55,25,0.18)] hover:scale-105 float-card"
          >
            <div className="bg-gradient-to-br from-amber-100 to-amber-200 p-3 rounded-t-xl ring-1 ring-[#783719]/25 flex items-center justify-center">
              <img
                src={imagen}
                alt={titulo}
                className="w-full max-h-56 sm:max-h-64 md:max-h-72 object-contain mx-auto block rounded-2xl border-2 border-amber-400 shadow-sm"
                loading="lazy"
                decoding="async"
              />
            </div>
            <div className="p-6">
              <h2 className="text-2xl font-bold text-[#783719] text-crisp mb-3">
                {titulo}
              </h2>
              <div className="h-px bg-[#783719]/20 mb-3" />
              <p className="text-neutral-700 leading-relaxed">{descripcion}</p>
            </div>
          </article>
        ))}
      </section>

      {/* Indicador de admin con botón de cerrar sesión */}
      <AdminIndicator />
    </div>
  );
}
