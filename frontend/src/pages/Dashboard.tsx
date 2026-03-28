import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import api from '../services/api';
// Importamos nuestras nuevas alertas globales
import { showSuccess, showError, showConfirm } from '../utils/alerts';

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
  estado_validacion: string;
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
      showError("Debes iniciar sesión para ver esto");
      navigate("/login");
      return;
    }

    if (userTipo !== "empresa") {
      showError("Solo las empresas pueden acceder al dashboard");
      navigate("/vacantes");
      return;
    }

    fetchVacantes();
  }, [navigate]);

  const fetchVacantes = async () => {
    try {
      const userId = localStorage.getItem('user_id');
      const empresaResponse = await api.get(`/empresas/?usuario=${userId}`);

      if (empresaResponse.data && empresaResponse.data.length > 0) {
        const empresaId = empresaResponse.data[0].id;
        const response = await api.get(`/vacantes/?empresa=${empresaId}`);
        setVacantes(response.data);
      } else {
        console.warn("Este usuario no tiene un perfil en la tabla Empresa");
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
      const userId = localStorage.getItem('user_id');
      const empresaResponse = await api.get(`/empresas/?usuario=${userId}`);
      
      if (!empresaResponse.data || empresaResponse.data.length === 0) {
        showError("Tu usuario no tiene un perfil de Empresa. Por favor, crea una CUENTA NUEVA desde la página de Registro para que se genere correctamente.");
        return;
      }

      const empresaId = empresaResponse.data[0].id;
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
        activa: editando ? formData.activa : false, 
        empresa: empresaId
      };
      
      if (editando) {
        await api.put(`/vacantes/${editando}/`, dataToSend);
        showSuccess('Vacante actualizada exitosamente');
      } else {
        await api.post('/vacantes/', dataToSend);
        showSuccess('Vacante creada', 'Está pendiente de validación por un administrador.');
      }

      setShowForm(false);
      setEditando(null);
      limpiarForm();
      fetchVacantes();
    } catch (error: any) {
      console.error('Error:', error);
      showError(error.response?.data?.detail || 'Intenta de nuevo', 'Error al guardar');
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
    const confirmado = await showConfirm('¿Estás seguro de eliminar esta vacante?', 'Borrar Vacante');
    if (!confirmado) return;

    try {
      await api.delete(`/vacantes/${id}/`);
      showSuccess('La vacante ha sido eliminada');
      fetchVacantes();
    } catch (error) {
      showError('No se pudo eliminar la vacante');
    }
  };

  const handleReabrir = async (id: number) => {
    const confirmado = await showConfirm('¿Deseas volver a publicar esta vacante? Será visible para los aspirantes nuevamente.', 'Reabrir Vacante');
    if (!confirmado) return;

    try {
      const userId = localStorage.getItem('user_id');
      const empresaResponse = await api.get(`/empresas/?usuario=${userId}`);
      
      if (empresaResponse.data && empresaResponse.data.length > 0) {
        const empresaId = empresaResponse.data[0].id;
        await api.patch(`/vacantes/${id}/?empresa=${empresaId}`, { activa: true });
        showSuccess('La vacante está activa de nuevo');
        fetchVacantes();
      }
    } catch (error: any) {
      console.error("Error del backend:", error.response?.data);
      const mensajeDjango = error.response?.data?.detail || JSON.stringify(error.response?.data) || 'Revisa la consola';
      showError(`Motivo: ${mensajeDjango}`, 'No se pudo reabrir');
    }
  };

  const handleCerrar = async (id: number) => {
    const confirmado = await showConfirm('¿Estás seguro de cerrar esta vacante? Ya no aparecerá a los aspirantes.', 'Cerrar Vacante');
    if (!confirmado) return;

    try {
      await api.patch(`/vacantes/${id}/`, { activa: false });
      showSuccess('Vacante cerrada administrativamente');
      fetchVacantes();
    } catch (error) {
      showError('Hubo un error al cerrar la vacante');
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
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <div className="max-w-7xl w-full mx-auto px-4 py-8 flex-grow">
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

        {showForm && (
          <div className="bg-white rounded-lg shadow-lg p-8 mb-8">
            <h2 className="text-2xl font-bold text-talenthub-gray mb-6">
              {editando ? 'Editar Vacante' : 'Nueva Vacante'}
            </h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1">Título del puesto *</label>
                  <input type="text" name="titulo" value={formData.titulo} onChange={handleChange} className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:border-talenthub-blue focus:outline-none" required />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1">Ubicación *</label>
                  <input type="text" name="ubicacion" value={formData.ubicacion} onChange={handleChange} placeholder="Ciudad de México" className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:border-talenthub-blue focus:outline-none" required />
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">Descripción *</label>
                <textarea name="descripcion" value={formData.descripcion} onChange={handleChange} rows={4} className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:border-talenthub-blue focus:outline-none" required />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1">Salario Mínimo (MXN) *</label>
                  <input type="number" name="salario_min" value={formData.salario_min} onChange={handleChange} placeholder="30000" className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:border-talenthub-blue focus:outline-none" required />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1">Salario Máximo (MXN) *</label>
                  <input type="number" name="salario_max" value={formData.salario_max} onChange={handleChange} placeholder="50000" className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:border-talenthub-blue focus:outline-none" required />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1">Modalidad *</label>
                  <select name="modalidad" value={formData.modalidad} onChange={handleChange} className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:border-talenthub-blue focus:outline-none" required>
                    <option value="remoto">Remoto</option>
                    <option value="presencial">Presencial</option>
                    <option value="hibrido">Híbrido</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">Tecnologías requeridas *</label>
                <input type="text" name="tecnologias" value={formData.tecnologias} onChange={handleChange} placeholder="React, Node.js, Python, PostgreSQL" className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:border-talenthub-blue focus:outline-none" required />
                <p className="text-xs text-gray-500 mt-1">Separa las tecnologías con comas</p>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">Experiencia requerida *</label>
                <input type="text" name="experiencia" value={formData.experiencia} onChange={handleChange} placeholder="2-3 años de experiencia" className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:border-talenthub-blue focus:outline-none" required />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">Otros requisitos (opcional)</label>
                <textarea name="otros_requisitos" value={formData.otros_requisitos} onChange={handleChange} rows={3} placeholder="Inglés intermedio, disponibilidad para viajar, etc." className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:border-talenthub-blue focus:outline-none" />
              </div>

              <button type="submit" className="w-full bg-talenthub-blue text-white py-3 rounded-lg font-semibold hover:bg-blue-700 transition">
                {editando ? 'Actualizar Vacante' : 'Crear Vacante'}
              </button>
            </form>
          </div>
        )}

        <div className="space-y-4">
          {vacantes.map((vacante) => (
            <div key={vacante.id} className="bg-white rounded-lg shadow-md p-6">
              <div className="flex justify-between items-start mb-4">
                <div className="flex-1">
                  <h3 className="text-xl font-bold text-talenthub-gray mb-1">{vacante.titulo}</h3>
                  <p className="text-gray-600 mb-2">{vacante.ubicacion} - {vacante.modalidad}</p>
                  <p className="text-talenthub-blue font-semibold">
                    ${parseFloat(vacante.salario_min).toLocaleString()} - ${parseFloat(vacante.salario_max).toLocaleString()} MXN
                  </p>
                </div>
                
                {/* AQUI ESTÁN TUS BOTONES YA ARREGLADOS */}
                <div className="flex gap-2">
                  <button onClick={() => handleEdit(vacante)} className="bg-blue-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-blue-700 transition">
                    Editar
                  </button>

                  {/* LÓGICA INTELIGENTE DE ESTADOS */}
                  {vacante.estado_validacion === 'pendiente' ? (
                    <span className="bg-yellow-100 text-yellow-800 px-4 py-2 rounded-lg font-bold border border-yellow-300 flex items-center">
                      ⏳ En revisión
                    </span>
                  ) : vacante.estado_validacion === 'rechazada' ? (
                    <span className="bg-red-100 text-red-800 px-4 py-2 rounded-lg font-bold border border-red-300 flex items-center">
                      ❌ Rechazada
                    </span>
                  ) : vacante.activa ? (
                    <button onClick={() => handleCerrar(vacante.id)} className="bg-yellow-500 text-white px-4 py-2 rounded-lg font-medium hover:bg-yellow-600 transition">
                      Cerrar
                    </button>
                  ) : (
                    <button onClick={() => handleReabrir(vacante.id)} className="bg-green-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-green-700 transition">
                      Reabrir
                    </button>
                  )}

                  <button onClick={() => handleDelete(vacante.id)} className="bg-red-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-red-700 transition">
                    Eliminar
                  </button>
                  
                  <button onClick={() => navigate(`/vacantes/${vacante.id}`)} className="bg-gray-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-gray-700 transition">
                    Ver
                  </button>
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
            <button onClick={() => setShowForm(true)} className="bg-talenthub-blue text-white px-8 py-3 rounded-lg font-semibold hover:bg-blue-700 transition">
              Crear Primera Vacante
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default Dashboard;