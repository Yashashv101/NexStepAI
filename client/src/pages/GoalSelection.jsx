import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getGoals } from '../services/api';
import { useAppContext } from '../context/AppContext';

const GoalSelection = () => {
  const [localSelectedGoal, setLocalSelectedGoal] = useState('');
  const [goals, setGoals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  const { selectGoal } = useAppContext();
  
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

  useEffect(() => {
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
            difficulty: goal.difficulty,
            category: goal.category,
            estimatedTime: goal.estimatedTime,
            icon: defaultIcons[goal.name] || defaultIcons.default
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
            category: 'Web Development',
            estimatedTime: '3 months'
          },
          {
            id: 'sample-data-science',
            title: 'Data Scientist',
            icon: '📊',
            description: 'Analyze and interpret complex data',
            difficulty: 'intermediate',
            category: 'Data Science',
            estimatedTime: '6 months'
          }
        ]);
      } finally {
        setLoading(false);
      }
    };

    fetchGoals();
  }, []);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (localSelectedGoal) {
      // Find the complete goal object from the goals array
      const goal = goals.find(g => g.id === localSelectedGoal);
      if (goal) {
        selectGoal(goal);
        navigate('/skill-level');
      }
    }
  };

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-8 flex justify-center items-center min-h-[60vh]">
        <div className="text-center">
          <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-indigo-600 border-r-transparent"></div>
          <p className="mt-4 text-gray-600">Loading career goals...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <div className="text-center mb-10">
        <h1 className="text-4xl font-bold text-indigo-700 mb-3">Choose Your Career Path</h1>
        <p className="text-gray-600 text-lg">Select a career goal to generate your personalized learning roadmap</p>
      </div>
      
      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-6">
          <p>{error}</p>
        </div>
      )}
      
      <form onSubmit={handleSubmit}>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          {goals.length > 0 ? (
            goals.map((goal) => (
              <div
                key={goal.id}
                className={`p-6 border-2 rounded-xl cursor-pointer transition-all shadow-sm hover:shadow-md ${
                  localSelectedGoal === goal.id ? 'border-indigo-500 bg-indigo-50 ring-2 ring-indigo-300' : 'border-gray-200 hover:border-indigo-300'
                }`}
                onClick={() => setLocalSelectedGoal(goal.id)}
              >
                <div className="flex flex-col items-center text-center">
                  <span className="text-4xl mb-3">{goal.icon}</span>
                  <h3 className="font-bold text-xl mb-2 text-gray-800">{goal.title}</h3>
                  <p className="text-gray-600 text-sm">{goal.description}</p>
                </div>
              </div>
            ))
          ) : (
            <div className="col-span-3 text-center py-8">
              <p className="text-gray-500">No career goals available. Please check back later.</p>
            </div>
          )}
        </div>
        
        <div className="flex justify-center mt-8">
          <button
            type="submit"
            disabled={!localSelectedGoal}
            className="px-8 py-3 bg-indigo-600 text-white text-lg font-medium rounded-lg shadow-md hover:bg-indigo-700 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed"
          >
            Next Step
          </button>
        </div>
      </form>
    </div>
  );
};

export default GoalSelection;