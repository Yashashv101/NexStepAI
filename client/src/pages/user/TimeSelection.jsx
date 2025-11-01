import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

function TimeSelection() {
  const [timeValue, setTimeValue] = useState('');
  const [timeUnit, setTimeUnit] = useState('hours-per-week');
  const navigate = useNavigate();

  const handleSubmit = (e) => {
    e.preventDefault();
    if (timeValue) {
      // Save to context or state management
      navigate('/dashboard');
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <div className="text-center mb-10">
        <h1 className="text-4xl font-bold text-indigo-700 mb-3">Your Learning Time</h1>
        <p className="text-gray-600 text-lg">How much time can you dedicate to learning?</p>
      </div>

      <form onSubmit={handleSubmit} className="max-w-md mx-auto">
        <div className="bg-white p-8 rounded-xl shadow-md">
          <div className="mb-6">
            <label htmlFor="timeValue" className="block text-gray-700 font-medium mb-2">
              Available Time
            </label>
            <div className="flex gap-4">
              <input
                type="number"
                id="timeValue"
                min="1"
                value={timeValue}
                onChange={(e) => setTimeValue(e.target.value)}
                className="w-full p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                placeholder="Enter amount"
                required
              />
              <select
                value={timeUnit}
                onChange={(e) => setTimeUnit(e.target.value)}
                className="p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
              >
                <option value="hours-per-week">Hours per week</option>
                <option value="hours-per-day">Hours per day</option>
                <option value="weeks">Weeks total</option>
                <option value="months">Months total</option>
              </select>
            </div>
          </div>

          <div className="mt-8 space-y-4">
            <div className="p-4 bg-indigo-50 rounded-lg border border-indigo-100">
              <h3 className="font-medium text-indigo-800">Recommended Time</h3>
              <p className="text-sm text-indigo-600">For optimal learning, we recommend at least 5-10 hours per week.</p>
            </div>
            
            <div className="p-4 bg-amber-50 rounded-lg border border-amber-100">
              <h3 className="font-medium text-amber-800">Learning Tip</h3>
              <p className="text-sm text-amber-600">Consistency is more important than duration. Regular practice leads to better results.</p>
            </div>
          </div>
        </div>

        <div className="flex justify-between mt-8">
          <button 
            type="button"
            onClick={() => navigate('/skill-level')}
            className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
          >
            Back
          </button>
          <button 
            type="submit"
            disabled={!timeValue}
            className="px-8 py-3 bg-indigo-600 text-white text-lg font-medium rounded-lg shadow-md hover:bg-indigo-700 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed"
          >
            Generate Roadmap
          </button>
        </div>
      </form>
    </div>
  );
}

export default TimeSelection;