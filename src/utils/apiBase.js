// Utilidad para obtener y sanear la base de la API
const raw = typeof import.meta !== 'undefined' && import.meta.env && import.meta.env.VITE_API_BASE_URL ? String(import.meta.env.VITE_API_BASE_URL) : '';

function stripQuotes(str) {
  const s = str.trim();
  if ((s.startsWith('"') && s.endsWith('"')) || (s.startsWith("'") && s.endsWith("'"))) {
    return s.slice(1, -1).trim();
  }
  return s;
}

function normalizeBase(str) {
  let base = stripQuotes(str || '');
  if (!base || base.toLowerCase() === 'null' || base.toLowerCase() === 'undefined') {
    base = '/api';
  }
  // Quitar barras finales para evitar // al concatenar
  base = base.replace(/\/+$/, '');
  return base;
}

export const API_BASE_URL = normalizeBase(raw);

export function resolveApi(path) {
  const p = String(path || '');
  return `${API_BASE_URL}${p.startsWith('/') ? '' : '/'}${p}`;
}