import './App.css';
import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import LandingPage from './pages/LandingPage';
import LoginPage from './pages/LoginPage';
import SignupPage from './pages/SignupPage';
import HomePage from './pages/HomePage';
import CoursePage from './pages/CoursePage';
import MyCoursesPage from './pages/MyCoursesPage';
import ProfilePage from './pages/ProfilePage';
import NotesPage from './pages/NotesPage';
import QuizPage from './pages/QuizPage';
import Layout from './components/Layout';

function ProtectedRoute({ children }) {
  const { isAuthenticated, loading, authChecked } = useAuth();
  
  if (loading || !authChecked) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="text-white text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-500 mx-auto mb-4"></div>
          <p>Loading...</p>
        </div>
      </div>
    );
  }
  
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }
  
  return <>{children}</>;
}

function PublicRoute({ children }) {
  const { isAuthenticated, loading, authChecked } = useAuth();
  
  if (loading || !authChecked) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="text-white text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-500 mx-auto mb-4"></div>
          <p>Loading...</p>
        </div>
      </div>
    );
  }
  
  if (isAuthenticated) {
    return <Navigate to="/home" replace />;
  }
  
  return <>{children}</>;
}

function AuthenticatedRedirect({ children }) {
  const { isAuthenticated, loading, authChecked } = useAuth();
  
  if (loading || !authChecked) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="text-white text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-500 mx-auto mb-4"></div>
          <p>Loading...</p>
        </div>
      </div>
    );
  }
  
  if (isAuthenticated) {
    return <Navigate to="/home" replace />;
  }
  
  return <>{children}</>;
}

function FallbackRoute() {
  const { isAuthenticated, loading, authChecked } = useAuth();
  
  if (loading || !authChecked) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="text-white text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-500 mx-auto mb-4"></div>
          <p>Loading...</p>
        </div>
      </div>
    );
  }
  
  if (isAuthenticated) {
    return <Navigate to="/home" replace />;
  } else {
    return <Navigate to="/" replace />;
  }
}

function App() {
  return (
    <>
      <AuthProvider>
        <Router>
          <div className="min-h-screen bg-gray-900 text-white">
            <Routes>
              <Route path="/" element={
                <AuthenticatedRedirect>
                  <LandingPage />
                </AuthenticatedRedirect>
              } />
              <Route path="/login" element={
                <PublicRoute>
                  <LoginPage />
                </PublicRoute>
              } />
              <Route path="/signup" element={
                <PublicRoute>
                  <SignupPage />
                </PublicRoute>
              } />
              <Route path="/home" element={
                <ProtectedRoute>
                  <Layout>
                    <HomePage />
                  </Layout>
                </ProtectedRoute>
              } />
              <Route path="/course/:courseId" element={
                <ProtectedRoute>
                  <Layout>
                    <CoursePage />
                  </Layout>
                </ProtectedRoute>
              } />
              <Route path="/course/:courseId/notes/:topicId" element={
                <ProtectedRoute>
                  <Layout>
                    <NotesPage />
                  </Layout>
                </ProtectedRoute>
              } />
              <Route path="/course/:courseId/quiz/:topicId" element={
                <ProtectedRoute>
                  <Layout>
                    <QuizPage />
                  </Layout>
                </ProtectedRoute>
              } />
              <Route path="/my-courses" element={
                <ProtectedRoute>
                  <Layout>
                    <MyCoursesPage />
                  </Layout>
                </ProtectedRoute>
              } />
              <Route path="/profile" element={
                <ProtectedRoute>
                  <Layout>
                    <ProfilePage />
                  </Layout>
                </ProtectedRoute>
              } />
              <Route path="*" element={<FallbackRoute />} />
            </Routes>
          </div>
        </Router>
      </AuthProvider>
    </>
  )
}

export default App
