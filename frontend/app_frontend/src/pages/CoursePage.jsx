import React, { useState, useEffect } from 'react';
import { useParams, useLocation, Link } from 'react-router-dom';
import { ArrowLeft, Clock, BookOpen, Brain, CheckCircle2, Circle } from 'lucide-react';
import { apiService } from '../services/api';


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
        // The non-null assertion (!) is removed as it's a TypeScript feature.
        const response = await apiService.getCourse(courseId);

        const transformedData = {
          title: response.title,
          description: response.description,
          totalDuration: response.estimated_duration,
          difficulty: response.difficulty,
          // The type annotation (topic: any) is removed.
          topics: response.topics?.map((topic) => ({
            id: topic.id.toString(),
            title: topic.title,
            duration: topic.estimated_time,
            completed: topic.progress?.completed || false,
            description: topic.description
          })) || []
        };

        setCourseData(transformedData);
      } catch (error) {
        console.error('Error loading course:', error);
        // Fallback to mock data
        const mockData = {
          title: courseName || 'Course',
          description: `Master ${courseName} with our AI-curated learning path. This comprehensive course covers everything from fundamentals to advanced concepts, designed to take you from beginner to proficient.`,
          totalDuration: '6-8 weeks',
          difficulty: 'Beginner to Intermediate',
          topics: [
            {
              id: '1',
              title: 'Introduction and Setup',
              duration: '2 hours',
              completed: false,
              description: 'Get started with the basics and set up your development environment'
            },
            {
              id: '2',
              title: 'Core Concepts',
              duration: '4 hours',
              completed: false,
              description: 'Learn the fundamental concepts and principles'
            },
            {
              id: '3',
              title: 'Practical Applications',
              duration: '6 hours',
              completed: false,
              description: 'Apply your knowledge with hands-on projects and examples'
            },
            {
              id: '4',
              title: 'Advanced Topics',
              duration: '5 hours',
              completed: false,
              description: 'Dive deep into advanced concepts and best practices'
            },
            {
              id: '5',
              title: 'Project Implementation',
              duration: '8 hours',
              completed: false,
              description: 'Build a comprehensive project to showcase your skills'
            },
            {
              id: '6',
              title: 'Testing and Deployment',
              duration: '3 hours',
              completed: false,
              description: 'Learn testing strategies and deployment techniques'
            }
          ]
        };
        setCourseData(mockData);
      } finally {
        setIsLoading(false);
      }
    };

    generateCourseData();
  }, [courseId, courseName]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-900 px-6 py-8">
        <Link to="/home" className="inline-flex items-center text-gray-300 hover:text-white mb-8 transition-colors">
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Home
        </Link>
        
        <div className="flex flex-col items-center justify-center py-20">
          <div className="w-16 h-16 border-4 border-purple-500 border-t-transparent rounded-full animate-spin mb-4"></div>
          <h2 className="text-2xl font-semibold text-white mb-2">Generating Your Roadmap</h2>
          <p className="text-gray-400 text-center max-w-md">
            Our AI is analyzing {courseName} and creating a personalized learning path just for you...
          </p>
        </div>
      </div>
    );
  }

  if (!courseData) return null;

  return (
    <div className="min-h-screen bg-gray-900 px-6 py-8">
      {/* Header */}
      <div className="mb-8">
        <Link to="/home" className="inline-flex items-center text-gray-300 hover:text-white mb-6 transition-colors">
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Home
        </Link>
        
        <div className="bg-gradient-to-r from-purple-600/20 to-blue-600/20 backdrop-blur-sm rounded-2xl p-8 border border-purple-500/30 mb-8">
          <h1 className="text-3xl font-bold text-white mb-4">{courseData.title}</h1>
          <p className="text-gray-300 mb-6 leading-relaxed">{courseData.description}</p>
          
          <div className="flex flex-wrap gap-4 text-sm">
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
        </div>
      </div>

      {/* Learning Path */}
      <div className="mb-8">
        <h2 className="text-2xl font-bold text-white mb-6">Learning Roadmap</h2>
        
        <div className="space-y-4">
          {courseData.topics.map((topic, index) => (
            <div
              key={topic.id}
              className="bg-gray-800/50 backdrop-blur-sm rounded-xl border border-gray-700 hover:border-purple-500 transition-all duration-300 group"
            >
              <div className="p-6">
                <div className="flex items-start justify-between mb-4">
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
                  <span className="text-sm text-gray-400 bg-gray-700 px-2 py-1 rounded">
                    {topic.duration}
                  </span>
                </div>
                
                <div className="flex space-x-3">
                  <Link
                    to={`/course/${courseId}/notes/${topic.id}`}
                    state={{ topicTitle: topic.title, courseTitle: courseData.title }}
                    className="flex-1 bg-purple-600 hover:bg-purple-700 text-white py-2 px-4 rounded-lg font-medium transition-colors text-center"
                  >
                    View Notes
                  </Link>
                  <Link
                    to={`/course/${courseId}/quiz/${topic.id}`}
                    state={{ topicTitle: topic.title, courseTitle: courseData.title }}
                    className="flex-1 bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded-lg font-medium transition-colors text-center"
                  >
                    Take Quiz
                  </Link>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Progress Summary */}
      <div className="bg-gray-800/50 backdrop-blur-sm rounded-xl p-6 border border-gray-700">
        <h3 className="text-lg font-semibold text-white mb-4">Course Progress</h3>
        <div className="w-full bg-gray-700 rounded-full h-3 mb-2">
          <div className="bg-gradient-to-r from-purple-500 to-blue-500 h-3 rounded-full" style={{ width: '0%' }}></div>
        </div>
        <p className="text-gray-400 text-sm">0% Complete • 0 of {courseData.topics.length} topics finished</p>
      </div>
    </div>
  );
}
