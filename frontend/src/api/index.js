import api from './axios';

export const authAPI = {
  login: (data) => api.post('/auth/login', data),
  register: (data) => api.post('/auth/register', data),
  getMe: () => api.get('/auth/me'),
  updateProfile: (data) => api.put('/auth/me', data),
  updatePassword: (data) => api.put('/auth/password', data),
  logout: () => api.post('/auth/logout'),
  getUsers: () => api.get('/auth/users'),
  updateUser: (id, data) => api.put(`/auth/users/${id}`, data),
};

export const tradeAPI = {
  getAll: (params) => api.get('/trades', { params }),
  getOne: (id) => api.get(`/trades/${id}`),
  create: (data) => api.post('/trades', data),
  update: (id, data) => api.put(`/trades/${id}`, data),
  validate: (id) => api.post(`/trades/${id}/validate`),
  match: (id, data) => api.post(`/trades/${id}/match`, data),
  settle: (id) => api.post(`/trades/${id}/settle`),
  reject: (id, data) => api.post(`/trades/${id}/reject`, data),
  getStats: () => api.get('/trades/stats'),
};

export const exceptionAPI = {
  getAll: (params) => api.get('/exceptions', { params }),
  getOne: (id) => api.get(`/exceptions/${id}`),
  assign: (id, data) => api.put(`/exceptions/${id}/assign`, data),
  resolve: (id, data) => api.put(`/exceptions/${id}/resolve`, data),
  escalate: (id, data) => api.put(`/exceptions/${id}/escalate`, data),
  close: (id) => api.put(`/exceptions/${id}/close`),
  getStats: () => api.get('/exceptions/stats'),
};

export const auditAPI = {
  getAll: (params) => api.get('/audit', { params }),
  getByEntity: (entityId) => api.get(`/audit/${entityId}`),
};

export const notificationAPI = {
  getAll: (params) => api.get('/notifications', { params }),
  markRead: (id) => api.put(`/notifications/${id}/read`),
  markAllRead: () => api.put('/notifications/read-all'),
  delete: (id) => api.delete(`/notifications/${id}`),
};

export const reportAPI = {
  getAll: () => api.get('/reports'),
  getOne: (id) => api.get(`/reports/${id}`),
  generate: (data) => api.post('/reports', data),
  getAnalytics: () => api.get('/reports/analytics'),
};
