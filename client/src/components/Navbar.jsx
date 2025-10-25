import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const Navbar = () => {
  const { isAuthenticated, user, logout } = useAuth();

  const handleLogout = () => {
    logout();
  };

  const getUserDashboardLink = () => {
    if (!user?.role) return "/user/dashboard";
    return user.role === 'admin' ? "/admin/dashboard" : "/user/dashboard";
  };

  const renderUserNavigation = () => {
    if (user?.role === 'admin') {
      return (
        <>
          <Link to="/admin/dashboard" className="hover:text-indigo-200">Dashboard</Link>
          <Link to="/admin/goals" className="hover:text-indigo-200">Manage Goals</Link>
          <Link to="/admin/users" className="hover:text-indigo-200">Manage Users</Link>
        </>
      );
    } else {
      return (
        <>
          <Link to="/user/dashboard" className="hover:text-indigo-200">Dashboard</Link>
          <Link to="/user/profile" className="hover:text-indigo-200">Profile</Link>
          <Link to="/user/roadmap" className="hover:text-indigo-200">Roadmap</Link>
        </>
      );
    }
  };

  return (
    <nav className="bg-indigo-600 text-white shadow-md">
      <div className="container mx-auto px-4 py-3 flex justify-between items-center">
        <Link to={isAuthenticated ? getUserDashboardLink() : "/auth"} className="text-xl font-bold">
          NexStepAI
        </Link>
        <div className="flex space-x-4 items-center">
          {isAuthenticated ? (
            <>
              {renderUserNavigation()}
              <div className="flex items-center space-x-2">
                <span className="text-indigo-200 text-sm">
                  Welcome, {user?.name || user?.email}
                </span>
                {user?.role && (
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                    user.role === 'admin' 
                      ? 'bg-purple-500 text-white' 
                      : 'bg-green-500 text-white'
                  }`}>
                    {user.role}
                  </span>
                )}
              </div>
              <button 
                onClick={handleLogout}
                className="hover:text-indigo-200 bg-indigo-700 px-3 py-1 rounded"
              >
                Logout
              </button>
            </>
          ) : (
            <Link to="/auth" className="hover:text-indigo-200">Login</Link>
          )}
        </div>
      </div>
    </nav>
  );
};

export default Navbar;