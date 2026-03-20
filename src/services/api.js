import axios from 'axios';

// Create axios instance with base URL
const api = axios.create({
  baseURL: 'https://naariart-apibackend.onrender.com',
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to add auth token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('naari_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor to handle errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Token expired or invalid
      localStorage.removeItem('naari_token');
      localStorage.removeItem('naari_user');
      window.location.href = '/';
    }
    return Promise.reject(error);
  }
);

// Auth API calls
export const authAPI = {
  login: async (userId, password) => {
    const response = await api.post('/user/login', {
      userId,
      password
    });
    
    // Handle the actual API response structure
    if (response.data.IsSuccess && response.data.Status === 200) {
      return {
        token: response.data.Data.accessToken,
        user: response.data.Data.userData,
        message: response.data.Message
      };
    } else {
      throw new Error(response.data.Message || 'Login failed');
    }
  },
};

// Generic API calls
export const apiCall = async (method, endpoint, data = null) => {
  const response = await api({
    method,
    url: endpoint,
    data,
  });
  return response.data;
};

export default api;
