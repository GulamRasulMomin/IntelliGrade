import React, { useState, useEffect } from 'react';
import { Search, Target, Clock, ArrowRight, AlertTriangle, CheckCircle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { apiService } from '../services/api';

export default function HomePage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [difficulty, setDifficulty] = useState('beginner');
  const [durationWeeks, setDurationWeeks] = useState(4);
  const [isLoading, setIsLoading] = useState(false);
  const [notification, setNotification] = useState(null);
  const navigate = useNavigate();
  const { user } = useAuth();

  const suggestedCourses = [
    { id: 'javascript', name: 'JavaScript Fundamentals', difficulty: 'Beginner', duration: '4 weeks' },
    { id: 'web-development', name: 'Web Development', difficulty: 'Intermediate', duration: '5 weeks' },
    { id: 'data-analysis', name: 'Data Analysis', difficulty: 'Intermediate', duration: '6 weeks' },
    { id: 'api-design', name: 'API Design', difficulty: 'Advanced', duration: '4 weeks' }
  ];

  const handleSearch = async (e) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;

    setIsLoading(true);
    setNotification(null);
    
    try {
      const response = await apiService.generateCourse(searchQuery, difficulty, durationWeeks);
      if (response.course) {
        // Show notification based on response
        if (response.warning) {
          setNotification({
            type: 'warning',
            message: response.warning,
            details: response.message
          });
        } else {
          setNotification({
            type: 'success',
            message: response.message
          });
        }
        
        // Navigate to course after a short delay to show notification
        setTimeout(() => {
          navigate(`/course/${response.course.id}`, { 
            state: { courseName: response.course.title } 
          });
        }, 1500);
      }
    } catch (error) {
      console.error('Error generating course:', error);
      setNotification({
        type: 'error',
        message: 'Error generating course. Please try again later.',
        details: error.message || 'The AI service is currently experiencing issues.'
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleRecommendedCourse = async (courseName) => {
    setIsLoading(true);
    setNotification(null);
    
    try {
      const response = await apiService.generateCourse(courseName, difficulty, durationWeeks);
      if (response.course) {
        // Show notification based on response
        if (response.warning) {
          setNotification({
            type: 'warning',
            message: response.warning,
            details: response.message
          });
        } else {
          setNotification({
            type: 'success',
            message: response.message
          });
        }
        
        // Navigate to course after a short delay to show notification
        setTimeout(() => {
          navigate(`/course/${response.course.id}`, { 
            state: { courseName: response.course.title } 
          });
        }, 1500);
      }
    } catch (error) {
      console.error('Error generating course:', error);
      setNotification({
        type: 'error',
        message: 'Error generating course. Please try again later.',
        details: error.message || 'The AI service is currently experiencing issues.'
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-900 px-6 py-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-white mb-2">Welcome back, {user?.username}!</h1>
        <p className="text-gray-400">What would you like to learn today?</p>
      </div>

      {/* Notification */}
      {notification && (
        <div className={`mb-6 p-4 rounded-lg border ${
          notification.type === 'success' 
            ? 'bg-green-600/20 border-green-500/30 text-green-400' 
            : notification.type === 'warning'
            ? 'bg-yellow-600/20 border-yellow-500/30 text-yellow-400'
            : 'bg-red-600/20 border-red-500/30 text-red-400'
        }`}>
          <div className="flex items-start space-x-3">
            {notification.type === 'success' ? (
              <CheckCircle className="w-5 h-5 mt-0.5 flex-shrink-0" />
            ) : (
              <AlertTriangle className="w-5 h-5 mt-0.5 flex-shrink-0" />
            )}
            <div className="flex-1">
              <p className="font-medium">{notification.message}</p>
              {notification.details && (
                <p className="text-sm opacity-80 mt-1">{notification.details}</p>
              )}
            </div>
            <button
              onClick={() => setNotification(null)}
              className="text-current opacity-60 hover:opacity-100 transition-opacity"
            >
              ×
            </button>
          </div>
        </div>
      )}

      {/* Search Section */}
      <div className="mb-12">
        <form onSubmit={handleSearch} className="space-y-4">
          <div className="relative">
            <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Enter any course name (e.g., Python Programming, Web Development)"
              className="w-full pl-12 pr-4 py-4 bg-gray-800 border border-gray-700 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              disabled={isLoading}
            />
          </div>
          
          {/* Course Options */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Difficulty Selection */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">Difficulty Level</label>
              <select
                value={difficulty}
                onChange={(e) => setDifficulty(e.target.value)}
                className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                disabled={isLoading}
              >
                <option value="beginner">Beginner</option>
                <option value="intermediate">Intermediate</option>
                <option value="advanced">Advanced</option>
              </select>
            </div>
            
            {/* Duration Selection */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">Duration (Weeks)</label>
              <select
                value={durationWeeks}
                onChange={(e) => setDurationWeeks(parseInt(e.target.value))}
                className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                disabled={isLoading}
              >
                <option value={4}>4 Weeks</option>
                <option value={5}>5 Weeks</option>
                <option value={6}>6 Weeks</option>
              </select>
            </div>
          </div>
          
          <button
            type="submit"
            disabled={!searchQuery.trim() || isLoading}
            className="w-full bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 disabled:from-gray-600 disabled:to-gray-600 text-white px-6 py-4 rounded-xl font-medium transition-all disabled:cursor-not-allowed"
          >
            {isLoading ? 'Generating...' : 'Generate Roadmap'}
          </button>
        </form>
        
        {isLoading && (
          <div className="mt-4 flex items-center justify-center">
            <div className="flex items-center space-x-2 text-purple-400">
              <div className="w-4 h-4 border-2 border-purple-400 border-t-transparent rounded-full animate-spin"></div>
              <span>AI is creating your personalized learning roadmap...</span>
            </div>
          </div>
        )}
      </div>

      {/* Recommended for You */}
      <div>
        <div className="flex items-center mb-6">
          <Target className="w-6 h-6 text-blue-400 mr-2" />
          <h2 className="text-2xl font-bold text-white">Recommended for You</h2>
        </div>
        
        <div className="grid md:grid-cols-2 gap-6">
          {suggestedCourses.map((course) => (
            <div key={course.id} className="bg-gray-800/50 backdrop-blur-sm rounded-xl p-6 border border-gray-700 hover:border-blue-500 transition-all duration-300 group">
              <h3 className="text-lg font-semibold text-white mb-3 group-hover:text-blue-300 transition-colors">
                {course.name}
              </h3>
              
              <div className="flex items-center space-x-4 text-sm text-gray-400 mb-4">
                <span className="bg-blue-500/20 text-blue-300 px-2 py-1 rounded">
                  {course.difficulty}
                </span>
                <div className="flex items-center">
                  <Clock className="w-4 h-4 mr-1" />
                  {course.duration}
                </div>
              </div>
              
              <button
                onClick={() => {handleRecommendedCourse(course.name); setSearchQuery(course.name); setDifficulty(course.difficulty); setDurationWeeks(course.duration);}}
                disabled={isLoading}
                className="inline-flex items-center text-blue-400 hover:text-blue-300 font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Learn More →
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
