import React, { useState, useEffect } from 'react';
import { adminService, type AdminStats, type DashboardStats } from '../../services/admin';
import { Layout } from '../../components/Layout/Layout';
import { Button } from '../../components/UI/Button';
import { 
  Users, DollarSign, CheckCircle, 
  MessageCircle,  Activity, RefreshCw, Settings,
  BarChart3, AlertTriangle
} from 'lucide-react';
import toast from 'react-hot-toast';

export const AdminDashboard: React.FC = () => {
  const [stats, setStats] = useState<AdminStats | null>(null);
  const [dashboardStats, setDashboardStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchData = async () => {
    try {
      const [adminStats, dashStats] = await Promise.all([
        adminService.getAdminStatistics(),
        adminService.getDashboardStats()
      ]);
      
      setStats(adminStats);
      setDashboardStats(dashStats);
    } catch (error: any) {
      toast.error('Failed to load admin data');
      console.error(error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await adminService.calculateDailyAnalytics();
    await fetchData();
    toast.success('Data refreshed successfully');
  };

  useEffect(() => {
    fetchData();
  }, []);

  if (loading) {
    return (
      <Layout>
        <div className="max-w-7xl mx-auto px-4 py-8">
          <div className="animate-pulse space-y-6">
            <div className="h-8 bg-gray-200 rounded w-64"></div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {[...Array(8)].map((_, i) => (
                <div key={i} className="bg-white rounded-lg shadow-sm h-32"></div>
              ))}
            </div>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Admin Dashboard</h1>
            <p className="text-gray-600 mt-1">
              Monitor and manage your Errands Runner platform
            </p>
          </div>
          <div className="flex space-x-4">
            <Button
              variant="outline"
              icon={RefreshCw}
              onClick={handleRefresh}
              loading={refreshing}
            >
              Refresh Data
            </Button>
            <Button
              variant="outline"
              icon={Settings}
            >
              Settings
            </Button>
          </div>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="flex items-center">
              <div className="p-2 bg-blue-100 rounded-lg">
                <Users className="h-6 w-6 text-blue-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Total Users</p>
                <p className="text-2xl font-bold text-gray-900">
                  {stats?.overview.total_users || 0}
                </p>
                <p className="text-xs text-green-600">
                  +{stats?.overview.new_users_this_month || 0} this month
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="flex items-center">
              <div className="p-2 bg-green-100 rounded-lg">
                <CheckCircle className="h-6 w-6 text-green-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Completed Tasks</p>
                <p className="text-2xl font-bold text-gray-900">
                  {stats?.tasks.completed_tasks || 0}
                </p>
                <p className="text-xs text-blue-600">
                  {stats?.tasks.completion_rate || 0}% completion rate
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="flex items-center">
              <div className="p-2 bg-yellow-100 rounded-lg">
                <DollarSign className="h-6 w-6 text-yellow-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Total Revenue</p>
                <p className="text-2xl font-bold text-gray-900">
                  ${stats?.revenue.total_revenue || 0}
                </p>
                <p className="text-xs text-green-600">
                  ${stats?.revenue.average_task_value || 0} avg task
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="flex items-center">
              <div className="p-2 bg-purple-100 rounded-lg">
                <Activity className="h-6 w-6 text-purple-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Daily Active Users</p>
                <p className="text-2xl font-bold text-gray-900">
                  {stats?.activity.daily_active_users || 0}
                </p>
                <p className="text-xs text-blue-600">
                  {dashboardStats?.messages_today || 0} messages today
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Detailed Stats */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          {/* Task Statistics */}
          <div className="bg-white rounded-lg shadow-sm p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Task Statistics</h3>
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-gray-600">Total Tasks</span>
                <span className="font-semibold">{stats?.tasks.total_tasks || 0}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-600">Active Tasks</span>
                <span className="font-semibold text-orange-600">
                  {stats?.tasks.active_tasks || 0}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-600">Completed Tasks</span>
                <span className="font-semibold text-green-600">
                  {stats?.tasks.completed_tasks || 0}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-600">Completion Rate</span>
                <span className="font-semibold">
                  {stats?.tasks.completion_rate || 0}%
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-600">New Tasks Today</span>
                <span className="font-semibold text-blue-600">
                  {dashboardStats?.new_tasks_today || 0}
                </span>
              </div>
            </div>
          </div>

          {/* User Statistics */}
          <div className="bg-white rounded-lg shadow-sm p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">User Statistics</h3>
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-gray-600">Total Users</span>
                <span className="font-semibold">{stats?.overview.total_users || 0}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-600">Total Runners</span>
                <span className="font-semibold text-blue-600">
                  {stats?.overview.total_runners || 0}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-600">New Users Today</span>
                <span className="font-semibold text-green-600">
                  {dashboardStats?.new_users_today || 0}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-600">New Users This Month</span>
                <span className="font-semibold">
                  {stats?.overview.new_users_this_month || 0}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-600">Daily Active Users</span>
                <span className="font-semibold text-purple-600">
                  {stats?.activity.daily_active_users || 0}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Activity Overview */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Revenue Stats */}
          <div className="bg-white rounded-lg shadow-sm p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
              <DollarSign className="h-5 w-5 mr-2 text-green-600" />
              Revenue Overview
            </h3>
            <div className="space-y-3">
              <div>
                <p className="text-sm text-gray-600">Total Revenue</p>
                <p className="text-xl font-bold text-green-600">
                  ${stats?.revenue.total_revenue || 0}
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Average Task Value</p>
                <p className="text-lg font-semibold">
                  ${stats?.revenue.average_task_value || 0}
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Revenue This Month</p>
                <p className="text-lg font-semibold text-blue-600">
                  ${stats?.revenue.revenue_this_month || 0}
                </p>
              </div>
            </div>
          </div>

          {/* Activity Stats */}
          <div className="bg-white rounded-lg shadow-sm p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
              <MessageCircle className="h-5 w-5 mr-2 text-blue-600" />
              Platform Activity
            </h3>
            <div className="space-y-3">
              <div>
                <p className="text-sm text-gray-600">Total Bids</p>
                <p className="text-xl font-bold text-blue-600">
                  {stats?.activity.total_bids || 0}
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Total Messages</p>
                <p className="text-lg font-semibold">
                  {stats?.activity.total_messages || 0}
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Messages Today</p>
                <p className="text-lg font-semibold text-green-600">
                  {dashboardStats?.messages_today || 0}
                </p>
              </div>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="bg-white rounded-lg shadow-sm p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
              <Settings className="h-5 w-5 mr-2 text-gray-600" />
              Quick Actions
            </h3>
            <div className="space-y-3">
              <Button
                variant="outline"
                size="sm"
                className="w-full justify-start"
                icon={BarChart3}
              >
                View Analytics
              </Button>
              <Button
                variant="outline"
                size="sm"
                className="w-full justify-start"
                icon={Users}
              >
                Manage Users
              </Button>
              <Button
                variant="outline"
                size="sm"
                className="w-full justify-start"
                icon={AlertTriangle}
              >
                System Logs
              </Button>
              <Button
                variant="outline"
                size="sm"
                className="w-full justify-start"
                icon={Settings}
              >
                App Settings
              </Button>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default AdminDashboard;