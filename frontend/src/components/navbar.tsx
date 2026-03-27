import React from "react";
import { Link, useNavigate } from "react-router-dom";

const Navbar: React.FC = () => {

  const navigate = useNavigate();

  const token = localStorage.getItem("token");
  const username = localStorage.getItem("user_username");
  const tipo = localStorage.getItem("user_tipo");

  const logout = () => {
    localStorage.clear();
    navigate("/");
  };

  return (

    <nav className="bg-white shadow-md px-8 py-4 flex justify-between items-center">

      <Link to="/" className="text-2xl font-bold text-talenthub-blue">
        TalentHub México
      </Link>

      <div className="flex gap-4 items-center">

        <Link to="/vacantes" className="text-gray-700 hover:text-blue-600">
          Vacantes
        </Link>

        {tipo === "empresa" && (
          <Link to="/dashboard" className="text-gray-700 hover:text-blue-600">
            Dashboard
          </Link>
        )}

        <Link to="/planes" className="text-gray-700 hover:text-blue-600">
          Planes
        </Link>

        {!token ? (
          <>
            <Link to="/login" className="text-gray-700">
              Iniciar Sesión
            </Link>

            <Link
              to="/register"
              className="bg-blue-600 text-white px-4 py-2 rounded-lg"
            >
              Registrarse
            </Link>
          </>
        ) : (
          <>
            <span className="text-gray-700 font-semibold">
              Hola {username}
            </span>

            <button
              onClick={logout}
              className="bg-red-500 text-white px-4 py-2 rounded-lg"
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