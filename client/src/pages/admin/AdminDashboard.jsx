import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { 
  Users, 
  Target, 
  Map, 
  BookOpen, 
  TrendingUp, 
  Activity,
  Plus,
  Eye
} from 'lucide-react';

const AdminDashboard = () => {
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalGoals: 0,
    totalRoadmaps: 0,
    activeUsers: 0
  });

  useEffect(() => {
    // TODO: Fetch actual stats from API
    setStats({
      totalUsers: 156,
      totalGoals: 42,
      totalRoadmaps: 38,
      activeUsers: 89
    });
  }, []);

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
          <StatCard
            icon={Activity}
            title="Active Users"
            value={stats.activeUsers}
            color="bg-orange-500"
          />
        </div>

        {/* Quick Actions */}
        <div className="mb-8">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Quick Actions</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <QuickAction
              icon={Plus}
              title="Create New Goal"
              description="Add a new career goal to the platform"
              link="/admin/goals/create"
              color="bg-green-500"
            />
            <QuickAction
              icon={Plus}
              title="Create New Roadmap"
              description="Design a new learning roadmap"
              link="/admin/roadmaps/create"
              color="bg-purple-500"
            />
            <QuickAction
              icon={Users}
              title="Manage Users"
              description="View and manage user accounts"
              link="/admin/users"
              color="bg-blue-500"
            />
          </div>
        </div>

        {/* Recent Activity */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Recent Activity</h2>
          <div className="space-y-4">
            <div className="flex items-center justify-between py-3 border-b border-gray-200">
              <div className="flex items-center">
                <div className="bg-green-100 p-2 rounded-full mr-3">
                  <Users className="h-4 w-4 text-green-600" />
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-900">New user registered</p>
                  <p className="text-xs text-gray-500">john.doe@example.com</p>
                </div>
              </div>
              <span className="text-xs text-gray-500">2 hours ago</span>
            </div>
            <div className="flex items-center justify-between py-3 border-b border-gray-200">
              <div className="flex items-center">
                <div className="bg-blue-100 p-2 rounded-full mr-3">
                  <Target className="h-4 w-4 text-blue-600" />
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-900">Goal completed</p>
                  <p className="text-xs text-gray-500">Full Stack Developer path</p>
                </div>
              </div>
              <span className="text-xs text-gray-500">5 hours ago</span>
            </div>
            <div className="flex items-center justify-between py-3">
              <div className="flex items-center">
                <div className="bg-purple-100 p-2 rounded-full mr-3">
                  <Map className="h-4 w-4 text-purple-600" />
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-900">New roadmap created</p>
                  <p className="text-xs text-gray-500">React Developer Roadmap</p>
                </div>
              </div>
              <span className="text-xs text-gray-500">1 day ago</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;