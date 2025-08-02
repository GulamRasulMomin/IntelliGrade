const API_BASE_URL = 'http://localhost:8000/api';

// API utility functions
class ApiService {
  /**
   * Gets the authentication headers for a request.
   * @returns {HeadersInit} The headers object.
   */
  getAuthHeaders() {
    const token = localStorage.getItem('authToken');
    return {
      'Content-Type': 'application/json',
      ...(token && { 'Authorization': `Bearer ${token}` })
    };
  }

  /**
   * Handles token refresh when API calls fail due to expired tokens
   * @param {Function} apiCall - The API call function to retry
   * @returns {Promise<any>} The API response
   */
  async withTokenRefresh(apiCall) {
    try {
      return await apiCall();
    } catch (error) {
      if (error.message && error.message.includes('401')) {
        // Token expired, try to refresh
        try {
          const refreshResponse = await this.refreshToken();
          if (refreshResponse.access) {
            localStorage.setItem('authToken', refreshResponse.access);
            // Retry the original API call
            return await apiCall();
          }
        } catch (refreshError) {
          // Refresh failed, redirect to login
          localStorage.removeItem('authToken');
          localStorage.removeItem('refreshToken');
          localStorage.removeItem('userData');
          window.location.href = '/login';
          throw refreshError;
        }
      }
      throw error;
    }
  }

  /**
   * Handles the response from the API.
   * @param {Response} response The fetch response object.
   * @returns {Promise<any>} The response JSON data.
   */
  async handleResponse(response) {
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      // Create a more detailed error with field-specific errors
      const error = new Error(errorData.message || `HTTP error! status: ${response.status}`);
      error.fieldErrors = errorData;
      throw error;
    }
    return response.json();
  }

  // Authentication endpoints
  /**
   * Registers a new user.
   * @param {object} userData - The user's registration data.
   * @param {string} userData.username - The user's username.
   * @param {string} userData.email - The user's email address.
   * @param {string} userData.password - The user's password.
   * @returns {Promise<any>} The registration response.
   */
  async register(userData) {
    const response = await fetch(`${API_BASE_URL}/auth/register/`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        username: userData.username,
        email: userData.email,
        password: userData.password,
        password_confirm: userData.password
      })
    });
    return this.handleResponse(response);
  }

  /**
   * Logs in a user.
   * @param {string} username - The user's username.
   * @param {string} password - The user's password.
   * @returns {Promise<any>} The login response.
   */
  async login(username, password) {
    const response = await fetch(`${API_BASE_URL}/auth/login/`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username, password })
    });
    return this.handleResponse(response);
  }

  async logout() {
    const refreshToken = localStorage.getItem('refreshToken');
    if (refreshToken) {
      await fetch(`${API_BASE_URL}/auth/logout/`, {
        method: 'POST',
        headers: this.getAuthHeaders(),
        body: JSON.stringify({ refresh: refreshToken })
      });
    }
  }

  async refreshToken() {
    const refreshToken = localStorage.getItem('refreshToken');
    if (!refreshToken) throw new Error('No refresh token available');

    const response = await fetch(`${API_BASE_URL}/auth/token/refresh/`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ refresh: refreshToken })
    });
    return this.handleResponse(response);
  }

  async getUserProfile() {
    return this.withTokenRefresh(async () => {
      const response = await fetch(`${API_BASE_URL}/auth/profile/`, {
        headers: this.getAuthHeaders()
      });
      return this.handleResponse(response);
    });
  }

  async getUserStats() {
    const response = await fetch(`${API_BASE_URL}/auth/stats/`, {
      headers: this.getAuthHeaders()
    });
    return this.handleResponse(response);
  }

  /**
   * Updates user profile (username, email, avatar)
   * @param {object} profileData - The profile data to update
   * @param {string} [profileData.username] - New username
   * @param {string} [profileData.email] - New email
   * @param {File} [profileData.avatar] - New avatar file
   * @returns {Promise<any>} The update response
   */
  async updateProfile(profileData) {
    const formData = new FormData();
    
    // Add text fields
    if (profileData.username) formData.append('username', profileData.username);
    if (profileData.email) formData.append('email', profileData.email);
    if (profileData.avatar) formData.append('avatar', profileData.avatar);
    
    const token = localStorage.getItem('authToken');
    const headers = {
      ...(token && { 'Authorization': `Bearer ${token}` })
    };
    
    const response = await fetch(`${API_BASE_URL}/auth/profile/update/`, {
      method: 'PUT',
      headers,
      body: formData
    });
    return this.handleResponse(response);
  }

  /**
   * Changes user password
   * @param {string} oldPassword - Current password
   * @param {string} newPassword - New password
   * @param {string} confirmPassword - Password confirmation
   * @returns {Promise<any>} The password change response
   */
  async changePassword(oldPassword, newPassword, confirmPassword) {
    const response = await fetch(`${API_BASE_URL}/auth/profile/change-password/`, {
      method: 'POST',
      headers: this.getAuthHeaders(),
      body: JSON.stringify({
        old_password: oldPassword,
        new_password: newPassword,
        confirm_password: confirmPassword
      })
    });
    return this.handleResponse(response);
  }

  // Course endpoints
  /**
   * Generates a new course.
   * @param {string} courseName - The name of the course to generate.
   * @param {string} [difficulty='beginner'] - The difficulty level.
   * @returns {Promise<any>} The generated course data.
   */
  async generateCourse(courseName, difficulty = 'beginner', duration_weeks = 4) {
    const response = await fetch(`${API_BASE_URL}/courses/generate/`, {
      method: 'POST',
      headers: this.getAuthHeaders(),
      body: JSON.stringify({
        course_name: courseName,
        difficulty: difficulty,
        duration_weeks: duration_weeks
      })
    });
    return this.handleResponse(response);
  }

  /**
   * Retrieves a specific course.
   * @param {string} courseId - The ID of the course.
   * @returns {Promise<any>} The course data.
   */
  async getCourse(courseId) {
    const response = await fetch(`${API_BASE_URL}/courses/${courseId}/`, {
      headers: this.getAuthHeaders()
    });
    return this.handleResponse(response);
  }

  /**
   * Retrieves notes for a specific topic.
   * @param {string} topicId - The ID of the topic.
   * @returns {Promise<any>} The topic notes.
   */
  async getTopicNotes(topicId) {
    const response = await fetch(`${API_BASE_URL}/courses/topic/${topicId}/notes/`, {
      headers: this.getAuthHeaders()
    });
    return this.handleResponse(response);
  }

  /**
   * Retrieves a quiz for a specific topic.
   * @param {string} topicId - The ID of the topic.
   * @returns {Promise<any>} The quiz data.
   */
  async getTopicQuiz(topicId) {
    const response = await fetch(`${API_BASE_URL}/courses/topic/${topicId}/quiz/`, {
      headers: this.getAuthHeaders()
    });
    return this.handleResponse(response);
  }

  /**
   * Submits quiz answers.
   * @param {string} topicId - The ID of the topic.
   * @param {number[]} answers - An array of the user's answers.
   * @returns {Promise<any>} The quiz submission response.
   */
  async submitQuiz(topicId, answers) {
    const response = await fetch(`${API_BASE_URL}/courses/topic/${topicId}/submit-quiz/`, {
      method: 'POST',
      headers: this.getAuthHeaders(),
      body: JSON.stringify({ answers })
    });
    return this.handleResponse(response);
  }

  async getMyCourses() {
    const response = await fetch(`${API_BASE_URL}/courses/my-courses/`, {
      headers: this.getAuthHeaders()
    });
    return this.handleResponse(response);
  }

  async getFeaturedCourses() {
    const response = await fetch(`${API_BASE_URL}/courses/featured/`, {
      headers: this.getAuthHeaders()
    });
    return this.handleResponse(response);
  }

  // Progress endpoints
  async getStudyAnalytics() {
    const response = await fetch(`${API_BASE_URL}/progress/analytics/`, {
      headers: this.getAuthHeaders()
    });
    return this.handleResponse(response);
  }

  async getUserAchievements() {
    const response = await fetch(`${API_BASE_URL}/progress/achievements/`, {
      headers: this.getAuthHeaders()
    });
    return this.handleResponse(response);
  }

  /**
   * Logs a study session.
   * @param {string} courseId - The ID of the course.
   * @param {string} [topicId] - The ID of the topic (optional).
   * @param {number} [durationMinutes=30] - The duration of the session in minutes.
   * @returns {Promise<any>} The response from the server.
   */
  async logStudySession(courseId, topicId, durationMinutes = 30) {
    const response = await fetch(`${API_BASE_URL}/progress/log-session/`, {
      method: 'POST',
      headers: this.getAuthHeaders(),
      body: JSON.stringify({
        course_id: courseId,
        topic_id: topicId,
        duration_minutes: durationMinutes
      })
    });
    return this.handleResponse(response);
  }
}

export const apiService = new ApiService();
