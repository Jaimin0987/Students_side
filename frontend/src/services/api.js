import axios from 'axios';
import toast from 'react-hot-toast';

// Define the base URL for the API
const API_BASE_URL = 'http://localhost:8000';

// Create a configured instance of Axios
const api = axios.create({
  baseURL: API_BASE_URL,
});

// Use an interceptor to automatically add the auth token to every request
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('jwt');
    if (token) {
      config.headers['Authorization'] = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// --- API Service Definitions ---

// Authentication Service
export const authAPI = {
  signIn: (credentials) => api.post('/users/login', credentials),
  signUp: (userData) => api.post('/users/register', userData),
};

// Groups Service
export const groupsAPI = {
  getGroups: () => api.get('/groups'),
  createGroup: (groupData) => api.post('/groups', groupData),
  joinGroup: (groupId, password) => api.post(`/groups/${groupId}/join`, { password }),
  deleteGroup: (groupId) => api.delete(`/groups/${groupId}`),
};

// Files Service
export const filesAPI = {
  getGroupFiles: (groupId) => api.get(`/groups/${groupId}/files`),
  // Note: Add file upload/delete functions here when needed
};

// Assignments Service
export const assignmentsAPI = {
  getGroupAssignments: (groupId) => api.get(`/groups/${groupId}/assignments`),
  createAssignment: (assignmentData) => api.post('/assignments', assignmentData),
  deleteAssignment: (assignmentId) => api.delete(`/assignments/${assignmentId}`),
  submitAssignment: (assignmentId, submissionData) => api.post(`/assignments/${assignmentId}/submit`, submissionData),
};

export default api;