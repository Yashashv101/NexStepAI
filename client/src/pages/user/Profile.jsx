import React, { useState, useEffect } from 'react';
import { 
  User, 
  Mail, 
  Calendar, 
  Edit, 
  Save, 
  X,
  Shield,
  Target,
  Map,
  Award,
  AlertCircle
} from 'lucide-react';
import { getCurrentUser, updateCurrentUser, getUserDashboardStats, getUserActivities } from '../../services/api';
import cacheService from '../../services/cacheService';

const Profile = () => {
  const [user, setUser] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [editForm, setEditForm] = useState({
    name: '',
    email: ''
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [stats, setStats] = useState({
    goalsCompleted: 0,
    roadmapsInProgress: 0,
    totalLearningTime: 0
  });
  const [activities, setActivities] = useState([]);
  const [loadingStats, setLoadingStats] = useState(false);
  const [loadingActivities, setLoadingActivities] = useState(false);

  useEffect(() => {
    fetchUserProfile();
    fetchUserStats();
    fetchUserActivities();
  }, []);

  const fetchUserProfile = async () => {
    try {
      setLoading(true);
      setError('');
      const response = await getCurrentUser();
      
      if (response.success) {
        setUser(response.data);
        setEditForm({
          name: response.data.name,
          email: response.data.email
        });
      } else {
        setError('Failed to fetch user profile');
      }
    } catch (error) {
      console.error('Error fetching user profile:', error);
      setError('Error fetching user profile. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const fetchUserStats = async () => {
    try {
      setLoadingStats(true);
      
      // Try to get cached data first
      const cachedStats = cacheService.get('user-dashboard-stats');
      if (cachedStats) {
        setStats({
          goalsCompleted: cachedStats.completedGoals || 0,
          roadmapsInProgress: cachedStats.activeRoadmaps || 0,
          totalLearningTime: Math.round((cachedStats.weeklyLearningTime || 0) * 4) // Convert weekly to monthly estimate
        });
        setLoadingStats(false);
        return;
      }

      const response = await getUserDashboardStats();
      
      if (response.success) {
        const data = response.data;
        setStats({
          goalsCompleted: data.completedGoals || 0,
          roadmapsInProgress: data.activeRoadmaps || 0,
          totalLearningTime: Math.round((data.weeklyLearningTime || 0) * 4) // Convert weekly to monthly estimate
        });
        
        // Cache the stats data
        cacheService.set('user-dashboard-stats', data, 5 * 60 * 1000); // 5 minutes TTL
      } else {
        console.error('Failed to fetch user stats:', response.message);
        // Keep default values on error
      }
    } catch (error) {
      console.error('Error fetching user stats:', error);
      // Keep default values on error
    } finally {
      setLoadingStats(false);
    }
  };

  const fetchUserActivities = async () => {
    try {
      setLoadingActivities(true);
      
      // Try to get cached data first
      const cachedActivities = cacheService.get('user-activities');
      if (cachedActivities) {
        setActivities(cachedActivities.slice(0, 3)); // Show only recent 3 activities
        setLoadingActivities(false);
        return;
      }

      const response = await getUserActivities();
      
      if (response.success) {
        const activities = response.data || [];
        setActivities(activities.slice(0, 3)); // Show only recent 3 activities
        
        // Cache the activities data
        cacheService.set('user-activities', activities, 2 * 60 * 1000); // 2 minutes TTL
      } else {
        console.error('Failed to fetch user activities:', response.message);
        setActivities([]);
      }
    } catch (error) {
      console.error('Error fetching user activities:', error);
      setActivities([]);
    } finally {
      setLoadingActivities(false);
    }
  };

  const handleEditToggle = () => {
    if (isEditing) {
      // Reset form if canceling
      setEditForm({
        name: user.name,
        email: user.email
      });
    }
    setIsEditing(!isEditing);
  };

  const handleSaveProfile = async (e) => {
    e.preventDefault();
    try {
      setError('');
      const response = await updateCurrentUser({
        name: editForm.name,
        email: editForm.email
      });
      
      if (response.success) {
        setUser(response.data);
        setIsEditing(false);
        
        // Invalidate relevant caches
        cacheService.delete('current-user');
        cacheService.delete('user-dashboard-stats');
        
        // Show success message (you might want to use a toast notification)
        alert('Profile updated successfully!');
      } else {
        setError('Failed to update profile');
      }
    } catch (error) {
      console.error('Error updating profile:', error);
      setError('Error updating profile. Please try again.');
    }
  };

  const StatCard = ({ icon: Icon, title, value, color }) => (
    <div className="bg-white rounded-lg shadow-md p-6">
      <div className="flex items-center">
        <div className={`p-3 rounded-full ${color} mr-4`}>
          <Icon className="h-6 w-6 text-white" />
        </div>
        <div>
          <p className="text-2xl font-bold text-gray-900">{value}</p>
          <p className="text-sm text-gray-600">{title}</p>
        </div>
      </div>
    </div>
  );

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading profile...</p>
        </div>
      </div>
    );
  }

  if (error && !user) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <AlertCircle className="mx-auto h-12 w-12 text-red-400" />
          <h3 className="mt-2 text-sm font-medium text-gray-900">Error Loading Profile</h3>
          <p className="mt-1 text-sm text-gray-500">{error}</p>
          <button
            onClick={fetchUserProfile}
            className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <User className="mx-auto h-12 w-12 text-gray-400" />
          <h3 className="mt-2 text-sm font-medium text-gray-900">Profile not found</h3>
          <p className="mt-1 text-sm text-gray-500">Unable to load user profile.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">My Profile</h1>
          <p className="text-gray-600 mt-2">Manage your account information and view your progress</p>
        </div>

        {/* Error Message */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-md p-4 mb-6">
            <div className="flex">
              <AlertCircle className="h-5 w-5 text-red-400" />
              <div className="ml-3">
                <p className="text-sm text-red-800">{error}</p>
              </div>
            </div>
          </div>
        )}

        {/* Profile Card */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <div className="flex justify-between items-start mb-6">
            <div className="flex items-center">
              <div className="h-20 w-20 rounded-full bg-blue-500 flex items-center justify-center mr-6">
                <span className="text-white text-2xl font-bold">
                  {user.name.charAt(0).toUpperCase()}
                </span>
              </div>
              <div>
                <h2 className="text-2xl font-bold text-gray-900">{user.name}</h2>
                <div className="flex items-center text-gray-600 mt-1">
                  <Shield className="h-4 w-4 mr-1" />
                  <span className="capitalize">{user.role}</span>
                </div>
              </div>
            </div>
            <button
              onClick={handleEditToggle}
              className="flex items-center px-4 py-2 text-blue-600 hover:text-blue-800 border border-blue-600 hover:border-blue-800 rounded-lg transition-colors"
            >
              {isEditing ? (
                <>
                  <X className="h-4 w-4 mr-2" />
                  Cancel
                </>
              ) : (
                <>
                  <Edit className="h-4 w-4 mr-2" />
                  Edit Profile
                </>
              )}
            </button>
          </div>

          {isEditing ? (
            <form onSubmit={handleSaveProfile} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Full Name
                </label>
                <input
                  type="text"
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  value={editForm.name}
                  onChange={(e) => setEditForm({...editForm, name: e.target.value})}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Email Address
                </label>
                <input
                  type="email"
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  value={editForm.email}
                  onChange={(e) => setEditForm({...editForm, email: e.target.value})}
                />
              </div>
              <div className="flex justify-end">
                <button
                  type="submit"
                  className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                >
                  <Save className="h-4 w-4 mr-2" />
                  Save Changes
                </button>
              </div>
            </form>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Email Address
                </label>
                <div className="flex items-center text-gray-900">
                  <Mail className="h-4 w-4 mr-2 text-gray-400" />
                  {user.email}
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Member Since
                </label>
                <div className="flex items-center text-gray-900">
                  <Calendar className="h-4 w-4 mr-2 text-gray-400" />
                  {new Date(user.createdAt).toLocaleDateString('en-US', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric'
                  })}
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Last Active
                </label>
                <div className="flex items-center text-gray-900">
                  <Calendar className="h-4 w-4 mr-2 text-gray-400" />
                  {new Date(user.lastActive).toLocaleDateString('en-US', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric'
                  })}
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Account Type
                </label>
                <div className="flex items-center text-gray-900">
                  <Shield className="h-4 w-4 mr-2 text-gray-400" />
                  <span className="capitalize">{user.role} Account</span>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Statistics */}
        <div className="mb-6">
          <h3 className="text-xl font-semibold text-gray-900 mb-4">Your Progress</h3>
          {loadingStats ? (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {[1, 2, 3].map((i) => (
                <div key={i} className="bg-white rounded-lg shadow-md p-6">
                  <div className="flex items-center">
                    <div className="p-3 rounded-full bg-gray-200 mr-4 animate-pulse">
                      <div className="h-6 w-6 bg-gray-300 rounded"></div>
                    </div>
                    <div>
                      <div className="h-8 w-16 bg-gray-200 rounded animate-pulse mb-2"></div>
                      <div className="h-4 w-24 bg-gray-200 rounded animate-pulse"></div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <StatCard
                icon={Award}
                title="Goals Completed"
                value={stats.goalsCompleted}
                color="bg-green-500"
              />
              <StatCard
                icon={Map}
                title="Roadmaps in Progress"
                value={stats.roadmapsInProgress}
                color="bg-blue-500"
              />
              <StatCard
                icon={Target}
                title="Learning Hours"
                value={`${stats.totalLearningTime}h`}
                color="bg-purple-500"
              />
            </div>
          )}
        </div>

        {/* Recent Activity */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <h3 className="text-xl font-semibold text-gray-900 mb-4">Recent Activity</h3>
          {loadingActivities ? (
            <div className="space-y-4">
              {[1, 2, 3].map((i) => (
                <div key={i} className="flex items-center justify-between py-3 border-b border-gray-200">
                  <div className="flex items-center">
                    <div className="bg-gray-200 p-2 rounded-full mr-3 animate-pulse">
                      <div className="h-4 w-4 bg-gray-300 rounded"></div>
                    </div>
                    <div>
                      <div className="h-4 w-32 bg-gray-200 rounded animate-pulse mb-1"></div>
                      <div className="h-3 w-24 bg-gray-200 rounded animate-pulse"></div>
                    </div>
                  </div>
                  <div className="h-3 w-16 bg-gray-200 rounded animate-pulse"></div>
                </div>
              ))}
            </div>
          ) : activities.length > 0 ? (
            <div className="space-y-4">
              {activities.map((activity, index) => {
                const getActivityIcon = (type) => {
                  switch (type) {
                    case 'step_completed':
                      return { icon: Award, bgColor: 'bg-green-100', iconColor: 'text-green-600' };
                    case 'roadmap_started':
                      return { icon: Map, bgColor: 'bg-blue-100', iconColor: 'text-blue-600' };
                    case 'goal_set':
                      return { icon: Target, bgColor: 'bg-purple-100', iconColor: 'text-purple-600' };
                    default:
                      return { icon: Award, bgColor: 'bg-gray-100', iconColor: 'text-gray-600' };
                  }
                };

                const { icon: ActivityIcon, bgColor, iconColor } = getActivityIcon(activity.type);
                const timeAgo = new Date(activity.timestamp).toLocaleDateString('en-US', {
                  month: 'short',
                  day: 'numeric'
                });

                return (
                  <div key={activity._id || index} className="flex items-center justify-between py-3 border-b border-gray-200 last:border-b-0">
                    <div className="flex items-center">
                      <div className={`${bgColor} p-2 rounded-full mr-3`}>
                        <ActivityIcon className={`h-4 w-4 ${iconColor}`} />
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-900">{activity.description}</p>
                        {activity.details && (
                          <p className="text-xs text-gray-500">{activity.details}</p>
                        )}
                      </div>
                    </div>
                    <span className="text-xs text-gray-500">{timeAgo}</span>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="text-center py-8">
              <Award className="mx-auto h-12 w-12 text-gray-400" />
              <h3 className="mt-2 text-sm font-medium text-gray-900">No recent activity</h3>
              <p className="mt-1 text-sm text-gray-500">Start learning to see your activity here!</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Profile;