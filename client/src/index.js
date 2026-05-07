import React from "react";
import ReactDOM from "react-dom/client";
import "./index.css";
import App from "./App";
import "./config/axios"; // Initialize global axios defaults for deployment

const root = ReactDOM.createRoot(document.getElementById("root"));
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
