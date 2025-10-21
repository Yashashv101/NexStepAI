import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

const GoalSelection = () => {
  const [selectedGoal, setSelectedGoal] = useState('');
  const navigate = useNavigate();
  
  const goals = [
    'Web Development', 
    'Data Science', 
    'Mobile Development',
    'DevOps',
    'Machine Learning',
    'Cybersecurity'
  ];

  const handleSubmit = (e) => {
    e.preventDefault();
    if (selectedGoal) {
      // Save to context or state management
      navigate('/skill-level');
    }
  };

  return (
    <div className="max-w-2xl mx-auto">
      <h1 className="text-3xl font-bold mb-6 text-center">What's your career goal?</h1>
      
      <form onSubmit={handleSubmit}>
        <div className="grid grid-cols-2 gap-4 mb-6">
          {goals.map((goal) => (
            <div 
              key={goal}
              className={`p-4 border rounded-lg cursor-pointer transition-all ${
                selectedGoal === goal ? 'border-indigo-500 bg-indigo-50' : 'border-gray-200 hover:border-indigo-300'
              }`}
              onClick={() => setSelectedGoal(goal)}
            >
              <h3 className="font-medium">{goal}</h3>
            </div>
          ))}
        </div>
        
        <button 
          type="submit"
          disabled={!selectedGoal}
          className="w-full py-2 px-4 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 disabled:bg-gray-400 disabled:cursor-not-allowed"
        >
          Continue
        </button>
      </form>
    </div>
  );
};

export default GoalSelection;