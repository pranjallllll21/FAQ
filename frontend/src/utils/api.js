/**
 * API client utilities
 * Centralized API communication with the backend
 */

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://16.16.68.123:5000/api';

/**
 * Generic fetch wrapper for API calls
 */
const fetchAPI = async (endpoint, options = {}) => {
  try {
    const url = `${API_BASE_URL}${endpoint}`;
    const response = await fetch(url, {
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
      ...options,
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error || data.message || `API Error: ${response.status}`);
    }

    return data;
  } catch (error) {
    console.error('API Error:', error);
    throw error;
  }
};

// FAQ APIs
export const faqAPI = {
  // Get all FAQs (with cache-busting)
  getAll: (params = {}) => {
    // Add timestamp to bypass cache
    const queryParams = { ...params, _t: Date.now() };
    const queryString = new URLSearchParams(queryParams).toString();
    return fetchAPI(`/faqs?${queryString}`);
  },

  // Get single FAQ
  getById: (id) => fetchAPI(`/faqs/${id}`),

  // Create FAQ (admin)
  create: (faqData) =>
    fetchAPI('/faqs', {
      method: 'POST',
      body: JSON.stringify(faqData),
    }),

  // Update FAQ (admin)
  update: (id, faqData) =>
    fetchAPI(`/faqs/${id}`, {
      method: 'PUT',
      body: JSON.stringify(faqData),
    }),

  // Delete FAQ (admin)
  delete: (id) =>
    fetchAPI(`/faqs/${id}`, {
      method: 'DELETE',
    }),
};

// Question APIs
export const questionAPI = {
  // Submit new question
  ask: (questionData) =>
    fetchAPI('/questions/ask', {
      method: 'POST',
      body: JSON.stringify(questionData),
    }),

  // Get all questions (admin)
  getAll: (params = {}) => {
    const queryString = new URLSearchParams(params).toString();
    return fetchAPI(`/questions?${queryString}`);
  },

  // Update question status (admin)
  update: (id, updateData) =>
    fetchAPI(`/questions/${id}`, {
      method: 'PUT',
      body: JSON.stringify(updateData),
    }),

  // Delete question
  delete: (id) =>
    fetchAPI(`/questions/${id}`, {
      method: 'DELETE',
    }),
};

// Reaction APIs
export const reactionAPI = {
  // Like FAQ
  like: (faqId) =>
    fetchAPI(`/reactions/like/${faqId}`, {
      method: 'POST',
    }),

  // Dislike FAQ
  dislike: (faqId) =>
    fetchAPI(`/reactions/dislike/${faqId}`, {
      method: 'POST',
    }),
};

// AI APIs
export const aiAPI = {
  // Ask AI a question
  askAI: (question, userIdentifier = null) =>
    fetchAPI('/ask-ai', {
      method: 'POST',
      body: JSON.stringify({
        question,
        userIdentifier,
      }),
    }),
};

export default fetchAPI;
