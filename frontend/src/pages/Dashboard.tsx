import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import api from '../services/api';

interface Vacante {
  id: number;
  titulo: string;
  descripcion: string;
  salario_min: string;
  salario_max: string;
  modalidad: string;
  ubicacion: string;
  activa: boolean;
  requisitos: any;
}

const Dashboard: React.FC = () => {
  const navigate = useNavigate();
  const [vacantes, setVacantes] = useState<Vacante[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editando, setEditando] = useState<number | null>(null);
  
  const [formData, setFormData] = useState({
    titulo: '',
    descripcion: '',
    salario_min: '',
    salario_max: '',
    modalidad: 'remoto',
    ubicacion: '',
    requisitos: '',
    activa: true
  });

  useEffect(() => {
  const token = localStorage.getItem('access_token');
  const userTipo = localStorage.getItem('user_tipo');
  
  if (!token) {
    alert('Debes iniciar sesión');
    navigate('/login');
    return;
  }
  
  if (userTipo !== 'empresa') {
    alert('Solo las empresas pueden acceder al dashboard');
    navigate('/vacantes');
    return;
  }
  
  fetchVacantes();
}, [navigate]);

  const fetchVacantes = async () => {
    try {
      const response = await api.get('/vacantes/');
      // Aquí filtrarías por empresa, pero por ahora mostramos todas
      setVacantes(response.data);
      setLoading(false);
    } catch (error) {
      console.error('Error:', error);
      setLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      // Parsear requisitos como JSON
      let requisitosObj;
      try {
        requisitosObj = JSON.parse(formData.requisitos);
      } catch {
        requisitosObj = { descripcion: formData.requisitos };
      }

      const dataToSend = {
        ...formData,
        requisitos: requisitosObj,
        empresa: 1 // Esto debería ser dinámico según el usuario logueado
      };

      if (editando) {
        await api.put(`/vacantes/${editando}/`, dataToSend);
        alert('Vacante actualizada exitosamente');
      } else {
        await api.post('/vacantes/', dataToSend);
        alert('Vacante creada exitosamente');
      }

      setShowForm(false);
      setEditando(null);
      limpiarForm();
      fetchVacantes();
    } catch (error: any) {
      console.error('Error:', error);
      alert('Error al guardar: ' + (error.response?.data?.detail || 'Intenta de nuevo'));
    }
  };

  const handleEdit = (vacante: Vacante) => {
    setFormData({
      titulo: vacante.titulo,
      descripcion: vacante.descripcion,
      salario_min: vacante.salario_min,
      salario_max: vacante.salario_max,
      modalidad: vacante.modalidad,
      ubicacion: vacante.ubicacion,
      requisitos: JSON.stringify(vacante.requisitos, null, 2),
      activa: vacante.activa
    });
    setEditando(vacante.id);
    setShowForm(true);
  };

  const handleDelete = async (id: number) => {
    if (!window.confirm('¿Estás seguro de eliminar esta vacante?')) return;

    try {
      await api.delete(`/vacantes/${id}/`);
      alert('Vacante eliminada');
      fetchVacantes();
    } catch (error) {
      alert('Error al eliminar');
    }
  };

  const limpiarForm = () => {
    setFormData({
      titulo: '',
      descripcion: '',
      salario_min: '',
      salario_max: '',
      modalidad: 'remoto',
      ubicacion: '',
      requisitos: '',
      activa: true
    });
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
          <Link to="/" className="text-2xl font-bold text-talenthub-blue">
            TalentHub México
          </Link>
          <div className="space-x-4">
            <Link to="/vacantes" className="text-talenthub-gray hover:text-talenthub-blue font-semibold">
              Ver Vacantes
            </Link>
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
          </div>
        </div>
      </nav>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-4xl font-bold text-talenthub-gray mb-2">
              Dashboard - Mis Vacantes
            </h1>
            <p className="text-gray-600">{vacantes.length} vacantes publicadas</p>
          </div>
          <button
            onClick={() => {
              setShowForm(!showForm);
              setEditando(null);
              limpiarForm();
            }}
            className="bg-talenthub-blue text-white px-6 py-3 rounded-lg font-semibold hover:bg-blue-700 transition"
          >
            {showForm ? 'Cancelar' : '+ Nueva Vacante'}
          </button>
        </div>

        {/* Formulario */}
        {showForm && (
          <div className="bg-white rounded-lg shadow-lg p-8 mb-8">
            <h2 className="text-2xl font-bold text-talenthub-gray mb-6">
              {editando ? 'Editar Vacante' : 'Nueva Vacante'}
            </h2>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1">
                    Título del puesto *
                  </label>
                  <input
                    type="text"
                    name="titulo"
                    value={formData.titulo}
                    onChange={handleChange}
                    className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:border-talenthub-blue focus:outline-none"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1">
                    Ubicación *
                  </label>
                  <input
                    type="text"
                    name="ubicacion"
                    value={formData.ubicacion}
                    onChange={handleChange}
                    placeholder="Ciudad de México"
                    className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:border-talenthub-blue focus:outline-none"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">
                  Descripción *
                </label>
                <textarea
                  name="descripcion"
                  value={formData.descripcion}
                  onChange={handleChange}
                  rows={4}
                  className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:border-talenthub-blue focus:outline-none"
                  required
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1">
                    Salario Mínimo (MXN) *
                  </label>
                  <input
                    type="number"
                    name="salario_min"
                    value={formData.salario_min}
                    onChange={handleChange}
                    placeholder="30000"
                    className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:border-talenthub-blue focus:outline-none"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1">
                    Salario Máximo (MXN) *
                  </label>
                  <input
                    type="number"
                    name="salario_max"
                    value={formData.salario_max}
                    onChange={handleChange}
                    placeholder="50000"
                    className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:border-talenthub-blue focus:outline-none"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1">
                    Modalidad *
                  </label>
                  <select
                    name="modalidad"
                    value={formData.modalidad}
                    onChange={handleChange}
                    className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:border-talenthub-blue focus:outline-none"
                    required
                  >
                    <option value="remoto">Remoto</option>
                    <option value="presencial">Presencial</option>
                    <option value="hibrido">Híbrido</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">
                  Requisitos (JSON) *
                </label>
                <textarea
                  name="requisitos"
                  value={formData.requisitos}
                  onChange={handleChange}
                  rows={3}
                  placeholder='{"lenguajes": ["React", "Node.js"], "experiencia": "3+ años"}'
                  className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:border-talenthub-blue focus:outline-none font-mono text-sm"
                  required
                />
                <p className="text-xs text-gray-500 mt-1">Formato JSON</p>
              </div>

              <button
                type="submit"
                className="w-full bg-talenthub-blue text-white py-3 rounded-lg font-semibold hover:bg-blue-700 transition"
              >
                {editando ? 'Actualizar Vacante' : 'Crear Vacante'}
              </button>
            </form>
          </div>
        )}

        {/* Lista de Vacantes */}
        <div className="space-y-4">
          {vacantes.map((vacante) => (
            <div key={vacante.id} className="bg-white rounded-lg shadow-md p-6">
              <div className="flex justify-between items-start mb-4">
                <div className="flex-1">
                  <h3 className="text-xl font-bold text-talenthub-gray mb-1">
                    {vacante.titulo}
                  </h3>
                  <p className="text-gray-600 mb-2">{vacante.ubicacion} - {vacante.modalidad}</p>
                  <p className="text-talenthub-blue font-semibold">
                    ${parseFloat(vacante.salario_min).toLocaleString()} - ${parseFloat(vacante.salario_max).toLocaleString()} MXN
                  </p>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => handleEdit(vacante)}
                    className="bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 transition"
                  >
                    Editar
                  </button>
                  <button
                    onClick={() => handleDelete(vacante.id)}
                    className="bg-red-500 text-white px-4 py-2 rounded-lg hover:bg-red-600 transition"
                  >
                    Eliminar
                  </button>
                  <Link
                    to={`/vacantes/${vacante.id}`}
                    className="bg-gray-500 text-white px-4 py-2 rounded-lg hover:bg-gray-600 transition"
                  >
                    Ver
                  </Link>
                </div>
              </div>
              <p className="text-gray-700 text-sm line-clamp-2">{vacante.descripcion}</p>
            </div>
          ))}
        </div>

        {vacantes.length === 0 && !showForm && (
          <div className="bg-white rounded-lg shadow-md p-12 text-center">
            <h3 className="text-2xl font-bold text-gray-600 mb-4">No tienes vacantes publicadas</h3>
            <p className="text-gray-500 mb-6">Crea tu primera vacante para empezar a recibir aplicaciones</p>
            <button
              onClick={() => setShowForm(true)}
              className="bg-talenthub-blue text-white px-8 py-3 rounded-lg font-semibold hover:bg-blue-700 transition"
            >
              Crear Primera Vacante
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default Dashboard;