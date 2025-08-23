import React, { useEffect, useState, useRef } from 'react';
import { locationService } from '../services/location';
import { completionService } from '../services/completion';
import { Button } from './UI/Button';
import { Input } from './UI/Input';
import { MapPin, Navigation, AlertCircle, CheckCircle } from 'lucide-react';
import toast from 'react-hot-toast';

interface LocationTrackerProps {
  taskId: string;
  isRunner: boolean;
  isCreator: boolean;
  taskStatus: string;
  onTaskComplete?: () => void;
}

export const LocationTracker: React.FC<LocationTrackerProps> = ({
  taskId,
  isRunner,
  isCreator,
  taskStatus,
  onTaskComplete
}) => {
  const [isTracking, setIsTracking] = useState(false);
  const [currentLocation, setCurrentLocation] = useState<GeolocationPosition | null>(null);
  const [runnerLocation, setRunnerLocation] = useState<any>(null);
  const [proximityAlert, setProximityAlert] = useState<any>(null);
  const [completionCode, setCompletionCode] = useState('');
  const [generatedCode, setGeneratedCode] = useState('');
  const [inputCode, setInputCode] = useState('');
  const watchIdRef = useRef<number | null>(null);

  useEffect(() => {
    if (taskStatus === 'in_progress') {
      startLocationTracking();
    }

    return () => {
      stopLocationTracking();
    };
  }, [taskStatus]);

  useEffect(() => {
    // Subscribe to location updates
    const locationSubscription = locationService.subscribeToLocationUpdates(taskId, (location) => {
      setRunnerLocation(location);
    });

    // Subscribe to proximity alerts
    const proximitySubscription = locationService.subscribeToProximityAlerts(taskId, (alert) => {
      setProximityAlert(alert);
      toast.success('You are near the pickup location!', {
        icon: '📍',
        duration: 5000
      });
      
      // Generate completion code when users are close
      if (isCreator) {
        generateCompletionCode();
      }
    });

    return () => {
      locationSubscription.unsubscribe();
      proximitySubscription.unsubscribe();
    };
  }, [taskId, isCreator]);

  const startLocationTracking = async () => {
    if (!isRunner) return;

    try {
      // Get initial location
      const position = await locationService.getCurrentLocation();
      setCurrentLocation(position);
      setIsTracking(true);

      // Start watching location
      watchIdRef.current = locationService.watchLocation(async (position) => {
        setCurrentLocation(position);
        
        // Update location in database
        await locationService.updateRunnerLocation(
          taskId,
          position.coords.latitude,
          position.coords.longitude,
          position.coords.accuracy,
          position.coords.heading || undefined,
          position.coords.speed || undefined
        );
      });

      toast.success('Location tracking started');
    } catch (error: any) {
      toast.error('Failed to start location tracking: ' + error.message);
    }
  };

  const stopLocationTracking = () => {
    if (watchIdRef.current) {
      locationService.clearLocationWatch(watchIdRef.current);
      watchIdRef.current = null;
    }
    setIsTracking(false);
  };

  const generateCompletionCode = async () => {
    try {
      const code = await completionService.generateCompletionCode(taskId);
      setGeneratedCode(code);
      toast.success(`Completion code generated: ${code}`, {
        duration: 10000,
        icon: '🔢'
      });
    } catch (error: any) {
      toast.error('Failed to generate completion code');
    }
  };

  const handleCompleteTask = async () => {
    if (!inputCode.trim()) {
      toast.error('Please enter the completion code');
      return;
    }

    try {
      const success = await completionService.useCompletionCode(inputCode, taskId);
      if (success) {
        toast.success('Task completed successfully!');
        stopLocationTracking();
        onTaskComplete?.();
      } else {
        toast.error('Invalid or expired completion code');
      }
    } catch (error: any) {
      toast.error('Failed to complete task');
    }
  };

  if (taskStatus !== 'in_progress' && taskStatus !== 'accepted') {
    return null;
  }

  return (
    <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
      <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
        <MapPin className="h-5 w-5 mr-2 text-blue-600" />
        Location Tracking
      </h3>

      {/* Runner View */}
      {isRunner && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <div className={`w-3 h-3 rounded-full ${isTracking ? 'bg-green-500' : 'bg-gray-400'}`}></div>
              <span className="text-sm text-gray-600">
                {isTracking ? 'Location tracking active' : 'Location tracking inactive'}
              </span>
            </div>
            {taskStatus === 'accepted' && (
              <Button
                size="sm"
                onClick={startLocationTracking}
                disabled={isTracking}
                icon={Navigation}
              >
                Start Tracking
              </Button>
            )}
          </div>

          {currentLocation && (
            <div className="bg-blue-50 rounded-lg p-4">
              <p className="text-sm text-blue-800">
                <strong>Current Location:</strong><br />
                Lat: {currentLocation.coords.latitude.toFixed(6)}<br />
                Lng: {currentLocation.coords.longitude.toFixed(6)}<br />
                Accuracy: ±{Math.round(currentLocation.coords.accuracy)}m
              </p>
            </div>
          )}

          {proximityAlert && (
            <div className="bg-green-50 border border-green-200 rounded-lg p-4">
              <div className="flex items-center space-x-2">
                <AlertCircle className="h-5 w-5 text-green-600" />
                <p className="text-green-800 font-medium">
                  You're within {Math.round(proximityAlert.distance)}m of the pickup location!
                </p>
              </div>
            </div>
          )}

          {/* Completion Code Input */}
          <div className="border-t pt-4">
            <h4 className="font-medium text-gray-900 mb-2">Complete Task</h4>
            <p className="text-sm text-gray-600 mb-3">
              Ask the task creator for the completion code to finish this task.
            </p>
            <div className="flex space-x-2">
              <Input
                placeholder="Enter completion code"
                value={inputCode}
                onChange={(e) => setInputCode(e.target.value.toUpperCase())}
                className="flex-1"
              />
              <Button
                onClick={handleCompleteTask}
                disabled={!inputCode.trim()}
                icon={CheckCircle}
              >
                Complete
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Creator View */}
      {isCreator && (
        <div className="space-y-4">
          {runnerLocation ? (
            <div className="bg-green-50 rounded-lg p-4">
              <p className="text-sm text-green-800">
                <strong>Runner Location:</strong><br />
                Lat: {runnerLocation.latitude.toFixed(6)}<br />
                Lng: {runnerLocation.longitude.toFixed(6)}<br />
                Last updated: {new Date(runnerLocation.created_at).toLocaleTimeString()}
              </p>
            </div>
          ) : (
            <div className="bg-gray-50 rounded-lg p-4">
              <p className="text-sm text-gray-600">
                Waiting for runner to start location tracking...
              </p>
            </div>
          )}

          {proximityAlert && (
            <div className="bg-orange-50 border border-orange-200 rounded-lg p-4">
              <div className="flex items-center space-x-2">
                <AlertCircle className="h-5 w-5 text-orange-600" />
                <p className="text-orange-800 font-medium">
                  Runner is within {Math.round(proximityAlert.distance)}m of pickup location!
                </p>
              </div>
            </div>
          )}

          {/* Completion Code Display */}
          {generatedCode && (
            <div className="border-t pt-4">
              <h4 className="font-medium text-gray-900 mb-2">Completion Code</h4>
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <div className="text-center">
                  <p className="text-sm text-blue-600 mb-2">Share this code with the runner:</p>
                  <p className="text-3xl font-bold text-blue-800 tracking-wider">
                    {generatedCode}
                  </p>
                  <p className="text-xs text-blue-600 mt-2">
                    Code expires in 24 hours
                  </p>
                </div>
              </div>
            </div>
          )}

          {proximityAlert && !generatedCode && (
            <Button
              onClick={generateCompletionCode}
              className="w-full"
              icon={CheckCircle}
            >
              Generate Completion Code
            </Button>
          )}
        </div>
      )}
    </div>
  );
};