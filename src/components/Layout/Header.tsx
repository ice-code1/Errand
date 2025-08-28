import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { adminService } from '../../services/admin';
import { User, LogOut, Plus, List, Shield } from 'lucide-react';

export const Header: React.FC = () => {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();
  const [isAdmin, setIsAdmin] = React.useState(false);

  React.useEffect(() => {
    const checkAdminStatus = async () => {
      if (user) {
        try {
          const adminStatus = await adminService.isAdmin();
          setIsAdmin(adminStatus);
        } catch (error) {
          console.error('Error checking admin status:', error);
        }
      }
    };

    checkAdminStatus();
  }, [user]);

  const handleSignOut = async () => {
    await signOut();
    navigate('/');
  };

  return (
    <header className="bg-white shadow-sm border-b">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <Link to="/" className="flex items-center space-x-2">
            <div className="bg-blue-500 text-white p-2 rounded-lg">
              <User className="h-6 w-6" />
            </div>
            <span className="text-xl font-bold text-gray-900">Errands Runner</span>
          </Link>

          {user && (
            <nav className="hidden md:flex items-center space-x-4">
              <Link
                to="/dashboard"
                className="text-gray-600 hover:text-blue-600 px-3 py-2 rounded-md text-sm font-medium transition-colors"
              >
                Dashboard
              </Link>
              <Link
                to="/tasks"
                className="flex items-center space-x-1 text-gray-600 hover:text-blue-600 px-3 py-2 rounded-md text-sm font-medium transition-colors"
              >
                <List className="h-4 w-4" />
                <span>Tasks</span>
              </Link>
              {isAdmin && (
                <>
                  <Link
                    to="/admin"
                    className="flex items-center space-x-1 text-gray-600 hover:text-blue-600 px-3 py-2 rounded-md text-sm font-medium transition-colors"
                  >
                    <Shield className="h-4 w-4" />
                    <span>Admin</span>
                  </Link>
                  <Link
                    to="/kyc"
                    className="text-gray-600 hover:text-blue-600 px-3 py-2 rounded-md text-sm font-medium transition-colors"
                  >
                    KYC
                  </Link>
                </>
              )}
              <Link
                to="/create-task"
                className="flex items-center space-x-1 bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 transition-colors"
              >
                <Plus className="h-4 w-4" />
                <span>Create Task</span>
              </Link>
              <div className="flex items-center space-x-2">
                <span className="text-sm text-gray-600">
                  {user.profile?.full_name || user.email}
                </span>
                <button
                  onClick={handleSignOut}
                  className="text-gray-400 hover:text-red-500 p-1 rounded transition-colors"
                  title="Sign out"
                >
                  <LogOut className="h-5 w-5" />
                </button>
              </div>
            </nav>
          )}

        </div>
      </div>
    </header>
  );
};