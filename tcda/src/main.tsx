import { createRoot } from "react-dom/client";
import App from "./app/App.tsx";
import "./styles/index.css";
import { AppProvider } from "./app/context/AppContext";

createRoot(document.getElementById("root")!).render(
  <AppProvider>
    <App />
  </AppProvider>
);
