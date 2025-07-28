import React, { useState, useEffect } from 'react'; // Added useEffect
import { Search, TrendingUp, Clock, Star, ArrowRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { apiService } from '../services/api';

export default function HomePage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();
  const { user } = useAuth();

  const [featuredCourses, setFeaturedCourses] = useState([]);
  const [stats, setStats] = useState({
    totalCourses: 0,
    totalQuizzes: 0,
    totalHours: 0
  });

  useEffect(() => {
    const loadData = async () => {
      try {
        const [coursesData, statsData] = await Promise.all([
          apiService.getFeaturedCourses(),
          apiService.getUserStats()
        ]);
        
        setFeaturedCourses(coursesData.slice(0, 4));
        setStats({
          totalCourses: statsData.total_courses || 0,
          totalQuizzes: statsData.total_quizzes || 0,
          totalHours: Math.round((statsData.total_study_time || 0) / 60)
        });
      } catch (error) {
        console.error('Error loading data:', error);
        // Fallback to mock data
        setFeaturedCourses([
          { id: 1, title: 'Python Programming', difficulty: 'beginner', estimated_duration: '4 weeks' },
          { id: 2, title: 'React Development', difficulty: 'intermediate', estimated_duration: '6 weeks' },
          { id: 3, title: 'Machine Learning', difficulty: 'advanced', estimated_duration: '8 weeks' },
          { id: 4, title: 'Data Science', difficulty: 'intermediate', estimated_duration: '10 weeks' },
        ]);
      }
    };

    loadData();
  }, []);

  // Removed type annotation from 'e'
  const handleSearch = async (e) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;

    setIsLoading(true);
    
    try {
      const response = await apiService.generateCourse(searchQuery);
      if (response.course) {
        navigate(`/course/${response.course.id}`, { 
          state: { courseName: response.course.title } 
        });
      }
    } catch (error) {
      console.error('Error generating course:', error);
      // Fallback to mock behavior
      await new Promise(resolve => setTimeout(resolve, 2000));
      const courseId = searchQuery.toLowerCase().replace(/\s+/g, '-');
      navigate(`/course/${courseId}`, { state: { courseName: searchQuery } });
    } finally {
      setIsLoading(false);
    }
  };

  // Removed type annotation from 'course'
  const handleCourseClick = (course) => {
    navigate(`/course/${course.id}`, { state: { courseName: course.title || course.name } });
  };

  return (
    <div className="min-h-screen bg-gray-900 px-6 py-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-white mb-2">Welcome back, {user?.name}!</h1>
        <p className="text-gray-400">What would you like to learn today?</p>
      </div>

      {/* Search Section */}
      <div className="mb-12">
        <form onSubmit={handleSearch} className="relative">
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
          <button
            type="submit"
            disabled={!searchQuery.trim() || isLoading}
            className="absolute right-2 top-1/2 transform -translate-y-1/2 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 disabled:from-gray-600 disabled:to-gray-600 text-white px-6 py-2 rounded-lg font-medium transition-all disabled:cursor-not-allowed"
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

      {/* Featured Courses */}
      <div className="mb-8">
        <div className="flex items-center mb-6">
          <TrendingUp className="w-6 h-6 text-purple-400 mr-2" />
          <h2 className="text-2xl font-bold text-white">Featured Courses</h2>
        </div>
        
        <div className="grid md:grid-cols-2 gap-6">
          {featuredCourses.map((course) => (
            <div
              key={course.id}
              onClick={() => handleCourseClick(course)}
              className="bg-gradient-to-br from-gray-800 to-gray-800/50 backdrop-blur-sm p-6 rounded-xl border border-gray-700 hover:border-purple-500 transition-all duration-300 cursor-pointer group hover:transform hover:scale-105"
            >
              <div className="flex justify-between items-start mb-4">
                <h3 className="text-xl font-semibold text-white group-hover:text-purple-300 transition-colors">
                  {course.title || course.name}
                </h3>
                <ArrowRight className="w-5 h-5 text-gray-400 group-hover:text-purple-400 transition-colors" />
              </div>
              
              <div className="flex items-center space-x-4 text-sm text-gray-400 mb-3">
                <span className="bg-purple-500/20 text-purple-300 px-2 py-1 rounded">
                  {course.difficulty || 'Beginner'}
                </span>
                <div className="flex items-center">
                  <Clock className="w-4 h-4 mr-1" />
                  {course.estimated_duration || '4 weeks'}
                </div>
              </div>
              
              <div className="w-full bg-gray-700 rounded-full h-2">
                <div className="bg-gradient-to-r from-purple-500 to-blue-500 h-2 rounded-full" style={{ width: '0%' }}></div>
              </div>
              <p className="text-xs text-gray-400 mt-2">Click to start learning</p>
            </div>
          ))}
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-3 gap-4">
        <div className="bg-gray-800/50 p-4 rounded-xl text-center">
          <div className="text-2xl font-bold text-purple-400">{stats.totalCourses}</div>
          <div className="text-sm text-gray-400">Courses Started</div>
        </div>
        <div className="bg-gray-800/50 p-4 rounded-xl text-center">
          <div className="text-2xl font-bold text-blue-400">{stats.totalQuizzes}</div>
          <div className="text-sm text-gray-400">Quizzes Taken</div>
        </div>
        <div className="bg-gray-800/50 p-4 rounded-xl text-center">
          <div className="text-2xl font-bold text-green-400">{stats.totalHours}h</div>
          <div className="text-sm text-gray-400">Time Studied</div>
        </div>
      </div>
    </div>
  );
}
