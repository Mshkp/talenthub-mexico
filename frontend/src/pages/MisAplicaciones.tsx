import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import api from '../services/api';

interface Aplicacion {
  id: number;
  vacante_titulo: string;
  estado: string;
  fecha_aplicacion: string;
  vacante: number;
}

const MisAplicaciones: React.FC = () => {
  const navigate = useNavigate();
  const [aplicaciones, setAplicaciones] = useState<Aplicacion[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
  const token = localStorage.getItem('access_token');
  const userTipo = localStorage.getItem('user_tipo');
  
  if (!token) {
    alert('Debes iniciar sesión');
    navigate('/login');
    return;
  }
  
  if (userTipo !== 'aspirante') {
    alert('Solo los aspirantes pueden ver aplicaciones');
    navigate('/dashboard');
    return;
  }
  
  fetchAplicaciones();
}, [navigate]);

  const fetchAplicaciones = async () => {
    try {
      const response = await api.get('/aplicaciones/');
      setAplicaciones(response.data);
      setLoading(false);
    } catch (error) {
      console.error('Error:', error);
      setLoading(false);
    }
  };

  const getEstadoColor = (estado: string) => {
    switch (estado) {
      case 'pendiente': return 'bg-yellow-100 text-yellow-800';
      case 'revisado': return 'bg-blue-100 text-blue-800';
      case 'aceptado': return 'bg-green-100 text-green-800';
      case 'rechazado': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getEstadoTexto = (estado: string) => {
    switch (estado) {
      case 'pendiente': return 'Pendiente';
      case 'revisado': return 'En Revisión';
      case 'aceptado': return 'Aceptado';
      case 'rechazado': return 'Rechazado';
      default: return estado;
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-xl text-talenthub-gray">Cargando...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Navbar */}
<nav className="bg-white shadow-md">
  <div className="max-w-7xl mx-auto px-4 py-4 flex justify-between items-center">
    <Link to="/vacantes" className="text-2xl font-bold text-talenthub-blue">
      TalentHub México
    </Link>
    <div className="flex items-center gap-4">
      {localStorage.getItem('access_token') ? (
        <>
          {localStorage.getItem('user_tipo') === 'aspirante' ? (
            <Link to="/mis-aplicaciones" className="text-talenthub-gray hover:text-talenthub-blue font-semibold">
              Mis Aplicaciones
            </Link>
          ) : (
            <Link to="/dashboard" className="text-talenthub-gray hover:text-talenthub-blue font-semibold">
              Dashboard
            </Link>
          )}
          <span className="text-talenthub-gray font-semibold">
            Hola, {localStorage.getItem('user_username')}
          </span>
          <button 
            onClick={() => {
              localStorage.clear();
              navigate('/');
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
            Mis Aplicaciones
          </h1>
          <p className="text-gray-600">{aplicaciones.length} aplicaciones realizadas</p>
        </div>

        {/* Lista de Aplicaciones */}
        <div className="space-y-4">
          {aplicaciones.map((aplicacion) => (
            <div key={aplicacion.id} className="bg-white rounded-lg shadow-md p-6">
              <div className="flex justify-between items-start">
                <div className="flex-1">
                  <h3 className="text-xl font-bold text-talenthub-gray mb-2">
                    {aplicacion.vacante_titulo}
                  </h3>
                  <p className="text-sm text-gray-600 mb-3">
                    Aplicado el {new Date(aplicacion.fecha_aplicacion).toLocaleDateString('es-MX', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric'
                    })}
                  </p>
                  <span className={`px-3 py-1 rounded-full text-sm font-semibold ${getEstadoColor(aplicacion.estado)}`}>
                    {getEstadoTexto(aplicacion.estado)}
                  </span>
                </div>
                <Link
                  to={`/vacantes/${aplicacion.vacante}`}
                  className="bg-talenthub-blue text-white px-6 py-2 rounded-lg font-semibold hover:bg-blue-700 transition"
                >
                  Ver Vacante
                </Link>
              </div>
            </div>
          ))}
        </div>

        {aplicaciones.length === 0 && (
          <div className="bg-white rounded-lg shadow-md p-12 text-center">
            <h3 className="text-2xl font-bold text-gray-600 mb-4">No tienes aplicaciones aún</h3>
            <p className="text-gray-500 mb-6">Explora las vacantes disponibles y aplica a las que te interesen</p>
            <Link
              to="/vacantes"
              className="inline-block bg-talenthub-blue text-white px-8 py-3 rounded-lg font-semibold hover:bg-blue-700 transition"
            >
              Ver Vacantes
            </Link>
          </div>
        )}
      </div>
    </div>
  );
};

export default MisAplicaciones;