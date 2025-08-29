import React, { Suspense, lazy, useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { Button } from '../../components/UI/Button';

import { 
  User, MapPin, MessageCircle, DollarSign, 
  Truck,  Shield,  
} from 'lucide-react';

const RunnerAnimation = lazy(() => import('../../components/Animation/RunnerAnimation'));

export const HomePage: React.FC = () => {
  const { user } = useAuth();
  const [showAnimation, setShowAnimation] = useState(false);

    // Load animation only after page is ready + idle
  useEffect(() => {
    const timeout = setTimeout(() => setShowAnimation(true), 2000); // load after 2s idle
    return () => clearTimeout(timeout);
  }, []);


  const features = [
    {
      icon: <User className="h-8 w-8" />,
      title: "Easy Task Posting",
      description: "Post any errand or task you need help with in minutes"
    },
    {
      icon: <DollarSign className="h-8 w-8" />,
      title: "Fair Bidding System",
      description: "Runners bid on your tasks, you choose the best offer"
    },
    {
      icon: <MessageCircle className="h-8 w-8" />,
      title: "Real-time Chat",
      description: "Communicate directly with task creators and runners"
    },
    {
      icon: <MapPin className="h-8 w-8" />,
      title: "Location Tracking",
      description: "Track your runner's location for delivery tasks"
    },
    {
      icon: <Truck className="h-8 w-8" />,
      title: "Commuter Pickup",
      description: "Get items delivered along someone's existing route"
    },
    {
      icon: <Shield className="h-8 w-8" />,
      title: "Secure & Safe",
      description: "Built-in safety features and secure transactions"
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-blue-50">
      {/* ✅ RunnerAnimation only loads after page is idle */}
      {showAnimation && (
        <Suspense fallback={null}>
          <RunnerAnimation />
        </Suspense>
      )}
      
      {/* Navigation */}
      <nav className="bg-white/90 backdrop-blur-sm border-b sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-2">
              <div className="bg-blue-500 text-white p-2 rounded-lg">
                <User className="h-6 w-6" />
              </div>
              <span className="text-xl font-bold text-gray-900">Errands Runner</span>
            </div>

            {user ? (
              <div className="flex items-center space-x-4">
                <Link
                  to="/dashboard"
                  className="text-gray-600 hover:text-blue-600 px-3 py-2 rounded-md text-sm font-medium transition-colors"
                >
                  Dashboard
                </Link>
                <Link
                  to="/tasks"
                  className="text-gray-600 hover:text-blue-600 px-3 py-2 rounded-md text-sm font-medium transition-colors"
                >
                  Tasks
                </Link>
                <Link
                  to="/create-task"
                  className="bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 transition-colors"
                >
                  Create Task
                </Link>
              </div>
            ) : (
              <div className="flex items-center space-x-4">
                <Link
                  to="/auth/login"
                  className="text-gray-600 hover:text-blue-600 px-3 py-2 rounded-md text-sm font-medium transition-colors"
                >
                  Sign In
                </Link>
                <Link
                  to="/auth/signup"
                  className="bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 transition-colors"
                >
                  Get Started
                </Link>
              </div>
            )}
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto text-center">
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-gray-900 mb-6">
            Like Uber, but for
            <span className="text-blue-600 block">Errands & Tasks</span>
          </h1>
          <p className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto">
            Need help with shopping, deliveries, or home tasks? Connect with local runners 
            who can help you get things done quickly and affordably.
          </p>
          
          {!user ? (
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link to="/auth/signup">
                <Button size="lg" className="w-full sm:w-auto">
                  Get Started Free
                </Button>
              </Link>
              <Link to="/auth/login">
                <Button size="lg" variant="outline" className="w-full sm:w-auto">
                  Sign In
                </Button>
              </Link>
            </div>
          ) : (
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link to="/create-task">
                <Button size="lg" className="w-full sm:w-auto">
                  Post a Task
                </Button>
              </Link>
              <Link to="/tasks">
                <Button size="lg" variant="outline" className="w-full sm:w-auto">
                  Browse Tasks
                </Button>
              </Link>
            </div>
          )}
        </div>
      </section>

      {/* How It Works */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl lg:text-4xl font-bold text-gray-900 mb-4">
              How It Works
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Getting help with your errands has never been easier
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="bg-blue-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-6">
                <span className="text-2xl font-bold text-blue-600">1</span>
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-4">Post Your Task</h3>
              <p className="text-gray-600">
                Describe what you need help with, set your budget, and add location details
              </p>
            </div>

            <div className="text-center">
              <div className="bg-blue-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-6">
                <span className="text-2xl font-bold text-blue-600">2</span>
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-4">Get Bids</h3>
              <p className="text-gray-600">
                Qualified runners bid on your task with their price and message
              </p>
            </div>

            <div className="text-center">
              <div className="bg-blue-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-6">
                <span className="text-2xl font-bold text-blue-600">3</span>
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-4">Get It Done</h3>
              <p className="text-gray-600">
                Choose your preferred runner and track progress until completion
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl lg:text-4xl font-bold text-gray-900 mb-4">
              Powerful Features
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Everything you need for seamless errand management
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <div key={index} className="bg-white rounded-lg shadow-sm p-6 hover:shadow-md transition-shadow">
                <div className="text-blue-600 mb-4">
                  {feature.icon}
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-3">
                  {feature.title}
                </h3>
                <p className="text-gray-600">
                  {feature.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Commuter Pickup Feature */}
      <section className="py-20 bg-blue-600 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <div className="bg-white/20 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-6">
              <Truck className="h-8 w-8" />
            </div>
            <h2 className="text-3xl lg:text-4xl font-bold mb-4">
              Introducing Commuter Pickup
            </h2>
            <p className="text-xl text-blue-100 max-w-3xl mx-auto">
              Need something delivered from Point A to Point B? Connect with commuters 
              already traveling that route for affordable, eco-friendly deliveries.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
            <div>
              <h3 className="text-2xl font-semibold mb-6">Perfect for:</h3>
              <ul className="space-y-4">
                <li className="flex items-center space-x-3">
                  <div className="w-2 h-2 bg-white rounded-full"></div>
                  <span>Documents and packages</span>
                </li>
                <li className="flex items-center space-x-3">
                  <div className="w-2 h-2 bg-white rounded-full"></div>
                  <span>Small items and gifts</span>
                </li>
                <li className="flex items-center space-x-3">
                  <div className="w-2 h-2 bg-white rounded-full"></div>
                  <span>Food and groceries</span>
                </li>
                <li className="flex items-center space-x-3">
                  <div className="w-2 h-2 bg-white rounded-full"></div>
                  <span>Urgent deliveries</span>
                </li>
              </ul>
            </div>

            <div className="bg-white/10 rounded-lg p-6">
              <h4 className="text-lg font-semibold mb-4">How it works:</h4>
              <div className="space-y-3 text-sm">
                <div className="flex items-start space-x-3">
                  <div className="bg-white/20 w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold mt-0.5">1</div>
                  <span>Post your delivery task with pickup and drop-off locations</span>
                </div>
                <div className="flex items-start space-x-3">
                  <div className="bg-white/20 w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold mt-0.5">2</div>
                  <span>Commuters traveling your route can claim the task</span>
                </div>
                <div className="flex items-start space-x-3">
                  <div className="bg-white/20 w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold mt-0.5">3</div>
                  <span>Track delivery progress and get real-time updates</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl lg:text-4xl font-bold text-gray-900 mb-6">
            Ready to Get Started?
          </h2>
          <p className="text-xl text-gray-600 mb-8">
            Join thousands of people already using Errands Runner to get things done.
          </p>
          
          {!user ? (
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link to="/auth/signup">
                <Button size="lg" className="w-full sm:w-auto">
                  Sign Up Free
                </Button>
              </Link>
              <Link to="/auth/login">
                <Button size="lg" variant="outline" className="w-full sm:w-auto">
                  Sign In
                </Button>
              </Link>
            </div>
          ) : (
            <Link to="/dashboard">
              <Button size="lg">
                Go to Dashboard
              </Button>
            </Link>
          )}
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="flex items-center space-x-2 mb-4 md:mb-0">
              <div className="bg-blue-500 text-white p-2 rounded-lg">
                <User className="h-6 w-6" />
              </div>
              <span className="text-xl font-bold">Errands Runner</span>
            </div>
            <div className="text-sm text-gray-400">
              © 2025 Errands Runner. All rights reserved.
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default HomePage;