import { useState, useRef } from "react";
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
    <div className="w-full min-h-screen bg-gradient-to-br from-amber-50 to-orange-100 p-4 sm:p-6 lg:p-8 overflow-x-hidden font-serif relative">
      {/* Flecha volver */}
      <button
        onClick={() => navigate("/")}
        className="absolute top-6 left-6 p-2 rounded-full bg-amber-600 text-white hover:bg-amber-700 transition-colors shadow-md"
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

      <div className="text-center mb-12">
        <h1 className="text-5xl font-extrabold text-amber-700 mb-6">
          Productos
        </h1>
        {isAdmin() && (
          <div className="flex gap-4 justify-center">
            <button
              onClick={handleAddProduct}
              className="px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors font-semibold shadow-md flex items-center gap-2"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              Agregar Producto
            </button>
            <button
              onClick={() => setShowCategoryModal(true)}
              className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-semibold shadow-md flex items-center gap-2"
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
        <div className="hidden sm:flex justify-center gap-4">
          {categories.map((categoria) => (
            <button
              key={categoria.id || categoria.name}
              className={`px-6 py-2 rounded-full font-semibold transition-colors shadow-md ${
                filtro === categoria.name
                  ? "bg-amber-600 text-white shadow-amber-500"
                  : "bg-white text-amber-700 hover:bg-amber-300"
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
            className="p-2 rounded-full bg-amber-600 text-white hover:bg-amber-700 shadow-md"
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
                className={`inline-flex px-4 py-2 rounded-full font-semibold transition-colors shadow-md snap-start ${
                  filtro === categoria.name
                    ? "bg-amber-600 text-white shadow-amber-500"
                    : "bg-white text-amber-700 hover:bg-amber-300"
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
            className="p-2 rounded-full bg-amber-600 text-white hover:bg-amber-700 shadow-md"
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
        <div className="grid gap-8 sm:grid-cols-2 md:grid-cols-3 max-w-6xl mx-auto">
          {filtrarProductos().map((producto) => (
          <div
            key={producto.id}
            onMouseEnter={() => setHoverId(producto.id)}
            onMouseLeave={() => setHoverId(null)}
            className={`bg-white rounded-xl shadow-lg overflow-hidden transform transition-transform duration-500 hover:scale-105 cursor-pointer relative ${
              hoverId !== null && hoverId !== producto.id
                ? "filter blur-sm opacity-60"
                : "filter-none opacity-100"
            }`}
          >
            {/* Botones de administración */}
            {isAdmin() && (
              <div className="absolute top-2 right-2 flex gap-2 z-10">
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleEditProduct(producto);
                  }}
                  className="p-2 bg-blue-600 text-white rounded-full hover:bg-blue-700 transition-colors shadow-md"
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
                  className="p-2 bg-red-600 text-white rounded-full hover:bg-red-700 transition-colors shadow-md"
                  title="Eliminar producto"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                  </svg>
                </button>
              </div>
            )}
            
            <div className="bg-gradient-to-br from-amber-100 to-amber-200 p-3 rounded-t-xl ring-1 ring-amber-300 flex items-center justify-center">
              <img
                src={producto.image_url || producto.imagen}
                alt={producto.name || producto.titulo}
                className="w-full max-h-56 sm:max-h-64 md:max-h-72 object-contain mx-auto block rounded-2xl border-2 border-amber-400 shadow-sm"
                loading="lazy"
                decoding="async"
              />
            </div>
            <div className="p-6">
              <h2 className="text-2xl font-bold text-amber-600 mb-2">{producto.name || producto.titulo}</h2>
              <p className="text-neutral-700 mb-4">{producto.description || producto.ingredients || producto.ingredientes}</p>
              <p className="text-amber-700 font-semibold text-xl">
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
