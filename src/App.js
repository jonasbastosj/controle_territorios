import React from "react";
import { Routes, Route } from "react-router-dom";

import EnderecosPage from "./pages/EnderecosPage";
import AdicionarPage from "./pages/AdicionarPage";

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<EnderecosPage />} />
      <Route path="/adicionar" element={<AdicionarPage />} />
    </Routes>
  );
}
