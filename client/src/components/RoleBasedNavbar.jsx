import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { 
  Home, 
  User, 
  Map, 
  Target, 
  Settings, 
  LogOut, 
  Menu, 
  X,
  Users,
  BookOpen,
  BarChart3,
  Sparkles
} from 'lucide-react';
import { FileText } from 'lucide-react';

const RoleBasedNavbar = () => {
  const { isAuthenticated, user, logout } = useAuth();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/auth');
  };

  const userRole = user?.role || 'user';

  // Navigation items based on role
  const getNavigationItems = () => {
    if (userRole === 'admin') {
      return [
        { name: 'Dashboard', href: '/admin/dashboard', icon: Home },
        { name: 'Manage Users', href: '/admin/users', icon: Users },
        { name: 'Manage Goals', href: '/admin/goals', icon: Target },
        { name: 'Manage Roadmaps', href: '/admin/roadmaps', icon: Map },
        { name: 'Analytics', href: '/admin/analytics', icon: BarChart3 },
      ];
    } else {
      return [
        { name: 'Dashboard', href: '/dashboard', icon: Home },
        { name: 'AI Roadmap', href: '/user/ai-roadmap', icon: Sparkles },
        { name: 'Resume Analyzer', href: '/user/resume-analyzer', icon: FileText },
        { name: 'My Roadmaps', href: '/user/roadmaps', icon: Map },
        { name: 'Goals', href: '/goal-selection', icon: Target },
        { name: 'Profile', href: '/user/profile', icon: User },
      ];
    }
  };

  const navigationItems = getNavigationItems();

  if (!isAuthenticated) {
    return (
      <nav className="bg-[var(--bg-900)] shadow-lg border-b border-[rgba(230,239,239,0.12)]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center">
              <Link to="/auth" className="flex items-center">
                <span className="text-2xl font-bold text-[var(--text-primary)]">NexStepAI</span>
              </Link>
            </div>
            <div className="flex items-center">
              <Link 
                to="/auth" 
                className="text-[var(--muted)] hover:text-[var(--accent-green)] px-3 py-2 rounded-md text-sm font-medium"
              >
                Sign In
              </Link>
            </div>
          </div>
        </div>
      </nav>
    );
  }

  return (
    <nav className="bg-[var(--bg-900)] shadow-lg border-b border-[rgba(230,239,239,0.12)]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          {/* Logo and primary navigation */}
          <div className="flex">
            <div className="flex-shrink-0 flex items-center">
              <Link to={userRole === 'admin' ? '/admin/dashboard' : '/dashboard'} className="flex items-center">
                <span className="text-2xl font-bold text-[var(--text-primary)]">NexStepAI</span>
                {userRole === 'admin' && (
                  <span className="ml-2 px-2 py-1 text-xs font-semibold rounded-full bg-[rgba(29,185,84,0.08)] text-[var(--accent-green)] border border-[var(--accent-green)]">
                    Admin
                  </span>
                )}
              </Link>
            </div>
            
            {/* Desktop navigation */}
            <div className="hidden sm:ml-6 sm:flex sm:space-x-8">
              {navigationItems.map((item) => {
                const Icon = item.icon;
                const isActive = location.pathname === item.href;
                
                return (
                  <Link
                    key={item.name}
                    to={item.href}
                    className={`inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium ${
                      isActive
                        ? 'border-[var(--accent-green)] text-[var(--text-primary)]'
                        : 'border-transparent text-[var(--muted)] hover:border-[var(--accent-green)] hover:text-[var(--accent-green)]'
                    }`}
                  >
                    <Icon className="h-4 w-4 mr-2" />
                    {item.name}
                  </Link>
                );
              })}
            </div>
          </div>

          {/* User menu */}
          <div className="hidden sm:ml-6 sm:flex sm:items-center">
            <div className="flex items-center space-x-4">
              <span className="text-sm text-[var(--text-primary)]">
                Welcome, {user?.name || user?.email}
              </span>
              <button
                onClick={handleLogout}
                className="flex items-center text-[var(--text-primary)] hover:text-[var(--accent-green)] px-3 py-2 rounded-md text-sm font-medium"
              >
                <LogOut className="h-4 w-4 mr-2" />
                Logout
              </button>
            </div>
          </div>

          {/* Mobile menu button */}
          <div className="sm:hidden flex items-center">
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="inline-flex items-center justify-center p-2 rounded-md text-[var(--text-primary)] hover:text-[var(--accent-green)] hover:bg-[var(--bg-800)]"
            >
              {isMobileMenuOpen ? (
                <X className="h-6 w-6" />
              ) : (
                <Menu className="h-6 w-6" />
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile menu */}
      {isMobileMenuOpen && (
        <div className="sm:hidden">
          <div className="pt-2 pb-3 space-y-1">
            {navigationItems.map((item) => {
              const Icon = item.icon;
              const isActive = location.pathname === item.href;
              
              return (
                <Link
                  key={item.name}
                  to={item.href}
                  onClick={() => setIsMobileMenuOpen(false)}
                  className={`flex items-center pl-3 pr-4 py-2 border-l-4 text-base font-medium ${
                    isActive
                      ? 'bg-[rgba(29,185,84,0.08)] border-[var(--accent-green)] text-[var(--accent-green)]'
                      : 'border-transparent text-[var(--muted)] hover:bg-[var(--bg-800)] hover:border-[rgba(230,239,239,0.12)] hover:text-[var(--text-primary)]'
                  }`}
                >
                  <Icon className="h-5 w-5 mr-3" />
                  {item.name}
                </Link>
              );
            })}
          </div>
          <div className="pt-4 pb-3 border-t border-[rgba(230,239,239,0.12)]">
            <div className="flex items-center px-4">
              <div className="flex-shrink-0">
                <div className="h-10 w-10 rounded-full bg-[var(--bg-800)] flex items-center justify-center">
                  <User className="h-6 w-6 text-[var(--muted)]" />
                </div>
              </div>
              <div className="ml-3">
                <div className="text-base font-medium text-[var(--text-primary)]">
                  {user?.name || user?.email}
                </div>
                <div className="text-sm font-medium text-[var(--muted)]">
                  {userRole === 'admin' ? 'Administrator' : 'User'}
                </div>
              </div>
            </div>
            <div className="mt-3 space-y-1">
              <button
                onClick={handleLogout}
                className="flex items-center w-full px-4 py-2 text-base font-medium text-[var(--text-primary)] hover:text-[var(--accent-green)] hover:bg-[var(--bg-800)]"
              >
                <LogOut className="h-5 w-5 mr-3" />
                Logout
              </button>
            </div>
          </div>
        </div>
      )}
    </nav>
  );
};

export default RoleBasedNavbar;