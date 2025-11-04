import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAppContext } from '../../context/AppContext';

function SkillLevel() {
  const [selectedLevel, setSelectedLevel] = useState('');
  const navigate = useNavigate();

  const {
    selectedGoal,
    selectSkillLevel,
    setSkillValidation,
    clearSkillValidation,
    openRoadmapModal,
    skillValidationMessage,
    skillValidationType
  } = useAppContext();

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

  const handleSubmit = (e) => {
    e.preventDefault();
    if (selectedLevel) {
      // Save to context or state management
      navigate('/time-selection');
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <div className="text-center mb-10">
        <h1 className="text-4xl font-bold text-indigo-700 mb-3">What's Your Skill Level?</h1>
        <p className="text-gray-600 text-lg">Help us tailor your learning roadmap to your experience</p>
      </div>

      <form onSubmit={handleSubmit}>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          {skillLevels.map((level) => (
            <div 
              key={level.id}
              className={`p-6 border-2 rounded-xl cursor-pointer transition-all shadow-sm hover:shadow-md ${
                selectedLevel === level.id ? 'border-indigo-500 bg-indigo-50 ring-2 ring-indigo-300' : 'border-gray-200 hover:border-indigo-300'
              }`}
              onClick={() => setSelectedLevel(level.id)}
            >
              <div className="flex flex-col items-center text-center">
                <span className="text-4xl mb-3">{level.icon}</span>
                <h3 className="font-bold text-xl mb-2 text-gray-800">{level.title}</h3>
                <p className="text-gray-600 text-sm">{level.description}</p>
                <div className="mt-4">
                  <input 
                    type="radio" 
                    id={level.id} 
                    name="skillLevel" 
                    className="mr-2"
                    checked={selectedLevel === level.id}
                    onChange={() => setSelectedLevel(level.id)}
                  />
                  <label htmlFor={level.id} className="text-gray-700">Select</label>
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="flex justify-between mt-8">
          <button 
            type="button"
            onClick={() => navigate('/goal-selection')}
            className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
          >
            Back
          </button>
          <button 
            type="submit"
            disabled={!selectedLevel}
            className="px-8 py-3 bg-indigo-600 text-white text-lg font-medium rounded-lg shadow-md hover:bg-indigo-700 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed"
          >
            Next Step
          </button>
        </div>
      </form>
    </div>
  );
}

export default SkillLevel;