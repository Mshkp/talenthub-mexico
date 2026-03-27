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

  const handleAplicar = async () => {
    const token = localStorage.getItem('token');
    const userId = localStorage.getItem('user_id'); // Rescatamos tu ID
    
    if (!token || !userId) {
      alert('Debes iniciar sesión para aplicar');
      navigate('/login');
      return;
    }

    try {
      await api.post('/aplicaciones/', {
        vacante: id,
        usuario: userId, // <-- ¡EL ESLABÓN PERDIDO! Ahora Django sabe quién eres
        estado: 'pendiente'
      });
      alert('¡Aplicación enviada exitosamente!');
      navigate('/mis-aplicaciones');
    } catch (error: any) {
      if (error.response?.status === 400) {
        alert('Ya aplicaste a esta vacante o faltan datos');
      } else {
        alert('Error al aplicar. Intenta de nuevo.');
      }
    }
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
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <div className="max-w-4xl w-full mx-auto px-4 py-8 flex-grow">
        <Link to="/vacantes" className="text-talenthub-blue hover:underline mb-4 inline-block font-semibold">
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
                <p className="text-xl text-gray-600 font-medium">{vacante.empresa_nombre}</p>
              </div>
              <span className={`px-4 py-2 rounded-full text-sm font-semibold ${
                vacante.modalidad === 'remoto' ? 'bg-green-100 text-green-800' :
                vacante.modalidad === 'presencial' ? 'bg-blue-100 text-blue-800' :
                'bg-purple-100 text-purple-800'
              }`}>
                {vacante.modalidad.charAt(0).toUpperCase() + vacante.modalidad.slice(1)}
              </span>
            </div>

            <div className="flex items-center gap-6 text-gray-600 font-medium">
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
            <h2 className="text-lg font-bold text-talenthub-gray mb-2">💰 Salario</h2>
            <p className="text-3xl font-bold text-talenthub-blue">
              ${parseFloat(vacante.salario_min).toLocaleString()} - ${parseFloat(vacante.salario_max).toLocaleString()} MXN
            </p>
            <p className="text-sm text-gray-600 mt-1 font-medium">Mensual</p>
          </div>

          {/* Descripción */}
          <div className="mb-6">
            <h2 className="text-2xl font-bold text-talenthub-gray mb-4">Descripción del puesto</h2>
            <p className="text-gray-700 leading-relaxed whitespace-pre-line text-lg">
              {vacante.descripcion}
            </p>
          </div>

          {/* Requisitos */}
          <div className="mb-8">
            <h2 className="text-2xl font-bold text-talenthub-gray mb-4">Requisitos</h2>
            <div className="bg-gray-50 p-6 rounded-lg">
              {typeof vacante.requisitos === 'object' ? (
                <div className="space-y-4">
                  {vacante.requisitos?.lenguajes && (
                    <div>
                      <h3 className="font-bold text-gray-800 mb-2">Tecnologías:</h3>
                      <div className="flex flex-wrap gap-2">
                        {vacante.requisitos.lenguajes.map((tech: string, index: number) => (
                          <span key={index} className="bg-blue-100 text-blue-800 px-4 py-1.5 rounded-full text-sm font-bold shadow-sm">
                            {tech}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                  {vacante.requisitos?.experiencia && (
                    <div className="mt-4">
                      <h3 className="font-bold text-gray-800 mb-2">Experiencia:</h3>
                      <p className="text-gray-700 text-lg">{vacante.requisitos.experiencia}</p>
                    </div>
                  )}
                </div>
              ) : (
                <p className="text-gray-700 text-lg">{vacante.requisitos}</p>
              )}
            </div>
          </div>

          {/* Botón Aplicar */}
          <div className="border-t pt-6">
            {localStorage.getItem('user_tipo') === 'aspirante' ? (
              <>
                <button
                  onClick={handleAplicar}
                  className="w-full bg-talenthub-blue text-white py-4 rounded-lg font-bold text-xl hover:bg-blue-700 transition shadow-lg cursor-pointer"
                >
                  Aplicar a esta vacante
                </button>
                <p className="text-center text-sm text-gray-500 mt-4 font-medium">
                  Al aplicar, tu perfil será enviado directamente a {vacante.empresa_nombre}
                </p>
              </>
            ) : localStorage.getItem('user_tipo') === 'empresa' ? (
              <div className="bg-blue-50 border-l-4 border-talenthub-blue p-6 rounded">
                <p className="text-talenthub-gray font-bold text-lg">
                  📋 Esta es una de las vacantes publicadas en la plataforma
                </p>
                <p className="text-gray-600 mt-2 font-medium">
                  Como empresa, puedes gestionar tus vacantes desde el <Link to="/dashboard" className="text-talenthub-blue font-bold hover:underline">Dashboard</Link>
                </p>
              </div>
            ) : (
              <div className="text-center bg-gray-50 p-6 rounded-lg border">
                <p className="text-gray-600 mb-4 font-medium text-lg">Para aplicar a esta vacante, necesitas iniciar sesión</p>
                <Link 
                  to="/login"
                  className="inline-block bg-talenthub-blue text-white px-8 py-3 rounded-lg font-bold hover:bg-blue-700 transition shadow-md"
                >
                  Iniciar Sesión
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default VacanteDetalle;