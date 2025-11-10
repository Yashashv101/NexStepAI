import React, { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { 
  Users, 
  Target, 
  Map, 
  BookOpen, 
  TrendingUp, 
  Activity,
  Plus,
  Eye,
  Loader
} from 'lucide-react';
import { getAdminStats } from '../../services/api';
import { subscribeAdminDataChanged } from '../../utils/adminEvents';

const AdminDashboard = () => {
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalGoals: 0,
    totalRoadmaps: 0,
    recentActivities: []
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchAdminStats();
    // Subscribe to admin data change events and refetch with debounce
    const debounceRef = { timer: null };
    const unsubscribe = subscribeAdminDataChanged(() => {
      if (debounceRef.timer) {
        clearTimeout(debounceRef.timer);
      }
      debounceRef.timer = setTimeout(() => {
        fetchAdminStats();
      }, 300);
    });

    // Refetch when tab becomes visible
    const onVisibilityChange = () => {
      if (document.visibilityState === 'visible') {
        fetchAdminStats();
      }
    };
    document.addEventListener('visibilitychange', onVisibilityChange);

    return () => {
      unsubscribe();
      document.removeEventListener('visibilitychange', onVisibilityChange);
      if (debounceRef.timer) clearTimeout(debounceRef.timer);
    };
  }, []);

  const fetchAdminStats = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await getAdminStats();
      // Support both envelope { data: {...} } and direct stats
      const nextStats = response?.data?.data ?? response?.data ?? response;
      setStats(nextStats);
    } catch (err) {
      console.error('Error fetching admin stats:', err);
      setError('Failed to load admin statistics. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const StatCard = ({ icon: Icon, title, value, color, link }) => (
    <div className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-gray-600">{title}</p>
          <p className="text-3xl font-bold text-gray-900">{value}</p>
        </div>
        <div className={`p-3 rounded-full ${color}`}>
          <Icon className="h-6 w-6 text-white" />
        </div>
      </div>
      {link && (
        <Link 
          to={link} 
          className="mt-4 inline-flex items-center text-sm text-blue-600 hover:text-blue-800"
        >
          <Eye className="h-4 w-4 mr-1" />
          View Details
        </Link>
      )}
    </div>
  );

  const QuickAction = ({ icon: Icon, title, description, link, color }) => (
    <Link 
      to={link}
      className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow block"
    >
      <div className="flex items-center">
        <div className={`p-3 rounded-full ${color} mr-4`}>
          <Icon className="h-6 w-6 text-white" />
        </div>
        <div>
          <h3 className="text-lg font-semibold text-gray-900">{title}</h3>
          <p className="text-sm text-gray-600">{description}</p>
        </div>
      </div>
    </Link>
  );

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 p-6">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center justify-center h-64">
            <Loader className="h-8 w-8 animate-spin text-blue-600" />
            <span className="ml-2 text-gray-600">Loading admin dashboard...</span>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 p-6">
        <div className="max-w-7xl mx-auto">
          <div className="bg-red-50 border border-red-200 rounded-lg p-6">
            <div className="flex items-center">
              <div className="text-red-600">
                <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div className="ml-3">
                <h3 className="text-sm font-medium text-red-800">Error Loading Data</h3>
                <p className="text-sm text-red-700 mt-1">{error}</p>
                <button 
                  onClick={fetchAdminStats}
                  className="mt-2 text-sm text-red-800 underline hover:text-red-900"
                >
                  Try again
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Admin Dashboard</h1>
          <p className="text-gray-600 mt-2">Manage your NexStep AI platform</p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <StatCard
            icon={Users}
            title="Total Users"
            value={stats.totalUsers}
            color="bg-blue-500"
            link="/admin/users"
          />
          <StatCard
            icon={Target}
            title="Total Goals"
            value={stats.totalGoals}
            color="bg-green-500"
            link="/admin/goals"
          />
          <StatCard
            icon={Map}
            title="Total Roadmaps"
            value={stats.totalRoadmaps}
            color="bg-purple-500"
            link="/admin/roadmaps"
          />
        </div>

        {/* Recent Activity */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Recent Activity</h2>
          <div className="space-y-4">
            {stats.recentActivities && stats.recentActivities.length > 0 ? (
              stats.recentActivities.map((activity, index) => {
                const getActivityIcon = (type) => {
                  switch (type) {
                    case 'user_registered':
                      return { icon: Users, color: 'bg-green-100', iconColor: 'text-green-600' };
                    case 'goal_completed':
                      return { icon: Target, color: 'bg-blue-100', iconColor: 'text-blue-600' };
                    case 'roadmap_created':
                      return { icon: Map, color: 'bg-purple-100', iconColor: 'text-purple-600' };
                    case 'step_completed':
                      return { icon: Activity, color: 'bg-orange-100', iconColor: 'text-orange-600' };
                    default:
                      return { icon: Activity, color: 'bg-gray-100', iconColor: 'text-gray-600' };
                  }
                };

                const { icon: Icon, color, iconColor } = getActivityIcon(activity.type);
                const isLast = index === stats.recentActivities.length - 1;

                return (
                  <div key={activity._id} className={`flex items-center justify-between py-3 ${!isLast ? 'border-b border-gray-200' : ''}`}>
                    <div className="flex items-center">
                      <div className={`${color} p-2 rounded-full mr-3`}>
                        <Icon className={`h-4 w-4 ${iconColor}`} />
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-900">{activity.title}</p>
                        <p className="text-xs text-gray-500">{activity.description}</p>
                      </div>
                    </div>
                    <span className="text-xs text-gray-500">
                      {new Date(activity.createdAt).toLocaleDateString('en-US', {
                        month: 'short',
                        day: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit'
                      })}
                    </span>
                  </div>
                );
              })
            ) : (
              <div className="text-center text-gray-500 py-8">
                <Activity className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                <p>No recent activity to display</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;