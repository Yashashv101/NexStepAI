import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  TrendingUp,
  Clock,
  Target,
  BookOpen,
  Award,
  Calendar,
  ArrowRight,
  Play,
  User,
  ChevronDown,
  ChevronUp,
  CheckCircle,
  Circle
} from 'lucide-react';
import { getRoadmaps, getUserDashboardStats, getUserActivities, updateStepProgress } from '../../services/api';
import { useAppContext } from '../../context/AppContext';

function Dashboard() {
  const [roadmapItems, setRoadmapItems] = useState([]);
  const [expandedRoadmaps, setExpandedRoadmaps] = useState({});
  const [stepUpdating, setStepUpdating] = useState({});
  const [dashboardStats, setDashboardStats] = useState({
    totalRoadmaps: 0,
    completedRoadmaps: 0,
    inProgressRoadmaps: 0,
    totalTimeSpent: 0,
    averageProgress: 0,
    weeklyTimeSpent: 0,
    weeklyTopicsCompleted: 0,
    currentStreak: 0,
    weeklyGoalProgress: 0
  });
  const [recentActivities, setRecentActivities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const { activeRoadmaps, updateUserProgress } = useAppContext();

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setLoading(true);
        
        // Fetch all dashboard data in parallel
        const [roadmapsResponse, statsResponse, activitiesResponse] = await Promise.all([
          getRoadmaps(),
          getUserDashboardStats(),
          getUserActivities({ limit: 5 })
        ]);
        
        // Handle roadmaps data
        if (roadmapsResponse.success && roadmapsResponse.data) {
          const formattedRoadmaps = roadmapsResponse.data.map((roadmap, index) => {
            const firstStep = roadmap.steps && roadmap.steps.length > 0 
              ? roadmap.steps[0] 
              : { title: 'Untitled Step', duration: 'Unknown' };
              
            return {
              id: roadmap._id,
              title: firstStep.title,
              estimatedTime: firstStep.duration,
              progress: roadmap.progress || 0, // Use actual progress or 0 if not available
              description: `Step ${index + 1} of your learning journey for ${roadmap.goalId || 'your career'}.`
            };
          });
          
          setRoadmapItems(formattedRoadmaps);
        }
        
        // Handle dashboard stats
        if (statsResponse.success && statsResponse.data) {
          setDashboardStats(statsResponse.data);
        }
        
        // Handle recent activities
        if (activitiesResponse.success && activitiesResponse.data) {
          setRecentActivities(activitiesResponse.data);
        }
        
      } catch (err) {
        console.error('Failed to fetch dashboard data:', err);
        setError('Failed to load dashboard data. Please try again later.');
        // Set empty arrays/objects instead of mock data
        setRoadmapItems([]);
        setRecentActivities([]);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  // Calculate overall progress from dashboard stats
  const overallProgress = dashboardStats.averageProgress || 0;

  // Format time spent for display
  const formatTimeSpent = (minutes) => {
    if (minutes < 60) return `${minutes}m`;
    const hours = Math.floor(minutes / 60);
    const remainingMinutes = minutes % 60;
    return remainingMinutes > 0 ? `${hours}h ${remainingMinutes}m` : `${hours}h`;
  };

  // Helper function to format last updated time
  const formatLastUpdated = (dateString) => {
    if (!dateString) return 'Never updated';
    const date = new Date(dateString);
    const now = new Date();
    const diffTime = Math.abs(now - date);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays === 1) return '1 day ago';
    if (diffDays < 7) return `${diffDays} days ago`;
    if (diffDays < 30) return `${Math.ceil(diffDays / 7)} weeks ago`;
    return `${Math.ceil(diffDays / 30)} months ago`;
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex justify-between items-start">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Welcome back!</h1>
              <p className="text-gray-600 mt-2">Continue your learning journey</p>
            </div>
            <Link 
              to="/user/profile" 
              className="flex items-center px-4 py-2 bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow"
            >
              <User className="h-5 w-5 mr-2 text-gray-600" />
              Profile
            </Link>
          </div>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex items-center">
              <div className="p-3 bg-blue-100 rounded-lg">
                <TrendingUp className="h-6 w-6 text-blue-600" />
              </div>
              <div className="ml-4">
                <p className="text-2xl font-bold text-gray-900">{Math.round(overallProgress)}%</p>
                <p className="text-sm text-gray-600">Overall Progress</p>
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex items-center">
              <div className="p-3 bg-green-100 rounded-lg">
                <Target className="h-6 w-6 text-green-600" />
              </div>
              <div className="ml-4">
                <p className="text-2xl font-bold text-gray-900">{dashboardStats.inProgressRoadmaps}</p>
                <p className="text-sm text-gray-600">Active Roadmaps</p>
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex items-center">
              <div className="p-3 bg-purple-100 rounded-lg">
                <Clock className="h-6 w-6 text-purple-600" />
              </div>
              <div className="ml-4">
                <p className="text-2xl font-bold text-gray-900">
                  {formatTimeSpent(dashboardStats.weeklyTimeSpent || 0)}
                </p>
                <p className="text-sm text-gray-600">This Week</p>
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex items-center">
              <div className="p-3 bg-orange-100 rounded-lg">
                <Award className="h-6 w-6 text-orange-600" />
              </div>
              <div className="ml-4">
                <p className="text-2xl font-bold text-gray-900">{dashboardStats.currentStreak || 0}</p>
                <p className="text-sm text-gray-600">Day Streak</p>
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Active Roadmaps */}
          <div className="lg:col-span-2">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-semibold text-gray-900">Active Roadmaps</h2>
              <Link 
                to="/user/roadmaps" 
                className="text-blue-600 hover:text-blue-700 flex items-center text-sm"
              >
                View All <ArrowRight className="h-4 w-4 ml-1" />
              </Link>
            </div>

            {loading ? (
              <div className="flex justify-center items-center h-64 bg-white rounded-lg shadow-md">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
              </div>
            ) : error ? (
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-6">
                <p>{error}</p>
              </div>
            ) : roadmapItems.length === 0 ? (
              <div className="bg-white rounded-lg shadow-md p-8 text-center">
                <BookOpen className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">No active roadmaps</h3>
                <p className="text-gray-600 mb-4">Start your learning journey by selecting a goal</p>
                <Link 
                  to="/goal-selection" 
                  className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                >
                  Get Started
                </Link>
              </div>
            ) : (
              <div className="space-y-4">
                {roadmapItems.slice(0, 3).map((item) => (
                  <div key={item.id} className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow">
                    <div className="flex justify-between items-start mb-4">
                      <div>
                        <h3 className="text-lg font-semibold text-gray-900">{item.title}</h3>
                        <p className="text-gray-600 text-sm mt-1">{item.description}</p>
                      </div>
                      <span className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm">
                        {item.estimatedTime}
                      </span>
                    </div>
                    
                    <div className="mb-4">
                      <div className="flex justify-between mb-2">
                        <span className="text-sm font-medium text-gray-700">Progress</span>
                        <span className="text-sm font-medium text-gray-700">{item.progress}%</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div 
                          className="bg-blue-600 h-2 rounded-full transition-all" 
                          style={{ width: `${item.progress}%` }}
                        ></div>
                      </div>
                    </div>
                    
                    <div className="flex justify-between items-center">
                      <div className="flex items-center text-sm text-gray-500">
                        <Calendar className="h-4 w-4 mr-1" />
                        {formatLastUpdated(item.lastUpdated || item.updatedAt)}
                      </div>
                      <button className="flex items-center px-4 py-2 bg-blue-50 text-blue-700 rounded-lg hover:bg-blue-100 transition-colors">
                        <Play className="h-4 w-4 mr-2" />
                        Continue
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Recent Activity */}
            <div className="bg-white rounded-lg shadow-md p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Recent Activity</h3>
              <div className="space-y-4">
                {recentActivities.length > 0 ? (
                  recentActivities.map((activity, index) => (
                    <div key={activity._id || index} className="flex items-start">
                      <div className={`p-2 rounded-lg mr-3 ${
                        activity.color === 'green' ? 'bg-green-100' :
                        activity.color === 'blue' ? 'bg-blue-100' :
                        activity.color === 'purple' ? 'bg-purple-100' :
                        'bg-gray-100'
                      }`}>
                        {activity.icon === 'check-circle' ? <Award className="h-4 w-4 text-green-600" /> :
                         activity.icon === 'book-open' ? <BookOpen className="h-4 w-4 text-blue-600" /> :
                         activity.icon === 'target' ? <Target className="h-4 w-4 text-purple-600" /> :
                         <Award className="h-4 w-4 text-gray-600" />}
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-900">{activity.title}</p>
                        <p className="text-xs text-gray-500">
                          {new Date(activity.createdAt).toLocaleDateString('en-US', {
                            month: 'short',
                            day: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit'
                          })}
                        </p>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-4">
                    <p className="text-sm text-gray-500">No recent activity</p>
                    <p className="text-xs text-gray-400 mt-1">Start learning to see your progress here</p>
                  </div>
                )}
              </div>
            </div>

            {/* Quick Actions */}
            <div className="bg-white rounded-lg shadow-md p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h3>
              <div className="space-y-3">
                <Link 
                  to="/goal-selection" 
                  className="flex items-center w-full p-3 text-left bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                >
                  <Target className="h-5 w-5 text-gray-600 mr-3" />
                  <span className="text-sm font-medium text-gray-900">Set New Goal</span>
                </Link>
                <Link 
                  to="/user/roadmaps" 
                  className="flex items-center w-full p-3 text-left bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                >
                  <BookOpen className="h-5 w-5 text-gray-600 mr-3" />
                  <span className="text-sm font-medium text-gray-900">Browse Roadmaps</span>
                </Link>
                <Link 
                  to="/user/profile" 
                  className="flex items-center w-full p-3 text-left bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                >
                  <User className="h-5 w-5 text-gray-600 mr-3" />
                  <span className="text-sm font-medium text-gray-900">Update Profile</span>
                </Link>
              </div>
            </div>

            {/* Learning Stats */}
            <div className="bg-white rounded-lg shadow-md p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">This Week</h3>
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Learning Time</span>
                  <span className="text-sm font-medium text-gray-900">
                    {formatTimeSpent(dashboardStats.weeklyTimeSpent || 0)}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Topics Completed</span>
                  <span className="text-sm font-medium text-gray-900">
                    {dashboardStats.weeklyTopicsCompleted || 0}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Current Streak</span>
                  <span className="text-sm font-medium text-gray-900">
                    {dashboardStats.currentStreak || 0} days
                  </span>
                </div>
                <div className="pt-2 border-t border-gray-200">
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-sm text-gray-600">Weekly Goal</span>
                    <span className="text-sm font-medium text-gray-900">
                      {Math.round(dashboardStats.weeklyGoalProgress || 0)}%
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div 
                      className="bg-green-600 h-2 rounded-full transition-all" 
                      style={{ width: `${Math.min(dashboardStats.weeklyGoalProgress || 0, 100)}%` }}
                    ></div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Dashboard;