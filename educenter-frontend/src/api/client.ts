import axios from 'axios';

const api = axios.create({
  baseURL: 'http://localhost:8080/api',
});

// Student endpoints
export const studentApi = {
  getAll: () => api.get('/students'),
  getById: (id: number) => api.get(`/students/${id}`),
  create: (data: any) => api.post('/students', data),
  update: (id: number, data: any) => api.put(`/students/${id}`, data),
  delete: (id: number) => api.delete(`/students/${id}`),
  getByStatus: (status: string) => api.get(`/students/status/${status}`),
  getByClasse: (classeId: number) => api.get(`/students/classe/${classeId}`),
};

// Classe endpoints
export const classeApi = {
  getAll: () => api.get('/classes'),
  getById: (id: number) => api.get(`/classes/${id}`),
  getActive: () => api.get('/classes/active'),
  create: (data: any) => api.post('/classes', data),
  update: (id: number, data: any) => api.put(`/classes/${id}`, data),
  delete: (id: number) => api.delete(`/classes/${id}`),
};

// Payment endpoints
export const financeApi = {
  getAll: () => api.get('/payments'),
  getById: (id: number) => api.get(`/payments/${id}`),
  getByStatus: (status: string) => api.get(`/payments?status=${status}`),
  create: (data: any) => api.post('/payments', data),
  update: (id: number, data: any) => api.put(`/payments/${id}`, data),
  delete: (id: number) => api.delete(`/payments/${id}`),
};

export const dashboardApi = {
  getStats: () => api.get('/dashboard/stats'),
};

export default api;


