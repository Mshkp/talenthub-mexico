import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api, { getMediaUrl } from '../services/api';
import { showSuccess, showError } from '../utils/alerts';

const PerfilAspirante: React.FC = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    telefono: '',
    profesion: '',
    experiencia_resumen: '',
    habilidades: ''
  });

  const [cvFile, setCvFile] = useState<File | null>(null);
  const [fotoFile, setFotoFile] = useState<File | null>(null);
  const [cvUrlActual, setCvUrlActual] = useState<string>('');
  const [fotoUrlActual, setFotoUrlActual] = useState<string>('');

  useEffect(() => {
    cargarPerfil();
  }, []);

  const cargarPerfil = async () => {
    try {
      const [perfilResponse, userResponse] = await Promise.all([
        api.get('/perfil/aspirante/'),
        api.get('/user-info/')
      ]);
      
      const data = perfilResponse.data;
      const userData = userResponse.data;
      
      setFormData({
        username: userData.username || '',
        email: userData.email || '',
        telefono: userData.telefono || '',
        profesion: data.profesion || '',
        experiencia_resumen: data.experiencia_resumen || '',
        habilidades: Array.isArray(data.habilidades) ? data.habilidades.join(', ') : (data.habilidades || '')
      });

      setCvUrlActual(data.cv_url || '');
      setFotoUrlActual(data.foto_url || '');
    } catch (err: any) {
      if (err.response?.status !== 404) {
        showError("Error al cargar los datos del perfil.");
      }
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, files } = e.target;
    if (files && files[0]) {
      if (name === 'cv') setCvFile(files[0]);
      if (name === 'foto') setFotoFile(files[0]);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const data = new FormData();
    
    data.append('username', formData.username);
    data.append('email', formData.email);
    data.append('telefono', formData.telefono);
    data.append('profesion', formData.profesion);
    data.append('experiencia_resumen', formData.experiencia_resumen);
    data.append('habilidades', formData.habilidades);
    
    if (cvFile) data.append('cv', cvFile);
    if (fotoFile) data.append('foto', fotoFile);

    try {
      await api.post('/perfil/aspirante/', data, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      
      localStorage.setItem('user_username', formData.username);
      showSuccess("Perfil actualizado con éxito.");
      cargarPerfil();
    } catch (err: any) {
      showError("Error al guardar los cambios. Verifica si el nombre de usuario ya existe.");
    }
  };

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-600"></div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4">
      <div className="max-w-4xl mx-auto bg-white rounded-2xl shadow-xl overflow-hidden border border-gray-100">
        
        {/* Cabecera con degradado Azul/Cian (Estilo similar al verde anterior) */}
        <div className="bg-gradient-to-r from-blue-600 to-blue-800 h-32"></div>
        
        <div className="px-8 pb-8">
          <div className="relative -mt-16 mb-6 flex flex-col items-center text-center">
            <div className="w-32 h-32 bg-white rounded-full p-1 shadow-lg border-4 border-white overflow-hidden flex items-center justify-center">
              {fotoUrlActual ? (
                <img 
                  src={getMediaUrl(fotoUrlActual) || ''} 
                  alt="Foto de perfil" 
                  className="w-full h-full object-cover rounded-full"
                  onError={(e) => { e.currentTarget.src = 'https://ui-avatars.com/api/?name=' + formData.username + '&background=random'; }}
                />
              ) : (
                <div className="text-4xl text-gray-400 font-bold bg-gray-100 w-full h-full flex items-center justify-center">
                  {formData.username?.charAt(0).toUpperCase()}
                </div>
              )}
            </div>
            
            <h1 className="mt-4 text-3xl font-extrabold text-gray-900">{formData.username}</h1>
            <p className="text-gray-500 font-medium mb-4">{formData.profesion || 'Aspirante en TalentHub'}</p>
            
            {/* Apartado separado para el CV debajo del nombre con Icono */}
            {cvUrlActual && (
              <a 
                href={getMediaUrl(cvUrlActual) || '#'} 
                target="_blank" 
                rel="noopener noreferrer" 
                className="inline-flex items-center gap-2 px-6 py-2.5 bg-blue-50 text-blue-700 font-bold rounded-full hover:bg-blue-100 transition shadow-sm border border-blue-200"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                Ver Currículum Vitae
              </a>
            )}
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            
            <div className="bg-gray-50 p-6 rounded-xl border border-gray-200 mb-6">
              <h3 className="text-lg font-bold text-gray-800 mb-4 border-b border-gray-200 pb-2">Información de Cuenta</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1">Nombre de Usuario</label>
                  <input type="text" name="username" value={formData.username} onChange={handleChange} className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none bg-white transition" required />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1">Correo Electrónico</label>
                  <input type="email" name="email" value={formData.email} onChange={handleChange} className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none bg-white transition" required />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1">Teléfono de Contacto</label>
                  <input type="tel" name="telefono" value={formData.telefono} onChange={handleChange} placeholder="Ej. 2221234567" className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none bg-white transition" />
                </div>
              </div>
            </div>

            <h3 className="text-lg font-bold text-gray-800 mb-2 border-b border-gray-200 pb-2">Perfil Profesional</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">Profesión / Especialidad</label>
                <input type="text" name="profesion" value={formData.profesion} onChange={handleChange} className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none transition" required />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">Habilidades (Separadas por coma)</label>
                <input type="text" name="habilidades" value={formData.habilidades} onChange={handleChange} placeholder="React, Python, AWS, Docker" className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none transition" />
              </div>
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">Resumen de Experiencia</label>
              <textarea name="experiencia_resumen" value={formData.experiencia_resumen} onChange={handleChange} rows={4} className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none resize-none transition" placeholder="Describe brevemente tus logros y trayectoria..."></textarea>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className={`p-4 rounded-xl border ${fotoUrlActual ? 'bg-blue-50 border-blue-200' : 'bg-gray-50 border-gray-200'} transition-all`}>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  {fotoUrlActual ? '🔄 Cambiar Imagen de Perfil' : '📸 Cargar Imagen de Perfil'}
                </label>
                <input type="file" name="foto" accept="image/*" onChange={handleFileChange} className="w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-bold file:bg-blue-600 file:text-white hover:file:bg-blue-700 cursor-pointer transition" />
              </div>

              <div className={`p-4 rounded-xl border ${cvUrlActual ? 'bg-blue-50 border-blue-200' : 'bg-gray-50 border-gray-200'} transition-all`}>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  {cvUrlActual ? '🔄 Actualizar Currículum' : '📄 Cargar Currículum (PDF)'}
                </label>
                <input type="file" name="cv" accept=".pdf" onChange={handleFileChange} className="w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-bold file:bg-blue-600 file:text-white hover:file:bg-blue-700 cursor-pointer transition" />
              </div>
            </div>

            <div className="flex gap-4 pt-6">
              <button type="button" onClick={() => navigate('/dashboard')} className="flex-1 bg-gray-200 text-gray-700 py-3 rounded-xl font-bold hover:bg-gray-300 transition-colors">Cancelar</button>
              <button type="submit" className="flex-2 w-full bg-blue-600 text-white py-3 rounded-xl font-bold hover:bg-blue-700 shadow-lg shadow-blue-200 transition-all">Guardar Cambios</button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default PerfilAspirante;