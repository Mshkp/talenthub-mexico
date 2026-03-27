import React from "react";
import { Link, useLocation } from "react-router-dom";

const Navbar: React.FC = () => {
  const location = useLocation();
  const isHome = location.pathname === "/"; // Detecta si estamos en el Index
  const isAuthPage = location.pathname === "/login" || location.pathname === "/register";

  const token = localStorage.getItem("token");
  const username = localStorage.getItem("user_username");
  const tipo = localStorage.getItem("user_tipo");

  const logout = () => {
    localStorage.clear();
    window.location.href = "/";
  };

  // Si estamos en Login o Register, ocultamos el Navbar entero para que se vea más limpio
  if (isAuthPage) return null;

  return (
    <nav className="bg-white shadow-md px-8 py-4 flex justify-between items-center">
      <Link to="/" className="text-2xl font-bold text-talenthub-blue">
        TalentHub México
      </Link>

      <div className="flex gap-4 items-center">
        
        {/* Vacantes: Se oculta en el Index. Solo lo ven Aspirantes o visitantes en otras páginas */}
        {!isHome && tipo !== "empresa" && (
          <Link to="/vacantes" className="text-gray-700 hover:text-blue-600 font-medium">
            Vacantes
          </Link>
        )}

        {/* Mis Postulaciones: Solo Aspirantes logueados */}
        {tipo === "aspirante" && (
          <Link to="/mis-aplicaciones" className="text-gray-700 hover:text-blue-600 font-medium">
            Mis Postulaciones
          </Link>
        )}

        {/* Dashboard: Solo Empresas logueadas */}
        {tipo === "empresa" && (
          <>
            <Link to="/dashboard" className="text-gray-700 hover:text-blue-600 font-medium">
              Dashboard
            </Link>
            <Link to="/aplicaciones-empresa" className="text-gray-700 hover:text-blue-600 font-medium">
              Postulaciones
            </Link>
          </>
        )}

        {/* Planes: Se oculta en el Index */}
        {!isHome && (
          <Link to="/planes" className="text-gray-700 hover:text-blue-600 font-medium">
            Planes
          </Link>
        )}

        {/* Botones de Autenticación */}
        {!token ? (
          <>
            <Link to="/login" className="text-gray-700 hover:text-blue-600 font-medium">
              Iniciar Sesión
            </Link>
            <Link
              to="/register"
              className="bg-blue-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-blue-700 transition"
            >
              Registrarse
            </Link>
          </>
        ) : (
          <>
            <span className="text-gray-700 font-semibold">
              Hola, {username}
            </span>
            <button
              onClick={logout}
              className="bg-red-500 text-white px-4 py-2 rounded-lg font-medium hover:bg-red-600 transition cursor-pointer"
            >
              Cerrar sesión
            </button>
          </>
        )}
      </div>
    </nav>
  );
};

export default Navbar;