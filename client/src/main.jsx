import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App.jsx";
import ErrorBoundary from "./components/ErrorBoundary.jsx";
import "./styles/index.css";

const rootEl = document.getElementById("root");

if (!rootEl) {
  document.body.textContent =
    "MoonGuide AI could not start because the page is missing its main container. Please reload or ask a store employee for help.";
} else {
  ReactDOM.createRoot(rootEl).render(
    <React.StrictMode>
      <ErrorBoundary>
        <App />
      </ErrorBoundary>
    </React.StrictMode>
  );
}
