import React, { useState, useEffect } from "react";
import { BookOpen, Clock, CheckCircle, TrendingUp } from "lucide-react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { apiService } from "../services/api";

// Utility function to format time in hours only
const formatStudyTime = (minutes) => {
  if (minutes === 0) return "0h";
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
    averageProgress: 0,
  });

  useEffect(() => {
    const loadData = async () => {
      setIsLoading(true);
      try {
        const [coursesData, statsData] = await Promise.all([
          apiService.getMyCourses(),
          apiService.getUserStats(),
        ]);

        const transformedCourses = coursesData.map((userCourse) => ({
          id: userCourse.course.id,
          name: userCourse.course.title,
          progress: userCourse.progress_percentage,
          totalTopics: userCourse.course.topics?.length || 0,
          completedTopics: Math.round(
            (userCourse.progress_percentage / 100) *
              (userCourse.course.topics?.length || 0)
          ),
          lastAccessed: new Date(userCourse.enrolled_at)
            .toISOString()
            .split("T")[0],
          difficulty: userCourse.course.difficulty,
          estimatedTime: userCourse.course.estimated_duration,
          completed: userCourse.completed,
          enrolledAt: userCourse.enrolled_at,
          studyTimeMinutes: userCourse.study_time_minutes || 0,
        }));

        setEnrolledCourses(transformedCourses);

        const totalStudyTimeMinutes = transformedCourses.reduce(
          (total, course) => total + course.studyTimeMinutes,
          0
        );

        setOverallStats({
          totalCourses:
            statsData.total_courses || transformedCourses.length,
          completedCourses:
            statsData.completed_courses ||
            transformedCourses.filter((course) => course.completed).length,
          totalHours: Math.round(
            (statsData.total_study_time || totalStudyTimeMinutes) / 60
          ),
          averageProgress:
            transformedCourses.length > 0
              ? transformedCourses.reduce(
                  (acc, course) => acc + course.progress,
                  0
                ) / transformedCourses.length
              : 0,
        });
      } catch (error) {
        console.error("Error loading enrolled courses:", error);
        setEnrolledCourses([]);
      } finally {
        setIsLoading(false);
      }
    };

    loadData();
  }, []);

  return (
    <div className="min-h-screen bg-gray-900 px-4 sm:px-6 lg:px-12 py-8">
      {/* Header */}
      <motion.div
        className="mb-8"
        initial={{ opacity: 0, y: -30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
      >
        <h1 className="text-3xl sm:text-4xl font-bold text-white mb-2">
          My Learning Journey
        </h1>
        <p className="text-gray-400">
          Track your progress and discover new courses
        </p>
      </motion.div>

      {/* Stats Overview */}
      <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        {[
          {
            label: "Courses Enrolled",
            value: overallStats.totalCourses,
            icon: <BookOpen className="w-5 h-5 text-purple-400" />,
            bg: "from-purple-600/20 to-purple-800/20 border-purple-500/30",
          },
          {
            label: "Completed",
            value: overallStats.completedCourses,
            icon: <CheckCircle className="w-5 h-5 text-green-400" />,
            bg: "from-green-600/20 to-green-800/20 border-green-500/30",
          },
          {
            label: "Time Studied",
            value: formatStudyTime(overallStats.totalHours * 60),
            icon: <Clock className="w-5 h-5 text-blue-400" />,
            bg: "from-blue-600/20 to-blue-800/20 border-blue-500/30",
          },
          {
            label: "Avg Progress",
            value: `${Math.round(overallStats.averageProgress)}%`,
            icon: <TrendingUp className="w-5 h-5 text-orange-400" />,
            bg: "from-orange-600/20 to-orange-800/20 border-orange-500/30",
          },
        ].map((stat, index) => (
          <motion.div
            key={stat.label}
            className={`bg-gradient-to-br ${stat.bg} p-4 rounded-xl border`}
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.2, duration: 0.6 }}
          >
            <div className="flex items-center justify-between mb-2">
              {stat.icon}
              <span className="text-2xl sm:text-3xl font-bold text-white">
                {stat.value}
              </span>
            </div>
            <p className="text-sm text-gray-300">{stat.label}</p>
          </motion.div>
        ))}
      </div>

      {/* Enrolled Courses */}
      <div>
        <h2 className="text-2xl font-bold text-white mb-6">
          My Enrolled Courses
        </h2>

        {isLoading ? (
          <div className="bg-gray-800/50 backdrop-blur-sm rounded-xl p-8 border border-gray-700 text-center">
            <div className="w-8 h-8 border-2 border-purple-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-gray-400">Loading your courses...</p>
          </div>
        ) : enrolledCourses.length > 0 ? (
          <div className="space-y-4">
            {enrolledCourses.map((course, index) => (
              <motion.div
                key={course.id}
                className="bg-gray-800/50 backdrop-blur-sm rounded-xl p-6 border border-gray-700 hover:border-purple-500 transition-all duration-300"
                initial={{ opacity: 0, y: 40 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.15, duration: 0.6 }}
              >
                <div className="flex flex-col sm:flex-row justify-between sm:items-start gap-4 mb-4">
                  <div>
                    <div className="flex items-center gap-2 mb-2">
                      <h3 className="text-xl font-semibold text-white">
                        {course.name}
                      </h3>
                      {course.completed && (
                        <span className="bg-green-500/20 text-green-300 px-2 py-1 rounded text-xs font-medium">
                          Completed
                        </span>
                      )}
                    </div>
                    <div className="flex flex-wrap items-center gap-3 text-sm text-gray-400">
                      <span className="bg-purple-500/20 text-purple-300 px-2 py-1 rounded">
                        {course.difficulty}
                      </span>
                      <div className="flex items-center">
                        <Clock className="w-4 h-4 mr-1" />
                        {course.estimatedTime}
                      </div>
                      <span>
                        Enrolled:{" "}
                        {new Date(course.enrolledAt).toLocaleDateString()}
                      </span>
                      <span className="text-blue-300">
                        Studied: {formatStudyTime(course.studyTimeMinutes)}
                      </span>
                    </div>
                  </div>
                  <div className="text-left sm:text-right">
                    <div className="text-2xl font-bold text-purple-400">
                      {course.progress}%
                    </div>
                    <div className="text-sm text-gray-400">
                      {course.completedTopics} / {course.totalTopics} topics
                    </div>
                  </div>
                </div>

                <div className="mb-4">
                  <div className="w-full bg-gray-700 rounded-full h-2 mb-2 overflow-hidden">
                    <motion.div
                      className="bg-gradient-to-r from-purple-500 to-blue-500 h-2 rounded-full"
                      initial={{ width: 0 }}
                      animate={{ width: `${course.progress}%` }}
                      transition={{ duration: 1 }}
                    ></motion.div>
                  </div>
                  <div className="flex justify-between text-xs text-gray-400">
                    <span>Progress: {course.progress}%</span>
                    <span>
                      Study Time: {formatStudyTime(course.studyTimeMinutes)}
                    </span>
                  </div>
                </div>

                <Link
                  to={`/course/${course.id}`}
                  className="inline-flex items-center bg-purple-600 hover:bg-purple-700 text-white px-6 py-2 rounded-lg font-medium transition-colors"
                >
                  Continue Learning
                </Link>
              </motion.div>
            ))}
          </div>
        ) : (
          <motion.div
            className="bg-gray-800/50 backdrop-blur-sm rounded-xl p-8 border border-gray-700 text-center"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.6 }}
          >
            <BookOpen className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-white mb-2">
              No enrolled courses yet
            </h3>
            <p className="text-gray-400 mb-6">
              Start your learning journey by enrolling in courses
            </p>
            <Link
              to="/home"
              className="inline-flex items-center bg-purple-600 hover:bg-purple-700 text-white px-6 py-3 rounded-lg font-semibold transition-colors"
            >
              Explore Courses
            </Link>
          </motion.div>
        )}
      </div>
    </div>
  );
}
