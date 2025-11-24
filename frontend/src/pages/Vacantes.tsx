import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../services/api';

interface Vacante {
  id: number;
  titulo: string;
  empresa_nombre: string;
  descripcion: string;
  salario_min: string;
  salario_max: string;
  modalidad: string;
  ubicacion: string;
  fecha_publicacion: string;
}

const Vacantes: React.FC = () => {
  const [vacantes, setVacantes] = useState<Vacante[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchVacantes = async () => {
      try {
        const response = await api.get('/vacantes/');
        setVacantes(response.data);
        setLoading(false);
      } catch (error) {
        console.error('Error al cargar vacantes:', error);
        setLoading(false);
      }
    };

    fetchVacantes();
  }, []);

  const getModalidadColor = (modalidad: string) => {
    switch (modalidad) {
      case 'remoto': return 'bg-green-100 text-green-800';
      case 'presencial': return 'bg-blue-100 text-blue-800';
      case 'hibrido': return 'bg-purple-100 text-purple-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-xl text-talenthub-gray">Cargando vacantes...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Navbar */}
      {/* Navbar */}
<nav className="bg-white shadow-md">
  <div className="max-w-7xl mx-auto px-4 py-4 flex justify-between items-center">
    <Link to="/" className="text-2xl font-bold text-talenthub-blue">
      TalentHub México
    </Link>
    <div className="space-x-4">
      {localStorage.getItem('access_token') ? (
        <>
          <span className="text-talenthub-gray font-semibold">Bienvenido</span>
          <button 
            onClick={() => {
              localStorage.removeItem('access_token');
              localStorage.removeItem('refresh_token');
              window.location.href = '/';
            }}
            className="bg-red-500 text-white px-6 py-2 rounded-lg font-semibold hover:bg-red-600 transition"
          >
            Cerrar Sesión
          </button>
        </>
      ) : (
        <>
          <Link to="/login" className="text-talenthub-gray hover:text-talenthub-blue font-semibold">
            Iniciar Sesión
          </Link>
          <Link to="/register" className="bg-talenthub-blue text-white px-6 py-2 rounded-lg font-semibold hover:bg-blue-700 transition">
            Registrarse
          </Link>
        </>
      )}
    </div>
  </div>
</nav>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-talenthub-gray mb-2">
            Vacantes Disponibles
          </h1>
          <p className="text-gray-600">
            {vacantes.length} oportunidades encontradas
          </p>
        </div>

        {/* Vacantes List */}
        <div className="space-y-4">
          {vacantes.map((vacante) => (
            <div
              key={vacante.id}
              className="bg-white border-2 border-gray-200 rounded-lg p-6 hover:border-talenthub-blue hover:shadow-lg transition cursor-pointer"
            >
              <div className="flex justify-between items-start mb-3">
                <div>
                  <h2 className="text-2xl font-bold text-talenthub-gray mb-1">
                    {vacante.titulo}
                  </h2>
                  <p className="text-gray-600">{vacante.empresa_nombre}</p>
                </div>
                <span className={`px-3 py-1 rounded-full text-xs font-semibold ${getModalidadColor(vacante.modalidad)}`}>
                  {vacante.modalidad.charAt(0).toUpperCase() + vacante.modalidad.slice(1)}
                </span>
              </div>

              <p className="text-gray-700 mb-4">
                {vacante.descripcion.substring(0, 150)}...
              </p>

              <div className="flex justify-between items-center">
                <div>
                  <span className="text-talenthub-blue font-bold text-lg">
                    ${parseFloat(vacante.salario_min).toLocaleString()} - ${parseFloat(vacante.salario_max).toLocaleString()} MXN
                  </span>
                  <p className="text-sm text-gray-500">{vacante.ubicacion}</p>
                </div>
                <button className="bg-talenthub-blue text-white px-6 py-2 rounded-lg font-semibold hover:bg-blue-700 transition">
                  Ver detalles
                </button>
              </div>
            </div>
          ))}
        </div>

        {vacantes.length === 0 && (
          <div className="bg-white rounded-lg shadow-md p-8 text-center">
            <p className="text-xl text-gray-600">No hay vacantes disponibles en este momento</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Vacantes;