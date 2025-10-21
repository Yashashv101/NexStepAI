import { Link } from 'react-router-dom';

const Navbar = () => {
  return (
    <nav className="bg-indigo-600 text-white shadow-md">
      <div className="container mx-auto px-4 py-3 flex justify-between items-center">
        <Link to="/" className="text-xl font-bold">NexStepAI</Link>
        <div className="flex space-x-4">
          <Link to="/dashboard" className="hover:text-indigo-200">Dashboard</Link>
          <Link to="/roadmap" className="hover:text-indigo-200">Roadmap</Link>
          <Link to="/auth" className="hover:text-indigo-200">Login</Link>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;