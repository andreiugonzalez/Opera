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
      processedValue = sanitizePriceDigits(value);
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
    }

    if (!formData.ingredientes.trim()) {
      newErrors.ingredientes = 'Los ingredientes son requeridos';
    }

    const cleanPrice = parseChileanPrice(formData.precio);
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
      price: parseChileanPrice(formData.precio),
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
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl max-w-md w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold text-amber-700">
              {mode === 'edit' ? 'Editar Producto' : 'Agregar Producto'}
            </h2>
            <button
              onClick={onClose}
              className="text-gray-500 hover:text-gray-700 text-2xl"
            >
              ×
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Título */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Título *
              </label>
              <input
                type="text"
                name="titulo"
                value={formData.titulo}
                onChange={handleInputChange}
                className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-amber-500 ${
                  errors.titulo ? 'border-red-500' : 'border-gray-300'
                }`}
                placeholder="Nombre del producto"
              />
              {errors.titulo && <p className="text-red-500 text-sm mt-1">{errors.titulo}</p>}
            </div>

            {/* Categoría */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Categoría *
              </label>
              <select
                name="categoria"
                value={formData.categoria}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-amber-500"
              >
                {categories.filter(cat => cat.id !== 'todos').map(category => (
                  <option key={category.id} value={category.name}>{category.name}</option>
                ))}
              </select>
            </div>

            {/* Ingredientes */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Ingredientes *
              </label>
              <textarea
                name="ingredientes"
                value={formData.ingredientes}
                onChange={handleInputChange}
                rows={3}
                className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-amber-500 ${
                  errors.ingredientes ? 'border-red-500' : 'border-gray-300'
                }`}
                placeholder="Lista de ingredientes separados por comas"
              />
              {errors.ingredientes && <p className="text-red-500 text-sm mt-1">{errors.ingredientes}</p>}
            </div>

            {/* Precio */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Precio (CLP) *
              </label>
              <input
                type="text"
                inputMode="numeric"
                name="precio"
                value={formData.precio}
                onChange={handleInputChange}
                onBlur={(e) => setFormData(prev => ({ ...prev, precio: formatChileanPrice(sanitizePriceDigits(e.target.value)) }))}
                onFocus={(e) => setFormData(prev => ({ ...prev, precio: sanitizePriceDigits(e.target.value) }))}
                className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-amber-500 ${
                  errors.precio ? 'border-red-500' : 'border-gray-300'
                }`}
                placeholder="Ej: 24990"
              />
              {errors.precio && <p className="text-red-500 text-sm mt-1">{errors.precio}</p>}
            </div>

            {/* Imagen */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-3">
                Imagen del producto *
              </label>
              
              {/* Selector de fuente de imagen */}
              <div className="mb-4">
                <div className="flex gap-4">
                  <label className="flex items-center">
                    <input
                      type="radio"
                      name="imageSource"
                      checked={!useDeviceImage}
                      onChange={() => handleImageSourceChange(false)}
                      className="mr-2"
                    />
                    <span className="text-sm">URL de imagen</span>
                  </label>
                  <label className="flex items-center">
                    <input
                      type="radio"
                      name="imageSource"
                      checked={useDeviceImage}
                      onChange={() => handleImageSourceChange(true)}
                      className="mr-2"
                    />
                    <span className="text-sm">Subir desde dispositivo</span>
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
                    className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-amber-500 ${
                      errors.imagen ? 'border-red-500' : 'border-gray-300'
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
                className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 transition-colors"
              >
                Cancelar
              </button>
              <button
                type="submit"
                className="flex-1 px-4 py-2 bg-amber-600 text-white rounded-md hover:bg-amber-700 transition-colors"
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