import api from '../api/axios';

// Derives the backend origin (e.g. https://your-api.onrender.com) from the API baseURL
const API_ORIGIN = (api.defaults.baseURL || '').replace(/\/api\/?$/, '');

export const storageUrl = (path) => {
  if (!path) return null;
  return `${API_ORIGIN}/storage/${path}`;
};