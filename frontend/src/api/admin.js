// inside admin.js or any API file
import axios from './axios';
// ✅ uses your configured Axios instance

// Keep existing mock function
export async function getAdminStats() {
  return new Promise((resolve) => setTimeout(() => resolve({
    totalUploads: 42,
    pendingRequests: 5,
    topBooks: [
      { title: "Atomic Habits", downloads: 1200 },
      { title: "Sapiens", downloads: 950 },
      { title: "The Alchemist", downloads: 800 },
    ],
  }), 400));
}

// ✅ 🔄 Replace this with actual API call
export async function getAdminCategories() {
  const response = await axios.get('/admin/categories');
  return response.data;
}

// ✅ 🔄 Replace this with actual API call
export async function getAdminRequests() {
  const response = await axios.get('/admin/requests');
  return response.data;
}

// Keep the rest of the mock admin functions unchanged
export async function addAdminCategory(name) {
  return new Promise((resolve) => setTimeout(() => resolve({ id: Date.now(), name, bookCount: 0, status: "active" }), 400));
}
export async function editAdminCategory(id, name) {
  return new Promise((resolve) => setTimeout(() => resolve({ id, name, bookCount: 0, status: "active" }), 400));
}
export async function deleteAdminCategory(id) {
  return new Promise((resolve) => setTimeout(() => resolve(true), 400));
}
export async function getAdminBooks() {
  return new Promise((resolve) => setTimeout(() => resolve([
    { id: 1, title: "Atomic Habits", author: "James Clear", category: "Self-help", downloads: 1200, status: "active" },
    { id: 2, title: "Sapiens", author: "Yuval Noah Harari", category: "History", downloads: 950, status: "active" },
    { id: 3, title: "The Alchemist", author: "Paulo Coelho", category: "Fiction", downloads: 800, status: "inactive" },
  ]), 400));
}
export async function addAdminBook(bookData) {
  return new Promise((resolve) => setTimeout(() => resolve({ ...bookData, id: Date.now(), downloads: 0 }), 400));
}
export async function editAdminBook(id, bookData) {
  return new Promise((resolve) => setTimeout(() => resolve({ ...bookData, id }), 400));
}
export async function deleteAdminBook(id) {
  return new Promise((resolve) => setTimeout(() => resolve(true), 400));
}
export async function updateAdminRequestStatus(id, status) {
  return new Promise((resolve) => setTimeout(() => resolve({ id, status }), 400));
}
export async function getAdminDownloadLogs() {
  return new Promise((resolve) => setTimeout(() => resolve([
    { id: 1, book: "Atomic Habits", user: "user123", date: "2024-06-01T10:00:00Z" },
    { id: 2, book: "Sapiens", user: "user456", date: "2024-06-02T12:00:00Z" },
  ]), 400));
}
