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
    tecnologias: '',
    experiencia: '',
    otros_requisitos: '',
    activa: true
  });

  useEffect(() => {

    const userTipo = localStorage.getItem("user_tipo");

    if (!localStorage.getItem("token")) {
      alert("Debes iniciar sesión");
      navigate("/login");
      return;
    }

    if (userTipo !== "empresa") {
      alert("Solo las empresas pueden acceder al dashboard");
      navigate("/vacantes");
      return;
    }

    fetchVacantes();

  }, []);

  const fetchVacantes = async () => {
  try {
    // Obtener el ID de la empresa del usuario actual
    const userResponse = await api.get('/auth/me/');
    const empresaResponse = await api.get(`/empresas/?usuario=${userResponse.data.id}`);
    const empresaId = empresaResponse.data[0]?.id;

    if (empresaId) {
      // Filtrar solo las vacantes de esta empresa
      const response = await api.get(`/vacantes/?empresa=${empresaId}`);
      setVacantes(response.data);
    } else {
      setVacantes([]);
    }
    
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
        // Obtener el ID de la empresa del usuario actual
        const userResponse = await api.get('/auth/me/');
        const empresaResponse = await api.get(`/empresas/?usuario=${userResponse.data.id}`);
        const empresaId = empresaResponse.data[0]?.id || 1;

        // Convertir los campos a JSON
        const tecnologiasArray = formData.tecnologias.split(',').map(t => t.trim()).filter(t => t);
        
        const requisitosObj = {
          lenguajes: tecnologiasArray,
          experiencia: formData.experiencia,
          otros: formData.otros_requisitos
        };

        const dataToSend = {
          titulo: formData.titulo,
          descripcion: formData.descripcion,
          salario_min: formData.salario_min,
          salario_max: formData.salario_max,
          modalidad: formData.modalidad,
          ubicacion: formData.ubicacion,
          requisitos: requisitosObj,
          activa: formData.activa,
          empresa: empresaId
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
    const tecnologias = vacante.requisitos?.lenguajes ? vacante.requisitos.lenguajes.join(', ') : '';
    const experiencia = vacante.requisitos?.experiencia || '';
    const otros = vacante.requisitos?.otros || '';
    
    setFormData({
      titulo: vacante.titulo,
      descripcion: vacante.descripcion,
      salario_min: vacante.salario_min,
      salario_max: vacante.salario_max,
      modalidad: vacante.modalidad,
      ubicacion: vacante.ubicacion,
      tecnologias: tecnologias,
      experiencia: experiencia,
      otros_requisitos: otros,
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
      tecnologias: '',
      experiencia: '',
      otros_requisitos: '',
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
          <Link to="/dashboard" className="text-2xl font-bold text-talenthub-blue">
            TalentHub México
          </Link>
          <div className="flex items-center gap-4">
            <Link to="/vacantes" className="text-talenthub-gray hover:text-talenthub-blue font-semibold">
              Ver Vacantes
            </Link>
            <Link to="/aplicaciones-empresa" className="text-talenthub-gray hover:text-talenthub-blue font-semibold">
              Aplicaciones
            </Link>
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
                  Tecnologías requeridas *
                </label>
                <input
                  type="text"
                  name="tecnologias"
                  value={formData.tecnologias}
                  onChange={handleChange}
                  placeholder="React, Node.js, Python, PostgreSQL"
                  className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:border-talenthub-blue focus:outline-none"
                  required
                />
                <p className="text-xs text-gray-500 mt-1">Separa las tecnologías con comas</p>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">
                  Experiencia requerida *
                </label>
                <input
                  type="text"
                  name="experiencia"
                  value={formData.experiencia}
                  onChange={handleChange}
                  placeholder="2-3 años de experiencia"
                  className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:border-talenthub-blue focus:outline-none"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">
                  Otros requisitos (opcional)
                </label>
                <textarea
                  name="otros_requisitos"
                  value={formData.otros_requisitos}
                  onChange={handleChange}
                  rows={3}
                  placeholder="Inglés intermedio, disponibilidad para viajar, etc."
                  className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:border-talenthub-blue focus:outline-none"
                />
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