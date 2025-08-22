import React from 'react';
import { Link } from 'react-router-dom';
import { Brain, BookOpen, Target, Users, ArrowRight, Sparkles } from 'lucide-react';

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
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-gray-900">
      {/* Header */}
      <header className="container mx-auto px-6 py-8">
        <nav className="flex justify-between items-center">
          <div className="flex items-center space-x-2">
            <img src="/logo.png" alt="IntelliGrade Logo" className="w-10 h-10 rounded-full" />
            <span className="text-2xl font-bold text-white">IntelliGrade</span>
          </div>
          <div className="space-x-4">
            <Link to="/login" className="bg-purple-600 hover:bg-purple-700 text-white px-6 py-2 rounded-lg transition-colors">
              Login
            </Link>
            {/* <Link to="/signup" className="bg-purple-600 hover:bg-purple-700 text-white px-6 py-2 rounded-lg transition-colors">
              Sign Up
            </Link> */}
          </div>
        </nav>
      </header>

      {/* Hero Section */}
      <section className="container mx-auto px-6 py-20 text-center">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-6xl font-bold text-white mb-6 leading-tight">
            Learn Smarter with
            <span className="bg-gradient-to-r from-purple-400 to-blue-400 bg-clip-text text-transparent"> AI</span>
          </h1>
          <p className="text-xl text-gray-300 mb-12 leading-relaxed">
            Transform your learning experience with AI-powered roadmaps, personalized notes, 
            and intelligent quizzes. Master any subject with guided precision.
          </p>
          <Link 
            to="/signup" 
            className="inline-flex items-center bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white text-lg px-8 py-4 rounded-xl font-semibold transition-all duration-200 transform hover:scale-105 shadow-lg hover:shadow-xl"
          >
            Start Learning
            <ArrowRight className="ml-2 w-5 h-5" />
          </Link>
        </div>
      </section>

      {/* Features Section */}
      <section className="container mx-auto px-6 py-20">
        <div className="text-center mb-16">
          <h2 className="text-4xl font-bold text-white mb-4">Powerful Features</h2>
          <p className="text-gray-300 text-lg">Everything you need for effective learning</p>
        </div>
        
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
          {features.map((feature, index) => (
            <div key={index} className="bg-gray-800/50 backdrop-blur-sm p-8 rounded-2xl border border-gray-500 hover:border-purple-200 transition-all duration-300 hover:transform hover:scale-105">
              <div className="w-12 h-12 bg-gradient-to-r from-purple-500 to-blue-500 rounded-xl flex items-center justify-center mb-6">
                <feature.icon className="w-6 h-6 text-white" />
              </div>
              <h3 className="text-xl font-semibold text-white mb-3">{feature.title}</h3>
              <p className="text-gray-400 leading-relaxed">{feature.description}</p>
            </div>
          ))}
        </div>
      </section>

      {/* CTA Section */}
      {/* <section className="container mx-auto px-6 py-20 text-center">
        <div className="bg-gradient-to-r from-purple-600/20 to-blue-600/20 backdrop-blur-sm rounded-3xl p-12 border border-purple-500/30">
          <h2 className="text-3xl font-bold text-white mb-6">Ready to Transform Your Learning?</h2>
          <p className="text-gray-300 mb-8 text-lg">Join thousands of learners who are already using AI to accelerate their education.</p>
          <Link 
            to="/signup" 
            className="inline-flex items-center bg-white text-gray-900 px-8 py-3 rounded-xl font-semibold hover:bg-gray-100 transition-colors"
          >
            Get Started Free
            <ArrowRight className="ml-2 w-5 h-5" />
          </Link>
        </div>
      </section> */}

      {/* Footer */}
      <footer className="container mx-auto px-6 py-8 border-t border-gray-800">
        <div className="flex justify-center items-center">
          <p className="text-gray-400">© 2025 IntelliGrade. Powered by AI for intelligent learning.</p>
        </div>
      </footer>
    </div>
  );
}