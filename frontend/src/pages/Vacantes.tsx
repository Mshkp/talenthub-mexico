import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../services/api';
import { showError } from '../utils/alerts'; // IMPORTACIÓN NUEVA

interface Vacante {
  id: number;
  titulo: string;
  empresa_nombre: string;
  descripcion: string;
  salario_min: string;
  salario_max: string;
  modalidad: string;
  ubicacion: string;
  fecha_publicacion: string;
}

const Vacantes: React.FC = () => {
  const [vacantes, setVacantes] = useState<Vacante[]>([]);
  const [vacantesFiltradas, setVacantesFiltradas] = useState<Vacante[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Filtros
  const [searchTerm, setSearchTerm] = useState('');
  const [modalidadFiltro, setModalidadFiltro] = useState('');
  const [salarioMin, setSalarioMin] = useState('');

  useEffect(() => {
    const fetchVacantes = async () => {
      try {
        const response = await api.get('/vacantes/');
        setVacantes(response.data);
        setVacantesFiltradas(response.data);
        setLoading(false);
      } catch (error) {
        showError('No se pudieron cargar las vacantes. Revisa tu conexión.'); // ALERTA NUEVA
        setLoading(false);
      }
    };

    fetchVacantes();
  }, []);

  // Aplicar filtros
  useEffect(() => {
    let resultado = [...vacantes];

    // Filtro por texto
    if (searchTerm) {
      resultado = resultado.filter(v => 
        v.titulo.toLowerCase().includes(searchTerm.toLowerCase()) ||
        v.empresa_nombre.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Filtro por modalidad
    if (modalidadFiltro) {
      resultado = resultado.filter(v => v.modalidad === modalidadFiltro);
    }

    // Filtro por salario mínimo
    if (salarioMin) {
      resultado = resultado.filter(v => parseFloat(v.salario_max) >= parseFloat(salarioMin));
    }

    setVacantesFiltradas(resultado);
  }, [searchTerm, modalidadFiltro, salarioMin, vacantes]);

  const limpiarFiltros = () => {
    setSearchTerm('');
    setModalidadFiltro('');
    setSalarioMin('');
  };

  const getModalidadColor = (modalidad: string) => {
    switch (modalidad) {
      case 'remoto': return 'bg-green-100 text-green-800';
      case 'presencial': return 'bg-blue-100 text-blue-800';
      case 'hibrido': return 'bg-purple-100 text-purple-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-xl text-talenthub-gray">Cargando vacantes...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* Content */}
      <div className="max-w-7xl w-full mx-auto px-4 py-8 flex-grow">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-talenthub-gray mb-2">
            Vacantes Disponibles
          </h1>
          <p className="text-gray-600">
            {vacantesFiltradas.length} de {vacantes.length} oportunidades
          </p>
        </div>

        {/* Filtros */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <h2 className="text-lg font-bold text-talenthub-gray mb-4">🔍 Filtros de Búsqueda</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {/* Búsqueda por texto */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">
                Buscar
              </label>
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Título o empresa..."
                className="w-full px-4 py-2 border-2 border-gray-300 rounded-lg focus:border-talenthub-blue focus:outline-none"
              />
            </div>

            {/* Filtro modalidad */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">
                Modalidad
              </label>
              <select
                value={modalidadFiltro}
                onChange={(e) => setModalidadFiltro(e.target.value)}
                className="w-full px-4 py-2 border-2 border-gray-300 rounded-lg focus:border-talenthub-blue focus:outline-none"
              >
                <option value="">Todas</option>
                <option value="remoto">Remoto</option>
                <option value="presencial">Presencial</option>
                <option value="hibrido">Híbrido</option>
              </select>
            </div>

            {/* Filtro salario */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">
                Salario mínimo
              </label>
              <input
                type="number"
                value={salarioMin}
                onChange={(e) => setSalarioMin(e.target.value)}
                placeholder="30000"
                className="w-full px-4 py-2 border-2 border-gray-300 rounded-lg focus:border-talenthub-blue focus:outline-none"
              />
            </div>

            {/* Botón limpiar */}
            <div className="flex items-end">
              <button
                onClick={limpiarFiltros}
                className="w-full bg-gray-200 text-gray-700 px-4 py-2 rounded-lg font-semibold hover:bg-gray-300 transition"
              >
                Limpiar filtros
              </button>
            </div>
          </div>
        </div>

        {/* Vacantes List */}
        <div className="space-y-4">
          {vacantesFiltradas.map((vacante) => (
            <div
              key={vacante.id}
              className="bg-white border-2 border-gray-200 rounded-lg p-6 hover:border-talenthub-blue hover:shadow-lg transition cursor-pointer"
            >
              <div className="flex justify-between items-start mb-3">
                <div>
                  <h2 className="text-2xl font-bold text-talenthub-gray mb-1">
                    {vacante.titulo}
                  </h2>
                  <p className="text-gray-600">{vacante.empresa_nombre}</p>
                </div>
                <span className={`px-3 py-1 rounded-full text-xs font-semibold ${getModalidadColor(vacante.modalidad)}`}>
                  {vacante.modalidad.charAt(0).toUpperCase() + vacante.modalidad.slice(1)}
                </span>
              </div>

              <p className="text-gray-700 mb-4">
                {vacante.descripcion.substring(0, 150)}...
              </p>

              <div className="flex justify-between items-center">
                <div>
                  <span className="text-talenthub-blue font-bold text-lg">
                    ${parseFloat(vacante.salario_min).toLocaleString()} - ${parseFloat(vacante.salario_max).toLocaleString()} MXN
                  </span>
                  <p className="text-sm text-gray-500">{vacante.ubicacion}</p>
                </div>
                <Link 
                  to={`/vacantes/${vacante.id}`}
                  className="bg-talenthub-blue text-white px-6 py-2 rounded-lg font-semibold hover:bg-blue-700 transition"
                >
                  Ver detalles
                </Link>
              </div>
            </div>
          ))}
        </div>

        {vacantesFiltradas.length === 0 && (
          <div className="bg-white rounded-lg shadow-md p-8 text-center">
            <p className="text-xl text-gray-600">No se encontraron vacantes con esos filtros</p>
            <button 
              onClick={limpiarFiltros}
              className="mt-4 text-talenthub-blue font-semibold hover:underline"
            >
              Limpiar filtros
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default Vacantes;
