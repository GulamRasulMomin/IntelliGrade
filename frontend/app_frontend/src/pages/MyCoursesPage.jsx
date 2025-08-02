import React, { useState, useEffect } from 'react';
import { BookOpen, Clock, CheckCircle, TrendingUp } from 'lucide-react';
import { Link } from 'react-router-dom';
import { apiService } from '../services/api';

// Utility function to format time in hours only
const formatStudyTime = (minutes) => {
  if (minutes === 0) return '0h';
  const hours = Math.round(minutes / 60);
  return `${hours}h`;
};

export default function MyCoursesPage() {
  const [enrolledCourses, setEnrolledCourses] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

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
        
        // Transform enrolled courses data
        const transformedCourses = coursesData.map((userCourse) => ({
          id: userCourse.course.id,
          name: userCourse.course.title,
          progress: userCourse.progress_percentage,
          totalTopics: userCourse.course.topics?.length || 0,
          completedTopics: Math.round((userCourse.progress_percentage / 100) * (userCourse.course.topics?.length || 0)),
          lastAccessed: new Date(userCourse.enrolled_at).toISOString().split('T')[0],
          difficulty: userCourse.course.difficulty,
          estimatedTime: userCourse.course.estimated_duration,
          completed: userCourse.completed,
          enrolledAt: userCourse.enrolled_at,
          studyTimeMinutes: userCourse.study_time_minutes || 0
        }));
        
        setEnrolledCourses(transformedCourses);
        
        // Calculate total study time from all courses (in hours)
        const totalStudyTimeMinutes = transformedCourses.reduce((total, course) => total + course.studyTimeMinutes, 0);
        const totalStudyTimeHours = Math.round(totalStudyTimeMinutes / 60);
        
        setOverallStats({
          totalCourses: statsData.total_courses || transformedCourses.length,
          completedCourses: statsData.completed_courses || transformedCourses.filter(course => course.completed).length,
          totalHours: Math.round((statsData.total_study_time || totalStudyTimeMinutes) / 60),
          averageProgress: transformedCourses.length > 0 
            ? transformedCourses.reduce((acc, course) => acc + course.progress, 0) / transformedCourses.length 
            : 0
        });
      } catch (error) {
        console.error('Error loading enrolled courses:', error);
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
            <span className="text-2xl font-bold text-white">{formatStudyTime(overallStats.totalHours * 60)}</span>
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

      {/* Enrolled Courses */}
      <div>
        <h2 className="text-2xl font-bold text-white mb-6">My Enrolled Courses</h2>
        
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
                    <div className="flex items-center gap-2 mb-2">
                      <h3 className="text-xl font-semibold text-white">{course.name}</h3>
                      {course.completed && (
                        <span className="bg-green-500/20 text-green-300 px-2 py-1 rounded text-xs font-medium">
                          Completed
                        </span>
                      )}
                    </div>
                    <div className="flex items-center space-x-4 text-sm text-gray-400">
                      <span className="bg-purple-500/20 text-purple-300 px-2 py-1 rounded">
                        {course.difficulty}
                      </span>
                      <div className="flex items-center">
                        <Clock className="w-4 h-4 mr-1" />
                        {course.estimatedTime}
                      </div>
                      <span>Enrolled: {new Date(course.enrolledAt).toLocaleDateString()}</span>
                      <span className="text-blue-300">
                        Studied: {formatStudyTime(course.studyTimeMinutes)}
                      </span>
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
                  <div className="w-full bg-gray-700 rounded-full h-2 mb-2">
                    <div 
                      className="bg-gradient-to-r from-purple-500 to-blue-500 h-2 rounded-full transition-all duration-300"
                      style={{ width: `${course.progress}%` }}
                    ></div>
                  </div>
                  <div className="flex justify-between text-xs text-gray-400">
                    <span>Progress: {course.progress}%</span>
                    <span>Study Time: {formatStudyTime(course.studyTimeMinutes)}</span>
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
            <h3 className="text-xl font-semibold text-white mb-2">No enrolled courses yet</h3>
            <p className="text-gray-400 mb-6">Start your learning journey by enrolling in courses</p>
            <Link
              to="/home"
              className="inline-flex items-center bg-purple-600 hover:bg-purple-700 text-white px-6 py-3 rounded-lg font-semibold transition-colors"
            >
              Explore Courses
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}
