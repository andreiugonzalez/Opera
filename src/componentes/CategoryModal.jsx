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
    let processedValue = value;
    if (name === 'name') {
      // Limitar nombre de categoría a 35 caracteres
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

  const validateForm = () => {
    const newErrors = {};
    
    if (!formData.name.trim()) {
      newErrors.name = 'El nombre de la categoría es requerido';
    } else if (formData.name.trim().length < 2) {
      newErrors.name = 'El nombre debe tener al menos 2 caracteres';
    } else if (formData.name.trim().length > 35) {
      newErrors.name = 'El nombre no puede superar 35 caracteres';
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
    <div className="fixed inset-0 z-[1000] bg-black/40 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-[#F8EDD6] rounded-2xl w-[92vw] sm:w-[520px] md:w-[640px] h-[640px] max-h-[80vh] mx-4 shadow-2xl ring-1 ring-[#783719]/20 overflow-hidden flex flex-col">
        <div className="px-6 py-4 bg-[#783719] text-[#F8EDD6] flex items-center justify-between">
          <h2 className="text-xl font-semibold">Gestionar Categorías</h2>
          <button
            onClick={onClose}
            className="text-[#F8EDD6]/80 hover:text-white transition text-xl"
            disabled={isSubmitting}
          >
            ×
          </button>
        </div>

        {/* Pestañas */}
        <div className="flex mb-6 border-b border-[#783719]/20">
          <button
            onClick={() => setView('add')}
            className={`flex-1 py-2 px-4 text-sm font-medium transition ${
              view === 'add'
                ? 'border-b-2 border-[#EBC07A] text-[#783719]'
                : 'text-[#452216]/70 hover:text-[#452216]'
            }`}
            disabled={isSubmitting}
          >
            Agregar
          </button>
          <button
            onClick={() => setView('delete')}
            className={`flex-1 py-2 px-4 text-sm font-medium transition ${
              view === 'delete'
                ? 'border-b-2 border-red-500 text-red-700'
                : 'text-[#452216]/70 hover:text-[#452216]'
            }`}
            disabled={isSubmitting}
          >
            Eliminar
          </button>
        </div>

        {/* Vista de Agregar */}
        {view === 'add' && (
          <form onSubmit={handleSubmit} className="space-y-5 px-6 pb-6 flex-1 overflow-auto">
            <div>
              <label htmlFor="name" className="block text-sm font-medium text-[#783719] mb-1">
                Nombre de la Categoría *
              </label>
              <input
                type="text"
                id="name"
                name="name"
                value={formData.name}
                onChange={handleInputChange}
                maxLength={35}
                className={`w-full px-3 py-2 rounded-xl border focus:outline-none focus:ring-2 focus:ring-[#EBC07A] bg-white/80 text-[#452216] shadow-sm ${
                  errors.name ? 'border-red-500' : 'border-[#783719]/30'
                }`}
                placeholder="Ej: Bebidas, Postres, etc."
                disabled={isSubmitting}
              />
              {errors.name && (
                <p className="text-red-500 text-sm mt-1">{errors.name}</p>
              )}
            </div>

            <div>
              <label htmlFor="description" className="block text-sm font-medium text-[#783719] mb-1">
                Descripción (opcional)
              </label>
              <textarea
                id="description"
                name="description"
                value={formData.description}
                onChange={handleInputChange}
                rows="3"
                className="w-full px-3 py-2 rounded-xl border border-[#783719]/30 bg-white/80 focus:outline-none focus:ring-2 focus:ring-[#EBC07A] text-[#452216] shadow-sm"
                placeholder="Descripción de la categoría..."
                disabled={isSubmitting}
              />
            </div>

            <div className="flex gap-3 pt-4">
              <button
                type="button"
                onClick={onClose}
                className="flex-1 px-4 py-2 rounded-lg bg-white text-[#783719] ring-1 ring-[#783719]/20 hover:bg-[#783719]/10 transition"
                disabled={isSubmitting}
              >
                Cancelar
              </button>
              <button
                type="submit"
                className="flex-1 px-4 py-2 rounded-lg bg-[#783719] text-[#F8EDD6] hover:bg-[#5f2c12] transition shadow disabled:opacity-50 disabled:cursor-not-allowed"
                disabled={isSubmitting}
              >
                {isSubmitting ? 'Agregando...' : 'Agregar Categoría'}
              </button>
            </div>
          </form>
        )}

        {/* Vista de Eliminar */}
        {view === 'delete' && !showConfirmation && (
          <div className="space-y-4 px-6 pb-6 flex-1 overflow-auto">
            <p className="text-sm text-gray-600 mb-4">
              Selecciona una categoría para eliminar. No se pueden eliminar categorías que tengan productos asociados.
            </p>
            
            <div className="space-y-2 max-h-60 overflow-y-auto">
              {categories.filter(cat => cat.id !== 'todos').map((category) => (
                <div
                  key={category.id}
                  className="flex items-center justify-between p-3 border border-[#783719]/20 rounded-xl hover:bg-white/60 transition"
                >
                  <div>
                    <h3 className="font-medium text-[#452216]">{category.name}</h3>
                    {category.description && (
                      <p className="text-sm text-[#452216]/70">{category.description}</p>
                    )}
                  </div>
                  <button
                    onClick={() => handleDeleteClick(category)}
                    className="px-3 py-1 bg-red-600 text-white text-sm rounded hover:bg-red-700 transition"
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
                className="px-4 py-2 rounded-lg bg-white text-[#783719] ring-1 ring-[#783719]/20 hover:bg-[#783719]/10 transition"
                disabled={isSubmitting}
              >
                Cerrar
              </button>
            </div>
          </div>
        )}

        {/* Confirmación de eliminación */}
        {view === 'delete' && showConfirmation && (
          <div className="space-y-4 px-6 pb-6 flex-1 overflow-auto">
            <div className="text-center">
              <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-red-100 mb-4">
                <svg className="h-6 w-6 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.732-.833-2.5 0L4.268 19.5c-.77.833.192 2.5 1.732 2.5z" />
                </svg>
              </div>
              <h3 className="text-lg font-medium text-[#452216] mb-2">
                ¿Confirmar eliminación?
              </h3>
              <p className="text-sm text-[#452216]/70 mb-4">
                ¿Estás seguro de que deseas eliminar la categoría "{categoryToDelete?.name || categoryToDelete}"? 
                Esta acción no se puede deshacer.
              </p>
            </div>

            <div className="flex gap-3">
              <button
                onClick={handleCancelDelete}
                className="flex-1 px-4 py-2 rounded-lg bg-white text-[#783719] ring-1 ring-[#783719]/20 hover:bg-[#783719]/10 transition"
                disabled={isSubmitting}
              >
                Cancelar
              </button>
              <button
                onClick={handleConfirmDelete}
                className="flex-1 px-4 py-2 rounded-lg bg-red-600 text-white hover:bg-red-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
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