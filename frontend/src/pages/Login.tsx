import React, { useState } from 'react';
import { Link } from 'react-router-dom';

const Login: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Aquí irá la lógica de login con la API
    console.log('Login:', { email, password });
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
      <div className="max-w-md w-full bg-white rounded-lg shadow-lg p-8">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-talenthub-blue mb-2">TalentHub México</h1>
          <p className="text-gray-600">Inicia sesión en tu cuenta</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-semibold text-talenthub-gray mb-1">
              Email
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:border-talenthub-blue focus:outline-none transition"
              placeholder="tu@email.com"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-talenthub-gray mb-1">
              Contraseña
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:border-talenthub-blue focus:outline-none transition"
              placeholder="••••••••"
              required
            />
          </div>

          <button
            type="submit"
            className="w-full bg-talenthub-blue text-white py-3 rounded-lg font-semibold hover:bg-blue-700 transition"
          >
            Iniciar Sesión
          </button>
        </form>

        <p className="text-center text-gray-600 mt-6">
          ¿No tienes cuenta?{' '}
          <Link to="/register" className="text-talenthub-blue font-semibold hover:underline">
            Regístrate aquí
          </Link>
        </p>
      </div>
    </div>
  );
};

export default Login;