import { useState, useEffect } from 'react';
import { getGoals } from '../../services/api';

function ManageGoals() {
  const [goals, setGoals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [editingGoal, setEditingGoal] = useState(null);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    category: '',
    difficulty: 'beginner'
  });

  useEffect(() => {
    fetchGoals();
  }, []);

  const fetchGoals = async () => {
    try {
      setLoading(true);
      const response = await getGoals();
      if (response.success && response.data) {
        setGoals(response.data);
      } else {
        throw new Error('Failed to fetch goals');
      }
    } catch (err) {
      console.error('Failed to fetch goals:', err);
      setError('Failed to load goals. Please try again later.');
      setGoals([]);
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleCreateGoal = () => {
    setFormData({
      title: '',
      description: '',
      category: '',
      difficulty: 'beginner'
    });
    setEditingGoal(null);
    setShowCreateModal(true);
  };

  const handleEditGoal = (goal) => {
    setFormData({
      title: goal.title || '',
      description: goal.description || '',
      category: goal.category || '',
      difficulty: goal.difficulty || 'beginner'
    });
    setEditingGoal(goal);
    setShowCreateModal(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      // TODO: Implement actual API calls for create/update
      console.log(editingGoal ? 'Updating goal:' : 'Creating goal:', formData);
      
      if (editingGoal) {
        // Update existing goal
        const updatedGoals = goals.map(goal => 
          goal._id === editingGoal._id 
            ? { ...goal, ...formData }
            : goal
        );
        setGoals(updatedGoals);
      } else {
        // Create new goal
        const newGoal = {
          _id: Date.now().toString(),
          ...formData,
          createdAt: new Date().toISOString()
        };
        setGoals([...goals, newGoal]);
      }
      
      setShowCreateModal(false);
      setEditingGoal(null);
    } catch (error) {
      console.error('Failed to save goal:', error);
    }
  };

  const handleDeleteGoal = async (goalId) => {
    if (window.confirm('Are you sure you want to delete this goal?')) {
      try {
        // TODO: Implement actual API call for delete
        console.log('Deleting goal:', goalId);
        setGoals(goals.filter(goal => goal._id !== goalId));
      } catch (error) {
        console.error('Failed to delete goal:', error);
      }
    }
  };

  const closeModal = () => {
    setShowCreateModal(false);
    setEditingGoal(null);
    setFormData({
      title: '',
      description: '',
      category: '',
      difficulty: 'beginner'
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading goals...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Manage Goals</h1>
            <p className="text-gray-600">Create and manage learning goals for users</p>
          </div>
          <button
            onClick={handleCreateGoal}
            className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors"
          >
            Create New Goal
          </button>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 rounded-md p-4 mb-6">
            <p className="text-red-600">{error}</p>
          </div>
        )}

        {/* Goals Table */}
        <div className="bg-white shadow rounded-lg overflow-hidden">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Goal
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Category
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Difficulty
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Created
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {goals.length > 0 ? (
                goals.map((goal) => (
                  <tr key={goal._id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div>
                        <div className="text-sm font-medium text-gray-900">
                          {goal.title}
                        </div>
                        <div className="text-sm text-gray-500">
                          {goal.description}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                        {goal.category || 'General'}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        goal.difficulty === 'beginner' ? 'bg-green-100 text-green-800' :
                        goal.difficulty === 'intermediate' ? 'bg-yellow-100 text-yellow-800' :
                        'bg-red-100 text-red-800'
                      }`}>
                        {goal.difficulty || 'beginner'}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {goal.createdAt ? new Date(goal.createdAt).toLocaleDateString() : 'N/A'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <button
                        onClick={() => handleEditGoal(goal)}
                        className="text-blue-600 hover:text-blue-900 mr-4"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => handleDeleteGoal(goal._id)}
                        className="text-red-600 hover:text-red-900"
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="5" className="px-6 py-4 text-center text-gray-500">
                    No goals found. Create your first goal to get started.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Create/Edit Modal */}
        {showCreateModal && (
          <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
            <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
              <div className="mt-3">
                <h3 className="text-lg font-medium text-gray-900 mb-4">
                  {editingGoal ? 'Edit Goal' : 'Create New Goal'}
                </h3>
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Title
                    </label>
                    <input
                      type="text"
                      name="title"
                      value={formData.title}
                      onChange={handleInputChange}
                      required
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Description
                    </label>
                    <textarea
                      name="description"
                      value={formData.description}
                      onChange={handleInputChange}
                      rows="3"
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Category
                    </label>
                    <input
                      type="text"
                      name="category"
                      value={formData.category}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Difficulty
                    </label>
                    <select
                      name="difficulty"
                      value={formData.difficulty}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="beginner">Beginner</option>
                      <option value="intermediate">Intermediate</option>
                      <option value="advanced">Advanced</option>
                    </select>
                  </div>
                  <div className="flex space-x-4 pt-4">
                    <button
                      type="submit"
                      className="flex-1 bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 transition-colors"
                    >
                      {editingGoal ? 'Update Goal' : 'Create Goal'}
                    </button>
                    <button
                      type="button"
                      onClick={closeModal}
                      className="flex-1 bg-gray-600 text-white py-2 px-4 rounded-md hover:bg-gray-700 transition-colors"
                    >
                      Cancel
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default ManageGoals;