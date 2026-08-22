import axios from 'axios';

const api = axios.create({
  baseURL: '/api/v1',
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor: attach token if available
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('impacthub_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor: handle 401 unauth
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      // If token expired and not on login page
      if (!window.location.pathname.includes('/login') && localStorage.getItem('impacthub_token')) {
        localStorage.removeItem('impacthub_token');
        localStorage.removeItem('impacthub_user');
      }
    }
    return Promise.reject(error);
  }
);

// Auth Services
export const authAPI = {
  register: (formData) =>
    api.post('/auth/register', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    }),
  login: (credentials) => api.post('/auth/login', credentials),
  demoLogin: (role) => api.post('/auth/demo-login', { role }),
  getMe: () => api.get('/auth/me'),
  updateProfile: (formData) =>
    api.put('/auth/profile', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    }),
};

// Project Services
export const projectAPI = {
  getProjects: (params) => api.get('/projects', { params }),
  getProjectById: (id) => api.get(`/projects/${id}`),
  createProject: (formData) =>
    api.post('/projects', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    }),
  updateProject: (id, formData) =>
    api.put(`/projects/${id}`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    }),
  deleteProject: (id) => api.delete(`/projects/${id}`),
};

// Application Services
export const applicationAPI = {
  apply: (data) => api.post('/applications', data),
  getMyApplications: () => api.get('/applications/my'),
  getProjectApplications: (projectId) =>
    api.get(`/applications/project/${projectId}`),
  reviewApplication: (id, data) => api.put(`/applications/${id}/review`, data),
};

// Task Services
export const taskAPI = {
  createTask: (data) => api.post('/tasks', data),
  getProjectTasks: (projectId) => api.get(`/tasks/project/${projectId}`),
  getMyTasks: () => api.get('/tasks/my'),
  updateTaskStatus: (id, formDataOrData) => {
    if (formDataOrData instanceof FormData) {
      return api.put(`/tasks/${id}/status`, formDataOrData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
    }
    return api.put(`/tasks/${id}/status`, formDataOrData);
  },
  deleteTask: (id) => api.delete(`/tasks/${id}`),
};

// Discussion Services
export const discussionAPI = {
  getComments: (projectId) => api.get(`/discussions/project/${projectId}`),
  addComment: (data) => api.post('/discussions', data),
  deleteComment: (id) => api.delete(`/discussions/${id}`),
};

// Notification Services
export const notificationAPI = {
  getMyNotifications: () => api.get('/notifications'),
  markAsRead: (id) => api.put(`/notifications/${id}/read`),
  markAllAsRead: () => api.put('/notifications/read-all'),
};

// Review Services
export const reviewAPI = {
  getReviews: (projectId) => api.get(`/reviews/project/${projectId}`),
  addReview: (data) => api.post('/reviews', data),
};

// Admin Services
export const adminAPI = {
  getStats: () => api.get('/admin/stats'),
  getUsers: (params) => api.get('/admin/users', { params }),
  toggleUserStatus: (id, status) => api.put(`/admin/users/${id}/status`, { status }),
  updateUserRole: (id, role) => api.put(`/admin/users/${id}/role`, { role }),
  reviewProject: (id, status) => api.put(`/admin/projects/${id}/review`, { status }),
};

// Leaderboard Services
export const leaderboardAPI = {
  getLeaderboard: () => api.get('/leaderboard'),
};

export default api;
