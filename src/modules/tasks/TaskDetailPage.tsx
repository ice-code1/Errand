import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { taskService } from '../../services/tasks';
import { chatService } from '../../services/chat';
import { kycService } from '../../services/kyc';
import { useAuth } from '../../contexts/AuthContext';
import { Layout } from '../../components/Layout/Layout';
import { LocationTracker } from '../../components/LocationTracker';
import { Button } from '../../components/UI/Button';
import { Input } from '../../components/UI/Input';
import { TextArea } from '../../components/UI/TextArea';
import { formatDistanceToNow } from 'date-fns';
import { 
  MapPin, DollarSign, Clock, User, Send, MessageCircle, 
  CheckCircle, PlayCircle, XCircle 
} from 'lucide-react';
import toast from 'react-hot-toast';

export const TaskDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [task, setTask] = useState<any>(null);
  const [messages, setMessages] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [bidAmount, setBidAmount] = useState('');
  const [bidMessage, setBidMessage] = useState('');
  const [chatMessage, setChatMessage] = useState('');
  const [showBidForm, setShowBidForm] = useState(false);
  const [showChat, setShowChat] = useState(false);
  const [isKYCVerified, setIsKYCVerified] = useState(false);
  const { user } = useAuth();
  const navigate = useNavigate();

  const fetchTaskData = async () => {
    if (!id) return;
    
    try {
      const taskData = await taskService.getTaskById(id);
      setTask(taskData);

      if (taskData && (taskData.creator_id === user?.id || taskData.runner_id === user?.id)) {
        const messagesData = await chatService.getMessages(id);
        setMessages(messagesData || []);
      }
    } catch (error: any) {
      toast.error('Failed to load task details');
      navigate('/tasks');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTaskData();
    checkKYCStatus();

    if (id) {
      // Subscribe to real-time updates
      const taskSubscription = taskService.subscribeToTasks((payload: any) => {
        if (payload.new?.id === id || payload.old?.id === id) {
          fetchTaskData();
        }
      });

      const bidsSubscription = taskService.subscribeToBids(id, () => {
        fetchTaskData();
      });

      return () => {
        taskSubscription.unsubscribe();
        bidsSubscription.unsubscribe();
      };
    }
  }, [id]);

  const checkKYCStatus = async () => {
    try {
      const verified = await kycService.checkKYCVerified();
      setIsKYCVerified(verified);
    } catch (error) {
      console.error('Failed to check KYC status:', error);
    }
  };

  useEffect(() => {
    if (id && showChat) {
      const messagesSubscription = chatService.subscribeToMessages(id, (newMessage) => {
        setMessages(prev => [...prev, newMessage]);
      });

      return () => {
        messagesSubscription.unsubscribe();
      };
    }
  }, [id, showChat]);

  const handleSubmitBid = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!isKYCVerified) {
      toast.error('Please complete KYC verification to place bids');
      navigate('/kyc');
      return;
    }
    
    if (!id || !bidAmount) return;

    try {
      await taskService.createBid(id, Number(bidAmount), bidMessage);
      toast.success('Bid submitted successfully!');
      setShowBidForm(false);
      setBidAmount('');
      setBidMessage('');
      fetchTaskData();
    } catch (error: any) {
      toast.error(error.message || 'Failed to submit bid');
    }
  };

  const handleAcceptBid = async (bidId: string, runnerId: string) => {
    if (!id) return;

    try {
      await taskService.acceptBid(bidId, id, runnerId);
      toast.success('Bid accepted successfully!');
      fetchTaskData();
    } catch (error: any) {
      toast.error(error.message || 'Failed to accept bid');
    }
  };

  const handleUpdateTaskStatus = async (status: string) => {
    if (!id) return;

    try {
      await taskService.updateTask(id, { status: status as any });
      toast.success('Task status updated!');
      fetchTaskData();
    } catch (error: any) {
      toast.error(error.message || 'Failed to update task status');
    }
  };

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!id || !chatMessage.trim()) return;

    try {
      await chatService.sendMessage(id, chatMessage);
      setChatMessage('');
    } catch (error: any) {
      toast.error('Failed to send message');
    }
  };

  if (loading) {
    return (
      <Layout>
        <div className="max-w-4xl mx-auto px-4 py-8">
          <div className="animate-pulse bg-white rounded-lg shadow-sm h-96"></div>
        </div>
      </Layout>
    );
  }

  if (!task) {
    return (
      <Layout>
        <div className="max-w-4xl mx-auto px-4 py-8 text-center">
          <h2 className="text-xl font-semibold text-gray-900">Task not found</h2>
          <Button onClick={() => navigate('/tasks')} className="mt-4">
            Back to Tasks
          </Button>
        </div>
      </Layout>
    );
  }

  const isOwner = task.creator_id === user?.id;
  const isRunner = task.runner_id === user?.id;
  const canBid = !isOwner && !isRunner && task.status === 'posted' && user?.profile?.is_runner && isKYCVerified;
  const canChat = isOwner || isRunner;

  return (
    <Layout>
      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
          {/* Task Header */}
          <div className="flex justify-between items-start mb-6">
            <div>
              <h1 className="text-2xl font-bold text-gray-900 mb-2">{task.title}</h1>
              <div className="flex items-center space-x-4 text-sm text-gray-500">
                <div className="flex items-center space-x-1">
                  <Clock className="h-4 w-4" />
                  <span>{formatDistanceToNow(new Date(task.created_at), { addSuffix: true })}</span>
                </div>
                <span className="capitalize">{task.category}</span>
              </div>
            </div>
            <div className="flex flex-col items-end space-y-2">
              <div className="flex items-center space-x-1 text-lg font-semibold text-green-600">
                <DollarSign className="h-5 w-5" />
                <span>{task.budget}</span>
              </div>
              <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                task.status === 'posted' ? 'bg-blue-100 text-blue-800' :
                task.status === 'accepted' ? 'bg-yellow-100 text-yellow-800' :
                task.status === 'in_progress' ? 'bg-orange-100 text-orange-800' :
                task.status === 'completed' ? 'bg-green-100 text-green-800' :
                'bg-red-100 text-red-800'
              }`}>
                {task.status.replace('_', ' ').toUpperCase()}
              </span>
              {task.is_commuter_pickup && (
                <span className="px-2 py-1 rounded-full text-xs font-medium bg-purple-100 text-purple-800">
                  Commuter Pickup
                </span>
              )}
            </div>
          </div>

          {/* Task Description */}
          <div className="mb-6">
            <h3 className="text-lg font-medium text-gray-900 mb-2">Description</h3>
            <p className="text-gray-600 whitespace-pre-line">{task.description}</p>
          </div>

          {/* Location Information */}
          {(task.location_pickup || task.location_delivery) && (
            <div className="mb-6">
              <h3 className="text-lg font-medium text-gray-900 mb-2">Location</h3>
              <div className="space-y-2">
                {task.location_pickup && (
                  <div className="flex items-center space-x-2">
                    <MapPin className="h-4 w-4 text-blue-500" />
                    <span className="text-sm text-gray-600">
                      {task.is_commuter_pickup ? 'Pickup: ' : 'Location: '}
                      {task.location_pickup}
                    </span>
                  </div>
                )}
                {task.location_delivery && (
                  <div className="flex items-center space-x-2">
                    <MapPin className="h-4 w-4 text-green-500" />
                    <span className="text-sm text-gray-600">
                      Delivery: {task.location_delivery}
                    </span>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Creator Information */}
          <div className="flex items-center justify-between mb-6 p-4 bg-gray-50 rounded-lg">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-gray-300 rounded-full flex items-center justify-center">
                <User className="h-5 w-5 text-gray-600" />
              </div>
              <div>
                <p className="font-medium text-gray-900">
                  {task.creator?.full_name || 'Anonymous'}
                </p>
                <p className="text-sm text-gray-500">Task Creator</p>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex space-x-4 mb-6">
            {canBid && (
              <Button 
                onClick={() => setShowBidForm(true)}
                disabled={showBidForm}
              >
                Place Bid
              </Button>
            )}
            
            {!isOwner && !isRunner && task.status === 'posted' && user?.profile?.is_runner && !isKYCVerified && (
              <Button 
                onClick={() => navigate('/kyc')}
                variant="outline"
              >
                Complete KYC to Bid
              </Button>
            )}

            {canChat && (
              <Button
                variant="outline"
                icon={MessageCircle}
                onClick={() => setShowChat(!showChat)}
              >
                {showChat ? 'Hide Chat' : 'Open Chat'}
              </Button>
            )}

            {isRunner && task.status === 'accepted' && (
              <Button
                icon={PlayCircle}
                onClick={() => handleUpdateTaskStatus('in_progress')}
              >
                Start Task
              </Button>
            )}

            {isRunner && task.status === 'in_progress' && (
              <Button
                icon={CheckCircle}
                onClick={() => handleUpdateTaskStatus('completed')}
              >
                Mark Complete
              </Button>
            )}

            {isOwner && ['posted', 'accepted'].includes(task.status) && (
              <Button
                variant="danger"
                icon={XCircle}
                onClick={() => handleUpdateTaskStatus('cancelled')}
              >
                Cancel Task
              </Button>
            )}
          </div>

          {/* Bid Form */}
          {showBidForm && (
            <div className="border-t pt-6 mb-6">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Place Your Bid</h3>
              <form onSubmit={handleSubmitBid} className="space-y-4">
                <Input
                  label="Bid Amount ($)"
                  type="number"
                  step="0.01"
                  min="0"
                  value={bidAmount}
                  onChange={(e) => setBidAmount(e.target.value)}
                  placeholder="Enter your bid amount"
                  required
                />
                <TextArea
                  label="Message (Optional)"
                  value={bidMessage}
                  onChange={(e) => setBidMessage(e.target.value)}
                  placeholder="Tell the task creator why you're the best choice..."
                  rows={3}
                />
                <div className="flex space-x-2">
                  <Button type="submit">Submit Bid</Button>
                  <Button 
                    type="button" 
                    variant="outline" 
                    onClick={() => setShowBidForm(false)}
                  >
                    Cancel
                  </Button>
                </div>
              </form>
            </div>
          )}

          {/* Chat Section */}
          {showChat && canChat && (
            <div className="border-t pt-6">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Chat</h3>
              <div className="bg-gray-50 rounded-lg p-4 mb-4 max-h-60 overflow-y-auto">
                {messages.length === 0 ? (
                  <p className="text-gray-500 text-center">No messages yet</p>
                ) : (
                  <div className="space-y-3">
                    {messages.map((message) => (
                      <div
                        key={message.id}
                        className={`flex ${
                          message.sender_id === user?.id ? 'justify-end' : 'justify-start'
                        }`}
                      >
                        <div
                          className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg ${
                            message.sender_id === user?.id
                              ? 'bg-blue-500 text-white'
                              : 'bg-white text-gray-900 border'
                          }`}
                        >
                          <p className="text-sm">{message.content}</p>
                          <p
                            className={`text-xs mt-1 ${
                              message.sender_id === user?.id
                                ? 'text-blue-100'
                                : 'text-gray-500'
                            }`}
                          >
                            {formatDistanceToNow(new Date(message.created_at), { addSuffix: true })}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
              <form onSubmit={handleSendMessage} className="flex space-x-2">
                <Input
                  value={chatMessage}
                  onChange={(e) => setChatMessage(e.target.value)}
                  placeholder="Type your message..."
                  className="flex-1"
                />
                <Button type="submit" icon={Send} disabled={!chatMessage.trim()}>
                  Send
                </Button>
              </form>
            </div>
          )}
        </div>

        {/* Location Tracker */}
        {(isOwner || isRunner) && ['accepted', 'in_progress'].includes(task.status) && (
          <LocationTracker
            taskId={task.id}
            isRunner={isRunner}
            isCreator={isOwner}
            taskStatus={task.status}
            onTaskComplete={fetchTaskData}
          />
        )}

        {/* Bids Section */}
        {task.bids && task.bids.length > 0 && (
          <div className="bg-white rounded-lg shadow-sm p-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4">
              Bids ({task.bids.length})
            </h3>
            <div className="space-y-4">
              {task.bids.map((bid: any) => (
                <div key={bid.id} className="border rounded-lg p-4">
                  <div className="flex justify-between items-start mb-2">
                    <div className="flex items-center space-x-3">
                      <div className="w-8 h-8 bg-gray-200 rounded-full flex items-center justify-center">
                        <User className="h-4 w-4 text-gray-500" />
                      </div>
                      <div>
                        <p className="font-medium text-gray-900">
                          {bid.runner?.full_name || 'Anonymous Runner'}
                        </p>
                        <p className="text-sm text-gray-500">
                          {formatDistanceToNow(new Date(bid.created_at), { addSuffix: true })}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-4">
                      <div className="text-lg font-semibold text-green-600">
                        ${bid.amount}
                      </div>
                      {isOwner && bid.status === 'pending' && task.status === 'posted' && (
                        <Button
                          size="sm"
                          onClick={() => handleAcceptBid(bid.id, bid.runner_id)}
                        >
                          Accept Bid
                        </Button>
                      )}
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                        bid.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                        bid.status === 'accepted' ? 'bg-green-100 text-green-800' :
                        'bg-red-100 text-red-800'
                      }`}>
                        {bid.status.toUpperCase()}
                      </span>
                    </div>
                  </div>
                  {bid.message && (
                    <p className="text-gray-600 text-sm mt-2">{bid.message}</p>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </Layout>
  );
};

export default TaskDetailPage;