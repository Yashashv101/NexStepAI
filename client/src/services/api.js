import axios from 'axios';

const API_URL = 'http://localhost:5000/api';

// Create axios instance
const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json'
  }
});

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

// Goal API calls
export const getGoals = async () => {
  try {
    const response = await api.get('/goals');
    return response.data;
  } catch (error) {
    console.error('Error fetching goals:', error);
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

// Roadmap API calls
export const getRoadmaps = async () => {
  try {
    const response = await api.get('/roadmaps');
    return response.data;
  } catch (error) {
    console.error('Error fetching roadmaps:', error);
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

export default api;