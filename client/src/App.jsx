import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import RoleProtectedRoute from './components/RoleProtectedRoute';
import GoalSelection from './pages/GoalSelection';
import SkillLevel from './pages/SkillLevel';
import TimeSelection from './pages/TimeSelection';
import Auth from './pages/Auth';

// User pages
import UserDashboard from './pages/user/Dashboard';
import Profile from './pages/user/Profile';
import RoadmapView from './pages/user/RoadmapView';

// Admin pages
import AdminDashboard from './pages/admin/AdminDashboard';
import ManageGoals from './pages/admin/ManageGoals';
import ManageUsers from './pages/admin/ManageUsers';

function App() {
  return (
    <AuthProvider>
      <Router>
        <div className="min-h-screen bg-gray-50">
          <Routes>
            {/* Redirect root to auth page */}
            <Route path="/" element={<Navigate to="/auth" replace />} />
            
            {/* Public route - Authentication */}
            <Route path="/auth" element={<Auth />} />
            
            {/* Protected routes - require authentication */}
            <Route path="/goal-selection" element={
              <ProtectedRoute>
                <GoalSelection />
              </ProtectedRoute>
            } />
            <Route path="/skill-level" element={
              <ProtectedRoute>
                <SkillLevel />
              </ProtectedRoute>
            } />
            <Route path="/time-selection" element={
              <ProtectedRoute>
                <TimeSelection />
              </ProtectedRoute>
            } />
            
            {/* User routes - require 'user' role */}
            <Route path="/user/dashboard" element={
              <RoleProtectedRoute requiredRole="user">
                <UserDashboard />
              </RoleProtectedRoute>
            } />
            <Route path="/user/profile" element={
              <RoleProtectedRoute requiredRole="user">
                <Profile />
              </RoleProtectedRoute>
            } />
            <Route path="/user/roadmap" element={
              <RoleProtectedRoute requiredRole="user">
                <RoadmapView />
              </RoleProtectedRoute>
            } />
            
            {/* Admin routes - require 'admin' role */}
            <Route path="/admin/dashboard" element={
              <RoleProtectedRoute requiredRole="admin">
                <AdminDashboard />
              </RoleProtectedRoute>
            } />
            <Route path="/admin/goals" element={
              <RoleProtectedRoute requiredRole="admin">
                <ManageGoals />
              </RoleProtectedRoute>
            } />
            <Route path="/admin/users" element={
              <RoleProtectedRoute requiredRole="admin">
                <ManageUsers />
              </RoleProtectedRoute>
            } />
            
            {/* Legacy routes - redirect to role-based routes */}
            <Route path="/dashboard" element={<Navigate to="/user/dashboard" replace />} />
            <Route path="/admin" element={<Navigate to="/admin/dashboard" replace />} />
            
            {/* Catch all route - redirect to auth */}
            <Route path="*" element={<Navigate to="/auth" replace />} />
          </Routes>
        </div>
      </Router>
    </AuthProvider>
  );
}

export default App;