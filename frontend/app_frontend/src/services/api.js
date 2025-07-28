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
   * Handles the response from the API.
   * @param {Response} response The fetch response object.
   * @returns {Promise<any>} The response JSON data.
   */
  async handleResponse(response) {
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
    }
    return response.json();
  }

  // Authentication endpoints
  /**
   * Registers a new user.
   * @param {object} userData - The user's registration data.
   * @param {string} userData.name - The user's full name.
   * @param {string} userData.email - The user's email address.
   * @param {string} userData.password - The user's password.
   * @returns {Promise<any>} The registration response.
   */
  async register(userData) {
    const response = await fetch(`${API_BASE_URL}/auth/register/`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        first_name: userData.name.split(' ')[0],
        last_name: userData.name.split(' ').slice(1).join(' ') || '',
        email: userData.email,
        username: userData.email,
        password: userData.password,
        password_confirm: userData.password
      })
    });
    return this.handleResponse(response);
  }

  /**
   * Logs in a user.
   * @param {string} email - The user's email.
   * @param {string} password - The user's password.
   * @returns {Promise<any>} The login response.
   */
  async login(email, password) {
    const response = await fetch(`${API_BASE_URL}/auth/login/`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password })
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
    const response = await fetch(`${API_BASE_URL}/auth/profile/`, {
      headers: this.getAuthHeaders()
    });
    return this.handleResponse(response);
  }

  async getUserStats() {
    const response = await fetch(`${API_BASE_URL}/auth/stats/`, {
      headers: this.getAuthHeaders()
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
  async generateCourse(courseName, difficulty = 'beginner') {
    const response = await fetch(`${API_BASE_URL}/courses/generate/`, {
      method: 'POST',
      headers: this.getAuthHeaders(),
      body: JSON.stringify({
        course_name: courseName,
        difficulty: difficulty,
        duration_weeks: 4
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
