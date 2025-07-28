import React, { useState, useEffect } from 'react';
import { BookOpen, Clock, CheckCircle, TrendingUp, Target } from 'lucide-react';
import { Link } from 'react-router-dom';
import { apiService } from '../services/api';

export default function MyCoursesPage() {
  const [enrolledCourses, setEnrolledCourses] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  const suggestedCourses = [
    { id: 'javascript', name: 'JavaScript Fundamentals', difficulty: 'Beginner', duration: '3 weeks' },
    { id: 'web-development', name: 'Web Development', difficulty: 'Intermediate', duration: '8 weeks' },
    { id: 'data-analysis', name: 'Data Analysis', difficulty: 'Intermediate', duration: '6 weeks' },
    { id: 'api-design', name: 'API Design', difficulty: 'Advanced', duration: '4 weeks' }
  ];

  const [overallStats, setOverallStats] = useState({
    totalCourses: 0,
    completedCourses: 0,
    totalHours: 0,
    averageProgress: 0
  });

  useEffect(() => {
    const loadData = async () => {
      setIsLoading(true);
      try {
        const [coursesData, statsData] = await Promise.all([
          apiService.getMyCourses(),
          apiService.getUserStats()
        ]);
        
        // Removed type annotation from 'userCourse'
        const transformedCourses = coursesData.map((userCourse) => ({
          id: userCourse.course.id,
          name: userCourse.course.title,
          progress: userCourse.progress_percentage,
          totalTopics: userCourse.course.topics?.length || 0,
          completedTopics: Math.round((userCourse.progress_percentage / 100) * (userCourse.course.topics?.length || 0)),
          lastAccessed: new Date(userCourse.enrolled_at).toISOString().split('T')[0],
          difficulty: userCourse.course.difficulty,
          estimatedTime: userCourse.course.estimated_duration
        }));
        
        setEnrolledCourses(transformedCourses);
        
        setOverallStats({
          totalCourses: statsData.total_courses || 0,
          completedCourses: statsData.completed_courses || 0,
          totalHours: Math.round((statsData.total_study_time || 0) / 60),
          averageProgress: transformedCourses.length > 0 
            // Removed type annotations from 'acc' and 'course'
            ? transformedCourses.reduce((acc, course) => acc + course.progress, 0) / transformedCourses.length 
            : 0
        });
      } catch (error) {
        console.error('Error loading courses:', error);
        // Fallback to empty state
        setEnrolledCourses([]);
      } finally {
        setIsLoading(false);
      }
    };

    loadData();
  }, []);

  return (
    <div className="min-h-screen bg-gray-900 px-6 py-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-white mb-2">My Learning Journey</h1>
        <p className="text-gray-400">Track your progress and discover new courses</p>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        <div className="bg-gradient-to-br from-purple-600/20 to-purple-800/20 p-4 rounded-xl border border-purple-500/30">
          <div className="flex items-center justify-between mb-2">
            <BookOpen className="w-5 h-5 text-purple-400" />
            <span className="text-2xl font-bold text-white">{overallStats.totalCourses}</span>
          </div>
          <p className="text-sm text-gray-300">Courses Enrolled</p>
        </div>
        
        <div className="bg-gradient-to-br from-green-600/20 to-green-800/20 p-4 rounded-xl border border-green-500/30">
          <div className="flex items-center justify-between mb-2">
            <CheckCircle className="w-5 h-5 text-green-400" />
            <span className="text-2xl font-bold text-white">{overallStats.completedCourses}</span>
          </div>
          <p className="text-sm text-gray-300">Completed</p>
        </div>
        
        <div className="bg-gradient-to-br from-blue-600/20 to-blue-800/20 p-4 rounded-xl border border-blue-500/30">
          <div className="flex items-center justify-between mb-2">
            <Clock className="w-5 h-5 text-blue-400" />
            <span className="text-2xl font-bold text-white">{Math.round(overallStats.totalHours)}h</span>
          </div>
          <p className="text-sm text-gray-300">Time Studied</p>
        </div>
        
        <div className="bg-gradient-to-br from-orange-600/20 to-orange-800/20 p-4 rounded-xl border border-orange-500/30">
          <div className="flex items-center justify-between mb-2">
            <TrendingUp className="w-5 h-5 text-orange-400" />
            <span className="text-2xl font-bold text-white">{Math.round(overallStats.averageProgress)}%</span>
          </div>
          <p className="text-sm text-gray-300">Avg Progress</p>
        </div>
      </div>

      {/* Current Courses */}
      <div className="mb-8">
        <h2 className="text-2xl font-bold text-white mb-6">Current Courses</h2>
        
        {isLoading ? (
          <div className="bg-gray-800/50 backdrop-blur-sm rounded-xl p-8 border border-gray-700 text-center">
            <div className="w-8 h-8 border-2 border-purple-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-gray-400">Loading your courses...</p>
          </div>
        ) : enrolledCourses.length > 0 ? (
          <div className="space-y-4">
            {enrolledCourses.map((course) => (
              <div key={course.id} className="bg-gray-800/50 backdrop-blur-sm rounded-xl p-6 border border-gray-700 hover:border-purple-500 transition-all duration-300">
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h3 className="text-xl font-semibold text-white mb-2">{course.name}</h3>
                    <div className="flex items-center space-x-4 text-sm text-gray-400">
                      <span className="bg-purple-500/20 text-purple-300 px-2 py-1 rounded">
                        {course.difficulty}
                      </span>
                      <div className="flex items-center">
                        <Clock className="w-4 h-4 mr-1" />
                        {course.estimatedTime}
                      </div>
                      <span>Last accessed: {new Date(course.lastAccessed).toLocaleDateString()}</span>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-2xl font-bold text-purple-400">{course.progress}%</div>
                    <div className="text-sm text-gray-400">
                      {course.completedTopics} / {course.totalTopics} topics
                    </div>
                  </div>
                </div>
                
                <div className="mb-4">
                  <div className="w-full bg-gray-700 rounded-full h-2">
                    <div 
                      className="bg-gradient-to-r from-purple-500 to-blue-500 h-2 rounded-full transition-all duration-300"
                      style={{ width: `${course.progress}%` }}
                    ></div>
                  </div>
                </div>
                
                <Link
                  to={`/course/${course.id}`}
                  className="inline-flex items-center bg-purple-600 hover:bg-purple-700 text-white px-6 py-2 rounded-lg font-medium transition-colors"
                >
                  Continue Learning
                </Link>
              </div>
            ))}
          </div>
        ) : (
          <div className="bg-gray-800/50 backdrop-blur-sm rounded-xl p-8 border border-gray-700 text-center">
            <BookOpen className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-white mb-2">No courses yet</h3>
            <p className="text-gray-400 mb-6">Start your learning journey by exploring courses</p>
            <Link
              to="/home"
              className="inline-flex items-center bg-purple-600 hover:bg-purple-700 text-white px-6 py-3 rounded-lg font-semibold transition-colors"
            >
              Explore Courses
            </Link>
          </div>
        )}
      </div>

      {/* AI Suggestions */}
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
              
              <Link
                to="/home"
                className="inline-flex items-center text-blue-400 hover:text-blue-300 font-medium transition-colors"
              >
                Learn More →
              </Link>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
