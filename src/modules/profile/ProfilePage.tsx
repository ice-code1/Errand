import React, { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { profileService } from '../../services/profile';
import { Layout } from '../../components/Layout/Layout';
import { Button } from '../../components/UI/Button';
import { Input } from '../../components/UI/Input';
import { TextArea } from '../../components/UI/TextArea';
import { 
  User, Edit3, Save, X, Star, CheckCircle, Clock, 
  DollarSign, MapPin, Phone, Mail, Calendar, Award,
  Settings, Shield, Bell, Camera
} from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import toast from 'react-hot-toast';

export const ProfilePage: React.FC = () => {
  const { user } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(false);
  const [stats, setStats] = useState({
    tasksCreated: 0,
    tasksCompleted: 0,
    totalEarnings: 0,
    averageRating: 0,
    totalReviews: 0,
  });
  const [recentTasks, setRecentTasks] = useState<any[]>([]);
  const [profileData, setProfileData] = useState({
    fullName: user?.profile?.full_name || '',
    phone: user?.profile?.phone || '',
    bio: '',
    isRunner: user?.profile?.is_runner || false,
  });

  const fetchProfileData = async () => {
    if (!user) return;

    try {
      // Fetch user statistics
      const userStats = await profileService.getUserStats();
      setStats(userStats);

      // Get recent activity
      const recent = await profileService.getRecentActivity();
      setRecentTasks(recent);
    } catch (error: any) {
      console.error('Failed to fetch profile data:', error);
    }
  };

  useEffect(() => {
    fetchProfileData();
  }, [user]);

  const handleSaveProfile = async () => {
    if (!user) return;

    setLoading(true);
    try {
      await profileService.updateProfile({
        full_name: profileData.fullName,
        phone: profileData.phone,
        is_runner: profileData.isRunner,
      });
      toast.success('Profile updated successfully!');
      setIsEditing(false);
    } catch (error: any) {
      toast.error('Failed to update profile');
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (field: string, value: string | boolean) => {
    setProfileData(prev => ({ ...prev, [field]: value }));
  };

  if (!user) {
    return (
      <Layout>
        <div className="max-w-4xl mx-auto px-4 py-8 text-center">
          <h2 className="text-xl font-semibold text-gray-900">Please log in to view your profile</h2>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="max-w-4xl mx-auto px-4 py-8">
        {/* Profile Header */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-8">
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between">
            <div className="flex items-center space-x-4 mb-4 md:mb-0">
              <div className="relative">
                <div className="w-20 h-20 bg-gradient-to-br from-blue-500 to-blue-600 rounded-full flex items-center justify-center">
                  <User className="h-10 w-10 text-white" />
                </div>
                <button className="absolute -bottom-1 -right-1 bg-white rounded-full p-1.5 shadow-md hover:shadow-lg transition-shadow">
                  <Camera className="h-4 w-4 text-gray-600" />
                </button>
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">
                  {user.profile?.full_name || 'Anonymous User'}
                </h1>
                <p className="text-gray-600">{user.email}</p>
                <div className="flex items-center space-x-4 mt-2">
                  <div className="flex items-center space-x-1">
                    <Star className="h-4 w-4 text-yellow-400 fill-current" />
                    <span className="text-sm font-medium">{stats.averageRating}</span>
                    <span className="text-sm text-gray-500">({stats.totalReviews} reviews)</span>
                  </div>
                  {user.profile?.is_runner && (
                    <span className="px-2 py-1 bg-green-100 text-green-800 text-xs font-medium rounded-full">
                      Runner
                    </span>
                  )}
                </div>
              </div>
            </div>
            <Button
              icon={isEditing ? X : Edit3}
              variant={isEditing ? "outline" : "primary"}
              onClick={() => setIsEditing(!isEditing)}
            >
              {isEditing ? 'Cancel' : 'Edit Profile'}
            </Button>
          </div>

          {/* Profile Form */}
          {isEditing && (
            <div className="mt-6 pt-6 border-t">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Input
                  label="Full Name"
                  value={profileData.fullName}
                  onChange={(e) => handleInputChange('fullName', e.target.value)}
                  placeholder="Enter your full name"
                />
                <Input
                  label="Phone Number"
                  value={profileData.phone}
                  onChange={(e) => handleInputChange('phone', e.target.value)}
                  placeholder="Enter your phone number"
                />
                <div className="md:col-span-2">
                  <TextArea
                    label="Bio"
                    value={profileData.bio}
                    onChange={(e) => handleInputChange('bio', e.target.value)}
                    placeholder="Tell others about yourself..."
                    rows={3}
                  />
                </div>
                <div className="md:col-span-2">
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      checked={profileData.isRunner}
                      onChange={(e) => handleInputChange('isRunner', e.target.checked)}
                      className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                    />
                    <span className="ml-2 text-sm text-gray-700">
                      I want to be a runner (accept and complete tasks for others)
                    </span>
                  </label>
                </div>
              </div>
              <div className="flex justify-end mt-6">
                <Button
                  icon={Save}
                  onClick={handleSaveProfile}
                  loading={loading}
                >
                  Save Changes
                </Button>
              </div>
            </div>
          )}
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="flex items-center">
              <div className="p-2 bg-blue-100 rounded-lg">
                <User className="h-6 w-6 text-blue-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Tasks Created</p>
                <p className="text-2xl font-bold text-gray-900">{stats.tasksCreated}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="flex items-center">
              <div className="p-2 bg-green-100 rounded-lg">
                <CheckCircle className="h-6 w-6 text-green-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Tasks Completed</p>
                <p className="text-2xl font-bold text-gray-900">{stats.tasksCompleted}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="flex items-center">
              <div className="p-2 bg-yellow-100 rounded-lg">
                <DollarSign className="h-6 w-6 text-yellow-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Total Earnings</p>
                <p className="text-2xl font-bold text-gray-900">${stats.totalEarnings}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="flex items-center">
              <div className="p-2 bg-purple-100 rounded-lg">
                <Star className="h-6 w-6 text-purple-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Average Rating</p>
                <p className="text-2xl font-bold text-gray-900">{stats.averageRating}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Profile Information & Recent Activity */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Profile Information */}
          <div className="bg-white rounded-lg shadow-sm p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Profile Information</h3>
            <div className="space-y-4">
              <div className="flex items-center space-x-3">
                <Mail className="h-5 w-5 text-gray-400" />
                <div>
                  <p className="text-sm text-gray-600">Email</p>
                  <p className="font-medium">{user.email}</p>
                </div>
              </div>
              
              {user.profile?.phone && (
                <div className="flex items-center space-x-3">
                  <Phone className="h-5 w-5 text-gray-400" />
                  <div>
                    <p className="text-sm text-gray-600">Phone</p>
                    <p className="font-medium">{user.profile.phone}</p>
                  </div>
                </div>
              )}

              <div className="flex items-center space-x-3">
                <Calendar className="h-5 w-5 text-gray-400" />
                <div>
                  <p className="text-sm text-gray-600">Member Since</p>
                  <p className="font-medium">
                    {formatDistanceToNow(new Date(user.created_at), { addSuffix: true })}
                  </p>
                </div>
              </div>

              <div className="flex items-center space-x-3">
                <Award className="h-5 w-5 text-gray-400" />
                <div>
                  <p className="text-sm text-gray-600">Account Type</p>
                  <p className="font-medium">
                    {user.profile?.is_runner ? 'Runner & Task Creator' : 'Task Creator'}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Recent Activity */}
          <div className="bg-white rounded-lg shadow-sm p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Recent Activity</h3>
            {recentTasks.length === 0 ? (
              <div className="text-center py-8">
                <Clock className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-600">No recent activity</p>
              </div>
            ) : (
              <div className="space-y-4">
                {recentTasks.map((task) => (
                  <div key={task.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div className="flex-1">
                      <p className="font-medium text-gray-900 truncate">{task.title}</p>
                      <div className="flex items-center space-x-2 mt-1">
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                          task.status === 'completed' ? 'bg-green-100 text-green-800' :
                          task.status === 'in_progress' ? 'bg-orange-100 text-orange-800' :
                          task.status === 'posted' ? 'bg-blue-100 text-blue-800' :
                          'bg-gray-100 text-gray-800'
                        }`}>
                          {task.status.replace('_', ' ').toUpperCase()}
                        </span>
                        <span className="text-xs text-gray-500">
                          {formatDistanceToNow(new Date(task.created_at), { addSuffix: true })}
                        </span>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-semibold text-green-600">${task.budget}</p>
                      <p className="text-xs text-gray-500 capitalize">{task.category}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Account Settings */}
        <div className="mt-8 bg-white rounded-lg shadow-sm p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Account Settings</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Button
              variant="outline"
              icon={Settings}
              className="justify-start"
            >
              Privacy Settings
            </Button>
            <Button
              variant="outline"
              icon={Bell}
              className="justify-start"
            >
              Notifications
            </Button>
            <Button
              variant="outline"
              icon={Shield}
              className="justify-start"
            >
              Security
            </Button>
          </div>
        </div>
      </div>
    </Layout>
  );
};