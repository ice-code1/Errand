import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider } from './contexts/AuthContext';
import { ProtectedRoute } from './components/ProtectedRoute';

// Pages
import { HomePage } from './modules/home/HomePage';
import { LoginPage } from './modules/auth/LoginPage';
import { SignUpPage } from './modules/auth/SignUpPage';
import { ForgotPasswordPage } from './modules/auth/ForgotPasswordPage';
import { DashboardPage } from './modules/dashboard/DashboardPage';
import { TasksPage } from './modules/tasks/TasksPage';
import { CreateTaskPage } from './modules/tasks/CreateTaskPage';
import { TaskDetailPage } from './modules/tasks/TaskDetailPage';
import { ProfilePage } from './modules/profile/ProfilePage';
import { AdminDashboard } from './modules/admin/AdminDashboard';
import { AdminAnalytics } from './modules/admin/AdminAnalytics';
import { AdminUsers } from './modules/admin/AdminUsers';
import { AdminTasks } from './modules/admin/AdminTasks';
import { AdminSettings } from './modules/admin/AdminSettings';
import { AdminRoute } from './components/AdminRoute';
import { KYCVerificationPage } from './modules/kyc/KYCVerificationPage';

function App() {
  return (
    <AuthProvider>
      <Router>
        <div className="App">
          <Routes>
            {/* Public Routes */}
            <Route path="/" element={<HomePage />} />
            <Route path="/auth/login" element={<LoginPage />} />
            <Route path="/auth/signup" element={<SignUpPage />} />
            <Route path="/auth/forgot-password" element={<ForgotPasswordPage />} />
            <Route
              path="/kyc"
              element={
                <ProtectedRoute>
                  <KYCVerificationPage />
                </ProtectedRoute>
              }
            />

            {/* Protected Routes */}
            <Route
              path="/dashboard"
              element={
                <ProtectedRoute>
                  <DashboardPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/tasks"
              element={
                <ProtectedRoute>
                  <TasksPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/tasks/:id"
              element={
                <ProtectedRoute>
                  <TaskDetailPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/create-task"
              element={
                <ProtectedRoute>
                  <CreateTaskPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/profile"
              element={
                <ProtectedRoute>
                  <ProfilePage />
                </ProtectedRoute>
              }
            />

            {/* Admin Routes */}
            <Route
              path="/admin"
              element={
                <AdminRoute>
                  <AdminDashboard />
                </AdminRoute>
              }
            />
            <Route
              path="/admin/analytics"
              element={
                <AdminRoute>
                  <AdminAnalytics />
                </AdminRoute>
              }
            />
            <Route
              path="/admin/users"
              element={
                <AdminRoute>
                  <AdminUsers />
                </AdminRoute>
              }
            />
            <Route
              path="/admin/tasks"
              element={
                <AdminRoute>
                  <AdminTasks />
                </AdminRoute>
              }
            />
            <Route
              path="/admin/settings"
              element={
                <AdminRoute>
                  <AdminSettings />
                </AdminRoute>
              }
            />

            {/* Catch all route */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>

          <Toaster
            position="top-right"
            toastOptions={{
              duration: 4000,
              style: {
                background: '#363636',
                color: '#fff',
              },
              success: {
                style: {
                  background: '#10b981',
                },
              },
              error: {
                style: {
                  background: '#ef4444',
                },
              },
            }}
          />
        </div>
      </Router>
    </AuthProvider>
  );
}

export default App;