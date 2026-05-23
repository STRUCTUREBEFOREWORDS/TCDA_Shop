import { createRoot } from "react-dom/client";
import { HelmetProvider } from "react-helmet-async";
import App from "./app/App.tsx";
import "./styles/index.css";
import { AppProvider } from "./app/context/AppContext";
import "./app/i18n";

if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/sw.js', {
      scope: '/',
      updateViaCache: 'none',
    }).then(reg => {
      reg.update()
      navigator.serviceWorker.addEventListener('controllerchange', () => {
        window.location.reload()
      })
    })
  })
}

createRoot(document.getElementById("root")!).render(
  <HelmetProvider>
    <AppProvider>
      <App />
    </AppProvider>
  </HelmetProvider>
);
