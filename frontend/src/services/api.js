import axios from 'axios';

const API_BASE = import.meta.env.VITE_API_URL || '/api';
const DIRECT_API_BASE = 'http://localhost:8080/api';

const api = axios.create({
  baseURL: API_BASE,
  headers: { 'Content-Type': 'application/json' },
});
api.interceptors.request.use((config) => {
  const url = config.url || '';
  const isAuthEndpoint = url.startsWith('/auth/') || url.includes('/api/auth/');
  const token = localStorage.getItem('attendai_token');
  if (token && !isAuthEndpoint) config.headers.Authorization = `Bearer ${token}`;
  return config;
});
api.interceptors.response.use(
  (res) => res,
  async (err) => {
    // If Vite proxy/network fails with no HTTP response, retry once directly against backend.
    if (!err.response && err.config && !err.config.__directRetry) {
      return api.request({
        ...err.config,
        baseURL: DIRECT_API_BASE,
        __directRetry: true,
      });
    }

    if (err.response?.status === 401) {
      localStorage.removeItem('attendai_user');
      localStorage.removeItem('attendai_token');
      window.location.href = '/login';
    }
    return Promise.reject(err);
  }
);
export const authAPI = {
  login: (data) => api.post('/auth/login', data),
  register: (data) => api.post('/auth/register', data),
};
export const studentsAPI = {
  getAll: (className) => api.get('/students', { params: className ? { className } : {} }),
  getById: (uid) => api.get(`/students/${uid}`),
  register: (data) => api.post('/students', data),
  delete: (uid) => api.delete(`/students/${uid}`),
  uploadFaceImages: (uid, formData) =>
    api.post(`/students/${uid}/faces`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    }),
};
export const sessionsAPI = {
  getAll: () => api.get('/sessions'),
  getByClass: (className) => api.get(`/sessions?class=${className}`),
  create: (data) => api.post('/sessions', data),
  delete: (id) => api.delete(`/sessions/${id}`),
};
export const attendanceAPI = {
  getAll: (params) => api.get('/attendance', { params }),
  markByFace: (sessionId, imageBlob) => {
    const fd = new FormData();
    fd.append('image', imageBlob, 'frame.jpg');
    return api.post(`/attendance/recognize/${sessionId}`, fd, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
  },
  exportExcel: (params) =>
    api.get('/attendance/export', {
      params,
      responseType: 'blob',
    }),
};

export default api;
