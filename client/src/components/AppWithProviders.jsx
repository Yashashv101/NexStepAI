import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from '../context/AuthContext';
import { AppProvider } from '../context/AppContext';
import RoleBasedRoute from './RoleBasedRoute';
import RoleBasedNavbar from './RoleBasedNavbar';
import RoadmapModal from './RoadmapModal';
import ToastContainer from './ToastContainer';
import useAppContext from '../context/AppContext';

// Import pages
import Auth from '../pages/Auth';
import GoalSelection from '../pages/GoalSelection';
import SkillLevel from '../pages/user/SkillLevel';
import Dashboard from '../pages/user/Dashboard';
import Profile from '../pages/user/Profile';
import RoadmapView from '../pages/user/RoadmapView';
import AdminDashboard from '../pages/admin/AdminDashboard';
import ManageUsers from '../pages/admin/ManageUsers';
import ManageGoals from '../pages/admin/ManageGoals';
import ManageRoadmaps from '../pages/admin/ManageRoadmaps';
import Analytics from '../pages/admin/Analytics';

// Inner component that uses context
function AppContent() {
  const { toasts, removeToast } = useAppContext();

  return (
    <Router>
      <div className="min-h-screen bg-gray-50">
        <RoleBasedNavbar />
        <Routes>
          {/* Public routes */}
          <Route path="/auth" element={<Auth />} />

          {/* Onboarding routes - require authentication but no specific role */}
          <Route
            path="/goal-selection"
            element={
              <RoleBasedRoute requireAuth={true}>
                <GoalSelection />
              </RoleBasedRoute>
            }
          />
          <Route
            path="/skill-level"
            element={
              <RoleBasedRoute requireAuth={true}>
                <SkillLevel />
              </RoleBasedRoute>
            }
          />

          {/* User routes */}
          <Route
            path="/dashboard"
            element={
              <RoleBasedRoute allowedRoles={['user']}>
                <Dashboard />
              </RoleBasedRoute>
            }
          />
          <Route
            path="/user/profile"
            element={
              <RoleBasedRoute allowedRoles={['user']}>
                <Profile />
              </RoleBasedRoute>
            }
          />
          <Route
            path="/user/roadmaps"
            element={
              <RoleBasedRoute allowedRoles={['user']}>
                <RoadmapView />
              </RoleBasedRoute>
            }
          />

          {/* Admin routes */}
          <Route
            path="/admin/dashboard"
            element={
              <RoleBasedRoute allowedRoles={['admin']}>
                <AdminDashboard />
              </RoleBasedRoute>
            }
          />
          <Route
            path="/admin/users"
            element={
              <RoleBasedRoute allowedRoles={['admin']}>
                <ManageUsers />
              </RoleBasedRoute>
            }
          />
          <Route
            path="/admin/goals"
            element={
              <RoleBasedRoute allowedRoles={['admin']}>
                <ManageGoals />
              </RoleBasedRoute>
            }
          />
          <Route
            path="/admin/roadmaps"
            element={
              <RoleBasedRoute allowedRoles={['admin']}>
                <ManageRoadmaps />
              </RoleBasedRoute>
            }
          />
          <Route
            path="/admin/analytics"
            element={
              <RoleBasedRoute allowedRoles={['admin']}>
                <Analytics />
              </RoleBasedRoute>
            }
          />

          {/* Default redirects */}
          <Route path="/" element={<Navigate to="/auth" replace />} />
          <Route path="*" element={<Navigate to="/auth" replace />} />
        </Routes>

        {/* Global components */}
        <RoadmapModal />
        <ToastContainer toasts={toasts} onRemoveToast={removeToast} />
      </div>
    </Router>
  );
}

// Main App component with providers
function App() {
  return (
    <AuthProvider>
      <AppProvider>
        <AppContent />
      </AppProvider>
    </AuthProvider>
  );
}

export default App;