import axios from "axios";

// Configuración de URLs dinámicas
const API_URL = process.env.REACT_APP_API_URL || "https://talenthub-mexico.onrender.com/api";
// -----> Para pruebas en local const API_URL = "http://localhost:8000/api";
const BASE_URL = API_URL.replace('/api', ''); 

const api = axios.create({
  baseURL: API_URL
});

api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Token ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('user_tipo');
      localStorage.removeItem('user_username');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

/**
 * Helper Pro para formatear URLs de archivos media.
 * Resuelve el problema del "Círculo Blanco" y enlaces rotos.
 */
export const getMediaUrl = (url: string | null) => {
  if (!url) return null;
  if (url.startsWith("http")) return url;
  return `${BASE_URL}${url}`;
};

export default api;