import React, { useState, useEffect } from "react"; // Añade useState y useEffect
import { Link, useLocation } from "react-router-dom";
import api from "../services/api"; // Importa tu API
import { Bell } from "lucide-react"; // Usamos lucide-react para la campanita

const Navbar: React.FC = () => {
  const location = useLocation();
  const isHome = location.pathname === "/";
  const isAuthPage = location.pathname === "/login" || location.pathname === "/register";

  const token = localStorage.getItem("token");
  const username = localStorage.getItem("user_username");
  const tipo = localStorage.getItem("user_tipo");

  // Estado para la campanita
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    // Si hay usuario logueado, checamos sus notificaciones
    if (token) {
      const fetchNotifications = async () => {
        try {
          const response = await api.get('/notificaciones/');
          // Contamos cuántas tienen leido=false
          const unread = response.data.filter((n: any) => !n.leido).length;
          setUnreadCount(unread);
        } catch (error) {
          console.error("Error cargando notificaciones");
        }
      };
      fetchNotifications();
    }
  }, [token, location.pathname]); // Se actualiza al cambiar de ruta

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
    <nav className="bg-white shadow-md px-8 py-4 flex justify-between items-center">
      <Link to={rutaLogo} className="text-2xl font-bold text-talenthub-blue">
        TalentHub México
      </Link>

      <div className="flex gap-4 items-center">
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

        {/* ... (Tus otros links de empresa/validador/planes quedan igual) ... */}
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
            🛡️ Panel de Auditoría
          </Link>
        )}

        {!isHome && tipo !== "validador" && (
          <Link to="/planes" className="text-gray-700 hover:text-blue-600 font-medium">
            Planes
          </Link>
        )}

        {/* CONTROLES DE SESIÓN Y NOTIFICACIONES */}
        {!token ? (
          <>
            <Link to="/login" className="text-gray-700 hover:text-blue-600 font-medium">Iniciar Sesión</Link>
            <Link to="/register" className="bg-blue-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-blue-700 transition">Registrarse</Link>
          </>
        ) : (
          <div className="flex items-center gap-6">
            {/* LA CAMPANITA */}
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
              onClick={logout}
              className="bg-red-500 text-white px-4 py-2 rounded-lg font-medium hover:bg-red-600 transition cursor-pointer"
            >
              Cerrar sesión
            </button>
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navbar;