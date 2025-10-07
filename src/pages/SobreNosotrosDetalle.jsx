import { useNavigate } from "react-router-dom";
import AdminIndicator from "../componentes/AdminIndicator";

export default function SobreNosotrosDetalle() {
  const navigate = useNavigate();

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
    <div className="min-h-screen bg-amber-50 font-serif px-6 py-12 relative">
      {/* Flecha de navegación hacia atrás */}
      <button
        onClick={() => navigate("/")}
        className="fixed top-6 left-6 z-10 bg-white rounded-full p-3 shadow-lg hover:shadow-xl transition-all duration-300 hover:bg-amber-50 group"
      >
        <svg
          className="w-6 h-6 text-amber-600 group-hover:text-amber-700 transition-colors"
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
      <header className="max-w-4xl mx-auto text-center mb-12">
        <h1 className="text-5xl font-extrabold text-amber-700 mb-10">
          Sobre Nosotros
        </h1>
        <p className="text-lg text-neutral-800 max-w-xl mx-auto">
          Conoce más sobre nuestras actividades especiales que hacen de Opera un espacio único.
        </p>
      </header>

      <section className="max-w-9xl mx-auto grid gap-12 md:grid-cols-3">
        {actividades.map(({ titulo, descripcion, imagen }) => (
          <article
            key={titulo}
            className="bg-white rounded-xl shadow-lg overflow-hidden transform transition-all duration-300 hover:shadow-xl transform hover:scale-105"
          >
            <div className="bg-gradient-to-br from-amber-100 to-amber-200 p-3 rounded-t-xl ring-1 ring-amber-300 flex items-center justify-center">
              <img
                src={imagen}
                alt={titulo}
                className="w-full max-h-56 sm:max-h-64 md:max-h-72 object-contain mx-auto block rounded-2xl border-2 border-amber-400 shadow-sm"
                loading="lazy"
                decoding="async"
              />
            </div>
            <div className="p-6">
              <h2 className="text-2xl font-bold text-amber-600 mb-3">
                {titulo}
              </h2>
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
