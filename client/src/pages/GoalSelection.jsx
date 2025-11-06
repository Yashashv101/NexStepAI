import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getGoals, generateRoadmapPreview as generatePreviewAPI, saveGeneratedRoadmap } from '../services/api';
import { AlertCircle, CheckCircle, X } from 'lucide-react';

const GoalSelection = () => {
  const [selectedGoal, setSelectedGoal] = useState(null);
  const [selectedSkillLevel, setSelectedSkillLevel] = useState('');
  const [goals, setGoals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [validationMessage, setValidationMessage] = useState(null);
  const [showRoadmapModal, setShowRoadmapModal] = useState(false);
  const [generatingRoadmap, setGeneratingRoadmap] = useState(false);
  const [generatedRoadmap, setGeneratedRoadmap] = useState(null);
  const [savingRoadmap, setSavingRoadmap] = useState(false);
  const navigate = useNavigate();

  // Default icons to use when API goals don't have icons
  const defaultIcons = {
    'Web Developer': '🌐',
    'Data Scientist': '📊',
    'Mobile Developer': '📱',
    'DevOps Engineer': '⚙️',
    'ML Engineer': '🤖',
    'Cybersecurity Analyst': '🔒',
    'UI/UX Designer': '🎨',
    'Cloud Architect': '☁️',
    'default': '📚'
  };

  const skillLevels = [
    {
      id: 'beginner',
      title: 'Beginner',
      description: 'Little to no experience in this field',
      icon: '🌱'
    },
    {
      id: 'intermediate',
      title: 'Intermediate',
      description: 'Some experience but looking to advance',
      icon: '🌿'
    },
    {
      id: 'advanced',
      title: 'Advanced',
      description: 'Significant experience seeking to master',
      icon: '🌳'
    }
  ];

  useEffect(() => {
    fetchGoals();
  }, []);

  const fetchGoals = async () => {
    try {
      setLoading(true);
      const response = await getGoals();

      if (response.success && response.data) {
        // Transform API data to match the component's expected format
        const formattedGoals = response.data.map(goal => ({
          id: goal._id,
          title: goal.name,
          description: goal.description,
          icon: defaultIcons[goal.name] || defaultIcons.default,
          difficulty: goal.difficulty,
          estimatedTime: goal.estimatedTime,
          category: goal.category
        }));
        setGoals(formattedGoals);
      } else {
        setError('Failed to fetch goals');
      }
    } catch (err) {
      console.error('Error fetching goals:', err);
      setError('Failed to load career goals. Please try again later.');

      // Fallback to sample data if API fails
      setGoals([
        {
          id: 'sample-web-dev',
          title: 'Web Developer',
          icon: '🌐',
          description: 'Build websites and web applications',
          difficulty: 'beginner',
          estimatedTime: '6 months',
          category: 'Web Development'
        },
        {
          id: 'sample-data-science',
          title: 'Data Scientist',
          icon: '📊',
          description: 'Analyze and interpret complex data',
          difficulty: 'intermediate',
          estimatedTime: '8 months',
          category: 'Data Science'
        }
      ]);
    } finally {
      setLoading(false);
    }
  };

  const handleGoalSelect = (goal) => {
    setSelectedGoal(goal);
    setSelectedSkillLevel('');
    setValidationMessage(null);
  };

  const handleSkillLevelSelect = (level) => {
    setSelectedSkillLevel(level);

    // Validate skill level against goal requirement
    if (selectedGoal) {
      const skillLevelRanking = {
        'beginner': 1,
        'intermediate': 2,
        'advanced': 3
      };

      const userLevel = skillLevelRanking[level];
      const goalRequiredLevel = skillLevelRanking[selectedGoal.difficulty];

      if (userLevel >= goalRequiredLevel) {
        setValidationMessage({
          type: 'success',
          text: 'Your skill level meets the requirements for this goal'
        });
      } else {
        setValidationMessage({
          type: 'warning',
          text: 'Your current skill level is below the recommended level for this goal. Proceeding may require additional effort.'
        });
      }
    }
  };

  const generateRoadmapPreview = async () => {
    if (!selectedGoal || !selectedSkillLevel) return;

    try {
      setGeneratingRoadmap(true);
      setError(null);

      const response = await generatePreviewAPI(selectedGoal.id, selectedSkillLevel);

      if (response.success) {
        setGeneratedRoadmap(response.data);
        setShowRoadmapModal(true);
      } else {
        setError(response.message || 'Failed to generate roadmap');
      }
    } catch (err) {
      console.error('Error generating roadmap:', err);
      setError('Failed to generate roadmap. Please try again.');
    } finally {
      setGeneratingRoadmap(false);
    }
  };


  const handleStartLearning = async () => {
    if (!generatedRoadmap || !selectedGoal) return;

    try {
      setSavingRoadmap(true);
      setError(null);

      const response = await saveGeneratedRoadmap({
        goalId: selectedGoal.id,
        skillLevel: selectedSkillLevel,
        title: generatedRoadmap.title,
        description: generatedRoadmap.description,
        difficulty: generatedRoadmap.difficulty,
        estimatedDuration: generatedRoadmap.estimatedDuration,
        category: generatedRoadmap.category,
        steps: generatedRoadmap.steps
      });

      if (response.success) {
        // Navigate to dashboard
        navigate('/dashboard');
      } else {
        setError(response.message || 'Failed to save roadmap');
      }
    } catch (err) {
      console.error('Error saving roadmap:', err);
      setError(err.response?.data?.message || 'Failed to save roadmap. Please try again.');
    } finally {
      setSavingRoadmap(false);
    }
  };

  const RoadmapModal = () => {
    if (!showRoadmapModal || !generatedRoadmap) return null;

    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-hidden">
          {/* Modal Header */}
          <div className="bg-indigo-600 text-white p-6 flex justify-between items-center">
            <div>
              <h2 className="text-2xl font-bold">{generatedRoadmap.title}</h2>
              <p className="text-indigo-100 mt-1">{generatedRoadmap.description}</p>
            </div>
            <button
              onClick={() => setShowRoadmapModal(false)}
              className="text-white hover:text-indigo-200 transition-colors"
            >
              <X className="h-6 w-6" />
            </button>
          </div>

          {/* Modal Body */}
          <div className="p-6 overflow-y-auto max-h-[calc(90vh-200px)]">
            {/* Roadmap Info */}
            <div className="flex gap-4 mb-6">
              <div className="bg-indigo-50 rounded-lg p-4 flex-1">
                <p className="text-sm text-indigo-600 font-medium">Difficulty</p>
                <p className="text-lg font-bold text-indigo-900 capitalize">{generatedRoadmap.difficulty}</p>
              </div>
              <div className="bg-green-50 rounded-lg p-4 flex-1">
                <p className="text-sm text-green-600 font-medium">Duration</p>
                <p className="text-lg font-bold text-green-900">{generatedRoadmap.estimatedDuration}</p>
              </div>
              <div className="bg-purple-50 rounded-lg p-4 flex-1">
                <p className="text-sm text-purple-600 font-medium">Total Steps</p>
                <p className="text-lg font-bold text-purple-900">{generatedRoadmap.steps.length}</p>
              </div>
            </div>

            {/* Progress Bar */}
            <div className="mb-6">
              <div className="flex justify-between text-sm text-gray-600 mb-2">
                <span>Your Progress</span>
                <span>0% Complete</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-3">
                <div
                  className="bg-gradient-to-r from-indigo-500 to-purple-600 h-3 rounded-full transition-all"
                  style={{ width: '0%' }}
                ></div>
              </div>
            </div>

            {/* Roadmap Steps */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Learning Steps</h3>
              {generatedRoadmap.steps.map((step, index) => (
                <div
                  key={index}
                  className="border-2 border-gray-200 rounded-lg p-4 hover:border-indigo-300 transition-all"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <span className="bg-indigo-100 text-indigo-700 text-sm font-medium px-2 py-1 rounded">
                          Step {index + 1}
                        </span>
                        <h4 className="font-semibold text-gray-900">{step.title}</h4>
                      </div>
                      <p className="text-gray-600 text-sm mb-3">{step.description}</p>
                      <div className="flex flex-wrap gap-2">
                        {step.skills.map((skill, skillIndex) => (
                          <span
                            key={skillIndex}
                            className="bg-gray-100 text-gray-700 text-xs px-2 py-1 rounded"
                          >
                            {skill}
                          </span>
                        ))}
                      </div>
                    </div>
                    <div className="ml-4">
                      <span className="text-sm text-gray-500 whitespace-nowrap">
                        {step.duration}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Modal Footer */}
          <div className="border-t border-gray-200 p-6 flex justify-between items-center bg-gray-50">
            <button
              onClick={() => setShowRoadmapModal(false)}
              className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-100 transition-colors"
              disabled={savingRoadmap}
            >
              Cancel
            </button>
            <button
              onClick={handleStartLearning}
              disabled={savingRoadmap}
              className="px-8 py-3 bg-indigo-600 text-white text-lg font-medium rounded-lg shadow-md hover:bg-indigo-700 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed flex items-center"
            >
              {savingRoadmap ? (
                <>
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                  Saving...
                </>
              ) : (
                'Start Learning'
              )}
            </button>
          </div>
        </div>
      </div>
    );
  };

  if (loading) {
    return (
      <div className="max-w-6xl mx-auto px-4 py-8 flex justify-center items-center min-h-[60vh]">
        <div className="text-center">
          <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-indigo-600 border-r-transparent"></div>
          <p className="mt-4 text-gray-600">Loading career goals...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      <div className="text-center mb-10">
        <h1 className="text-4xl font-bold text-indigo-700 mb-3">Choose Your Career Path</h1>
        <p className="text-gray-600 text-lg">Select a career goal and your skill level to get started</p>
      </div>

      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-6 flex items-center">
          <AlertCircle className="h-5 w-5 mr-2" />
          <p>{error}</p>
        </div>
      )}

      {/* Step 1: Goal Selection */}
      <div className="mb-10">
        <h2 className="text-2xl font-semibold text-gray-800 mb-4">
          Step 1: Select Your Career Goal
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {goals.length > 0 ? (
            goals.map((goal) => (
              <div
                key={goal.id}
                className={`p-6 border-2 rounded-xl cursor-pointer transition-all shadow-sm hover:shadow-md ${selectedGoal?.id === goal.id ? 'border-indigo-500 bg-indigo-50 ring-2 ring-indigo-300' : 'border-gray-200 hover:border-indigo-300'
                  }`}
                onClick={() => handleGoalSelect(goal)}
              >
                <div className="flex flex-col items-center text-center">
                  <span className="text-4xl mb-3">{goal.icon}</span>
                  <h3 className="font-bold text-xl mb-2 text-gray-800">{goal.title}</h3>
                  <p className="text-gray-600 text-sm mb-3">{goal.description}</p>
                  <div className="flex gap-2 mt-2">
                    <span className="text-xs px-2 py-1 bg-gray-100 rounded">
                      {goal.difficulty}
                    </span>
                    <span className="text-xs px-2 py-1 bg-gray-100 rounded">
                      {goal.estimatedTime}
                    </span>
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div className="col-span-3 text-center py-8">
              <p className="text-gray-500">No career goals available. Please check back later.</p>
            </div>
          )}
        </div>
      </div>

      {/* Step 2: Skill Level Selection */}
      {selectedGoal && (
        <div className="mb-10 animate-fadeIn">
          <h2 className="text-2xl font-semibold text-gray-800 mb-4">
            Step 2: What's Your Current Skill Level?
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {skillLevels.map((level) => (
              <div
                key={level.id}
                className={`p-6 border-2 rounded-xl cursor-pointer transition-all shadow-sm hover:shadow-md ${selectedSkillLevel === level.id ? 'border-indigo-500 bg-indigo-50 ring-2 ring-indigo-300' : 'border-gray-200 hover:border-indigo-300'
                  }`}
                onClick={() => handleSkillLevelSelect(level.id)}
              >
                <div className="flex flex-col items-center text-center">
                  <span className="text-4xl mb-3">{level.icon}</span>
                  <h3 className="font-bold text-xl mb-2 text-gray-800">{level.title}</h3>
                  <p className="text-gray-600 text-sm">{level.description}</p>
                </div>
              </div>
            ))}
          </div>

          {/* Validation Message */}
          {validationMessage && (
            <div className={`mt-6 p-4 rounded-lg flex items-center ${validationMessage.type === 'success'
                ? 'bg-green-50 border border-green-200'
                : 'bg-amber-50 border border-amber-200'
              }`}>
              {validationMessage.type === 'success' ? (
                <CheckCircle className="h-5 w-5 text-green-600 mr-3" />
              ) : (
                <AlertCircle className="h-5 w-5 text-amber-600 mr-3" />
              )}
              <p className={`font-medium ${validationMessage.type === 'success' ? 'text-green-800' : 'text-amber-800'
                }`}>
                {validationMessage.text}
              </p>
            </div>
          )}
        </div>
      )}

      {/* Action Button */}
      {selectedGoal && selectedSkillLevel && (
        <div className="flex justify-center mt-8">
          <button
            onClick={generateRoadmapPreview}
            disabled={generatingRoadmap}
            className="px-8 py-3 bg-indigo-600 text-white text-lg font-medium rounded-lg shadow-md hover:bg-indigo-700 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed flex items-center"
          >
            {generatingRoadmap ? (
              <>
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                Generating Roadmap...
              </>
            ) : (
              'See Roadmap'
            )}
          </button>
        </div>
      )}

      {/* Roadmap Modal */}
      <RoadmapModal />
    </div>
  );
};

export default GoalSelection;
