import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_BACKEND_API_URL; 

const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 300000, // 5 minutes for file processing
});

// Request interceptor to add auth headers if needed
api.interceptors.request.use(
  (config) => {
    // You can add auth headers here later if needed
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor for error handling
api.interceptors.response.use(
  (response) => response,
  (error) => {
    console.error('API Error:', error);
    if (error.response) {
      // Server responded with error status
      throw new Error(error.response.data?.error || 'Server error occurred');
    } else if (error.request) {
      // Request was made but no response received
      throw new Error('No response from server. Please check if the backend is running.');
    } else {
      // Something else happened
      throw new Error('An unexpected error occurred');
    }
  }
);

export const uploadFiles = async (files) => {
  const formData = new FormData();
  
  files.forEach((file) => {
    formData.append('files', file);
  });

  const response = await api.post('/upload', formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });

  return response.data;
};

export default api;
