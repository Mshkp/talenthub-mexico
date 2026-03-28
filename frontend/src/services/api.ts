import axios from "axios";

const API_URL = process.env.REACT_APP_API_URL || "https://talenthub-mexico.onrender.com/api";

const api = axios.create({
  baseURL: API_URL
});

// Interceptor de Peticiones (Envía el token si existe)
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Token ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Interceptor de Respuestas (Expulsa al usuario SI Y SOLO SI el token caducó o es inválido)
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      // Limpiamos la basura del navegador para no dejar sesiones a medias
      localStorage.removeItem('token');
      localStorage.removeItem('user_tipo');
      localStorage.removeItem('user_username');
      // Redirigimos al login
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export default api;