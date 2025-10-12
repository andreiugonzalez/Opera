import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App.jsx";
import { CakesProvider } from "./contexts/CakesContext.jsx";
import "./index.css";

// Pausar transiciones/animaciones mientras se redimensiona la ventana para evitar jank
// Activa clase `html.resizing` brevemente durante eventos de resize u orientationchange.
if (typeof window !== 'undefined') {
  let resizeTimeout;
  const onResizeStart = () => {
    document.documentElement.classList.add('resizing');
    clearTimeout(resizeTimeout);
    // Mantener la pausa mientras hay eventos de resize seguidos
    resizeTimeout = setTimeout(() => {
      document.documentElement.classList.remove('resizing');
    }, 180); // ~1-2 frames tras el último resize
  };
  window.addEventListener('resize', onResizeStart, { passive: true });
  window.addEventListener('orientationchange', onResizeStart, { passive: true });
}

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <CakesProvider>
      <App />
    </CakesProvider>
  </React.StrictMode>
);
