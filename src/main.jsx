import React from "react";
import { createRoot } from "react-dom/client";
import { registerCampusOLXServiceWorker } from "./registerSW.js";
import App from "./App.jsx";
import "./styles.css";

const rootElement = document.getElementById("root");

if (!rootElement) {
  throw new Error('Root element with id="root" was not found in index.html.');
}

registerCampusOLXServiceWorker();

createRoot(rootElement).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
