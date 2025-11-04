import React, { useState, useEffect } from 'react';
import { X, Clock, CheckCircle, Circle, Play } from 'lucide-react';
import { useAppContext } from '../context/AppContext';

const RoadmapModal = () => {
  const {
    roadmapModalOpen,
    closeRoadmapModal,
    selectedGoal,
    selectedSkillLevel,
    startRoadmap,
    loading,
    error,
    clearError
  } = useAppContext();

  const [roadmapData, setRoadmapData] = useState(null);
  const [fetchLoading, setFetchLoading] = useState(false);

  // Mock roadmap data - in a real app, this would be fetched from the API
  useEffect(() => {
    if (roadmapModalOpen && selectedGoal) {
      setFetchLoading(true);

      // Simulate API call to generate roadmap
      setTimeout(() => {
        const mockRoadmap = {
          title: `${selectedGoal.title} Learning Path`,
          description: `Personalized roadmap for ${selectedGoal.title} at ${selectedSkillLevel} level`,
          estimatedDuration: selectedGoal.estimatedTime,
          steps: [
            {
              id: '1',
              title: 'Getting Started',
              description: 'Introduction to fundamental concepts and setup',
              duration: '2 weeks',
              order: 1
            },
            {
              id: '2',
              title: 'Core Skills Development',
              description: 'Build essential skills and practical knowledge',
              duration: '4 weeks',
              order: 2
            },
            {
              id: '3',
              title: 'Advanced Topics',
              description: 'Explore advanced concepts and best practices',
              duration: '3 weeks',
              order: 3
            },
            {
              id: '4',
              title: 'Practical Application',
              description: 'Apply your knowledge through hands-on projects',
              duration: '2 weeks',
              order: 4
            }
          ]
        };

        setRoadmapData(mockRoadmap);
        setFetchLoading(false);
      }, 1000);
    }
  }, [roadmapModalOpen, selectedGoal, selectedSkillLevel]);

  const handleStartLearning = async () => {
    if (!selectedGoal || !selectedSkillLevel) return;

    try {
      await startRoadmap(selectedGoal.id, selectedSkillLevel);
      // Modal will be closed automatically by the context action
    } catch (error) {
      console.error('Failed to start roadmap:', error);
    }
  };

  const handleClose = () => {
    clearError();
    closeRoadmapModal();
    setRoadmapData(null);
  };

  const handleBackdropClick = (e) => {
    if (e.target === e.currentTarget) {
      handleClose();
    }
  };

  if (!roadmapModalOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 p-4"
      onClick={handleBackdropClick}
    >
      <div className="bg-white rounded-xl max-w-4xl w-full max-h-[90vh] overflow-hidden shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Your Learning Roadmap</h2>
            {selectedGoal && (
              <p className="text-gray-600 mt-1">
                {selectedGoal.title} • <span className="capitalize">{selectedSkillLevel}</span> Level
              </p>
            )}
          </div>
          <button
            onClick={handleClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            aria-label="Close modal"
          >
            <X className="h-5 w-5 text-gray-500" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto max-h-[60vh]">
          {fetchLoading ? (
            <div className="flex flex-col items-center justify-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-600"></div>
              <p className="mt-4 text-gray-600">Generating your personalized roadmap...</p>
            </div>
          ) : roadmapData ? (
            <div>
              {/* Roadmap Overview */}
              <div className="mb-6 p-4 bg-indigo-50 rounded-lg border border-indigo-200">
                <h3 className="font-semibold text-indigo-900 mb-2">{roadmapData.title}</h3>
                <p className="text-indigo-700 text-sm mb-3">{roadmapData.description}</p>
                <div className="flex items-center text-indigo-600 text-sm">
                  <Clock className="h-4 w-4 mr-1" />
                  Estimated Duration: {roadmapData.estimatedDuration}
                </div>
              </div>

              {/* Progress Bar */}
              <div className="mb-8">
                <div className="flex justify-between items-center mb-2">
                  <span className="text-sm font-medium text-gray-700">Your Progress</span>
                  <span className="text-sm font-medium text-gray-700">0%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div className="bg-blue-600 h-2 rounded-full" style={{ width: '0%' }}></div>
                </div>
              </div>

              {/* Roadmap Steps */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Learning Steps</h3>
                {roadmapData.steps.map((step, index) => (
                  <div
                    key={step.id}
                    className="flex items-start p-4 border border-gray-200 rounded-lg hover:border-indigo-300 transition-colors"
                  >
                    <div className="flex items-center justify-center w-8 h-8 bg-gray-100 rounded-full mr-4 mt-1">
                      <span className="text-sm font-medium text-gray-600">{index + 1}</span>
                    </div>
                    <div className="flex-1">
                      <h4 className="font-semibold text-gray-900 mb-1">{step.title}</h4>
                      <p className="text-gray-600 text-sm mb-2">{step.description}</p>
                      <div className="flex items-center text-gray-500 text-xs">
                        <Clock className="h-3 w-3 mr-1" />
                        {step.duration}
                      </div>
                    </div>
                    <div className="ml-4">
                      <Circle className="h-5 w-5 text-gray-400" />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div className="text-center py-12">
              <p className="text-gray-500">Unable to load roadmap. Please try again.</p>
            </div>
          )}

          {/* Error Message */}
          {error && (
            <div className="mt-4 p-4 bg-red-100 border border-red-300 text-red-800 rounded-lg">
              <p className="font-medium">Error</p>
              <p className="text-sm">{error}</p>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-6 border-t border-gray-200 bg-gray-50">
          <div className="flex justify-between items-center">
            <button
              onClick={handleClose}
              className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-100 transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handleStartLearning}
              disabled={!roadmapData || loading}
              className="px-8 py-3 bg-indigo-600 text-white font-medium rounded-lg hover:bg-indigo-700 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed flex items-center"
            >
              {loading ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-t-2 border-b-2 border-white mr-2"></div>
                  Starting...
                </>
              ) : (
                <>
                  <Play className="h-4 w-4 mr-2" />
                  Start Learning
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RoadmapModal;