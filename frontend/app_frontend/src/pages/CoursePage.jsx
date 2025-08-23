import React, { useState, useEffect } from 'react';
import { useParams, useLocation, Link } from 'react-router-dom';
import { ArrowLeft, Clock, BookOpen, Brain, CheckCircle2, Circle } from 'lucide-react';
import { apiService } from '../services/api';
import { motion } from 'framer-motion';

export default function CoursePage() {
  const { courseId } = useParams();
  const location = useLocation();
  const courseName = location.state?.courseName || courseId?.replace('-', ' ');
  const [courseData, setCourseData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const generateCourseData = async () => {
      setIsLoading(true);
      try {
        const response = await apiService.getCourse(courseId);

        const transformedData = {
          title: response.title,
          description: response.description,
          totalDuration: response.estimated_duration,
          difficulty: response.difficulty,
          topics:
            response.topics?.map((topic) => ({
              id: topic.id.toString(),
              title: topic.title,
              duration: topic.estimated_time,
              completed: topic.progress?.completed || false,
              description: topic.description,
            })) || [],
        };

        setCourseData(transformedData);

        try {
          await apiService.logStudySession(courseId, null, 5);
        } catch (error) {
          console.log('Could not log study session:', error);
        }
      } catch (error) {
        console.error('Error loading course:', error);
        // fallback mock data
        setCourseData({
          title: courseName || 'Course',
          description: `Master ${courseName} with our AI-curated learning path. This comprehensive course covers everything from fundamentals to advanced concepts.`,
          totalDuration: '6-8 weeks',
          difficulty: 'Beginner to Intermediate',
          topics: [
            { id: '1', title: 'Introduction & Setup', duration: '2 hours', completed: false, description: 'Set up your environment' },
            { id: '2', title: 'Core Concepts', duration: '4 hours', completed: false, description: 'Learn the fundamentals' },
            { id: '3', title: 'Practical Applications', duration: '6 hours', completed: false, description: 'Hands-on practice' },
          ],
        });
      } finally {
        setIsLoading(false);
      }
    };

    generateCourseData();
  }, [courseId, courseName]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-900 px-6 py-8 flex flex-col items-center justify-center text-center">
        <div className="w-16 h-16 border-4 border-purple-500 border-t-transparent rounded-full animate-spin mb-6"></div>
        <h2 className="text-2xl font-semibold text-white">Generating Your Roadmap</h2>
        <p className="text-gray-400 max-w-md mt-2">
          Our AI is analyzing <span className="text-purple-400">{courseName}</span> and creating your personalized learning path...
        </p>
      </div>
    );
  }

  if (!courseData) return null;

  return (
    <div className="min-h-screen bg-gray-900 px-4 sm:px-6 py-8">
      {/* Back Link */}
      <Link
        to="/my-courses"
        className="inline-flex items-center text-gray-300 hover:text-white mb-6 transition-colors"
      >
        <ArrowLeft className="w-4 h-4 mr-2" />
        Back to Courses
      </Link>

      {/* Course Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="bg-gradient-to-r from-purple-600/20 to-blue-600/20 rounded-2xl p-6 sm:p-8 border border-purple-500/30 mb-8"
      >
        <h1 className="text-2xl sm:text-3xl font-bold text-white mb-4">{courseData.title}</h1>
        <p className="text-gray-300 mb-6 leading-relaxed">{courseData.description}</p>

        <div className="flex flex-wrap gap-3 text-sm">
          <div className="flex items-center bg-gray-800/50 px-3 py-2 rounded-lg">
            <Clock className="w-4 h-4 text-purple-400 mr-2" />
            <span className="text-gray-300">{courseData.totalDuration}</span>
          </div>
          <div className="flex items-center bg-gray-800/50 px-3 py-2 rounded-lg">
            <Brain className="w-4 h-4 text-blue-400 mr-2" />
            <span className="text-gray-300">{courseData.difficulty}</span>
          </div>
          <div className="flex items-center bg-gray-800/50 px-3 py-2 rounded-lg">
            <BookOpen className="w-4 h-4 text-green-400 mr-2" />
            <span className="text-gray-300">{courseData.topics.length} Topics</span>
          </div>
        </div>
      </motion.div>

      {/* Learning Roadmap */}
      <h2 className="text-2xl font-bold text-white mb-6">Learning Roadmap</h2>
      <div className="space-y-4">
        {courseData.topics.map((topic, index) => (
          <motion.div
            key={topic.id}
            initial={{ opacity: 0, x: -40 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: index * 0.15, duration: 0.5 }}
            className="bg-gray-800/50 rounded-xl border border-gray-700 hover:border-purple-500 transition-all duration-300"
          >
            <div className="p-6">
              <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between mb-4 gap-4">
                <div className="flex items-start space-x-4">
                  <div className="flex-shrink-0 mt-1">
                    {topic.completed ? (
                      <CheckCircle2 className="w-6 h-6 text-green-400" />
                    ) : (
                      <Circle className="w-6 h-6 text-gray-400" />
                    )}
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-white group-hover:text-purple-300 transition-colors">
                      {index + 1}. {topic.title}
                    </h3>
                    <p className="text-gray-400 mt-1">{topic.description}</p>
                  </div>
                </div>
                <span className="text-sm text-gray-400 bg-gray-700 px-2 py-1 rounded self-start">
                  {topic.duration}
                </span>
              </div>

              {/* Buttons */}
              <div className="flex flex-col sm:flex-row gap-3">
                <Link
                  to={`/course/${courseId}/notes/${topic.id}`}
                  state={{ topicTitle: topic.title, courseTitle: courseData.title }}
                  className="flex-1 bg-purple-600 hover:bg-purple-700 text-white py-2 px-4 rounded-lg font-medium text-center transition-colors"
                >
                  View Notes
                </Link>
                <Link
                  to={`/course/${courseId}/quiz/${topic.id}`}
                  state={{ topicTitle: topic.title, courseTitle: courseData.title }}
                  className="flex-1 bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded-lg font-medium text-center transition-colors"
                >
                  Take Quiz
                </Link>
              </div>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
