import  { Suspense, lazy } from "react";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import { Toaster } from "react-hot-toast";
import { AuthProvider } from "./contexts/AuthContext";
import { ProtectedRoute } from "./components/ProtectedRoute";
import { AdminRoute } from "./components/AdminRoute";

// ✅ Lazy-loaded pages
const HomePage = lazy(() => import("./modules/home/HomePage"));
const LoginPage = lazy(() => import("./modules/auth/LoginPage"));
const SignUpPage = lazy(() => import("./modules/auth/SignUpPage"));
const ForgotPasswordPage = lazy(() => import("./modules/auth/ForgotPasswordPage"));
const DashboardPage = lazy(() => import("./modules/dashboard/DashboardPage"));
const TasksPage = lazy(() => import("./modules/tasks/TasksPage"));
const CreateTaskPage = lazy(() => import("./modules/tasks/CreateTaskPage"));
const TaskDetailPage = lazy(() => import("./modules/tasks/TaskDetailPage"));
const ProfilePage = lazy(() => import("./modules/profile/ProfilePage"));
const AdminDashboard = lazy(() => import("./modules/admin/AdminDashboard"));
const AdminAnalytics = lazy(() => import("./modules/admin/AdminAnalytics"));
const AdminUsers = lazy(() => import("./modules/admin/AdminUsers"));
const AdminTasks = lazy(() => import("./modules/admin/AdminTasks"));
const AdminSettings = lazy(() => import("./modules/admin/AdminSettings"));
const KYCVerificationPage = lazy(() => import("./modules/kyc/KYCVerificationPage"));

function App() {
  return (
    <AuthProvider>
      <Router>
        <div className="App">
          {/* ✅ Wrap routes in Suspense */}
          <Suspense fallback={<div className="p-8 text-center">Loading...</div>}>
            <Routes>
              {/* Public Routes */}
              <Route path="/" element={<HomePage />} />
              <Route path="/auth/login" element={<LoginPage />} />
              <Route path="/auth/signup" element={<SignUpPage />} />
              <Route path="/auth/forgot-password" element={<ForgotPasswordPage />} />

              {/* Protected User Routes */}
              <Route
                path="/kyc"
                element={
                  <ProtectedRoute>
                    <KYCVerificationPage />
                  </ProtectedRoute>
                }
              />
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
          </Suspense>

          {/* Toast Notifications */}
          <Toaster
            position="top-right"
            toastOptions={{
              duration: 4000,
              style: {
                background: "#363636",
                color: "#fff",
              },
              success: {
                style: { background: "#10b981" },
              },
              error: {
                style: { background: "#ef4444" },
              },
            }}
          />
        </div>
      </Router>
    </AuthProvider>
  );
}

export default App;
