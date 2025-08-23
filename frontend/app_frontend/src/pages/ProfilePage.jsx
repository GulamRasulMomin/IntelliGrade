import React, { useState, useEffect, useRef } from 'react';
import { User, Mail, Calendar, Edit3, Save, X, LogOut, Camera, Shield, Lock, Eye, EyeOff } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { apiService } from '../services/api';
import { motion, AnimatePresence } from "framer-motion";

const BACKEND_URL =(import.meta.env.VITE_BACKEND_URL ||
   "http://127.0.0.1:8000");

export default function ProfilePage() {
  const { user, logout, updateProfile, changePassword } = useAuth();
  const navigate = useNavigate();
  const [isEditing, setIsEditing] = useState(false);
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });
  const fileInputRef = useRef(null);
  
  const [stats, setStats] = useState({
    totalCourses: 0,
    achievements: "-",
    totalQuizzes: 0,
    learningStreak: 1
  });
  
  const [editData, setEditData] = useState({
    username: user?.username || '',
    email: user?.email || '',
    avatar: null
  });
  
  const [passwordData, setPasswordData] = useState({
    oldPassword: '',
    newPassword: '',
    confirmPassword: ''
  });

  useEffect(() => {
    const loadStats = async () => {
      try {
        const statsData = await apiService.getUserStats();
        const userAchievements = await apiService.getUserAchievements();
        setStats({
          totalCourses: statsData.total_courses || 0,
          achievements: userAchievements[0]?.achievement_type || "-",
          totalQuizzes: statsData.total_quizzes || 0,
          learningStreak: statsData.learning_streak || 1
        });
      } catch (error) {
        console.error('Error loading stats:', error);
      }
    };
    loadStats();
  }, []);

  const handleAvatarClick = () => {
    if (isEditing) fileInputRef.current?.click();
  };

  const handleFileChange = (event) => {
    const file = event.target.files[0];
    if (file) setEditData(prev => ({ ...prev, avatar: file }));
  };

  const handleSave = async () => {
    setLoading(true);
    setMessage({ type: '', text: '' });
    try {
      const result = await updateProfile(editData);
      if (result.success) {
        setMessage({ type: 'success', text: result.message });
        setIsEditing(false);
        setEditData(prev => ({ ...prev, avatar: null }));
        if (fileInputRef.current) fileInputRef.current.value = '';
      } else {
        setMessage({ type: 'error', text: result.error });
      }
    } catch {
      setMessage({ type: 'error', text: 'Failed to update profile' });
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    setEditData({
      username: user?.username || '',
      email: user?.email || '',
      avatar: null
    });
    setIsEditing(false);
    setMessage({ type: '', text: '' });
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handlePasswordChange = async () => {
    setLoading(true);
    setMessage({ type: '', text: '' });
    try {
      const result = await changePassword(
        passwordData.oldPassword,
        passwordData.newPassword,
        passwordData.confirmPassword
      );
      if (result.success) {
        setMessage({ type: 'success', text: result.message });
        setShowPasswordModal(false);
        setPasswordData({ oldPassword: '', newPassword: '', confirmPassword: '' });
      } else {
        setMessage({ type: 'error', text: result.error });
      }
    } catch {
      setMessage({ type: 'error', text: 'Failed to change password' });
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const joinDate = user?.joinDate ? new Date(user.joinDate).toLocaleDateString('en-US', {
    year: 'numeric', month: 'long', day: 'numeric'
  }) : 'Unknown';

  const statsDisplay = [
    { label: 'User Achievements', value: stats.achievements, color: 'text-green-400' },
    { label: 'Total Quizzes', value: stats.totalQuizzes.toString(), color: 'text-blue-400' },
    { label: 'Study Streak', value: `${stats.learningStreak} day${stats.learningStreak !== 1 ? 's' : ''}`, color: 'text-purple-400' },
    { label: 'Total Courses', value: stats.totalCourses.toString(), color: 'text-yellow-400' }
  ];

  const avatarPreview = editData.avatar 
    ? URL.createObjectURL(editData.avatar)
    : user?.avatar || BACKEND_URL + '/media/avatars/default_avatar.png';

  return (
    <div className="min-h-screen bg-gray-900 px-4 sm:px-6 py-8">
      {/* Header */}
      <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}>
        <h1 className="text-3xl font-bold text-white mb-2">Profile</h1>
        <p className="text-gray-400">Manage your account settings and preferences</p>
      </motion.div>

      {/* Message Display */}
      <AnimatePresence>
        {message.text && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className={`mb-6 p-4 rounded-lg ${
              message.type === 'success' 
                ? 'bg-green-600/20 border border-green-500/30 text-green-400' 
                : 'bg-red-600/20 border border-red-500/30 text-red-400'
            }`}
          >
            {message.text}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Profile Card */}
      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }} 
        animate={{ opacity: 1, scale: 1 }} 
        transition={{ duration: 0.5 }} 
        className="bg-gradient-to-r from-purple-600/20 to-blue-600/20 backdrop-blur-sm rounded-2xl p-6 sm:p-8 border border-purple-500/30 mb-8"
      >
        <div className="flex flex-col md:flex-row items-center md:items-start space-y-6 md:space-y-0 md:space-x-8">
          {/* Avatar */}
          <motion.div whileHover={isEditing ? { scale: 1.05 } : {}}>
            <div className="relative">
            <div 
              className={`w-48 h-48 bg-gradient-to-r from-purple-500 to-blue-500 rounded-full flex items-center justify-center overflow-hidden cursor-pointer transition-transform ${
                isEditing ? 'hover:scale-105' : ''
              }`}
              onClick={handleAvatarClick}
            >
              {avatarPreview ? (
                <img src={avatarPreview} alt="Profile" className="w-full h-full object-cover" />
              ) : (
                <User className="w-24 h-24 text-white" />
              )}
            </div>
            {isEditing && (
              <button 
                className="absolute -bottom-2 -right-2 bg-purple-600 hover:bg-purple-700 p-2 rounded-full transition-colors"
                onClick={handleAvatarClick}
              >
                <Camera className="w-4 h-4 text-white" />
              </button>
            )}
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handleFileChange}
              className="hidden"
            />
          </div>

          </motion.div>

          {/* Profile Info */}
          <div className="flex-1 text-center md:text-left">
            {isEditing ? (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-4">
                {/* Username */}
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-1">Username</label>
                  <input
                    type="text"
                    value={editData.username}
                    onChange={(e) => setEditData({ ...editData, username: e.target.value })}
                    className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                  />
                </div>
                {/* Email */}
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-1">Email</label>
                  <input
                    type="email"
                    value={editData.email}
                    onChange={(e) => setEditData({ ...editData, email: e.target.value })}
                    className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                  />
                </div>
                <div className="flex flex-wrap gap-3 justify-center md:justify-start">
                  <button onClick={handleSave} disabled={loading} className="flex items-center bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg">
                    <Save className="w-4 h-4 mr-2" /> {loading ? 'Saving...' : 'Save'}
                  </button>
                  <button onClick={handleCancel} className="flex items-center bg-gray-600 hover:bg-gray-700 text-white px-4 py-2 rounded-lg">
                    <X className="w-4 h-4 mr-2" /> Cancel
                  </button>
                </div>
              </motion.div>
            ) : (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                <h2 className="text-2xl font-bold text-white mb-2">{user?.username}</h2>
                <div className="flex flex-col sm:flex-row sm:items-center space-y-2 sm:space-y-0 sm:space-x-6 text-gray-300 mb-4">
                  <div className="flex items-center justify-center sm:justify-start">
                    <Mail className="w-4 h-4 mr-2" /> {user?.email}
                  </div>
                  <div className="flex items-center justify-center sm:justify-start">
                    <Calendar className="w-4 h-4 mr-2" /> Joined {joinDate}
                  </div>
                </div>
                <button onClick={() => setIsEditing(true)} className="flex items-center bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-lg mx-auto sm:mx-0">
                  <Edit3 className="w-4 h-4 mr-2" /> Edit Profile
                </button>
              </motion.div>
            )}
          </div>
        </div>
      </motion.div>

      {/* Stats Grid */}
      <motion.div 
        initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.2 }} 
        className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8"
      >
        {statsDisplay.map((stat, index) => (
          <motion.div key={index} whileHover={{ scale: 1.05 }} className="bg-gray-800/50 p-4 rounded-xl border border-gray-700 text-center">
            <div className={`text-2xl font-bold ${stat.color} mb-1`}>{stat.value}</div>
            <div className="text-sm text-gray-400">{stat.label}</div>
          </motion.div>
        ))}
      </motion.div>

      {/* Account + Logout */}
      <div className="space-y-6">
        <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} className="bg-gray-800/50 p-6 rounded-xl border border-gray-700">
          <h3 className="text-lg font-semibold text-white mb-4 flex items-center"><Shield className="w-5 h-5 mr-2" /> Account Settings</h3>
          <div className="flex justify-between">
            <div>
              <p className="text-white font-medium">Password</p>
              <p className="text-gray-400 text-sm">Change your account password</p>
            </div>
            <button onClick={() => setShowPasswordModal(true)} className="text-purple-400 hover:text-purple-300 font-medium">Change</button>
          </div>
        </motion.div>

        <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="bg-gray-800/50 p-6 rounded-xl border border-gray-700">
          <button onClick={handleLogout} className="flex items-center text-red-400 hover:text-red-300">
            <LogOut className="w-5 h-5 mr-2" /> Log Out
          </button>
        </motion.div>
      </div>

      {/* Password Modal */}
      <AnimatePresence>
        
        {showPasswordModal && (
          <motion.div 
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} 
            className="fixed inset-0 bg-black/50 flex items-center justify-center z-50"
          >
            <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.9, opacity: 0 }} className="bg-gray-800 rounded-xl p-6 w-full max-w-md mx-4">
              {message.text && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className={`mb-6 p-4 rounded-lg ${
                  message.type === 'success' 
                    ? 'bg-green-600/20 border border-green-500/30 text-green-400' 
                    : 'bg-red-600/20 border border-red-500/30 text-red-400'
                }`}
              >
                {message.text}
              </motion.div>
              )}
              <h3 className="text-xl font-bold text-white mb-4 flex items-center"><Lock className="w-5 h-5 mr-2" /> Change Password</h3>
              {/* Password Inputs */}
              {['oldPassword', 'newPassword', 'confirmPassword'].map((field, i) => (
                <div key={field} className="mb-4">
                  <label className="block text-sm font-medium text-gray-300 mb-1">{["Current","New","Confirm New"][i]} Password</label>
                  <div className="relative">
                    <input
                      type={(field === 'oldPassword' ? showPassword : field === 'newPassword' ? showNewPassword : showConfirmPassword) ? "text" : "password"}
                      value={passwordData[field]}
                      onChange={(e) => setPasswordData({ ...passwordData, [field]: e.target.value })}
                      className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white pr-10"
                    />
                    <button type="button" className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400" onClick={() => {
                      if (field === 'oldPassword') setShowPassword(!showPassword);
                      if (field === 'newPassword') setShowNewPassword(!showNewPassword);
                      if (field === 'confirmPassword') setShowConfirmPassword(!showConfirmPassword);
                    }}>
                      {(field === 'oldPassword' ? showPassword : field === 'newPassword' ? showNewPassword : showConfirmPassword) ? <EyeOff className="w-4 h-4"/> : <Eye className="w-4 h-4"/>}
                    </button>
                  </div>
                </div>
              ))}
              <div className="flex gap-3 mt-6">
                <button onClick={handlePasswordChange} disabled={loading} className="flex-1 bg-green-600 hover:bg-green-700 text-white py-2 rounded-lg">{loading ? 'Changing...' : 'Change Password'}</button>
                <button onClick={() => setShowPasswordModal(false)} className="flex-1 bg-gray-600 hover:bg-gray-700 text-white py-2 rounded-lg">Cancel</button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
