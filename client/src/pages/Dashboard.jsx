import { useState } from 'react';

function Dashboard() {
  // Mock roadmap data
  const [roadmapItems, setRoadmapItems] = useState([
    { id: 1, title: 'HTML & CSS Fundamentals', estimatedTime: '2 weeks', progress: 80, description: 'Learn the basics of HTML5 and CSS3 to build static web pages.' },
    { id: 2, title: 'JavaScript Basics', estimatedTime: '3 weeks', progress: 65, description: 'Master JavaScript fundamentals including variables, functions, and DOM manipulation.' },
    { id: 3, title: 'React Core Concepts', estimatedTime: '4 weeks', progress: 40, description: 'Learn React components, props, state, and lifecycle methods.' },
    { id: 4, title: 'State Management', estimatedTime: '2 weeks', progress: 20, description: 'Understand state management with Context API and Redux.' },
    { id: 5, title: 'Backend Integration', estimatedTime: '3 weeks', progress: 0, description: 'Connect your React app to backend services using REST APIs.' },
  ]);

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

      <div className="bg-indigo-50 rounded-xl p-6 border border-indigo-100">
        <h2 className="text-xl font-semibold text-indigo-800 mb-4">Weekly Learning Stats</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-white p-4 rounded-lg shadow-sm">
            <div className="text-2xl font-bold text-indigo-600">12.5 hrs</div>
            <div className="text-sm text-gray-500">Time Spent This Week</div>
          </div>
          <div className="bg-white p-4 rounded-lg shadow-sm">
            <div className="text-2xl font-bold text-green-600">3</div>
            <div className="text-sm text-gray-500">Topics Completed</div>
          </div>
          <div className="bg-white p-4 rounded-lg shadow-sm">
            <div className="text-2xl font-bold text-amber-600">5</div>
            <div className="text-sm text-gray-500">Days Streak</div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Dashboard;