import axios from 'axios';

const API = axios.create({
  baseURL: '/api'
});

API.interceptors.request.use((config) => {
  const token = sessionStorage.getItem('cctv_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Observations
export const getObservations = (params) => API.get('/observations', { params });
export const createObservation = (data) => API.post('/observations', data);
export const updateObservation = (id, data) => API.put(`/observations/${id}`, data);
export const deleteObservation = (id) => API.delete(`/observations/${id}`);

// Reviews
export const getReviews = (params) => API.get('/reviews', { params });
export const createReview = (data) => API.post('/reviews', data);
export const updateReview = (id, data) => API.put(`/reviews/${id}`, data);
export const deleteReview = (id) => API.delete(`/reviews/${id}`);

// Releases
export const getReleases = (params) => API.get('/releases', { params });
export const releaseFootage = (reviewId, data) => API.post(`/releases/release/${reviewId}`, data);
export const deleteRelease = (id) => API.delete(`/releases/${id}`);

// Dashboard
export const getDashboardStats = (params) => API.get('/dashboard', { params });

// Reports
export const getReportData = (params) => API.get('/reports', { params });

// Dropdown Options
export const getDropdownOptions = (category) => API.get(`/dropdown/${category}`);
export const addDropdownOption = (category, value) => API.post(`/dropdown/${category}`, { value });
export const updateDropdownOption = (id, value) => API.put(`/dropdown/${id}`, { value });
export const deleteDropdownOption = (id) => API.delete(`/dropdown/${id}`);

// Users
export const getUsers = () => API.get('/users');
export const createUser = (data) => API.post('/users', data);
export const updateMyProfile = (data) => API.put('/users/profile', data);
export const updateUser = (id, data) => API.put(`/users/${id}`, data);
export const deleteUser = (id) => API.delete(`/users/${id}`);

// Notifications
export const getNotifications = () => API.get('/notifications');
export const getUnreadNotificationCount = () => API.get('/notifications/unread');
export const markNotificationRead = (id) => API.put(`/notifications/${id}/read`);
export const markAllNotificationsRead = () => API.put('/notifications/read-all');
export const bulkMarkNotificationsRead = (ids) => API.put('/notifications/bulk-read', { ids });
export const deleteNotification = (id) => API.delete(`/notifications/${id}`);
export const bulkDeleteNotifications = (ids) => API.delete('/notifications/bulk-delete', { data: { ids } });
export const sendNotification = (data) => API.post('/notifications/send', data);

export default API;
