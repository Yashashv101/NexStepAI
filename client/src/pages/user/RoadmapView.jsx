import React, { useState, useEffect } from 'react';
import { 
  Map, 
  Target, 
  Clock, 
  CheckCircle, 
  Circle, 
  Play,
  Pause,
  RotateCcw,
  Calendar,
  TrendingUp,
  BookOpen,
  AlertCircle
} from 'lucide-react';
import { getUserRoadmaps, getUserProgress, updateStepProgress, resetProgress } from '../../services/api';
import cacheService from '../../services/cacheService';

const RoadmapView = () => {
  const [roadmaps, setRoadmaps] = useState([]);
  const [selectedRoadmap, setSelectedRoadmap] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [userProgress, setUserProgress] = useState({});
  const [updatingStep, setUpdatingStep] = useState(null);

  useEffect(() => {
    fetchUserRoadmaps();
  }, []);

  const fetchUserRoadmaps = async () => {
    try {
      setLoading(true);
      setError(null);

      // Try to get cached data first
      const cacheKey = 'user-roadmaps';
      const cachedData = cacheService.get(cacheKey);
      
      if (cachedData) {
        setRoadmaps(cachedData);
        if (cachedData.length > 0) {
          setSelectedRoadmap(cachedData[0]);
          await fetchProgressForRoadmap(cachedData[0]._id);
        }
        setLoading(false);
      }

      // Fetch fresh data
      const response = await getUserRoadmaps();
      if (response.success) {
        const roadmapsWithProgress = await Promise.all(
          response.data.map(async (roadmap) => {
            try {
              const progressResponse = await getUserProgress(roadmap._id);
              const progress = progressResponse.success ? progressResponse.data : null;
              
              return {
                ...roadmap,
                progress: progress,
                steps: roadmap.steps.map(step => {
                  const stepProgress = progress?.stepProgress?.find(sp => sp.stepId === step._id);
                  return {
                    ...step,
                    completed: stepProgress?.completed || false,
                    timeSpent: stepProgress?.timeSpent || 0,
                    notes: stepProgress?.notes || '',
                    completedAt: stepProgress?.completedAt
                  };
                })
              };
            } catch (err) {
              console.warn(`Failed to fetch progress for roadmap ${roadmap._id}:`, err);
              return roadmap;
            }
          })
        );

        setRoadmaps(roadmapsWithProgress);
        cacheService.set(cacheKey, roadmapsWithProgress, 5 * 60 * 1000); // 5 minutes

        if (roadmapsWithProgress.length > 0 && !selectedRoadmap) {
          setSelectedRoadmap(roadmapsWithProgress[0]);
        }
      } else {
        throw new Error(response.message || 'Failed to fetch roadmaps');
      }
    } catch (error) {
      console.error('Error fetching roadmaps:', error);
      setError(error.message || 'Failed to load roadmaps');
      
      // If we have cached data, show it with error message
      const cacheKey = 'user-roadmaps';
      const cachedData = cacheService.get(cacheKey);
      if (cachedData && cachedData.length > 0) {
        setRoadmaps(cachedData);
        if (!selectedRoadmap) {
          setSelectedRoadmap(cachedData[0]);
        }
      }
    } finally {
      setLoading(false);
    }
  };

  const fetchProgressForRoadmap = async (roadmapId) => {
    try {
      const cacheKey = `user-progress-${roadmapId}`;
      const cachedProgress = cacheService.get(cacheKey);
      
      if (cachedProgress) {
        setUserProgress(prev => ({ ...prev, [roadmapId]: cachedProgress }));
      }

      const response = await getUserProgress(roadmapId);
      if (response.success) {
        setUserProgress(prev => ({ ...prev, [roadmapId]: response.data }));
        cacheService.set(cacheKey, response.data, 2 * 60 * 1000); // 2 minutes
      }
    } catch (error) {
      console.error('Error fetching progress:', error);
    }
  };

  const toggleStepCompletion = async (stepId) => {
    if (!selectedRoadmap) return;

    try {
      setUpdatingStep(stepId);
      
      const step = selectedRoadmap.steps.find(s => s._id === stepId);
      if (!step) return;

      const newCompletedStatus = !step.completed;
      
      // Optimistically update UI
      const updatedSteps = selectedRoadmap.steps.map(step =>
        step._id === stepId ? { ...step, completed: newCompletedStatus } : step
      );

      const updatedRoadmap = { ...selectedRoadmap, steps: updatedSteps };
      setSelectedRoadmap(updatedRoadmap);

      // Update the roadmaps list
      setRoadmaps(roadmaps.map(roadmap =>
        roadmap._id === selectedRoadmap._id ? updatedRoadmap : roadmap
      ));

      // Make API call
      const response = await updateStepProgress(selectedRoadmap._id, stepId, {
        completed: newCompletedStatus,
        timeSpent: step.timeSpent || 0
      });

      if (response.success) {
        // Invalidate cache
        cacheService.delete('user-roadmaps');
        cacheService.delete(`user-progress-${selectedRoadmap._id}`);
        
        // Update progress data
        setUserProgress(prev => ({ ...prev, [selectedRoadmap._id]: response.data }));
      } else {
        throw new Error(response.message || 'Failed to update step');
      }
    } catch (error) {
      console.error('Error updating step completion:', error);
      
      // Revert optimistic update on error
      const revertedSteps = selectedRoadmap.steps.map(step =>
        step._id === stepId ? { ...step, completed: !step.completed } : step
      );

      const revertedRoadmap = { ...selectedRoadmap, steps: revertedSteps };
      setSelectedRoadmap(revertedRoadmap);

      setRoadmaps(roadmaps.map(roadmap =>
        roadmap._id === selectedRoadmap._id ? revertedRoadmap : roadmap
      ));
      
      setError('Failed to update step progress. Please try again.');
    } finally {
      setUpdatingStep(null);
    }
  };

  const handleResetProgress = async () => {
    if (!selectedRoadmap || !window.confirm('Are you sure you want to reset all progress for this roadmap? This action cannot be undone.')) {
      return;
    }

    try {
      setLoading(true);
      
      const response = await resetProgress(selectedRoadmap._id);
      if (response.success) {
        // Invalidate cache and refresh data
        cacheService.delete('user-roadmaps');
        cacheService.delete(`user-progress-${selectedRoadmap._id}`);
        
        await fetchUserRoadmaps();
      } else {
        throw new Error(response.message || 'Failed to reset progress');
      }
    } catch (error) {
      console.error('Error resetting progress:', error);
      setError('Failed to reset progress. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const getDifficultyColor = (difficulty) => {
    switch (difficulty) {
      case 'beginner': return 'bg-green-100 text-green-800';
      case 'intermediate': return 'bg-yellow-100 text-yellow-800';
      case 'advanced': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getProgressPercentage = (steps) => {
    const completedSteps = steps.filter(step => step.completed).length;
    return Math.round((completedSteps / steps.length) * 100);
  };

  const getTotalTimeSpent = (steps) => {
    return steps.reduce((total, step) => total + step.timeSpent, 0);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading roadmaps...</p>
        </div>
      </div>
    );
  }

  if (error && roadmaps.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <AlertCircle className="mx-auto h-12 w-12 text-red-400" />
          <h3 className="mt-2 text-sm font-medium text-gray-900">Error loading roadmaps</h3>
          <p className="mt-1 text-sm text-gray-500">{error}</p>
          <button 
            onClick={fetchUserRoadmaps}
            className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  if (roadmaps.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <Map className="mx-auto h-12 w-12 text-gray-400" />
          <h3 className="mt-2 text-sm font-medium text-gray-900">No roadmaps found</h3>
          <p className="mt-1 text-sm text-gray-500">
            Start your learning journey by selecting a goal and roadmap.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 flex items-center">
            <Map className="h-8 w-8 mr-3" />
            My Learning Roadmaps
          </h1>
          <p className="text-gray-600 mt-2">Track your progress and continue your learning journey</p>
          
          {/* Error Banner */}
          {error && (
            <div className="mt-4 bg-red-50 border border-red-200 rounded-lg p-4">
              <div className="flex items-center">
                <AlertCircle className="h-5 w-5 text-red-400 mr-2" />
                <p className="text-sm text-red-700">{error}</p>
                <button 
                  onClick={() => setError(null)}
                  className="ml-auto text-red-400 hover:text-red-600"
                >
                  ×
                </button>
              </div>
            </div>
          )}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Roadmaps List */}
          <div className="lg:col-span-1">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Your Roadmaps</h2>
            <div className="space-y-4">
              {roadmaps.map((roadmap) => (
                <div
                  key={roadmap._id}
                  onClick={() => setSelectedRoadmap(roadmap)}
                  className={`bg-white rounded-lg shadow-md p-4 cursor-pointer transition-all ${
                    selectedRoadmap?._id === roadmap._id 
                      ? 'ring-2 ring-blue-500 border-blue-500' 
                      : 'hover:shadow-lg'
                  }`}
                >
                  <div className="flex justify-between items-start mb-2">
                    <h3 className="font-semibold text-gray-900 text-sm">{roadmap.title}</h3>
                    <span className={`px-2 py-1 text-xs font-semibold rounded-full ${getDifficultyColor(roadmap.difficulty)}`}>
                      {roadmap.difficulty}
                    </span>
                  </div>
                  <div className="flex items-center text-xs text-gray-500 mb-2">
                    <Target className="h-3 w-3 mr-1" />
                    {roadmap.goalId?.name || 'No Goal'}
                  </div>
                  <div className="mb-2">
                    <div className="flex justify-between text-xs text-gray-600 mb-1">
                      <span>Progress</span>
                      <span>{getProgressPercentage(roadmap.steps)}%</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div
                        className="bg-blue-600 h-2 rounded-full transition-all"
                        style={{ width: `${getProgressPercentage(roadmap.steps)}%` }}
                      ></div>
                    </div>
                  </div>
                  <div className="flex justify-between text-xs text-gray-500">
                    <div className="flex items-center">
                      <Clock className="h-3 w-3 mr-1" />
                      {getTotalTimeSpent(roadmap.steps)}h spent
                    </div>
                    <div className="flex items-center">
                      <Calendar className="h-3 w-3 mr-1" />
                      Started {new Date(roadmap.createdAt).toLocaleDateString()}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Selected Roadmap Details */}
          <div className="lg:col-span-2">
            {selectedRoadmap && (
              <div className="bg-white rounded-lg shadow-md p-6">
                {/* Roadmap Header */}
                <div className="mb-6">
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <h2 className="text-2xl font-bold text-gray-900">{selectedRoadmap.title}</h2>
                      <p className="text-gray-600 mt-1">{selectedRoadmap.description}</p>
                    </div>
                    <span className={`px-3 py-1 text-sm font-semibold rounded-full ${getDifficultyColor(selectedRoadmap.difficulty)}`}>
                      {selectedRoadmap.difficulty}
                    </span>
                  </div>

                  {/* Progress Stats */}
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
                    <div className="bg-blue-50 rounded-lg p-4">
                      <div className="flex items-center">
                        <TrendingUp className="h-5 w-5 text-blue-600 mr-2" />
                        <div>
                          <p className="text-2xl font-bold text-blue-600">
                            {getProgressPercentage(selectedRoadmap.steps)}%
                          </p>
                          <p className="text-sm text-gray-600">Complete</p>
                        </div>
                      </div>
                    </div>
                    <div className="bg-green-50 rounded-lg p-4">
                      <div className="flex items-center">
                        <CheckCircle className="h-5 w-5 text-green-600 mr-2" />
                        <div>
                          <p className="text-2xl font-bold text-green-600">
                            {selectedRoadmap.steps.filter(s => s.completed).length}
                          </p>
                          <p className="text-sm text-gray-600">Steps Done</p>
                        </div>
                      </div>
                    </div>
                    <div className="bg-purple-50 rounded-lg p-4">
                      <div className="flex items-center">
                        <Clock className="h-5 w-5 text-purple-600 mr-2" />
                        <div>
                          <p className="text-2xl font-bold text-purple-600">
                            {getTotalTimeSpent(selectedRoadmap.steps)}h
                          </p>
                          <p className="text-sm text-gray-600">Time Spent</p>
                        </div>
                      </div>
                    </div>
                    <div className="bg-orange-50 rounded-lg p-4">
                      <div className="flex items-center">
                        <Target className="h-5 w-5 text-orange-600 mr-2" />
                        <div>
                          <p className="text-2xl font-bold text-orange-600">
                            {selectedRoadmap.steps.length}
                          </p>
                          <p className="text-sm text-gray-600">Total Steps</p>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Overall Progress Bar */}
                  <div className="mb-6">
                    <div className="flex justify-between text-sm text-gray-600 mb-2">
                      <span>Overall Progress</span>
                      <span>{getProgressPercentage(selectedRoadmap.steps)}% Complete</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-3">
                      <div
                        className="bg-gradient-to-r from-blue-500 to-purple-600 h-3 rounded-full transition-all"
                        style={{ width: `${getProgressPercentage(selectedRoadmap.steps)}%` }}
                      ></div>
                    </div>
                  </div>
                </div>

                {/* Learning Steps */}
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Learning Steps</h3>
                  <div className="space-y-3">
                    {selectedRoadmap.steps.map((step, index) => (
                      <div
                        key={step._id}
                        className={`flex items-center p-4 rounded-lg border-2 transition-all ${
                          step.completed 
                            ? 'bg-green-50 border-green-200' 
                            : 'bg-gray-50 border-gray-200 hover:border-blue-300'
                        }`}
                      >
                        <button
                          onClick={() => toggleStepCompletion(step._id)}
                          disabled={updatingStep === step._id}
                          className="mr-4 focus:outline-none disabled:opacity-50"
                        >
                          {updatingStep === step._id ? (
                            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
                          ) : step.completed ? (
                            <CheckCircle className="h-6 w-6 text-green-600" />
                          ) : (
                            <Circle className="h-6 w-6 text-gray-400 hover:text-blue-600" />
                          )}
                        </button>
                        
                        <div className="flex-1">
                          <div className="flex items-center justify-between">
                            <div>
                              <span className="text-sm font-medium text-gray-500 mr-2">
                                Step {index + 1}
                              </span>
                              <h4 className={`font-medium ${
                                step.completed ? 'text-green-800 line-through' : 'text-gray-900'
                              }`}>
                                {step.title}
                              </h4>
                              {step.description && (
                                <p className="text-sm text-gray-600 mt-1">{step.description}</p>
                              )}
                            </div>
                            <div className="flex items-center text-sm text-gray-500">
                              <Clock className="h-4 w-4 mr-1" />
                              {step.timeSpent}h
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="mt-6 flex justify-between items-center pt-6 border-t border-gray-200">
                  <div className="flex items-center text-sm text-gray-500">
                    <Calendar className="h-4 w-4 mr-1" />
                    Started on {new Date(selectedRoadmap.createdAt).toLocaleDateString('en-US', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric'
                    })}
                  </div>
                  <div className="flex space-x-3">
                    <button 
                      onClick={handleResetProgress}
                      disabled={loading}
                      className="flex items-center px-4 py-2 text-gray-600 bg-gray-100 rounded-lg hover:bg-gray-200 disabled:opacity-50"
                    >
                      <RotateCcw className="h-4 w-4 mr-2" />
                      Reset Progress
                    </button>
                    <button className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
                      <BookOpen className="h-4 w-4 mr-2" />
                      Continue Learning
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default RoadmapView;