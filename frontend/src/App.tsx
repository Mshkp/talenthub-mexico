import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';
import Vacantes from './pages/Vacantes';
import VacanteDetalle from './pages/VacanteDetalle';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/vacantes" element={<Vacantes />} />
        <Route path="/vacantes/:id" element={<VacanteDetalle />} />
      </Routes>
    </Router>
  );
}

export default App;