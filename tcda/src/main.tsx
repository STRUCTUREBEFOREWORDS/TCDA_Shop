import { createRoot } from "react-dom/client";
import { HelmetProvider } from "react-helmet-async";
import App from "./app/App.tsx";
import "./styles/index.css";
import { AppProvider } from "./app/context/AppContext";

createRoot(document.getElementById("root")!).render(
  <HelmetProvider>
    <AppProvider>
      <App />
    </AppProvider>
  </HelmetProvider>
);
