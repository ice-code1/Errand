import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { taskService } from '../../services/tasks';
import { useAuth } from '../../contexts/AuthContext';
import { Layout } from '../../components/Layout/Layout';
import { TaskCard } from '../../components/Tasks/TaskCard';
import { Button } from '../../components/UI/Button';
import { 
  Plus, CheckCircle, Clock, DollarSign, User, 
  TrendingUp, MapPin, MessageCircle 
} from 'lucide-react';
import toast from 'react-hot-toast';
import Link from "next/link"


export const DashboardPage: React.FC = () => {
  const [myTasks, setMyTasks] = useState<any[]>([]);
  const [availableTasks, setAvailableTasks] = useState<any[]>([]);
  const [stats, setStats] = useState({
    totalEarnings: 0,
    completedTasks: 0,
    activeTasks: 0,
    availableCount: 0,
  });
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();
  const navigate = useNavigate();

  const fetchDashboardData = async () => {
    if (!user) return;

    try {
      // Fetch my tasks (created or assigned)
      const myTasksData = await taskService.getTasks({ userId: user.id });
      setMyTasks(myTasksData || []);

      // Fetch available tasks for runners
      const availableTasksData = await taskService.getTasks({ 
        status: 'posted'
      });
      setAvailableTasks((availableTasksData || []).slice(0, 6)); // Show only 6

      // Calculate stats
      const completedTasks = myTasksData?.filter(task => task.status === 'completed') || [];
      const activeTasks = myTasksData?.filter(task => ['accepted', 'in_progress'].includes(task.status)) || [];
      
      setStats({
        totalEarnings: completedTasks
          .filter(task => task.runner_id === user.id)
          .reduce((sum, task) => sum + task.budget, 0),
        completedTasks: completedTasks.length,
        activeTasks: activeTasks.length,
        availableCount: availableTasksData?.length || 0,
      });
    } catch (error: any) {
      toast.error('Failed to load dashboard data');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, [user]);

  const handleViewDetails = (taskId: string) => {
    navigate(`/tasks/${taskId}`);
  };

  if (loading) {
    return (
      <Layout>
        <div className="max-w-7xl mx-auto px-4 py-8">
          <div className="animate-pulse space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="bg-white rounded-lg shadow-sm h-24"></div>
              ))}
            </div>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="bg-white rounded-lg shadow-sm h-96"></div>
              <div className="bg-white rounded-lg shadow-sm h-96"></div>
            </div>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Welcome Header */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">
              Welcome back,{" "}
              {user?.email ? (
                <span
                  onClick={() => navigate("/profile")}
                  className="text-blue-600 hover:underline cursor-pointer"
                >
                  {user?.profile?.full_name || user?.email}
                </span>
              ) : (
                user?.profile?.full_name
              )}
              !
            </h1>
            <p className="text-gray-600 mt-1">
              Here's what's happening with your errands today.
            </p>
          </div>
          <Button icon={Plus} onClick={() => navigate("/create-task")}>
            Create Task
          </Button>
        </div>


        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="flex items-center">
              <div className="p-2 bg-green-100 rounded-lg">
                <DollarSign className="h-6 w-6 text-green-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Total Earnings</p>
                <p className="text-2xl font-bold text-gray-900">${stats.totalEarnings}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="flex items-center">
              <div className="p-2 bg-blue-100 rounded-lg">
                <CheckCircle className="h-6 w-6 text-blue-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Completed Tasks</p>
                <p className="text-2xl font-bold text-gray-900">{stats.completedTasks}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="flex items-center">
              <div className="p-2 bg-orange-100 rounded-lg">
                <Clock className="h-6 w-6 text-orange-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Active Tasks</p>
                <p className="text-2xl font-bold text-gray-900">{stats.activeTasks}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="flex items-center">
              <div className="p-2 bg-purple-100 rounded-lg">
                <TrendingUp className="h-6 w-6 text-purple-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Available Tasks</p>
                <p className="text-2xl font-bold text-gray-900">{stats.availableCount}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* My Tasks */}
          <div className="bg-white rounded-lg shadow-sm">
            <div className="p-6 border-b">
              <div className="flex justify-between items-center">
                <h2 className="text-xl font-semibold text-gray-900">My Tasks</h2>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => navigate('/tasks')}
                >
                  View All
                </Button>
              </div>
            </div>
            <div className="p-6">
              {myTasks.length === 0 ? (
                <div className="text-center py-8">
                  <User className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">No tasks yet</h3>
                  <p className="text-gray-600 mb-4">
                    Create your first task or start helping others!
                  </p>
                  {/* <Button onClick={() => navigate('/admin')}>
                    A
                  </Button> */}
                  <Button onClick={() => navigate('/create-task')}>
                    Create Task
                  </Button>
                </div>
              ) : (
                <div className="space-y-4">
                  {myTasks.slice(0, 3).map((task) => (
                    <div key={task.id} className="border rounded-lg p-4">
                      <div className="flex justify-between items-start">
                        <div className="flex-1">
                          <h3 className="font-medium text-gray-900">{task.title}</h3>
                          <p className="text-sm text-gray-600 mt-1 line-clamp-2">
                            {task.description}
                          </p>
                          <div className="flex items-center space-x-4 mt-2 text-sm text-gray-500">
                            <span className="capitalize">{task.category}</span>
                            <span className="flex items-center space-x-1">
                              <DollarSign className="h-3 w-3" />
                              <span>{task.budget}</span>
                            </span>
                          </div>
                        </div>
                        <div className="ml-4 flex flex-col items-end space-y-2">
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                            task.status === 'posted' ? 'bg-blue-100 text-blue-800' :
                            task.status === 'accepted' ? 'bg-yellow-100 text-yellow-800' :
                            task.status === 'in_progress' ? 'bg-orange-100 text-orange-800' :
                            task.status === 'completed' ? 'bg-green-100 text-green-800' :
                            'bg-red-100 text-red-800'
                          }`}>
                            {task.status.replace('_', ' ').toUpperCase()}
                          </span>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleViewDetails(task.id)}
                          >
                            View
                          </Button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Available Tasks */}
          <div className="bg-white rounded-lg shadow-sm">
            <div className="p-6 border-b">
              <div className="flex justify-between items-center">
                <h2 className="text-xl font-semibold text-gray-900">Available Tasks</h2>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => navigate('/tasks')}
                >
                  View All
                </Button>
              </div>
            </div>
            <div className="p-6">
              {availableTasks.length === 0 ? (
                <div className="text-center py-8">
                  <MapPin className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">No available tasks</h3>
                  <p className="text-gray-600">
                    Check back later for new tasks to help with!
                  </p>
                </div>
              ) : (
                <div className="space-y-4">
                  {availableTasks.map((task) => (
                    <div key={task.id} className="border rounded-lg p-4">
                      <div className="flex justify-between items-start">
                        <div className="flex-1">
                          <h3 className="font-medium text-gray-900">{task.title}</h3>
                          <p className="text-sm text-gray-600 mt-1 line-clamp-2">
                            {task.description}
                          </p>
                          <div className="flex items-center space-x-4 mt-2 text-sm text-gray-500">
                            <span className="capitalize">{task.category}</span>
                            {task.location_pickup && (
                              <span className="flex items-center space-x-1">
                                <MapPin className="h-3 w-3" />
                                <span className="truncate max-w-24">
                                  {task.location_pickup}
                                </span>
                              </span>
                            )}
                          </div>
                        </div>
                        <div className="ml-4 flex flex-col items-end space-y-2">
                          <div className="flex items-center space-x-1 text-lg font-semibold text-green-600">
                            <DollarSign className="h-4 w-4" />
                            <span>{task.budget}</span>
                          </div>
                          <Button
                            size="sm"
                            onClick={() => handleViewDetails(task.id)}
                          >
                            View Details
                          </Button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="mt-8 bg-gradient-to-r from-blue-500 to-blue-600 rounded-lg shadow-sm p-6 text-white">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div>
              <h3 className="text-xl font-semibold mb-2">Ready to get started?</h3>
              <p className="text-blue-100">
                Create a task or browse available tasks to start earning money.
              </p>
            </div>
            <div className="mt-4 md:mt-0 space-x-4">
              <Button
                variant="outline"
                className="bg-white text-blue-600 border-white hover:bg-blue-50"
                onClick={() => navigate('/tasks')}
              >
                Browse Tasks
              </Button>
              <Button
                className="bg-blue-700 hover:bg-blue-800"
                icon={Plus}
                onClick={() => navigate('/create-task')}
              >
                Create Task
              </Button>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
};