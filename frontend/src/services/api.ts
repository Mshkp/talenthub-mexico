import axios from "axios";

const api = axios.create({
  baseURL: "http://127.0.0.1:8000/api"
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