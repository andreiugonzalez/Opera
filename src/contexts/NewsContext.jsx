import { createContext, useContext, useEffect, useState } from 'react';

const NewsContext = createContext();

export const useNews = () => {
  const ctx = useContext(NewsContext);
  if (!ctx) throw new Error('useNews debe usarse dentro de NewsProvider');
  return ctx;
};

export const NewsProvider = ({ children }) => {
  // Nueva estructura: lista de noticias (máx 5), manteniendo compatibilidad con newsText
  const [newsList, setNewsList] = useState([]);
  const [newsText, setNewsText] = useState('');
  const [visible, setVisible] = useState(true);
  const [lastUpdated, setLastUpdated] = useState(0);

  useEffect(() => {
    try {
      const saved = localStorage.getItem('opera_news');
      if (saved) {
        const parsed = JSON.parse(saved);
        // Migración: si existe 'items' usarlo, si sólo hay 'text', convertir a lista
        const items = Array.isArray(parsed.items)
          ? parsed.items.filter((t) => typeof t === 'string').slice(0, 5)
          : (parsed.text ? [parsed.text] : []);
        setNewsList(items);
        setNewsText(items[0] || '');
        setVisible(parsed.visible !== false);
        setLastUpdated(parsed.ts || 0);
      }
    } catch {}
  }, []);

  const saveLocalItems = (items, vis = true) => {
    const cleaned = (items || [])
      .map((t) => (typeof t === 'string' ? t.trim() : ''))
      .filter((t) => t.length > 0)
      .slice(0, 5);
    setNewsList(cleaned);
    setNewsText(cleaned[0] || '');
    setVisible(vis);
    const ts = Date.now();
    setLastUpdated(ts);
    try {
      localStorage.setItem('opera_news', JSON.stringify({ items: cleaned, visible: vis, ts }));
    } catch {}
  };

  const clearNews = () => {
    setNewsList([]);
    setNewsText('');
    setVisible(false);
    setLastUpdated(0);
    try { localStorage.removeItem('opera_news'); } catch {}
  };

  const value = {
    // Estados
    newsList,
    newsText, // compatibilidad: primer elemento
    visible,
    lastUpdated,
    // Setters
    setNewsList,
    setNewsText,
    setVisible,
    // Acciones
    publishNewsItems: (items) => saveLocalItems(items, true),
    publishNews: (text) => saveLocalItems([text], true), // compatibilidad
    hideNews: () => setVisible(false),
    showNews: () => setVisible(true),
    clearNews,
  };

  return (
    <NewsContext.Provider value={value}>
      {children}
    </NewsContext.Provider>
  );
};

export default NewsContext;