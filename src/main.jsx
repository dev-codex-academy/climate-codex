import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import {AuthProvider}  from './context/AuthContext.jsx';
import { CodexApp } from "./CodexApp.jsx";

import "./index.css";

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <AuthProvider>
      <BrowserRouter>
        <CodexApp />
      </BrowserRouter>
    </AuthProvider>
  </StrictMode>
);
