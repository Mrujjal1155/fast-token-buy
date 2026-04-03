import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import "./index.css";

const SPA_REDIRECT_KEY = "spa-redirect-path";

try {
  const redirectPath = window.sessionStorage.getItem(SPA_REDIRECT_KEY);

  if (redirectPath) {
    window.sessionStorage.removeItem(SPA_REDIRECT_KEY);

    const currentPath = `${window.location.pathname}${window.location.search}${window.location.hash}`;
    if (redirectPath !== currentPath) {
      window.history.replaceState(null, "", redirectPath);
    }
  }
} catch {
  // Ignore sessionStorage access issues and continue booting the app.
}

createRoot(document.getElementById("root")!).render(<App />);
