import React, { useState, useEffect } from 'react';
import { useParams, useLocation, Link } from 'react-router-dom';
import { ArrowLeft, CheckCircle, XCircle, RotateCcw } from 'lucide-react';
import { apiService } from '../services/api';
import { motion, AnimatePresence } from 'framer-motion';

/**
 * @typedef {object} Question
 * @property {string} id
 * @property {string} question
 * @property {string[]} options
 * @property {number} correctAnswer
 * @property {string} explanation
 */

// Animation variants
const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1
    }
  }
};

const itemVariants = {
  hidden: { y: 20, opacity: 0 },
  visible: {
    y: 0,
    opacity: 1,
    transition: {
      duration: 0.5,
      ease: "easeOut"
    }
  }
};

const optionVariants = {
  hidden: { x: -20, opacity: 0 },
  visible: (i) => ({
    x: 0,
    opacity: 1,
    transition: {
      delay: i * 0.1,
      duration: 0.3
    }
  }),
  selected: { 
    scale: 1.02,
    transition: { duration: 0.2 }
  }
};

const progressVariants = {
  initial: { width: 0 },
  animate: { 
    width: "100%",
    transition: { duration: 0.5 }
  }
};

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
        console.log("Quiz API response:", response);
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
      <div className="min-h-screen bg-gray-900 px-4 md:px-6 py-6 md:py-8">
        <Link to={`/course/${courseId}`} className="inline-flex items-center text-gray-300 hover:text-white mb-6 md:mb-8 transition-colors">
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Course
        </Link>
        
        {isFallbackQuiz && (
          <motion.div 
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-4 p-4 bg-yellow-900/60 border-l-4 border-yellow-400 text-yellow-200 rounded"
          >
            ⚠️ AI-powered quiz is currently unavailable. Showing default questions.
          </motion.div>
        )}
        <div className="flex flex-col items-center justify-center py-16 md:py-20">
          <motion.div 
            animate={{ rotate: 360 }}
            transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
            className="w-12 h-12 md:w-16 md:h-16 border-4 border-blue-500 border-t-transparent rounded-full mb-4"
          ></motion.div>
          <motion.h2 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="text-xl md:text-2xl font-semibold text-white mb-2"
          >
            Generating Quiz
          </motion.h2>
          <motion.p 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4 }}
            className="text-gray-400 text-center max-w-md"
          >
            AI is creating personalized quiz questions for {topicTitle}...
          </motion.p>
        </div>
      </div>
    );
  }

  if (showResults) {
    const score = calculateScore();
    const percentage = Math.round((score / questions.length) * 100);
    
    return (
      <div className="min-h-screen bg-gray-900 px-4 md:px-6 py-6 md:py-8">
        <Link to={`/course/${courseId}`} className="inline-flex items-center text-gray-300 hover:text-white mb-6 md:mb-8 transition-colors">
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Course
        </Link>
        
        <div className="max-w-4xl mx-auto">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="bg-gradient-to-r from-purple-600/20 to-blue-600/20 backdrop-blur-sm rounded-2xl p-6 md:p-8 border border-purple-500/30 mb-6 md:mb-8 text-center"
          >
            <h1 className="text-2xl md:text-3xl font-bold text-white mb-4">Quiz Results</h1>
            <motion.div 
              initial={{ scale: 0.8 }}
              animate={{ scale: 1 }}
              className="text-5xl md:text-6xl font-bold mb-4"
            >
              <span className={percentage >= 70 ? 'text-green-400' : percentage >= 50 ? 'text-yellow-400' : 'text-red-400'}>
                {percentage}%
              </span>
            </motion.div>
            <p className="text-lg md:text-xl text-gray-300 mb-6">
              You scored {score} out of {questions.length} questions correctly
            </p>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={resetQuiz}
              className="inline-flex items-center bg-blue-600 hover:bg-blue-700 text-white px-5 py-2.5 md:px-6 md:py-3 rounded-lg font-semibold transition-colors"
            >
              <RotateCcw className="w-4 h-4 mr-2" />
              Retake Quiz
            </motion.button>
          </motion.div>

          <motion.div 
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            className="space-y-4 md:space-y-6"
          >
            {questions.map((question, index) => {
              const userAnswer = selectedAnswers[index];
              const isCorrect = userAnswer === question.correctAnswer;
              
              return (
                <motion.div 
                  key={question.id}
                  variants={itemVariants}
                  className="bg-gray-800/50 backdrop-blur-sm rounded-xl p-4 md:p-6 border border-gray-700"
                >
                  <div className="flex items-start space-x-3 mb-4">
                    <motion.div
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      transition={{ delay: index * 0.1 }}
                    >
                      {isCorrect ? (
                        <CheckCircle className="w-5 h-5 md:w-6 md:h-6 text-green-400 flex-shrink-0 mt-1" />
                      ) : (
                        <XCircle className="w-5 h-5 md:w-6 md:h-6 text-red-400 flex-shrink-0 mt-1" />
                      )}
                    </motion.div>
                    <div className="flex-1">
                      <h3 className="text-base md:text-lg font-semibold text-white mb-3">
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
                            <motion.div
                              key={optionIndex}
                              initial={{ opacity: 0, y: 10 }}
                              animate={{ opacity: 1, y: 0 }}
                              transition={{ delay: (index * 0.2) + (optionIndex * 0.1) }}
                              className={`p-3 rounded-lg border ${bgColor} ${
                                isCorrectAnswer ? 'border-green-500' : 
                                isUserAnswer && !isCorrect ? 'border-red-500' : 'border-gray-600'
                              }`}
                            >
                              <span className="text-white text-sm md:text-base">{option}</span>
                              {isCorrectAnswer && <span className="text-green-400 ml-2 text-sm">✓ Correct</span>}
                              {isUserAnswer && !isCorrect && <span className="text-red-400 ml-2 text-sm">✗ Your answer</span>}
                            </motion.div>
                          );
                        })}
                      </div>
                      
                      <motion.div 
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: (index * 0.2) + 0.4 }}
                        className="bg-blue-600/20 border border-blue-500/30 rounded-lg p-3 md:p-4"
                      >
                        <p className="text-blue-300 font-semibold mb-1 text-sm md:text-base">Explanation:</p>
                        <p className="text-blue-200 text-sm md:text-base">{question.explanation}</p>
                      </motion.div>
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </motion.div>
        </div>
      </div>
    );
  }

  const question = questions[currentQuestion];
  const progress = ((currentQuestion + 1) / questions.length) * 100;

  return (
    <div className="min-h-screen bg-gray-900 px-4 md:px-6 py-6 md:py-8">
      {/* Header */}
      <div className="mb-6 md:mb-8">
        <Link to={`/course/${courseId}`} className="inline-flex items-center text-gray-300 hover:text-white mb-4 md:mb-6 transition-colors">
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Course
        </Link>
        
        <motion.div 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-gradient-to-r from-purple-600/20 to-blue-600/20 backdrop-blur-sm rounded-2xl p-4 md:p-6 border border-purple-500/30"
        >
          <h1 className="text-xl md:text-2xl font-bold text-white mb-2">Quiz: {topicTitle}</h1>
          <p className="text-gray-300 mb-3 md:mb-4 text-sm md:text-base">From {courseTitle}</p>
          
          {isFallbackQuiz && (
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.3 }}
              className="mb-3 md:mb-4 p-3 md:p-4 bg-yellow-900/60 border-l-4 border-yellow-400 text-yellow-200 rounded text-sm"
            >
              ⚠️ AI-powered quiz is currently unavailable. Showing default questions.
            </motion.div>
          )}
          <div className="flex items-center justify-between text-xs md:text-sm text-gray-300 mb-2">
            <span>Question {currentQuestion + 1} of {questions.length}</span>
            <span>{Math.round(progress)}% Complete</span>
          </div>
          <div className="w-full bg-gray-700 rounded-full h-1.5 md:h-2">
            <motion.div 
              className="bg-gradient-to-r from-purple-500 to-blue-500 h-1.5 md:h-2 rounded-full"
              initial={{ width: 0 }}
              animate={{ width: `${progress}%` }}
              transition={{ duration: 0.5, ease: "easeOut" }}
            ></motion.div>
          </div>
        </motion.div>
      </div>

      {/* Question */}
      {question && (
        <div className="max-w-4xl mx-auto">
          <motion.div 
            key={currentQuestion}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.3 }}
            className="bg-gray-800/50 backdrop-blur-sm rounded-2xl p-5 md:p-8 border border-gray-700 mb-6 md:mb-8"
          >
            <h2 className="text-lg md:text-2xl font-semibold text-white mb-6 md:mb-8">{question.question}</h2>
            
            <div className="space-y-3 md:space-y-4 mb-6 md:mb-8">
              {question.options.map((option, index) => (
                <motion.button
                  key={index}
                  variants={optionVariants}
                  initial="hidden"
                  animate="visible"
                  custom={index}
                  whileHover="selected"
                  onClick={() => handleAnswerSelect(index)}
                  className={`w-full p-3 md:p-4 text-left rounded-lg border transition-all duration-200 ${
                    selectedAnswers[currentQuestion] === index
                      ? 'bg-purple-600/30 border-purple-500 text-white'
                      : 'bg-gray-700 border-gray-600 text-gray-300 hover:bg-gray-600 hover:border-gray-500'
                  }`}
                >
                  <span className="font-medium mr-2 md:mr-3 text-sm md:text-base">
                    {String.fromCharCode(65 + index)}.
                  </span>
                  <span className="text-sm md:text-base">{option}</span>
                </motion.button>
              ))}
            </div>

            <div className="flex flex-col-reverse md:flex-row justify-between gap-3 md:gap-0">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={handlePrevious}
                disabled={currentQuestion === 0}
                className="px-4 py-2 md:px-6 md:py-2 bg-gray-700 hover:bg-gray-600 disabled:bg-gray-800 disabled:cursor-not-allowed text-white rounded-lg font-medium transition-colors text-sm md:text-base"
              >
                Previous
              </motion.button>
              
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={handleNext}
                disabled={selectedAnswers[currentQuestion] === -1}
                className="px-4 py-2 md:px-6 md:py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-600 disabled:cursor-not-allowed text-white rounded-lg font-medium transition-colors text-sm md:text-base"
              >
                {currentQuestion === questions.length - 1 ? 'Finish Quiz' : 'Next'}
              </motion.button>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
}