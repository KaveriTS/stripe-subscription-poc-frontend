import axios from 'axios';

const API_BASE_URL = process.env.REACT_APP_API_BASE_URL || 'http://localhost:7000/api';

// Create axios instance with default configuration
const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 30000, // 30 seconds
});

// Request interceptor for logging
api.interceptors.request.use(
  (config) => {
    console.log(`🔄 API Request: ${config.method?.toUpperCase()} ${config.url}`);
    return config;
  },
  (error) => {
    console.error('❌ API Request Error:', error);
    return Promise.reject(error);
  }
);

// Response interceptor for error handling
api.interceptors.response.use(
  (response) => {
    console.log(`✅ API Response: ${response.status} ${response.config.url}`);
    return response;
  },
  (error) => {
    console.error('❌ API Response Error:', error.message || error.response?.data);

    // Handle error scenarios
    if (error.response) {
      // Server responded with error status
      const { status, data } = error.response;
      
      switch (status) {
        case 400:
          throw new Error(data.message || 'Invalid request parameters');
        case 404:
          throw new Error(data.message || 'Resource not found');
        case 500:
          throw new Error(data.message || 'Internal server error');
        default:
          throw new Error(data.message || `Server error: ${status}`);
      }
    } else if (error.request) {
      throw new Error('Network error: Unable to connect to server');
    } else {
      throw new Error(error.message || 'An unexpected error occurred');
    }
  }
);

// API Methods
export const subscriptionAPI = {
  // Get all products from Stripe
  getProducts: async () => {
    try {
      const response = await api.get('/products');
      console.log("prodyusts", response.data)
      return response.data;
    } catch (error) {
      console.error('Failed to fetch products:', error);
      throw error;
    }
  },

  // Create a new subscription
  createSubscription: async (subscriptionData) => {
    try {
      const response = await api.post('/subscription', subscriptionData);
      return response.data;
    } catch (error) {
      console.error('Failed to create subscription:', error);
      const errorMessage =
      error.message ||
      error.response?.data?.message ||
      error.response?.data?.error?.message ||
      'Something went wrong while creating subscription.';
      throw new Error(errorMessage);
    }
  },

  // Get subscription status by email
  getSubscriptionStatus: async (email) => {
    try {
      const response = await api.get(`/subscription/status?email=${encodeURIComponent(email)}`);
      return response.data;
    } catch (error) {
      console.error('Failed to get subscription status:', error);
      throw error;
    }
  },
};

// Helper function to handle API errors consistently
export const handleAPIError = (error) => {
  if (error.response) {
    return error.response.data?.message || 'Server error occurred';
  } else if (error.request) {
    return 'Network error: Please check your connection';
  } else {
    return error.message || 'An unexpected error occurred';
  }
};

export default api; 