import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

const GoalSelection = () => {
  const [selectedGoal, setSelectedGoal] = useState('');
  const navigate = useNavigate();
  
  const careerGoals = [
    {
      id: 'web-dev',
      title: 'Web Developer',
      icon: '🌐',
      description: 'Build websites and web applications'
    },
    {
      id: 'data-science',
      title: 'Data Scientist',
      icon: '📊',
      description: 'Analyze and interpret complex data'
    },
    {
      id: 'mobile-dev',
      title: 'Mobile Developer',
      icon: '📱',
      description: 'Create apps for iOS and Android'
    },
    {
      id: 'devops',
      title: 'DevOps Engineer',
      icon: '⚙️',
      description: 'Streamline development and operations'
    },
    {
      id: 'ml-engineer',
      title: 'ML Engineer',
      icon: '🤖',
      description: 'Build machine learning systems'
    },
    {
      id: 'cybersecurity',
      title: 'Cybersecurity Analyst',
      icon: '🔒',
      description: 'Protect systems from threats'
    },
    {
      id: 'ui-ux',
      title: 'UI/UX Designer',
      icon: '🎨',
      description: 'Design user interfaces and experiences'
    },
    {
      id: 'cloud-architect',
      title: 'Cloud Architect',
      icon: '☁️',
      description: 'Design cloud infrastructure solutions'
    }
  ];

  const handleSubmit = (e) => {
    e.preventDefault();
    if (selectedGoal) {
      // Save to context or state management
      navigate('/skill-level');
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <div className="text-center mb-10">
        <h1 className="text-4xl font-bold text-indigo-700 mb-3">Choose Your Career Path</h1>
        <p className="text-gray-600 text-lg">Select a career goal to generate your personalized learning roadmap</p>
      </div>
      
      <form onSubmit={handleSubmit}>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          {careerGoals.map((goal) => (
            <div 
              key={goal.id}
              className={`p-6 border-2 rounded-xl cursor-pointer transition-all shadow-sm hover:shadow-md ${
                selectedGoal === goal.id ? 'border-indigo-500 bg-indigo-50 ring-2 ring-indigo-300' : 'border-gray-200 hover:border-indigo-300'
              }`}
              onClick={() => setSelectedGoal(goal.id)}
            >
              <div className="flex flex-col items-center text-center">
                <span className="text-4xl mb-3">{goal.icon}</span>
                <h3 className="font-bold text-xl mb-2 text-gray-800">{goal.title}</h3>
                <p className="text-gray-600 text-sm">{goal.description}</p>
              </div>
            </div>
          ))}
        </div>
        
        <div className="flex justify-center mt-8">
          <button 
            type="submit"
            disabled={!selectedGoal}
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