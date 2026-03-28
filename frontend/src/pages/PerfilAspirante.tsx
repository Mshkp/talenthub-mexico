import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';
import { showSuccess, showError } from '../utils/alerts';

const PerfilAspirante: React.FC = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  
  const [formData, setFormData] = useState({
    profesion: '',
    experiencia_resumen: '',
    habilidades: ''
  });


  // Estados separados para los archivos reales y las URLs para mostrarlos
  const [cvFile, setCvFile] = useState<File | null>(null);
  const [fotoFile, setFotoFile] = useState<File | null>(null);
  const [cvUrlActual, setCvUrlActual] = useState<string>('');
  const [fotoUrlActual, setFotoUrlActual] = useState<string>('');

  const username = localStorage.getItem('user_username');

  useEffect(() => {
    cargarPerfil();
  }, []);

  const cargarPerfil = async () => {
    try {
      const response = await api.get('/perfil/aspirante/');
      const data = response.data;
      
      setFormData({
        profesion: data.profesion || '',
        experiencia_resumen: data.experiencia_resumen || '',
        habilidades: Array.isArray(data.habilidades) ? data.habilidades.join(', ') : ''
      });
      
      setCvUrlActual(data.cv || '');
      setFotoUrlActual(data.foto || '');
      setLoading(false);
    } catch (error) {
      showError('No se pudo cargar tu perfil');
      setLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  // Manejador para cuando seleccionan un archivo de su PC
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      if (e.target.name === 'cv') setCvFile(e.target.files[0]);
      if (e.target.name === 'foto') setFotoFile(e.target.files[0]);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const dataToSend = new FormData();
      dataToSend.append('profesion', formData.profesion);
      dataToSend.append('experiencia_resumen', formData.experiencia_resumen);
      
      const habilidadesArray = formData.habilidades.split(',').map(h => h.trim()).filter(h => h !== '');
      dataToSend.append('habilidades', JSON.stringify(habilidadesArray));

      if (cvFile) dataToSend.append('cv', cvFile);
      if (fotoFile) dataToSend.append('foto', fotoFile);


      // S-SDLC Fix: Neutraliza cualquier header global de JSON para permitir el boundary nativo
      await api.put('/perfil/aspirante/', dataToSend, {
        headers: { 
          'Content-Type': undefined 
        }
      });

      
      showSuccess('¡Perfil actualizado con éxito!');
      cargarPerfil(); 
    } catch (error: any) {
      // S-SDLC: Manejo de errores detallado
      console.log("ERROR DEL BACKEND:", error.response?.data);
      
      // Intentamos sacar el primer mensaje de error que nos mande Django
      const dataError = error.response?.data;
      let errorMsg = 'Error al guardar los cambios';
      
      if (dataError) {
        if (dataError.cv) errorMsg = dataError.cv[0];
        else if (dataError.foto) errorMsg = dataError.foto[0];
        else if (dataError.habilidades) errorMsg = dataError.habilidades[0];
        else if (dataError.detail) errorMsg = dataError.detail;
      }
      
      showError(errorMsg);
    }
  };

  if (loading) return <div className="min-h-screen bg-gray-50 flex items-center justify-center">Cargando perfil...</div>;

  return (
    <div className="min-h-screen bg-gray-50 py-10 px-4">
      <div className="max-w-4xl mx-auto bg-white rounded-2xl shadow-lg overflow-hidden flex flex-col md:flex-row">
        
        {/* LADO IZQUIERDO: Tarjeta de Presentación */}
        <div className="md:w-1/3 bg-talenthub-blue text-white p-8 flex flex-col items-center justify-center text-center">
          <div className="w-32 h-32 rounded-full bg-white p-1 mb-4 shadow-xl overflow-hidden">
            {fotoUrlActual ? (
              <img src={fotoUrlActual} alt="Perfil" className="w-full h-full object-cover rounded-full" />
            ) : (
              <div className="w-full h-full bg-blue-100 flex items-center justify-center rounded-full text-blue-500 text-4xl">
                👨‍💻
              </div>
            )}
          </div>
          <h2 className="text-2xl font-bold mb-1">{username}</h2>
          <p className="text-blue-200 font-medium mb-6">
            {formData.profesion || 'Completa tu perfil'}
          </p>
          
          {cvUrlActual && (
            <a href={cvUrlActual} target="_blank" rel="noopener noreferrer" className="bg-white text-talenthub-blue px-6 py-2 rounded-full font-bold shadow-md hover:bg-gray-100 transition">
              📄 Ver mi CV actual
            </a>
          )}
        </div>

        {/* LADO DERECHO: Formulario Profesional */}
        <div className="md:w-2/3 p-8">
          <h3 className="text-2xl font-bold text-gray-800 mb-6">Mis Activos Profesionales</h3>
          
          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">Título Profesional</label>
              <input type="text" name="profesion" value={formData.profesion} onChange={handleChange} placeholder="Ej. Desarrollador Frontend Sr." className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none" />
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">Resumen de Experiencia</label>
              <textarea name="experiencia_resumen" value={formData.experiencia_resumen} onChange={handleChange} rows={3} placeholder="Cuéntanos sobre tu trayectoria profesional..." className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none" />
            </div>

            {/* Lógica Visual de Archivos (UX Mejorado) */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className={`p-4 rounded-lg border ${fotoUrlActual ? 'bg-blue-50 border-blue-200' : 'bg-gray-50 border-gray-200'} transition-colors`}>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  {fotoUrlActual ? '🔄 Cambiar Foto de Perfil' : '📸 Subir Foto de Perfil'}
                </label>
                <input 
                  type="file" 
                  name="foto" 
                  accept="image/*" 
                  onChange={handleFileChange} 
                  className="w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-100 file:text-blue-700 hover:file:bg-blue-200 cursor-pointer transition" 
                />
              </div>
              
              <div className={`p-4 rounded-lg border ${cvUrlActual ? 'bg-green-50 border-green-200' : 'bg-gray-50 border-gray-200'} transition-colors`}>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  {cvUrlActual ? '🔄 Actualizar Documento CV' : '📄 Subir CV (PDF)'}
                </label>
                <input 
                  type="file" 
                  name="cv" 
                  accept=".pdf" 
                  onChange={handleFileChange} 
                  className="w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-green-100 file:text-green-700 hover:file:bg-green-200 cursor-pointer transition" 
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">Stack Tecnológico</label>
              <input type="text" name="habilidades" value={formData.habilidades} onChange={handleChange} placeholder="React, Python, SQL, Docker" className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none" />
            </div>

            <div className="pt-4">
              <button type="submit" className="w-full bg-green-500 text-white py-3 rounded-lg font-bold hover:bg-green-600 transition shadow-md">
                💾 Guardar Perfil y Archivos
              </button>
            </div>
          </form>
        </div>

      </div>
    </div>
  );
};

export default PerfilAspirante;