import { useState, useEffect } from 'react';
import { useProducts } from '../contexts/ProductsContext';

export default function CategoryModal({ isOpen, onClose }) {
  const { addCategory, deleteCategory, categories } = useProducts();
  const [formData, setFormData] = useState({
    name: '',
    description: ''
  });
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [view, setView] = useState('add'); // 'add' o 'delete'
  const [categoryToDelete, setCategoryToDelete] = useState(null);
  const [showConfirmation, setShowConfirmation] = useState(false);

  // Limpiar formulario cuando se abre el modal
  useEffect(() => {
    if (isOpen) {
      setFormData({
        name: '',
        description: ''
      });
      setErrors({});
      setIsSubmitting(false);
      setView('add');
      setCategoryToDelete(null);
      setShowConfirmation(false);
    }
  }, [isOpen]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    // Limpiar error del campo cuando el usuario empiece a escribir
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  const validateForm = () => {
    const newErrors = {};
    
    if (!formData.name.trim()) {
      newErrors.name = 'El nombre de la categoría es requerido';
    } else if (formData.name.trim().length < 2) {
      newErrors.name = 'El nombre debe tener al menos 2 caracteres';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);
    
    try {
      await addCategory({
        name: formData.name.trim(),
        description: formData.description.trim()
      });
      
      // Cerrar modal y mostrar mensaje de éxito
      onClose();
      alert('Categoría agregada exitosamente');
    } catch (error) {
      console.error('Error al agregar categoría:', error);
      alert(error.message || 'Error al agregar la categoría');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteClick = (category) => {
    setCategoryToDelete(category);
    setShowConfirmation(true);
  };

  const handleConfirmDelete = async () => {
    if (!categoryToDelete) return;

    setIsSubmitting(true);
    
    try {
      await deleteCategory(categoryToDelete.id);
      
      // Cerrar modal y mostrar mensaje de éxito
      onClose();
      alert('Categoría eliminada exitosamente');
    } catch (error) {
      console.error('Error al eliminar categoría:', error);
      alert(error.message || 'Error al eliminar la categoría');
    } finally {
      setIsSubmitting(false);
      setShowConfirmation(false);
      setCategoryToDelete(null);
    }
  };

  const handleCancelDelete = () => {
    setShowConfirmation(false);
    setCategoryToDelete(null);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-md mx-4">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold text-gray-800">Gestionar Categorías</h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 text-2xl"
            disabled={isSubmitting}
          >
            ×
          </button>
        </div>

        {/* Pestañas */}
        <div className="flex mb-6 border-b">
          <button
            onClick={() => setView('add')}
            className={`flex-1 py-2 px-4 text-sm font-medium ${
              view === 'add'
                ? 'border-b-2 border-blue-500 text-blue-600'
                : 'text-gray-500 hover:text-gray-700'
            }`}
            disabled={isSubmitting}
          >
            Agregar
          </button>
          <button
            onClick={() => setView('delete')}
            className={`flex-1 py-2 px-4 text-sm font-medium ${
              view === 'delete'
                ? 'border-b-2 border-red-500 text-red-600'
                : 'text-gray-500 hover:text-gray-700'
            }`}
            disabled={isSubmitting}
          >
            Eliminar
          </button>
        </div>

        {/* Vista de Agregar */}
        {view === 'add' && (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
                Nombre de la Categoría *
              </label>
              <input
                type="text"
                id="name"
                name="name"
                value={formData.name}
                onChange={handleInputChange}
                className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                  errors.name ? 'border-red-500' : 'border-gray-300'
                }`}
                placeholder="Ej: Bebidas, Postres, etc."
                disabled={isSubmitting}
              />
              {errors.name && (
                <p className="text-red-500 text-sm mt-1">{errors.name}</p>
              )}
            </div>

            <div>
              <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">
                Descripción (opcional)
              </label>
              <textarea
                id="description"
                name="description"
                value={formData.description}
                onChange={handleInputChange}
                rows="3"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Descripción de la categoría..."
                disabled={isSubmitting}
              />
            </div>

            <div className="flex gap-3 pt-4">
              <button
                type="button"
                onClick={onClose}
                className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 transition-colors"
                disabled={isSubmitting}
              >
                Cancelar
              </button>
              <button
                type="submit"
                className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                disabled={isSubmitting}
              >
                {isSubmitting ? 'Agregando...' : 'Agregar Categoría'}
              </button>
            </div>
          </form>
        )}

        {/* Vista de Eliminar */}
        {view === 'delete' && !showConfirmation && (
          <div className="space-y-4">
            <p className="text-sm text-gray-600 mb-4">
              Selecciona una categoría para eliminar. No se pueden eliminar categorías que tengan productos asociados.
            </p>
            
            <div className="space-y-2 max-h-60 overflow-y-auto">
              {categories.filter(cat => cat.id !== 'todos').map((category) => (
                <div
                  key={category.id}
                  className="flex items-center justify-between p-3 border border-gray-200 rounded-md hover:bg-gray-50"
                >
                  <div>
                    <h3 className="font-medium text-gray-800">{category.name}</h3>
                    {category.description && (
                      <p className="text-sm text-gray-500">{category.description}</p>
                    )}
                  </div>
                  <button
                    onClick={() => handleDeleteClick(category)}
                    className="px-3 py-1 bg-red-600 text-white text-sm rounded hover:bg-red-700 transition-colors"
                    disabled={isSubmitting}
                  >
                    Eliminar
                  </button>
                </div>
              ))}
            </div>

            <div className="flex justify-end pt-4">
              <button
                onClick={onClose}
                className="px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 transition-colors"
                disabled={isSubmitting}
              >
                Cerrar
              </button>
            </div>
          </div>
        )}

        {/* Confirmación de eliminación */}
        {view === 'delete' && showConfirmation && (
          <div className="space-y-4">
            <div className="text-center">
              <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-red-100 mb-4">
                <svg className="h-6 w-6 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.732-.833-2.5 0L4.268 19.5c-.77.833.192 2.5 1.732 2.5z" />
                </svg>
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                ¿Confirmar eliminación?
              </h3>
              <p className="text-sm text-gray-500 mb-4">
                ¿Estás seguro de que deseas eliminar la categoría "{categoryToDelete?.name || categoryToDelete}"? 
                Esta acción no se puede deshacer.
              </p>
            </div>

            <div className="flex gap-3">
              <button
                onClick={handleCancelDelete}
                className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 transition-colors"
                disabled={isSubmitting}
              >
                Cancelar
              </button>
              <button
                onClick={handleConfirmDelete}
                className="flex-1 px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                disabled={isSubmitting}
              >
                {isSubmitting ? 'Eliminando...' : 'Eliminar'}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}