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
  User
} from 'lucide-react';
import { getUserRoadmaps, getUserDashboardStats, getUserActivities } from '../../services/api';

function Dashboard() {
  const [roadmapItems, setRoadmapItems] = useState([]);
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

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setLoading(true);
        
        // Fetch all dashboard data in parallel
        const [roadmapsResponse, statsResponse, activitiesResponse] = await Promise.all([
          getUserRoadmaps(),
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
    <div className="min-h-screen bg-[var(--bg-900)] p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex justify-between items-start">
            <div>
              <h1 className="text-3xl font-bold text-[var(--text-primary)]">Welcome back!</h1>
              <p className="text-[var(--muted)] mt-2">Continue your learning journey</p>
            </div>
            <Link 
              to="/user/profile" 
              className="flex items-center px-4 py-2 bg-[var(--bg-800)] border border-[rgba(230,239,239,0.12)] rounded-lg shadow-md hover:bg-[var(--bg-900)] transition-colors"
            >
              <User className="h-5 w-5 mr-2 text-[var(--muted)]" />
              Profile
            </Link>
          </div>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-[var(--surface)] border border-[rgba(230,239,239,0.12)] rounded-lg shadow-md p-6">
            <div className="flex items-center">
              <div className="p-3 rounded-lg bg-[rgba(29,185,84,0.08)]">
                <TrendingUp className="h-6 w-6 text-[var(--accent-green)]" />
              </div>
              <div className="ml-4">
                <p className="text-2xl font-bold text-[var(--text-primary)]">{Math.round(overallProgress)}%</p>
                <p className="text-sm text-[var(--muted)]">Overall Progress</p>
              </div>
            </div>
          </div>
          
          <div className="bg-[var(--surface)] border border-[rgba(230,239,239,0.12)] rounded-lg shadow-md p-6">
            <div className="flex items-center">
              <div className="p-3 rounded-lg bg-[rgba(29,185,84,0.08)]">
                <Target className="h-6 w-6 text-[var(--accent-green)]" />
              </div>
              <div className="ml-4">
                <p className="text-2xl font-bold text-[var(--text-primary)]">{dashboardStats.inProgressRoadmaps}</p>
                <p className="text-sm text-[var(--muted)]">Active Roadmaps</p>
              </div>
            </div>
          </div>
          
          <div className="bg-[var(--surface)] border border-[rgba(230,239,239,0.12)] rounded-lg shadow-md p-6">
            <div className="flex items-center">
              <div className="p-3 rounded-lg bg-[rgba(29,185,84,0.08)]">
                <Clock className="h-6 w-6 text-[var(--accent-green)]" />
              </div>
              <div className="ml-4">
                <p className="text-2xl font-bold text-[var(--text-primary)]">
                  {formatTimeSpent(dashboardStats.weeklyTimeSpent || 0)}
                </p>
                <p className="text-sm text-[var(--muted)]">This Week</p>
              </div>
            </div>
          </div>
          
          <div className="bg-[var(--surface)] border border-[rgba(230,239,239,0.12)] rounded-lg shadow-md p-6">
            <div className="flex items-center">
              <div className="p-3 rounded-lg bg-[rgba(29,185,84,0.08)]">
                <Award className="h-6 w-6 text-[var(--accent-green)]" />
              </div>
              <div className="ml-4">
                <p className="text-2xl font-bold text-[var(--text-primary)]">{dashboardStats.currentStreak || 0}</p>
                <p className="text-sm text-[var(--muted)]">Day Streak</p>
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Active Roadmaps */}
          <div className="lg:col-span-2">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-semibold text-[var(--text-primary)]">Active Roadmaps</h2>
              <Link 
                to="/user/roadmaps" 
                className="text-[var(--accent-green)] hover:text-[var(--accent-green-600)] flex items-center text-sm"
              >
                View All <ArrowRight className="h-4 w-4 ml-1" />
              </Link>
            </div>

            {loading ? (
              <div className="flex justify-center items-center h-64 bg-[var(--surface)] border border-[rgba(230,239,239,0.12)] rounded-lg shadow-md">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[var(--accent-green)]"></div>
              </div>
            ) : error ? (
              <div className="bg-[var(--bg-800)] border border-[rgba(230,239,239,0.12)] text-red-500 px-4 py-3 rounded-lg mb-6">
                <p>{error}</p>
              </div>
            ) : roadmapItems.length === 0 ? (
              <div className="bg-[var(--surface)] border border-[rgba(230,239,239,0.12)] rounded-lg shadow-md p-8 text-center">
                <BookOpen className="mx-auto h-12 w-12 text-[var(--muted)] mb-4" />
                <h3 className="text-lg font-medium text-[var(--text-primary)] mb-2">No active roadmaps</h3>
                <p className="text-[var(--muted)] mb-4">Start your learning journey by selecting a goal</p>
                <Link 
                  to="/goal-selection" 
                  className="inline-flex items-center px-4 py-2 bg-[var(--accent-green)] text-[var(--bg-900)] rounded-lg hover:bg-[var(--accent-green-600)]"
                >
                  Get Started
                </Link>
              </div>
            ) : (
              <div className="space-y-4">
                {roadmapItems.slice(0, 3).map((item) => (
                  <div key={item.id} className="bg-[var(--surface)] border border-[rgba(230,239,239,0.12)] rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow">
                    <div className="flex justify-between items-start mb-4">
                      <div>
                        <h3 className="text-lg font-semibold text-[var(--text-primary)]">{item.title}</h3>
                        <p className="text-[var(--muted)] text-sm mt-1">{item.description}</p>
                      </div>
                      <span className="px-3 py-1 bg-[rgba(29,185,84,0.08)] text-[var(--accent-green)] rounded-full text-sm">
                        {item.estimatedTime}
                      </span>
                    </div>
                    
                    <div className="mb-4">
                      <div className="flex justify-between mb-2">
                        <span className="text-sm font-medium text-[var(--muted)]">Progress</span>
                        <span className="text-sm font-medium text-[var(--muted)]">{item.progress}%</span>
                      </div>
                      <div className="w-full bg-[rgba(255,255,255,0.12)] rounded-full h-2">
                        <div 
                          className="bg-[var(--accent-green)] h-2 rounded-full transition-all" 
                          style={{ width: `${item.progress}%` }}
                        ></div>
                      </div>
                    </div>
                    
                    <div className="flex justify-between items-center">
                      <div className="flex items-center text-sm text-[var(--muted)]">
                        <Calendar className="h-4 w-4 mr-1" />
                        {formatLastUpdated(item.lastUpdated || item.updatedAt)}
                      </div>
                      <button className="flex items-center px-4 py-2 bg-[rgba(29,185,84,0.12)] text-[var(--accent-green)] rounded-lg hover:bg-[rgba(29,185,84,0.2)] transition-colors">
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
            <div className="bg-[var(--surface)] border border-[rgba(230,239,239,0.12)] rounded-lg shadow-md p-6">
              <h3 className="text-lg font-semibold text-[var(--text-primary)] mb-4">Recent Activity</h3>
              <div className="space-y-4">
                {recentActivities.length > 0 ? (
                  recentActivities.map((activity, index) => (
                    <div key={activity._id || index} className="flex items-start">
                      <div className={`p-2 rounded-lg mr-3 bg-[rgba(29,185,84,0.08)]`}>
                        {activity.icon === 'check-circle' ? <Award className="h-4 w-4 text-[var(--accent-green)]" /> :
                         activity.icon === 'book-open' ? <BookOpen className="h-4 w-4 text-[var(--accent-green)]" /> :
                         activity.icon === 'target' ? <Target className="h-4 w-4 text-[var(--accent-green)]" /> :
                         <Award className="h-4 w-4 text-[var(--accent-green)]" />}
                      </div>
                      <div>
                        <p className="text-sm font-medium text-[var(--text-primary)]">{activity.title}</p>
                        <p className="text-xs text-[var(--muted)]">
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
                    <p className="text-sm text-[var(--muted)]">No recent activity</p>
                    <p className="text-xs text-[var(--muted)] mt-1">Start learning to see your progress here</p>
                  </div>
                )}
              </div>
            </div>

            {/* Quick Actions */}
            <div className="bg-[var(--surface)] border border-[rgba(230,239,239,0.12)] rounded-lg shadow-md p-6">
              <h3 className="text-lg font-semibold text-[var(--text-primary)] mb-4">Quick Actions</h3>
              <div className="space-y-3">
                <Link 
                  to="/goal-selection" 
                  className="flex items-center w-full p-3 text-left bg-[var(--bg-800)] rounded-lg hover:bg-[var(--bg-900)] transition-colors"
                >
                  <Target className="h-5 w-5 text-[var(--muted)] mr-3" />
                  <span className="text-sm font-medium text-[var(--text-primary)]">Set New Goal</span>
                </Link>
                <Link 
                  to="/user/roadmaps" 
                  className="flex items-center w-full p-3 text-left bg-[var(--bg-800)] rounded-lg hover:bg-[var(--bg-900)] transition-colors"
                >
                  <BookOpen className="h-5 w-5 text-[var(--muted)] mr-3" />
                  <span className="text-sm font-medium text-[var(--text-primary)]">Browse Roadmaps</span>
                </Link>
                <Link 
                  to="/user/profile" 
                  className="flex items-center w-full p-3 text-left bg-[var(--bg-800)] rounded-lg hover:bg-[var(--bg-900)] transition-colors"
                >
                  <User className="h-5 w-5 text-[var(--muted)] mr-3" />
                  <span className="text-sm font-medium text-[var(--text-primary)]">Update Profile</span>
                </Link>
              </div>
            </div>

            {/* Learning Stats */}
            <div className="bg-[var(--surface)] border border-[rgba(230,239,239,0.12)] rounded-lg shadow-md p-6">
              <h3 className="text-lg font-semibold text-[var(--text-primary)] mb-4">This Week</h3>
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-[var(--muted)]">Learning Time</span>
                  <span className="text-sm font-medium text-[var(--text-primary)]">
                    {formatTimeSpent(dashboardStats.weeklyTimeSpent || 0)}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-[var(--muted)]">Topics Completed</span>
                  <span className="text-sm font-medium text-[var(--text-primary)]">
                    {dashboardStats.weeklyTopicsCompleted || 0}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-[var(--muted)]">Current Streak</span>
                  <span className="text-sm font-medium text-[var(--text-primary)]">
                    {dashboardStats.currentStreak || 0} days
                  </span>
                </div>
                <div className="pt-2 border-t border-[rgba(230,239,239,0.12)]">
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-sm text-[var(--muted)]">Weekly Goal</span>
                    <span className="text-sm font-medium text-[var(--text-primary)]">
                      {Math.round(dashboardStats.weeklyGoalProgress || 0)}%
                    </span>
                  </div>
                  <div className="w-full bg-[rgba(255,255,255,0.12)] rounded-full h-2">
                    <div 
                      className="bg-[var(--accent-green)] h-2 rounded-full transition-all" 
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