import axios from 'axios';

const BASE_URL = '/api/cases';

export const caseApi = {
  // Get all cases (with optional search/filter query params)
  getAll: (params = {}) => axios.get(BASE_URL, { params }),

  // Get single case by ID
  getById: (id) => axios.get(`${BASE_URL}/${id}`),

  // Create a new case
  create: (data) => axios.post(BASE_URL, data),

  // Update a case by ID
  update: (id, data) => axios.put(`${BASE_URL}/${id}`, data),

  // Delete a case by ID
  delete: (id) => axios.delete(`${BASE_URL}/${id}`),
};
