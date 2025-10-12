import { useNavigate } from 'react-router-dom';

export default function SobreMi() {
  const navigate = useNavigate();
  return (
    <div className="min-h-screen md:h-screen overflow-y-auto md:overflow-hidden bg-[#f0d8b5] font-serif px-4 sm:px-6 py-6 sm:py-8 fade-in-strong">
      <button
        onClick={() => navigate('/sobrenosotros')}
        className="fixed top-6 left-6 z-50 btn-back-783719 btn-sheen"
        aria-label="Volver a Sobre la pastelería"
      >
        <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
        </svg>
      </button>

      <header className="max-w-4xl mx-auto text-center mb-6">
        <h1 className="text-4xl sm:text-5xl font-extrabold text-amber-700 mb-4 underline-elegant">Sobre mí</h1>
        <p className="text-lg text-neutral-800 max-w-xl mx-auto mb-6">
        
        </p>

        {/* Tabs selector: mantener misma apariencia que en SobreNosotrosDetalle */}
        <div className="mx-auto flex justify-center">
          <div className="inline-flex items-center gap-1 bg-white/70 backdrop-blur-sm border border-[#783719]/20 rounded-full p-1 shadow-sm">
            <button
              type="button"
              className={`text-[#783719] hover:bg-[#783719]/10 px-4 py-2 rounded-full font-semibold transition-all btn-sheen hover:scale-105 active:scale-95`}
              onClick={() => navigate('/sobrenosotros')}
            >
              Sobre la pastelería
            </button>
            <button
              type="button"
              className={`bg-[#783719] text-white shadow-md px-4 py-2 rounded-full font-semibold transition-all btn-sheen hover:scale-105 active:scale-95 hover:brightness-105`}
            >
              Sobre mí
            </button>
          </div>
        </div>
      </header>

      <section className="max-w-5xl mx-auto px-2 sm:px-4 h-auto md:h-[calc(100vh-230px)] fade-in-strong">
        <div className="card-elegant bg-[#f8edd6] rounded-3xl border border-amber-200 shadow-[0_8px_24px_rgba(120,55,25,0.12)] hover:shadow-[0_12px_36px_rgba(120,55,25,0.18)] h-full flex flex-col fade-in-up-strong float-card">
          <div className="card-header p-4 sm:p-5 bg-[#f8edd6] border-b border-amber-200/60">
            <h2 className="text-2xl sm:text-3xl font-extrabold text-white inline-block bg-[#b78456] px-4 py-2 rounded-xl shadow-sm">Constanza Zurita Alveal</h2>
            <p className="text-amber-700/80 font-semibold"></p>
          </div>
          <div className="card-body p-4 sm:p-6 grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6 items-start bg-[#f8edd6] overflow-hidden stagger-children-strong">
            {/* Foto de presentación dentro del recuadro */}
            <div className="overflow-hidden rounded-2xl p-3 bg-[#783719] border-2 border-[#783719] ring-1 ring-[#783719]/15 shadow-lg inline-block w-fit justify-self-center fade-in-zoom-strong frame-sheen frame-inner-glow">
              <img
                src="/imagenes/foto_presentacion.jpg"
                alt="Constanza Zurita Alveal"
                className="w-auto h-auto max-w-[220px] sm:max-w-[280px] md:max-w-[320px] max-h-56 sm:max-h-80 md:max-h-[320px] object-contain mx-auto rounded-xl border-2 border-[#783719] shadow-sm"
                loading="lazy"
                decoding="async"
              />
            </div>

            {/* Información profesional */}
            <div className="text-left md:border-l md:border-amber-200/60 md:pl-8 space-y-4 overflow-hidden">
              <h3 className="text-lg font-semibold text-[#783719] text-crisp mb-1">Perfil Profesional</h3>
              <p className="text-neutral-800 leading-relaxed text-[0.95rem] sm:text-sm md:text-base">
                Pastelera con formación en gastronomía internacional y especialización en pastelería, panadería y bollería en reconocidas escuelas de Latinoamérica y Europa. Experiencia en panadería y pastelería artesanal, con sólida base técnica y creatividad en nuevas preparaciones. Responsable, comprometida y apasionada por la excelencia en el trabajo gastronómico.
              </p>
              <div className="h-px bg-[#783719]/20" />

              <h3 className="text-lg font-semibold text-[#783719] text-crisp mt-4 mb-1">Formación Académica y Cursos</h3>
              <ul className="list-disc list-inside text-neutral-800 text-sm md:text-base space-y-1 fade-in-stagger-strong">
                <li>Gastronomía Internacional, Inacap La Serena – Chile</li>
                <li>Curso Pastelería, Le Cordon Bleu – París, Francia</li>
                <li>Curso de Pastelería, Le Cordon Bleu – Madrid, España</li>
                <li>Curso de Pastelería personalizada, Buenos Aires – Argentina</li>
                <li>Curso de Pizza, Gato Dumas – Buenos Aires, Argentina</li>
              </ul>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}