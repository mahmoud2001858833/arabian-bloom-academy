import React from "react";
import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import "./index.css";

// Get the root element
const container = document.getElementById("root");

if (!container) {
  throw new Error("Failed to find the root element");
}

// Create and render root
createRoot(container).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
