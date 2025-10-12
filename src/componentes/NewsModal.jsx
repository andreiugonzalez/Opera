import { useState } from 'react';
import { useNews } from '../contexts/NewsContext';
import { useProducts } from '../contexts/ProductsContext';

export default function NewsModal({ open, onClose }) {
  const { publishNewsItems } = useNews();
  const { showNotification } = useProducts();
  const [text, setText] = useState('');
  const [items, setItems] = useState([]); // Lista de noticias a enviar (máx 5)
  const [sending, setSending] = useState(false);

  if (!open) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    // Construir lista final: incluir el texto actual si no fue agregado aún
    let toSend = [...items];
    if (text.trim()) {
      toSend.push(text.trim());
    }
    // Limitar a máximo 5
    toSend = toSend
      .map(t => t.trim())
      .filter(t => t.length > 0)
      .slice(0, 5);
    if (toSend.length === 0) {
      showNotification('Agrega al menos una noticia', 'error');
      return;
    }
    setSending(true);
    try {
      // Por ahora persistencia local; futuro: POST a backend
      publishNewsItems(toSend);
      showNotification('Enviado correctamente a los clientes', 'success');
      setTimeout(() => {
        onClose();
        setText('');
        setItems([]);
        setSending(false);
      }, 300);
    } catch (err) {
      showNotification('No se pudo enviar la noticia', 'error');
      setSending(false);
    }
  };

  const addItem = () => {
    const v = text.trim();
    if (!v) {
      showNotification('Escribe la descripción de la noticia', 'error');
      return;
    }
    if (items.length >= 5) {
      showNotification('Máximo 5 noticias', 'error');
      return;
    }
    setItems(prev => [...prev, v]);
    setText('');
  };

  const removeItem = (idx) => {
    setItems(prev => prev.filter((_, i) => i !== idx));
  };

  return (
    <div className="fixed inset-0 z-[1000] bg-black/40 backdrop-blur-sm flex items-center justify-center animate-fadeIn">
      <div className="w-[22rem] md:w-[28rem] max-h-[80vh] bg-[#F8EDD6] rounded-2xl shadow-2xl ring-1 ring-[#783719]/20 overflow-hidden flex flex-col">
        <div className="px-5 py-4 bg-[#783719] text-[#F8EDD6] flex items-center justify-between">
          <h3 className="text-lg font-semibold">Añadir noticia</h3>
          <button onClick={onClose} className="text-[#F8EDD6]/80 hover:text-white transition" aria-label="Cerrar">
            <svg className="w-5 h-5" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" /></svg>
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-5 flex-1 flex flex-col overflow-auto">
          <label className="block text-[#783719] font-medium mb-2">Noticias a mostrar</label>
          <div className="space-y-3">
            <textarea
              value={text}
              onChange={(e) => setText(e.target.value)}
              rows={4}
              className="w-full rounded-xl border border-[#783719]/30 bg-white/80 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#EBC07A] p-3 text-[#452216] shadow-sm resize-none min-h-[6rem]"
              placeholder="Escribe la descripción de la noticia..."
            />
            <div className="flex justify-between items-center">
              <p className="text-xs text-[#783719]/70">Puedes añadir hasta 5 noticias.</p>
              <button
                type="button"
                onClick={addItem}
                disabled={items.length >= 5}
                className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-gradient-to-r from-[#EBC07A] to-[#D89B4F] text-[#452216] font-medium shadow hover:shadow-md hover:brightness-105 disabled:opacity-50 disabled:cursor-not-allowed transition"
              >
                <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16M4 12h16"/></svg>
                Agregar noticia
              </button>
            </div>
          </div>

          {items.length > 0 && (
            <div className="mt-4">
              <div className="text-[#783719] font-semibold mb-2">Noticias añadidas ({items.length}/5)</div>
              <ol className="space-y-2">
                {items.map((it, idx) => (
                  <li key={idx} className="flex items-start gap-2 p-2 rounded-lg bg-white/80 border border-[#783719]/10">
                    <span className="min-w-[1.5rem] h-6 px-2 rounded-full bg-[#783719] text-[#F8EDD6] text-sm flex items-center justify-center shadow">{idx + 1}</span>
                    <p className="flex-1 text-[#452216] leading-relaxed">{it}</p>
                    <button
                      type="button"
                      onClick={() => removeItem(idx)}
                      className="text-[#783719]/70 hover:text-[#783719] transition"
                      aria-label={`Eliminar noticia ${idx + 1}`}
                    >
                      <svg className="w-5 h-5" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd"/></svg>
                    </button>
                  </li>
                ))}
              </ol>
            </div>
          )}

          <div className="mt-6 flex justify-end space-x-3">
            <button type="button" onClick={onClose} className="px-4 py-2 rounded-lg bg-white text-[#783719] ring-1 ring-[#783719]/20 hover:bg-[#783719]/10 transition">
              Cancelar
            </button>
            <button type="submit" disabled={sending} className="px-4 py-2 rounded-lg bg-[#783719] text-[#F8EDD6] hover:bg-[#5f2c12] transition shadow">
              {sending ? 'Enviando...' : 'Enviar'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}