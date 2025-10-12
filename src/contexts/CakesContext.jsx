import { createContext, useContext, useEffect, useState } from 'react';

const CakesContext = createContext();

export const useCakes = () => {
  const ctx = useContext(CakesContext);
  if (!ctx) throw new Error('useCakes debe usarse dentro de CakesProvider');
  return ctx;
};

const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL || '/api';

export const CakesProvider = ({ children }) => {
  const [cakes, setCakes] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const loadCakes = async () => {
    try {
      setLoading(true);
      const resp = await fetch(`${API_BASE_URL}/cakes`, { credentials: 'include' });
      const data = await resp.json();
      if (!resp.ok) throw new Error(data.error || 'Error al cargar tortas');
      setCakes(data.data || []);
    } catch (e) {
      console.error('Error cargando tortas:', e);
      setError(e.message);
    } finally {
      setLoading(false);
    }
  };

  const editCake = async (id, { name, image_url, is_active, price, imageFile }) => {
    let resp;
    const token = localStorage.getItem('opera_token');
    if (imageFile) {
      const form = new FormData();
      if (name !== undefined) form.append('name', name);
      if (is_active !== undefined) form.append('is_active', String(is_active));
      if (price !== undefined) form.append('price', String(price));
      form.append('image', imageFile);
      if (image_url) form.append('image_url', image_url);
      resp = await fetch(`${API_BASE_URL}/cakes/${id}`, {
        method: 'PUT',
        headers: {
          ...(token ? { 'Authorization': `Bearer ${token}` } : {})
        },
        credentials: 'include',
        body: form
      });
    } else {
      resp = await fetch(`${API_BASE_URL}/cakes/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', ...(token ? { 'Authorization': `Bearer ${token}` } : {}) },
        credentials: 'include',
        body: JSON.stringify({ name, image_url, is_active, price })
      });
    }
    const data = await resp.json();
    if (!resp.ok) {
      if (resp.status === 401) {
        throw new Error('Sesión requerida: inicia sesión nuevamente para actualizar tortas.');
      }
      if (resp.status === 403) {
        throw new Error('Permisos insuficientes: solo administradores pueden actualizar tortas.');
      }
      throw new Error(data.error || 'Error al actualizar torta');
    }
    const updated = data.data;
    setCakes(prev => prev.map(c => (c.id === updated.id ? updated : c)));
    return updated;
  };

  const addCake = async ({ name, image_url, price, imageFile }) => {
    let resp;
    const token = localStorage.getItem('opera_token');
    if (imageFile) {
      const form = new FormData();
      form.append('name', name);
      if (price !== undefined) form.append('price', String(price));
      form.append('image', imageFile);
      if (image_url) form.append('image_url', image_url);
      resp = await fetch(`${API_BASE_URL}/cakes`, {
        method: 'POST',
        headers: {
          ...(token ? { 'Authorization': `Bearer ${token}` } : {})
        },
        credentials: 'include',
        body: form
      });
    } else {
      resp = await fetch(`${API_BASE_URL}/cakes`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', ...(token ? { 'Authorization': `Bearer ${token}` } : {}) },
        credentials: 'include',
        body: JSON.stringify({ name, image_url, price })
      });
    }
    const data = await resp.json();
    if (!resp.ok) {
      if (resp.status === 401) {
        throw new Error('Sesión requerida: inicia sesión como administrador para crear tortas.');
      }
      if (resp.status === 403) {
        throw new Error('Permisos insuficientes: tu cuenta no tiene rol administrador.');
      }
      throw new Error(data.error || 'Error al crear torta');
    }
    setCakes(prev => [data.data, ...prev]);
    return data.data;
  };

  const deleteCake = async (id) => {
    const token = localStorage.getItem('opera_token');
    const resp = await fetch(`${API_BASE_URL}/cakes/${id}`, {
      method: 'DELETE',
      headers: {
        ...(token ? { 'Authorization': `Bearer ${token}` } : {})
      },
      credentials: 'include'
    });
    const data = await resp.json();
    if (!resp.ok) {
      if (resp.status === 401) {
        throw new Error('Sesión requerida: inicia sesión para eliminar tortas.');
      }
      if (resp.status === 403) {
        throw new Error('Permisos insuficientes: requiere rol administrador.');
      }
      throw new Error(data.error || 'Error al eliminar torta');
    }
    setCakes(prev => prev.filter(c => c.id !== id));
  };

  useEffect(() => { loadCakes(); }, []);

  return (
    <CakesContext.Provider value={{ cakes, loading, error, loadCakes, addCake, editCake, deleteCake }}>
      {children}
    </CakesContext.Provider>
  );
};