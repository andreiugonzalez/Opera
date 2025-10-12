import { useState, useEffect } from 'react';
import { useProducts } from '../contexts/ProductsContext';
import ImageUpload from './ImageUpload';
import { formatPriceInput, parseChileanPrice, formatChileanPrice, sanitizePriceDigits } from '../utils/priceUtils';

export default function ProductModal({ isOpen, onClose, product = null, mode = 'add' }) {
  const { addProduct, editProduct, categories } = useProducts();
  const [formData, setFormData] = useState({
    titulo: '',
    categoria: 'Pasteles',
    ingredientes: '',
    precio: '',
    imagen: ''
  });
  const [useDeviceImage, setUseDeviceImage] = useState(false);
  const [errors, setErrors] = useState({});

  // Cargar datos del producto si estamos editando
  useEffect(() => {
    if (mode === 'edit' && product) {
      const price = product.price || product.precio;
      setFormData({
        titulo: product.name || product.titulo,
        categoria: product.category_name || product.categoria,
        ingredientes: product.description || product.ingredients || product.ingredientes,
        precio: formatChileanPrice(price),
        imagen: product.image_url || product.imagen
      });
    } else {
      setFormData({
        titulo: '',
        categoria: 'Pasteles',
        ingredientes: '',
        precio: '',
        imagen: ''
      });
    }
    setErrors({});
  }, [mode, product, isOpen]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    
    // Aplicar formateo automático para el campo precio
    let processedValue = value;
    if (name === 'precio') {
      processedValue = sanitizePriceDigits(value).slice(0, 15);
    } else if (name === 'titulo') {
      // Limitar el título a 35 caracteres
      processedValue = value.slice(0, 35);
    }
    
    setFormData(prev => ({
      ...prev,
      [name]: processedValue
    }));
    // Limpiar error del campo cuando el usuario empiece a escribir
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  const handleImageSelect = (imageDataUrl) => {
    setFormData(prev => ({
      ...prev,
      imagen: imageDataUrl
    }));
  };

  const handleImageSourceChange = (useDevice) => {
    setUseDeviceImage(useDevice);
    if (useDevice) {
      // Limpiar URL si cambia a dispositivo
      setFormData(prev => ({
        ...prev,
        imagen: ''
      }));
    }
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.titulo.trim()) {
      newErrors.titulo = 'El título es requerido';
    } else if (formData.titulo.trim().length > 35) {
      newErrors.titulo = 'El título no puede superar 35 caracteres';
    }

    if (!formData.ingredientes.trim()) {
      newErrors.ingredientes = 'Los ingredientes son requeridos';
    }

    const cleanPrice = parseChileanPrice(sanitizePriceDigits(formData.precio).slice(0, 15));
    if (!formData.precio || cleanPrice <= 0) {
      newErrors.precio = 'El precio debe ser un número mayor a 0';
    } else if (cleanPrice > 99999999) {
      newErrors.precio = 'El precio no puede exceder $99.999.999';
    }

    if (!formData.imagen.trim()) {
      newErrors.imagen = 'La URL de la imagen es requerida';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    // Encontrar el category_id basado en el nombre de la categoría
    const getCategoryId = (categoryName) => {
      const category = categories.find(cat => cat.name === categoryName);
      return category ? category.id : 1; // Default a la primera categoría
    };

    const productData = {
      name: formData.titulo,
      description: formData.ingredientes,
      price: parseChileanPrice(sanitizePriceDigits(formData.precio).slice(0, 15)),
      category_id: getCategoryId(formData.categoria),
      image_url: formData.imagen,
      stock_quantity: 0
    };

    try {
      if (mode === 'edit') {
        await editProduct(product.id, productData);
      } else {
        await addProduct(productData);
      }
      onClose();
    } catch (error) {
      console.error('Error al guardar producto:', error);
      // Aquí podrías mostrar un mensaje de error al usuario
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[1000] bg-black/40 backdrop-blur-sm flex items-center justify-center p-4 animate-fadeIn">
      <div className="bg-[#F8EDD6] rounded-2xl w-full max-w-[92vw] sm:w-[480px] md:w-[560px] h-[88vh] max-h-[88vh] overflow-y-auto shadow-2xl ring-1 ring-[#783719]/20">
        <div className="p-6">
          <div className="flex justify-between items-center mb-6 pb-4 border-b border-[#783719]/20">
            <h2 className="text-2xl font-semibold text-[#783719]">
              {mode === 'edit' ? 'Editar Producto' : 'Agregar Producto'}
            </h2>
            <button
              onClick={onClose}
              className="text-[#783719]/70 hover:text-[#783719] text-2xl transition"
            >
              ×
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Título */}
            <div>
              <label className="block text-sm font-medium text-[#783719] mb-1">
                Título *
              </label>
              <input
                type="text"
                name="titulo"
                value={formData.titulo}
                onChange={handleInputChange}
                maxLength={35}
                className={`w-full px-3 py-2 rounded-xl border focus:outline-none focus:ring-2 focus:ring-[#EBC07A] bg-white/80 text-[#452216] shadow-sm ${
                  errors.titulo ? 'border-red-500' : 'border-[#783719]/30'
                }`}
                placeholder="Nombre del producto"
              />
              {errors.titulo && <p className="text-red-500 text-sm mt-1">{errors.titulo}</p>}
            </div>

            {/* Categoría */}
            <div>
              <label className="block text-sm font-medium text-[#783719] mb-1">
                Categoría *
              </label>
              <select
                name="categoria"
                value={formData.categoria}
                onChange={handleInputChange}
                className="w-full px-3 py-2 rounded-xl border border-[#783719]/30 bg-white/80 focus:outline-none focus:ring-2 focus:ring-[#EBC07A] text-[#452216] shadow-sm"
              >
                {categories.filter(cat => cat.id !== 'todos').map(category => (
                  <option key={category.id} value={category.name}>{category.name}</option>
                ))}
              </select>
            </div>

            {/* Ingredientes */}
            <div>
              <label className="block text-sm font-medium text-[#783719] mb-1">
                Ingredientes *
              </label>
              <textarea
                name="ingredientes"
                value={formData.ingredientes}
                onChange={handleInputChange}
                rows={3}
                className={`w-full px-3 py-2 rounded-xl border focus:outline-none focus:ring-2 focus:ring-[#EBC07A] bg-white/80 text-[#452216] shadow-sm resize-y ${
                  errors.ingredientes ? 'border-red-500' : 'border-[#783719]/30'
                }`}
                placeholder="Lista de ingredientes separados por comas"
              />
              {errors.ingredientes && <p className="text-red-500 text-sm mt-1">{errors.ingredientes}</p>}
            </div>

            {/* Precio */}
            <div>
              <label className="block text-sm font-medium text-[#783719] mb-1">
                Precio (CLP) *
              </label>
              <input
                type="text"
                inputMode="numeric"
                name="precio"
                value={formData.precio}
                onChange={handleInputChange}
                onBlur={(e) => setFormData(prev => ({ ...prev, precio: formatChileanPrice(sanitizePriceDigits(e.target.value).slice(0, 15)) }))}
                onFocus={(e) => setFormData(prev => ({ ...prev, precio: sanitizePriceDigits(e.target.value).slice(0, 15) }))}
                maxLength={15}
                className={`w-full px-3 py-2 rounded-xl border focus:outline-none focus:ring-2 focus:ring-[#EBC07A] bg-white/80 text-[#452216] shadow-sm ${
                  errors.precio ? 'border-red-500' : 'border-[#783719]/30'
                }`}
                placeholder="Ej: 24990"
              />
              {errors.precio && <p className="text-red-500 text-sm mt-1">{errors.precio}</p>}
            </div>

            {/* Imagen */}
            <div>
              <label className="block text-sm font-medium text-[#783719] mb-3">
                Imagen del producto *
              </label>
              
              {/* Selector de fuente de imagen */}
              <div className="mb-4">
                <div className="flex gap-6">
                  <label className="flex items-center">
                    <input
                      type="radio"
                      name="imageSource"
                      checked={!useDeviceImage}
                      onChange={() => handleImageSourceChange(false)}
                      className="mr-2 accent-[#783719]"
                    />
                    <span className="text-sm text-[#452216]">URL de imagen</span>
                  </label>
                  <label className="flex items-center">
                    <input
                      type="radio"
                      name="imageSource"
                      checked={useDeviceImage}
                      onChange={() => handleImageSourceChange(true)}
                      className="mr-2 accent-[#783719]"
                    />
                    <span className="text-sm text-[#452216]">Subir desde dispositivo</span>
                  </label>
                </div>
              </div>

              {/* Input URL o Upload según selección */}
              {!useDeviceImage ? (
                <div>
                  <input
                    type="text"
                    name="imagen"
                    value={formData.imagen}
                    onChange={handleInputChange}
                    className={`w-full px-3 py-2 rounded-xl border focus:outline-none focus:ring-2 focus:ring-[#EBC07A] bg-white/80 text-[#452216] shadow-sm ${
                      errors.imagen ? 'border-red-500' : 'border-[#783719]/30'
                    }`}
                    placeholder="/imagenes/producto.jpg"
                  />
                  {formData.imagen && (
                    <div className="mt-2">
                      <img 
                        src={formData.imagen} 
                        alt="Preview" 
                        className="w-20 h-20 object-cover rounded border"
                        onError={(e) => {
                          e.target.style.display = 'none';
                        }}
                      />
                    </div>
                  )}
                </div>
              ) : (
                <ImageUpload
                  onImageSelect={handleImageSelect}
                  currentImage={formData.imagen}
                />
              )}
              {errors.imagen && <p className="text-red-500 text-sm mt-1">{errors.imagen}</p>}
            </div>

            {/* Botones */}
            <div className="flex gap-3 pt-4">
              <button
                type="button"
                onClick={onClose}
                className="flex-1 px-4 py-2 rounded-lg bg-white text-[#783719] ring-1 ring-[#783719]/20 hover:bg-[#783719]/10 transition"
              >
                Cancelar
              </button>
              <button
                type="submit"
                className="flex-1 px-4 py-2 rounded-lg bg-[#783719] text-[#F8EDD6] hover:bg-[#5f2c12] transition shadow"
              >
                {mode === 'edit' ? 'Actualizar' : 'Agregar'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}