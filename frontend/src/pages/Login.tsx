import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import api from '../services/api';
import { showSuccess } from '../utils/alerts';


const Login: React.FC = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    username: '',
    password: ''
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const response = await api.post('/login/', {
        username: formData.username,
        password: formData.password
      });

      // Guardar sesión
      localStorage.setItem('token', response.data.token);
      localStorage.setItem('user_tipo', response.data.tipo);
      localStorage.setItem('user_username', response.data.username);
      localStorage.setItem('user_id', response.data.id);
      
      // MUY IMPORTANTE: actualizar axios con el token
      api.defaults.headers.common['Authorization'] = `Token ${response.data.token}`;
      
      showSuccess('¡Inicio de sesión exitoso!');

      // Redirección
      if (response.data.tipo === 'empresa') {
        navigate('/dashboard');
      } else {
        navigate('/vacantes');
      }

    } catch (err: any) {
      setError('Usuario o contraseña incorrectos');
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
      <div className="max-w-md w-full bg-white rounded-lg shadow-lg p-8">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-talenthub-blue mb-2">TalentHub México</h1>
          <p className="text-gray-600">Inicia sesión en tu cuenta</p>
        </div>

        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-semibold text-talenthub-gray mb-1">Usuario</label>
            <input type="text" name="username" value={formData.username} onChange={handleChange} className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:border-talenthub-blue focus:outline-none transition" required />
          </div>

          <div>
            <label className="block text-sm font-semibold text-talenthub-gray mb-1">Contraseña</label>
            <input type="password" name="password" value={formData.password} onChange={handleChange} className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:border-talenthub-blue focus:outline-none transition" required />
          </div>

          <button type="submit" disabled={loading} className="w-full bg-talenthub-blue text-white py-3 rounded-lg font-semibold hover:bg-blue-700 transition disabled:bg-gray-400">
            {loading ? 'Iniciando sesión...' : 'Iniciar Sesión'}
          </button>
        </form>

        <p className="text-center text-gray-600 mt-6">
          <div className="text-center mt-3 mb-2 text-blue-600 hover:underline text-sm">
              <Link to="/olvide-password" style={{ color: '#610000', textDecoration: 'none', fontSize: '16px' }}>
                ¿Olvidaste tu contraseña?
              </Link>
          </div>

          ¿No tienes cuenta?{' '}
          <Link to="/register" className="text-talenthub-blue font-semibold hover:underline">Regístrate aquí</Link>
        </p>
      </div>
    </div>
  );
};

export default Login;