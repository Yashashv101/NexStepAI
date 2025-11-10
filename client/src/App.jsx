import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import RoleBasedRoute from './components/RoleBasedRoute';
import RoleBasedNavbar from './components/RoleBasedNavbar';

// Public pages
import Auth from './pages/Auth';
import GoalSelection from './pages/GoalSelection';
import TypographyShowcase from './components/TypographyShowcase';

// User pages
import Dashboard from './pages/user/Dashboard';
import Profile from './pages/user/Profile';
import RoadmapView from './pages/user/RoadmapView';
import AIRoadmapGenerator from './pages/user/AIRoadmapGenerator';
import ResumeAnalyzer from './pages/user/ResumeAnalyzer';

// Admin pages
import AdminDashboard from './pages/admin/AdminDashboard';
import ManageUsers from './pages/admin/ManageUsers';
import ManageGoals from './pages/admin/ManageGoals';
import ManageRoadmaps from './pages/admin/ManageRoadmaps';
import Analytics from './pages/admin/Analytics';

function App() {
  return (
    <AuthProvider>
      <Router>
        <div className="min-h-screen bg-gray-50">
          <RoleBasedNavbar />
          <Routes>
            {/* Public routes */}
            <Route path="/auth" element={<Auth />} />
            <Route path="/typography" element={<TypographyShowcase />} />

            {/* Onboarding routes - require authentication but no specific role */}
            <Route
              path="/goal-selection"
              element={
                <RoleBasedRoute requireAuth={true}>
                  <GoalSelection />
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
            <Route
              path="/user/ai-roadmap"
              element={
                <RoleBasedRoute allowedRoles={['user']}>
                  <AIRoadmapGenerator />
                </RoleBasedRoute>
              }
            />
            <Route
              path="/user/resume-analyzer"
              element={
                <RoleBasedRoute allowedRoles={['user']}>
                  <ResumeAnalyzer />
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
        </div>
      </Router>
    </AuthProvider>
  );
}

export default App;