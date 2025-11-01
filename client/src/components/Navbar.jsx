import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const Navbar = () => {
  const { isAuthenticated, user, logout } = useAuth();

  const handleLogout = () => {
    logout();
  };

  return (
    <nav className="bg-indigo-600 text-white shadow-md">
      <div className="container mx-auto px-4 py-3 flex justify-between items-center">
        <Link to={isAuthenticated ? "/dashboard" : "/auth"} className="text-xl font-bold">NexStepAI</Link>
        <div className="flex space-x-4 items-center">
          {isAuthenticated ? (
            <>
              <Link to="/dashboard" className="hover:text-indigo-200">Dashboard</Link>
              <Link to="/roadmap" className="hover:text-indigo-200">Roadmap</Link>
              <span className="text-indigo-200">Welcome, {user?.name || user?.email}</span>
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