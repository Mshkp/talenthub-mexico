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
    // Usamos el nombre de token correcto
    const token = localStorage.getItem('token');
    const userTipo = localStorage.getItem('user_tipo');
    
    if (!token) {
      alert('Debes iniciar sesión para ver tus postulaciones');
      navigate('/login');
      return;
    }
    
    if (userTipo !== 'aspirante') {
      alert('Solo los aspirantes pueden ver sus aplicaciones');
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
        <div className="text-xl text-talenthub-gray font-semibold">Cargando tus postulaciones...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <div className="max-w-7xl w-full mx-auto px-4 py-8 flex-grow">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-talenthub-gray mb-2">
            Mis Aplicaciones
          </h1>
          <p className="text-gray-600 text-lg font-medium">{aplicaciones.length} aplicaciones realizadas</p>
        </div>

        <div className="space-y-4">
          {aplicaciones.map((aplicacion) => (
            <div key={aplicacion.id} className="bg-white rounded-lg shadow-md p-6 border-l-4 border-talenthub-blue">
              <div className="flex justify-between items-start">
                <div className="flex-1">
                  <h3 className="text-2xl font-bold text-talenthub-gray mb-2">
                    {aplicacion.vacante_titulo}
                  </h3>
                  <p className="text-sm text-gray-500 mb-4 font-medium">
                    Aplicado el {new Date(aplicacion.fecha_aplicacion).toLocaleDateString('es-MX', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric'
                    })}
                  </p>
                  <span className={`px-4 py-1.5 rounded-full text-sm font-bold shadow-sm ${getEstadoColor(aplicacion.estado)}`}>
                    {getEstadoTexto(aplicacion.estado)}
                  </span>
                </div>
                <Link
                  to={`/vacantes/${aplicacion.vacante}`}
                  className="bg-talenthub-blue text-white px-6 py-2.5 rounded-lg font-bold hover:bg-blue-700 transition shadow-md"
                >
                  Ver Detalles
                </Link>
              </div>
            </div>
          ))}
        </div>

        {aplicaciones.length === 0 && (
          <div className="bg-white rounded-lg shadow-md p-12 text-center border-t-4 border-talenthub-blue">
            <h3 className="text-3xl font-bold text-gray-700 mb-4">No tienes aplicaciones aún</h3>
            <p className="text-gray-500 mb-8 text-lg">Explora las vacantes disponibles y aplica a las que más te interesen para impulsar tu carrera.</p>
            <Link
              to="/vacantes"
              className="inline-block bg-talenthub-blue text-white px-10 py-4 rounded-lg font-bold text-lg hover:bg-blue-700 transition shadow-lg"
            >
              Explorar Vacantes
            </Link>
          </div>
        )}
      </div>
    </div>
  );
};

export default MisAplicaciones;