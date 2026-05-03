import axios from 'axios';

// ✅ Dev → uses Vite proxy to localhost:5000
// ✅ Production → uses your Railway backend URL
const BASE_URL = import.meta.env.VITE_API_URL
  ? `${import.meta.env.VITE_API_URL}/api`
  : '/api';

const api = axios.create({
  baseURL: BASE_URL,
  headers: { 'Content-Type': 'application/json' },
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

api.interceptors.response.use(
  (res) => res,
  (err) => {
    if (err.response?.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    return Promise.reject(err);
  }
);

export const authAPI = {
  register: (d)    => api.post('/auth/register', d),
  login:    (d)    => api.post('/auth/login', d),
  getMe:    ()     => api.get('/auth/me'),
};
export const patientAPI = {
  getProfile:    ()  => api.get('/patients/me'),
  updateProfile: (d) => api.put('/patients/me', d),
};
export const symptomAPI = {
  analyze: (d) => api.post('/symptoms/analyze', d),
  history: ()  => api.get('/symptoms/history'),
};
export const prescriptionAPI = {
  getAll:  ()         => api.get('/prescriptions'),
  create:  (d)        => api.post('/prescriptions', d),
  update:  (id, d)    => api.put(`/prescriptions/${id}`, d),
  remove:  (id)       => api.delete(`/prescriptions/${id}`),
};
export const vitalAPI = {
  getAll:  (p) => api.get('/vitals', { params: p }),
  latest:  ()  => api.get('/vitals/latest'),
  create:  (d) => api.post('/vitals', d),
};
export const aiAPI = {
  chat: (messages) => api.post('/ai/chat', { messages }),
};
export const hospitalAPI = {
  // ✅ Now sends real GPS coordinates to get real nearby hospitals
  getAll: (params) => api.get('/hospitals', { params }),
  getOne: (id)     => api.get(`/hospitals/${id}`),
};
export const appointmentAPI = {
  getAll:  ()         => api.get('/appointments'),
  create:  (d)        => api.post('/appointments', d),
  update:  (id, d)    => api.put(`/appointments/${id}`, d),
  cancel:  (id)       => api.delete(`/appointments/${id}`),
};
export const messageAPI = {
  getHistory: (roomId) => api.get(`/messages/${roomId}`),
  send:       (d)      => api.post('/messages', d),
};

export default api;