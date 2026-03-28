import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Navbar from './components/navbar';
import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';
import Vacantes from './pages/Vacantes';
import VacanteDetalle from './pages/VacanteDetalle';
import Dashboard from './pages/Dashboard';
import MisAplicaciones from './pages/MisAplicaciones';
import AplicacionesEmpresa from './pages/AplicacionesEmpresa';
import Perfil from './pages/PerfilAspirante';
import Planes from "./pages/planes";
import Checkout from './pages/Checkout';
import DashboardValidador from './pages/DashboardValidador';
import PerfilAspirante from './pages/PerfilAspirante';

function App() {
  return (
    <Router>
      {/* El Navbar inteligente siempre va aquí arriba */}
      <Navbar /> 
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
        <Route path="/checkout/:planId" element={<Checkout />} />
        <Route path="/validador" element={<DashboardValidador />} />
        <Route path="/mi-perfil" element={<PerfilAspirante />} />
      </Routes>
    </Router>
  );
}

export default App;