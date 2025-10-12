import { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import { useProducts } from "../contexts/ProductsContext";
import ProductModal from "../componentes/ProductModal";
import CategoryModal from "../componentes/CategoryModal";
import AdminIndicator from "../componentes/AdminIndicator";
import { formatChileanPrice } from "../utils/priceUtils";

export default function PaginaProductos() {
  const [filtro, setFiltro] = useState("Todos");
  const [hoverId, setHoverId] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [showCategoryModal, setShowCategoryModal] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [modalMode, setModalMode] = useState('add');
  const navigate = useNavigate();
  const { isAdmin } = useAuth();
  const { getProductsByCategory, categories, deleteProduct, loading, error } = useProducts();

  // Ref y helpers para scroll de filtros en móviles
  const filtrosRef = useRef(null);
  const scrollFilters = (dir) => {
    if (!filtrosRef.current) return;
    filtrosRef.current.scrollBy({ left: dir * 220, behavior: 'smooth' });
  };

  const filtrarProductos = () => {
    return getProductsByCategory(filtro);
  };

  // Asegurar que al entrar se muestre desde arriba en móviles y desktop
  useEffect(() => {
    let prev = null;
    try {
      if (typeof window !== 'undefined' && 'scrollRestoration' in window.history) {
        prev = window.history.scrollRestoration;
        window.history.scrollRestoration = 'manual';
      }
    } catch {}
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

  const handleAddProduct = () => {
    setModalMode('add');
    setEditingProduct(null);
    setShowModal(true);
  };

  const handleEditProduct = (product) => {
    setModalMode('edit');
    setEditingProduct(product);
    setShowModal(true);
  };

  const handleDeleteProduct = async (product) => {
    const productName = product.name || product.titulo;
    if (window.confirm(`¿Estás seguro de que quieres eliminar "${productName}"?`)) {
      try {
        await deleteProduct(product.id);
        // El producto se eliminará de la vista solo después de que se confirme la eliminación en el servidor
      } catch (error) {
        alert('Error al eliminar el producto. Por favor, inténtalo de nuevo.');
        console.error('Error eliminando producto:', error);
      }
    }
  };

  const closeModal = () => {
    setShowModal(false);
    setEditingProduct(null);
  };

  return (
    <div className="w-full min-h-screen bg-[#B78456] p-4 sm:p-6 lg:p-8 overflow-x-hidden font-serif relative fade-in-up fade-in">
      {/* Flecha volver */}
      <button
        onClick={() => navigate("/")}
        className="fixed top-6 left-6 z-50 pointer-events-auto btn-back-783719 btn-sheen fade-in-up-strong delay-150"
        aria-label="Volver a inicio"
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          className="h-6 w-6"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth={2}
        >
          <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
        </svg>
      </button>

      <div className="text-center mb-12 fade-in-up-strong">
        <h1 className="text-5xl font-extrabold text-[#F8EDD6] mb-6 underline-elegant text-glow-soft">
          Productos
        </h1>
        {isAdmin() && (
          <div className="flex gap-4 justify-center fade-in-up-strong">
            <button
              onClick={handleAddProduct}
              className="px-6 py-3 bg-[#452216] text-white rounded-lg hover:bg-[#452216]/90 transition font-semibold shadow-md flex items-center gap-2 btn-sheen"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              Agregar Producto
            </button>
            <button
              onClick={() => setShowCategoryModal(true)}
              className="px-6 py-3 bg-[#452216] text-white rounded-lg hover:bg-[#452216]/90 transition font-semibold shadow-md flex items-center gap-2 btn-sheen"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              Agregar Categoría
            </button>
          </div>
        )}
      </div>

      {/* Botones de filtro: Desktop y Móvil con flechas */}
      <div className="mb-12">
        {/* Desktop/Tablet */}
        <div className="hidden sm:flex justify-center gap-4 stagger-children-strong">
          {categories.map((categoria) => (
            <button
              key={categoria.id || categoria.name}
              className={`px-6 py-2 rounded-full font-semibold transition-all shadow-md btn-sheen ${
                filtro === categoria.name
                  ? "bg-[#452216] text-white shadow-[#452216]"
                  : "bg-white text-[#452216] hover:bg-[#B78456]/30 border border-[#452216]"
              }`}
              onClick={() => setFiltro(categoria.name)}
            >
              {categoria.name}
            </button>
          ))}
        </div>
        {/* Móvil con scroll y flechas */}
        <div className="sm:hidden flex items-center gap-2 px-2">
          <button
            type="button"
            onClick={() => scrollFilters(-1)}
            className="p-2 rounded-full bg-[#452216] text-white hover:bg-[#452216]/90 shadow-md btn-sheen"
            aria-label="Anterior categoría"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
            </svg>
          </button>
          <div
            ref={filtrosRef}
            className="flex overflow-x-auto whitespace-nowrap gap-2 scroll-smooth snap-x snap-mandatory no-scrollbar"
          >
            {categories.map((categoria) => (
              <button
                key={categoria.id || categoria.name}
                className={`inline-flex px-4 py-2 rounded-full font-semibold transition-all shadow-md snap-start btn-sheen ${
                  filtro === categoria.name
                    ? "bg-[#452216] text-white shadow-[#452216]"
                    : "bg-white text-[#452216] hover:bg-[#B78456]/30 border border-[#452216]"
                }`}
                onClick={() => setFiltro(categoria.name)}
              >
                {categoria.name}
              </button>
            ))}
          </div>
          <button
            type="button"
            onClick={() => scrollFilters(1)}
            className="p-2 rounded-full bg-[#452216] text-white hover:bg-[#452216]/90 shadow-md btn-sheen"
            aria-label="Siguiente categoría"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
            </svg>
          </button>
        </div>
      </div>

      {/* Grid productos */}
      {loading ? (
        <div className="flex justify-center items-center py-20">
          <div className="text-amber-600 text-xl">Cargando productos...</div>
        </div>
      ) : error ? (
        <div className="flex justify-center items-center py-20">
          <div className="text-red-600 text-xl">Error: {error}</div>
        </div>
      ) : (
        <div className="productos-grid grid gap-8 sm:grid-cols-2 md:grid-cols-3 max-w-6xl mx-auto stagger-children-strong">
          {filtrarProductos().length === 0 && (
            <div className="col-span-full text-center py-16 card-elegant">
              <h3 className="text-2xl font-bold text-amber-900 mb-2">No hay productos disponibles</h3>
              <p className="text-neutral-700">Selecciona otra categoría o agrega productos desde el panel de administración.</p>
            </div>
          )}
          {filtrarProductos().map((producto) => (
          <div
            key={producto.id}
            onMouseEnter={() => setHoverId(producto.id)}
            onMouseLeave={() => setHoverId(null)}
            className={`chart-elegant-783719 rounded-xl shadow-lg overflow-hidden transform will-change-transform transition duration-400 ease-out hover:scale-[1.04] cursor-pointer relative float-strong ${
              hoverId !== null && hoverId !== producto.id
                ? "filter blur-md opacity-60"
                : "filter-none opacity-100"
            } ${hoverId === producto.id ? "z-10" : "z-0"}`}
          >
            {/* Botones de administración */}
            {isAdmin() && (
              <div className="absolute top-2 right-2 flex gap-2 z-10">
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleEditProduct(producto);
                  }}
                  className="p-2 bg-[#452216] text-white rounded-full hover:bg-[#452216]/90 transition shadow-md btn-sheen"
                  title="Editar producto"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                  </svg>
                </button>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleDeleteProduct(producto);
                  }}
                  className="p-2 bg-[#452216] text-white rounded-full hover:bg-[#452216]/90 transition shadow-md btn-sheen"
                  title="Eliminar producto"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                  </svg>
                </button>
              </div>
            )}
            
            <div className="p-3 rounded-t-xl ring-1 ring-[#F8EDD6]/40 flex items-center justify-center frame-inner-glow">
              <img
                src={producto.image_url || producto.imagen}
                alt={producto.name || producto.titulo}
                className="w-full max-h-56 sm:max-h-64 md:max-h-72 object-contain mx-auto block rounded-2xl border-2 border-amber-400 shadow-sm"
                loading="lazy"
                decoding="async"
              />
            </div>
            <div className="p-6">
              <h2 className="text-2xl font-bold text-[#F8EDD6] mb-2">{producto.name || producto.titulo}</h2>
              <p className="text-[#F8EDD6]/90 mb-4">{producto.description || producto.ingredients || producto.ingredientes}</p>
              <p className="text-[#FBDFA2] font-semibold text-xl">
                ${formatChileanPrice(producto.price || producto.precio)}
              </p>
            </div>
          </div>
          ))}
        </div>
      )}

      {/* Modal para agregar/editar productos */}
      <ProductModal
        isOpen={showModal}
        onClose={closeModal}
        product={editingProduct}
        mode={modalMode}
      />

      {/* Modal para agregar categorías */}
      <CategoryModal
        isOpen={showCategoryModal}
        onClose={() => setShowCategoryModal(false)}
      />

      {/* Indicador de admin con botón de cerrar sesión */}
      <AdminIndicator />
    </div>
  );
}
