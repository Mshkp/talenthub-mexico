import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';
import Vacantes from './pages/Vacantes';
import VacanteDetalle from './pages/VacanteDetalle';
import Dashboard from './pages/Dashboard';
import MisAplicaciones from './pages/MisAplicaciones';
import AplicacionesEmpresa from './pages/AplicacionesEmpresa';
import Perfil from './pages/Perfil';
import Planes from "./pages/planes";


function App() {
  return (
    <Router>
      
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/vacantes" element={<Vacantes />} />
        <Route path="/vacantes/:id" element={<VacanteDetalle />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/mis-aplicaciones" element={<MisAplicaciones />} />
        <Route path="/aplicaciones-empresa" element={<AplicacionesEmpresa />} />
        <Route path="/perfil" element={<Perfil />} />
        <Route path="/planes" element={<Planes />} />
      </Routes>
    </Router>
  );
}

export default App;