import React from 'react';
import { Link } from 'react-router-dom';
import { Brain, BookOpen, Target, Users, ArrowRight } from 'lucide-react';
import { motion } from 'framer-motion';

export default function LandingPage() {
  const features = [
    {
      icon: Brain,
      title: 'AI-Generated Roadmaps',
      description: 'Get personalized learning paths created by advanced AI for any subject.'
    },
    {
      icon: BookOpen,
      title: 'Smart Notes',
      description: 'Concise, AI-curated notes that capture the essence of each topic.'
    },
    {
      icon: Target,
      title: 'Interactive Quizzes',
      description: 'Test your knowledge with AI-generated MCQs and instant feedback.'
    },
    {
      icon: Users,
      title: 'Progress Tracking',
      description: 'Monitor your learning journey and get suggestions for next steps.'
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-gray-900 text-white overflow-hidden">
      {/* Header */}
      <header className="container mx-auto px-6 py-6">
        <motion.nav 
          initial={{ opacity: 0, y: -30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="flex justify-between items-center"
        >
          <div className="flex items-center space-x-2">
            <img src="/logo.png" alt="IntelliGrade Logo" className="w-10 h-10 rounded-lg shadow-lg" />
            <span className="text-2xl font-bold">IntelliGrade</span>
          </div>
          <div className="space-x-4 hidden sm:flex">
            <Link 
              to="/login" 
              className="bg-purple-600 hover:bg-purple-700 text-white px-6 py-2 rounded-lg transition-colors"
            >
              Login
            </Link>
            <Link 
              to="/signup" 
              className="bg-purple-600 hover:bg-purple-700 text-white px-6 py-2 rounded-lg transition-colors"
            >
              Sign Up
            </Link>
          </div>
        </motion.nav>
      </header>

      {/* Hero Section */}
      <section className="container mx-auto px-6 py-20 text-center">
        <motion.div 
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="max-w-4xl mx-auto"
        >
          <h1 className="text-5xl md:text-6xl font-bold mb-6 leading-tight">
            Learn Smarter with
            <span className="bg-gradient-to-r from-purple-400 to-blue-400 bg-clip-text text-transparent"> AI</span>
          </h1>
          <p className="text-lg md:text-xl text-gray-300 mb-12 leading-relaxed">
            Transform your learning experience with AI-powered roadmaps, personalized notes, 
            and intelligent quizzes. Master any subject with guided precision.
          </p>
          <motion.div whileHover={{ scale: 1.05 }}>
            <Link 
              to="/signup" 
              className="inline-flex items-center bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white text-lg px-8 py-4 rounded-xl font-semibold transition-all shadow-lg hover:shadow-xl"
            >
              Start Learning
              <ArrowRight className="ml-2 w-5 h-5" />
            </Link>
          </motion.div>
        </motion.div>
      </section>

      {/* Features Section */}
      <section className="container mx-auto px-6 py-20">
        <motion.div 
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <h2 className="text-4xl font-bold mb-4">Powerful Features</h2>
          <p className="text-gray-300 text-lg">Everything you need for effective learning</p>
        </motion.div>
        
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-8">
          {features.map((feature, index) => (
            <motion.div 
              key={index}
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: index * 0.2 }}
              viewport={{ once: true }}
              whileHover={{ scale: 1.05, rotate: 1 }}
              className="bg-gray-800/50 backdrop-blur-sm p-8 rounded-2xl border border-gray-600 hover:border-purple-400 transition-all duration-300"
            >
              <div className="w-12 h-12 bg-gradient-to-r from-purple-500 to-blue-500 rounded-xl flex items-center justify-center mb-6 shadow-md">
                <feature.icon className="w-6 h-6 text-white" />
              </div>
              <h3 className="text-xl font-semibold mb-3">{feature.title}</h3>
              <p className="text-gray-400">{feature.description}</p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Footer */}
      <footer className="container mx-auto px-6 py-8 border-t border-gray-800">
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 1 }}
          className="flex justify-center items-center"
        >
          <p className="text-gray-400 text-center">© 2025 IntelliGrade. Powered by AI for intelligent learning.</p>
        </motion.div>
      </footer>
    </div>
  );
}
