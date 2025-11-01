import axios from 'axios';

const API_URL = 'http://localhost:5000/api';

// Create axios instance
const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json'
  }
});

// Add request interceptor to include auth token
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

// Auth API calls
export const registerUser = async (userData) => {
  try {
    const response = await api.post('/auth/register', userData);
    return response.data;
  } catch (error) {
    console.error('Error registering user:', error);
    throw error;
  }
};

export const loginUser = async (credentials) => {
  try {
    const response = await api.post('/auth/login', credentials);
    return response.data;
  } catch (error) {
    console.error('Error logging in:', error);
    throw error;
  }
};

// User API calls
export const getUsers = async (params = {}) => {
  try {
    const response = await api.get('/users', { params });
    return response.data;
  } catch (error) {
    console.error('Error fetching users:', error);
    throw error;
  }
};

export const getUser = async (id) => {
  try {
    const response = await api.get(`/users/${id}`);
    return response.data;
  } catch (error) {
    console.error('Error fetching user:', error);
    throw error;
  }
};

export const updateUser = async (id, userData) => {
  try {
    const response = await api.put(`/users/${id}`, userData);
    return response.data;
  } catch (error) {
    console.error('Error updating user:', error);
    throw error;
  }
};

export const deleteUser = async (id) => {
  try {
    const response = await api.delete(`/users/${id}`);
    return response.data;
  } catch (error) {
    console.error('Error deleting user:', error);
    throw error;
  }
};

export const getUserStats = async () => {
  try {
    const response = await api.get('/users/stats');
    return response.data;
  } catch (error) {
    console.error('Error fetching user stats:', error);
    throw error;
  }
};

// Current user profile API calls
export const getCurrentUser = async () => {
  try {
    const response = await api.get('/auth/me');
    return response.data;
  } catch (error) {
    console.error('Error fetching current user:', error);
    throw error;
  }
};

export const updateCurrentUser = async (userData) => {
  try {
    const response = await api.put('/auth/me', userData);
    return response.data;
  } catch (error) {
    console.error('Error updating current user:', error);
    throw error;
  }
};

// Goal API calls
export const getGoals = async (params = {}) => {
  try {
    const response = await api.get('/goals', { params });
    return response.data;
  } catch (error) {
    console.error('Error fetching goals:', error);
    throw error;
  }
};

export const getGoal = async (id) => {
  try {
    const response = await api.get(`/goals/${id}`);
    return response.data;
  } catch (error) {
    console.error('Error fetching goal:', error);
    throw error;
  }
};

export const createGoal = async (goalData) => {
  try {
    const response = await api.post('/goals', goalData);
    return response.data;
  } catch (error) {
    console.error('Error creating goal:', error);
    throw error;
  }
};

export const updateGoal = async (id, goalData) => {
  try {
    const response = await api.put(`/goals/${id}`, goalData);
    return response.data;
  } catch (error) {
    console.error('Error updating goal:', error);
    throw error;
  }
};

export const deleteGoal = async (id) => {
  try {
    const response = await api.delete(`/goals/${id}`);
    return response.data;
  } catch (error) {
    console.error('Error deleting goal:', error);
    throw error;
  }
};

export const getGoalCategories = async () => {
  try {
    const response = await api.get('/goals/categories');
    return response.data;
  } catch (error) {
    console.error('Error fetching goal categories:', error);
    throw error;
  }
};

// Roadmap API calls
export const getRoadmaps = async (params = {}) => {
  try {
    const response = await api.get('/roadmaps', { params });
    return response.data;
  } catch (error) {
    console.error('Error fetching roadmaps:', error);
    throw error;
  }
};

export const getRoadmap = async (id) => {
  try {
    const response = await api.get(`/roadmaps/${id}`);
    return response.data;
  } catch (error) {
    console.error('Error fetching roadmap:', error);
    throw error;
  }
};

export const createRoadmap = async (roadmapData) => {
  try {
    const response = await api.post('/roadmaps', roadmapData);
    return response.data;
  } catch (error) {
    console.error('Error creating roadmap:', error);
    throw error;
  }
};

export const updateRoadmap = async (id, roadmapData) => {
  try {
    const response = await api.put(`/roadmaps/${id}`, roadmapData);
    return response.data;
  } catch (error) {
    console.error('Error updating roadmap:', error);
    throw error;
  }
};

export const deleteRoadmap = async (id) => {
  try {
    const response = await api.delete(`/roadmaps/${id}`);
    return response.data;
  } catch (error) {
    console.error('Error deleting roadmap:', error);
    throw error;
  }
};

// Resource API calls
export const getResources = async (params = {}) => {
  try {
    const response = await api.get('/resources', { params });
    return response.data;
  } catch (error) {
    console.error('Error fetching resources:', error);
    throw error;
  }
};

export const getResource = async (id) => {
  try {
    const response = await api.get(`/resources/${id}`);
    return response.data;
  } catch (error) {
    console.error('Error fetching resource:', error);
    throw error;
  }
};

export const createResource = async (resourceData) => {
  try {
    const response = await api.post('/resources', resourceData);
    return response.data;
  } catch (error) {
    console.error('Error creating resource:', error);
    throw error;
  }
};

export const updateResource = async (id, resourceData) => {
  try {
    const response = await api.put(`/resources/${id}`, resourceData);
    return response.data;
  } catch (error) {
    console.error('Error updating resource:', error);
    throw error;
  }
};

export const deleteResource = async (id) => {
  try {
    const response = await api.delete(`/resources/${id}`);
    return response.data;
  } catch (error) {
    console.error('Error deleting resource:', error);
    throw error;
  }
};

export default api;