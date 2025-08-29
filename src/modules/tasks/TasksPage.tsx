import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { taskService } from '../../services/tasks';
import { useAuth } from '../../contexts/AuthContext';
import { Layout } from '../../components/Layout/Layout';
import { TaskCard } from '../../components/Tasks/TaskCard';
import { Select } from '../../components/UI/Select';
import { Input } from '../../components/UI/Input';
import { Button } from '../../components/UI/Button';
import { Search, Plus } from 'lucide-react';
import toast from 'react-hot-toast';

const CATEGORIES = [
  { value: '', label: 'All Categories' },
  { value: 'shopping', label: 'Shopping' },
  { value: 'delivery', label: 'Delivery' },
  { value: 'cleaning', label: 'Cleaning' },
  { value: 'carpentry', label: 'Carpentry' },
  { value: 'moving', label: 'Moving' },
  { value: 'other', label: 'Other' },
];

const STATUS_FILTERS = [
  { value: '', label: 'All Status' },
  { value: 'posted', label: 'Posted' },
  { value: 'accepted', label: 'Accepted' },
  { value: 'in_progress', label: 'In Progress' },
  { value: 'completed', label: 'Completed' },
];

export const TasksPage: React.FC = () => {
  const [tasks, setTasks] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({
    category: '',
    status: '',
    search: '',
    showMyTasks: false,
    showCommuterOnly: false,
  });
  const { user } = useAuth();
  const navigate = useNavigate();

  const fetchTasks = async () => {
    try {
      const data = await taskService.getTasks({
        category: filters.category || undefined,
        status: filters.status || undefined,
        isCommuter: filters.showCommuterOnly || undefined,
        userId: filters.showMyTasks ? user?.id : undefined,
      });
      setTasks(data || []);
    } catch (error: any) {
      toast.error('Failed to load tasks');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTasks();
  }, [filters.category, filters.status, filters.showMyTasks, filters.showCommuterOnly]);

  const handleFilterChange = (field: string, value: string | boolean) => {
    setFilters(prev => ({ ...prev, [field]: value }));
  };

  const handleViewDetails = (taskId: string) => {
    navigate(`/tasks/${taskId}`);
  };

  const filteredTasks = tasks.filter(task =>
    !filters.search || 
    task.title.toLowerCase().includes(filters.search.toLowerCase()) ||
    task.description.toLowerCase().includes(filters.search.toLowerCase())
  );

  if (loading) {
    return (
      <Layout>
        <div className="max-w-7xl mx-auto px-4 py-8">
          <div className="animate-pulse space-y-4">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="bg-white rounded-lg shadow-sm h-48"></div>
            ))}
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Available Tasks</h1>
            <p className="text-gray-600 mt-1">
              Find tasks to help with or post your own
            </p>
          </div>
          <Button
            icon={Plus}
            onClick={() => navigate('/create-task')}
          >
            Create Task
          </Button>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-lg shadow-sm p-4 mb-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
            <Input
              placeholder="Search tasks..."
              value={filters.search}
              onChange={(e) => handleFilterChange('search', e.target.value)}
            />
            <Select
              options={CATEGORIES}
              value={filters.category}
              onChange={(e) => handleFilterChange('category', e.target.value)}
            />
            <Select
              options={STATUS_FILTERS}
              value={filters.status}
              onChange={(e) => handleFilterChange('status', e.target.value)}
            />
            <div className="flex items-center space-x-4">
              <label className="flex items-center">
                <input
                  type="checkbox"
                  checked={filters.showMyTasks}
                  onChange={(e) => handleFilterChange('showMyTasks', e.target.checked)}
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                />
                <span className="ml-2 text-sm text-gray-700">My Tasks</span>
              </label>
              <label className="flex items-center">
                <input
                  type="checkbox"
                  checked={filters.showCommuterOnly}
                  onChange={(e) => handleFilterChange('showCommuterOnly', e.target.checked)}
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                />
                <span className="ml-2 text-sm text-gray-700">Commuter</span>
              </label>
            </div>
          </div>
        </div>

        {/* Tasks Grid */}
        {filteredTasks.length === 0 ? (
          <div className="bg-white rounded-lg shadow-sm p-12 text-center">
            <div className="text-gray-400 mb-4">
              <Search className="h-12 w-12 mx-auto" />
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">No tasks found</h3>
            <p className="text-gray-600 mb-4">
              {filters.search || filters.category || filters.status
                ? 'Try adjusting your filters to see more tasks.'
                : 'Be the first to post a task!'}
            </p>
            <Button onClick={() => navigate('/create-task')}>
              Create First Task
            </Button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredTasks.map((task) => (
              <TaskCard
                key={task.id}
                task={task}
                onViewDetails={handleViewDetails}
                showBidButton={task.creator_id !== user?.id}
              />
            ))}
          </div>
        )}
      </div>
    </Layout>
  );
};

export default TasksPage;