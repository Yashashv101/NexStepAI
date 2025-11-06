import React, { useState, useEffect } from 'react';
import { 
  Target, 
  Search, 
  Plus, 
  Edit, 
  Trash2, 
  Eye,
  Calendar,
  Users,
  TrendingUp,
  AlertCircle
} from 'lucide-react';
import { 
  getGoals, 
  createGoal, 
  updateGoal, 
  deleteGoal, 
  getGoalCategories 
} from '../../services/api';
import { emitAdminDataChanged } from '../../utils/adminEvents';

const ManageGoals = () => {
  const [goals, setGoals] = useState([]);
  const [filteredGoals, setFilteredGoals] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [editingGoal, setEditingGoal] = useState(null);
  const [filterType, setFilterType] = useState('all'); // 'all', 'admin', 'user'
  const [moderationFilter, setModerationFilter] = useState('all'); // 'all', 'pending', 'approved', 'rejected'
  const [newGoal, setNewGoal] = useState({
    name: '',
    description: '',
    category: '',
    difficulty: 'beginner',
    estimatedTime: '',
    tags: '',
    skillsRequired: '',
    skillsLearned: ''
  });

  useEffect(() => {
    fetchGoals();
  }, []);

  const fetchGoals = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await getGoals();
      
      // Ensure we have an array of goals
      let goalsData = [];
      if (response && response.success && Array.isArray(response.data)) {
        goalsData = response.data;
      } else if (response && Array.isArray(response.goals)) {
        goalsData = response.goals;
      } else if (Array.isArray(response)) {
        goalsData = response;
      }
      
      setGoals(goalsData);
      setFilteredGoals(goalsData);
    } catch (error) {
      console.error('Error fetching goals:', error);
      setError('Failed to fetch goals. Please try again.');
      setGoals([]);
      setFilteredGoals([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!Array.isArray(goals)) {
      setFilteredGoals([]);
      return;
    }
    
    const filtered = goals.filter(goal => {
      if (!goal || !goal.name || !goal.description || !goal.category) return false;
      
      // Search filter
      const matchesSearch = 
        goal.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        goal.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
        goal.category.toLowerCase().includes(searchTerm.toLowerCase());
      
      // Type filter
      const matchesType = 
        filterType === 'all' ||
        (filterType === 'user' && goal.isUserSubmitted) ||
        (filterType === 'admin' && !goal.isUserSubmitted);
      
      // Moderation filter
      const matchesModeration = 
        moderationFilter === 'all' ||
        (goal.moderationStatus === moderationFilter);
      
      return matchesSearch && matchesType && matchesModeration;
    });
    
    setFilteredGoals(filtered);
  }, [goals, searchTerm, filterType, moderationFilter]);

  const handleCreateGoal = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      setError(null);
      
      // Process form data
      const goalData = {
        ...newGoal,
        tags: newGoal.tags.split(',').map(tag => tag.trim()).filter(tag => tag),
        skillsRequired: newGoal.skillsRequired.split(',').map(skill => skill.trim()).filter(skill => skill),
        skillsLearned: newGoal.skillsLearned.split(',').map(skill => skill.trim()).filter(skill => skill)
      };

      console.log('Submitting goal data:', goalData);

      if (editingGoal) {
        await updateGoal(editingGoal._id, goalData);
        console.log('Goal updated successfully');
      } else {
        await createGoal(goalData);
        console.log('Goal created successfully');
      }
      
      await fetchGoals();
      setNewGoal({
        name: '',
        description: '',
        category: '',
        difficulty: 'beginner',
        estimatedTime: '',
        tags: '',
        skillsRequired: '',
        skillsLearned: ''
      });
      setEditingGoal(null);
      setShowCreateModal(false);
    } catch (error) {
      console.error('Error saving goal:', error);
      
      // Use enhanced error information if available
      let errorMessage = editingGoal ? 'Failed to update goal.' : 'Failed to create goal.';
      
      if (error.friendlyMessage) {
        errorMessage = error.friendlyMessage;
      } else if (error.response?.data?.message) {
        errorMessage = error.response.data.message;
      } else if (error.response?.data?.errors) {
        errorMessage = `Validation errors: ${error.response.data.errors.join(', ')}`;
      }
      
      // Log detailed error information for debugging
      if (error.errorDetails) {
        console.error('Detailed error information:', error.errorDetails);
      }
      
      if (error.response?.data?.validationDetails) {
        console.error('Validation details:', error.response.data.validationDetails);
      }
      
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteGoal = async (goalId) => {
    const goal = goals.find(g => g._id === goalId);
    const goalName = goal ? goal.name : 'this goal';
    
    const confirmMessage = `Are you sure you want to delete "${goalName}"?\n\n` +
      `⚠️ WARNING: This action will also permanently delete:\n` +
      `• All associated roadmaps\n` +
      `• All user progress records\n` +
      `• All related resources\n` +
      `• Activity references\n\n` +
      `This action cannot be undone.`;
    
    if (window.confirm(confirmMessage)) {
      try {
        setLoading(true);
        setError(null);
        await deleteGoal(goalId);
        await fetchGoals();
        // Notify Admin Dashboard to refresh stats
        emitAdminDataChanged({ type: 'goal', action: 'deleted', countDelta: -1 });
        
        // Show success message
        alert(`Goal "${goalName}" and all associated records have been successfully deleted.`);
      } catch (error) {
        console.error('Error deleting goal:', error);
        const errorMessage = error.response?.data?.message || 'Failed to delete goal. Please try again.';
        setError(errorMessage);
        alert(`Error: ${errorMessage}`);
      } finally {
        setLoading(false);
      }
    }
  };

  const handleEditGoal = (goal) => {
    setEditingGoal(goal);
    setNewGoal({
      name: goal.name,
      description: goal.description,
      category: goal.category,
      difficulty: goal.difficulty,
      estimatedTime: goal.estimatedTime,
      tags: goal.tags ? goal.tags.join(', ') : '',
      skillsRequired: goal.skillsRequired ? goal.skillsRequired.join(', ') : '',
      skillsLearned: goal.skillsLearned ? goal.skillsLearned.join(', ') : ''
    });
    setShowCreateModal(true);
  };

  const getDifficultyColor = (difficulty) => {
    switch (difficulty) {
      case 'beginner': return 'bg-green-100 text-green-800';
      case 'intermediate': return 'bg-yellow-100 text-yellow-800';
      case 'advanced': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
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
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8 flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 flex items-center">
              <Target className="h-8 w-8 mr-3" />
              Manage Goals
            </h1>
            <p className="text-gray-600 mt-2">Create and manage career goals</p>
          </div>
          <button
            onClick={() => {
              setEditingGoal(null);
              setNewGoal({
                name: '',
                description: '',
                category: '',
                difficulty: 'beginner',
                estimatedTime: '',
                tags: '',
                skillsRequired: '',
                skillsLearned: ''
              });
              setShowCreateModal(true);
            }}
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center"
            disabled={loading}
          >
            <Plus className="h-5 w-5 mr-2" />
            Create Goal
          </button>
        </div>

        {/* Error Message */}
        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-6">
            {error}
            <button
              onClick={() => setError(null)}
              className="float-right font-bold text-red-700 hover:text-red-900"
            >
              ×
            </button>
          </div>
        )}

        {/* Search and Filters */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <div className="space-y-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
              <input
                type="text"
                placeholder="Search goals by name, description, or category..."
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            
            <div className="flex space-x-4">
              <div className="flex-1">
                <label className="block text-sm font-medium text-gray-700 mb-1">Source</label>
                <select
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  value={filterType}
                  onChange={(e) => setFilterType(e.target.value)}
                >
                  <option value="all">All Goals</option>
                  <option value="admin">Admin Created</option>
                  <option value="user">User Submitted</option>
                </select>
              </div>
              
              <div className="flex-1">
                <label className="block text-sm font-medium text-gray-700 mb-1">Moderation Status</label>
                <select
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  value={moderationFilter}
                  onChange={(e) => setModerationFilter(e.target.value)}
                >
                  <option value="all">All Statuses</option>
                  <option value="approved">Approved</option>
                  <option value="pending">Pending</option>
                  <option value="rejected">Rejected</option>
                  <option value="flagged">Flagged</option>
                </select>
              </div>
            </div>
          </div>
        </div>

        {/* Goals Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {Array.isArray(filteredGoals) && filteredGoals.length > 0 ? (
            filteredGoals.map((goal) => (
              <div key={goal._id || goal.id} className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow">
                <div className="flex justify-between items-start mb-4">
                  <h3 className="text-lg font-semibold text-gray-900">{goal.name}</h3>
                  <div className="flex space-x-2">
                    <button
                      className="text-blue-600 hover:text-blue-800 p-1 rounded"
                      title="View Details"
                  >
                    <Eye className="h-4 w-4" />
                  </button>
                  <button
                    onClick={() => handleEditGoal(goal)}
                    className="text-green-600 hover:text-green-800 p-1 rounded"
                    title="Edit Goal"
                    disabled={loading}
                  >
                    <Edit className="h-4 w-4" />
                  </button>
                  <button
                    onClick={() => handleDeleteGoal(goal._id)}
                    className="text-red-600 hover:text-red-800 p-1 rounded"
                    title="Delete Goal"
                    disabled={loading}
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </div>
              
              <p className="text-gray-600 text-sm mb-4">{goal.description}</p>
              
              <div className="space-y-2 mb-4">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-500">Category:</span>
                  <span className="text-sm font-medium">{goal.category}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-500">Difficulty:</span>
                  <span className={`px-2 py-1 text-xs font-semibold rounded-full ${getDifficultyColor(goal.difficulty)}`}>
                    {goal.difficulty}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-500">Est. Time:</span>
                  <span className="text-sm font-medium">{goal.estimatedTime}</span>
                </div>
              </div>
              
              {goal.isUserSubmitted && (
                <div className="mb-4 space-y-2">
                  <div className="flex items-center">
                    <span className="bg-purple-100 text-purple-800 px-2 py-1 rounded text-xs font-semibold">
                      User Submitted
                    </span>
                    {goal.isAIEnhanced && (
                      <span className="ml-2 bg-blue-100 text-blue-800 px-2 py-1 rounded text-xs font-semibold">
                        AI Enhanced
                      </span>
                    )}
                  </div>
                  {goal.moderationStatus && (
                    <span className={`px-2 py-1 text-xs rounded-full ${
                      goal.moderationStatus === 'approved' ? 'bg-green-100 text-green-800' :
                      goal.moderationStatus === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                      goal.moderationStatus === 'rejected' ? 'bg-red-100 text-red-800' :
                      'bg-orange-100 text-orange-800'
                    }`}>
                      {goal.moderationStatus}
                    </span>
                  )}
                </div>
              )}
              
              <div className="flex justify-between items-center pt-4 border-t border-gray-200">
                <div className="flex items-center text-sm text-gray-500">
                  <Users className="h-4 w-4 mr-1" />
                  {goal.usersCount} users
                </div>
                <div className="flex items-center text-sm text-gray-500">
                  <Calendar className="h-4 w-4 mr-1" />
                  {new Date(goal.createdAt).toLocaleDateString()}
                </div>
              </div>
            </div>
          ))
          ) : (
            <div className="col-span-full text-center py-12">
              <Target className="mx-auto h-12 w-12 text-gray-400" />
              <h3 className="mt-2 text-sm font-medium text-gray-900">No goals found</h3>
              <p className="mt-1 text-sm text-gray-500">
                {searchTerm ? 'Try adjusting your search criteria or create a new goal.' : 'Get started by creating your first goal.'}
              </p>
            </div>
          )}
        </div>

        {/* Create/Edit Goal Modal */}
        {showCreateModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-lg max-w-md w-full p-6">
              <h2 className="text-xl font-bold text-gray-900 mb-4">
                {editingGoal ? 'Edit Goal' : 'Create New Goal'}
              </h2>
              <form onSubmit={handleCreateGoal}>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Goal Name
                    </label>
                    <input
                      type="text"
                      required
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      value={newGoal.name}
                      onChange={(e) => setNewGoal({...newGoal, name: e.target.value})}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Description
                    </label>
                    <textarea
                      required
                      rows={3}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      value={newGoal.description}
                      onChange={(e) => setNewGoal({...newGoal, description: e.target.value})}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Category
                    </label>
                    <select
                      required
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      value={newGoal.category}
                      onChange={(e) => setNewGoal({...newGoal, category: e.target.value})}
                    >
                      <option value="">Select a category</option>
                      <option value="Web Development">Web Development</option>
                      <option value="Mobile Development">Mobile Development</option>
                      <option value="Data Science">Data Science</option>
                      <option value="Machine Learning">Machine Learning</option>
                      <option value="DevOps">DevOps</option>
                      <option value="Cybersecurity">Cybersecurity</option>
                      <option value="UI/UX Design">UI/UX Design</option>
                      <option value="Cloud Computing">Cloud Computing</option>
                      <option value="Backend Development">Backend Development</option>
                      <option value="Frontend Development">Frontend Development</option>
                      <option value="Full Stack Development">Full Stack Development</option>
                      <option value="Game Development">Game Development</option>
                      <option value="Blockchain">Blockchain</option>
                      <option value="Other">Other</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Difficulty
                    </label>
                    <select
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      value={newGoal.difficulty}
                      onChange={(e) => setNewGoal({...newGoal, difficulty: e.target.value})}
                    >
                      <option value="beginner">Beginner</option>
                      <option value="intermediate">Intermediate</option>
                      <option value="advanced">Advanced</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Estimated Time
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="e.g., 6-12 months"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      value={newGoal.estimatedTime}
                      onChange={(e) => setNewGoal({...newGoal, estimatedTime: e.target.value})}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Tags (comma-separated)
                    </label>
                    <input
                      type="text"
                      placeholder="e.g., programming, web development"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      value={newGoal.tags}
                      onChange={(e) => setNewGoal({...newGoal, tags: e.target.value})}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Skills Required (comma-separated)
                    </label>
                    <input
                      type="text"
                      placeholder="e.g., HTML, CSS, JavaScript"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      value={newGoal.skillsRequired}
                      onChange={(e) => setNewGoal({...newGoal, skillsRequired: e.target.value})}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Skills Learned (comma-separated)
                    </label>
                    <input
                      type="text"
                      placeholder="e.g., React, Node.js, Database Design"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      value={newGoal.skillsLearned}
                      onChange={(e) => setNewGoal({...newGoal, skillsLearned: e.target.value})}
                    />
                  </div>
                </div>
                <div className="flex justify-end space-x-3 mt-6">
                  <button
                    type="button"
                    onClick={() => {
                      setShowCreateModal(false);
                      setEditingGoal(null);
                    }}
                    className="px-4 py-2 text-gray-700 bg-gray-200 rounded-lg hover:bg-gray-300"
                    disabled={loading}
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                    disabled={loading}
                  >
                    {loading ? 'Saving...' : (editingGoal ? 'Update Goal' : 'Create Goal')}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ManageGoals;