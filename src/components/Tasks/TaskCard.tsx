import React from 'react';
import { formatDistanceToNow } from 'date-fns';
import { MapPin, DollarSign, Clock, User, Truck } from 'lucide-react';
import { Button } from '../UI/Button';

interface TaskCardProps {
  task: any; // We'll use the actual task type from our service
  onViewDetails: (taskId: string) => void;
  showBidButton?: boolean;
}

export const TaskCard: React.FC<TaskCardProps> = ({
  task,
  onViewDetails,
  showBidButton = true,
}) => {
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'posted': return 'bg-blue-100 text-blue-800';
      case 'accepted': return 'bg-yellow-100 text-yellow-800';
      case 'in_progress': return 'bg-orange-100 text-orange-800';
      case 'completed': return 'bg-green-100 text-green-800';
      case 'cancelled': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getCategoryIcon = (category: string) => {
    switch (category.toLowerCase()) {
      case 'delivery':
        return <Truck className="h-4 w-4" />;
      default:
        return <User className="h-4 w-4" />;
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-sm border hover:shadow-md transition-shadow p-6">
      <div className="flex justify-between items-start mb-4">
        <div>
          <h3 className="text-lg font-semibold text-gray-900 mb-1">
            {task.title}
          </h3>
          <div className="flex items-center space-x-4 text-sm text-gray-500">
            <div className="flex items-center space-x-1">
              {getCategoryIcon(task.category)}
              <span className="capitalize">{task.category}</span>
            </div>
            <div className="flex items-center space-x-1">
              <Clock className="h-4 w-4" />
              <span>{formatDistanceToNow(new Date(task.created_at), { addSuffix: true })}</span>
            </div>
          </div>
        </div>
        <div className="flex flex-col items-end space-y-2">
          <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(task.status)}`}>
            {task.status.replace('_', ' ').toUpperCase()}
          </span>
          {task.is_commuter_pickup && (
            <span className="px-2 py-1 rounded-full text-xs font-medium bg-purple-100 text-purple-800">
              Commuter Pickup
            </span>
          )}
        </div>
      </div>

      <p className="text-gray-600 mb-4 line-clamp-2">
        {task.description}
      </p>

      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center space-x-4">
          {task.location_pickup && (
            <div className="flex items-center space-x-1 text-sm text-gray-500">
              <MapPin className="h-4 w-4" />
              <span className="truncate max-w-32">{task.location_pickup}</span>
            </div>
          )}
          {task.location_delivery && task.location_pickup && (
            <span className="text-gray-300">→</span>
          )}
          {task.location_delivery && (
            <div className="flex items-center space-x-1 text-sm text-gray-500">
              <MapPin className="h-4 w-4" />
              <span className="truncate max-w-32">{task.location_delivery}</span>
            </div>
          )}
        </div>
        <div className="flex items-center space-x-1 text-lg font-semibold text-green-600">
          <DollarSign className="h-4 w-4" />
          <span>{task.budget}</span>
        </div>
      </div>

      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <div className="w-8 h-8 bg-gray-200 rounded-full flex items-center justify-center">
            <User className="h-4 w-4 text-gray-500" />
          </div>
          <span className="text-sm text-gray-600">
            {task.creator?.full_name || 'Anonymous'}
          </span>
        </div>
        
        <div className="flex space-x-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => onViewDetails(task.id)}
          >
            View Details
          </Button>
          {showBidButton && task.status === 'posted' && (
            <Button
              variant="primary"
              size="sm"
              onClick={() => onViewDetails(task.id)}
            >
              Place Bid
            </Button>
          )}
        </div>
      </div>

      {task.bids && task.bids.length > 0 && (
        <div className="mt-4 pt-4 border-t">
          <div className="flex items-center justify-between text-sm">
            <span className="text-gray-500">
              {task.bids.length} bid{task.bids.length !== 1 ? 's' : ''}
            </span>
            <span className="text-gray-500">
              Lowest: ${Math.min(...task.bids.map((bid: any) => bid.amount))}
            </span>
          </div>
        </div>
      )}
    </div>
  );
};