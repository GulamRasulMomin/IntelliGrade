const API_BASE_URL =
  (import.meta.env.VITE_BACKEND_URL ||
   "http://127.0.0.1:8000") + "/api";

console.log("API Base URL:", API_BASE_URL);


class ApiService {
  getAuthHeaders() {
    const token = localStorage.getItem('authToken');
    return {
      'Content-Type': 'application/json',
      ...(token && { 'Authorization': `Bearer ${token}` })
    };
  }

  async withTokenRefresh(apiCall) {
    try {
      return await apiCall();
    } catch (error) {
      if (error.message && error.message.includes('401')) {
        try {
          const refreshResponse = await this.refreshToken();
          if (refreshResponse.access) {
            localStorage.setItem('authToken', refreshResponse.access);
            return await apiCall();
          }
        } catch (refreshError) {
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

  async handleResponse(response) {
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      const error = new Error(errorData.message || `HTTP error! status: ${response.status}`);
      error.fieldErrors = errorData;
      throw error;
    }
    return response.json();
  }

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

  async login(username, password) {
    console.log('Api base URL:', API_BASE_URL);
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

  async updateProfile(profileData) {
    const formData = new FormData();
    
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

  async getCourse(courseId) {
    const response = await fetch(`${API_BASE_URL}/courses/${courseId}/`, {
      headers: this.getAuthHeaders()
    });
    return this.handleResponse(response);
  }

  async getTopicNotes(topicId) {
    const response = await fetch(`${API_BASE_URL}/courses/topic/${topicId}/notes/`, {
      headers: this.getAuthHeaders()
    });
    return this.handleResponse(response);
  }

  async getTopicQuiz(topicId) {
    const response = await fetch(`${API_BASE_URL}/courses/topic/${topicId}/quiz/`, {
      headers: this.getAuthHeaders()
    });
    return this.handleResponse(response);
  }

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
