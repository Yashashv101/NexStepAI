import React, { useState, useEffect } from 'react';
import { 
  Map, 
  Search, 
  Plus, 
  Edit, 
  Trash2, 
  Eye,
  Calendar,
  Users,
  Clock,
  Target,
  AlertCircle
} from 'lucide-react';
import { 
  getRoadmaps, 
  getRoadmap,
  createRoadmap, 
  updateRoadmap, 
  deleteRoadmap,
  getGoals 
} from '../../services/api';

const ManageRoadmaps = () => {
  const [roadmaps, setRoadmaps] = useState([]);
  const [filteredRoadmaps, setFilteredRoadmaps] = useState([]);
  const [goals, setGoals] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [editingRoadmap, setEditingRoadmap] = useState(null);
  const [newRoadmap, setNewRoadmap] = useState({
    title: '',
    description: '',
    goalId: '',
    difficulty: 'beginner',
    estimatedDuration: '',
    steps: [],
    category: '',
    tags: [],
    isPublic: true,
    isTemplate: false
  });

  useEffect(() => {
    fetchRoadmaps();
    fetchGoals();
  }, []);

  const fetchRoadmaps = async () => {
    try {
      setLoading(true);
      setError('');
      const response = await getRoadmaps();
      
      // Ensure we always have an array
      let roadmapsData = [];
      if (response && response.success && Array.isArray(response.data)) {
        roadmapsData = response.data;
      } else if (response && Array.isArray(response.roadmaps)) {
        roadmapsData = response.roadmaps;
      } else if (Array.isArray(response)) {
        roadmapsData = response;
      }
      
      setRoadmaps(roadmapsData);
      setFilteredRoadmaps(roadmapsData);
    } catch (error) {
      console.error('Error fetching roadmaps:', error);
      setError('Failed to fetch roadmaps. Please try again.');
      // Ensure arrays are set even on error
      setRoadmaps([]);
      setFilteredRoadmaps([]);
    } finally {
      setLoading(false);
    }
  };

  const fetchGoals = async () => {
    try {
      const response = await getGoals();
      
      // Ensure we always have an array
      let goalsData = [];
      if (response && response.success && Array.isArray(response.data)) {
        goalsData = response.data;
      } else if (response && Array.isArray(response.goals)) {
        goalsData = response.goals;
      } else if (Array.isArray(response)) {
        goalsData = response;
      }
      
      setGoals(goalsData);
    } catch (error) {
      console.error('Error fetching goals:', error);
      // Ensure goals is set to empty array on error
      setGoals([]);
    }
  };

  useEffect(() => {
    // Ensure roadmaps is an array before filtering
    if (!Array.isArray(roadmaps)) {
      setFilteredRoadmaps([]);
      return;
    }
    
    const filtered = roadmaps.filter(roadmap => {
      // Safety checks for roadmap properties
      if (!roadmap || typeof roadmap !== 'object') return false;
      
      const searchLower = searchTerm.toLowerCase();
      const goalName = Array.isArray(goals) ? 
        (goals.find(goal => goal._id === roadmap.goalId)?.name || '') : 
        '';
      
      return (
        (roadmap.title && roadmap.title.toLowerCase().includes(searchLower)) ||
        (roadmap.description && roadmap.description.toLowerCase().includes(searchLower)) ||
        goalName.toLowerCase().includes(searchLower) ||
        (roadmap.tags && Array.isArray(roadmap.tags) && roadmap.tags.some(tag => 
          tag && tag.toLowerCase().includes(searchLower)
        ))
      );
    });
    setFilteredRoadmaps(filtered);
  }, [roadmaps, searchTerm, goals]);

  const handleCreateRoadmap = async (e) => {
    e.preventDefault();
    try {
      setError('');
      const roadmapData = {
        ...newRoadmap,
        steps: newRoadmap.steps.filter(step => step.trim() !== ''),
        tags: newRoadmap.tags.filter(tag => tag.trim() !== '')
      };
      
      const createdRoadmap = await createRoadmap(roadmapData);
      setRoadmaps([...roadmaps, createdRoadmap]);
      setNewRoadmap({
        title: '',
        description: '',
        goalId: '',
        difficulty: 'beginner',
        estimatedDuration: '',
        steps: [],
        category: '',
        tags: [],
        isPublic: true,
        isTemplate: false
      });
      setShowCreateModal(false);
    } catch (error) {
      console.error('Error creating roadmap:', error);
      setError('Failed to create roadmap. Please try again.');
    }
  };

  const handleDeleteRoadmap = async (roadmapId) => {
    if (window.confirm('Are you sure you want to delete this roadmap?')) {
      try {
        setError('');
        await deleteRoadmap(roadmapId);
        setRoadmaps(roadmaps.filter(roadmap => roadmap._id !== roadmapId));
      } catch (error) {
        console.error('Error deleting roadmap:', error);
        setError('Failed to delete roadmap. Please try again.');
      }
    }
  };

  const handleEditRoadmap = (roadmap) => {
    setEditingRoadmap(roadmap);
    setNewRoadmap({
      title: roadmap.title,
      description: roadmap.description,
      goalId: roadmap.goalId,
      difficulty: roadmap.difficulty,
      estimatedDuration: roadmap.estimatedDuration,
      steps: roadmap.steps || [],
      category: roadmap.category || '',
      tags: roadmap.tags || [],
      isPublic: roadmap.isPublic !== false,
      isTemplate: roadmap.isTemplate || false
    });
    setShowCreateModal(true);
  };

  const handleUpdateRoadmap = async (e) => {
    e.preventDefault();
    try {
      setError('');
      const roadmapData = {
        ...newRoadmap,
        steps: newRoadmap.steps.filter(step => step.trim() !== ''),
        tags: newRoadmap.tags.filter(tag => tag.trim() !== '')
      };
      
      const updatedRoadmap = await updateRoadmap(editingRoadmap._id, roadmapData);
      setRoadmaps(roadmaps.map(roadmap => 
        roadmap._id === editingRoadmap._id ? updatedRoadmap : roadmap
      ));
      setNewRoadmap({
        title: '',
        description: '',
        goalId: '',
        difficulty: 'beginner',
        estimatedDuration: '',
        steps: [],
        category: '',
        tags: [],
        isPublic: true,
        isTemplate: false
      });
      setEditingRoadmap(null);
      setShowCreateModal(false);
    } catch (error) {
      console.error('Error updating roadmap:', error);
      setError('Failed to update roadmap. Please try again.');
    }
  };

  const getDifficultyColor = (difficulty) => {
    switch (difficulty) {
      case 'beginner': return 'bg-green-100 text-green-800';
      case 'intermediate': return 'bg-yellow-100 text-yellow-800';
      case 'advanced': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const addStep = () => {
    setNewRoadmap({
      ...newRoadmap,
      steps: [...newRoadmap.steps, '']
    });
  };

  const updateStep = (index, value) => {
    const updatedSteps = [...newRoadmap.steps];
    updatedSteps[index] = value;
    setNewRoadmap({
      ...newRoadmap,
      steps: updatedSteps
    });
  };

  const removeStep = (index) => {
    setNewRoadmap({
      ...newRoadmap,
      steps: newRoadmap.steps.filter((_, i) => i !== index)
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading roadmaps...</p>
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
              <Map className="h-8 w-8 mr-3" />
              Manage Roadmaps
            </h1>
            <p className="text-gray-600 mt-2">Create and manage learning roadmaps</p>
          </div>
          <button
            onClick={() => {
              setEditingRoadmap(null);
              setNewRoadmap({
                title: '',
                description: '',
                goalId: '',
                difficulty: 'beginner',
                estimatedDuration: '',
                steps: [],
                category: '',
                tags: [],
                isPublic: true,
                isTemplate: false
              });
              setShowCreateModal(true);
            }}
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center"
          >
            <Plus className="h-5 w-5 mr-2" />
            Create Roadmap
          </button>
        </div>

        {/* Error Message */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
            <div className="flex items-center">
              <AlertCircle className="h-5 w-5 text-red-600 mr-2" />
              <p className="text-red-700">{error}</p>
            </div>
          </div>
        )}

        {/* Search */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
            <input
              type="text"
              placeholder="Search roadmaps by title, description, or goal..."
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>

        {/* Roadmaps Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {Array.isArray(filteredRoadmaps) && filteredRoadmaps.length > 0 ? (
            filteredRoadmaps.map((roadmap) => {
              const goalName = Array.isArray(goals) ? 
                (goals.find(goal => goal._id === roadmap.goalId)?.name || 'Unknown Goal') : 
                'Unknown Goal';
              return (
                <div key={roadmap._id || roadmap.id} className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow">
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900">{roadmap.title}</h3>
                    <div className="flex items-center text-sm text-gray-500 mt-1">
                      <Target className="h-4 w-4 mr-1" />
                      {goalName}
                    </div>
                  </div>
                  <div className="flex space-x-2">
                    <button
                      onClick={() => handleEditRoadmap(roadmap)}
                      className="text-green-600 hover:text-green-800 p-1 rounded"
                      title="Edit Roadmap"
                    >
                      <Edit className="h-4 w-4" />
                    </button>
                    <button
                      onClick={() => handleDeleteRoadmap(roadmap._id)}
                      className="text-red-600 hover:text-red-800 p-1 rounded"
                      title="Delete Roadmap"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>
                
                <p className="text-gray-600 text-sm mb-4">{roadmap.description}</p>
                
                <div className="space-y-2 mb-4">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-500">Difficulty:</span>
                    <span className={`px-2 py-1 text-xs font-semibold rounded-full ${getDifficultyColor(roadmap.difficulty)}`}>
                      {roadmap.difficulty}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-500">Duration:</span>
                    <div className="flex items-center text-sm font-medium">
                      <Clock className="h-4 w-4 mr-1" />
                      {roadmap.estimatedDuration}
                    </div>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-500">Steps:</span>
                    <span className="text-sm font-medium">{roadmap.steps?.length || 0} steps</span>
                  </div>
                  {roadmap.tags && roadmap.tags.length > 0 && (
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-500">Tags:</span>
                      <div className="flex flex-wrap gap-1">
                        {roadmap.tags.slice(0, 3).map((tag, index) => (
                          <span key={index} className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded">
                            {tag}
                          </span>
                        ))}
                        {roadmap.tags.length > 3 && (
                          <span className="text-xs text-gray-500">+{roadmap.tags.length - 3}</span>
                        )}
                      </div>
                    </div>
                  )}
                </div>

                {/* Steps Preview */}
                {roadmap.steps && roadmap.steps.length > 0 && (
                  <div className="mb-4">
                    <h4 className="text-sm font-medium text-gray-700 mb-2">Learning Steps:</h4>
                    <div className="space-y-1">
                      {roadmap.steps.slice(0, 3).map((step, index) => (
                        <div key={index} className="flex items-center text-sm text-gray-600">
                          <div className="w-2 h-2 bg-blue-400 rounded-full mr-2"></div>
                          {typeof step === 'string' ? step : step.title || step.name || 'Untitled Step'}
                        </div>
                      ))}
                      {roadmap.steps.length > 3 && (
                        <div className="text-sm text-gray-500 ml-4">
                          +{roadmap.steps.length - 3} more steps
                        </div>
                      )}
                    </div>
                  </div>
                )}
                
                <div className="flex justify-between items-center pt-4 border-t border-gray-200">
                  <div className="flex items-center text-sm text-gray-500">
                    <span className={`px-2 py-1 text-xs rounded-full ${roadmap.isPublic ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}`}>
                      {roadmap.isPublic ? 'Public' : 'Private'}
                    </span>
                  </div>
                  <div className="flex items-center text-sm text-gray-500">
                    <Calendar className="h-4 w-4 mr-1" />
                    {new Date(roadmap.createdAt).toLocaleDateString()}
                  </div>
                </div>
              </div>
            );
          })) : (
            <div className="col-span-full text-center py-12">
              <Map className="mx-auto h-12 w-12 text-gray-400" />
              <h3 className="mt-2 text-sm font-medium text-gray-900">No roadmaps found</h3>
              <p className="mt-1 text-sm text-gray-500">
                Try adjusting your search criteria or create a new roadmap.
              </p>
            </div>
          )}
        </div>

        {/* Create/Edit Roadmap Modal */}
        {showCreateModal && (
            <div className="bg-white rounded-lg max-w-2xl w-full p-6 max-h-[90vh] overflow-y-auto">
              <h2 className="text-xl font-bold text-gray-900 mb-4">
                {editingRoadmap ? 'Edit Roadmap' : 'Create New Roadmap'}
              </h2>
              <form onSubmit={editingRoadmap ? handleUpdateRoadmap : handleCreateRoadmap}>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Roadmap Title
                    </label>
                    <input
                      type="text"
                      required
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      value={newRoadmap.title}
                      onChange={(e) => setNewRoadmap({...newRoadmap, title: e.target.value})}
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
                      value={newRoadmap.description}
                      onChange={(e) => setNewRoadmap({...newRoadmap, description: e.target.value})}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Goal
                    </label>
                    <select
                      required
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      value={newRoadmap.goalId}
                      onChange={(e) => setNewRoadmap({...newRoadmap, goalId: e.target.value})}
                    >
                      <option value="">Select a goal</option>
                      {goals.map((goal) => (
                        <option key={goal._id} value={goal._id}>
                          {goal.name}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Difficulty
                      </label>
                      <select
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        value={newRoadmap.difficulty}
                        onChange={(e) => setNewRoadmap({...newRoadmap, difficulty: e.target.value})}
                      >
                        <option value="beginner">Beginner</option>
                        <option value="intermediate">Intermediate</option>
                        <option value="advanced">Advanced</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Estimated Duration
                      </label>
                      <input
                        type="text"
                        required
                        placeholder="e.g., 4-6 months"
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        value={newRoadmap.estimatedDuration}
                        onChange={(e) => setNewRoadmap({...newRoadmap, estimatedDuration: e.target.value})}
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Category
                    </label>
                    <input
                      type="text"
                      placeholder="e.g., Programming, Design, Marketing"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      value={newRoadmap.category}
                      onChange={(e) => setNewRoadmap({...newRoadmap, category: e.target.value})}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Tags (comma-separated)
                    </label>
                    <input
                      type="text"
                      placeholder="e.g., javascript, react, frontend"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      value={newRoadmap.tags.join(', ')}
                      onChange={(e) => setNewRoadmap({
                        ...newRoadmap, 
                        tags: e.target.value.split(',').map(tag => tag.trim()).filter(tag => tag)
                      })}
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="flex items-center">
                      <input
                        type="checkbox"
                        id="isPublic"
                        className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                        checked={newRoadmap.isPublic}
                        onChange={(e) => setNewRoadmap({...newRoadmap, isPublic: e.target.checked})}
                      />
                      <label htmlFor="isPublic" className="ml-2 block text-sm text-gray-700">
                        Public roadmap
                      </label>
                    </div>
                    <div className="flex items-center">
                      <input
                        type="checkbox"
                        id="isTemplate"
                        className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                        checked={newRoadmap.isTemplate}
                        onChange={(e) => setNewRoadmap({...newRoadmap, isTemplate: e.target.checked})}
                      />
                      <label htmlFor="isTemplate" className="ml-2 block text-sm text-gray-700">
                        Template roadmap
                      </label>
                    </div>
                  </div>
                  
                  {/* Learning Steps */}
                  <div>
                    <div className="flex justify-between items-center mb-2">
                      <label className="block text-sm font-medium text-gray-700">
                        Learning Steps
                      </label>
                      <button
                        type="button"
                        onClick={addStep}
                        className="text-blue-600 hover:text-blue-800 text-sm flex items-center"
                      >
                        <Plus className="h-4 w-4 mr-1" />
                        Add Step
                      </button>
                    </div>
                    <div className="space-y-2">
                      {newRoadmap.steps.map((step, index) => (
                        <div key={index} className="flex items-center space-x-2">
                          <span className="text-sm text-gray-500 w-8">{index + 1}.</span>
                          <input
                            type="text"
                            placeholder="Enter learning step"
                            className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            value={typeof step === 'string' ? step : step.title || step.name || ''}
                            onChange={(e) => updateStep(index, e.target.value)}
                          />
                          <button
                            type="button"
                            onClick={() => removeStep(index)}
                            className="text-red-600 hover:text-red-800 p-1"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                      ))}
                      {newRoadmap.steps.length === 0 && (
                        <p className="text-sm text-gray-500 italic">No steps added yet. Click "Add Step" to get started.</p>
                      )}
                    </div>
                  </div>
                </div>
                <div className="flex justify-end space-x-3 mt-6">
                  <button
                    type="button"
                    onClick={() => {
                      setShowCreateModal(false);
                      setEditingRoadmap(null);
                      setError('');
                    }}
                    className="px-4 py-2 text-gray-700 bg-gray-200 rounded-lg hover:bg-gray-300"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                  >
                    {editingRoadmap ? 'Update Roadmap' : 'Create Roadmap'}
                  </button>
                </div>
              </form>
            </div>
        )}
      </div>
    </div>
  );
};

export default ManageRoadmaps;