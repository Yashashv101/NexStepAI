import React, { useState, useEffect } from 'react';
import { 
  Sparkles, 
  Target, 
  Loader, 
  CheckCircle, 
  AlertCircle,
  Clock,
  BookOpen,
  ArrowRight,
  Save,
  Lightbulb
} from 'lucide-react';
import { 
  enhanceUserGoal, 
  createUserGoal, 
  generateAIRoadmap, 
  saveAIRoadmap,
  getGoals,
  getUserAIStats
} from '../../services/api';
import { useNavigate } from 'react-router-dom';
import CourseSuggestions from '../../components/CourseSuggestions';

const AIRoadmapGenerator = () => {
  const navigate = useNavigate();
  
  // Step tracking
  const [currentStep, setCurrentStep] = useState(1); // 1: Input, 2: Goal Selection, 3: Generation, 4: Preview
  
  // User input
  const [goalText, setGoalText] = useState('');
  const [userContext, setUserContext] = useState({
    skillLevel: 'beginner',
    background: '',
    timeAvailability: ''
  });
  
  // Enhanced goal data
  const [enhancedGoal, setEnhancedGoal] = useState(null);
  const [selectedGoalId, setSelectedGoalId] = useState(null);
  const [existingGoals, setExistingGoals] = useState([]);
  
  // Generated roadmap
  const [generatedRoadmap, setGeneratedRoadmap] = useState(null);
  
  // UI states
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [aiStats, setAIStats] = useState(null);
  const [useExistingGoal, setUseExistingGoal] = useState(false);

  useEffect(() => {
    fetchExistingGoals();
    fetchAIStats();
  }, []);

  const fetchExistingGoals = async () => {
    try {
      const response = await getGoals();
      const goalsData = response.data || response.goals || [];
      setExistingGoals(goalsData);
    } catch (error) {
      console.error('Error fetching goals:', error);
    }
  };

  const fetchAIStats = async () => {
    try {
      const response = await getUserAIStats();
      setAIStats(response.data);
    } catch (error) {
      console.error('Error fetching AI stats:', error);
    }
  };

  const handleEnhanceGoal = async () => {
    if (!goalText.trim() || goalText.length < 10) {
      setError('Please provide a meaningful goal description (at least 10 characters)');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const response = await enhanceUserGoal(goalText);
      setEnhancedGoal(response.data);
      setCurrentStep(2);
      setSuccess('Goal enhanced successfully! Review and proceed to generate your roadmap.');
    } catch (error) {
      setError(error.response?.data?.message || 'Failed to enhance goal. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateGoalAndGenerate = async () => {
    setLoading(true);
    setError('');

    try {
      // Create the user goal
      const goalData = {
        name: enhancedGoal.suggestedName,
        description: enhancedGoal.description,
        category: enhancedGoal.category,
        difficulty: enhancedGoal.difficulty,
        estimatedTime: enhancedGoal.estimatedTime,
        tags: enhancedGoal.tags,
        skillsRequired: enhancedGoal.skillsRequired,
        skillsLearned: enhancedGoal.skillsLearned,
        originalGoalText: goalText,
        isAIEnhanced: true
      };

      const goalResponse = await createUserGoal(goalData);
      const createdGoal = goalResponse.data;
      
      // Generate roadmap for this goal
      await handleGenerateRoadmap(createdGoal._id);
    } catch (error) {
      setError(error.response?.data?.message || 'Failed to create goal. Please try again.');
      setLoading(false);
    }
  };

  const handleGenerateRoadmap = async (goalId) => {
    setLoading(true);
    setError('');
    setCurrentStep(3);

    try {
      const response = await generateAIRoadmap(goalId, userContext);
      // Preserve aiService and aiModel alongside roadmap data
      setGeneratedRoadmap({
        ...response.data,
        aiService: response.data?.aiService,
        aiModel: response.data?.aiModel
      });
      setSelectedGoalId(goalId);
      setCurrentStep(4);
      setSuccess('Roadmap generated successfully! Review and save it to your profile.');
      await fetchAIStats(); // Refresh stats
    } catch (error) {
      const errorMsg = error.response?.data?.message || 'Failed to generate roadmap. Please try again.';
      setError(errorMsg);
      setCurrentStep(2); // Go back to goal selection
    } finally {
      setLoading(false);
    }
  };

  const handleSaveRoadmap = async () => {
    if (!generatedRoadmap || !selectedGoalId) {
      setError('No roadmap to save');
      return;
    }

    setLoading(true);
    setError('');

    try {
      if (!generatedRoadmap.roadmap?.steps || generatedRoadmap.roadmap.steps.length < 4) {
        setError('Roadmap incomplete: please ensure at least 4 steps before saving.');
        setLoading(false);
        return;
      }
      const response = await saveAIRoadmap(
        selectedGoalId,
        generatedRoadmap.roadmap,
        generatedRoadmap.aiService || 'gemini',
        generatedRoadmap.aiModel || 'unknown',
        userContext.timeAvailability || ''
      );

      setSuccess('Roadmap saved successfully! Redirecting to your roadmaps...');
      setTimeout(() => {
        navigate('/user/roadmaps', { replace: true });
      }, 2000);
    } catch (error) {
      setError(error.response?.data?.message || 'Failed to save roadmap. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const renderStepIndicator = () => (
    <div className="flex items-center justify-center mb-8">
      {[
        { num: 1, label: 'Describe Goal' },
        { num: 2, label: 'Review & Select' },
        { num: 3, label: 'Generate' },
        { num: 4, label: 'Preview & Save' }
      ].map((step, index) => (
        <React.Fragment key={step.num}>
          <div className={`flex flex-col items-center ${currentStep >= step.num ? 'opacity-100' : 'opacity-40'}`}>
            <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
              currentStep >= step.num ? 'bg-blue-600 text-white' : 'bg-gray-300 text-gray-600'
            }`}>
              {currentStep > step.num ? <CheckCircle className="h-5 w-5" /> : step.num}
            </div>
            <span className="text-xs mt-1 text-gray-600">{step.label}</span>
          </div>
          {index < 3 && (
            <div className={`h-1 w-16 mx-2 ${currentStep > step.num ? 'bg-blue-600' : 'bg-gray-300'}`} />
          )}
        </React.Fragment>
      ))}
    </div>
  );

  const renderStep1 = () => (
    <div className="bg-white rounded-lg shadow-md p-8">
      <div className="flex items-center mb-6">
        <Sparkles className="h-8 w-8 text-blue-600 mr-3" />
        <div>
          <h2 className="text-2xl font-bold text-gray-900">AI-Powered Roadmap Generator</h2>
          <p className="text-gray-600">Describe your learning goal and let AI create a personalized roadmap</p>
        </div>
      </div>

      {aiStats && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
          <div className="flex items-center justify-between text-sm">
            <div>
              <span className="text-blue-800">Roadmaps Generated: </span>
              <span className="font-semibold text-blue-900">{aiStats.aiRoadmapsGenerated}</span>
            </div>
            <div>
              <span className="text-blue-800">Goals Submitted: </span>
              <span className="font-semibold text-blue-900">{aiStats.userGoalsSubmitted}</span>
            </div>
          </div>
        </div>
      )}

      <div className="space-y-6">
        {/* Toggle between new goal and existing goal */}
        <div className="flex space-x-4 mb-4">
          <button
            onClick={() => setUseExistingGoal(false)}
            className={`flex-1 py-2 px-4 rounded-lg ${
              !useExistingGoal ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-700'
            }`}
          >
            Create New Goal
          </button>
          <button
            onClick={() => setUseExistingGoal(true)}
            className={`flex-1 py-2 px-4 rounded-lg ${
              useExistingGoal ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-700'
            }`}
          >
            Use Existing Goal
          </button>
        </div>

        {!useExistingGoal ? (
          <>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                What do you want to learn or achieve? *
              </label>
              <textarea
                rows={4}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="e.g., I want to become a full-stack web developer and build modern web applications using React and Node.js"
                value={goalText}
                onChange={(e) => setGoalText(e.target.value)}
              />
              <p className="text-sm text-gray-500 mt-1">Be specific about your goals and interests</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Your Current Skill Level
                </label>
                <select
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  value={userContext.skillLevel}
                  onChange={(e) => setUserContext({...userContext, skillLevel: e.target.value})}
                >
                  <option value="beginner">Beginner</option>
                  <option value="intermediate">Intermediate</option>
                  <option value="advanced">Advanced</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Background (Optional)
                </label>
                <input
                  type="text"
                  placeholder="e.g., Computer Science student"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  value={userContext.background}
                  onChange={(e) => setUserContext({...userContext, background: e.target.value})}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Time Availability (Optional)
                </label>
                <input
                  type="text"
                  placeholder="e.g., 10 hours/week"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  value={userContext.timeAvailability}
                  onChange={(e) => setUserContext({...userContext, timeAvailability: e.target.value})}
                />
              </div>
            </div>

            <button
              onClick={handleEnhanceGoal}
              disabled={loading || !goalText.trim()}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-6 rounded-lg flex items-center justify-center disabled:bg-gray-400 disabled:cursor-not-allowed"
            >
              {loading ? (
                <>
                  <Loader className="h-5 w-5 mr-2 animate-spin" />
                  Analyzing your goal...
                </>
              ) : (
                <>
                  <Lightbulb className="h-5 w-5 mr-2" />
                  Enhance Goal with AI
                </>
              )}
            </button>
          </>
        ) : (
          <>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Select an Existing Goal
              </label>
              <select
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                value={selectedGoalId || ''}
                onChange={(e) => setSelectedGoalId(e.target.value)}
              >
                <option value="">Choose a goal...</option>
                {existingGoals.map((goal) => (
                  <option key={goal._id} value={goal._id}>
                    {goal.name} - {goal.category}
                  </option>
                ))}
              </select>
            </div>

            <button
              onClick={() => handleGenerateRoadmap(selectedGoalId)}
              disabled={loading || !selectedGoalId}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-6 rounded-lg flex items-center justify-center disabled:bg-gray-400 disabled:cursor-not-allowed"
            >
              {loading ? (
                <>
                  <Loader className="h-5 w-5 mr-2 animate-spin" />
                  Generating roadmap...
                </>
              ) : (
                <>
                  <Sparkles className="h-5 w-5 mr-2" />
                  Generate Roadmap
                </>
              )}
            </button>
          </>
        )}
      </div>
    </div>
  );

  const renderStep2 = () => (
    <div className="bg-white rounded-lg shadow-md p-8">
      <h2 className="text-2xl font-bold text-gray-900 mb-6">Review AI-Enhanced Goal</h2>
      
      {enhancedGoal && (
        <div className="space-y-6">
          <div className="bg-green-50 border border-green-200 rounded-lg p-4">
            <div className="flex items-center mb-2">
              <CheckCircle className="h-5 w-5 text-green-600 mr-2" />
              <h3 className="font-semibold text-green-900">AI has enhanced your goal!</h3>
            </div>
            <p className="text-green-700 text-sm">Review the details below and proceed to generate your roadmap.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="border border-gray-200 rounded-lg p-4">
              <label className="block text-sm font-medium text-gray-700 mb-1">Goal Name</label>
              <p className="text-lg font-semibold text-gray-900">{enhancedGoal.suggestedName}</p>
            </div>

            <div className="border border-gray-200 rounded-lg p-4">
              <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
              <p className="text-lg font-semibold text-gray-900">{enhancedGoal.category}</p>
            </div>

            <div className="border border-gray-200 rounded-lg p-4">
              <label className="block text-sm font-medium text-gray-700 mb-1">Difficulty</label>
              <span className={`px-3 py-1 text-sm font-semibold rounded-full ${
                enhancedGoal.difficulty === 'beginner' ? 'bg-green-100 text-green-800' :
                enhancedGoal.difficulty === 'intermediate' ? 'bg-yellow-100 text-yellow-800' :
                'bg-red-100 text-red-800'
              }`}>
                {enhancedGoal.difficulty}
              </span>
            </div>

            <div className="border border-gray-200 rounded-lg p-4">
              <label className="block text-sm font-medium text-gray-700 mb-1">Estimated Time</label>
              <p className="text-lg font-semibold text-gray-900">{enhancedGoal.estimatedTime}</p>
            </div>
          </div>

          <div className="border border-gray-200 rounded-lg p-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">Description</label>
            <p className="text-gray-900">{enhancedGoal.description}</p>
          </div>

          {enhancedGoal.tags && enhancedGoal.tags.length > 0 && (
            <div className="border border-gray-200 rounded-lg p-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">Tags</label>
              <div className="flex flex-wrap gap-2">
                {enhancedGoal.tags.map((tag, index) => (
                  <span key={index} className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm font-medium">
                    {tag}
                  </span>
                ))}
              </div>
            </div>
          )}

          <div className="flex space-x-4">
            <button
              onClick={() => setCurrentStep(1)}
              className="flex-1 bg-gray-200 hover:bg-gray-300 text-gray-700 font-semibold py-3 px-6 rounded-lg"
            >
              Back
            </button>
            <button
              onClick={handleCreateGoalAndGenerate}
              disabled={loading}
              className="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-6 rounded-lg flex items-center justify-center disabled:bg-gray-400"
            >
              {loading ? (
                <>
                  <Loader className="h-5 w-5 mr-2 animate-spin" />
                  Generating...
                </>
              ) : (
                <>
                  <Sparkles className="h-5 w-5 mr-2" />
                  Generate Roadmap
                </>
              )}
            </button>
          </div>
        </div>
      )}
    </div>
  );

  const renderStep3 = () => (
    <div className="bg-white rounded-lg shadow-md p-8">
      <div className="text-center py-12">
        <Loader className="h-16 w-16 text-blue-600 animate-spin mx-auto mb-4" />
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Generating Your Personalized Roadmap</h2>
        <p className="text-gray-600">Our AI is crafting a customized learning path just for you...</p>
        <div className="mt-8 max-w-md mx-auto">
          <div className="bg-blue-50 rounded-lg p-4 space-y-2 text-left">
            <div className="flex items-center text-sm text-gray-700">
              <CheckCircle className="h-4 w-4 text-green-600 mr-2" />
              Analyzing your goal and requirements
            </div>
            <div className="flex items-center text-sm text-gray-700">
              <Loader className="h-4 w-4 text-blue-600 mr-2 animate-spin" />
              Creating learning steps and milestones
            </div>
            <div className="flex items-center text-sm text-gray-400">
              <Clock className="h-4 w-4 mr-2" />
              Estimating durations and difficulty levels
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  const renderStep4 = () => (
    <div className="bg-white rounded-lg shadow-md p-8">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Your AI-Generated Roadmap</h2>
          <p className="text-gray-600">Review and save to your profile</p>
        </div>
        {generatedRoadmap && (
          <div className="text-sm text-gray-500">
            Generated by {generatedRoadmap.aiService || 'AI'}
          </div>
        )}
      </div>

      {generatedRoadmap && generatedRoadmap.roadmap && (
        <div className="space-y-6">
          <div className="bg-black border border-blue-200 rounded-lg p-6">
            <h3 className="text-xl font-bold text-gray-900 mb-3">{generatedRoadmap.roadmap.title}</h3>
            {/* Strong contrast container for description to avoid blending with gradient background */}
            <div className="bg-black rounded-md shadow-sm px-4 py-3 mb-4">
              <p className="text-gray-900 leading-relaxed">{generatedRoadmap.roadmap.description}</p>
            </div>
            
            <div className="grid grid-cols-2 gap-4 text-sm mt-1">
              <div className="flex items-center">
                <Clock className="h-4 w-4 mr-2 text-blue-600" />
                <span className="text-gray-800"><strong>Duration:</strong> {generatedRoadmap.roadmap.estimatedDuration}</span>
              </div>
              <div className="flex items-center">
                <Target className="h-4 w-4 mr-2 text-blue-600" />
                <span className="text-gray-800"><strong>Difficulty:</strong> {generatedRoadmap.roadmap.difficulty}</span>
              </div>
            </div>
          </div>

          <div>
            <h4 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
              <BookOpen className="h-5 w-5 mr-2 text-blue-600" />
              Learning Steps ({generatedRoadmap.roadmap.steps?.length || 0})
            </h4>
            
            <div className="space-y-4">
              {generatedRoadmap.roadmap.steps?.map((step, index) => (
                <div key={index} className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow bg-white">
                  <div className="flex items-start">
                    <div className="flex-shrink-0 w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center mr-3">
                      <span className="text-blue-800 font-semibold">{step.order || index + 1}</span>
                    </div>
                    <div className="flex-1">
                      <h5 className="font-semibold text-gray-900 mb-1">{step.title}</h5>
                      <p className="text-gray-700 text-sm mb-3">{step.description}</p>
                      
                      <div className="flex items-center text-sm text-gray-600 mb-2">
                        <Clock className="h-4 w-4 mr-1" />
                        {step.duration}
                      </div>
                      
                      {step.skills && step.skills.length > 0 && (
                        <div className="flex flex-wrap gap-2 mt-2">
                          {step.skills.map((skill, skillIdx) => (
                            <span key={skillIdx} className="bg-blue-100 text-blue-800 px-2 py-1 rounded text-xs font-medium">
                              {skill}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Integrated Local Course Recommendations from Courses.py */}
          {Array.isArray(generatedRoadmap.courseRecommendations) && generatedRoadmap.courseRecommendations.length > 0 && (
            <div className="border border-gray-200 rounded-lg p-6 bg-white">
              <div className="flex items-center mb-3">
                <BookOpen className="h-5 w-5 mr-2 text-blue-600" />
                <h4 className="text-lg font-semibold text-gray-900">Course Recommendations</h4>
                <span className="ml-2 text-sm text-gray-500">(from local modules)</span>
              </div>

              <div className="space-y-4">
                {generatedRoadmap.courseRecommendations.map((course, idx) => (
                  <div key={idx} className="border border-gray-200 rounded-lg p-4 hover:shadow-sm transition-shadow bg-white">
                    <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start mb-2">
                      <h5 className="font-semibold text-gray-900 mb-2 sm:mb-0 sm:mr-3">{course.title}</h5>
                      <div className="flex items-center space-x-3 text-sm text-gray-600">
                        <div className="flex items-center">
                          <Clock className="h-4 w-4 mr-1" />
                          <span>Relevance: {Math.min(Math.max(Math.round(course.relevanceScore), 0), 100)}%</span>
                        </div>
                      </div>
                    </div>

                    {course.description && (
                      <p className="text-gray-700 text-sm mb-3">{course.description}</p>
                    )}

                    {Array.isArray(course.relevanceReasons) && course.relevanceReasons.length > 0 && (
                      <div className="flex flex-wrap gap-2 mt-2">
                        {course.relevanceReasons.map((reason, rIdx) => (
                          <span key={rIdx} className="bg-blue-100 text-blue-800 px-2 py-1 rounded text-xs font-medium">
                            {reason}
                          </span>
                        ))}
                      </div>
                    )}

                    {course.url && (
                      <div className="mt-3">
                        <a
                          href={course.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center text-blue-600 hover:text-blue-800 text-sm font-medium"
                        >
                          View Course
                        </a>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Course Suggestions Component */}
          <CourseSuggestions 
            roadmapContent={{
              title: generatedRoadmap.roadmap.title,
              description: generatedRoadmap.roadmap.description,
              difficulty: generatedRoadmap.roadmap.difficulty,
              steps: generatedRoadmap.roadmap.steps
            }}
          />

          <div className="flex space-x-4">
            <button
              onClick={() => {
                setCurrentStep(1);
                setGeneratedRoadmap(null);
                setEnhancedGoal(null);
                setGoalText('');
              }}
              className="flex-1 bg-gray-200 hover:bg-gray-300 text-gray-700 font-semibold py-3 px-6 rounded-lg"
            >
              Generate Another
            </button>
            <button
              onClick={handleSaveRoadmap}
              disabled={loading}
              className="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-6 rounded-lg flex items-center justify-center disabled:bg-gray-400"
            >
              {loading ? (
                <>
                  <Loader className="h-5 w-5 mr-2 animate-spin" />
                  Saving...
                </>
              ) : (
                <>
                  <Save className="h-5 w-5 mr-2" />
                  Save to My Roadmaps
                </>
              )}
            </button>
          </div>
        </div>
      )}
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-4xl mx-auto">
        {renderStepIndicator()}
        
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
            <div className="flex items-center">
              <AlertCircle className="h-5 w-5 text-red-600 mr-2" />
              <p className="text-red-700">{error}</p>
            </div>
            <button
              onClick={() => setError('')}
              className="mt-2 text-sm text-red-600 hover:text-red-800 underline"
            >
              Dismiss
            </button>
          </div>
        )}

        {success && (
          <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-6">
            <div className="flex items-center">
              <CheckCircle className="h-5 w-5 text-green-600 mr-2" />
              <p className="text-green-700">{success}</p>
            </div>
          </div>
        )}

        {currentStep === 1 && renderStep1()}
        {currentStep === 2 && renderStep2()}
        {currentStep === 3 && renderStep3()}
        {currentStep === 4 && renderStep4()}
      </div>
    </div>
  );
};

export default AIRoadmapGenerator;

