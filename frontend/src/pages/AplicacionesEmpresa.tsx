import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import api from '../services/api';
import { showSuccess, showError } from '../utils/alerts'; // IMPORTACIÓN NUEVA

interface Aplicacion {
  id: number;
  usuario_nombre: string;
  vacante_titulo: string;
  vacante: number;
  estado: string;
  fecha_aplicacion: string;
  cv_url?: string;
  carta_presentacion?: string;
}

const AplicacionesEmpresa: React.FC = () => {
  const navigate = useNavigate();
  const [aplicaciones, setAplicaciones] = useState<Aplicacion[]>([]);
  const [loading, setLoading] = useState(true);
  const [filtroEstado, setFiltroEstado] = useState('');

  useEffect(() => {
    const token = localStorage.getItem('token');
    const userTipo = localStorage.getItem('user_tipo');
    
    if (!token) {
      showError('Debes iniciar sesión para ver tus aplicaciones'); // ALERTA NUEVA
      navigate('/login');
      return;
    }
    
    if (userTipo !== 'empresa') {
      showError('Solo las empresas pueden acceder a este panel'); // ALERTA NUEVA
      navigate('/vacantes');
      return;
    }
    
    fetchAplicaciones();
  }, [navigate]);

  const fetchAplicaciones = async () => {
    try {
      const userId = localStorage.getItem('user_id');
      const empresaResponse = await api.get(`/empresas/?usuario=${userId}`);

      if (empresaResponse.data && empresaResponse.data.length > 0) {
        const empresaId = empresaResponse.data[0].id;
        const response = await api.get(`/aplicaciones/?empresa=${empresaId}`);
        setAplicaciones(response.data);
      } else {
        setAplicaciones([]);
      }
      setLoading(false);
    } catch (error) {
      console.error('Error:', error);
      setLoading(false);
    }
  };

  const cambiarEstado = async (id: number, nuevoEstado: string) => {
    try {
      await api.patch(`/aplicaciones/${id}/`, { estado: nuevoEstado });
      showSuccess(`Estado cambiado a: ${nuevoEstado.toUpperCase()}`); // ALERTA NUEVA
      fetchAplicaciones();
    } catch (error) {
      showError('Error al cambiar el estado del candidato'); // ALERTA NUEVA
    }
  };

  const getEstadoColor = (estado: string) => {
    switch (estado) {
      case 'pendiente': return 'bg-yellow-100 text-yellow-800 border-yellow-300';
      case 'revisado': return 'bg-blue-100 text-blue-800 border-blue-300';
      case 'aceptado': return 'bg-green-100 text-green-800 border-green-300';
      case 'rechazado': return 'bg-red-100 text-red-800 border-red-300';
      default: return 'bg-gray-100 text-gray-800 border-gray-300';
    }
  };

  const aplicacionesFiltradas = filtroEstado 
    ? aplicaciones.filter(a => a.estado === filtroEstado)
    : aplicaciones;

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-xl text-talenthub-gray font-semibold">Cargando aplicaciones...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <div className="max-w-7xl w-full mx-auto px-4 py-8 flex-grow">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-4xl font-bold text-talenthub-gray mb-2">
              Aplicaciones Recibidas
            </h1>
            <p className="text-gray-600 font-medium">{aplicacionesFiltradas.length} aplicaciones</p>
          </div>
        </div>

        {/* Filtros */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <h2 className="text-lg font-bold text-talenthub-gray mb-4">Filtrar por estado</h2>
          <div className="flex flex-wrap gap-3">
            <button
              onClick={() => setFiltroEstado('')}
              className={`px-4 py-2 rounded-lg font-semibold transition shadow-sm ${
                filtroEstado === '' 
                  ? 'bg-talenthub-blue text-white' 
                  : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
              }`}
            >
              Todas ({aplicaciones.length})
            </button>
            <button
              onClick={() => setFiltroEstado('pendiente')}
              className={`px-4 py-2 rounded-lg font-semibold transition shadow-sm ${
                filtroEstado === 'pendiente' 
                  ? 'bg-yellow-500 text-white' 
                  : 'bg-yellow-100 text-yellow-800 hover:bg-yellow-200'
              }`}
            >
              Pendientes ({aplicaciones.filter(a => a.estado === 'pendiente').length})
            </button>
            <button
              onClick={() => setFiltroEstado('revisado')}
              className={`px-4 py-2 rounded-lg font-semibold transition shadow-sm ${
                filtroEstado === 'revisado' 
                  ? 'bg-blue-500 text-white' 
                  : 'bg-blue-100 text-blue-800 hover:bg-blue-200'
              }`}
            >
              En Revisión ({aplicaciones.filter(a => a.estado === 'revisado').length})
            </button>
            <button
              onClick={() => setFiltroEstado('aceptado')}
              className={`px-4 py-2 rounded-lg font-semibold transition shadow-sm ${
                filtroEstado === 'aceptado' 
                  ? 'bg-green-500 text-white' 
                  : 'bg-green-100 text-green-800 hover:bg-green-200'
              }`}
            >
              Aceptados ({aplicaciones.filter(a => a.estado === 'aceptado').length})
            </button>
            <button
              onClick={() => setFiltroEstado('rechazado')}
              className={`px-4 py-2 rounded-lg font-semibold transition shadow-sm ${
                filtroEstado === 'rechazado' 
                  ? 'bg-red-500 text-white' 
                  : 'bg-red-100 text-red-800 hover:bg-red-200'
              }`}
            >
              Rechazados ({aplicaciones.filter(a => a.estado === 'rechazado').length})
            </button>
          </div>
        </div>

        {/* Lista de Aplicaciones */}
        <div className="space-y-4">
          {aplicacionesFiltradas.map((aplicacion) => (
            <div key={aplicacion.id} className={`bg-white rounded-lg shadow-md p-6 border-l-4 ${getEstadoColor(aplicacion.estado)}`}>
              <div className="flex justify-between items-start mb-4">
                <div className="flex-1">
                  <h3 className="text-2xl font-bold text-talenthub-gray mb-1">
                    {aplicacion.usuario_nombre}
                  </h3>
                  
                  {/* BOTÓN CV */}
                  <a
                    href={aplicacion.cv_url || "https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf"}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-block bg-gray-100 text-talenthub-blue px-4 py-2 mt-1 mb-3 rounded-lg font-bold text-sm hover:bg-gray-200 transition border border-gray-300 shadow-sm"
                  >
                    📄 Ver Currículum (CV)
                  </a>
                  <p className="text-gray-600 mb-2 font-medium">
                    Aplicó a: <Link to={`/vacantes/${aplicacion.vacante}`} className="text-talenthub-blue hover:underline font-bold">
                      {aplicacion.vacante_titulo}
                    </Link>
                  </p>
                  <p className="text-sm text-gray-500 font-medium">
                    📅 {new Date(aplicacion.fecha_aplicacion).toLocaleDateString('es-MX', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit'
                    })}
                  </p>
                </div>
                <span className={`px-4 py-2 rounded-full text-sm font-bold border-2 shadow-sm ${getEstadoColor(aplicacion.estado)}`}>
                  {aplicacion.estado.toUpperCase()}
                </span>
              </div>

              {aplicacion.carta_presentacion && (
                <div className="bg-gray-50 p-4 rounded-lg mb-4 border border-gray-200">
                  <h4 className="font-bold text-gray-800 mb-2">Carta de presentación:</h4>
                  <p className="text-gray-700 text-sm leading-relaxed">{aplicacion.carta_presentacion}</p>
                </div>
              )}

              {/* Acciones */}
              <div className="flex flex-wrap gap-2 pt-4 border-t">
                <button
                  onClick={() => cambiarEstado(aplicacion.id, 'revisado')}
                  disabled={aplicacion.estado === 'revisado'}
                  className="bg-blue-500 text-white px-4 py-2 rounded-lg font-semibold hover:bg-blue-600 transition disabled:bg-gray-400 disabled:cursor-not-allowed shadow-sm"
                >
                  Marcar como Revisado
                </button>
                <button
                  onClick={() => cambiarEstado(aplicacion.id, 'aceptado')}
                  disabled={aplicacion.estado === 'aceptado'}
                  className="bg-green-500 text-white px-4 py-2 rounded-lg font-semibold hover:bg-green-600 transition disabled:bg-gray-400 disabled:cursor-not-allowed shadow-sm"
                >
                  ✓ Aceptar
                </button>
                <button
                  onClick={() => cambiarEstado(aplicacion.id, 'rechazado')}
                  disabled={aplicacion.estado === 'rechazado'}
                  className="bg-red-500 text-white px-4 py-2 rounded-lg font-semibold hover:bg-red-600 transition disabled:bg-gray-400 disabled:cursor-not-allowed shadow-sm"
                >
                  ✗ Rechazar
                </button>
              </div>
            </div>
          ))}
        </div>

        {aplicacionesFiltradas.length === 0 && (
          <div className="bg-white rounded-lg shadow-md p-12 text-center border-t-4 border-talenthub-blue mt-4">
            <h3 className="text-2xl font-bold text-gray-700 mb-4">
              {filtroEstado ? 'No hay aplicaciones con este estado' : 'No has recibido aplicaciones aún'}
            </h3>
            <p className="text-gray-500 mb-6 text-lg">
              {filtroEstado 
                ? 'Prueba seleccionando otro filtro'
                : 'Las aplicaciones a tus vacantes aparecerán aquí'
              }
            </p>
            {filtroEstado && (
              <button
                onClick={() => setFiltroEstado('')}
                className="bg-talenthub-blue text-white px-8 py-3 rounded-lg font-bold hover:bg-blue-700 transition shadow-md"
              >
                Ver todas las aplicaciones
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default AplicacionesEmpresa;
