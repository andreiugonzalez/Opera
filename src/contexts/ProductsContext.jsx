import { createContext, useContext, useState, useEffect } from 'react';

const ProductsContext = createContext();

export const useProducts = () => {
  const context = useContext(ProductsContext);
  if (!context) {
    throw new Error('useProducts debe ser usado dentro de un ProductsProvider');
  }
  return context;
};

// URL base de la API (configurable por entorno)
const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL || '/api';

export const ProductsProvider = ({ children }) => {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState(["Todos"]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [notification, setNotification] = useState(null);

  // Cargar productos y categorías desde la API
  useEffect(() => {
    loadProducts();
    loadCategories();
  }, []);

  const loadProducts = async () => {
    try {
      setLoading(true);
      const response = await fetch(`${API_BASE_URL}/products`, { credentials: 'include' });
      if (!response.ok) {
        throw new Error('Error al cargar productos');
      }
      const data = await response.json();
      setProducts(data.data || data);
      setError(null);
    } catch (err) {
      console.error('Error cargando productos:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const loadCategories = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/products/categories/all`, { credentials: 'include' });
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const data = await response.json();
      setCategories([{ id: 'todos', name: 'Todos' }, ...data.data]);
    } catch (error) {
      console.error('Error cargando categorías:', error);
      setError(error.message);
      // Fallback a categorías por defecto
      setCategories([
        { id: 'todos', name: 'Todos' },
        { id: 'pasteles', name: 'Pasteles' },
        { id: 'tortas', name: 'Tortas' },
        { id: 'panes', name: 'Panes' },
        { id: 'dulces', name: 'Dulces' }
      ]);
    }
  };

  // Agregar producto
  const addProduct = async (productData) => {
    try {
      const token = localStorage.getItem('opera_token');
      const response = await fetch(`${API_BASE_URL}/products`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { 'Authorization': `Bearer ${token}` } : {})
        },
        credentials: 'include',
        body: JSON.stringify(productData),
      });
      
      if (!response.ok) {
        throw new Error('Error al agregar producto');
      }
      
      const result = await response.json();
      const newProduct = result.data || result;
      setProducts(prev => [...prev, newProduct]);
      showNotification('Producto agregado exitosamente', 'success');
      return newProduct;
    } catch (err) {
      console.error('Error agregando producto:', err);
      throw err;
    }
  };

  // Editar producto
  const editProduct = async (id, productData) => {
    try {
      console.log('🔄 Editando producto:', { id, productData });
      const token = localStorage.getItem('opera_token');
      
      const response = await fetch(`${API_BASE_URL}/products/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { 'Authorization': `Bearer ${token}` } : {})
        },
        credentials: 'include',
        body: JSON.stringify(productData),
      });
      
      console.log('📡 Respuesta del servidor:', response.status);
      
      if (!response.ok) {
        const errorText = await response.text();
        console.error('❌ Error en respuesta:', errorText);
        throw new Error('Error al editar producto');
      }
      
      const result = await response.json();
      console.log('✅ Resultado del servidor:', result);
      
      const updatedProduct = result.data || result;
      console.log('🔄 Producto actualizado:', updatedProduct);
      
      setProducts(prev => {
        const newProducts = prev.map(product => 
          product.id === parseInt(id) ? updatedProduct : product
        );
        console.log('📦 Lista de productos actualizada');
        return newProducts;
      });
      
      showNotification('Producto modificado exitosamente', 'success');
      return updatedProduct;
    } catch (err) {
      console.error('Error editando producto:', err);
      throw err;
    }
  };

  // Eliminar producto
  const deleteProduct = async (id) => {
    try {
      // Primero hacer la petición al servidor
      const token = localStorage.getItem('opera_token');
      const response = await fetch(`${API_BASE_URL}/products/${id}`, {
        method: 'DELETE',
        headers: {
          ...(token ? { 'Authorization': `Bearer ${token}` } : {})
        },
        credentials: 'include'
      });
      
      if (!response.ok) {
        throw new Error('Error al eliminar producto');
      }
      
      // Solo actualizar el estado local si la operación en el servidor fue exitosa
      setProducts(prev => prev.filter(product => product.id !== id));
      showNotification('Producto eliminado exitosamente', 'success');
      return true;
    } catch (err) {
      console.error('Error eliminando producto:', err);
      throw err;
    }
  };

  // Obtener producto por ID
  const getProductById = (id) => {
    return products.find(product => product.id === parseInt(id));
  };

  // Filtrar productos por categoría
  const getProductsByCategory = (category) => {
    if (category === "Todos") {
      return products;
    }
    return products.filter(product => product.category_name === category);
  };

  // Agregar categoría
  const addCategory = async (categoryData) => {
    try {
      const token = localStorage.getItem('opera_token');
      const response = await fetch(`${API_BASE_URL}/products/categories`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { 'Authorization': `Bearer ${token}` } : {})
        },
        credentials: 'include',
        body: JSON.stringify(categoryData),
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Error al agregar categoría');
      }
      
      const result = await response.json();
      const newCategory = result.data;
      
      // Recargar todas las categorías para asegurar sincronización
      await loadCategories();
      showNotification('Categoría agregada exitosamente', 'success');
      
      return newCategory;
    } catch (err) {
      console.error('Error agregando categoría:', err);
      throw err;
    }
  };

  const deleteCategory = async (categoryId) => {
    try {
      const url = `${API_BASE_URL}/products/categories/${categoryId}`;
      console.log('🔍 URL completa:', url);
      const token = localStorage.getItem('opera_token');
      const response = await fetch(url, {
        method: 'DELETE',
        headers: {
          ...(token ? { 'Authorization': `Bearer ${token}` } : {})
        },
        credentials: 'include'
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || 'Error al eliminar categoría');
      }

      // Recargar las categorías para actualizar los filtros
      await loadCategories();
      showNotification('Categoría eliminada exitosamente', 'success');
      
      return result;
    } catch (error) {
      console.error('Error al eliminar categoría:', error);
      throw error;
    }
  };

  // Función para mostrar notificaciones
  const showNotification = (message, type = 'success') => {
    setNotification({ message, type });
    // Auto-ocultar después de 3 segundos
    setTimeout(() => {
      setNotification(null);
    }, 3000);
  };

  // Función para ocultar notificación manualmente
  const hideNotification = () => {
    setNotification(null);
  };

  const value = {
    products,
    categories,
    loading,
    error,
    notification,
    showNotification,
    hideNotification,
    addProduct,
    editProduct,
    deleteProduct,
    getProductById,
    getProductsByCategory,
    loadProducts,
    addCategory,
    deleteCategory
  };

  return (
    <ProductsContext.Provider value={value}>
      {children}
    </ProductsContext.Provider>
  );
};