import React, { useState, useEffect } from 'react';
import { adminService } from '../../services/admin';
import { Layout } from '../../components/Layout/Layout';
import { Button } from '../../components/UI/Button';
import { Input } from '../../components/UI/Input';
import { 
  Settings, Save, RefreshCw, AlertTriangle, 
  DollarSign, MapPin, Shield, Bell 
} from 'lucide-react';
import toast from 'react-hot-toast';

interface AppSettings {
  app_name: string;
  maintenance_mode: boolean;
  max_task_budget: number;
  commission_rate: number;
  proximity_alert_distance: number;
  max_bid_amount: number;
}

export const AdminSettings: React.FC = () => {
  const [settings, setSettings] = useState<AppSettings>({
    app_name: 'Errands Runner',
    maintenance_mode: false,
    max_task_budget: 1000,
    commission_rate: 0.05,
    proximity_alert_distance: 100,
    max_bid_amount: 500,
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const fetchSettings = async () => {
    try {
      const settingsData = await adminService.getSettings();
      
      setSettings({
        app_name: settingsData.app_name || 'Errands Runner',
        maintenance_mode: settingsData.maintenance_mode || false,
        max_task_budget: settingsData.max_task_budget || 1000,
        commission_rate: settingsData.commission_rate || 0.05,
        proximity_alert_distance: settingsData.proximity_alert_distance || 100,
        max_bid_amount: settingsData.max_bid_amount || 500,
      });
    } catch (error: any) {
      toast.error('Failed to load settings');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleSaveSettings = async () => {
    setSaving(true);
    try {
      await Promise.all([
        adminService.updateSetting('app_name', settings.app_name),
        adminService.updateSetting('maintenance_mode', settings.maintenance_mode),
        adminService.updateSetting('max_task_budget', settings.max_task_budget),
        adminService.updateSetting('commission_rate', settings.commission_rate),
        adminService.updateSetting('proximity_alert_distance', settings.proximity_alert_distance),
        adminService.updateSetting('max_bid_amount', settings.max_bid_amount),
      ]);

      toast.success('Settings saved successfully');
    } catch (error: any) {
      toast.error('Failed to save settings');
      console.error(error);
    } finally {
      setSaving(false);
    }
  };

  const handleInputChange = (field: keyof AppSettings, value: any) => {
    setSettings(prev => ({ ...prev, [field]: value }));
  };

  useEffect(() => {
    fetchSettings();
  }, []);

  if (loading) {
    return (
      <Layout>
        <div className="max-w-4xl mx-auto px-4 py-8">
          <div className="animate-pulse space-y-6">
            <div className="h-8 bg-gray-200 rounded w-64"></div>
            <div className="space-y-4">
              {[...Array(6)].map((_, i) => (
                <div key={i} className="bg-white rounded-lg shadow-sm h-20"></div>
              ))}
            </div>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="max-w-4xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">App Settings</h1>
            <p className="text-gray-600 mt-1">
              Configure application settings and platform parameters
            </p>
          </div>
          <div className="flex space-x-4">
            <Button
              variant="outline"
              icon={RefreshCw}
              onClick={fetchSettings}
            >
              Refresh
            </Button>
            <Button
              icon={Save}
              onClick={handleSaveSettings}
              loading={saving}
            >
              Save Changes
            </Button>
          </div>
        </div>

        <div className="space-y-8">
          {/* General Settings */}
          <div className="bg-white rounded-lg shadow-sm p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
              <Settings className="h-5 w-5 mr-2" />
              General Settings
            </h3>
            <div className="space-y-4">
              <Input
                label="Application Name"
                value={settings.app_name}
                onChange={(e) => handleInputChange('app_name', e.target.value)}
                placeholder="Enter application name"
              />
              
              <div className="flex items-center">
                <input
                  id="maintenance_mode"
                  type="checkbox"
                  checked={settings.maintenance_mode}
                  onChange={(e) => handleInputChange('maintenance_mode', e.target.checked)}
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                />
                <label htmlFor="maintenance_mode" className="ml-2 block text-sm text-gray-700">
                  Enable maintenance mode (prevents new user registrations and task creation)
                </label>
              </div>

              {settings.maintenance_mode && (
                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                  <div className="flex items-center">
                    <AlertTriangle className="h-5 w-5 text-yellow-600 mr-2" />
                    <span className="text-sm text-yellow-800">
                      Maintenance mode is enabled. Users will see a maintenance message.
                    </span>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Financial Settings */}
          <div className="bg-white rounded-lg shadow-sm p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
              <DollarSign className="h-5 w-5 mr-2" />
              Financial Settings
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Input
                label="Maximum Task Budget ($)"
                type="number"
                step="0.01"
                min="0"
                value={settings.max_task_budget}
                onChange={(e) => handleInputChange('max_task_budget', parseFloat(e.target.value) || 0)}
                placeholder="1000"
                helperText="Maximum amount users can set as task budget"
              />
              
              <Input
                label="Maximum Bid Amount ($)"
                type="number"
                step="0.01"
                min="0"
                value={settings.max_bid_amount}
                onChange={(e) => handleInputChange('max_bid_amount', parseFloat(e.target.value) || 0)}
                placeholder="500"
                helperText="Maximum amount runners can bid on tasks"
              />
              
              <Input
                label="Commission Rate"
                type="number"
                step="0.01"
                min="0"
                max="1"
                value={settings.commission_rate}
                onChange={(e) => handleInputChange('commission_rate', parseFloat(e.target.value) || 0)}
                placeholder="0.05"
                helperText="Platform commission rate (0.05 = 5%)"
              />
            </div>
          </div>

          {/* Location Settings */}
          <div className="bg-white rounded-lg shadow-sm p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
              <MapPin className="h-5 w-5 mr-2" />
              Location Settings
            </h3>
            <div className="space-y-4">
              <Input
                label="Proximity Alert Distance (meters)"
                type="number"
                min="10"
                max="1000"
                value={settings.proximity_alert_distance}
                onChange={(e) => handleInputChange('proximity_alert_distance', parseInt(e.target.value) || 100)}
                placeholder="100"
                helperText="Distance in meters to trigger proximity alerts between runners and task creators"
              />
            </div>
          </div>

          {/* Security Settings */}
          <div className="bg-white rounded-lg shadow-sm p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
              <Shield className="h-5 w-5 mr-2" />
              Security & Safety
            </h3>
            <div className="space-y-4">
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <h4 className="font-medium text-blue-900 mb-2">Security Features</h4>
                <ul className="text-sm text-blue-800 space-y-1">
                  <li>• Row Level Security (RLS) enabled on all database tables</li>
                  <li>• JWT-based authentication with Supabase</li>
                  <li>• Real-time location tracking with privacy controls</li>
                  <li>• Automated audit logging for admin actions</li>
                  <li>• Secure payment processing integration ready</li>
                </ul>
              </div>
            </div>
          </div>

          {/* Notification Settings */}
          <div className="bg-white rounded-lg shadow-sm p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
              <Bell className="h-5 w-5 mr-2" />
              Notification Settings
            </h3>
            <div className="space-y-4">
              <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                <h4 className="font-medium text-green-900 mb-2">Active Notifications</h4>
                <ul className="text-sm text-green-800 space-y-1">
                  <li>• New task notifications for runners</li>
                  <li>• Bid received notifications for task creators</li>
                  <li>• Task status change notifications</li>
                  <li>• Real-time chat message notifications</li>
                  <li>• Proximity alerts when users are nearby</li>
                </ul>
              </div>
            </div>
          </div>

          {/* Save Button */}
          <div className="flex justify-end">
            <Button
              icon={Save}
              onClick={handleSaveSettings}
              loading={saving}
              size="lg"
            >
              Save All Settings
            </Button>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default AdminSettings;