import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App.jsx";
import { site } from "./data/site";
import "./index.css";

// Colors come from site.js so each person's site has its own
const root = document.documentElement.style;
root.setProperty("--accent", site.accent);
root.setProperty("--highlight", site.highlight);

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);