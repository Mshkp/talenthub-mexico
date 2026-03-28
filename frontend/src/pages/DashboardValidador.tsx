import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import api from '../services/api';
import { showSuccess, showError, showConfirm } from '../utils/alerts';

interface VacantePendiente {
  id: number;
  titulo: string;
  empresa_nombre: string;
  descripcion?: string;
  salario_min?: string;
  salario_max?: string;
  modalidad?: string;
  fecha_publicacion: string;
  estado_validacion?: string;
  activa?: boolean;
}

interface UsuarioAuditoria {
  id: number;
  username: string;
  email: string;
  tipo: string;
  is_active: boolean;
  date_joined: string;
}

const DashboardValidador: React.FC = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  
  // Ahora tenemos 4 increíbles pestañas
  const [activeTab, setActiveTab] = useState<'vacantes' | 'usuarios' | 'historial' | 'stack'>('vacantes');

  const [vacantes, setVacantes] = useState<VacantePendiente[]>([]);
  const [usuarios, setUsuarios] = useState<UsuarioAuditoria[]>([]);
  const [historial, setHistorial] = useState<VacantePendiente[]>([]);
  
  // Estados para el Stack (Punto 1.9)
  const [tecnologias, setTecnologias] = useState<{id: number, nombre: string}[]>([]);
  const [nuevaTech, setNuevaTech] = useState('');
  
  const [metricas, setMetricas] = useState({
    total_usuarios: 0,
    total_empresas: 0,
    vacantes_activas: 0,
    total_postulaciones: 0
  });

  useEffect(() => {
    const token = localStorage.getItem('token');
    const userTipo = localStorage.getItem('user_tipo');

    if (!token || userTipo !== 'validador') {
      showError('Acceso denegado. Esta área es solo para Validadores.');
      navigate('/');
      return;
    }

    fetchMetricas();
    fetchPendientes();
    fetchUsuarios();
    fetchHistorial();
    fetchTecnologias(); // Cargamos el stack oficial
  }, [navigate]);

  const fetchMetricas = async () => {
    try {
      const response = await api.get('/validador/metricas/');
      setMetricas(response.data);
    } catch (error) { console.error('Error métricas'); }
  };

  const fetchPendientes = async () => {
    try {
      const response = await api.get('/vacantes/pendientes/');
      setVacantes(response.data);
      setLoading(false);
    } catch (error) { 
      showError('Error pendientes'); 
      setLoading(false); 
    }
  };

  const fetchUsuarios = async () => {
    try {
      const response = await api.get('/validador/usuarios/');
      setUsuarios(response.data);
    } catch (error) { console.error('Error usuarios'); }
  };

  const fetchHistorial = async () => {
    try {
      const response = await api.get('/validador/vacantes/historial/');
      setHistorial(response.data);
    } catch (error) { console.error('Error historial'); }
  };

  const fetchTecnologias = async () => {
    try {
      const response = await api.get('/validador/tecnologias/');
      setTecnologias(response.data);
    } catch (error) { console.error('Error stack'); }
  };

  const handleValidacion = async (id: number, accion: 'aprobar' | 'rechazar') => {
    const verbo = accion === 'aprobar' ? 'aprobar y publicar' : 'rechazar y ocultar';
    const confirmado = await showConfirm(`¿Estás seguro de que deseas ${verbo} esta vacante?`, 'Confirmar Acción');
    if (!confirmado) return;

    try {
      await api.post(`/vacantes/validar/${id}/`, { accion });
      showSuccess(`La vacante ha sido ${accion === 'aprobar' ? 'APROBADA' : 'RECHAZADA'}`);
      fetchPendientes();
      fetchHistorial();
      fetchMetricas(); 
    } catch (error) {
      showError(`Hubo un error al intentar ${accion} la vacante`);
    }
  };

  const handleSuspender = async (usuario: UsuarioAuditoria) => {
    const accion = usuario.is_active ? 'SUSPENDER (Bloquear acceso)' : 'REACTIVAR (Permitir acceso)';
    const confirmado = await showConfirm(`¿Estás seguro de que deseas ${accion} al usuario ${usuario.username}?`, 'Atención de Seguridad');
    if (!confirmado) return;

    try {
      await api.post(`/validador/usuarios/${usuario.id}/suspender/`, {});
      showSuccess(`Usuario ${usuario.is_active ? 'suspendido' : 'reactivado'} con éxito.`);
      fetchUsuarios();
    } catch (error) {
      showError('Problema al cambiar estado del usuario.');
    }
  };

  const handleAddTech = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!nuevaTech.trim()) return;
    try {
      await api.post('/validador/tecnologias/', { nombre: nuevaTech });
      showSuccess('Tecnología agregada al catálogo oficial');
      setNuevaTech('');
      fetchTecnologias();
    } catch (error: any) {
      showError(error.response?.data?.error || 'Error al agregar tecnología');
    }
  };

  const handleDeleteTech = async (id: number) => {
    const confirmado = await showConfirm('¿Eliminar esta tecnología del catálogo oficial?', 'Confirmar');
    if (!confirmado) return;
    try {
      await api.delete(`/validador/tecnologias/${id}/`);
      showSuccess('Tecnología eliminada');
      fetchTecnologias();
    } catch (error) {
      showError('Error al eliminar');
    }
  };

  if (loading) return <div className="min-h-screen bg-gray-50 flex items-center justify-center"><div className="text-xl font-bold text-gray-600">Cargando sala de mando...</div></div>;

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-6xl mx-auto">
        
        <Link to="/vacantes" className="text-talenthub-blue hover:underline mb-6 inline-block font-semibold text-lg">
          ← Volver al Muro Público
        </Link>
        
        <div className="mb-6 border-b-4 border-talenthub-blue pb-4">
          <h1 className="text-4xl font-bold text-gray-800">Centro de Validación 🛡️</h1>
        </div>

        {/* --- VISOR DE ACTIVIDAD --- */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white p-6 rounded-xl shadow-sm border-l-4 border-blue-500">
            <div className="text-gray-500 text-sm font-bold uppercase tracking-wider mb-1">Total Usuarios</div>
            <div className="text-3xl font-black text-gray-800 flex items-center gap-2">👥 {metricas.total_usuarios}</div>
          </div>
          <div className="bg-white p-6 rounded-xl shadow-sm border-l-4 border-purple-500">
            <div className="text-gray-500 text-sm font-bold uppercase tracking-wider mb-1">Empresas Activas</div>
            <div className="text-3xl font-black text-gray-800 flex items-center gap-2">🏢 {metricas.total_empresas}</div>
          </div>
          <div className="bg-white p-6 rounded-xl shadow-sm border-l-4 border-green-500">
            <div className="text-gray-500 text-sm font-bold uppercase tracking-wider mb-1">Vacantes Públicas</div>
            <div className="text-3xl font-black text-gray-800 flex items-center gap-2">💼 {metricas.vacantes_activas}</div>
          </div>
          <div className="bg-white p-6 rounded-xl shadow-sm border-l-4 border-orange-500">
            <div className="text-gray-500 text-sm font-bold uppercase tracking-wider mb-1">Flujo Postulaciones</div>
            <div className="text-3xl font-black text-gray-800 flex items-center gap-2">🚀 {metricas.total_postulaciones}</div>
          </div>
        </div>

        {/* --- SISTEMA DE PESTAÑAS (TABS) --- */}
        <div className="flex flex-wrap gap-4 mb-6 border-b border-gray-200">
          <button onClick={() => setActiveTab('vacantes')} className={`pb-4 px-4 text-lg font-bold transition ${activeTab === 'vacantes' ? 'text-talenthub-blue border-b-4 border-talenthub-blue' : 'text-gray-400 hover:text-gray-600'}`}>
            📋 Cola ({vacantes.length})
          </button>
          <button onClick={() => setActiveTab('usuarios')} className={`pb-4 px-4 text-lg font-bold transition ${activeTab === 'usuarios' ? 'text-talenthub-blue border-b-4 border-talenthub-blue' : 'text-gray-400 hover:text-gray-600'}`}>
            🕵️‍♂️ Usuarios ({usuarios.length})
          </button>
          <button onClick={() => setActiveTab('historial')} className={`pb-4 px-4 text-lg font-bold transition ${activeTab === 'historial' ? 'text-talenthub-blue border-b-4 border-talenthub-blue' : 'text-gray-400 hover:text-gray-600'}`}>
            📚 Historial Vacantes
          </button>
          <button onClick={() => setActiveTab('stack')} className={`pb-4 px-4 text-lg font-bold transition ${activeTab === 'stack' ? 'text-talenthub-blue border-b-4 border-talenthub-blue' : 'text-gray-400 hover:text-gray-600'}`}>
            💻 Stack Oficial ({tecnologias.length})
          </button>
        </div>

        {/* --- CONTENIDO DE PESTAÑAS --- */}
        
        {/* PESTAÑA 1: VACANTES */}
        {activeTab === 'vacantes' && (
          vacantes.length === 0 ? (
            <div className="bg-white rounded-xl shadow p-12 text-center">
              <h2 className="text-2xl font-bold text-gray-400">¡Todo limpio por aquí! 🎉</h2>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {vacantes.map((vacante) => (
                <div key={vacante.id} className="bg-white rounded-xl shadow-lg overflow-hidden border border-gray-200">
                  <div className="bg-yellow-50 p-4 border-b border-yellow-100 flex justify-between items-center">
                    <span className="bg-yellow-500 text-white text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wide">En Revisión</span>
                  </div>
                  <div className="p-6">
                    <h3 className="text-2xl font-bold text-gray-800 mb-1">{vacante.titulo}</h3>
                    <p className="text-talenthub-blue font-semibold text-lg mb-4">🏢 {vacante.empresa_nombre}</p>
                    <div className="bg-gray-50 p-4 rounded-lg mb-4">
                      <p className="text-sm text-gray-700 font-medium line-clamp-3">{vacante.descripcion}</p>
                    </div>
                    <div className="flex gap-3 pt-4 border-t border-gray-100">
                      <button onClick={() => handleValidacion(vacante.id, 'aprobar')} className="flex-1 bg-green-500 text-white py-3 rounded-lg font-bold hover:bg-green-600 transition shadow-md">✅ APROBAR</button>
                      <button onClick={() => handleValidacion(vacante.id, 'rechazar')} className="flex-1 bg-red-500 text-white py-3 rounded-lg font-bold hover:bg-red-600 transition shadow-md">❌ RECHAZAR</button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )
        )}

        {/* PESTAÑA 2: USUARIOS */}
        {activeTab === 'usuarios' && (
          <div className="bg-white rounded-xl shadow-lg overflow-hidden border border-gray-200">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-gray-100 text-gray-600 uppercase text-sm leading-normal">
                  <th className="py-4 px-6 font-bold">Usuario</th>
                  <th className="py-4 px-6 font-bold">Rol</th>
                  <th className="py-4 px-6 font-bold">Estado</th>
                  <th className="py-4 px-6 font-bold text-center">Acción</th>
                </tr>
              </thead>
              <tbody className="text-gray-600 text-sm font-medium">
                {usuarios.map((u) => (
                  <tr key={u.id} className="border-b border-gray-200 hover:bg-gray-50">
                    <td className="py-4 px-6 font-bold text-gray-800">{u.username}</td>
                    <td className="py-4 px-6"><span className="uppercase text-xs font-bold">{u.tipo}</span></td>
                    <td className="py-4 px-6">{u.is_active ? '🟢 Activo' : '🔴 Suspendido'}</td>
                    <td className="py-4 px-6 text-center">
                      <button onClick={() => handleSuspender(u)} className={`px-4 py-2 rounded-lg font-bold text-white shadow transition ${u.is_active ? 'bg-red-500 hover:bg-red-600' : 'bg-green-500 hover:bg-green-600'}`}>
                        {u.is_active ? 'Bloquear' : 'Reactivar'}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* PESTAÑA 3: HISTORIAL */}
        {activeTab === 'historial' && (
          <div className="bg-white rounded-xl shadow-lg overflow-hidden border border-gray-200">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-gray-100 text-gray-600 uppercase text-sm leading-normal">
                  <th className="py-4 px-6 font-bold">Empresa</th>
                  <th className="py-4 px-6 font-bold">Título de la Vacante</th>
                  <th className="py-4 px-6 font-bold">Fecha</th>
                  <th className="py-4 px-6 font-bold">Estado Validador</th>
                  <th className="py-4 px-6 font-bold text-center">Estatus Empresa</th>
                </tr>
              </thead>
              <tbody className="text-gray-600 text-sm font-medium">
                {historial.map((h) => (
                  <tr key={h.id} className="border-b border-gray-200 hover:bg-gray-50">
                    <td className="py-4 px-6 font-bold text-gray-800">🏢 {h.empresa_nombre}</td>
                    <td className="py-4 px-6">{h.titulo}</td>
                    <td className="py-4 px-6">{new Date(h.fecha_publicacion).toLocaleDateString('es-MX')}</td>
                    <td className="py-4 px-6">
                      {h.estado_validacion === 'aprobada' ? (
                        <span className="bg-green-100 text-green-800 px-3 py-1 rounded-full font-bold text-xs uppercase">Aprobada</span>
                      ) : (
                        <span className="bg-red-100 text-red-800 px-3 py-1 rounded-full font-bold text-xs uppercase">Rechazada</span>
                      )}
                    </td>
                    <td className="py-4 px-6 text-center">
                      {h.activa ? (
                        <span className="text-blue-600 font-bold">Abierta</span>
                      ) : (
                        <span className="text-gray-500 font-bold">Cerrada</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {historial.length === 0 && (
              <div className="p-8 text-center text-gray-500 font-medium">
                No hay historial de vacantes procesadas aún.
              </div>
            )}
          </div>
        )}

        {/* PESTAÑA 4: CATÁLOGO DE TECNOLOGÍAS (Punto 1.9) */}
        {activeTab === 'stack' && (
          <div className="bg-white rounded-xl shadow-lg p-8 border border-gray-200">
            <div className="flex flex-col md:flex-row gap-8">
              
              <div className="md:w-1/3">
                <h2 className="text-xl font-bold text-gray-800 mb-4">Agregar Tecnología</h2>
                <form onSubmit={handleAddTech} className="flex flex-col gap-3">
                  <input 
                    type="text" 
                    value={nuevaTech} 
                    onChange={(e) => setNuevaTech(e.target.value)}
                    placeholder="Ej. Python, React, Docker..." 
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                  />
                  <button type="submit" className="bg-talenthub-blue text-white py-2 rounded-lg font-bold shadow hover:bg-blue-700 transition">
                    ➕ Añadir al Catálogo
                  </button>
                </form>
                <div className="mt-6 bg-blue-50 p-4 rounded-lg border-l-4 border-talenthub-blue">
                  <p className="text-sm text-gray-600 font-medium">Este catálogo es el listado oficial de herramientas que las empresas y aspirantes pueden usar en la plataforma.</p>
                </div>
              </div>

              <div className="md:w-2/3">
                <h2 className="text-xl font-bold text-gray-800 mb-4">Stack Oficial Registrado</h2>
                {tecnologias.length === 0 ? (
                  <p className="text-gray-500 italic">No hay tecnologías registradas. ¡Agrega la primera!</p>
                ) : (
                  <div className="flex flex-wrap gap-3">
                    {tecnologias.map(t => (
                      <div key={t.id} className="bg-gray-100 border border-gray-200 px-4 py-2 rounded-full flex items-center gap-3 shadow-sm">
                        <span className="font-bold text-gray-700">{t.nombre}</span>
                        <button onClick={() => handleDeleteTech(t.id)} className="text-red-500 hover:text-red-700 font-bold bg-white rounded-full w-6 h-6 flex items-center justify-center shadow-sm">
                          ×
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

            </div>
          </div>
        )}

      </div>
    </div>
  );
};

export default DashboardValidador;