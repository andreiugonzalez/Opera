// Utilidades para formateo de precios en formato chileno

/**
 * Formatea un número como precio chileno con puntos como separadores de miles
 * Solo agrega puntos si el número tiene 4 o más dígitos
 * @param {string|number} value - El valor a formatear
 * @returns {string} - El precio formateado
 */
export const formatChileanPrice = (value) => {
  if (value === undefined || value === null || value === '') return '';
  const str = value.toString().trim();

  let number = 0;
  if (typeof value === 'number') {
    number = Math.round(value);
  } else if (/,\d{1,2}$/.test(str)) {
    // Formato con coma decimal: remover miles y convertir coma a punto
    const normalized = str.replace(/\./g, '').replace(',', '.');
    const floatVal = parseFloat(normalized);
    number = Math.round(isNaN(floatVal) ? 0 : floatVal);
  } else if (/\.\d{1,2}$/.test(str)) {
    // Formato con punto decimal: usar tal cual
    const floatVal = parseFloat(str);
    number = Math.round(isNaN(floatVal) ? 0 : floatVal);
  } else {
    // Sin decimales: quitar todo lo no dígito
    const digitsOnly = str.replace(/[^\d]/g, '');
    number = parseInt(digitsOnly || '0', 10);
  }

  return new Intl.NumberFormat('es-CL', { maximumFractionDigits: 0 }).format(number);
};

/**
 * Remueve el formato de precio para obtener el número puro
 * @param {string} formattedPrice - El precio formateado
 * @returns {number} - El número sin formato
 */
export const parseChileanPrice = (formattedPrice) => {
  if (!formattedPrice) return 0;
  const str = formattedPrice.toString().trim();

  let value = 0;
  if (/,\d{1,2}$/.test(str)) {
    // Coma decimal: remover puntos de miles y convertir coma a punto
    const normalized = str.replace(/\./g, '').replace(',', '.');
    value = Math.round(parseFloat(normalized) || 0);
  } else if (/\.\d{1,2}$/.test(str)) {
    // Punto decimal: usar tal cual
    value = Math.round(parseFloat(str) || 0);
  } else {
    const digitsOnly = str.replace(/[^\d]/g, '');
    value = parseInt(digitsOnly || '0', 10);
  }

  if (value > 99999999) {
    console.warn(`Precio ${value} excede el límite máximo de 99,999,999`);
    return 99999999;
  }
  return value;
};

/**
 * Formatea un precio mientras el usuario escribe
 * Aplica el formato automáticamente
 * @param {string} input - El input del usuario
 * @returns {string} - El precio formateado
 */
export const formatPriceInput = (input) => {
  if (!input) return '';
  const trimmed = input.trim();
  // Si el usuario escribe con decimales (ej: "1,00" o "1.00"), conservar solo la parte entera
  const decimalPattern = /^\d+([\.,]\d{0,2})?$/; // permite 0-2 decimales
  if (decimalPattern.test(trimmed)) {
    const integerPart = trimmed.split(/[\.,]/)[0];
    return formatChileanPrice(integerPart);
  }

  // Remover todo lo que no sean números (incluye casos con espacios u otros símbolos)
  const numbersOnly = trimmed.replace(/[^\d]/g, '');
  if (!numbersOnly) return '';
  return formatChileanPrice(numbersOnly);
};

/**
 * Valida si un precio está en formato correcto
 * @param {string} price - El precio a validar
 * @returns {boolean} - True si es válido
 */
export const isValidPrice = (price) => {
  if (!price) return false;
  
  const cleanPrice = parseChileanPrice(price);
  return cleanPrice > 0;
};

/**
 * Sanitiza cualquier entrada de precio, dejando solo dígitos (CLP entero)
 * @param {string|number} input
 * @returns {string} dígitos crudos sin formato
 */
export const sanitizePriceDigits = (input) => {
  if (input === undefined || input === null) return '';
  const str = String(input);
  const digits = str.replace(/[^\d]/g, '');
  // Evitar valores absurdos y quitar ceros líderes innecesarios
  const trimmed = digits.replace(/^0+(\d)/, '$1');
  return trimmed;
};