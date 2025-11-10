import axios from 'axios';

const API_URL = 'http://localhost:5000/api';

// Helper function to get user-friendly error messages
const getErrorMessage = (error) => {
  if (error.response?.data?.message) {
    return error.response.data.message;
  }

  if (error.response?.status === 400) {
    return 'Invalid data provided. Please check your inputs and try again.';
  }

  if (error.response?.status === 401) {
    return 'You are not authorized to perform this action. Please log in and try again.';
  }

  if (error.response?.status === 403) {
    return 'You do not have permission to perform this action.';
  }

  if (error.response?.status === 404) {
    return 'The requested resource was not found.';
  }

  if (error.response?.status >= 500) {
    return 'A server error occurred. Please try again later.';
  }

  return 'An unexpected error occurred. Please try again.';
};

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

// User Dashboard Data
export const getUserDashboardStats = async () => {
  try {
    const response = await api.get('/users/dashboard-stats');
    return response.data;
  } catch (error) {
    console.error('Error fetching user dashboard stats:', error);
    throw error;
  }
};

export const getUserNotifications = async () => {
  try {
    const response = await api.get('/users/notifications');
    return response.data;
  } catch (error) {
    console.error('Error fetching user notifications:', error);
    throw error;
  }
};

export const getUserActivities = async (params = {}) => {
  try {
    const response = await api.get('/activities', { params });
    return response.data;
  } catch (error) {
    console.error('Error fetching user activities:', error);
    throw error;
  }
};

export const getUserRoadmaps = async () => {
  try {
    const response = await api.get('/roadmaps/user');
    return response.data;
  } catch (error) {
    console.error('Error fetching user roadmaps:', error);
    throw error;
  }
};

export const getUserProgress = async (roadmapId) => {
  try {
    const response = await api.get(`/progress/${roadmapId}`);
    return response.data;
  } catch (error) {
    console.error('Error fetching user progress:', error);
    throw error;
  }
};

// Progress API calls
export const updateStepProgress = async (roadmapId, stepId, progressData) => {
  try {
    const response = await api.put(`/progress/${roadmapId}/step/${stepId}`, progressData);
    return response.data;
  } catch (error) {
    console.error('Error updating step progress:', error);
    throw error;
  }
};

export const resetProgress = async (roadmapId) => {
  try {
    const response = await api.put(`/progress/${roadmapId}/reset`);
    return response.data;
  } catch (error) {
    console.error('Error resetting progress:', error);
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
    // Log the goal creation attempt
    console.log('Attempting to create goal:', {
      name: goalData.name,
      category: goalData.category,
      difficulty: goalData.difficulty,
      timestamp: new Date().toISOString()
    });

    const response = await api.post('/goals', goalData);
    console.log('Goal created successfully:', response.data);
    return response.data;
  } catch (error) {
    // Enhanced error logging
    const errorDetails = {
      message: error.message,
      status: error.response?.status,
      statusText: error.response?.statusText,
      data: error.response?.data,
      timestamp: new Date().toISOString()
    };

    console.error('Error creating goal:', errorDetails);

    // Provide more specific error messages based on error type
    if (error.response?.data?.validationDetails) {
      console.error('Validation error details:', error.response.data.validationDetails);
    }

    throw {
      ...error,
      friendlyMessage: getErrorMessage(error),
      errorDetails
    };
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

export const generateRoadmapPreview = async (goalId, skillLevel) => {
  try {
    const response = await api.post('/roadmaps/generate-preview', {
      goalId,
      skillLevel
    });
    return response.data;
  } catch (error) {
    console.error('Error generating roadmap preview:', error);
    throw error;
  }
};

export const saveGeneratedRoadmap = async (roadmapData) => {
  try {
    const response = await api.post('/roadmaps/save', roadmapData);
    return response.data;
  } catch (error) {
    console.error('Error saving roadmap:', error);
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

// Analytics API calls
export const getAnalyticsDashboard = async (timeRange = '30d') => {
  try {
    const response = await api.get('/analytics/dashboard', {
      params: { timeRange }
    });
    return response.data;
  } catch (error) {
    console.error('Error fetching analytics dashboard:', error);
    throw error;
  }
};

export const getAdminStats = async () => {
  try {
    const response = await api.get('/analytics/admin-stats');
    return response.data;
  } catch (error) {
    console.error('Error fetching admin stats:', error);
    throw error;
  }
};

// AI Roadmap Generation API calls
export const enhanceUserGoal = async (goalText) => {
  try {
    const response = await api.post('/ai/enhance-goal', { goalText });
    return response.data;
  } catch (error) {
    console.error('Error enhancing goal:', error);
    throw error;
  }
};

export const createUserGoal = async (goalData) => {
  try {
    const response = await api.post('/ai/create-user-goal', goalData);
    return response.data;
  } catch (error) {
    console.error('Error creating user goal:', error);
    throw error;
  }
};

export const generateAIRoadmap = async (goalId, userContext = {}) => {
  try {
    const response = await api.post('/ai/generate-roadmap', { goalId, userContext });
    return response.data;
  } catch (error) {
    console.error('Error generating AI roadmap:', error);
    throw error;
  }
};

export const saveAIRoadmap = async (goalId, roadmapData, aiService = 'gemini', aiModel = 'unknown') => {
  try {
    const payload = { goalId, roadmapData, aiService, aiModel };
    const response = await api.post('/ai/save-roadmap', payload);
    return response.data;
  } catch (error) {
    console.error('Error saving AI roadmap:', error);
    throw error;
  }
};

export const getUserAIStats = async () => {
  try {
    const response = await api.get('/ai/user-stats');
    return response.data;
  } catch (error) {
    console.error('Error fetching user AI stats:', error);
    throw error;
  }
};

// Admin AI Management API calls
export const getAllAIRoadmaps = async (params = {}) => {
  try {
    const response = await api.get('/ai/admin/roadmaps', { params });
    return response.data;
  } catch (error) {
    console.error('Error fetching AI roadmaps:', error);
    throw error;
  }
};

export const getAllUserGoals = async (params = {}) => {
  try {
    const response = await api.get('/ai/admin/user-goals', { params });
    return response.data;
  } catch (error) {
    console.error('Error fetching user goals:', error);
    throw error;
  }
};

export const moderateRoadmap = async (roadmapId, moderationData) => {
  try {
    const response = await api.put(`/ai/admin/moderate-roadmap/${roadmapId}`, moderationData);
    return response.data;
  } catch (error) {
    console.error('Error moderating roadmap:', error);
    throw error;
  }
};

export const moderateGoalItem = async (goalId, moderationData) => {
  try {
    const response = await api.put(`/ai/admin/moderate-goal/${goalId}`, moderationData);
    return response.data;
  } catch (error) {
    console.error('Error moderating goal:', error);
    throw error;
  }
};

// Resume Analyzer API
export const analyzeResume = async (file, requirementsText = '', requirements = []) => {
  try {
    const formData = new FormData();
    formData.append('resume', file);
    if (requirementsText) formData.append('requirementsText', requirementsText);
    if (Array.isArray(requirements) && requirements.length) {
      formData.append('requirements', JSON.stringify(requirements));
    }
    const response = await api.post('/resumes/analyze', formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    });
    return response.data;
  } catch (error) {
    console.error('Error analyzing resume:', error);
    throw error;
  }
};

// Generate AI roadmap from parsed resume and selected target position
export const generateResumeRoadmap = async (payload) => {
  try {
    const response = await api.post('/resumes/roadmap', payload);
    return response.data;
  } catch (error) {
    console.error('Error generating resume-based roadmap:', error);
    throw error;
  }
};

// Course Suggestion API calls
export const getCourseSuggestions = async (suggestionData) => {
  try {
    const response = await api.post('/ai/course-suggestions', suggestionData);
    return response.data;
  } catch (error) {
    console.error('Error getting course suggestions:', error);
    throw error;
  }
};

export const recordCourseFeedback = async (feedbackData) => {
  try {
    const response = await api.post('/ai/course-feedback', feedbackData);
    return response.data;
  } catch (error) {
    console.error('Error recording course feedback:', error);
    throw error;
  }
};

export default api;