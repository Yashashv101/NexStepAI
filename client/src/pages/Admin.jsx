import { useState, useEffect } from 'react';
import { getGoals, createGoal } from '../services/api';

function Admin() {
  const [resources, setResources] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  useEffect(() => {
    const fetchGoals = async () => {
      try {
        setLoading(true);
        const response = await getGoals();
        
        // Transform API data to match component structure
        const formattedGoals = response.data.map(goal => ({
          id: goal._id,
          name: goal.name,
          category: 'Learning',
          level: 'All Levels'
        }));
        
        setResources(formattedGoals);
      } catch (err) {
        console.error('Failed to fetch goals:', err);
        setError('Failed to load resources. Please try again later.');
        // Fallback to sample data
        setResources([
          { id: 1, name: 'HTML & CSS Crash Course', category: 'Frontend', level: 'Beginner' },
          { id: 2, name: 'JavaScript Fundamentals', category: 'Frontend', level: 'Beginner' },
        ]);
      } finally {
        setLoading(false);
      }
    };

    fetchGoals();
  }, []);

  const [formData, setFormData] = useState({
    name: '',
    category: 'Frontend',
    level: 'Beginner'
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    try {
      // Create goal data from form
      const goalData = {
        name: formData.name,
        description: `${formData.category} resource for ${formData.level} level`
      };
      
      // Send to API
      const response = await createGoal(goalData);
      
      // Add to UI with API response data
      const newResource = {
        id: response.data._id,
        name: response.data.name,
        category: formData.category,
        level: formData.level
      };
      
      setResources([...resources, newResource]);
      setFormData({
        name: '',
        category: 'Frontend',
        level: 'Beginner'
      });
    } catch (err) {
      console.error('Error creating resource:', err);
      alert('Failed to create resource. Please try again.');
    }
  };

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold text-indigo-700 mb-8">Admin Dashboard</h1>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-1">
          <div className="bg-white rounded-xl shadow-md p-6">
            <h2 className="text-xl font-semibold text-gray-800 mb-4">Add Learning Resource</h2>
            
            <form onSubmit={handleSubmit}>
              <div className="mb-4">
                <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
                  Course Name
                </label>
                <input
                  type="text"
                  id="name"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  required
                />
              </div>
              
              <div className="mb-4">
                <label htmlFor="category" className="block text-sm font-medium text-gray-700 mb-1">
                  Category
                </label>
                <select
                  id="category"
                  name="category"
                  value={formData.category}
                  onChange={handleChange}
                  className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                >
                  <option value="Frontend">Frontend</option>
                  <option value="Backend">Backend</option>
                  <option value="Database">Database</option>
                  <option value="DevOps">DevOps</option>
                  <option value="Mobile">Mobile</option>
                </select>
              </div>
              
              <div className="mb-6">
                <label htmlFor="level" className="block text-sm font-medium text-gray-700 mb-1">
                  Level
                </label>
                <select
                  id="level"
                  name="level"
                  value={formData.level}
                  onChange={handleChange}
                  className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                >
                  <option value="Beginner">Beginner</option>
                  <option value="Intermediate">Intermediate</option>
                  <option value="Advanced">Advanced</option>
                </select>
              </div>
              
              <button
                type="submit"
                className="w-full py-2 px-4 bg-indigo-600 text-white font-medium rounded-lg hover:bg-indigo-700 transition-colors"
              >
                Add Resource
              </button>
            </form>
          </div>
        </div>
        
        <div className="lg:col-span-2">
          <div className="bg-white rounded-xl shadow-md p-6">
            <h2 className="text-xl font-semibold text-gray-800 mb-4">Learning Resources</h2>
            
            {resources.length === 0 ? (
              <p className="text-gray-500">No resources added yet.</p>
            ) : (
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Name
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Category
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Level
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {resources.map((resource) => (
                      <tr key={resource.id}>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                          {resource.name}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          <span className="px-2 py-1 bg-indigo-100 text-indigo-800 rounded-full text-xs">
                            {resource.category}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {resource.level}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default Admin;