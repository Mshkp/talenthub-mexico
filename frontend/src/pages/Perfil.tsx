import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import api from '../services/api';

const Perfil: React.FC = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    telefono: '',
    nombre_empresa: '',
    sector: '',
    ubicacion: '',
    sitio_web: '',
    descripcion: ''
  });

  useEffect(() => {
    const token = localStorage.getItem('access_token');
    if (!token) {
      alert('Debes iniciar sesión');
      navigate('/login');
      return;
    }
    fetchPerfil();
  }, [navigate]);

  const fetchPerfil = async () => {
    try {
      const userResponse = await api.get('/auth/me/');
      setFormData({
        username: userResponse.data.username,
        email: userResponse.data.email,
        telefono: userResponse.data.telefono || '',
        nombre_empresa: '',
        sector: '',
        ubicacion: '',
        sitio_web: '',
        descripcion: ''
      });

      // Si es empresa, obtener datos adicionales
      if (userResponse.data.tipo === 'empresa') {
        const empresaResponse = await api.get(`/empresas/?usuario=${userResponse.data.id}`);
        if (empresaResponse.data.length > 0) {
          const empresa = empresaResponse.data[0];
          setFormData(prev => ({
            ...prev,
            nombre_empresa: empresa.nombre_empresa,
            sector: empresa.sector,
            ubicacion: empresa.ubicacion,
            sitio_web: empresa.sitio_web || '',
            descripcion: empresa.descripcion || ''
          }));
        }
      }

      setLoading(false);
    } catch (error) {
      console.error('Error:', error);
      setLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      const userResponse = await api.get('/auth/me/');
      
      // Actualizar usuario
      await api.patch(`/auth/update/`, {
        email: formData.email,
        telefono: formData.telefono
      });

      // Si es empresa, actualizar datos de empresa
      if (userResponse.data.tipo === 'empresa') {
        const empresaResponse = await api.get(`/empresas/?usuario=${userResponse.data.id}`);
        if (empresaResponse.data.length > 0) {
          await api.patch(`/empresas/${empresaResponse.data[0].id}/`, {
            nombre_empresa: formData.nombre_empresa,
            sector: formData.sector,
            ubicacion: formData.ubicacion,
            sitio_web: formData.sitio_web,
            descripcion: formData.descripcion
          });
        }
      }

      alert('Perfil actualizado exitosamente');
      setEditing(false);
      fetchPerfil();
    } catch (error: any) {
      alert('Error al actualizar: ' + (error.response?.data?.detail || 'Intenta de nuevo'));
    }
  };

  const userTipo = localStorage.getItem('user_tipo');

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
            {userTipo === 'aspirante' ? (
              <Link to="/mis-aplicaciones" className="text-talenthub-gray hover:text-talenthub-blue font-semibold">
                Mis Aplicaciones
              </Link>
            ) : (
              <>
                <Link to="/dashboard" className="text-talenthub-gray hover:text-talenthub-blue font-semibold">
                  Mis Vacantes
                </Link>
                <Link to="/aplicaciones-empresa" className="text-talenthub-gray hover:text-talenthub-blue font-semibold">
                  Aplicaciones
                </Link>
              </>
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
          </div>
        </div>
      </nav>

      {/* Content */}
      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-4xl font-bold text-talenthub-gray">Mi Perfil</h1>
          {!editing && (
            <button
              onClick={() => setEditing(true)}
              className="bg-talenthub-blue text-white px-6 py-3 rounded-lg font-semibold hover:bg-blue-700 transition"
            >
              Editar Perfil
            </button>
          )}
        </div>

        <div className="bg-white rounded-lg shadow-lg p-8">
          <form onSubmit={handleSubmit}>
            <div className="space-y-6">
              {/* Información básica */}
              <div>
                <h2 className="text-2xl font-bold text-talenthub-gray mb-4 pb-2 border-b">
                  Información Básica
                </h2>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-1">
                      Usuario
                    </label>
                    <input
                      type="text"
                      value={formData.username}
                      disabled
                      className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg bg-gray-100 text-gray-600"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-1">
                      Email
                    </label>
                    <input
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={handleChange}
                      disabled={!editing}
                      className={`w-full px-4 py-3 border-2 border-gray-300 rounded-lg ${
                        editing ? 'focus:border-talenthub-blue focus:outline-none' : 'bg-gray-100 text-gray-600'
                      }`}
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-1">
                      Teléfono
                    </label>
                    <input
                      type="tel"
                      name="telefono"
                      value={formData.telefono}
                      onChange={handleChange}
                      disabled={!editing}
                      placeholder="5512345678"
                      className={`w-full px-4 py-3 border-2 border-gray-300 rounded-lg ${
                        editing ? 'focus:border-talenthub-blue focus:outline-none' : 'bg-gray-100 text-gray-600'
                      }`}
                    />
                  </div>
                </div>
              </div>

              {/* Info empresa si es empresa */}
              {userTipo === 'empresa' && (
                <div>
                  <h2 className="text-2xl font-bold text-talenthub-gray mb-4 pb-2 border-b">
                    Información de la Empresa
                  </h2>

                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-1">
                        Nombre de la Empresa
                      </label>
                      <input
                        type="text"
                        name="nombre_empresa"
                        value={formData.nombre_empresa}
                        onChange={handleChange}
                        disabled={!editing}
                        className={`w-full px-4 py-3 border-2 border-gray-300 rounded-lg ${
                          editing ? 'focus:border-talenthub-blue focus:outline-none' : 'bg-gray-100 text-gray-600'
                        }`}
                      />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-1">
                          Sector
                        </label>
                        <input
                          type="text"
                          name="sector"
                          value={formData.sector}
                          onChange={handleChange}
                          disabled={!editing}
                          placeholder="Tecnología"
                          className={`w-full px-4 py-3 border-2 border-gray-300 rounded-lg ${
                            editing ? 'focus:border-talenthub-blue focus:outline-none' : 'bg-gray-100 text-gray-600'
                          }`}
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-1">
                          Ubicación
                        </label>
                        <input
                          type="text"
                          name="ubicacion"
                          value={formData.ubicacion}
                          onChange={handleChange}
                          disabled={!editing}
                          placeholder="Ciudad de México"
                          className={`w-full px-4 py-3 border-2 border-gray-300 rounded-lg ${
                            editing ? 'focus:border-talenthub-blue focus:outline-none' : 'bg-gray-100 text-gray-600'
                          }`}
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-1">
                        Sitio Web
                      </label>
                      <input
                        type="url"
                        name="sitio_web"
                        value={formData.sitio_web}
                        onChange={handleChange}
                        disabled={!editing}
                        placeholder="https://empresa.com"
                        className={`w-full px-4 py-3 border-2 border-gray-300 rounded-lg ${
                          editing ? 'focus:border-talenthub-blue focus:outline-none' : 'bg-gray-100 text-gray-600'
                        }`}
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-1">
                        Descripción
                      </label>
                      <textarea
                        name="descripcion"
                        value={formData.descripcion}
                        onChange={handleChange}
                        disabled={!editing}
                        rows={4}
                        placeholder="Describe tu empresa..."
                        className={`w-full px-4 py-3 border-2 border-gray-300 rounded-lg ${
                          editing ? 'focus:border-talenthub-blue focus:outline-none' : 'bg-gray-100 text-gray-600'
                        }`}
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* Botones */}
              {editing && (
                <div className="flex gap-4 pt-4">
                  <button
                    type="submit"
                    className="flex-1 bg-talenthub-blue text-white py-3 rounded-lg font-semibold hover:bg-blue-700 transition"
                  >
                    Guardar Cambios
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setEditing(false);
                      fetchPerfil();
                    }}
                    className="flex-1 bg-gray-300 text-gray-700 py-3 rounded-lg font-semibold hover:bg-gray-400 transition"
                  >
                    Cancelar
                  </button>
                </div>
              )}
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Perfil;