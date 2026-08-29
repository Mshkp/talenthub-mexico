import React, { useState, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import api from "../services/api";
import { Bell, Menu, X } from "lucide-react";

const Navbar: React.FC = () => {
  const location = useLocation();
  const isHome = location.pathname === "/";
  const isAuthPage = location.pathname === "/login" || location.pathname === "/register";

  const token = localStorage.getItem("token");
  const username = localStorage.getItem("user_username");
  const tipo = localStorage.getItem("user_tipo");

  // Estados
  const [unreadCount, setUnreadCount] = useState(0);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false); // <-- ESTADO DEL MENÚ MÓVIL

  useEffect(() => {
    if (token) {
      const fetchNotifications = async () => {
        try {
          const response = await api.get('/notificaciones/');
          const unread = response.data.filter((n: any) => !n.leido).length;
          setUnreadCount(unread);
        } catch (error) {
          console.error("Error cargando notificaciones");
        }
      };
      fetchNotifications();
    }
  }, [token, location.pathname]);

  const logout = () => {
    localStorage.clear();
    window.location.href = "/";
  };

  if (isAuthPage) return null;

  let rutaLogo = "/";
  if (token) {
    rutaLogo = tipo === "empresa" ? "/dashboard" : "/vacantes";
  }

  return (
    <nav className="bg-white shadow-md relative z-50">
      {/* Añadimos h-full y garantizamos que el flex alinee al centro */}
      <div className="px-6 md:px-8 py-4 flex justify-between items-center md:h-20">
        <Link to={rutaLogo} className="text-2xl font-bold text-talenthub-blue">
          TalentHub México
        </Link>

        {/* BOTÓN HAMBURGUESA (MÓVIL) - Solo visible en pantallas pequeñas */}
        <button
          className="md:hidden text-gray-700 hover:text-talenthub-blue focus:outline-none"
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
        >
          {isMobileMenuOpen ? <X size={28} /> : <Menu size={28} />}
        </button>

        {/* CONTENEDOR CENTRAL DE ENLACES (Magia Responsiva) */}
        <div
          className={`${
            isMobileMenuOpen
              ? "flex flex-col absolute top-full left-0 w-full bg-white shadow-xl py-6 px-8 gap-6 border-t border-gray-100"
              : "hidden"
          } md:flex md:static md:flex-row md:shadow-none md:py-0 md:px-0 md:gap-6 md:items-center md:h-full`}
          onClick={() => setIsMobileMenuOpen(false)}
        >
          {!isHome && tipo !== "empresa" && tipo !== "validador" && (
            <Link to="/vacantes" className="text-gray-700 hover:text-blue-600 font-medium">
              Vacantes
            </Link>
          )}

          {tipo === "aspirante" && (
            <>
              <Link to="/mi-perfil" className="text-gray-700 hover:text-blue-600 font-medium">
                Mi Perfil
              </Link>
              <Link to="/mis-aplicaciones" className="text-gray-700 hover:text-blue-600 font-medium">
                Mis Postulaciones
              </Link>
            </>
          )}

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

          {tipo === "validador" && (
            <Link to="/validador" className="text-red-600 font-bold hover:text-red-800 transition">
              Panel de Auditoría
            </Link>
          )}

          {!isHome && tipo !== "validador" && (
            <Link to="/planes" className="text-gray-700 hover:text-blue-600 font-medium">
              Planes
            </Link>
          )}

          <Link to="/politicas" className="text-gray-700 hover:text-blue-600 font-medium">
            Privacidad
          </Link>

          {/* CONTROLES DE SESIÓN Y NOTIFICACIONES */}
          {!token ? (
            <div className="flex flex-col md:flex-row md:items-center gap-4 md:gap-6 w-full md:w-auto mt-4 md:mt-0 pt-4 md:pt-0 border-t md:border-t-0 border-gray-100">
              <Link to="/login" className="text-gray-700 hover:text-blue-600 font-medium text-center md:text-left">
                Iniciar Sesión
              </Link>
              <Link to="/register" className="bg-blue-600 text-white px-5 py-2.5 rounded-lg font-medium hover:bg-blue-700 transition text-center">
                Registrarse
              </Link>
            </div>
          ) : (
            <div className="flex flex-col md:flex-row items-center gap-6 w-full md:w-auto mt-4 md:mt-0 pt-4 md:pt-0 border-t md:border-t-0 border-gray-100">
              <Link to="/mis-aplicaciones" className="relative text-gray-500 hover:text-talenthub-blue transition">
                <Bell size={24} />
                {unreadCount > 0 && (
                  <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs font-bold w-5 h-5 flex items-center justify-center rounded-full">
                    {unreadCount}
                  </span>
                )}
              </Link>

              <span className="text-gray-700 font-semibold">
                Hola, {username}
              </span>
              <button
                onClick={(e) => {
                  e.stopPropagation(); // Evita que el click interactúe con el contenedor padre antes del logout
                  logout();
                }}
                className="bg-red-500 text-white px-4 py-2 rounded-lg font-medium hover:bg-red-600 transition cursor-pointer w-full md:w-auto"
              >
                Cerrar sesión
              </button>
            </div>
          )}
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
