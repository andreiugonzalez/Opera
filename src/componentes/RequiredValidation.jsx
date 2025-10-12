import { useEffect } from 'react';

// Componente invisible que estandariza el mensaje de los campos requeridos
export default function RequiredValidation() {
  useEffect(() => {
    const REQUIRED_MSG = 'Campo Requerido';

    const onInvalid = (e) => {
      const el = e.target;
      if (!el) return;
      // Sólo personalizar si el error es por campo vacío (required)
      if (el.validity && el.validity.valueMissing) {
        try { el.setCustomValidity(REQUIRED_MSG); } catch {}
      } else {
        try { el.setCustomValidity(''); } catch {}
      }
    };

    const onInput = (e) => {
      const el = e.target;
      if (!el) return;
      // Limpiar el mensaje al escribir/cambiar
      try { el.setCustomValidity(''); } catch {}
    };

    // Usar captura para alcanzar elementos dentro de formularios en toda la app
    document.addEventListener('invalid', onInvalid, true);
    document.addEventListener('input', onInput, true);
    document.addEventListener('change', onInput, true);

    return () => {
      document.removeEventListener('invalid', onInvalid, true);
      document.removeEventListener('input', onInput, true);
      document.removeEventListener('change', onInput, true);
    };
  }, []);

  return null;
}