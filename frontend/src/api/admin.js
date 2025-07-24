import axios from './axios';

// Real backend API call
export async function getAdminStats() {
  const res = await axios.get('/api/admin/stats');
  return res.data;
}

export async function getAdminCategories() {
  const response = await axios.get('/api/admin/categories');
  return response.data;
}

export async function getAdminRequests() {
  const response = await axios.get('/api/admin/requests');
  return response.data;
}

export async function addAdminCategory(name) {
  const response = await axios.post('/api/admin/categories', { name });
  return response.data;
}

export async function editAdminCategory(id, name) {
  const response = await axios.put(`/api/admin/categories/${id}`, { name });
  return response.data;
}

export async function deleteAdminCategory(id) {
  const response = await axios.delete(`/api/admin/categories/${id}`);
  return response.data;
}

export async function getAdminBooks() {
  const response = await axios.get('/api/admin/books');
  return response.data;
}

export async function addAdminBook(bookData) {
  const response = await axios.post('/api/admin/books', bookData);
  return response.data;
}

export async function editAdminBook(id, bookData) {
  const response = await axios.put(`/api/admin/books/${id}`, bookData);
  return response.data;
}

export async function deleteAdminBook(id) {
  const response = await axios.delete(`/api/admin/books/${id}`);
  return response.data;
}

export async function updateAdminRequestStatus(id, status) {
  const response = await axios.put(`/api/admin/requests/${id}`, { status });
  return response.data;
}

export async function getAdminDownloadLogs() {
  const response = await axios.get('/api/admin/download-logs');
  return response.data;
}
