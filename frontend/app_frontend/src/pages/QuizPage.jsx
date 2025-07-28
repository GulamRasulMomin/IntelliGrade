import React, { useState, useEffect } from 'react';
import { useParams, useLocation, Link } from 'react-router-dom';
import { ArrowLeft, CheckCircle, XCircle, RotateCcw } from 'lucide-react';
import { apiService } from '../services/api';

/**
 * @typedef {object} Question
 * @property {string} id
 * @property {string} question
 * @property {string[]} options
 * @property {number} correctAnswer
 * @property {string} explanation
 */

export default function QuizPage() {
  const { courseId, topicId } = useParams();
  const location = useLocation();
  const { topicTitle, courseTitle } = location.state || {};
  const [questions, setQuestions] = useState([]);
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [selectedAnswers, setSelectedAnswers] = useState([]);
  const [showResults, setShowResults] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isFallbackQuiz, setIsFallbackQuiz] = useState(false);

  useEffect(() => {
    const generateQuiz = async () => {
      setIsLoading(true);
      
      try {
        const response = await apiService.getTopicQuiz(topicId);
        console.log("Quiz API response:", response); // Add this line
        const quizQuestions = response.questions.map((q) => ({
          id: q.id,
          question: q.question,
          options: q.options,
          correctAnswer: q.correct_answer,
          explanation: q.explanation
        }));
        
        setQuestions(quizQuestions);
        setSelectedAnswers(new Array(quizQuestions.length).fill(-1));
        setIsFallbackQuiz(!!response.is_fallback);
      } catch (error) {
        console.error('Error loading quiz:', error);
        // Fallback to mock questions
        const mockQuestions = [
          {
            id: '1',
            question: `Which of the following best describes the main concept of ${topicTitle}?`,
            options: [
              'A fundamental building block that forms the foundation',
              'An advanced technique used only by experts',
              'A deprecated approach that should be avoided',
              'A theoretical concept with no practical applications'
            ],
            correctAnswer: 0,
            explanation: 'The main concept serves as a fundamental building block that forms the foundation for understanding and implementing this topic effectively.'
          },
          {
            id: '2',
            question: 'What is the most important best practice when implementing this concept?',
            options: [
              'Always use the most complex solution available',
              'Ignore error handling to keep code simple',
              'Follow industry-standard approaches for quality',
              'Avoid documentation to save time'
            ],
            correctAnswer: 2,
            explanation: 'Following industry-standard approaches ensures quality, maintainability, and reliability in your implementations.'
          },
          {
            id: '3',
            question: 'Which scenario represents a common real-world application?',
            options: [
              'Only academic research projects',
              'Solving practical problems in production systems',
              'Theoretical exercises with no implementation',
              'Only in legacy systems that are being retired'
            ],
            correctAnswer: 1,
            explanation: 'This concept is most valuable when applied to solve practical problems in production systems where real users benefit from the implementation.'
          },
          {
            id: '4',
            question: 'What should you avoid when working with this concept?',
            options: [
              'Reading documentation thoroughly',
              'Testing your implementation carefully',
              'Common pitfalls that lead to errors',
              'Following established patterns'
            ],
            correctAnswer: 2,
            explanation: 'Being aware of and avoiding common pitfalls helps prevent errors and ensures your implementation follows best practices.'
          },
          {
            id: '5',
            question: 'How does this topic prepare you for advanced concepts?',
            options: [
              'It has no connection to advanced topics',
              'It provides foundational knowledge for building complexity',
              'It only applies to basic implementations',
              'It should be forgotten when moving to advanced topics'
            ],
            correctAnswer: 1,
            explanation: 'This topic provides essential foundational knowledge that serves as a building block for understanding and implementing more advanced concepts.'
          }
        ];
        setQuestions(mockQuestions);
        setSelectedAnswers(new Array(mockQuestions.length).fill(-1));
      } finally {
        setIsLoading(false);
      }
    };

    generateQuiz();
  }, [topicId, topicTitle]);

  const handleAnswerSelect = (answerIndex) => {
    if (showResults) return;
    
    const newAnswers = [...selectedAnswers];
    newAnswers[currentQuestion] = answerIndex;
    setSelectedAnswers(newAnswers);
  };

  const handleNext = async () => {
    if (currentQuestion < questions.length - 1) {
      setCurrentQuestion(currentQuestion + 1);
    } else {
      await submitQuizAnswers();
    }
  };

  const submitQuizAnswers = async () => {
    try {
      const response = await apiService.submitQuiz(topicId, selectedAnswers);
      console.log('Quiz submitted:', response);
      
      // Log study session for quiz
      await apiService.logStudySession(courseId, topicId, 20);
    } catch (error) {
      console.error('Error submitting quiz:', error);
    } finally {
      setShowResults(true);
    }
  };

  const handlePrevious = () => {
    setCurrentQuestion(currentQuestion - 1);
  };

  const resetQuiz = () => {
    setCurrentQuestion(0);
    setSelectedAnswers(new Array(questions.length).fill(-1));
    setShowResults(false);
  };

  const calculateScore = () => {
    return selectedAnswers.reduce((score, answer, index) => {
      return answer === questions[index]?.correctAnswer ? score + 1 : score;
    }, 0);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-900 px-6 py-8">
        <Link to={`/course/${courseId}`} className="inline-flex items-center text-gray-300 hover:text-white mb-8 transition-colors">
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Course
        </Link>
        
        {isFallbackQuiz && (
          <div className="mb-4 p-4 bg-yellow-900/60 border-l-4 border-yellow-400 text-yellow-200 rounded">
            ⚠️ AI-powered quiz is currently unavailable. Showing default questions.
          </div>
        )}
        <div className="flex flex-col items-center justify-center py-20">
          <div className="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mb-4"></div>
          <h2 className="text-2xl font-semibold text-white mb-2">Generating Quiz</h2>
          <p className="text-gray-400 text-center max-w-md">
            AI is creating personalized quiz questions for {topicTitle}...
          </p>
        </div>
      </div>
    );
  }

  if (showResults) {
    const score = calculateScore();
    const percentage = Math.round((score / questions.length) * 100);
    
    return (
      <div className="min-h-screen bg-gray-900 px-6 py-8">
        <Link to={`/course/${courseId}`} className="inline-flex items-center text-gray-300 hover:text-white mb-8 transition-colors">
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Course
        </Link>
        
        <div className="max-w-4xl mx-auto">
          <div className="bg-gradient-to-r from-purple-600/20 to-blue-600/20 backdrop-blur-sm rounded-2xl p-8 border border-purple-500/30 mb-8 text-center">
            <h1 className="text-3xl font-bold text-white mb-4">Quiz Results</h1>
            <div className="text-6xl font-bold mb-4">
              <span className={percentage >= 70 ? 'text-green-400' : percentage >= 50 ? 'text-yellow-400' : 'text-red-400'}>
                {percentage}%
              </span>
            </div>
            <p className="text-xl text-gray-300 mb-6">
              You scored {score} out of {questions.length} questions correctly
            </p>
            <button
              onClick={resetQuiz}
              className="inline-flex items-center bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-semibold transition-colors"
            >
              <RotateCcw className="w-4 h-4 mr-2" />
              Retake Quiz
            </button>
          </div>

          <div className="space-y-6">
            {questions.map((question, index) => {
              const userAnswer = selectedAnswers[index];
              const isCorrect = userAnswer === question.correctAnswer;
              
              return (
                <div key={question.id} className="bg-gray-800/50 backdrop-blur-sm rounded-xl p-6 border border-gray-700">
                  <div className="flex items-start space-x-3 mb-4">
                    {isCorrect ? (
                      <CheckCircle className="w-6 h-6 text-green-400 flex-shrink-0 mt-1" />
                    ) : (
                      <XCircle className="w-6 h-6 text-red-400 flex-shrink-0 mt-1" />
                    )}
                    <div className="flex-1">
                      <h3 className="text-lg font-semibold text-white mb-3">
                        Question {index + 1}: {question.question}
                      </h3>
                      
                      <div className="space-y-2 mb-4">
                        {question.options.map((option, optionIndex) => {
                          const isUserAnswer = userAnswer === optionIndex;
                          const isCorrectAnswer = optionIndex === question.correctAnswer;
                          
                          let bgColor = 'bg-gray-700';
                          if (isCorrectAnswer) {
                            bgColor = 'bg-green-600/30 border-green-500';
                          } else if (isUserAnswer && !isCorrect) {
                            bgColor = 'bg-red-600/30 border-red-500';
                          }
                          
                          return (
                            <div
                              key={optionIndex}
                              className={`p-3 rounded-lg border ${bgColor} ${
                                isCorrectAnswer ? 'border-green-500' : 
                                isUserAnswer && !isCorrect ? 'border-red-500' : 'border-gray-600'
                              }`}
                            >
                              <span className="text-white">{option}</span>
                              {isCorrectAnswer && <span className="text-green-400 ml-2">✓ Correct</span>}
                              {isUserAnswer && !isCorrect && <span className="text-red-400 ml-2">✗ Your answer</span>}
                            </div>
                          );
                        })}
                      </div>
                      
                      <div className="bg-blue-600/20 border border-blue-500/30 rounded-lg p-4">
                        <p className="text-blue-300 font-semibold mb-1">Explanation:</p>
                        <p className="text-blue-200">{question.explanation}</p>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    );
  }

  const question = questions[currentQuestion];
  const progress = ((currentQuestion + 1) / questions.length) * 100;

  return (
    <div className="min-h-screen bg-gray-900 px-6 py-8">
      {/* Header */}
      <div className="mb-8">
        <Link to={`/course/${courseId}`} className="inline-flex items-center text-gray-300 hover:text-white mb-6 transition-colors">
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Course
        </Link>
        
        <div className="bg-gradient-to-r from-purple-600/20 to-blue-600/20 backdrop-blur-sm rounded-2xl p-6 border border-purple-500/30">
          <h1 className="text-2xl font-bold text-white mb-2">Quiz: {topicTitle}</h1>
          <p className="text-gray-300 mb-4">From {courseTitle}</p>
          
          {isFallbackQuiz && (
            <div className="mb-4 p-4 bg-yellow-900/60 border-l-4 border-yellow-400 text-yellow-200 rounded">
              ⚠️ AI-powered quiz is currently unavailable. Showing default questions.
            </div>
          )}
          <div className="flex items-center justify-between text-sm text-gray-300 mb-2">
            <span>Question {currentQuestion + 1} of {questions.length}</span>
            <span>{Math.round(progress)}% Complete</span>
          </div>
          <div className="w-full bg-gray-700 rounded-full h-2">
            <div 
              className="bg-gradient-to-r from-purple-500 to-blue-500 h-2 rounded-full transition-all duration-300"
              style={{ width: `${progress}%` }}
            ></div>
          </div>
        </div>
      </div>

      {/* Question */}
      {question && (
        <div className="max-w-4xl mx-auto">
          <div className="bg-gray-800/50 backdrop-blur-sm rounded-2xl p-8 border border-gray-700 mb-8">
            <h2 className="text-2xl font-semibold text-white mb-8">{question.question}</h2>
            
            <div className="space-y-4 mb-8">
              {question.options.map((option, index) => (
                <button
                  key={index}
                  onClick={() => handleAnswerSelect(index)}
                  className={`w-full p-4 text-left rounded-lg border transition-all duration-200 ${
                    selectedAnswers[currentQuestion] === index
                      ? 'bg-purple-600/30 border-purple-500 text-white'
                      : 'bg-gray-700 border-gray-600 text-gray-300 hover:bg-gray-600 hover:border-gray-500'
                  }`}
                >
                  <span className="font-medium mr-3">
                    {String.fromCharCode(65 + index)}.
                  </span>
                  {option}
                </button>
              ))}
            </div>

            <div className="flex justify-between">
              <button
                onClick={handlePrevious}
                disabled={currentQuestion === 0}
                className="px-6 py-2 bg-gray-700 hover:bg-gray-600 disabled:bg-gray-800 disabled:cursor-not-allowed text-white rounded-lg font-medium transition-colors"
              >
                Previous
              </button>
              
              <button
                onClick={handleNext}
                disabled={selectedAnswers[currentQuestion] === -1}
                className="px-6 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-600 disabled:cursor-not-allowed text-white rounded-lg font-medium transition-colors"
              >
                {currentQuestion === questions.length - 1 ? 'Finish Quiz' : 'Next'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
