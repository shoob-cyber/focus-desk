import axios from 'axios';

const API_BASE_URL = 'http://localhost:5000/api';

const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add JWT token to every request
apiClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('focusdesk_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

export const authAPI = {
  register: (email, password) => 
    apiClient.post('/auth/register', { email, password }),
  login: (email, password) => 
    apiClient.post('/auth/login', { email, password }),
};

export const taskAPI = {
  getTasks: () => apiClient.get('/tasks'),
  createTask: (title, description, dueDate, estimatedPomodoros) =>
    apiClient.post('/tasks', { title, description, dueDate, estimatedPomodoros }),
  updateTask: (taskId, updates) =>
    apiClient.put(`/tasks/${taskId}`, updates),
  deleteTask: (taskId) =>
    apiClient.delete(`/tasks/${taskId}`),
};

export const sessionAPI = {
  logSession: (taskId, durationMinutes, completed) =>
    apiClient.post('/sessions', { taskId, durationMinutes, completed }),
  getSessions: () => apiClient.get('/sessions'),
};

export const analyticsAPI = {
  getDashboardStats: () => apiClient.get('/analytics/dashboard'),
};

export default apiClient;