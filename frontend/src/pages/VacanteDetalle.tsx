import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import api from '../services/api';

interface Vacante {
  id: number;
  titulo: string;
  empresa_nombre: string;
  descripcion: string;
  requisitos: any;
  salario_min: string;
  salario_max: string;
  modalidad: string;
  ubicacion: string;
  fecha_publicacion: string;
  activa: boolean;
}

const VacanteDetalle: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [vacante, setVacante] = useState<Vacante | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchVacante = async () => {
      try {
        const response = await api.get(`/vacantes/${id}/`);
        setVacante(response.data);
        setLoading(false);
      } catch (error) {
        console.error('Error:', error);
        setLoading(false);
      }
    };

    fetchVacante();
  }, [id]);

  const handleAplicar = () => {
    const token = localStorage.getItem('access_token');
    if (!token) {
      alert('Debes iniciar sesión para aplicar');
      navigate('/login');
      return;
    }
    alert('¡Aplicación enviada! (Funcionalidad pendiente)');
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-xl text-talenthub-gray">Cargando...</div>
      </div>
    );
  }

  if (!vacante) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-xl text-gray-600">Vacante no encontrada</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
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
      <div className="max-w-4xl mx-auto px-4 py-8">
        <Link to="/vacantes" className="text-talenthub-blue hover:underline mb-4 inline-block">
          ← Volver a vacantes
        </Link>

        <div className="bg-white rounded-lg shadow-lg p-8">
          {/* Header */}
          <div className="border-b pb-6 mb-6">
            <div className="flex justify-between items-start mb-4">
              <div>
                <h1 className="text-4xl font-bold text-talenthub-gray mb-2">
                  {vacante.titulo}
                </h1>
                <p className="text-xl text-gray-600">{vacante.empresa_nombre}</p>
              </div>
              <span className={`px-4 py-2 rounded-full text-sm font-semibold ${
                vacante.modalidad === 'remoto' ? 'bg-green-100 text-green-800' :
                vacante.modalidad === 'presencial' ? 'bg-blue-100 text-blue-800' :
                'bg-purple-100 text-purple-800'
              }`}>
                {vacante.modalidad.charAt(0).toUpperCase() + vacante.modalidad.slice(1)}
              </span>
            </div>

            <div className="flex items-center gap-6 text-gray-600">
              <div>
                <span className="text-sm">📍</span> {vacante.ubicacion}
              </div>
              <div>
                <span className="text-sm">📅</span> {new Date(vacante.fecha_publicacion).toLocaleDateString('es-MX')}
              </div>
            </div>
          </div>

          {/* Salario */}
          <div className="bg-blue-50 border-l-4 border-talenthub-blue p-6 mb-6 rounded">
            <h2 className="text-lg font-semibold text-talenthub-gray mb-2">💰 Salario</h2>
            <p className="text-3xl font-bold text-talenthub-blue">
              ${parseFloat(vacante.salario_min).toLocaleString()} - ${parseFloat(vacante.salario_max).toLocaleString()} MXN
            </p>
            <p className="text-sm text-gray-600 mt-1">Mensual</p>
          </div>

          {/* Descripción */}
          <div className="mb-6">
            <h2 className="text-2xl font-bold text-talenthub-gray mb-4">Descripción del puesto</h2>
            <p className="text-gray-700 leading-relaxed whitespace-pre-line">
              {vacante.descripcion}
            </p>
          </div>

          {/* Requisitos */}
          <div className="mb-8">
            <h2 className="text-2xl font-bold text-talenthub-gray mb-4">Requisitos</h2>
            <div className="bg-gray-50 p-6 rounded-lg">
              {typeof vacante.requisitos === 'object' ? (
                <div className="space-y-4">
                  {vacante.requisitos.lenguajes && (
                    <div>
                      <h3 className="font-semibold text-gray-800 mb-2">Tecnologías:</h3>
                      <div className="flex flex-wrap gap-2">
                        {vacante.requisitos.lenguajes.map((tech: string, index: number) => (
                          <span key={index} className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm font-semibold">
                            {tech}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                  {vacante.requisitos.experiencia && (
                    <div>
                      <h3 className="font-semibold text-gray-800 mb-2">Experiencia:</h3>
                      <p className="text-gray-700">{vacante.requisitos.experiencia}</p>
                    </div>
                  )}
                </div>
              ) : (
                <p className="text-gray-700">{vacante.requisitos}</p>
              )}
            </div>
          </div>

          {/* Botón Aplicar */}
          <div className="border-t pt-6">
            <button
              onClick={handleAplicar}
              className="w-full bg-talenthub-blue text-white py-4 rounded-lg font-bold text-lg hover:bg-blue-700 transition shadow-lg"
            >
              Aplicar a esta vacante
            </button>
            <p className="text-center text-sm text-gray-500 mt-3">
              Al aplicar, tu perfil será enviado directamente a {vacante.empresa_nombre}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default VacanteDetalle;