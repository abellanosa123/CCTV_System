import axios from 'axios';

const API = axios.create({
  baseURL: '/api'
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
export const releaseFootage = (reviewId, releaseDate) => API.post(`/releases/release/${reviewId}`, { releaseDate });
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

export default API;
