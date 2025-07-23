import axios from './axios';

// Real backend API call
export async function getAdminStats() {
  const res = await axios.get('/admin/stats');
  return res.data;
}

export async function getAdminCategories() {
  const response = await axios.get('/admin/categories');
  return response.data;
}

export async function getAdminRequests() {
  const response = await axios.get('/admin/requests');
  return response.data;
}

export async function addAdminCategory(name) {
  const response = await axios.post('/admin/categories', { name });
  return response.data;
}

export async function editAdminCategory(id, name) {
  const response = await axios.put(`/admin/categories/${id}`, { name });
  return response.data;
}

export async function deleteAdminCategory(id) {
  const response = await axios.delete(`/admin/categories/${id}`);
  return response.data;
}

export async function getAdminBooks() {
  const response = await axios.get('/admin/books');
  return response.data;
}

export async function addAdminBook(bookData) {
  const response = await axios.post('/admin/books', bookData);
  return response.data;
}

export async function editAdminBook(id, bookData) {
  const response = await axios.put(`/admin/books/${id}`, bookData);
  return response.data;
}

export async function deleteAdminBook(id) {
  const response = await axios.delete(`/admin/books/${id}`);
  return response.data;
}

export async function updateAdminRequestStatus(id, status) {
  const response = await axios.put(`/admin/requests/${id}`, { status });
  return response.data;
}

export async function getAdminDownloadLogs() {
  const response = await axios.get('/admin/download-logs');
  return response.data;
}
