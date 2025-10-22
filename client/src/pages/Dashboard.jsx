import { useState, useEffect } from 'react';
import { getRoadmaps } from '../services/api';

function Dashboard() {
  const [roadmapItems, setRoadmapItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchRoadmaps = async () => {
      try {
        setLoading(true);
        const response = await getRoadmaps();
        
        if (response.success && response.data) {
          // Transform API data to match component structure
          const formattedRoadmaps = response.data.map((roadmap, index) => {
            // Get the first step or use defaults if no steps
            const firstStep = roadmap.steps && roadmap.steps.length > 0 
              ? roadmap.steps[0] 
              : { title: 'Untitled Step', duration: 'Unknown' };
              
            return {
              id: roadmap._id,
              title: firstStep.title,
              estimatedTime: firstStep.duration,
              progress: Math.floor(Math.random() * 100), // Placeholder for actual progress tracking
              description: `Step ${index + 1} of your learning journey for ${roadmap.goalId || 'your career'}.`
            };
          });
          
          setRoadmapItems(formattedRoadmaps);
        } else {
          throw new Error('Invalid response format from API');
        }
      } catch (err) {
        console.error('Failed to fetch roadmaps:', err);
        setError('Failed to load roadmap data. Please try again later.');
        // Fallback to empty array instead of mock data
        setRoadmapItems([]);
      } finally {
        setLoading(false);
      }
    };

    fetchRoadmaps();
  }, []);

  // Calculate overall progress
  const totalProgress = roadmapItems.reduce((sum, item) => sum + item.progress, 0) / roadmapItems.length;

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-indigo-700">Your Learning Dashboard</h1>
          <p className="text-gray-600 mt-2">Web Developer Career Path</p>
        </div>
        <div className="mt-4 md:mt-0 bg-white p-4 rounded-lg shadow-md">
          <div className="flex items-center">
            <div className="mr-4">
              <div className="text-3xl font-bold text-indigo-600">{Math.round(totalProgress)}%</div>
              <div className="text-sm text-gray-500">Overall Progress</div>
            </div>
            <div className="w-24 h-24 relative">
              <svg className="w-full h-full" viewBox="0 0 100 100">
                <circle 
                  className="text-gray-200" 
                  strokeWidth="8" 
                  stroke="currentColor" 
                  fill="transparent" 
                  r="40" 
                  cx="50" 
                  cy="50" 
                />
                <circle 
                  className="text-indigo-600" 
                  strokeWidth="8" 
                  stroke="currentColor" 
                  fill="transparent" 
                  r="40" 
                  cx="50" 
                  cy="50" 
                  strokeDasharray={`${2 * Math.PI * 40}`}
                  strokeDashoffset={`${2 * Math.PI * 40 * (1 - totalProgress / 100)}`}
                  strokeLinecap="round"
                />
              </svg>
            </div>
          </div>
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500"></div>
        </div>
      ) : error ? (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-6">
          <p>{error}</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-10">
          {roadmapItems.map((item) => (
          <div key={item.id} className="bg-white rounded-xl shadow-md overflow-hidden">
            <div className="p-6">
              <div className="flex justify-between items-start mb-2">
                <h3 className="text-xl font-semibold text-gray-800">{item.title}</h3>
                <span className="px-3 py-1 bg-indigo-100 text-indigo-800 rounded-full text-sm">
                  {item.estimatedTime}
                </span>
              </div>
              <p className="text-gray-600 mb-4">{item.description}</p>
              
              <div className="mt-4">
                <div className="flex justify-between mb-1">
                  <span className="text-sm font-medium text-gray-700">Progress</span>
                  <span className="text-sm font-medium text-gray-700">{item.progress}%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2.5">
                  <div 
                    className="bg-indigo-600 h-2.5 rounded-full" 
                    style={{ width: `${item.progress}%` }}
                  ></div>
                </div>
              </div>
              
              <div className="mt-6 flex justify-end">
                <button className="px-4 py-2 bg-indigo-50 text-indigo-700 rounded-lg hover:bg-indigo-100 transition-colors">
                  Continue Learning
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
      )}
      <div className="mt-10">
        <h2 className="text-2xl font-semibold text-gray-800 mb-4">Weekly Learning Statistics</h2>
        <div className="bg-white rounded-xl shadow-md p-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-indigo-50 p-4 rounded-lg">
              <div className="text-xl font-bold text-indigo-600">8.5 hours</div>
              <div className="text-sm text-gray-500">Time Spent Learning</div>
            </div>
            <div className="bg-green-50 p-4 rounded-lg">
              <div className="text-xl font-bold text-green-600">3 topics</div>
              <div className="text-sm text-gray-500">Topics Completed</div>
            </div>
            <div className="bg-purple-50 p-4 rounded-lg">
              <div className="text-xl font-bold text-purple-600">12 days</div>
              <div className="text-sm text-gray-500">Current Streak</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Dashboard;