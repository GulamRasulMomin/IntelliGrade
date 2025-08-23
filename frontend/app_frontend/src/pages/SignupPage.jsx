import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { Eye, EyeOff, Sparkles, ArrowLeft } from 'lucide-react';
import { motion } from 'framer-motion';

export default function SignupPage() {
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [passwordStrength, setPasswordStrength] = useState({
    score: 0,
    feedback: [],
    isValid: false
  });

  const { signup } = useAuth();
  const navigate = useNavigate();

  // Password validation
  const validatePasswordStrength = (password) => {
    const feedback = [];
    let score = 0;

    if (password.length >= 8) score++; else feedback.push('At least 8 characters');
    if (/[A-Z]/.test(password)) score++; else feedback.push('At least one uppercase letter');
    if (/[a-z]/.test(password)) score++; else feedback.push('At least one lowercase letter');
    if (/\d/.test(password)) score++; else feedback.push('At least one number');
    if (/[!@#$%^&*()_\-+={}[\]:;"'<>,.?/\\|]/.test(password)) score++; else feedback.push('At least one special character');
    if (!/(123|abc|password|admin|user)/i.test(password)) score++; else feedback.push('Avoid common patterns');
    if (!/(.)\1{2,}/.test(password)) score++; else feedback.push('Avoid repeated characters');

    return { score, feedback, isValid: score >= 5 };
  };

  const handlePasswordChange = (e) => {
    const newPassword = e.target.value;
    setPassword(newPassword);
    setPasswordStrength(validatePasswordStrength(newPassword));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!/^[A-Za-z][A-Za-z0-9_]*$/.test(username)) {
      setError('Username must start with a letter and contain only letters, numbers, and underscores');
      return;
    }

    if (!/^[a-z0-9._%+-]+@[a-z]+\.[a-z]{2,}$/.test(email)) {
      setError('Invalid email address');
      return;
    }

    if (!passwordStrength.isValid) {
      setError('Password does not meet strength requirements');
      return;
    }

    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    setIsLoading(true);

    try {
      const result = await signup(username, email, password);
      if (result.success) {
        navigate('/home');
      } else {
        setError(result.error || 'Signup failed. Please try again.');
      }
    } catch (err) {
      console.error('Signup error:', err);
      setError('Signup failed. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-gray-900 flex items-center justify-center p-6">
      <motion.div 
        className="w-full max-w-md"
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
      >
        {/* Back */}
        <Link to="/" className="inline-flex items-center text-gray-300 hover:text-white mb-8 transition-colors">
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Home
        </Link>

        {/* Logo */}
        <div className="text-center mb-8">
          <motion.div 
            className="inline-flex items-center space-x-2 mb-4"
            initial={{ scale: 0.8 }}
            animate={{ scale: 1 }}
            transition={{ type: 'spring', stiffness: 100 }}
          >
            <img src="/logo.png" alt="IntelliGrade Logo" className="w-10 h-10 rounded-lg shadow-lg" />
            <span className="text-2xl font-bold text-white">IntelliGrade</span>
          </motion.div>
          <h1 className="text-3xl font-bold text-white mb-2">Create Account</h1>
          <p className="text-gray-400">Join thousands of learners using AI-powered education</p>
        </div>

        {/* Form */}
        <form 
          onSubmit={handleSubmit} 
          className="bg-gray-800/50 backdrop-blur-sm p-8 rounded-2xl border border-gray-700 shadow-xl"
        >
          {error && (
            <motion.div 
              className="bg-red-500/20 border border-red-500/30 text-red-300 p-4 rounded-lg mb-6 text-sm"
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
            >
              {error}
            </motion.div>
          )}

          <div className="space-y-6">
            {/* Username */}
            <div>
              <label htmlFor="username" className="block text-sm font-medium text-gray-300 mb-2">Username</label>
              <input
                type="text"
                id="username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 transition-all"
                placeholder="Enter username"
                required
              />
            </div>

            {/* Email */}
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-300 mb-2">Email</label>
              <input
                type="email"
                id="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 transition-all"
                placeholder="Enter your email"
                required
              />
            </div>

            {/* Password */}
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-300 mb-2">Password</label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  id="password"
                  value={password}
                  onChange={handlePasswordChange}
                  className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 transition-all pr-12"
                  placeholder="Create a strong password"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-200"
                >
                  {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                </button>
              </div>

              {/* Password Strength */}
              {password && (
                <div className="mt-3">
                  <div className="flex justify-between mb-1 text-sm">
                    <span className="text-gray-400">Strength:</span>
                    <span className={
                      passwordStrength.score >= 5 ? 'text-green-400' :
                      passwordStrength.score >= 3 ? 'text-yellow-400' : 'text-red-400'
                    }>
                      {passwordStrength.score >= 5 ? 'Strong' :
                       passwordStrength.score >= 3 ? 'Medium' : 'Weak'}
                    </span>
                  </div>
                  <div className="w-full bg-gray-700 rounded-full h-2">
                    <motion.div 
                      className="h-2 rounded-full"
                      initial={{ width: 0 }}
                      animate={{ width: `${(passwordStrength.score / 7) * 100}%` }}
                      transition={{ duration: 0.5 }}
                      style={{
                        backgroundColor: passwordStrength.score >= 5 
                          ? '#22c55e' : passwordStrength.score >= 3 
                          ? '#facc15' : '#ef4444'
                      }}
                    />
                  </div>
                </div>
              )}
            </div>

            {/* Confirm Password */}
            <div>
              <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-300 mb-2">Confirm Password</label>
              <input
                type={showPassword ? 'text' : 'password'}
                id="confirmPassword"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 transition-all"
                placeholder="Confirm your password"
                required
              />
            </div>

            {/* Submit */}
            <motion.button
              type="submit"
              disabled={isLoading}
              whileTap={{ scale: 0.95 }}
              className="w-full bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 disabled:from-gray-600 disabled:to-gray-600 text-white py-3 rounded-lg font-semibold transition-all shadow-lg"
            >
              {isLoading ? 'Creating Account...' : 'Create Account'}
            </motion.button>
          </div>

          {/* Switch */}
          <div className="mt-6 text-center">
            <p className="text-gray-400">
              Already have an account?{' '}
              <Link to="/login" className="text-purple-400 hover:text-purple-300 font-medium">
                Sign in
              </Link>
            </p>
          </div>
        </form>
      </motion.div>
    </div>
  );
}
