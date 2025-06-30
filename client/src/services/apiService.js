import axios from 'axios';
import socketService from './socketService';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

// Create axios instance
const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json'
  }
});

// Request interceptor to add auth token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor for error handling
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Token expired or invalid
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      socketService.disconnect();
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// Authentication API
export const authAPI = {
  login: async (credentials) => {
    const response = await api.post('/auth/login', credentials);
    if (response.data.success && response.data.token) {
      localStorage.setItem('token', response.data.token);
      localStorage.setItem('user', JSON.stringify(response.data.user));
      
      // Connect socket with token
      socketService.connect(response.data.token);
    }
    return response.data;
  },

  register: async (userData) => {
    const response = await api.post('/auth/register', userData);
    if (response.data.success && response.data.token) {
      localStorage.setItem('token', response.data.token);
      localStorage.setItem('user', JSON.stringify(response.data.user));
      
      // Connect socket with token
      socketService.connect(response.data.token);
    }
    return response.data;
  },

  logout: async () => {
    await api.post('/auth/logout');
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    socketService.disconnect();
  },

  getCurrentUser: async () => {
    const response = await api.get('/auth/me');
    return response.data;
  }
};

// User API
export const userAPI = {
  getProfile: async (userId) => {
    const response = await api.get(`/users/${userId}`);
    return response.data;
  },

  updateProfile: async (userId, data) => {
    const response = await api.put(`/users/${userId}`, data);
    return response.data;
  },

  getLeaderboard: async (ward = null) => {
    const response = await api.get(`/users/leaderboard${ward ? `?ward=${ward}` : ''}`);
    return response.data;
  },

  getUserStats: async (userId) => {
    const response = await api.get(`/users/${userId}/stats`);
    return response.data;
  }
};

// Vehicle API
export const vehicleAPI = {
  getVehicles: async (ward = null) => {
    const response = await api.get(`/vehicles${ward ? `?ward=${ward}` : ''}`);
    return response.data;
  },

  getVehicle: async (vehicleId) => {
    const response = await api.get(`/vehicles/${vehicleId}`);
    return response.data;
  },

  updateVehicleLocation: async (vehicleId, location) => {
    const response = await api.put(`/vehicles/${vehicleId}/location`, location);
    
    // Also emit real-time update
    socketService.updateLocation(location.lat, location.lng, vehicleId);
    
    return response.data;
  },

  updateVehicleStatus: async (vehicleId, status) => {
    const response = await api.put(`/vehicles/${vehicleId}/status`, { status });
    
    // Also emit real-time update
    socketService.updateVehicleStatus(status, vehicleId);
    
    return response.data;
  },

  getVehicleHistory: async (vehicleId, days = 7) => {
    const response = await api.get(`/vehicles/${vehicleId}/history?days=${days}`);
    return response.data;
  }
};

// Report API
export const reportAPI = {
  getReports: async (filters = {}) => {
    const params = new URLSearchParams(filters);
    const response = await api.get(`/reports?${params}`);
    return response.data;
  },

  getReport: async (reportId) => {
    const response = await api.get(`/reports/${reportId}`);
    return response.data;
  },

  createReport: async (reportData) => {
    const response = await api.post('/reports', reportData);
    return response.data;
  },

  updateReport: async (reportId, data) => {
    const response = await api.put(`/reports/${reportId}`, data);
    
    // Emit real-time update
    socketService.updateReport(reportId, data.status, data.message);
    
    return response.data;
  },

  deleteReport: async (reportId) => {
    const response = await api.delete(`/reports/${reportId}`);
    return response.data;
  },

  addReportUpdate: async (reportId, message, type = 'comment') => {
    const response = await api.post(`/reports/${reportId}/updates`, { message, type });
    return response.data;
  },

  voteOnReport: async (reportId, vote) => {
    const response = await api.post(`/reports/${reportId}/vote`, { vote });
    return response.data;
  }
};

// Schedule API
export const scheduleAPI = {
  getSchedules: async (filters = {}) => {
    const params = new URLSearchParams(filters);
    const response = await api.get(`/schedules?${params}`);
    return response.data;
  },

  getSchedule: async (scheduleId) => {
    const response = await api.get(`/schedules/${scheduleId}`);
    return response.data;
  },

  createSchedule: async (scheduleData) => {
    const response = await api.post('/schedules', scheduleData);
    return response.data;
  },

  updateSchedule: async (scheduleId, data) => {
    const response = await api.put(`/schedules/${scheduleId}`, data);
    return response.data;
  },

  startCollection: async (scheduleId) => {
    const response = await api.post(`/schedules/${scheduleId}/start`);
    
    // Emit real-time notification
    const schedule = response.data.schedule;
    socketService.notifyCollectionStarted(scheduleId, schedule.ward);
    
    return response.data;
  },

  completeCollection: async (scheduleId, stats) => {
    const response = await api.post(`/schedules/${scheduleId}/complete`, stats);
    
    // Emit real-time notification
    const schedule = response.data.schedule;
    socketService.notifyCollectionCompleted(scheduleId, schedule.ward, stats);
    
    return response.data;
  }
};

// Analytics API
export const analyticsAPI = {
  getDashboardStats: async (ward = null) => {
    const response = await api.get(`/analytics/dashboard${ward ? `?ward=${ward}` : ''}`);
    return response.data;
  },

  getCollectionStats: async (period = '7d', ward = null) => {
    const response = await api.get(`/analytics/collection?period=${period}${ward ? `&ward=${ward}` : ''}`);
    return response.data;
  },

  getVehiclePerformance: async (vehicleId = null, period = '30d') => {
    const response = await api.get(`/analytics/vehicles${vehicleId ? `/${vehicleId}` : ''}?period=${period}`);
    return response.data;
  },

  getReportAnalytics: async (period = '30d', ward = null) => {
    const response = await api.get(`/analytics/reports?period=${period}${ward ? `&ward=${ward}` : ''}`);
    return response.data;
  },

  getWasteAnalytics: async (period = '30d', ward = null) => {
    const response = await api.get(`/analytics/waste?period=${period}${ward ? `&ward=${ward}` : ''}`);
    return response.data;
  }
};

// Notification API
export const notificationAPI = {
  getNotifications: async (limit = 20) => {
    const response = await api.get(`/notifications?limit=${limit}`);
    return response.data;
  },

  markAsRead: async (notificationId) => {
    const response = await api.put(`/notifications/${notificationId}/read`);
    return response.data;
  },

  markAllAsRead: async () => {
    const response = await api.put('/notifications/read-all');
    return response.data;
  },

  getUnreadCount: async () => {
    const response = await api.get('/notifications/unread-count');
    return response.data;
  }
};

// Chat API
export const chatAPI = {
  getConversations: async () => {
    const response = await api.get('/chat/conversations');
    return response.data;
  },

  getMessages: async (conversationId, page = 1, limit = 50) => {
    const response = await api.get(`/chat/conversations/${conversationId}/messages?page=${page}&limit=${limit}`);
    return response.data;
  },

  sendMessage: async (recipientId, message, type = 'text') => {
    const response = await api.post('/chat/messages', { recipientId, message, type });
    
    // Also emit real-time message
    socketService.sendMessage(recipientId, message, type);
    
    return response.data;
  },

  markMessagesAsRead: async (conversationId) => {
    const response = await api.put(`/chat/conversations/${conversationId}/read`);
    return response.data;
  }
};

// Upload API
export const uploadAPI = {
  uploadImage: async (file, type = 'general') => {
    const formData = new FormData();
    formData.append('image', file);
    formData.append('type', type);

    const response = await api.post('/upload/image', formData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    });
    return response.data;
  },

  uploadMultipleImages: async (files, type = 'general') => {
    const formData = new FormData();
    files.forEach(file => {
      formData.append('images', file);
    });
    formData.append('type', type);

    const response = await api.post('/upload/images', formData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    });
    return response.data;
  }
};

export default {
  auth: authAPI,
  user: userAPI,
  vehicle: vehicleAPI,
  report: reportAPI,
  schedule: scheduleAPI,
  analytics: analyticsAPI,
  notification: notificationAPI,
  chat: chatAPI,
  upload: uploadAPI
};