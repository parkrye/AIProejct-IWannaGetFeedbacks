import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { Layout } from "./ui/pages/Layout.tsx";
import { FeedbackPage } from "./ui/pages/FeedbackPage.tsx";
import { PersonaPage } from "./ui/pages/PersonaPage.tsx";
import "./index.css";

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <BrowserRouter>
      <Routes>
        <Route element={<Layout />}>
          <Route path="/" element={<FeedbackPage />} />
          <Route path="/personas" element={<PersonaPage />} />
        </Route>
      </Routes>
    </BrowserRouter>
  </StrictMode>,
);
