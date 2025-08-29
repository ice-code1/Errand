import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { taskService } from '../../services/tasks';
import { Input } from '../../components/UI/Input';
import { TextArea } from '../../components/UI/TextArea';
import { Select } from '../../components/UI/Select';
import { Button } from '../../components/UI/Button';
import { Layout } from '../../components/Layout/Layout';
import { MapPin, DollarSign, Plus } from 'lucide-react';
import toast from 'react-hot-toast';

const CATEGORIES = [
  { value: 'shopping', label: 'Shopping' },
  { value: 'delivery', label: 'Delivery' },
  { value: 'cleaning', label: 'Cleaning' },
  { value: 'carpentry', label: 'Carpentry' },
  { value: 'moving', label: 'Moving' },
  { value: 'other', label: 'Other' },
];

export const CreateTaskPage: React.FC = () => {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    category: '',
    budget: '',
    locationPickup: '',
    locationDelivery: '',
    isCommuterPickup: false,
  });
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const navigate = useNavigate();

  const handleInputChange = (field: string, value: string | boolean) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.title.trim()) {
      newErrors.title = 'Title is required';
    }

    if (!formData.description.trim()) {
      newErrors.description = 'Description is required';
    }

    if (!formData.category) {
      newErrors.category = 'Category is required';
    }

    if (!formData.budget || isNaN(Number(formData.budget)) || Number(formData.budget) <= 0) {
      newErrors.budget = 'Please enter a valid budget amount';
    }

    if (formData.isCommuterPickup) {
      if (!formData.locationPickup.trim()) {
        newErrors.locationPickup = 'Pickup location is required for commuter tasks';
      }
      if (!formData.locationDelivery.trim()) {
        newErrors.locationDelivery = 'Delivery location is required for commuter tasks';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;

    setLoading(true);
    try {
      await taskService.createTask({
        title: formData.title,
        description: formData.description,
        category: formData.category,
        budget: Number(formData.budget),
        location_pickup: formData.locationPickup || null,
        location_delivery: formData.locationDelivery || null,
        is_commuter_pickup: formData.isCommuterPickup,
      });

      toast.success('Task created successfully!');
      navigate('/tasks');
    } catch (error: any) {
      toast.error(error.message || 'Failed to create task');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Layout>
      <div className="max-w-2xl mx-auto px-4 py-8">
        <div className="bg-white rounded-lg shadow-sm p-6">
          <div className="mb-6">
            <h1 className="text-2xl font-bold text-gray-900 mb-2">Create New Task</h1>
            <p className="text-gray-600">
              Post a task and let runners bid to help you complete it.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <Input
              label="Task Title"
              value={formData.title}
              onChange={(e) => handleInputChange('title', e.target.value)}
              placeholder="e.g., Pick up groceries from the supermarket"
              error={errors.title}
              required
            />

            <TextArea
              label="Description"
              value={formData.description}
              onChange={(e) => handleInputChange('description', e.target.value)}
              placeholder="Provide details about what needs to be done, any specific requirements, etc."
              rows={4}
              error={errors.description}
              required
            />

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Select
                label="Category"
                value={formData.category}
                onChange={(e) => handleInputChange('category', e.target.value)}
                options={CATEGORIES}
                error={errors.category}
                required
              />

              <Input
                label="Budget ($)"
                type="number"
                step="0.01"
                min="0"
                value={formData.budget}
                onChange={(e) => handleInputChange('budget', e.target.value)}
                placeholder="0.00"
                error={errors.budget}
                required
              />
            </div>

            <div className="space-y-4">
              <div className="flex items-center">
                <input
                  id="isCommuterPickup"
                  type="checkbox"
                  checked={formData.isCommuterPickup}
                  onChange={(e) => handleInputChange('isCommuterPickup', e.target.checked)}
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                />
                <label htmlFor="isCommuterPickup" className="ml-2 block text-sm text-gray-700">
                  This is a commuter pickup task (delivery along someone's route)
                </label>
              </div>

              {formData.isCommuterPickup && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pl-6 border-l-2 border-blue-200">
                  <Input
                    label="Pickup Location"
                    value={formData.locationPickup}
                    onChange={(e) => handleInputChange('locationPickup', e.target.value)}
                    placeholder="Enter pickup address"
                    error={errors.locationPickup}
                    required
                  />

                  <Input
                    label="Delivery Location"
                    value={formData.locationDelivery}
                    onChange={(e) => handleInputChange('locationDelivery', e.target.value)}
                    placeholder="Enter delivery address"
                    error={errors.locationDelivery}
                    required
                  />
                </div>
              )}

              {!formData.isCommuterPickup && (
                <Input
                  label="Location (Optional)"
                  value={formData.locationPickup}
                  onChange={(e) => handleInputChange('locationPickup', e.target.value)}
                  placeholder="Enter location if relevant"
                />
              )}
            </div>

            <div className="flex justify-end space-x-4 pt-6 border-t">
              <Button
                type="button"
                variant="outline"
                onClick={() => navigate('/tasks')}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                icon={Plus}
                loading={loading}
              >
                Create Task
              </Button>
            </div>
          </form>
        </div>
      </div>
    </Layout>
  );
};

export default CreateTaskPage;