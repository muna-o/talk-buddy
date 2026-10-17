import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { applyPreferences, readPreferences } from "./services/preferences";
import "./index.css";
import App from "./App.jsx";
applyPreferences(readPreferences());
createRoot(document.getElementById("root")).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
