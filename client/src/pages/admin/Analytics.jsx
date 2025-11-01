import React, { useState, useEffect } from 'react';
import { 
  BarChart3, 
  TrendingUp, 
  Users, 
  Target, 
  Map, 
  Clock,
  Award,
  Activity
} from 'lucide-react';

const Analytics = () => {
  const [analyticsData, setAnalyticsData] = useState({
    totalUsers: 1247,
    activeUsers: 892,
    totalGoals: 156,
    completedGoals: 89,
    totalRoadmaps: 45,
    activeRoadmaps: 32,
    avgCompletionTime: 28,
    userGrowth: 12.5
  });

  const [timeRange, setTimeRange] = useState('30d');

  // Mock data for charts
  const userGrowthData = [
    { month: 'Jan', users: 850 },
    { month: 'Feb', users: 920 },
    { month: 'Mar', users: 1050 },
    { month: 'Apr', users: 1180 },
    { month: 'May', users: 1247 }
  ];

  const goalCompletionData = [
    { category: 'Frontend Development', completed: 25, total: 40 },
    { category: 'Backend Development', completed: 18, total: 30 },
    { category: 'Data Science', completed: 22, total: 35 },
    { category: 'DevOps', completed: 12, total: 25 },
    { category: 'Mobile Development', completed: 12, total: 26 }
  ];

  const StatCard = ({ title, value, icon: Icon, trend, trendValue, color = "blue" }) => (
    <div className="bg-white rounded-lg shadow-md p-6">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-gray-600">{title}</p>
          <p className="text-3xl font-bold text-gray-900">{value}</p>
          {trend && (
            <div className={`flex items-center mt-2 text-sm ${
              trend === 'up' ? 'text-green-600' : 'text-red-600'
            }`}>
              <TrendingUp className={`h-4 w-4 mr-1 ${trend === 'down' ? 'rotate-180' : ''}`} />
              {trendValue}% from last month
            </div>
          )}
        </div>
        <div className={`p-3 rounded-full bg-${color}-100`}>
          <Icon className={`h-8 w-8 text-${color}-600`} />
        </div>
      </div>
    </div>
  );

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Analytics Dashboard</h1>
        <p className="mt-2 text-gray-600">
          Monitor system performance and user engagement metrics
        </p>
      </div>

      {/* Time Range Selector */}
      <div className="mb-6">
        <div className="flex space-x-2">
          {['7d', '30d', '90d', '1y'].map((range) => (
            <button
              key={range}
              onClick={() => setTimeRange(range)}
              className={`px-4 py-2 rounded-lg text-sm font-medium ${
                timeRange === range
                  ? 'bg-blue-600 text-white'
                  : 'bg-white text-gray-700 hover:bg-gray-50 border border-gray-300'
              }`}
            >
              {range === '7d' ? '7 Days' : 
               range === '30d' ? '30 Days' : 
               range === '90d' ? '90 Days' : '1 Year'}
            </button>
          ))}
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <StatCard
          title="Total Users"
          value={analyticsData.totalUsers.toLocaleString()}
          icon={Users}
          trend="up"
          trendValue={analyticsData.userGrowth}
          color="blue"
        />
        <StatCard
          title="Active Users"
          value={analyticsData.activeUsers.toLocaleString()}
          icon={Activity}
          trend="up"
          trendValue="8.2"
          color="green"
        />
        <StatCard
          title="Goals Completed"
          value={analyticsData.completedGoals}
          icon={Target}
          trend="up"
          trendValue="15.3"
          color="purple"
        />
        <StatCard
          title="Active Roadmaps"
          value={analyticsData.activeRoadmaps}
          icon={Map}
          trend="up"
          trendValue="6.7"
          color="orange"
        />
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
        {/* User Growth Chart */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">User Growth</h3>
          <div className="space-y-4">
            {userGrowthData.map((data, index) => (
              <div key={data.month} className="flex items-center justify-between">
                <span className="text-sm text-gray-600">{data.month}</span>
                <div className="flex items-center space-x-3">
                  <div className="w-32 bg-gray-200 rounded-full h-2">
                    <div 
                      className="bg-blue-600 h-2 rounded-full" 
                      style={{ width: `${(data.users / 1300) * 100}%` }}
                    ></div>
                  </div>
                  <span className="text-sm font-medium text-gray-900 w-12 text-right">
                    {data.users}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Goal Completion by Category */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Goal Completion by Category</h3>
          <div className="space-y-4">
            {goalCompletionData.map((data, index) => (
              <div key={data.category}>
                <div className="flex justify-between items-center mb-1">
                  <span className="text-sm text-gray-600">{data.category}</span>
                  <span className="text-sm font-medium text-gray-900">
                    {data.completed}/{data.total}
                  </span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div 
                    className="bg-green-600 h-2 rounded-full" 
                    style={{ width: `${(data.completed / data.total) * 100}%` }}
                  ></div>
                </div>
                <div className="text-xs text-gray-500 mt-1">
                  {Math.round((data.completed / data.total) * 100)}% completion rate
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Additional Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900">Average Completion Time</h3>
            <Clock className="h-6 w-6 text-blue-600" />
          </div>
          <p className="text-3xl font-bold text-gray-900">{analyticsData.avgCompletionTime} days</p>
          <p className="text-sm text-gray-600 mt-2">Per learning roadmap</p>
        </div>

        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900">Success Rate</h3>
            <Award className="h-6 w-6 text-green-600" />
          </div>
          <p className="text-3xl font-bold text-gray-900">
            {Math.round((analyticsData.completedGoals / analyticsData.totalGoals) * 100)}%
          </p>
          <p className="text-sm text-gray-600 mt-2">Goal completion rate</p>
        </div>

        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900">Engagement Score</h3>
            <BarChart3 className="h-6 w-6 text-purple-600" />
          </div>
          <p className="text-3xl font-bold text-gray-900">8.7/10</p>
          <p className="text-sm text-gray-600 mt-2">User satisfaction rating</p>
        </div>
      </div>
    </div>
  );
};

export default Analytics;