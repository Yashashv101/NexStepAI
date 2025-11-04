import React, { createContext, useContext, useReducer, useEffect } from 'react';
import { startUserRoadmap } from '../services/api';

// Initial state
const initialState = {
  // User Data
  user: null,

  // Goals & Roadmaps
  selectedGoal: null,
  selectedSkillLevel: null,
  activeRoadmaps: [],
  userProgress: {},

  // UI State
  roadmapModalOpen: false,
  loading: false,
  error: null,

  // Validation Messages
  skillValidationMessage: null,
  skillValidationType: null, // 'success' or 'warning'

  // Toast Notifications
  toasts: []
};

// Action types
const actionTypes = {
  SET_USER: 'SET_USER',
  SET_LOADING: 'SET_LOADING',
  SET_ERROR: 'SET_ERROR',
  CLEAR_ERROR: 'CLEAR_ERROR',

  // Goal Selection
  SELECT_GOAL: 'SELECT_GOAL',
  CLEAR_SELECTED_GOAL: 'CLEAR_SELECTED_GOAL',

  // Skill Level
  SELECT_SKILL_LEVEL: 'SELECT_SKILL_LEVEL',
  SET_SKILL_VALIDATION: 'SET_SKILL_VALIDATION',
  CLEAR_SKILL_VALIDATION: 'CLEAR_SKILL_VALIDATION',

  // Roadmap Modal
  OPEN_ROADMAP_MODAL: 'OPEN_ROADMAP_MODAL',
  CLOSE_ROADMAP_MODAL: 'CLOSE_ROADMAP_MODAL',

  // User Progress
  SET_ACTIVE_ROADMAPS: 'SET_ACTIVE_ROADMAPS',
  UPDATE_USER_PROGRESS: 'UPDATE_USER_PROGRESS',
  START_ROADMAP_SUCCESS: 'START_ROADMAP_SUCCESS',
  ADD_TOAST: 'ADD_TOAST',
  REMOVE_TOAST: 'REMOVE_TOAST'
};

// Reducer function
const appReducer = (state, action) => {
  switch (action.type) {
    case actionTypes.SET_USER:
      return {
        ...state,
        user: action.payload
      };

    case actionTypes.SET_LOADING:
      return {
        ...state,
        loading: action.payload
      };

    case actionTypes.SET_ERROR:
      return {
        ...state,
        error: action.payload,
        loading: false
      };

    case actionTypes.CLEAR_ERROR:
      return {
        ...state,
        error: null
      };

    case actionTypes.SELECT_GOAL:
      return {
        ...state,
        selectedGoal: action.payload,
        // Clear related state when selecting new goal
        selectedSkillLevel: null,
        skillValidationMessage: null,
        skillValidationType: null
      };

    case actionTypes.CLEAR_SELECTED_GOAL:
      return {
        ...state,
        selectedGoal: null,
        selectedSkillLevel: null,
        skillValidationMessage: null,
        skillValidationType: null
      };

    case actionTypes.SELECT_SKILL_LEVEL:
      return {
        ...state,
        selectedSkillLevel: action.payload
      };

    case actionTypes.SET_SKILL_VALIDATION:
      return {
        ...state,
        skillValidationMessage: action.payload.message,
        skillValidationType: action.payload.type
      };

    case actionTypes.CLEAR_SKILL_VALIDATION:
      return {
        ...state,
        skillValidationMessage: null,
        skillValidationType: null
      };

    case actionTypes.OPEN_ROADMAP_MODAL:
      return {
        ...state,
        roadmapModalOpen: true
      };

    case actionTypes.CLOSE_ROADMAP_MODAL:
      return {
        ...state,
        roadmapModalOpen: false
      };

    case actionTypes.SET_ACTIVE_ROADMAPS:
      return {
        ...state,
        activeRoadmaps: action.payload
      };

    case actionTypes.UPDATE_USER_PROGRESS:
      return {
        ...state,
        userProgress: {
          ...state.userProgress,
          [action.payload.roadmapId]: action.payload.progress
        }
      };

    case actionTypes.START_ROADMAP_SUCCESS:
      return {
        ...state,
        activeRoadmaps: [...state.activeRoadmaps, action.payload.roadmap],
        userProgress: {
          ...state.userProgress,
          [action.payload.roadmapId]: action.payload.progress
        },
        roadmapModalOpen: false
      };

    default:
      return state;
  }
};

// Create context
const AppContext = createContext();

// Provider component
export const AppProvider = ({ children }) => {
  const [state, dispatch] = useReducer(appReducer, initialState);

  // Load persisted state from localStorage on mount
  useEffect(() => {
    try {
      const savedGoal = localStorage.getItem('nexstep_selected_goal');
      const savedSkillLevel = localStorage.getItem('nexstep_selected_skill_level');
      const savedProgress = localStorage.getItem('nexstep_user_progress');

      if (savedGoal) {
        dispatch({ type: actionTypes.SELECT_GOAL, payload: JSON.parse(savedGoal) });
      }

      if (savedSkillLevel) {
        dispatch({ type: actionTypes.SELECT_SKILL_LEVEL, payload: savedSkillLevel });
      }

      if (savedProgress) {
        dispatch({
          type: actionTypes.UPDATE_USER_PROGRESS,
          payload: JSON.parse(savedProgress)
        });
      }
    } catch (error) {
      console.error('Error loading persisted state:', error);
    }
  }, []);

  // Save selected goal to localStorage when it changes
  useEffect(() => {
    if (state.selectedGoal) {
      localStorage.setItem('nexstep_selected_goal', JSON.stringify(state.selectedGoal));
    } else {
      localStorage.removeItem('nexstep_selected_goal');
    }
  }, [state.selectedGoal]);

  // Save selected skill level to localStorage when it changes
  useEffect(() => {
    if (state.selectedSkillLevel) {
      localStorage.setItem('nexstep_selected_skill_level', state.selectedSkillLevel);
    } else {
      localStorage.removeItem('nexstep_selected_skill_level');
    }
  }, [state.selectedSkillLevel]);

  // Action creators
  const actions = {
    setUser: (user) => {
      dispatch({ type: actionTypes.SET_USER, payload: user });
    },

    setLoading: (loading) => {
      dispatch({ type: actionTypes.SET_LOADING, payload: loading });
    },

    setError: (error) => {
      dispatch({ type: actionTypes.SET_ERROR, payload: error });
    },

    clearError: () => {
      dispatch({ type: actionTypes.CLEAR_ERROR });
    },

    selectGoal: (goal) => {
      dispatch({ type: actionTypes.SELECT_GOAL, payload: goal });
    },

    clearSelectedGoal: () => {
      dispatch({ type: actionTypes.CLEAR_SELECTED_GOAL });
    },

    selectSkillLevel: (skillLevel) => {
      dispatch({ type: actionTypes.SELECT_SKILL_LEVEL, payload: skillLevel });
    },

    setSkillValidation: (message, type) => {
      dispatch({
        type: actionTypes.SET_SKILL_VALIDATION,
        payload: { message, type }
      });
    },

    clearSkillValidation: () => {
      dispatch({ type: actionTypes.CLEAR_SKILL_VALIDATION });
    },

    openRoadmapModal: () => {
      dispatch({ type: actionTypes.OPEN_ROADMAP_MODAL });
    },

    closeRoadmapModal: () => {
      dispatch({ type: actionTypes.CLOSE_ROADMAP_MODAL });
    },

    setActiveRoadmaps: (roadmaps) => {
      dispatch({ type: actionTypes.SET_ACTIVE_ROADMAPS, payload: roadmaps });
    },

    updateUserProgress: (roadmapId, progress) => {
      dispatch({
        type: actionTypes.UPDATE_USER_PROGRESS,
        payload: { roadmapId, progress }
      });

      // Save to localStorage
      try {
        localStorage.setItem('nexstep_user_progress', JSON.stringify({
          roadmapId,
          progress
        }));
      } catch (error) {
        console.error('Error saving progress to localStorage:', error);
      }
    },

    startRoadmap: async (goalId, skillLevel) => {
      try {
        dispatch({ type: actionTypes.SET_LOADING, payload: true });
        dispatch({ type: actionTypes.CLEAR_ERROR });

        const response = await startUserRoadmap(goalId, skillLevel);

        if (response.success) {
          dispatch({
            type: actionTypes.START_ROADMAP_SUCCESS,
            payload: {
              roadmap: response.data,
              progress: response.data.userProgress
            }
          });

          // Clear selected goal and skill level after starting roadmap
          dispatch({ type: actionTypes.CLEAR_SELECTED_GOAL });

          return response;
        } else {
          throw new Error(response.message || 'Failed to start roadmap');
        }
      } catch (error) {
        const errorMessage = error.response?.data?.message || error.message || 'Failed to start roadmap';
        dispatch({ type: actionTypes.SET_ERROR, payload: errorMessage });
        throw error;
      } finally {
        dispatch({ type: actionTypes.SET_LOADING, payload: false });
      }
    }
  };

  const value = {
    ...state,
    ...actions
  };

  return (
    <AppContext.Provider value={value}>
      {children}
    </AppContext.Provider>
  );
};

// Custom hook to use the context
export const useAppContext = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useAppContext must be used within an AppProvider');
  }
  return context;
};

export default AppContext;