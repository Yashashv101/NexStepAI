import React, { useState, useEffect } from 'react';
import { 
  BarChart3, 
  TrendingUp, 
  Users, 
  Target, 
  Map, 
  Clock,
  Award,
  Activity,
  Loader
} from 'lucide-react';
import { getAnalyticsDashboard } from '../../services/api';

const Analytics = () => {
  const [analyticsData, setAnalyticsData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [timeRange, setTimeRange] = useState('30d');

  useEffect(() => {
    fetchAnalyticsData();
  }, [timeRange]);

  const fetchAnalyticsData = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await getAnalyticsDashboard(timeRange);
      setAnalyticsData(response.data);
    } catch (err) {
      console.error('Error fetching analytics data:', err);
      setError('Failed to load analytics data. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const StatCard = ({ title, value, icon: Icon, trend, trendValue, color = "blue" }) => (
    <div className="bg-white rounded-lg shadow-md p-6">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-gray-600">{title}</p>
          <p className="text-3xl font-bold text-gray-900">{value}</p>
          {trend && trendValue !== undefined && (
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

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex items-center justify-center h-64">
          <Loader className="h-8 w-8 animate-spin text-blue-600" />
          <span className="ml-2 text-gray-600">Loading analytics data...</span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
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
                onClick={fetchAnalyticsData}
                className="mt-2 text-sm text-red-800 underline hover:text-red-900"
              >
                Try again
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

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
          value={analyticsData?.totalUsers?.toLocaleString() || '0'}
          icon={Users}
          trend="up"
          trendValue={analyticsData?.userGrowth}
          color="blue"
        />
        <StatCard
          title="Active Users"
          value={analyticsData?.activeUsers?.toLocaleString() || '0'}
          icon={Activity}
          trend="up"
          trendValue="8.2"
          color="green"
        />
        <StatCard
          title="Goals Completed"
          value={analyticsData?.completedGoals || '0'}
          icon={Target}
          trend="up"
          trendValue="15.3"
          color="purple"
        />
        <StatCard
          title="Active Roadmaps"
          value={analyticsData?.activeRoadmaps || '0'}
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
            {analyticsData?.userGrowthData?.map((data, index) => {
              const maxUsers = Math.max(...(analyticsData?.userGrowthData?.map(d => d.users) || [1]));
              return (
                <div key={data.month} className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">{data.month}</span>
                  <div className="flex items-center space-x-3">
                    <div className="w-32 bg-gray-200 rounded-full h-2">
                      <div 
                        className="bg-blue-600 h-2 rounded-full" 
                        style={{ width: `${(data.users / maxUsers) * 100}%` }}
                      ></div>
                    </div>
                    <span className="text-sm font-medium text-gray-900 w-12 text-right">
                      {data.users}
                    </span>
                  </div>
                </div>
              );
            }) || (
              <div className="text-center text-gray-500 py-8">
                No user growth data available
              </div>
            )}
          </div>
        </div>

        {/* Goal Completion by Category */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Goal Completion by Category</h3>
          <div className="space-y-4">
            {analyticsData?.goalCompletionData?.map((data, index) => (
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
                    style={{ width: `${data.total > 0 ? (data.completed / data.total) * 100 : 0}%` }}
                  ></div>
                </div>
                <div className="text-xs text-gray-500 mt-1">
                  {data.total > 0 ? Math.round((data.completed / data.total) * 100) : 0}% completion rate
                </div>
              </div>
            )) || (
              <div className="text-center text-gray-500 py-8">
                No goal completion data available
              </div>
            )}
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
            {analyticsData?.totalGoals > 0 
              ? Math.round((analyticsData.completedGoals / analyticsData.totalGoals) * 100)
              : 0
            }%
          </p>
          <p className="text-sm text-gray-600 mt-2">Goal completion rate</p>
        </div>

        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900">Engagement Score</h3>
            <BarChart3 className="h-6 w-6 text-purple-600" />
          </div>
          <p className="text-3xl font-bold text-gray-900">
            {analyticsData?.engagementScore || '0'}/10
          </p>
          <p className="text-sm text-gray-600 mt-2">User satisfaction rating</p>
        </div>
      </div>
    </div>
  );
};

export default Analytics;