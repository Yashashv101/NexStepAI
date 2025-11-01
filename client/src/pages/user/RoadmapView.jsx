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
  BookOpen
} from 'lucide-react';

const RoadmapView = () => {
  const [roadmaps, setRoadmaps] = useState([]);
  const [selectedRoadmap, setSelectedRoadmap] = useState(null);
  const [loading, setLoading] = useState(true);
  const [userProgress, setUserProgress] = useState({});

  useEffect(() => {
    fetchUserRoadmaps();
  }, []);

  const fetchUserRoadmaps = async () => {
    try {
      // TODO: Replace with actual API call to get user's roadmaps
      const mockRoadmaps = [
        {
          id: 1,
          title: 'React Developer Roadmap',
          description: 'Complete guide to becoming a React developer',
          goalName: 'Full Stack Developer',
          difficulty: 'intermediate',
          estimatedDuration: '4-6 months',
          steps: [
            { id: 1, title: 'Learn JavaScript fundamentals', completed: true, timeSpent: 20 },
            { id: 2, title: 'Understand React basics', completed: true, timeSpent: 15 },
            { id: 3, title: 'Master React hooks', completed: false, timeSpent: 8 },
            { id: 4, title: 'Learn state management (Redux/Context)', completed: false, timeSpent: 0 },
            { id: 5, title: 'Build real-world projects', completed: false, timeSpent: 0 }
          ],
          startedAt: '2024-01-10',
          status: 'in_progress'
        },
        {
          id: 2,
          title: 'Mobile App Development',
          description: 'Learn to build mobile apps with React Native',
          goalName: 'Mobile App Developer',
          difficulty: 'intermediate',
          estimatedDuration: '6-8 months',
          steps: [
            { id: 1, title: 'JavaScript fundamentals', completed: true, timeSpent: 25 },
            { id: 2, title: 'React basics', completed: false, timeSpent: 5 },
            { id: 3, title: 'React Native setup', completed: false, timeSpent: 0 },
            { id: 4, title: 'Navigation and state management', completed: false, timeSpent: 0 },
            { id: 5, title: 'Publishing apps to stores', completed: false, timeSpent: 0 }
          ],
          startedAt: '2024-01-15',
          status: 'in_progress'
        }
      ];
      
      setRoadmaps(mockRoadmaps);
      if (mockRoadmaps.length > 0) {
        setSelectedRoadmap(mockRoadmaps[0]);
      }
      setLoading(false);
    } catch (error) {
      console.error('Error fetching roadmaps:', error);
      setLoading(false);
    }
  };

  const toggleStepCompletion = async (stepId) => {
    if (!selectedRoadmap) return;

    try {
      // TODO: Replace with actual API call to update step completion
      const updatedSteps = selectedRoadmap.steps.map(step =>
        step.id === stepId ? { ...step, completed: !step.completed } : step
      );

      const updatedRoadmap = { ...selectedRoadmap, steps: updatedSteps };
      setSelectedRoadmap(updatedRoadmap);

      // Update the roadmaps list
      setRoadmaps(roadmaps.map(roadmap =>
        roadmap.id === selectedRoadmap.id ? updatedRoadmap : roadmap
      ));
    } catch (error) {
      console.error('Error updating step completion:', error);
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
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Roadmaps List */}
          <div className="lg:col-span-1">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Your Roadmaps</h2>
            <div className="space-y-4">
              {roadmaps.map((roadmap) => (
                <div
                  key={roadmap.id}
                  onClick={() => setSelectedRoadmap(roadmap)}
                  className={`bg-white rounded-lg shadow-md p-4 cursor-pointer transition-all ${
                    selectedRoadmap?.id === roadmap.id 
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
                    {roadmap.goalName}
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
                      Started {new Date(roadmap.startedAt).toLocaleDateString()}
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
                        key={step.id}
                        className={`flex items-center p-4 rounded-lg border-2 transition-all ${
                          step.completed 
                            ? 'bg-green-50 border-green-200' 
                            : 'bg-gray-50 border-gray-200 hover:border-blue-300'
                        }`}
                      >
                        <button
                          onClick={() => toggleStepCompletion(step.id)}
                          className="mr-4 focus:outline-none"
                        >
                          {step.completed ? (
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
                    Started on {new Date(selectedRoadmap.startedAt).toLocaleDateString('en-US', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric'
                    })}
                  </div>
                  <div className="flex space-x-3">
                    <button className="flex items-center px-4 py-2 text-gray-600 bg-gray-100 rounded-lg hover:bg-gray-200">
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