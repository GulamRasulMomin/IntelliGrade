import React, { useState } from "react";
import {
  Search,
  Target,
  Clock,
  AlertTriangle,
  CheckCircle,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import { apiService } from "../services/api";
import { motion, AnimatePresence } from "framer-motion";

export default function HomePage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [difficulty, setDifficulty] = useState("beginner");
  const [durationWeeks, setDurationWeeks] = useState(4);
  const [isLoading, setIsLoading] = useState(false);
  const [notification, setNotification] = useState(null);
  const navigate = useNavigate();
  const { user } = useAuth();

  const suggestedCourses = [
    {
      id: "javascript",
      name: "JavaScript Fundamentals",
      difficulty: "beginner",
      duration: "4",
    },
    {
      id: "web-development",
      name: "Web Development",
      difficulty: "intermediate",
      duration: "5",
    },
    {
      id: "data-analysis",
      name: "Data Analysis",
      difficulty: "intermediate",
      duration: "6",
    },
    {
      id: "api-design",
      name: "API Design",
      difficulty: "advanced",
      duration: "4",
    },
  ];

  const handleSearch = async (e) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;
    setIsLoading(true);
    setNotification(null);

    try {
      const response = await apiService.generateCourse(
        searchQuery,
        difficulty,
        durationWeeks
      );

      if (response.course) {
        setNotification({
          type: response.warning ? "warning" : "success",
          message: response.warning || response.message,
          details: response.warning ? response.message : null,
        });

        setTimeout(() => {
          navigate(`/course/${response.course.id}`, {
            state: { courseName: response.course.title },
          });
        }, 1500);
      }
    } catch (error) {
      setNotification({
        type: "error",
        message: "Error generating course. Please try again later.",
        details: error.message || "The AI service is currently unavailable.",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleRecommendedCourse = (name, diff, dur) => {
    setSearchQuery(name);
    setDifficulty(diff);
    setDurationWeeks(dur);
    handleSearch({ preventDefault: () => {} });
  };

  return (
    <div className="min-h-screen bg-gray-900 px-4 sm:px-6 py-6 sm:py-10">
      {/* Header */}
      <motion.div
        className="mb-8 text-center sm:text-left"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <h1 className="text-2xl sm:text-3xl font-bold text-white mb-2">
          Welcome back, {user?.username}!
        </h1>
        <p className="text-gray-400">
          What would you like to learn today?
        </p>
      </motion.div>

      {/* Notification */}
      <AnimatePresence>
        {notification && (
          <motion.div
            key="notif"
            className={`mb-6 p-4 rounded-lg border ${
              notification.type === "success"
                ? "bg-green-600/20 border-green-500/30 text-green-400"
                : notification.type === "warning"
                ? "bg-yellow-600/20 border-yellow-500/30 text-yellow-400"
                : "bg-red-600/20 border-red-500/30 text-red-400"
            }`}
            initial={{ opacity: 0, y: -15 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -15 }}
            transition={{ duration: 0.3 }}
          >
            <div className="flex items-start space-x-3">
              {notification.type === "success" ? (
                <CheckCircle className="w-5 h-5 mt-0.5 flex-shrink-0" />
              ) : (
                <AlertTriangle className="w-5 h-5 mt-0.5 flex-shrink-0" />
              )}
              <div className="flex-1">
                <p className="font-medium">{notification.message}</p>
                {notification.details && (
                  <p className="text-sm opacity-80 mt-1">
                    {notification.details}
                  </p>
                )}
              </div>
              <button
                onClick={() => setNotification(null)}
                className="text-current opacity-60 hover:opacity-100 transition-opacity"
              >
                ×
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Search Section */}
      <motion.div
        className="mb-12"
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
      >
        <form onSubmit={handleSearch} className="space-y-4">
          <div className="relative">
            <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Enter any course name (e.g., Python Programming)"
              className="w-full pl-12 pr-4 py-4 bg-gray-800 border border-gray-700 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              disabled={isLoading}
            />
          </div>

          {/* Options */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Difficulty Level
              </label>
              <select
                value={difficulty}
                onChange={(e) => setDifficulty(e.target.value)}
                className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                disabled={isLoading}
              >
                <option value="beginner">Beginner</option>
                <option value="intermediate">Intermediate</option>
                <option value="advanced">Advanced</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Duration (Weeks)
              </label>
              <select
                value={durationWeeks}
                onChange={(e) => setDurationWeeks(parseInt(e.target.value))}
                className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                disabled={isLoading}
              >
                <option value={4}>4 Weeks</option>
                <option value={5}>5 Weeks</option>
                <option value={6}>6 Weeks</option>
              </select>
            </div>
          </div>

          <motion.button
            whileTap={{ scale: 0.97 }}
            whileHover={{ scale: 1.02 }}
            type="submit"
            disabled={!searchQuery.trim() || isLoading}
            className="w-full bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 disabled:from-gray-600 disabled:to-gray-600 text-white px-6 py-4 rounded-xl font-medium transition-all disabled:cursor-not-allowed"
          >
            {isLoading ? "Generating..." : "Generate Roadmap"}
          </motion.button>
        </form>
      </motion.div>

      {/* Recommended Courses */}
      <motion.div
        initial="hidden"
        animate="visible"
        variants={{
          hidden: {},
          visible: {
            transition: { staggerChildren: 0.15 },
          },
        }}
      >
        <div className="flex items-center mb-6 justify-center sm:justify-start">
          <Target className="w-6 h-6 text-blue-400 mr-2" />
          <h2 className="text-2xl font-bold text-white">Recommended for You</h2>
        </div>

        <div className="grid gap-6 sm:grid-cols-2">
          {suggestedCourses.map((course) => (
            <motion.div
              key={course.id}
              variants={{
                hidden: { opacity: 0, y: 20 },
                visible: { opacity: 1, y: 0 },
              }}
              className="bg-gray-800/50 backdrop-blur-sm rounded-xl p-6 border border-gray-700 hover:border-blue-500 transition-all duration-300 group"
            >
              <h3 className="text-lg font-semibold text-white mb-3 group-hover:text-blue-300 transition-colors">
                {course.name}
              </h3>

              <div className="flex items-center space-x-4 text-sm text-gray-400 mb-4">
                <span className="bg-blue-500/20 text-blue-300 px-2 py-1 rounded">
                  {course.difficulty}
                </span>
                <div className="flex items-center">
                  <Clock className="w-4 h-4 mr-1" />
                  {course.duration} weeks
                </div>
              </div>

              <motion.button
                whileHover={{ x: 5 }}
                onClick={() =>
                  handleRecommendedCourse(
                    course.name,
                    course.difficulty,
                    course.duration
                  )
                }
                disabled={isLoading}
                className="inline-flex items-center text-blue-400 hover:text-blue-300 font-medium transition-colors disabled:opacity-50"
              >
                Learn More →
              </motion.button>
            </motion.div>
          ))}
        </div>
      </motion.div>
    </div>
  );
}
