import React, { useState, useEffect } from 'react';
import { adminService, type AnalyticsData } from '../../services/admin';
import { Layout } from '../../components/Layout/Layout';
import { Button } from '../../components/UI/Button';
import { Select } from '../../components/UI/Select';
import { 
  TrendingUp, Users, DollarSign, CheckCircle, 
  Calendar, Download, RefreshCw 
} from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import toast from 'react-hot-toast';

const TIME_PERIODS = [
  { value: '7', label: 'Last 7 days' },
  { value: '30', label: 'Last 30 days' },
  { value: '90', label: 'Last 90 days' },
  { value: '365', label: 'Last year' },
];

export const AdminAnalytics: React.FC = () => {
  const [analytics, setAnalytics] = useState<AnalyticsData[]>([]);
  const [categoryData, setCategoryData] = useState<Array<{ category: string; count: number; revenue: number }>>([]);
  const [userGrowth, setUserGrowth] = useState<Array<{ date: string; count: number }>>([]);
  const [timePeriod, setTimePeriod] = useState('30');
  const [loading, setLoading] = useState(true);

  const fetchAnalytics = async () => {
    try {
      setLoading(true);
      const [analyticsData, categories, growth] = await Promise.all([
        adminService.getAnalytics(parseInt(timePeriod)),
        adminService.getCategoryAnalytics(),
        adminService.getUserGrowthData(parseInt(timePeriod))
      ]);

      setAnalytics(analyticsData);
      setCategoryData(categories);
      setUserGrowth(growth);
    } catch (error: any) {
      toast.error('Failed to load analytics data');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAnalytics();
  }, [timePeriod]);

  const handleExportData = () => {
    const csvData = analytics.map(row => ({
      Date: row.date,
      'Total Users': row.total_users,
      'New Users': row.new_users,
      'Active Users': row.active_users,
      'Total Tasks': row.total_tasks,
      'New Tasks': row.new_tasks,
      'Completed Tasks': row.completed_tasks,
      'Total Revenue': row.total_revenue,
      'Average Task Value': row.average_task_value,
    }));

    const csv = [
      Object.keys(csvData[0]).join(','),
      ...csvData.map(row => Object.values(row).join(','))
    ].join('\n');

    const blob = new Blob([csv], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `errands-runner-analytics-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  if (loading) {
    return (
      <Layout>
        <div className="max-w-7xl mx-auto px-4 py-8">
          <div className="animate-pulse space-y-6">
            <div className="h-8 bg-gray-200 rounded w-64"></div>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="bg-white rounded-lg shadow-sm h-64"></div>
              ))}
            </div>
          </div>
        </div>
      </Layout>
    );
  }

  const latestData = analytics[0];
  const previousData = analytics[1];

  const calculateChange = (current: number, previous: number) => {
    if (!previous) return 0;
    return ((current - previous) / previous) * 100;
  };

  return (
    <Layout>
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Analytics Dashboard</h1>
            <p className="text-gray-600 mt-1">
              Detailed insights into platform performance and user behavior
            </p>
          </div>
          <div className="flex space-x-4">
            <Select
              value={timePeriod}
              onChange={(e) => setTimePeriod(e.target.value)}
              options={TIME_PERIODS}
            />
            <Button
              variant="outline"
              icon={RefreshCw}
              onClick={fetchAnalytics}
            >
              Refresh
            </Button>
            <Button
              variant="outline"
              icon={Download}
              onClick={handleExportData}
            >
              Export CSV
            </Button>
          </div>
        </div>

        {/* Key Metrics */}
        {latestData && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <div className="bg-white rounded-lg shadow-sm p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Total Users</p>
                  <p className="text-2xl font-bold text-gray-900">{latestData.total_users}</p>
                </div>
                <div className="p-2 bg-blue-100 rounded-lg">
                  <Users className="h-6 w-6 text-blue-600" />
                </div>
              </div>
              {previousData && (
                <div className="mt-2">
                  <span className={`text-sm ${
                    calculateChange(latestData.new_users, previousData.new_users) >= 0 
                      ? 'text-green-600' : 'text-red-600'
                  }`}>
                    {calculateChange(latestData.new_users, previousData.new_users) >= 0 ? '+' : ''}
                    {calculateChange(latestData.new_users, previousData.new_users).toFixed(1)}%
                  </span>
                  <span className="text-sm text-gray-500 ml-1">vs previous period</span>
                </div>
              )}
            </div>

            <div className="bg-white rounded-lg shadow-sm p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Active Users</p>
                  <p className="text-2xl font-bold text-gray-900">{latestData.active_users}</p>
                </div>
                <div className="p-2 bg-green-100 rounded-lg">
                  <TrendingUp className="h-6 w-6 text-green-600" />
                </div>
              </div>
              {previousData && (
                <div className="mt-2">
                  <span className={`text-sm ${
                    calculateChange(latestData.active_users, previousData.active_users) >= 0 
                      ? 'text-green-600' : 'text-red-600'
                  }`}>
                    {calculateChange(latestData.active_users, previousData.active_users) >= 0 ? '+' : ''}
                    {calculateChange(latestData.active_users, previousData.active_users).toFixed(1)}%
                  </span>
                  <span className="text-sm text-gray-500 ml-1">vs previous period</span>
                </div>
              )}
            </div>

            <div className="bg-white rounded-lg shadow-sm p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Completed Tasks</p>
                  <p className="text-2xl font-bold text-gray-900">{latestData.completed_tasks}</p>
                </div>
                <div className="p-2 bg-yellow-100 rounded-lg">
                  <CheckCircle className="h-6 w-6 text-yellow-600" />
                </div>
              </div>
              {previousData && (
                <div className="mt-2">
                  <span className={`text-sm ${
                    calculateChange(latestData.completed_tasks, previousData.completed_tasks) >= 0 
                      ? 'text-green-600' : 'text-red-600'
                  }`}>
                    {calculateChange(latestData.completed_tasks, previousData.completed_tasks) >= 0 ? '+' : ''}
                    {calculateChange(latestData.completed_tasks, previousData.completed_tasks).toFixed(1)}%
                  </span>
                  <span className="text-sm text-gray-500 ml-1">vs previous period</span>
                </div>
              )}
            </div>

            <div className="bg-white rounded-lg shadow-sm p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Total Revenue</p>
                  <p className="text-2xl font-bold text-gray-900">${latestData.total_revenue}</p>
                </div>
                <div className="p-2 bg-purple-100 rounded-lg">
                  <DollarSign className="h-6 w-6 text-purple-600" />
                </div>
              </div>
              {previousData && (
                <div className="mt-2">
                  <span className={`text-sm ${
                    calculateChange(latestData.total_revenue, previousData.total_revenue) >= 0 
                      ? 'text-green-600' : 'text-red-600'
                  }`}>
                    {calculateChange(latestData.total_revenue, previousData.total_revenue) >= 0 ? '+' : ''}
                    {calculateChange(latestData.total_revenue, previousData.total_revenue).toFixed(1)}%
                  </span>
                  <span className="text-sm text-gray-500 ml-1">vs previous period</span>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Charts and Data */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          {/* User Growth Chart */}
          <div className="bg-white rounded-lg shadow-sm p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">User Growth</h3>
            <div className="space-y-2">
              {userGrowth.slice(0, 10).map((item, index) => (
                <div key={index} className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">{item.date}</span>
                  <span className="font-medium">{item.count} new users</span>
                </div>
              ))}
            </div>
          </div>

          {/* Category Performance */}
          <div className="bg-white rounded-lg shadow-sm p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Category Performance</h3>
            <div className="space-y-3">
              {categoryData.map((category, index) => (
                <div key={index} className="flex justify-between items-center">
                  <div>
                    <p className="font-medium capitalize">{category.category}</p>
                    <p className="text-sm text-gray-600">{category.count} tasks</p>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold text-green-600">${category.revenue}</p>
                    <p className="text-sm text-gray-600">
                      ${(category.revenue / category.count).toFixed(2)} avg
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Analytics Table */}
        <div className="bg-white rounded-lg shadow-sm overflow-hidden">
          <div className="px-6 py-4 border-b">
            <h3 className="text-lg font-semibold text-gray-900">Daily Analytics</h3>
          </div>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Date
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    New Users
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Active Users
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    New Tasks
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Completed
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Revenue
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Avg Task Value
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {analytics.map((row, index) => (
                  <tr key={index} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {row.date}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {row.new_users}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {row.active_users}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {row.new_tasks}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {row.completed_tasks}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      ${row.total_revenue}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      ${row.average_task_value}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </Layout>
  );
};