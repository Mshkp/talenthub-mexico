import React, { useState, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import { AnimatePresence, motion } from "framer-motion";
import { Bell, Menu, X, LogOut } from "lucide-react";
import api from "../services/api";
import { Button } from "./ui";
import { cx } from "../lib/cx";
import { EASE, DUR } from "../lib/motion";

/**
 * Nav flotante oscuro sobre contenido claro.
 *
 * Es el componente firma del sistema: en vez de una barra blanca pegada al
 * borde, un pill oscuro translúcido que flota separado del viewport. Sobre el
 * hero oscuro se funde; sobre el contenido claro contrasta. Ese cruce es lo
 * que distingue al sitio de cualquier otro portal claro.
 *
 * La lógica de roles, el contador de notificaciones y el menú móvil son los
 * de siempre — aquí solo cambió la forma.
 */
const Navbar: React.FC = () => {
  const location = useLocation();
  const isHome = location.pathname === "/";
  const isAuthPage = location.pathname === "/login" || location.pathname === "/register";

  const token = localStorage.getItem("token");
  const username = localStorage.getItem("user_username");
  const tipo = localStorage.getItem("user_tipo");

  const [unreadCount, setUnreadCount] = useState(0);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  useEffect(() => {
    if (!token) return;
    const fetchNotifications = async () => {
      try {
        const response = await api.get("/notificaciones/");
        setUnreadCount(response.data.filter((n: any) => !n.leido).length);
      } catch (error) {
        console.error("Error cargando notificaciones");
      }
    };
    fetchNotifications();
  }, [token, location.pathname]);

  // Cerrar el menú al cambiar de ruta: si no, queda abierto sobre la página nueva.
  useEffect(() => {
    setIsMobileMenuOpen(false);
  }, [location.pathname]);

  const logout = () => {
    localStorage.clear();
    window.location.href = "/";
  };

  if (isAuthPage) return null;

  let rutaLogo = "/";
  if (token) {
    rutaLogo = tipo === "empresa" ? "/dashboard" : "/vacantes";
  }

  const linkClass = "text-[0.9375rem] text-white/70 transition-colors duration-200 hover:text-white";

  const navLinks = (
    <>
      {!isHome && tipo !== "empresa" && tipo !== "validador" && (
        <Link to="/vacantes" className={linkClass}>
          Vacantes
        </Link>
      )}

      {tipo === "aspirante" && (
        <>
          <Link to="/mi-perfil" className={linkClass}>
            Mi perfil
          </Link>
          <Link to="/mis-aplicaciones" className={linkClass}>
            Mis postulaciones
          </Link>
        </>
      )}

      {tipo === "empresa" && (
        <>
          <Link to="/dashboard" className={linkClass}>
            Dashboard
          </Link>
          <Link to="/aplicaciones-empresa" className={linkClass}>
            Postulaciones
          </Link>
        </>
      )}

      {tipo === "validador" && (
        <Link to="/validador" className={cx(linkClass, "text-accent-on-dark hover:text-accent-on-dark")}>
          Panel de auditoría
        </Link>
      )}

      {!isHome && tipo !== "validador" && (
        <Link to="/planes" className={linkClass}>
          Planes
        </Link>
      )}

      <Link to="/politicas" className={linkClass}>
        Privacidad
      </Link>
    </>
  );

  const sessionControls = !token ? (
    <>
      <Link to="/login" className={linkClass}>
        Iniciar sesión
      </Link>
      <Link to="/register">
        <Button variant="primary" tone="dark" size="sm">
          Registrarse
        </Button>
      </Link>
    </>
  ) : (
    <>
      <Link
        to="/mis-aplicaciones"
        aria-label={unreadCount > 0 ? `Notificaciones: ${unreadCount} sin leer` : "Notificaciones"}
        className="relative text-white/60 transition-colors duration-200 hover:text-white"
      >
        <Bell size={20} strokeWidth={1.6} />
        {unreadCount > 0 && (
          <span className="absolute -right-1.5 -top-1.5 flex h-[17px] min-w-[17px] items-center justify-center rounded-pill bg-accent px-1 text-[0.6875rem] font-mid text-white">
            {unreadCount}
          </span>
        )}
      </Link>

      <span className="text-[0.9375rem] text-white/70">
        Hola, <span className="text-white">{username}</span>
      </span>

      <Button variant="ghost" tone="dark" size="sm" onClick={logout}>
        <LogOut size={14} strokeWidth={1.8} />
        Cerrar sesión
      </Button>
    </>
  );

  return (
    <div className="pointer-events-none sticky top-0 z-50 px-4 pt-4 md:px-7 md:pt-5">
      <nav
        className={cx(
          "pointer-events-auto mx-auto max-w-[940px]",
          "rounded-nav border border-hairline-d bg-elevated/80 shadow-glass-edge-d",
          "backdrop-blur-nav backdrop-saturate-150"
        )}
      >
        <div className="flex items-center justify-between gap-6 py-2 pl-5 pr-2">
          <Link to={rutaLogo} className="whitespace-nowrap text-[1rem] font-mid tracking-[-0.015em] text-white">
            TalentHub
          </Link>

          <div className="hidden items-center gap-6 lg:flex">{navLinks}</div>
          <div className="hidden items-center gap-5 lg:flex">{sessionControls}</div>

          <button
            type="button"
            aria-expanded={isMobileMenuOpen}
            aria-label={isMobileMenuOpen ? "Cerrar menú" : "Abrir menú"}
            className="text-white/80 transition-colors hover:text-white lg:hidden"
            onClick={() => setIsMobileMenuOpen((open) => !open)}
          >
            {isMobileMenuOpen ? <X size={22} /> : <Menu size={22} />}
          </button>
        </div>

        <AnimatePresence initial={false}>
          {isMobileMenuOpen && (
            <motion.div
              key="mobile"
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: DUR.base, ease: EASE }}
              className="overflow-hidden lg:hidden"
            >
              <div className="flex flex-col gap-5 border-t border-hairline-d px-5 py-5">
                {navLinks}
                <div className="flex flex-wrap items-center gap-4 border-t border-hairline-d pt-5">
                  {sessionControls}
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </nav>
    </div>
  );
};

export default Navbar;
