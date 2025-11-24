import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import api from '../services/api';

const Register: React.FC = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    password2: '',
    tipo: 'aspirante',
    telefono: ''
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (formData.password !== formData.password2) {
      setError('Las contraseñas no coinciden');
      return;
    }

    setLoading(true);
    try {
      await api.post('/auth/register/', {
        username: formData.username,
        email: formData.email,
        password: formData.password,
        tipo: formData.tipo,
        telefono: formData.telefono
      });
      alert('¡Registro exitoso! Ahora puedes iniciar sesión');
      navigate('/login');
    } catch (err: any) {
      setError(err.response?.data?.message || 'Error al registrarse');
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4 py-8">
      <div className="max-w-md w-full bg-white rounded-lg shadow-lg p-8">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-talenthub-blue mb-2">TalentHub México</h1>
          <p className="text-gray-600">Crea tu cuenta</p>
        </div>

        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-semibold text-talenthub-gray mb-1">
              Tipo de cuenta
            </label>
            <select
              name="tipo"
              value={formData.tipo}
              onChange={handleChange}
              className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:border-talenthub-blue focus:outline-none transition"
              required
            >
              <option value="aspirante">Aspirante (Busco empleo)</option>
              <option value="empresa">Empresa (Publico vacantes)</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-semibold text-talenthub-gray mb-1">
              Nombre de usuario
            </label>
            <input
              type="text"
              name="username"
              value={formData.username}
              onChange={handleChange}
              className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:border-talenthub-blue focus:outline-none transition"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-talenthub-gray mb-1">
              Email
            </label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:border-talenthub-blue focus:outline-none transition"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-talenthub-gray mb-1">
              Teléfono
            </label>
            <input
              type="tel"
              name="telefono"
              value={formData.telefono}
              onChange={handleChange}
              className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:border-talenthub-blue focus:outline-none transition"
              placeholder="5512345678"
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-talenthub-gray mb-1">
              Contraseña
            </label>
            <input
              type="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:border-talenthub-blue focus:outline-none transition"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-talenthub-gray mb-1">
              Confirmar contraseña
            </label>
            <input
              type="password"
              name="password2"
              value={formData.password2}
              onChange={handleChange}
              className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:border-talenthub-blue focus:outline-none transition"
              required
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-talenthub-blue text-white py-3 rounded-lg font-semibold hover:bg-blue-700 transition disabled:bg-gray-400"
          >
            {loading ? 'Registrando...' : 'Crear cuenta'}
          </button>
        </form>

        <p className="text-center text-gray-600 mt-6">
          ¿Ya tienes cuenta?{' '}
          <Link to="/login" className="text-talenthub-blue font-semibold hover:underline">
            Inicia sesión
          </Link>
        </p>
      </div>
    </div>
  );
};

export default Register;