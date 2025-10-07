import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import { useCakes } from "../contexts/CakesContext.jsx";
import AdminIndicator from "../componentes/AdminIndicator";
import { formatChileanPrice, formatPriceInput, parseChileanPrice, sanitizePriceDigits } from "../utils/priceUtils";
// Eliminado uso de imágenes base locales: ahora solo se muestran tortas desde DB

export default function PaginaPedido() {
  const { isAdmin } = useAuth();
  const { cakes, loading: cakesLoading, error: cakesError, addCake, editCake, deleteCake } = useCakes?.() || { cakes: [], loading: false, error: null, addCake: async () => {}, editCake: async () => {}, deleteCake: async () => {} };
  const [showCakesTable, setShowCakesTable] = useState(false);
  const [step, setStep] = useState(1);
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [extraItems, setExtraItems] = useState([]);
  const items = [...extraItems];
  const [selectedImage, setSelectedImage] = useState(items[0]?.src || '');
  const [selectedTitle, setSelectedTitle] = useState(items[0]?.title || '');
  const [selectedPrice, setSelectedPrice] = useState(items[0]?.price || 0);
  const [transitionDir, setTransitionDir] = useState(null);
  const [nombreCompleto, setNombreCompleto] = useState("");
  const [telefono, setTelefono] = useState("");
  const [fechaHora, setFechaHora] = useState("");
  const [fechaDia, setFechaDia] = useState("");
  const [horaDia, setHoraDia] = useState("");
  const [aNombreDe, setANombreDe] = useState("");
  const [centimetros, setCentimetros] = useState("");
  const [cantidadTorta, setCantidadTorta] = useState("1");
  const [pickupAck, setPickupAck] = useState(false);
  const [depositAck, setDepositAck] = useState(false);
  const [campoExtra, setCampoExtra] = useState("");
  const [showPreview, setShowPreview] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);
  const [newCakeName, setNewCakeName] = useState("");
  const [newCakeFile, setNewCakeFile] = useState(null);
  const [newCakePrice, setNewCakePrice] = useState('');
  const [newCakePreview, setNewCakePreview] = useState("");
  const [newCakeError, setNewCakeError] = useState("");
  const [editCakeModal, setEditCakeModal] = useState({ open: false, id: null, name: '', image_url: '' });
  // Filtros y orden de tortas disponibles
  const [cakeSearch, setCakeSearch] = useState('');
  const [cakeSortBy, setCakeSortBy] = useState('created_desc'); // created_desc | created_asc | name_asc | name_desc | price_asc | price_desc

  // Sanitización y validaciones de entradas
  const sanitizeText = (str) => str.replace(/[^A-Za-zÁÉÍÓÚáéíóúÑñÜü' \-]/g, '').replace(/\s{2,}/g, ' ').trimStart();
  const sanitizePhone = (str) => str.replace(/\D/g, '').slice(0, 12);

  const handleNombreCompletoChange = (e) => {
    const value = sanitizeText(e.target.value);
    setNombreCompleto(value);
  };

  const handleANombreDeChange = (e) => {
    const value = sanitizeText(e.target.value);
    setANombreDe(value);
  };

  const handleTelefonoChange = (e) => {
    const value = sanitizePhone(e.target.value);
    setTelefono(value);
  };

  const handleCampoExtraChange = (e) => {
    setCampoExtra(e.target.value);
  };

  const navigate = useNavigate();

  useEffect(() => {
    if (!items.length) {
      setSelectedImage('');
      setSelectedTitle('');
      setSelectedPrice(0);
      return;
    }
    const idx = Math.max(0, Math.min(selectedIndex, items.length - 1));
    setSelectedIndex(idx);
    setSelectedImage(items[idx].src);
    setSelectedTitle(items[idx].title);
    setSelectedPrice(items[idx]?.price || 0);
  }, [selectedIndex, items.length]);

  useEffect(() => {
    if (transitionDir) {
      const t = setTimeout(() => setTransitionDir(null), 350);
      return () => clearTimeout(t);
    }
  }, [selectedIndex, transitionDir]);

  const whatsappNumber = "56986193142"; // Número real actualizado

  const openPreview = () => setShowPreview(true);
  const closePreview = () => setShowPreview(false);

  const openAddModal = () => {
    setNewCakeName("");
    setNewCakeFile(null);
    setNewCakePreview("");
    setNewCakeError("");
    setNewCakePrice('');
    setShowAddModal(true);
  };
  const closeAddModal = () => setShowAddModal(false);

  const handleNewCakeFileChange = (e) => {
    const file = e.target.files?.[0] || null;
    setNewCakeFile(file);
    setNewCakeError("");
    if (file) {
      const url = URL.createObjectURL(file);
      setNewCakePreview(url);
    } else {
      setNewCakePreview("");
    }
  };

  // Mapear tortas cargadas desde la API al carrusel
  useEffect(() => {
    const mapped = (cakesLoading
      ? []
      : (cakes?.length ? cakes.map(c => ({ src: c.image_url, title: c.name, id: c.id, price: c.price })) : []));
    setExtraItems(mapped);
  }, [cakesLoading, cakes]);

  // Lista de tortas para tabla con filtro y orden
  const filteredSortedCakes = useMemo(() => {
    const base = (cakesLoading ? [] : (cakes?.length ? cakes.map(c => ({ src: c.image_url, title: c.name, id: c.id, price: c.price, created_at: c.created_at })) : []));
    const term = cakeSearch.trim().toLowerCase();
    const filtered = term ? base.filter(b => (b.title || '').toLowerCase().includes(term)) : base;
    const arr = [...filtered];
    switch (cakeSortBy) {
      case 'name_asc':
        arr.sort((a, b) => (a.title || '').localeCompare(b.title || ''));
        break;
      case 'name_desc':
        arr.sort((a, b) => (b.title || '').localeCompare(a.title || ''));
        break;
      case 'price_asc':
        arr.sort((a, b) => (Number(a.price || 0) - Number(b.price || 0)));
        break;
      case 'price_desc':
        arr.sort((a, b) => (Number(b.price || 0) - Number(a.price || 0)));
        break;
      case 'created_asc':
        arr.sort((a, b) => new Date(a.created_at || 0) - new Date(b.created_at || 0));
        break;
      case 'created_desc':
      default:
        arr.sort((a, b) => new Date(b.created_at || 0) - new Date(a.created_at || 0));
        break;
    }
    return arr;
  }, [cakesLoading, cakes, cakeSearch, cakeSortBy]);

  // Editar torta (solo admin)
  const openEditCake = (cake) => {
    // Si no tiene id, permitimos crear una torta administrada con los datos base
    setEditCakeModal({ open: true, id: cake.id || null, name: cake.title || cake.name || '', image_url: cake.src || cake.image_url || '', price: cake.price ? formatChileanPrice(cake.price) : '' });
  };
  const closeEditCake = () => setEditCakeModal({ open: false, id: null, name: '', image_url: '', price: '' });
  const handleEditCakeSubmit = async (e) => {
    e.preventDefault();
    try {
      const nameTrim = (editCakeModal.name || '').trim();
      if (!nameTrim) return;
      const payload = { name: nameTrim };
      // Validar y normalizar precio
      if (editCakeModal.price !== undefined) {
        const normalized = parseChileanPrice(sanitizePriceDigits(editCakeModal.price));
        if (!normalized || normalized <= 0) {
          alert('El precio debe ser un número mayor a 0');
          return;
        }
        payload.price = normalized;
      }
      // Si el usuario seleccionó un archivo en el input de edición, adjuntarlo
      if (editCakeModal.imageFile) {
        payload.imageFile = editCakeModal.imageFile;
      } else if (editCakeModal.image_url && /^https?:\/\//.test(editCakeModal.image_url)) {
        // Permitir actualizar image_url si es una URL válida (fallback)
        payload.image_url = editCakeModal.image_url;
      }
      if (editCakeModal.id) {
        await editCake(editCakeModal.id, payload);
      } else {
        await addCake(payload);
      }
      closeEditCake();
    } catch (err) {
      console.error('Error editando torta:', err);
      alert(err.message || 'Error al editar torta');
    }
  };
  const handleDeleteCake = async (id) => {
    try {
      if (!confirm('¿Seguro que deseas eliminar esta torta?')) return;
      await deleteCake(id);
    } catch (err) {
      console.error('Error eliminando torta:', err);
      alert(err.message || 'Error al eliminar torta');
    }
  };

  const handleAddCakeSubmit = async (e) => {
    e.preventDefault();
    setNewCakeError("");
    const nameTrim = newCakeName.trim();
    if (nameTrim.length < 2) {
      setNewCakeError("El nombre debe tener al menos 2 caracteres.");
      return;
    }
    if (!newCakeFile) {
      setNewCakeError("Debes seleccionar una imagen desde tus archivos.");
      return;
    }
    try {
      // Validar precio
      const normalized = parseChileanPrice(sanitizePriceDigits(newCakePrice));
      if (!normalized || normalized <= 0) {
        setNewCakeError('El precio es requerido y debe ser mayor a 0');
        return;
      }
      await addCake({ name: nameTrim, imageFile: newCakeFile, price: normalized });
      closeAddModal();
    } catch (err) {
      console.error('Error creando torta:', err);
      setNewCakeError(err.message || 'Error al crear torta');
    }
  };

  // Configuración de atención: lunes a viernes, 16:30 a 19:30
  const SERVICE_START_MINUTES = 16 * 60 + 30; // 16:30
  const SERVICE_END_MINUTES = 19 * 60 + 30;   // 19:30

  // Feriados configurables (formato YYYY-MM-DD). Incluye fechas comunes en Chile; ajusta según necesidad.
  const feriados = new Set([
    // Fijos
    '2025-01-01', // Año Nuevo
    '2025-05-01', // Día del Trabajador
    '2025-09-18', // Fiestas Patrias
    '2025-09-19', // Fiestas Patrias
    '2025-12-25', // Navidad
    // Añade más feriados aquí
  ]);

  const isWeekend = (d) => {
    const day = d.getDay(); // 0=Domingo, 6=Sábado
    return day === 0 || day === 6;
  };

  const isHoliday = (d) => {
    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    const key = `${y}-${m}-${day}`;
    return feriados.has(key);
  };

  const isWithinServiceHours = (d) => {
    const minutes = d.getHours() * 60 + d.getMinutes();
    return minutes >= SERVICE_START_MINUTES && minutes <= SERVICE_END_MINUTES;
  };

  const combineFechaHora = (dateStr, timeStr) => {
    if (!dateStr || !timeStr) return "";
    return `${dateStr}T${timeStr}`;
  };

  const handleFechaChange = (e) => {
    const dateStr = e.target.value;
    setFechaDia(dateStr);
    let errorMsg = '';
    if (dateStr) {
      try {
        const [y, m, d] = dateStr.split('-').map(Number);
        const dt = new Date(y, m - 1, d, 17, 0);
        if (isWeekend(dt)) errorMsg = 'Solo se atiende de lunes a viernes';
        else if (isHoliday(dt)) errorMsg = 'El día seleccionado es feriado';
      } catch {
        errorMsg = 'Fecha inválida';
      }
    }
    e.target.setCustomValidity(errorMsg);
    const combined = combineFechaHora(dateStr, horaDia);
    if (combined && !errorMsg) {
      const dc = new Date(combined);
      if (isWithinServiceHours(dc)) {
        setFechaHora(combined);
      } else {
        setFechaHora("");
      }
    } else if (!dateStr) {
      setFechaHora("");
    }
  };

  const handleHoraChange = (e) => {
    const timeStr = e.target.value;
    setHoraDia(timeStr);
    let errorMsg = '';
    if (timeStr) {
      try {
        const [hh, mm] = timeStr.split(':').map(Number);
        const dummy = new Date();
        dummy.setHours(hh, mm, 0, 0);
        if (!isWithinServiceHours(dummy)) errorMsg = 'Solo horario PM: 16:30 a 19:30';
      } catch {
        errorMsg = 'Hora inválida';
      }
    }
    e.target.setCustomValidity(errorMsg);
    const combined = combineFechaHora(fechaDia, timeStr);
    if (combined && !errorMsg) {
      const dc = new Date(combined);
      if (!isWeekend(dc) && !isHoliday(dc) && isWithinServiceHours(dc)) {
        setFechaHora(combined);
      } else {
        setFechaHora("");
      }
    } else if (!timeStr) {
      setFechaHora("");
    }
  };

  const handleFechaHoraChange = (e) => {
    const val = e.target.value;
    setFechaHora(val);
    if (!val) return;
    // Parsear como tiempo local
    const parsed = new Date(val);
    let errorMsg = '';
    if (isNaN(parsed.getTime())) {
      errorMsg = 'Fecha y hora inválidas';
    } else if (isWeekend(parsed)) {
      errorMsg = 'Solo se atiende de lunes a viernes';
    } else if (isHoliday(parsed)) {
      errorMsg = 'El día seleccionado es feriado. Elija otro día hábil';
    } else if (!isWithinServiceHours(parsed)) {
      errorMsg = 'Horario válido: 16:30 a 19:30';
    }
    e.target.setCustomValidity(errorMsg);
  };

  const buildWhatsAppMessage = () => {
    const lines = [
      `*Hola Opera*`,
      `Quisiera realizar un pedido:`,
      `------------------------------`,
      `- *Torta:* ${selectedTitle}`,
      selectedPrice ? `- *Precio:* $${formatChileanPrice(selectedPrice)}` : undefined,
      `- *Tamaño:* ${centimetros} cm`,
      `- *Cantidad:* ${cantidadTorta}`,
      `- *A nombre de:* ${aNombreDe}`,
      `- *Fecha y hora:* ${fechaHora}`,
      `- *Retiro en local:* ${pickupAck ? 'Sí' : 'No'}`,
      `- *Abono del pedido:* ${depositAck ? 'Sí' : 'No'}`,
      `- *Cliente:* ${nombreCompleto}`,
      `- *Teléfono:* ${telefono}`,
      `- *Notas:* ${campoExtra || '-'}`,
      `------------------------------`,
      `Por favor confirmar disponibilidad y tiempo estimado`,
      `¡Gracias!`
    ];

    return lines.filter(Boolean).join('\n');
  };

  const handleGeneratePdfAndOpenWhatsApp = async () => {
    // Ahora el flujo es solo texto con formato elegante
    if (!pickupAck) {
      alert('Debes reconocer que retirarás la torta en el local');
      return;
    }
    if (!depositAck) {
      alert('Debes reconocer realizar abono del pedido');
      return;
    }
    try {
      const message = buildWhatsAppMessage();
      const waLink = `https://wa.me/${whatsappNumber}?text=${encodeURIComponent(message)}`;
      window.open(waLink, '_blank');
    } catch (error) {
      alert(`No se pudo abrir WhatsApp. Detalle: ${error.message}`);
      console.error(error);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const form = e.target;
    // Validación HTML nativa
    if (!form.reportValidity()) {
      return;
    }
    handleGeneratePdfAndOpenWhatsApp();
  };

  return (
    <div className="w-full min-h-screen bg-gradient-to-br from-amber-50 to-orange-100 p-4 sm:p-6 lg:p-8 overflow-x-hidden font-serif relative">
      {/* Indicador Admin con botón flotante de logout */}
      <AdminIndicator />
      <h1 className="text-5xl font-extrabold text-amber-700 mb-10 text-center">
        Solicitar Pedido
      </h1>

      {/* Paso 1: Carrusel seleccionable */}
      {step === 1 && (
        <div className="max-w-3xl mx-auto">
          {/* Botones superiores: Volver, Añadir (admin) y Ver tortas disponibles */}
          <div className="flex flex-col sm:flex-row items-center gap-2 justify-end mb-4 md:absolute md:top-6 md:right-6">
            {isAdmin() && (
              <button
                onClick={openAddModal}
                className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-full bg-gradient-to-r from-amber-700 via-amber-600 to-amber-500 text-white font-semibold shadow-md hover:shadow-lg hover:brightness-105 transition-all focus:outline-none focus:ring-2 focus:ring-amber-300 active:scale-[0.98] min-w-[160px] sm:min-w-0 w-auto"
                aria-label="Añadir nueva torta"
                title="Añadir nueva torta"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16M4 12h16" />
                </svg>
                <span className="hidden sm:inline">Añadir torta</span>
              </button>
            )}
            {isAdmin() && (
              <button
                onClick={() => setShowCakesTable(v => !v)}
                className={`${showCakesTable
                  ? 'inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-full bg-amber-50 text-amber-800 border border-amber-300 font-semibold shadow-sm hover:bg-amber-100 transition-all focus:outline-none focus:ring-2 focus:ring-amber-300 active:scale-[0.98]'
                  : 'inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-full bg-gradient-to-r from-amber-700 via-amber-600 to-amber-500 text-white font-semibold shadow-md hover:shadow-lg hover:brightness-105 transition-all focus:outline-none focus:ring-2 focus:ring-amber-300 active:scale-[0.98]'} min-w-[160px] sm:min-w-0 w-auto`}
                aria-label="Ver tortas disponibles"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M2 12s4-7 10-7 10 7 10 7-4 7-10 7-10-7-10-7z" />
                  <circle cx="12" cy="12" r="3" />
                </svg>
                <span className="hidden sm:inline">{showCakesTable ? 'Ocultar tortas disponibles' : 'Ver tortas disponibles'}</span>
              </button>
            )}
          </div>
          {/* Botón Volver coherente con otras secciones */}
          <button
            onClick={() => navigate("/")}
            className="absolute top-6 left-2 p-2 rounded-full bg-amber-600 text-white hover:bg-amber-700 transition-colors shadow-md"
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
          <div className="relative w-full rounded-2xl shadow-xl bg-white overflow-hidden">
            <div className="grid grid-cols-1 md:grid-cols-2">
              {/* Panel de texto a la izquierda */}
              <div className="order-2 md:order-1 p-6 md:p-8 flex flex-col justify-center items-center text-center">
                <h2 className="text-4xl md:text-5xl font-extrabold tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-amber-800 via-amber-600 to-amber-400 drop-shadow-sm leading-tight mb-2">
                  {selectedTitle}
                </h2>
                <div className="h-[3px] w-24 md:w-28 bg-amber-500 rounded-full mb-2"></div>
                <p className="mt-2 text-amber-800 text-base md:text-lg bg-amber-50 border border-amber-200 rounded-lg px-4 py-3 shadow-sm max-w-md">
                  Elige tu torta favorita. Las etiquetas <span className="font-semibold">3p, 4p</span>, etc., indican la cantidad <span className="font-semibold">aproximada de porciones por persona</span>.
                </p>
                <div className="mt-6 flex gap-3 justify-center">
                  <button
                    type="button"
                    aria-label="Anterior"
                    onClick={() => { setTransitionDir('prev'); setSelectedIndex((prev) => (prev - 1 + items.length) % items.length); }}
                    className="px-4 py-2 bg-neutral-200 hover:bg-neutral-300 text-neutral-900 rounded-lg font-semibold"
                  >
                    ◀ Anterior
                  </button>
                  <button
                    type="button"
                    aria-label="Siguiente"
                    onClick={() => { setTransitionDir('next'); setSelectedIndex((prev) => (prev + 1) % items.length); }}
                    className="px-4 py-2 bg-amber-600 hover:bg-amber-700 text-white rounded-lg font-semibold"
                  >
                    Siguiente ▶
                  </button>
                </div>
              </div>

              {/* Imagen a la derecha */}
              <div className="order-1 md:order-2 relative bg-neutral-100 flex items-center justify-center p-4 md:p-6">
                <div className="w-full h-[260px] sm:h-[300px] md:w-[640px] md:h-[430px] rounded-xl overflow-hidden flex items-center justify-center">
                  <img
                    src={selectedImage}
                    alt={selectedTitle}
                    className={`w-full h-full object-contain md:object-cover will-change-transform ${transitionDir === 'next' ? 'elegant-slide-next' : transitionDir === 'prev' ? 'elegant-slide-prev' : 'elegant-zoom-in'}`}
                  />
                </div>
                {items[selectedIndex]?.price !== undefined && (
                  <div className="absolute bottom-4 left-1/2 -translate-x-1/2 bg-amber-600 text-white px-4 py-2 rounded-full shadow-lg text-sm md:text-base font-semibold">
                    ${formatChileanPrice(items[selectedIndex].price)}
                  </div>
                )}
              </div>
            </div>
            <div className="flex justify-center gap-2 p-4 pointer-events-none" aria-hidden="true">
              {items.map((_, idx) => (
                <span
                  key={idx}
                  className={`w-2.5 h-2.5 rounded-full inline-block ${selectedIndex === idx ? 'bg-amber-600' : 'bg-neutral-300'}`}
                />
              ))}
            </div>
          </div>
          <div className="flex justify-center mt-6">
            <button onClick={() => setStep(2)} className="px-8 py-3 bg-amber-600 text-white rounded-lg font-semibold hover:bg-amber-700 transition-all shadow-md">
              Continuar
            </button>
          </div>
          {/* Tabla de tortas disponibles (colapsable) */}
          {showCakesTable && (
            <div className="mt-10 bg-white rounded-xl shadow-lg p-6">
              <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-4 mb-4">
                <div>
                  <h3 className="text-2xl font-bold text-amber-800">Tortas disponibles</h3>
                  <p className="text-sm text-neutral-600">Busca y ordena para encontrar rápido tu torta ideal.</p>
                </div>
                <div className="flex flex-col sm:flex-row gap-3 w-full md:w-auto">
                  <div className="w-full sm:w-[280px] md:w-[320px]">
                    <label htmlFor="cakeSearch" className="block text-xs font-semibold text-amber-900">Buscar por nombre</label>
                    <div className="relative mt-1">
                      <input
                        id="cakeSearch"
                        type="text"
                        value={cakeSearch}
                        onChange={(e) => setCakeSearch(e.target.value)}
                        placeholder="Ej: chocolate, frutas"
                        className="w-full pl-10 pr-3 py-2 rounded-lg border-2 border-amber-300 focus:outline-none focus:border-amber-600 focus:ring-2 focus:ring-amber-600 bg-amber-50/50"
                      />
                      <span className="absolute left-3 top-1/2 -translate-y-1/2 text-amber-700">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
                          <circle cx="11" cy="11" r="7" />
                          <path d="M21 21l-4.3-4.3" />
                        </svg>
                      </span>
                    </div>
                  </div>
                  <div className="w-full sm:w-[220px] md:w-[240px]">
                    <label htmlFor="cakeSortBy" className="block text-xs font-semibold text-amber-900">Ordenar por</label>
                    <select
                      id="cakeSortBy"
                      value={cakeSortBy}
                      onChange={(e) => setCakeSortBy(e.target.value)}
                      className="w-full px-3 py-2 rounded-lg border-2 border-amber-300 bg-amber-50/50 focus:outline-none focus:border-amber-600 focus:ring-2 focus:ring-amber-600 text-amber-900"
                    >
                      <option value="created_desc">Más reciente</option>
                      <option value="created_asc">Más antiguo</option>
                      <option value="name_asc">Nombre A→Z</option>
                      <option value="name_desc">Nombre Z→A</option>
                      <option value="price_asc">Precio menor a mayor</option>
                      <option value="price_desc">Precio mayor a menor</option>
                    </select>
                  </div>
                </div>
              </div>
              {cakesError && (
                <p className="text-red-600 mb-2">{cakesError}</p>
              )}
              <div className="overflow-x-hidden">
                <table className="min-w-full divide-y divide-amber-200">
                  <thead className="bg-amber-50">
                    <tr>
                      <th className="px-4 py-2 text-left text-sm font-semibold text-amber-900">Foto</th>
                      <th className="px-4 py-2 text-left text-sm font-semibold text-amber-900">Nombre</th>
                      <th className="px-4 py-2 text-left text-sm font-semibold text-amber-900 hidden sm:table-cell">Precio</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-amber-100">
                    {filteredSortedCakes.map((item, idx) => (
                      <tr key={item.id || idx} className="hover:bg-amber-50/60">
                        <td className="px-4 py-3">
                          <div className="w-[150px] h-[100px] bg-neutral-100 rounded-lg overflow-hidden border border-amber-200">
                            <img src={item.src} alt={item.title} className="w-full h-full object-cover" />
                          </div>
                        </td>
                        <td className="px-4 py-3">
                          <span className="text-neutral-900 font-medium">{item.title}</span>
                          {isAdmin() && (
                            <div className="mt-2 flex gap-2">
                            <button
                              type="button"
                              onClick={() => openEditCake(item)}
                              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-sm rounded-md bg-gradient-to-r from-amber-700 via-amber-600 to-amber-500 text-white font-semibold shadow-sm hover:shadow-md hover:brightness-105 transition-all focus:outline-none focus:ring-2 focus:ring-amber-300 active:scale-[0.98]"
                              title="Editar torta"
                            >
                              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
                                <path strokeLinecap="round" strokeLinejoin="round" d="M11 4H7a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4" />
                                <path strokeLinecap="round" strokeLinejoin="round" d="M18.5 2.5a2.121 2.121 0 113 3L12 14l-4 1 1-4 9.5-8.5z" />
                              </svg>
                              Editar
                            </button>
                            <button
                              type="button"
                              onClick={() => item.id ? handleDeleteCake(item.id) : alert('Primero debes convertir esta torta base en administrada. Usa "Editar" para guardarla en la base de datos.')}
                              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-sm rounded-md bg-gradient-to-r from-red-700 via-red-600 to-red-500 text-white font-semibold shadow-sm hover:shadow-md hover:brightness-105 transition-all focus:outline-none focus:ring-2 focus:ring-red-300 active:scale-[0.98]"
                              title="Eliminar torta"
                            >
                              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
                                <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5-4h4m-6 4v12m6-12v12" />
                              </svg>
                              Eliminar
                            </button>
                          </div>
                        )}
                        {/* Precio en móvil, debajo de los botones */}
                        <p className="mt-2 text-neutral-900 font-semibold sm:hidden">${formatChileanPrice(item.price)}</p>
                      </td>
                      <td className="px-4 py-3 text-neutral-900 font-semibold hidden sm:table-cell">${formatChileanPrice(item.price)}</td>
                    </tr>
                  ))}
                  </tbody>
                </table>
              </div>
              {cakesLoading && (
                <p className="mt-3 text-sm text-neutral-600">Cargando tortas...</p>
              )}
            </div>
          )}
        </div>
      )}

      {/* Modal editar torta (solo admin) */}
  {editCakeModal.open && isAdmin() && (
        <div
          className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center"
          role="dialog"
          aria-modal="true"
          onClick={closeEditCake}
        >
          <div
            className="relative w-[92vw] max-w-[600px] bg-white rounded-xl shadow-2xl p-6"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-start justify-between mb-4">
              <h3 className="text-2xl font-extrabold text-amber-800">Editar torta</h3>
              <button
                type="button"
                className="px-3 py-1.5 rounded-md bg-neutral-200 text-neutral-900 hover:bg-neutral-300"
                onClick={closeEditCake}
                aria-label="Cerrar"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleEditCakeSubmit} className="grid grid-cols-1 gap-6">
              <div>
                <label htmlFor="editCakeName" className="block text-sm font-semibold text-amber-900 tracking-wide">Nombre de la torta</label>
                <div className="h-[2px] w-24 bg-amber-500 rounded-full mb-2"></div>
                <input
                  id="editCakeName"
                  type="text"
                  className="w-full p-3 rounded-lg border-2 border-amber-300 focus:outline-none focus:border-amber-600 focus:ring-2 focus:ring-amber-600 bg-amber-50/50"
                  value={editCakeModal.name}
                  onChange={(e) => setEditCakeModal(m => ({ ...m, name: e.target.value }))}
                  minLength={2}
                  required
                />
              </div>

              <div>
                <label htmlFor="editCakePrice" className="block text-sm font-semibold text-amber-900 tracking-wide">Precio</label>
                <div className="h-[2px] w-24 bg-amber-500 rounded-full mb-2"></div>
                <input
                  id="editCakePrice"
                  type="text"
                  inputMode="numeric"
                  className="w-full p-3 rounded-lg border-2 border-amber-300 focus:outline-none focus:border-amber-600 focus:ring-2 focus:ring-amber-600 bg-amber-50/50"
                  value={editCakeModal.price}
                  onChange={(e) => setEditCakeModal(m => ({ ...m, price: sanitizePriceDigits(e.target.value) }))}
                  onBlur={(e) => setEditCakeModal(m => ({ ...m, price: formatChileanPrice(sanitizePriceDigits(e.target.value)) }))}
                  onFocus={(e) => setEditCakeModal(m => ({ ...m, price: sanitizePriceDigits(e.target.value) }))}
                  placeholder="Ej: 24990"
                  required
                />
                <p className="mt-2 text-xs text-neutral-600">Ingresa el precio en pesos chilenos.</p>
              </div>

              <div>
                <label htmlFor="editCakeImageFile" className="block text-sm font-semibold text-amber-900 tracking-wide">Imagen </label>
                <div className="h-[2px] w-24 bg-amber-500 rounded-full mb-2"></div>
                <input
                  id="editCakeImageFile"
                  type="file"
                  accept="image/*"
                  className="w-full p-3 rounded-lg border-2 border-amber-300 focus:outline-none focus:border-amber-600 focus:ring-2 focus:ring-amber-600 bg-amber-50/50"
                  onChange={(e) => {
                    const file = e.target.files?.[0] || null;
                    setEditCakeModal(m => ({ ...m, imageFile: file }));
                  }}
                />
                <p className="mt-2 text-xs text-neutral-600">Si no seleccionas archivo, se mantiene la imagen actual.</p>
              </div>

              <div className="flex gap-3 justify-end">
                <button type="button" onClick={closeEditCake} className="px-5 py-2.5 bg-neutral-200 text-neutral-900 rounded-lg font-semibold hover:bg-neutral-300">Cancelar</button>
                <button type="submit" className="px-5 py-2.5 bg-amber-600 text-white rounded-lg font-semibold hover:bg-amber-700">Guardar</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Paso 2: Formulario */}
      {step === 2 && (
        <form onSubmit={handleSubmit} className="flex flex-col gap-6 max-w-xl mx-auto bg-white/95 backdrop-blur-sm p-6 rounded-xl shadow-lg">
          <div className="flex items-center justify-center gap-4 text-center">
            <img
              src={selectedImage}
              alt={selectedTitle}
              className="w-24 h-24 object-cover rounded-lg cursor-zoom-in"
              onClick={openPreview}
            />
            <div>
              <p className="text-sm text-neutral-700">Torta seleccionada</p>
              <p className="text-neutral-900 font-semibold break-all">{selectedTitle}</p>
              {selectedPrice ? (
                <p className="text-amber-800 font-semibold">${formatChileanPrice(selectedPrice)}</p>
              ) : null}
            </div>
          </div>

          {/* Nombre completo */}
          <div className="group">
            <label htmlFor="nombreCompleto" className="block text-sm font-semibold text-amber-900 tracking-wide">
              Nombre completo
            </label>
            <div className="h-[2px] w-16 bg-amber-500 rounded-full mb-2"></div>
            <input
              id="nombreCompleto"
              type="text"
              className="w-full p-3 rounded-lg border-2 border-amber-300 focus:outline-none focus:border-amber-600 focus:ring-2 focus:ring-amber-600 bg-amber-50/50"
              value={nombreCompleto}
              onChange={handleNombreCompletoChange}
              pattern="^[A-Za-zÁÉÍÓÚáéíóúÑñÜü' \-]{2,}$"
              title="Solo letras, espacios, apóstrofes y guiones"
              required
            />
          </div>

          {/* Teléfono */}
          <div className="group">
            <label htmlFor="telefono" className="block text-sm font-semibold text-amber-900 tracking-wide">
              Teléfono
            </label>
            <div className="h-[2px] w-14 bg-amber-500 rounded-full mb-2"></div>
            <input
              id="telefono"
              type="tel"
              inputMode="numeric"
              className="w-full p-3 rounded-lg border-2 border-amber-300 focus:outline-none focus:border-amber-600 focus:ring-2 focus:ring-amber-600 bg-amber-50/50"
              value={telefono}
              onChange={handleTelefonoChange}
              pattern="^[0-9]{8,12}$"
              title="Solo números, 8 a 12 dígitos"
              required
            />
          </div>

          {/* Fecha y hora (solo PM) */}
          <div className="group">
            <label className="block text-sm font-semibold text-amber-900 tracking-wide">
              Fecha y hora del pedido (solo PM)
            </label>
            <div className="h-[2px] w-44 bg-amber-500 rounded-full mb-2"></div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label htmlFor="fechaDia" className="sr-only">Fecha</label>
                <input
                  id="fechaDia"
                  type="date"
                  className="w-full p-3 rounded-lg border-2 border-amber-300 focus:outline-none focus:border-amber-600 focus:ring-2 focus:ring-amber-600 bg-amber-50/50"
                  value={fechaDia}
                  onChange={handleFechaChange}
                  required
                />
              </div>
              <div>
                <label htmlFor="horaDia" className="sr-only">Hora (PM)</label>
                <input
                  id="horaDia"
                  type="time"
                  className="w-full p-3 rounded-lg border-2 border-amber-300 focus:outline-none focus:border-amber-600 focus:ring-2 focus:ring-amber-600 bg-amber-50/50"
                  value={horaDia}
                  onChange={handleHoraChange}
                  min="16:30"
                  max="19:30"
                  step="60"
                  title="Solo horario PM: 16:30 a 19:30"
                  required
                />
              </div>
            </div>
            <p className="mt-1 text-xs text-neutral-600">Horario permitido: Lunes a viernes, de 4:30 pm a 7:30 pm (solo PM). Feriados excluidos.</p>
          </div>

          {/* A nombre de */}
          <div className="group">
            <label htmlFor="aNombreDe" className="block text-sm font-semibold text-amber-900 tracking-wide">
              A nombre de quién es el pedido
            </label>
            <div className="h-[2px] w-24 bg-amber-500 rounded-full mb-2"></div>
            <input
              id="aNombreDe"
              type="text"
              className="w-full p-3 rounded-lg border-2 border-amber-300 focus:outline-none focus:border-amber-600 focus:ring-2 focus:ring-amber-600 bg-amber-50/50"
              value={aNombreDe}
              onChange={handleANombreDeChange}
              pattern="^[A-Za-zÁÉÍÓÚáéíóúÑñÜü' \-]{2,}$"
              title="Solo letras, espacios, apóstrofes y guiones"
              required
            />
          </div>

          {/* Centímetros */}
          <div className="group">
            <label htmlFor="centimetros" className="block text-sm font-semibold text-amber-900 tracking-wide">
              Centímetros de la torta
            </label>
            <div className="h-[2px] w-24 bg-amber-500 rounded-full mb-2"></div>
            <input
              id="centimetros"
              type="number"
              min="1"
              className="w-full p-3 rounded-lg border-2 border-amber-300 focus:outline-none focus:border-amber-600 focus:ring-2 focus:ring-amber-600 bg-amber-50/50"
              value={centimetros}
              onChange={(e) => setCentimetros(e.target.value)}
              title="Ingrese solo números positivos"
              required
            />
          </div>

          {/* Cantidad de torta */}
          <div className="group">
            <label htmlFor="cantidadTorta" className="block text-sm font-semibold text-amber-900 tracking-wide">
              Cantidad de torta
            </label>
            <div className="h-[2px] w-24 bg-amber-500 rounded-full mb-2"></div>
            <input
              id="cantidadTorta"
              type="number"
              min="1"
              className="w-full p-3 rounded-lg border-2 border-amber-300 focus:outline-none focus:border-amber-600 focus:ring-2 focus:ring-amber-600 bg-amber-50/50"
              value={cantidadTorta}
              onChange={(e) => setCantidadTorta(e.target.value)}
              title="Ingrese cantidad (mínimo 1)"
              required
            />
          </div>

          {/* Campo adicional */}
          <div className="group">
            <label htmlFor="campoExtra" className="block text-sm font-semibold text-amber-900 tracking-wide">
              Notas del pedido
            </label>
            <div className="h-[2px] w-20 bg-amber-500 rounded-full mb-2"></div>
            <input
              id="campoExtra"
              type="text"
              className="w-full p-3 rounded-lg border-2 border-amber-300 focus:outline-none focus:border-amber-600 focus:ring-2 focus:ring-amber-600 bg-amber-50/50"
              value={campoExtra}
              onChange={handleCampoExtraChange}
              minLength={3}
              title="Describe detalles adicionales (mínimo 3 caracteres)"
              required
            />
          </div>

          <label className="flex items-center gap-3">
            <input type="checkbox" checked={pickupAck} onChange={(e) => setPickupAck(e.target.checked)} required />
            <span className="text-neutral-800">Reconozco que debo retirar la torta en el local</span>
          </label>

          <label className="flex items-center gap-3">
            <input type="checkbox" checked={depositAck} onChange={(e) => setDepositAck(e.target.checked)} required />
            <span className="text-neutral-800">Reconozco realizar abono del pedido</span>
          </label>

          <div className="flex gap-4 mt-2">
            <button type="button" onClick={() => setStep(1)} className="px-6 py-3 bg-neutral-200 text-neutral-800 rounded-lg font-semibold hover:bg-neutral-300">Volver</button>
            <button type="submit" className="flex-1 px-6 py-3 bg-green-600 text-white rounded-lg font-semibold hover:bg-green-700 shadow-md">Enviar pedido</button>
          </div>
        </form>
      )}

      {/* Modal de vista previa de imagen (paso 2) */}
      {showPreview && (
        <div
          className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center"
          role="dialog"
          aria-modal="true"
          onClick={closePreview}
        >
          <div
            className="relative w-[92vw] max-w-[860px] h-[70vh] sm:h-[75vh] md:h-[80vh] bg-white/5 rounded-xl overflow-hidden shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              type="button"
              className="absolute top-3 right-3 px-3 py-1.5 rounded-md bg-black/60 text-white text-sm hover:bg-black/70"
              onClick={closePreview}
              aria-label="Cerrar"
            >
              ✕
            </button>
            <div className="w-full h-full flex items-center justify-center p-3">
              <img
                src={selectedImage}
                alt={selectedTitle}
                className="w-full h-full object-contain"
              />
            </div>
            <div className="absolute bottom-3 left-0 right-0 text-center">
              <p className="inline-block px-3 py-1 rounded bg-amber-100/90 text-amber-800 font-semibold shadow">
                {selectedTitle}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Modal añadir nueva torta (solo admin) */}
  {showAddModal && isAdmin() && (
        <div
          className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center"
          role="dialog"
          aria-modal="true"
          onClick={closeAddModal}
        >
          <div
            className="relative w-[92vw] max-w-[720px] bg-white rounded-xl shadow-2xl p-6"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-start justify-between mb-4">
              <h3 className="text-2xl font-extrabold text-amber-800">Añadir nueva torta</h3>
              <button
                type="button"
                className="px-3 py-1.5 rounded-md bg-neutral-200 text-neutral-900 hover:bg-neutral-300"
                onClick={closeAddModal}
                aria-label="Cerrar"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleAddCakeSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label htmlFor="newCakeName" className="block text-sm font-semibold text-amber-900 tracking-wide">Nombre de la torta</label>
                <div className="h-[2px] w-24 bg-amber-500 rounded-full mb-2"></div>
                <input
                  id="newCakeName"
                  type="text"
                  className="w-full p-3 rounded-lg border-2 border-amber-300 focus:outline-none focus:border-amber-600 focus:ring-2 focus:ring-amber-600 bg-amber-50/50"
                  value={newCakeName}
                  onChange={(e) => setNewCakeName(e.target.value)}
                  minLength={2}
                  required
                />
                <p className="mt-2 text-xs text-neutral-600">Recomendación: usa un nombre corto y claro.</p>
              </div>

              <div>
                <label htmlFor="newCakeImageFile" className="block text-sm font-semibold text-amber-900 tracking-wide">Imagen de la torta</label>
                <div className="h-[2px] w-24 bg-amber-500 rounded-full mb-2"></div>
                <input
                  id="newCakeImageFile"
                  type="file"
                  accept="image/*"
                  onChange={handleNewCakeFileChange}
                  className="w-full p-3 rounded-lg border-2 border-amber-300 focus:outline-none focus:border-amber-600 focus:ring-2 focus:ring-amber-600 bg-amber-50/50"
                  required
                />
                {newCakePreview && (
                  <div className="mt-3 w-full h-[160px] rounded-lg overflow-hidden border border-amber-300 bg-neutral-50">
                    <img src={newCakePreview} alt="Vista previa" className="w-full h-full object-cover" />
                  </div>
                )}
                <p className="mt-2 text-xs text-neutral-600">Selecciona una imagen desde tus archivos locales.</p>
              </div>

              <div>
                <label htmlFor="newCakePrice" className="block text-sm font-semibold text-amber-900 tracking-wide">Precio</label>
                <div className="h-[2px] w-24 bg-amber-500 rounded-full mb-2"></div>
                <input
                  id="newCakePrice"
                  type="text"
                  inputMode="numeric"
                  className="w-full p-3 rounded-lg border-2 border-amber-300 focus:outline-none focus:border-amber-600 focus:ring-2 focus:ring-amber-600 bg-amber-50/50"
                  value={newCakePrice}
                  onChange={(e) => setNewCakePrice(sanitizePriceDigits(e.target.value))}
                  onBlur={(e) => setNewCakePrice(formatChileanPrice(sanitizePriceDigits(e.target.value)))}
                  onFocus={(e) => setNewCakePrice(sanitizePriceDigits(e.target.value))}
                  placeholder="Ej: 24990"
                  required
                />
                <p className="mt-2 text-xs text-neutral-600">Ingresa el precio en pesos chilenos.</p>
              </div>

              {newCakeError && (
                <div className="md:col-span-2">
                  <p className="text-sm text-red-700 bg-red-50 border border-red-200 rounded-md px-3 py-2">{newCakeError}</p>
                </div>
              )}

              <div className="md:col-span-2 flex gap-3 justify-end">
                <button type="button" onClick={closeAddModal} className="inline-flex items-center gap-1.5 px-5 py-2.5 rounded-lg bg-neutral-200 text-neutral-900 font-semibold hover:bg-neutral-300 transition-all">Cancelar</button>
                <button type="submit" className="inline-flex items-center gap-1.5 px-5 py-2.5 rounded-lg bg-gradient-to-r from-amber-700 via-amber-600 to-amber-500 text-white font-semibold shadow-sm hover:shadow-md hover:brightness-105 transition-all focus:outline-none focus:ring-2 focus:ring-amber-300">Añadir</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
