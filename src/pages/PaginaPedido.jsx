import { useEffect, useMemo, useState } from "react";
import Flatpickr from "react-flatpickr";
import "flatpickr/dist/flatpickr.css";
import { Spanish } from "flatpickr/dist/l10n/es.js";
import { createPortal } from "react-dom";
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
  const [newCakeUseDeviceImage, setNewCakeUseDeviceImage] = useState(false);
  const [newCakeImageUrl, setNewCakeImageUrl] = useState("");
  const [newCakePrice, setNewCakePrice] = useState('');
  const [newCakePreview, setNewCakePreview] = useState("");
  const [newCakeError, setNewCakeError] = useState("");
  const [editCakeModal, setEditCakeModal] = useState({ open: false, id: null, name: '', image_url: '', imageFile: null, useDeviceImage: false, price: '' });
  // Filtros y orden de tortas disponibles
  const [cakeSearch, setCakeSearch] = useState('');
  const [cakeSortBy, setCakeSortBy] = useState('created_desc'); // created_desc | created_asc | name_asc | name_desc | price_asc | price_desc

  // Banner informativo al entrar a "Solicitar Pedido"
  const [bannerMounted, setBannerMounted] = useState(false);
  const [bannerVisible, setBannerVisible] = useState(false);

  // Sanitización y validaciones de entradas
  const sanitizeText = (str) => str.replace(/[^A-Za-zÁÉÍÓÚáéíóúÑñÜü' \-]/g, '').replace(/\s{2,}/g, ' ').trimStart().slice(0, 35);
  const sanitizePhone = (str) => str.replace(/\D/g, '').slice(0, 12);

  // Bloquear scroll del fondo cuando hay un modal abierto
  useEffect(() => {
    const anyModalOpen = showAddModal || editCakeModal.open || showPreview;
    if (anyModalOpen) {
      const prev = document.body.style.overflow;
      document.body.dataset.prevOverflow = prev;
      document.body.style.overflow = 'hidden';
    } else {
      const prev = document.body.dataset.prevOverflow || '';
      document.body.style.overflow = prev;
      delete document.body.dataset.prevOverflow;
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [showAddModal, editCakeModal.open, showPreview]);

  // Mostrar banner solo para espectadores (no admin) por ~7 segundos con suave animación
  useEffect(() => {
    if (isAdmin && isAdmin()) {
      // No mostrar a administradores
      setBannerMounted(false);
      setBannerVisible(false);
      return;
    }
    setBannerMounted(true);
    setBannerVisible(false);
    const showTimer = setTimeout(() => setBannerVisible(true), 60);
    const hideTimer = setTimeout(() => setBannerVisible(false), 7000);
    const unmountTimer = setTimeout(() => setBannerMounted(false), 7700);
    return () => {
      clearTimeout(showTimer);
      clearTimeout(hideTimer);
      clearTimeout(unmountTimer);
    };
  }, [isAdmin]);

  const handleNombreCompletoChange = (e) => {
    const value = sanitizeText(e.target.value);
    setNombreCompleto(value);
    const msg = value.length < 2 ? 'Debe contener al menos 2 caracteres' : '';
    e.target.setCustomValidity(msg);
  };

  const handleANombreDeChange = (e) => {
    const value = sanitizeText(e.target.value);
    setANombreDe(value);
    const msg = value.length < 2 ? 'Debe contener al menos 2 caracteres' : '';
    e.target.setCustomValidity(msg);
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
      const t = setTimeout(() => setTransitionDir(null), 850);
      return () => clearTimeout(t);
    }
  }, [selectedIndex, transitionDir]);

  // Precargar imágenes vecinas para transiciones fluidas
  useEffect(() => {
    if (!items.length) return;
    const nextIdx = (selectedIndex + 1) % items.length;
    const prevIdx = (selectedIndex - 1 + items.length) % items.length;
    const nextSrc = items[nextIdx]?.src;
    const prevSrc = items[prevIdx]?.src;
    if (nextSrc) {
      const imgNext = new Image();
      imgNext.src = nextSrc;
    }
    if (prevSrc) {
      const imgPrev = new Image();
      imgPrev.src = prevSrc;
    }
  }, [selectedIndex, items]);

  const whatsappNumber = "56986193142"; // Número real actualizado

  const openPreview = () => setShowPreview(true);
  const closePreview = () => setShowPreview(false);

  const openAddModal = () => {
    setNewCakeName("");
    setNewCakeFile(null);
    setNewCakeUseDeviceImage(false);
    setNewCakeImageUrl("");
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

  const handleNewCakeImageUrlChange = (e) => {
    const value = e.target.value;
    setNewCakeImageUrl(value);
    setNewCakePreview(value || "");
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
    setEditCakeModal({ open: true, id: cake.id || null, name: cake.title || cake.name || '', image_url: cake.src || cake.image_url || '', imageFile: null, useDeviceImage: false, price: cake.price ? formatChileanPrice(cake.price) : '' });
  };
  const closeEditCake = () => setEditCakeModal({ open: false, id: null, name: '', image_url: '', imageFile: null, useDeviceImage: false, price: '' });
  const handleEditCakeSubmit = async (e) => {
    e.preventDefault();
    try {
      const nameTrim = (editCakeModal.name || '').slice(0, 35).trim();
      if (!nameTrim) return;
      const payload = { name: nameTrim };
      // Validar y normalizar precio
      if (editCakeModal.price !== undefined) {
        const normalized = parseChileanPrice(sanitizePriceDigits(editCakeModal.price).slice(0, 15));
        if (!normalized || normalized <= 0) {
          alert('El precio debe ser un número mayor a 0');
          return;
        }
        payload.price = normalized;
      }
      // Imagen: según selección de fuente
      if (editCakeModal.useDeviceImage) {
        if (editCakeModal.imageFile) {
          payload.imageFile = editCakeModal.imageFile;
        }
      } else if (editCakeModal.image_url && /^https?:\/\//.test(editCakeModal.image_url)) {
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
    const nameTrim = newCakeName.slice(0, 35).trim();
    if (nameTrim.length < 2) {
      setNewCakeError("El nombre debe tener al menos 2 caracteres.");
      return;
    }
    // Validación de imagen según selección
    if (newCakeUseDeviceImage) {
      if (!newCakeFile) {
        setNewCakeError("Debes seleccionar una imagen desde tus archivos.");
        return;
      }
    } else {
      if (!newCakeImageUrl || !/^https?:\/\//.test(newCakeImageUrl)) {
        setNewCakeError("Debes ingresar una URL de imagen válida (http/https).");
        return;
      }
    }
    try {
      // Validar precio
      const normalized = parseChileanPrice(sanitizePriceDigits(newCakePrice).slice(0, 15));
      if (!normalized || normalized <= 0) {
        setNewCakeError('El precio es requerido y debe ser mayor a 0');
        return;
      }
      const payload = newCakeUseDeviceImage
        ? { name: nameTrim, imageFile: newCakeFile, price: normalized }
        : { name: nameTrim, image_url: newCakeImageUrl, price: normalized };
      await addCake(payload);
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
        // Regla: mínimo 3 días de anticipación respecto a hoy (fecha local)
        const today = new Date();
        today.setHours(0,0,0,0);
        const minDate = new Date(today);
        minDate.setDate(today.getDate() + 3);
        if (dt < minDate) {
          errorMsg = 'Debes solicitar con al menos 3 días de anticipación';
        }
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
    // Validaciones de casillas ya están con required y mensajes, reforzamos aquí también
    if (!pickupAck || !depositAck) {
      alert('Debes seleccionar ambas casillas de reconocimiento para continuar');
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
    <div
      className="w-full min-h-screen p-4 sm:p-6 lg:p-8 overflow-x-hidden font-serif relative appear-page"
      style={{ backgroundColor: '#B78456' }}
    >
      {/* Indicador Admin con botón flotante de logout */}
      <AdminIndicator />
      {/* Mensaje “adjuntar imagen de referencia” comentado temporalmente por solicitud.
      {bannerMounted && createPortal((
        <div className="fixed inset-0 z-[2000] flex items-center justify-center pointer-events-none">
          <div className={`pointer-events-none transition-all duration-500 ease-out ${bannerVisible ? 'opacity-100 scale-100 translate-y-0' : 'opacity-0 scale-95 -translate-y-2'}`}>
            <div className="flex items-center gap-3 rounded-xl border-2 shadow-2xl px-5 py-4 max-w-3xl"
                 style={{ backgroundImage: 'linear-gradient(90deg, #783719 0%, #B78456 100%)', borderColor: '#E3C08C' }}>
              <span className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-[#FBDFA2]/20 border border-[#E3C08C]">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} style={{ color: '#F8EDD6' }}>
                  <rect x="3" y="5" width="18" height="14" rx="2" ry="2" />
                  <circle cx="8" cy="10" r="2" />
                  <path d="M21 15l-6-6-4 4-2-2-6 6" />
                </svg>
              </span>
              <p className="text-sm md:text-base leading-snug font-semibold" style={{ color: '#F8EDD6' }}>
                ¿Tienes una imagen de referencia de la torta? Al finalizar el formulario, adjúntala por WhatsApp para que podamos interpretar mejor tu idea.
              </p>
              <span className="ml-auto hidden sm:inline-flex items-center justify-center w-8 h-8 rounded-full bg-[#FBDFA2]/20 border border-[#E3C08C]">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} style={{ color: '#F8EDD6' }}>
                  <path d="M16.72 5.84A10.44 10.44 0 0 0 12 5.5C7.58 5.5 4 9.08 4 13.5c0 1.35.34 2.63.93 3.75L4 22l4.88-.93A8.47 8.47 0 0 0 12 21.5c4.42 0 8-3.58 8-8 0-1.99-.72-3.82-1.92-5.21" />
                </svg>
              </span>
            </div>
          </div>
        </div>
      ), document.body)}
      */}
      <h1 className="text-5xl font-extrabold mb-10 text-center underline-elegant" style={{ color: '#F8EDD6' }}>
        Solicitar Pedido
      </h1>

      {/* Paso 1: Carrusel seleccionable */}
      {step === 1 && (
        <div className="max-w-4xl mx-auto">
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
          {/* Botón Volver con estilo circular y brillo 783719 */}
          <button
            onClick={() => {
              if (step === 2) {
                setStep(1);
              } else {
                navigate("/");
              }
            }}
            className="fixed top-4 sm:top-6 left-2 sm:left-6 z-50 btn-back-783719 btn-sheen"
            aria-label="Volver a inicio"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-6 w-6 text-white"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2}
            >
              <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
            </svg>
          </button>
          <div className="relative w-full rounded-2xl shadow-2xl overflow-hidden"
               style={{ backgroundColor: '#452216', boxShadow: '0 20px 40px rgba(0,0,0,0.35)' }}>
            <div className="grid grid-cols-1 md:grid-cols-2">
              {/* Panel de texto a la izquierda */}
              <div className="order-2 md:order-1 p-6 md:p-8 flex flex-col justify-center items-center text-center">
                <h2 className="text-3xl md:text-4xl font-extrabold tracking-tight text-white leading-tight mb-4 px-4 py-2 rounded-lg"
                    style={{ backgroundColor: '#783719', boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.25), 0 8px 16px rgba(0,0,0,0.35)', letterSpacing: '0.5px' }}>
                  {selectedTitle}
                </h2>
                <div className="h-[3px] w-24 md:w-28 bg-amber-300 rounded-full mb-2"></div>
                <p className="mt-2 text-amber-50 text-base md:text-lg bg-[#452216]/80 border border-[#783719] rounded-lg px-4 py-3 shadow-sm max-w-md">
                  Elige tu torta favorita. Las etiquetas <span className="font-semibold">3p, 4p</span>, etc., indican la cantidad <span className="font-semibold">aproximada de porciones por persona</span>.
                </p>
                <div className="mt-6 flex gap-3 justify-center">
                  <button
                    type="button"
                    aria-label="Anterior"
                    onClick={() => { setTransitionDir('prev'); setSelectedIndex((prev) => (prev - 1 + items.length) % items.length); }}
                    className="px-4 py-2 rounded-full font-semibold bg-[#783719] text-white hover:bg-[#783719]/90 shadow-md btn-sheen"
                  >
                    ◀ Anterior
                  </button>
                  <button
                    type="button"
                    aria-label="Siguiente"
                    onClick={() => { setTransitionDir('next'); setSelectedIndex((prev) => (prev + 1) % items.length); }}
                    className="px-4 py-2 rounded-full font-semibold bg-amber-600 text-white hover:bg-amber-700 shadow-md btn-sheen"
                  >
                    Siguiente ▶
                  </button>
                </div>
              </div>

              {/* Imagen a la derecha */}
              <div className="order-1 md:order-2 relative flex items-center justify-center p-4 md:p-6"
                   style={{ backgroundColor: '#452216' }}>
                <div className="w-full h-[260px] sm:h-[300px] md:w-[640px] md:h-[430px] rounded-xl overflow-hidden flex items-center justify-center border border-[#783719]/40 shadow-lg">
                  <img
                    key={`${selectedIndex}-${transitionDir || 'zoom'}`}
                    src={selectedImage}
                    alt={selectedTitle}
                    className={`w-full h-full object-contain md:object-cover will-change-transform ${transitionDir === 'next' ? 'elegant-slide-next' : transitionDir === 'prev' ? 'elegant-slide-prev' : 'elegant-zoom-in'}`}
                  />
                </div>
                {items[selectedIndex]?.price !== undefined && (
                  <div className="absolute bottom-4 left-1/2 -translate-x-1/2 bg-[#783719] text-white px-4 py-2 rounded-full shadow-lg text-sm md:text-base font-semibold border border-amber-300/30">
                    ${formatChileanPrice(items[selectedIndex].price)}
                  </div>
                )}
              </div>
            </div>
            <div className="flex justify-center gap-2 p-4 pointer-events-none" aria-hidden="true">
              {items.map((_, idx) => (
                <span
                  key={idx}
                  className={`w-2.5 h-2.5 rounded-full inline-block ${selectedIndex === idx ? 'bg-amber-300' : 'bg-neutral-600'}`}
                />
              ))}
            </div>
          </div>
          <div className="flex justify-center mt-6">
            <button onClick={() => setStep(2)} className="px-8 py-3 rounded-full font-semibold bg-[#783719] text-white hover:bg-[#783719]/90 transition-all shadow-md btn-sheen border border-amber-300/30">
              Continuar
            </button>
          </div>
          {/* Tabla de tortas disponibles (colapsable) */}
          {showCakesTable && (
            <div className="mt-10 rounded-xl shadow-lg p-6 bg-[#783719] text-[#FBDFA2] border border-[#B78456]/40">
              <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-4 mb-4">
                <div>
                  <h3 className="text-2xl font-bold" style={{ color: '#F8EDD6' }}>Tortas disponibles</h3>
                  <p className="text-sm" style={{ color: '#FBDFA2' }}>Busca y ordena para encontrar rápido tu torta ideal.</p>
                </div>
                <div className="flex flex-col sm:flex-row gap-3 w-full md:w-auto">
                  <div className="w-full sm:w-[280px] md:w-[320px]">
                    <label htmlFor="cakeSearch" className="block text-xs font-semibold" style={{ color: '#FBDFA2' }}>Buscar por nombre</label>
                    <div className="relative mt-1">
                      <input
                        id="cakeSearch"
                        type="text"
                        value={cakeSearch}
                        onChange={(e) => setCakeSearch(e.target.value)}
                        placeholder="Ej: chocolate, frutas"
                        className="w-full pl-10 pr-3 py-2 rounded-lg border-2 border-[#B78456] focus:outline-none focus:border-[#B78456] focus:ring-2 focus:ring-[#B78456] bg-[#FBDFA2]/10 text-[#FBDFA2] placeholder-[#FBDFA2]/70"
                      />
                      <span className="absolute left-3 top-1/2 -translate-y-1/2" style={{ color: '#B78456' }}>
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
                          <circle cx="11" cy="11" r="7" />
                          <path d="M21 21l-4.3-4.3" />
                        </svg>
                      </span>
                    </div>
                  </div>
                  <div className="w-full sm:w-[220px] md:w-[240px]">
                    <label htmlFor="cakeSortBy" className="block text-xs font-semibold" style={{ color: '#FBDFA2' }}>Ordenar por</label>
                    <select
                      id="cakeSortBy"
                      value={cakeSortBy}
                      onChange={(e) => setCakeSortBy(e.target.value)}
                      className="w-full px-3 py-2 rounded-lg border-2 border-[#B78456] bg-[#FBDFA2]/10 focus:outline-none focus:border-[#B78456] focus:ring-2 focus:ring-[#B78456] text-[#FBDFA2]"
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
                <p className="mb-2" style={{ color: '#FBDFA2' }}>{cakesError}</p>
              )}
              <div className="overflow-x-auto sm:overflow-x-visible">
                <table className="min-w-[640px] sm:min-w-full divide-y divide-[#B78456]/40">
                  <thead className="bg-[#B78456]/30">
                    <tr>
                      <th className="px-4 py-2 text-left text-sm font-semibold" style={{ color: '#FBDFA2' }}>Foto</th>
                      <th className="px-4 py-2 text-left text-sm font-semibold" style={{ color: '#FBDFA2' }}>Nombre</th>
                      <th className="px-4 py-2 text-left text-sm font-semibold hidden sm:table-cell" style={{ color: '#FBDFA2' }}>Precio</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#B78456]/20">
                    {filteredSortedCakes.map((item, idx) => (
                      <tr key={item.id || idx} className="bg-[#783719]/85 hover:bg-[#B78456]/15 transition-colors">
                        <td className="px-4 py-3">
                          <div className="w-[150px] h-[100px] bg-[#452216]/40 rounded-lg overflow-hidden border border-[#B78456]/40">
                            <img src={item.src} alt={item.title} className="w-full h-full object-cover" />
                          </div>
                        </td>
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-3">
                            <span className="font-extrabold text-base sm:text-lg tracking-wide drop-shadow-sm" style={{ color: '#F8EDD6' }}>{item.title}</span>
                            {isAdmin() && (
                              <div className="flex gap-2 ml-auto">
                                <button
                                  type="button"
                                  onClick={() => openEditCake(item)}
                                  className="inline-flex items-center gap-1.5 px-3 py-1.5 text-sm rounded-md bg-[#B78456] text-[#452216] font-semibold shadow-sm hover:bg-[#B78456]/90 transition-all focus:outline-none focus:ring-2 focus:ring-[#FBDFA2] active:scale-[0.98] btn-sheen"
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
                                  className="inline-flex items-center gap-1.5 px-3 py-1.5 text-sm rounded-md bg-amber-600 text-white font-semibold shadow-sm hover:bg-amber-700 transition-all focus:outline-none focus:ring-2 focus:ring-[#FBDFA2] active:scale-[0.98] btn-sheen"
                                  title="Eliminar torta"
                                >
                                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5-4h4m-6 4v12m6-12v12" />
                                  </svg>
                                  Eliminar
                                </button>
                              </div>
                            )}
                          </div>
                          {/* Precio en móvil, debajo del nombre */}
                          <p className="mt-2 font-semibold sm:hidden" style={{ color: '#FBDFA2' }}>${formatChileanPrice(item.price)}</p>
                        </td>
                      <td className="px-4 py-3 font-semibold hidden sm:table-cell" style={{ color: '#FBDFA2' }}>${formatChileanPrice(item.price)}</td>
                    </tr>
                  ))}
                  </tbody>
                </table>
              </div>
              {cakesLoading && (
                <p className="mt-3 text-sm" style={{ color: '#FBDFA2' }}>Cargando tortas...</p>
              )}
            </div>
          )}
        </div>
      )}

      {/* Modal editar torta (solo admin) */}
  {editCakeModal.open && isAdmin() && createPortal((
        <div
          className="fixed inset-0 z-[1000] bg-black/60 backdrop-blur-sm flex items-center justify-center"
          role="dialog"
          aria-modal="true"
          onClick={closeEditCake}
        >
          <div
            className="relative w-[92vw] max-w-[720px] rounded-xl shadow-2xl p-6 border-2"
            style={{ backgroundColor: '#783719', borderColor: '#B78456' }}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-start justify-between mb-4">
              <h3 className="text-2xl font-extrabold" style={{ color: '#F8EDD6' }}>Editar torta</h3>
              <button
                type="button"
                className="px-3 py-1.5 rounded-md font-semibold focus:outline-none focus:ring-2"
                style={{ backgroundColor: '#B78456', color: '#452216' }}
                onMouseOver={(e) => { e.currentTarget.style.backgroundColor = '#b78456e6'; }}
                onMouseOut={(e) => { e.currentTarget.style.backgroundColor = '#B78456'; }}
                onClick={closeEditCake}
                aria-label="Cerrar"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleEditCakeSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label htmlFor="editCakeName" className="block text-sm font-semibold tracking-wide" style={{ color: '#FBDFA2' }}>Nombre de la torta</label>
                <div className="h-[2px] w-24 rounded-full mb-2" style={{ backgroundColor: '#B78456' }}></div>
                <input
                  id="editCakeName"
                  type="text"
                  className="w-full p-3 rounded-lg border-2 focus:outline-none focus:ring-2"
                  style={{ borderColor: '#B78456', backgroundColor: '#FBDFA2' + '1A', color: '#F8EDD6' }}
                  value={editCakeModal.name}
                  onChange={(e) => setEditCakeModal(m => ({ ...m, name: e.target.value.slice(0, 35) }))}
                  maxLength={35}
                  minLength={2}
                  required
                />
                <p className="mt-2 text-xs" style={{ color: '#FBDFA2' }}>Máximo 35 caracteres.</p>
              </div>

              <div>
                <label htmlFor="editCakePrice" className="block text-sm font-semibold tracking-wide" style={{ color: '#FBDFA2' }}>Precio</label>
                <div className="h-[2px] w-24 rounded-full mb-2" style={{ backgroundColor: '#B78456' }}></div>
                <input
                  id="editCakePrice"
                  type="text"
                  inputMode="numeric"
                  className="w-full p-3 rounded-lg border-2 focus:outline-none focus:ring-2"
                  style={{ borderColor: '#B78456', backgroundColor: '#FBDFA2' + '1A', color: '#F8EDD6' }}
                  value={editCakeModal.price}
                  onChange={(e) => setEditCakeModal(m => ({ ...m, price: sanitizePriceDigits(e.target.value).slice(0, 15) }))}
                  onBlur={(e) => setEditCakeModal(m => ({ ...m, price: formatChileanPrice(sanitizePriceDigits(e.target.value).slice(0, 15)) }))}
                  onFocus={(e) => setEditCakeModal(m => ({ ...m, price: sanitizePriceDigits(e.target.value).slice(0, 15) }))}
                  maxLength={15}
                  placeholder="Ej: 24990"
                  required
                />
                <p className="mt-2 text-xs" style={{ color: '#FBDFA2' }}>Ingresa el precio en pesos chilenos. Máximo 15 dígitos.</p>
              </div>

              <div className="md:col-span-2">
                <label className="block text-sm font-semibold tracking-wide" style={{ color: '#FBDFA2' }}>Imagen de la torta</label>
                <div className="h-[2px] w-24 rounded-full mb-2" style={{ backgroundColor: '#B78456' }}></div>
                <div className="mb-3 flex gap-6 text-sm" style={{ color: '#FBDFA2' }}>
                  <label className="flex items-center gap-2">
                    <input
                      type="radio"
                      name="editCakeImageSource"
                      checked={!editCakeModal.useDeviceImage}
                      onChange={() => setEditCakeModal(m => ({ ...m, useDeviceImage: false }))}
                      className="accent-amber-700"
                    />
                    URL de imagen
                  </label>
                  <label className="flex items-center gap-2">
                    <input
                      type="radio"
                      name="editCakeImageSource"
                      checked={editCakeModal.useDeviceImage}
                      onChange={() => setEditCakeModal(m => ({ ...m, useDeviceImage: true }))}
                      className="accent-amber-700"
                    />
                    Subir desde dispositivo
                  </label>
                </div>
                {!editCakeModal.useDeviceImage ? (
                  <div>
                    <input
                      type="text"
                      className="w-full p-3 rounded-lg border-2 focus:outline-none focus:ring-2"
                      style={{ borderColor: '#B78456', backgroundColor: '#FBDFA2' + '1A', color: '#F8EDD6' }}
                      placeholder="https://..."
                      value={editCakeModal.image_url || ''}
                      onChange={(e) => setEditCakeModal(m => ({ ...m, image_url: e.target.value }))}
                    />
                    {editCakeModal.image_url ? (
                      <div className="mt-2 w-full h-[160px] rounded-lg overflow-hidden border" style={{ borderColor: '#B78456', backgroundColor: '#452216' + '66' }}>
                        <img src={editCakeModal.image_url} alt="Vista previa" className="w-full h-full object-cover" onError={(ev) => { ev.currentTarget.style.display = 'none'; }} />
                      </div>
                    ) : null}
                  </div>
                ) : (
                  <div>
                    <input
                      id="editCakeImageFile"
                      type="file"
                      accept="image/*"
                      className="w-full p-3 rounded-lg border-2 focus:outline-none focus:ring-2"
                      style={{ borderColor: '#B78456', backgroundColor: '#FBDFA2' + '1A', color: '#F8EDD6' }}
                      onChange={(e) => {
                        const file = e.target.files?.[0] || null;
                        setEditCakeModal(m => ({ ...m, imageFile: file }));
                      }}
                    />
                    {editCakeModal.imageFile ? (
                      <div className="mt-2 w-full h-[160px] rounded-lg overflow-hidden border" style={{ borderColor: '#B78456', backgroundColor: '#452216' + '66' }}>
                        <img src={URL.createObjectURL(editCakeModal.imageFile)} alt="Vista previa" className="w-full h-full object-cover" />
                      </div>
                    ) : null}
                    <p className="mt-2 text-xs" style={{ color: '#FBDFA2' }}>Si no seleccionas archivo, se mantiene la imagen actual.</p>
                  </div>
                )}
              </div>

              <div className="md:col-span-2 flex gap-3 justify-end">
                <button type="button" onClick={closeEditCake} className="inline-flex items-center gap-1.5 px-5 py-2.5 rounded-lg font-semibold transition-all focus:outline-none focus:ring-2" style={{ backgroundColor: '#B78456', color: '#452216' }}>Cancelar</button>
                <button type="submit" className="inline-flex items-center gap-1.5 px-5 py-2.5 rounded-lg font-semibold shadow-sm transition-all focus:outline-none focus:ring-2" style={{ backgroundColor: '#783719', color: '#F8EDD6' }}>Guardar</button>
              </div>
            </form>
          </div>
        </div>
      ), document.body)}

      {/* Paso 2: Formulario */}
      {step === 2 && (
        <form onSubmit={handleSubmit} className="flex flex-col gap-6 max-w-xl mx-auto rounded-xl shadow-xl border-2 p-6 relative float-subtle"
          style={{ backgroundImage: 'linear-gradient(180deg, #8B5E3C 0%, #6E3A22 100%)', borderColor: '#B78456', boxShadow: '0 12px 28px rgba(0,0,0,0.35)' }}>
          <div className="flex items-center justify-center gap-4 text-center">
            <img
              src={selectedImage}
              alt={selectedTitle}
              className="w-24 h-24 object-cover rounded-lg cursor-zoom-in"
              onClick={openPreview}
            />
            <div>
              <p className="text-sm" style={{ color: '#FBDFA2' }}>Torta seleccionada</p>
              <p className="font-semibold break-all" style={{ color: '#F8EDD6' }}>{selectedTitle}</p>
              {selectedPrice ? (
                <p className="font-semibold" style={{ color: '#FBDFA2' }}>${formatChileanPrice(selectedPrice)}</p>
              ) : null}
            </div>
          </div>

          {/* Nombre completo */}
          <div className="group">
            <label htmlFor="nombreCompleto" className="block text-sm font-semibold tracking-wide" style={{ color: '#F8EDD6' }}>
              Nombre completo
            </label>
            <div className="h-[2px] w-16 rounded-full mb-2" style={{ backgroundColor: '#E3C08C' }}></div>
            <input
              id="nombreCompleto"
              type="text"
              maxLength={35}
              className="w-full p-3 rounded-lg border focus:outline-none focus:ring-2"
              style={{ borderColor: '#E3C08C', backgroundColor: '#F8EDD6' + '14', color: '#F8EDD6' }}
              value={nombreCompleto}
              onChange={handleNombreCompletoChange}
              pattern="^[A-Za-zÁÉÍÓÚáéíóúÑñÜü' \-]{2,}$"
              title="Hasta 35 caracteres. Solo letras, espacios, apóstrofes y guiones"
              required
            />
          </div>

          {/* Teléfono */}
          <div className="group">
            <label htmlFor="telefono" className="block text-sm font-semibold tracking-wide" style={{ color: '#F8EDD6' }}>
              Teléfono
            </label>
            <div className="h-[2px] w-14 rounded-full mb-2" style={{ backgroundColor: '#E3C08C' }}></div>
            <input
              id="telefono"
              type="tel"
              inputMode="numeric"
              className="w-full p-3 rounded-lg border focus:outline-none focus:ring-2"
              style={{ borderColor: '#E3C08C', backgroundColor: '#F8EDD6' + '14', color: '#F8EDD6' }}
              value={telefono}
              onChange={handleTelefonoChange}
              pattern="^[0-9]{8,12}$"
              title="Solo números, 8 a 12 dígitos"
              required
            />
          </div>

          {/* Fecha y hora (solo PM) */}
          <div className="group">
            <label className="block text-sm font-semibold tracking-wide" style={{ color: '#F8EDD6' }}>
              Fecha y hora del pedido (solo PM)
            </label>
            <div className="h-[2px] w-44 rounded-full mb-2" style={{ backgroundColor: '#E3C08C' }}></div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label htmlFor="fechaDia" className="sr-only">Fecha</label>
                <Flatpickr
                  id="fechaDia"
                  options={{
                    locale: Spanish,
                    dateFormat: "Y-m-d",
                    altInput: true,
                    altFormat: "d/m/Y",
                    minDate: (() => { const today = new Date(); today.setHours(0,0,0,0); const min = new Date(today); min.setDate(today.getDate() + 3); return min; })(),
                    disable: [
                      function(date) { return date.getDay() === 0 || date.getDay() === 6 || isHoliday(date); },
                    ],
                  }}
                  className="w-full p-3 rounded-lg border focus:outline-none focus:ring-2"
                  style={{ borderColor: '#E3C08C', backgroundColor: '#F8EDD6' + '14', color: '#F8EDD6' }}
                  value={fechaDia}
                  placeholder="Selecciona fecha (dd/mm/aaaa)"
                  onReady={(selectedDates, dateStr, instance) => {
                    if (instance?.altInput) {
                      instance.altInput.placeholder = 'Selecciona fecha (dd/mm/aaaa)';
                      // Aplicar estilos coherentes con el resto de inputs
                      instance.altInput.className = 'w-full p-3 rounded-lg border focus:outline-none focus:ring-2 datepicker-input';
                      instance.altInput.style.borderColor = '#E3C08C';
                      instance.altInput.style.backgroundColor = '#F8EDD6' + '14';
                      instance.altInput.style.color = '#452216';
                      instance.altInput.style.caretColor = '#F8EDD6';
                    }
                  }}
                  onChange={(dates, str, instance) => {
                    // Asegurar que el input real reciba el mensaje de validación
                    const target = instance?.input ?? { value: str, setCustomValidity: () => {} };
                    target.value = str;
                    handleFechaChange({ target });
                  }}
                  required
                />
              </div>
              <div>
                <label htmlFor="horaDia" className="sr-only">Hora (PM)</label>
                <select
                  id="horaDia"
                  className="w-full p-3 rounded-lg border focus:outline-none focus:ring-2"
                  style={{ borderColor: '#E3C08C', backgroundColor: '#F8EDD6' + '14', color: '#F8EDD6' }}
                  value={horaDia}
                  onChange={handleHoraChange}
                  title="Solo horario PM: 16:30 a 19:30"
                  required
                >
                  <option value="" disabled style={{ color: '#452216' }}>Selecciona hora (PM)</option>
                  {['16:30','16:45','17:00','17:15','17:30','17:45','18:00','18:15','18:30','18:45','19:00','19:15','19:30'].map(t => (
                    <option key={t} value={t} style={{ color: '#452216' }}>{t}</option>
                  ))}
                </select>
              </div>
            </div>
            <p className="mt-1 text-xs" style={{ color: '#EED3A1' }}>Horario permitido: Lunes a viernes, de 4:30 pm a 7:30 pm (solo PM). Feriados excluidos.</p>
          </div>

          {/* A nombre de */}
          <div className="group">
            <label htmlFor="aNombreDe" className="block text-sm font-semibold tracking-wide" style={{ color: '#F8EDD6' }}>
              A nombre de quién es el pedido
            </label>
            <div className="h-[2px] w-24 rounded-full mb-2" style={{ backgroundColor: '#E3C08C' }}></div>
            <input
              id="aNombreDe"
              type="text"
              maxLength={35}
              className="w-full p-3 rounded-lg border focus:outline-none focus:ring-2"
              style={{ borderColor: '#E3C08C', backgroundColor: '#F8EDD6' + '14', color: '#F8EDD6' }}
              value={aNombreDe}
              onChange={handleANombreDeChange}
              pattern="^[A-Za-zÁÉÍÓÚáéíóúÑñÜü' \-]{2,}$"
              title="Hasta 35 caracteres. Solo letras, espacios, apóstrofes y guiones"
              required
            />
          </div>

          {/* Centímetros */}
          <div className="group">
            <label htmlFor="centimetros" className="block text-sm font-semibold tracking-wide" style={{ color: '#F8EDD6' }}>
              Centímetros de la torta
            </label>
            <div className="h-[2px] w-24 rounded-full mb-2" style={{ backgroundColor: '#E3C08C' }}></div>
            <input
              id="centimetros"
              type="number"
              min="1"
              max="99"
              className="w-full p-3 rounded-lg border focus:outline-none focus:ring-2"
              style={{ borderColor: '#E3C08C', backgroundColor: '#F8EDD6' + '14', color: '#F8EDD6' }}
              value={centimetros}
              onChange={(e) => {
                const v = e.target.value.replace(/\D/g, '').slice(0, 2);
                setCentimetros(v);
              }}
              title="Ingrese solo números positivos"
              required
            />
            <div className="mt-2">
              <button
                type="button"
                className="px-3 py-1 text-sm rounded-full shadow btn-sheen"
                style={{ backgroundColor: '#B78456', color: '#452216' }}
                onClick={openPreview}
              >
                ver cm de la torta
              </button>
            </div>
          </div>

          {/* Cantidad de torta */}
          <div className="group">
            <label htmlFor="cantidadTorta" className="block text-sm font-semibold tracking-wide" style={{ color: '#F8EDD6' }}>
              Cantidad de torta
            </label>
            <div className="h-[2px] w-24 rounded-full mb-2" style={{ backgroundColor: '#E3C08C' }}></div>
            <input
              id="cantidadTorta"
              type="number"
              min="1"
              max="99"
              className="w-full p-3 rounded-lg border focus:outline-none focus:ring-2"
              style={{ borderColor: '#E3C08C', backgroundColor: '#F8EDD6' + '14', color: '#F8EDD6' }}
              value={cantidadTorta}
              onChange={(e) => {
                const v = e.target.value.replace(/\D/g, '').slice(0, 2);
                setCantidadTorta(v);
              }}
              title="Ingrese cantidad (mínimo 1)"
              required
            />
          </div>

          {/* Campo adicional */}
          <div className="group">
            <label htmlFor="campoExtra" className="block text-sm font-semibold tracking-wide" style={{ color: '#F8EDD6' }}>
              Notas del pedido
            </label>
            <div className="h-[2px] w-20 rounded-full mb-2" style={{ backgroundColor: '#E3C08C' }}></div>
            <input
              id="campoExtra"
              type="text"
              className="w-full p-3 rounded-lg border focus:outline-none focus:ring-2"
              style={{ borderColor: '#E3C08C', backgroundColor: '#F8EDD6' + '14', color: '#F8EDD6' }}
              value={campoExtra}
              onChange={handleCampoExtraChange}
              minLength={3}
              title="Describe detalles adicionales (mínimo 3 caracteres)"
              required
            />
          </div>

          <label className="flex items-center gap-3">
            <input
              type="checkbox"
              checked={pickupAck}
              onChange={(e) => {
                setPickupAck(e.target.checked);
                e.target.setCustomValidity(e.target.checked ? '' : 'Debes seleccionar esta casilla para continuar');
              }}
              required
            />
            <span style={{ color: '#EED3A1' }}>Reconozco que debo retirar la torta en el local</span>
          </label>

          <label className="flex items-center gap-3">
            <input
              type="checkbox"
              checked={depositAck}
              onChange={(e) => {
                setDepositAck(e.target.checked);
                e.target.setCustomValidity(e.target.checked ? '' : 'Debes seleccionar esta casilla para continuar');
              }}
              required
            />
            <span style={{ color: '#EED3A1' }}>Reconozco realizar abono del pedido</span>
          </label>

          <div className="flex gap-4 mt-2">
            <button type="button" onClick={() => setStep(1)} className="px-6 py-3 rounded-full font-semibold shadow-md btn-sheen" style={{ backgroundColor: '#B78456', color: '#452216' }}>Volver</button>
            <button type="submit" className="flex-1 px-6 py-3 rounded-full font-semibold shadow-lg btn-sheen focus:outline-none" style={{ backgroundImage: 'linear-gradient(90deg, #D7A46B 0%, #B78456 100%)', color: '#452216', border: '2px solid #E3C08C' }}>Enviar pedido</button>
          </div>
        </form>
      )}

      {/* Modal de vista previa de imagen (paso 2) */}
      {showPreview && createPortal((
        <div
          className="fixed inset-0 z-[1000] bg-black/70 backdrop-blur-sm flex items-center justify-center"
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
      ), document.body)}

      {/* Modal añadir nueva torta (solo admin) */}
  {showAddModal && isAdmin() && createPortal((
        <div
          className="fixed inset-0 z-[1000] bg-black/60 backdrop-blur-sm flex items-center justify-center"
          role="dialog"
          aria-modal="true"
          onClick={closeAddModal}
        >
          <div
            className="relative w-[92vw] max-w-[720px] rounded-xl shadow-2xl p-6 border-2"
            style={{ backgroundColor: '#783719', borderColor: '#B78456' }}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-start justify-between mb-4">
              <h3 className="text-2xl font-extrabold" style={{ color: '#F8EDD6' }}>Añadir nueva torta</h3>
              <button
                type="button"
                className="px-3 py-1.5 rounded-md font-semibold focus:outline-none focus:ring-2"
                style={{ backgroundColor: '#B78456', color: '#452216' }}
                onMouseOver={(e) => { e.currentTarget.style.backgroundColor = '#b78456e6'; }}
                onMouseOut={(e) => { e.currentTarget.style.backgroundColor = '#B78456'; }}
                onClick={closeAddModal}
                aria-label="Cerrar"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleAddCakeSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label htmlFor="newCakeName" className="block text-sm font-semibold tracking-wide" style={{ color: '#FBDFA2' }}>Nombre de la torta</label>
                <div className="h-[2px] w-24 rounded-full mb-2" style={{ backgroundColor: '#B78456' }}></div>
                <input
                  id="newCakeName"
                  type="text"
                  className="w-full p-3 rounded-lg border-2 focus:outline-none focus:ring-2"
                  style={{
                    borderColor: '#B78456',
                    backgroundColor: '#FBDFA2' + '1A',
                    color: '#F8EDD6'
                  }}
                  value={newCakeName}
                  onChange={(e) => setNewCakeName(e.target.value.slice(0, 35))}
                  maxLength={35}
                  minLength={2}
                  required
                />
                <p className="mt-2 text-xs" style={{ color: '#FBDFA2' }}>Máximo 35 caracteres.</p>
              </div>

              <div>
                <label className="block text-sm font-semibold tracking-wide" style={{ color: '#FBDFA2' }}>Imagen de la torta</label>
                <div className="h-[2px] w-24 rounded-full mb-2" style={{ backgroundColor: '#B78456' }}></div>
                <div className="mb-3 flex gap-6 text-sm" style={{ color: '#FBDFA2' }}>
                  <label className="flex items-center gap-2">
                    <input
                      type="radio"
                      name="newCakeImageSource"
                      checked={!newCakeUseDeviceImage}
                      onChange={() => setNewCakeUseDeviceImage(false)}
                      className="accent-amber-700"
                    />
                    URL de imagen
                  </label>
                  <label className="flex items-center gap-2">
                    <input
                      type="radio"
                      name="newCakeImageSource"
                      checked={newCakeUseDeviceImage}
                      onChange={() => setNewCakeUseDeviceImage(true)}
                      className="accent-amber-700"
                    />
                    Subir desde dispositivo
                  </label>
                </div>
                {!newCakeUseDeviceImage ? (
                  <div>
                    <input
                      type="text"
                      placeholder="https://..."
                      value={newCakeImageUrl}
                      onChange={handleNewCakeImageUrlChange}
                      className="w-full p-3 rounded-lg border-2 focus:outline-none focus:ring-2"
                      style={{
                        borderColor: '#B78456',
                        backgroundColor: '#FBDFA2' + '1A',
                        color: '#F8EDD6'
                      }}
                    />
                    {newCakePreview && (
                      <div className="mt-3 w-full h-[160px] rounded-lg overflow-hidden border" style={{ borderColor: '#B78456', backgroundColor: '#452216' + '66' }}>
                        <img src={newCakePreview} alt="Vista previa" className="w-full h-full object-cover" onError={(ev) => { ev.currentTarget.style.display = 'none'; }} />
                      </div>
                    )}
                  </div>
                ) : (
                  <div>
                    <input
                      id="newCakeImageFile"
                      type="file"
                      accept="image/*"
                      onChange={handleNewCakeFileChange}
                      className="w-full p-3 rounded-lg border-2 focus:outline-none focus:ring-2"
                      style={{
                        borderColor: '#B78456',
                        backgroundColor: '#FBDFA2' + '1A',
                        color: '#F8EDD6'
                      }}
                    />
                    {newCakePreview && (
                      <div className="mt-3 w-full h-[160px] rounded-lg overflow-hidden border" style={{ borderColor: '#B78456', backgroundColor: '#452216' + '66' }}>
                        <img src={newCakePreview} alt="Vista previa" className="w-full h-full object-cover" />
                      </div>
                    )}
                    <p className="mt-2 text-xs" style={{ color: '#FBDFA2' }}>Selecciona una imagen desde tus archivos locales.</p>
                  </div>
                )}
              </div>

              <div>
                <label htmlFor="newCakePrice" className="block text-sm font-semibold tracking-wide" style={{ color: '#FBDFA2' }}>Precio</label>
                <div className="h-[2px] w-24 rounded-full mb-2" style={{ backgroundColor: '#B78456' }}></div>
                <input
                  id="newCakePrice"
                  type="text"
                  inputMode="numeric"
                  className="w-full p-3 rounded-lg border-2 focus:outline-none focus:ring-2"
                  style={{
                    borderColor: '#B78456',
                    backgroundColor: '#FBDFA2' + '1A',
                    color: '#F8EDD6'
                  }}
                  value={newCakePrice}
                  onChange={(e) => setNewCakePrice(sanitizePriceDigits(e.target.value).slice(0, 15))}
                  onBlur={(e) => setNewCakePrice(formatChileanPrice(sanitizePriceDigits(e.target.value).slice(0, 15)))}
                  onFocus={(e) => setNewCakePrice(sanitizePriceDigits(e.target.value).slice(0, 15))}
                  maxLength={15}
                  placeholder="Ej: 24990"
                  required
                />
                <p className="mt-2 text-xs" style={{ color: '#FBDFA2' }}>Ingresa el precio en pesos chilenos. Máximo 15 dígitos.</p>
              </div>

              {newCakeError && (
                <div className="md:col-span-2">
                  <p className="text-sm rounded-md px-3 py-2 border" style={{ color: '#F8EDD6', backgroundColor: 'rgba(127, 29, 29, 0.35)', borderColor: '#B78456' }}>{newCakeError}</p>
                </div>
              )}

              <div className="md:col-span-2 flex gap-3 justify-end">
                <button type="button" onClick={closeAddModal} className="inline-flex items-center gap-1.5 px-5 py-2.5 rounded-lg font-semibold transition-all focus:outline-none focus:ring-2" style={{ backgroundColor: '#B78456', color: '#452216' }}>Cancelar</button>
                <button type="submit" className="inline-flex items-center gap-1.5 px-5 py-2.5 rounded-lg font-semibold shadow-sm transition-all focus:outline-none focus:ring-2" style={{ backgroundColor: '#783719', color: '#F8EDD6' }}>Añadir</button>
              </div>
            </form>
          </div>
        </div>
      ), document.body)}
    </div>
  );
}
