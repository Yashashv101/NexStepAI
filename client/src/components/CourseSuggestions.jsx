import React, { useState, useEffect } from 'react';
import { BookOpen, Clock, Star, Filter, ThumbsUp, ThumbsDown, ExternalLink, Plus, X } from 'lucide-react';
import { getCourseSuggestions, recordCourseFeedback } from '../services/api';

const CourseSuggestions = ({ roadmapContent, difficulty, onAddCourse, className = '' }) => {
  const [suggestions, setSuggestions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [selectedCourse, setSelectedCourse] = useState(null);
  const [filterDifficulty, setFilterDifficulty] = useState('all');
  const [feedbackLoading, setFeedbackLoading] = useState({});
  const [actionableFeedback, setActionableFeedback] = useState(null);

  useEffect(() => {
    if (roadmapContent) {
      fetchCourseSuggestions();
    }
  }, [roadmapContent, difficulty]);

  const fetchCourseSuggestions = async () => {
    setLoading(true);
    setError('');
    setActionableFeedback(null);

    try {
      const response = await getCourseSuggestions({
        roadmapContent,
        difficulty,
        maxSuggestions: 5,
        minScore: 0.3
      });

      if (response.data) {
        setSuggestions(response.data.suggestions || []);
        
        // Handle enhanced response with actionable feedback
        if (response.data.message || response.data.actionableFeedback) {
          setActionableFeedback({
            message: response.data.message || 'No courses found matching your criteria.',
            suggestions: response.data.actionableSuggestions || [],
            isFallback: response.data.isFallback || false,
            supportContact: response.data.supportContact || 'support@nexstepai.com'
          });
        }
      }
    } catch (error) {
      console.error('Error fetching course suggestions:', error);
      setError('Unable to load course suggestions. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  const handleFeedback = async (courseId, feedback) => {
    setFeedbackLoading({ ...feedbackLoading, [courseId]: true });

    try {
      await recordCourseFeedback({
        courseId,
        feedback,
        roadmapId: null // Can be updated if roadmap ID is available
      });

      // Update local state to reflect feedback
      setSuggestions(prev => 
        prev.map(course => 
          course.id === courseId 
            ? { ...course, userFeedback: feedback }
            : course
        )
      );
    } catch (error) {
      console.error('Error recording feedback:', error);
    } finally {
      setFeedbackLoading({ ...feedbackLoading, [courseId]: false });
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

  const getRelevanceColor = (score) => {
    if (score >= 0.8) return 'text-green-600';
    if (score >= 0.6) return 'text-yellow-600';
    return 'text-gray-600';
  };

  const filteredSuggestions = suggestions.filter(course => {
    if (filterDifficulty === 'all') return true;
    return course.difficulty === filterDifficulty;
  });

  const CourseModal = ({ course, onClose }) => {
    if (!course) return null;

    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
        <div className="bg-[var(--surface)] border border-[rgba(230,239,239,0.12)] rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
          <div className="p-6">
            <div className="flex justify-between items-start mb-4">
              <h3 className="text-xl md:text-2xl font-bold text-[var(--text-primary)] pr-4">{course.title}</h3>
              <button
                onClick={onClose}
                className="text-[var(--muted)] hover:text-[var(--text-primary)] flex-shrink-0"
              >
                <X className="h-6 w-6" />
              </button>
            </div>

            <div className="space-y-4">
              <div className="flex flex-wrap items-center gap-3">
                <span className={`px-3 py-1 rounded-full text-sm font-semibold ${getDifficultyColor(course.difficulty)}`}>
                  {course.difficulty}
                </span>
                <div className="flex items-center text-gray-600">
                  <Clock className="h-4 w-4 mr-1" />
                  {course.estimatedTime}
                </div>
                <div className="flex items-center text-gray-600">
                  <Star className="h-4 w-4 mr-1" />
                  <span className={getRelevanceColor(course.relevanceScore)}>
                    {Math.round(course.relevanceScore * 100)}% relevant
                  </span>
                </div>
              </div>

              <div>
                <h4 className="font-semibold text-[var(--text-primary)] mb-2">Description</h4>
                <p className="text-[var(--muted)] text-sm md:text-base">{course.description}</p>
              </div>

              {course.skillsLearned && course.skillsLearned.length > 0 && (
                <div>
                  <h4 className="font-semibold text-[var(--text-primary)] mb-2">Skills You'll Learn</h4>
                  <div className="flex flex-wrap gap-2">
                    {course.skillsLearned.map((skill, index) => (
                      <span key={index} className="bg-[rgba(29,185,84,0.08)] text-[var(--accent-green)] px-3 py-1 rounded-full text-xs md:text-sm">
                        {skill}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {course.skillsRequired && course.skillsRequired.length > 0 && (
                <div>
                  <h4 className="font-semibold text-[var(--text-primary)] mb-2">Prerequisites</h4>
                  <div className="flex flex-wrap gap-2">
                    {course.skillsRequired.map((skill, index) => (
                      <span key={index} className="bg-[rgba(230,239,239,0.06)] text-[var(--text-primary)] px-3 py-1 rounded-full text-xs md:text-sm">
                        {skill}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-3 pt-4">
                <button
                  onClick={() => {
                    onAddCourse(course);
                    onClose();
                  }}
                  className="w-full sm:flex-1 bg-[var(--accent-green)] hover:bg-[var(--accent-green-600)] text-[var(--bg-900)] font-semibold py-2 px-4 rounded-lg flex items-center justify-center text-sm md:text-base"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Add to Roadmap
                </button>
                <a
                  href={course.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full sm:flex-1 bg-[var(--bg-800)] hover:bg-[var(--bg-900)] text-[var(--text-primary)] font-semibold py-2 px-4 rounded-lg flex items-center justify-center text-sm md:text-base"
                >
                  <ExternalLink className="h-4 w-4 mr-2" />
                  View Course
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  };

  if (loading) {
    return (
      <div className={`bg-gradient-to-br from-[var(--bg-800)] to-[var(--bg-900)] rounded-lg shadow-lg p-8 ${className}`}>
        <div className="flex flex-col items-center justify-center py-8">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[var(--accent-green)] mb-4"></div>
          <h4 className="text-lg font-semibold text-[var(--text-primary)] mb-2">Finding Courses for You</h4>
          <p className="text-[var(--muted)]">Analyzing your roadmap to find the best learning resources...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className={`bg-gradient-to-br from-[var(--bg-800)] to-[var(--bg-900)] rounded-lg shadow-lg p-8 ${className}`}>
        <div className="text-center py-8">
          <div className="rounded-full w-20 h-20 mx-auto mb-6 flex items-center justify-center bg-[rgba(29,185,84,0.08)]">
            <div className="text-[var(--accent-green)] text-2xl">⚠️</div>
          </div>
          <h4 className="text-xl font-bold text-[var(--text-primary)] mb-3">Something Went Wrong</h4>
          <p className="text-[var(--muted)] mb-6 max-w-md mx-auto">{error}</p>
          <button
            onClick={fetchCourseSuggestions}
            className="bg-[var(--accent-green)] hover:bg-[var(--accent-green-600)] text-[var(--bg-900)] px-6 py-3 rounded-lg font-medium transition-colors"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  if (!suggestions.length) {
    return (
      <div className={`bg-gradient-to-br from-[var(--bg-800)] to-[var(--bg-900)] rounded-lg shadow-lg p-8 ${className}`}>
        <div className="text-center py-8">
          <div className="rounded-full w-20 h-20 mx-auto mb-6 flex items-center justify-center bg-[rgba(29,185,84,0.08)]">
            <BookOpen className="h-10 w-10 text-[var(--accent-green)]" />
          </div>
          <h4 className="text-xl font-bold text-[var(--text-primary)] mb-3">No Courses Found</h4>
          <p className="text-[var(--muted)] mb-4 max-w-md mx-auto">
            We couldn't find any courses that match your roadmap content right now. 
            Don't worry - we're constantly adding new courses to help you on your learning journey!
          </p>
          
          {/* Actionable suggestions */}
          {actionableFeedback && (
            <div className="bg-[var(--surface)] border border-[rgba(230,239,239,0.12)] rounded-lg p-6 max-w-lg mx-auto mb-6">
              <h5 className="text-lg font-semibold text-gray-800 mb-3 flex items-center">
                <span className="mr-2">💡</span>
                Try These Suggestions
              </h5>
              <ul className="text-left text-[var(--muted)] space-y-2">
                {actionableFeedback.suggestions.map((suggestion, index) => (
                  <li key={index} className="flex items-start">
                    <span className="text-[var(--accent-green)] mr-2 mt-1">•</span>
                    <span>{suggestion}</span>
                  </li>
                ))}
              </ul>
              
              {actionableFeedback.supportContact && (
                <div className="mt-4 pt-4 border-t border-gray-200">
                  <p className="text-sm text-[var(--muted)] mb-2">
                    Still need help? Contact our support team:
                  </p>
                  <a 
                    href={`mailto:${actionableFeedback.supportContact}`}
                    className="inline-flex items-center text-[var(--accent-green)] hover:text-[var(--accent-green-600)] font-medium"
                  >
                    <span className="mr-1">📧</span>
                    {actionableFeedback.supportContact}
                  </a>
                </div>
              )}
            </div>
          )}
          
          <div className="bg-[var(--bg-800)] border border-[rgba(230,239,239,0.12)] rounded-lg p-4 max-w-md mx-auto">
            <p className="text-[var(--text-primary)] text-sm font-medium mb-1">🚀 Coming Soon!</p>
            <p className="text-[var(--muted)] text-sm">
              Our team is working hard to add more relevant courses for this topic. 
              Check back soon for updated recommendations!
            </p>
          </div>
          
          {/* Retry button */}
          <button
            onClick={fetchCourseSuggestions}
            className="mt-6 bg-[var(--accent-green)] hover:bg-[var(--accent-green-600)] text-[var(--bg-900)] px-6 py-3 rounded-lg font-medium transition-colors"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className={`bg-gradient-to-br from-[var(--bg-800)] to-[var(--bg-900)] rounded-lg shadow-lg p-4 md:p-6 ${className}`}>
      <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-6">
        <div className="mb-4 md:mb-0">
          <h3 className="text-lg md:text-xl font-bold text-[var(--text-primary)] flex items-center">
            <BookOpen className="h-5 w-5 mr-2 text-[var(--accent-green)]" />
            Recommended Courses
          </h3>
          <p className="text-[var(--muted)] text-sm mt-1">
            AI-curated courses to support your learning journey
          </p>
        </div>
        
        <div className="flex items-center space-x-2">
          <Filter className="h-4 w-4 text-gray-500" />
          <select
            value={filterDifficulty}
            onChange={(e) => setFilterDifficulty(e.target.value)}
            className="text-sm border border-gray-300 rounded-lg px-3 py-1 focus:outline-none focus:ring-2 focus:ring-[var(--accent-green)]"
          >
            <option value="all">All Levels</option>
            <option value="beginner">Beginner</option>
            <option value="intermediate">Intermediate</option>
            <option value="advanced">Advanced</option>
          </select>
        </div>
      </div>

      <div className="space-y-4">
        {filteredSuggestions.map((course) => (
          <div key={course.id} className="bg-[var(--surface)] border border-[rgba(230,239,239,0.12)] rounded-lg p-4 hover:shadow-lg transition-all duration-200 hover:border-[var(--accent-green)]">
            <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start mb-3">
              <h4 className="font-semibold text-[var(--text-primary)] flex-1 mb-2 sm:mb-0 sm:mr-3">{course.title}</h4>
              <div className="flex items-center space-x-2">
                <span className={`px-2 py-1 rounded-full text-xs font-semibold ${getDifficultyColor(course.difficulty)}`}>
                  {course.difficulty}
                </span>
                <div className="flex items-center text-gray-600">
                  <Star className="h-4 w-4 mr-1" />
                  <span className={getRelevanceColor(course.relevanceScore)}>
                    {Math.round(course.relevanceScore * 100)}%
                  </span>
                </div>
              </div>
            </div>

            <p className="text-[var(--muted)] text-sm mb-3 line-clamp-2">{course.description}</p>

            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
              <div className="flex items-center space-x-4 text-sm text-gray-500 mb-3 sm:mb-0">
                <div className="flex items-center">
                  <Clock className="h-4 w-4 mr-1" />
                  {course.estimatedTime}
                </div>
                {course.rating && (
                  <div className="flex items-center">
                    <Star className="h-4 w-4 mr-1 text-yellow-500" />
                    {course.rating}/5
                  </div>
                )}
              </div>

              <div className="flex items-center space-x-2">
                {/* Feedback buttons */}
                <button
                  onClick={() => handleFeedback(course.id, 'helpful')}
                  disabled={feedbackLoading[course.id] || course.userFeedback === 'helpful'}
                  className={`p-2 rounded-lg transition-colors ${
                    course.userFeedback === 'helpful'
                      ? 'bg-[rgba(29,185,84,0.12)] text-[var(--accent-green)]'
                      : 'hover:bg-[rgba(255,255,255,0.06)] text-gray-400 hover:text-[var(--accent-green)]'
                  }`}
                  title="This suggestion is helpful"
                >
                  <ThumbsUp className="h-4 w-4" />
                </button>
                
                <button
                  onClick={() => handleFeedback(course.id, 'not_helpful')}
                  disabled={feedbackLoading[course.id] || course.userFeedback === 'not_helpful'}
                  className={`p-2 rounded-lg transition-colors ${
                    course.userFeedback === 'not_helpful'
                      ? 'bg-[rgba(255,75,75,0.12)] text-red-500'
                      : 'hover:bg-[rgba(255,255,255,0.06)] text-gray-400 hover:text-red-500'
                  }`}
                  title="This suggestion is not helpful"
                >
                  <ThumbsDown className="h-4 w-4" />
                </button>

                <button
                  onClick={() => setSelectedCourse(course)}
                  className="bg-[var(--accent-green)] hover:bg-[var(--accent-green-600)] text-[var(--bg-900)] px-3 py-1 rounded-lg text-sm font-medium"
                >
                  View Details
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      <CourseModal
        course={selectedCourse}
        onClose={() => setSelectedCourse(null)}
        onAddCourse={onAddCourse}
      />
    </div>
  );
};

export default CourseSuggestions;