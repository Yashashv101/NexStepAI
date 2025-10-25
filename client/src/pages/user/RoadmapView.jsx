import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { getRoadmaps } from '../../services/api';

function RoadmapView() {
  const { id } = useParams();
  const [roadmap, setRoadmap] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [completedSteps, setCompletedSteps] = useState(new Set());

  useEffect(() => {
    const fetchRoadmap = async () => {
      try {
        setLoading(true);
        const response = await getRoadmaps();
        
        if (response.success && response.data) {
          const selectedRoadmap = response.data.find(r => r._id === id);
          if (selectedRoadmap) {
            setRoadmap(selectedRoadmap);
          } else {
            setError('Roadmap not found');
          }
        } else {
          throw new Error('Failed to fetch roadmap');
        }
      } catch (err) {
        console.error('Failed to fetch roadmap:', err);
        setError('Failed to load roadmap. Please try again later.');
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      fetchRoadmap();
    }
  }, [id]);

  const toggleStepCompletion = (stepIndex) => {
    setCompletedSteps(prev => {
      const newSet = new Set(prev);
      if (newSet.has(stepIndex)) {
        newSet.delete(stepIndex);
      } else {
        newSet.add(stepIndex);
      }
      return newSet;
    });
  };

  const calculateProgress = () => {
    if (!roadmap || !roadmap.steps) return 0;
    return Math.round((completedSteps.size / roadmap.steps.length) * 100);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading roadmap...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-600 mb-4">{error}</p>
          <button
            onClick={() => window.history.back()}
            className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors"
          >
            Go Back
          </button>
        </div>
      </div>
    );
  }

  if (!roadmap) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-600 mb-4">Roadmap not found</p>
          <button
            onClick={() => window.history.back()}
            className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors"
          >
            Go Back
          </button>
        </div>
      </div>
    );
  }

  const progress = calculateProgress();

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white shadow rounded-lg">
          <div className="px-4 py-5 sm:p-6">
            <div className="mb-6">
              <h1 className="text-2xl font-bold text-gray-900 mb-2">
                Learning Roadmap
              </h1>
              <p className="text-gray-600">
                Goal: {roadmap.goalId || 'Career Development'}
              </p>
            </div>

            {/* Progress Bar */}
            <div className="mb-8">
              <div className="flex justify-between items-center mb-2">
                <span className="text-sm font-medium text-gray-700">Progress</span>
                <span className="text-sm font-medium text-gray-700">{progress}%</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div
                  className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                  style={{ width: `${progress}%` }}
                ></div>
              </div>
            </div>

            {/* Steps */}
            <div className="space-y-4">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Learning Steps</h2>
              {roadmap.steps && roadmap.steps.length > 0 ? (
                roadmap.steps.map((step, index) => (
                  <div
                    key={index}
                    className={`border rounded-lg p-4 transition-colors ${
                      completedSteps.has(index)
                        ? 'bg-green-50 border-green-200'
                        : 'bg-white border-gray-200'
                    }`}
                  >
                    <div className="flex items-start space-x-3">
                      <button
                        onClick={() => toggleStepCompletion(index)}
                        className={`mt-1 w-5 h-5 rounded-full border-2 flex items-center justify-center transition-colors ${
                          completedSteps.has(index)
                            ? 'bg-green-600 border-green-600'
                            : 'border-gray-300 hover:border-green-400'
                        }`}
                      >
                        {completedSteps.has(index) && (
                          <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                          </svg>
                        )}
                      </button>
                      <div className="flex-1">
                        <h3 className={`font-medium ${
                          completedSteps.has(index) ? 'text-green-800 line-through' : 'text-gray-900'
                        }`}>
                          {step.title || `Step ${index + 1}`}
                        </h3>
                        {step.description && (
                          <p className="text-gray-600 mt-1">{step.description}</p>
                        )}
                        {step.duration && (
                          <p className="text-sm text-gray-500 mt-2">
                            Estimated time: {step.duration}
                          </p>
                        )}
                        {step.resources && step.resources.length > 0 && (
                          <div className="mt-3">
                            <p className="text-sm font-medium text-gray-700 mb-2">Resources:</p>
                            <ul className="space-y-1">
                              {step.resources.map((resource, resourceIndex) => (
                                <li key={resourceIndex} className="text-sm text-blue-600">
                                  <a href={resource.url} target="_blank" rel="noopener noreferrer" className="hover:underline">
                                    {resource.title || resource.url}
                                  </a>
                                </li>
                              ))}
                            </ul>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-gray-500 text-center py-8">No steps available for this roadmap.</p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default RoadmapView;