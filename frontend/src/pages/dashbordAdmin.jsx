import React, { useState, useRef, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import axios from "../api/axios";
import { useAuth } from "../context/AuthContext";

import inkdropLogo from "../assets/Inkdrop.png";
import homelogo from "../assets/home.png";
import hamberglogo from "../assets/hamburger.png";
import aboutlogo from "../assets/info.png";
import { commonLinks, adminLinks } from "../constants/links";
import man1 from "../assets/man1.jpg";

const COLOR = {
  nav: "#8B4513",
  bg: "#FAEBD7",
  accent: "#E97451",
  accentHover: "#CD5C5C",
  heading: "#2E2E2E",
  label: "#444",
  label2: "#707070",
  white: "#FFFFFF",
  muted: "#CDB79E",
};

const FONT = {
  header: '"Libertinus Mono", monospace',
  subheading: '"Bitter", serif',
  ui: '"Open Sans", sans-serif',
  body: '"Nunito", sans-serif',
};

const SIDEBAR_LINKS = [
  { name: "Overview", key: "overview" },
  { name: "Manage Categories", key: "categories" },
  { name: "Manage Books", key: "books" },
  { name: "Book Requests", key: "requests" },
  { name: "Download Logs", key: "logs" },
];

export default function AdminDashboard() {
  // Navbar/sidebar state
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const sidebarRef = useRef(null);
  const { auth, logout } = useAuth();
  const isLoggedIn = auth.isLoggedIn;
  const role = auth?.user?.role;
  const navigate = useNavigate();

  // Build sidebar links based on role and login status
  let finalLinks = [];
  if (isLoggedIn && role === "admin") {
    finalLinks = [
      commonLinks[0], 
      adminLinks[0],  
      commonLinks[1], 
      commonLinks[2], 
      adminLinks[1],  
      commonLinks[3], 
      commonLinks[4], 
    ];
  } else {
    finalLinks = [...commonLinks];
  }


  const [activeSection, setActiveSection] = useState("overview");
  const [stats, setStats] = useState(null);
  const [categories, setCategories] = useState([]);
  const [books, setBooks] = useState([]);
  const [requests, setRequests] = useState([]);
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [toast, setToast] = useState(null);


  const [showCategoryModal, setShowCategoryModal] = useState(false);
  const [editingCategory, setEditingCategory] = useState(null);
  const [newCategory, setNewCategory] = useState("");

  // Book modal state
  const [showBookModal, setShowBookModal] = useState(false);
  const [editingBook, setEditingBook] = useState(null);
  const [bookForm, setBookForm] = useState({ 
    title: "", 
    author: "", 
    category: "", 
    status: "active" 
  });

  // Fetch all data on mount/refresh
  useEffect(() => {
    async function fetchAll() {
      try {
        setLoading(true);
        setError(null);
        
        const [statsData, categoriesData, booksData, requestsData, logsData] = await Promise.all([
          axios.get("/api/admin/dashboard"),
          axios.get("/api/admin/categories"),
          axios.get("/api/books"),
          axios.get("/api/admin/requests"),
          axios.get("/api/downloads/logs"),
        ]);
        
        setStats(statsData.data);
        setCategories(categoriesData.data);
        setBooks(booksData.data);
        setRequests(requestsData.data);
        setLogs(logsData.data);
      } catch (err) {
        setError("Failed to load dashboard data. Please try again.");
        console.error("Dashboard fetch error:", err);
      } finally {
        setLoading(false);
      }
    }
    
    fetchAll();
  }, []);

  // Toast auto-hide
  useEffect(() => {
    if (toast) {
      const timer = setTimeout(() => setToast(null), 3000);
      return () => clearTimeout(timer);
    }
  }, [toast]);

  // Close sidebar when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (sidebarRef.current && !sidebarRef.current.contains(event.target)) {
        setSidebarOpen(false);
      }
    };
    
    if (sidebarOpen) {
      document.addEventListener("mousedown", handleClickOutside);
      document.body.style.overflow = "hidden";
    } else {
      document.removeEventListener("mousedown", handleClickOutside);
      document.body.style.overflow = "auto";
    }
    
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.body.style.overflow = "auto";
    };
  }, [sidebarOpen]);

  // Category handlers
  const handleCategorySubmit = async (e) => {
    e.preventDefault();
    if (!newCategory.trim()) {
      setToast({ type: "error", msg: "Category name cannot be empty" });
      return;
    }

    try {
      if (editingCategory) {
        const response = await axios.put(`/api/admin/categories/${editingCategory._id}`, { name: newCategory });
        setCategories((prev) =>
          prev.map((cat) => (cat._id === editingCategory._id ? response.data : cat))
        );
        setToast({ type: "success", msg: "Category updated successfully" });
      } else {
        const response = await axios.post("/api/admin/categories", { name: newCategory });
        setCategories((prev) => [...prev, response.data]);
        setToast({ type: "success", msg: "Category added successfully" });
      }
      setNewCategory("");
      setEditingCategory(null);
      setShowCategoryModal(false);
    } catch (err) {
      setToast({ type: "error", msg: "Failed to save category" });
      console.error("Category save error:", err);
    }
  };

  const handleDeleteCategory = async (id) => {
    try {
      await axios.delete(`/api/admin/categories/${id}`);
      setCategories((prev) => prev.filter((cat) => cat._id !== id));
      setToast({ type: "success", msg: "Category deleted successfully" });
    } catch (err) {
      setToast({ type: "error", msg: "Failed to delete category" });
      console.error("Category delete error:", err);
    }
  };

  // Book handlers
  const handleBookSubmit = async (e) => {
    e.preventDefault();
    if (!bookForm.title.trim() || !bookForm.author.trim() || !bookForm.category.trim()) {
      setToast({ type: "error", msg: "Please fill all required fields" });
      return;
    }

    try {
      if (editingBook) {
        const response = await axios.put(`/api/admin/books/${editingBook._id}`, bookForm);
        setBooks((prev) => prev.map((b) => (b._id === editingBook._id ? response.data : b)));
        setToast({ type: "success", msg: "Book updated successfully" });
      } else {
        const response = await axios.post("/api/admin/upload", bookForm);
        setBooks((prev) => [...prev, response.data]);
        setToast({ type: "success", msg: "Book added successfully" });
      }
      setBookForm({ title: "", author: "", category: "", status: "active" });
      setEditingBook(null);
      setShowBookModal(false);
    } catch (err) {
      setToast({ type: "error", msg: "Failed to save book" });
      console.error("Book save error:", err);
    }
  };

  const handleDeleteBook = async (id) => {
    try {
      await axios.delete(`/api/admin/books/${id}`);
      setBooks((prev) => prev.filter((b) => b._id !== id));
      setToast({ type: "success", msg: "Book deleted successfully" });
    } catch (err) {
      setToast({ type: "error", msg: "Failed to delete book" });
      console.error("Book delete error:", err);
    }
  };

  // Book request handlers
  const handleRequestAction = async (id, status) => {
    try {
      await axios.patch(`/api/admin/requests/${id}`, { status });
      setRequests((prev) =>
        prev.map((req) => (req._id === id ? { ...req, status } : req))
      );
      setToast({ type: "success", msg: `Request ${status} successfully` });
    } catch (err) {
      setToast({ type: "error", msg: `Failed to update request status` });
      console.error("Request update error:", err);
    }
  };

  // Section renderers
  const renderOverview = () => (
    <section className="mb-10">
      <Link to="/dashboard/profile">
        <img
          src={man1}
          alt="Profile"
          className="w-24 h-24 rounded-full border-4 border-[#E97451] shadow-md object-cover cursor-pointer"
        />
      </Link>
      <h2 className="text-3xl font-extrabold mb-6" style={{ color: COLOR.heading, fontFamily: FONT.header }}>
        Admin Overview
      </h2>
      {stats ? (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-[#FAEBD7] rounded-xl shadow p-6 flex flex-col items-center border border-[#CDB79E]">
            <svg className="w-12 h-12 text-[#8B4513] mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"></path>
            </svg>
            <span className="text-[#8B4513] text-3xl font-bold" style={{ fontFamily: FONT.subheading }}>
              {stats.totalBooks || books.length}
            </span>
            <span className="text-[#707070] text-lg" style={{ fontFamily: FONT.body }}>
              Total Books Uploaded
            </span>
          </div>
          <div className="bg-[#FAEBD7] rounded-xl shadow p-6 flex flex-col items-center border border-[#CDB79E]">
            <svg className="w-12 h-12 text-[#E97451] mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path>
            </svg>
            <span className="text-[#E97451] text-3xl font-bold" style={{ fontFamily: FONT.subheading }}>
              {stats.pendingRequests || requests.filter(r => r.status === 'pending').length}
            </span>
            <span className="text-[#707070] text-lg" style={{ fontFamily: FONT.body }}>
              Pending Book Requests
            </span>
          </div>
          <div className="bg-[#FAEBD7] rounded-xl shadow p-6 flex flex-col items-center border border-[#CDB79E]">
            <svg className="w-12 h-12 text-[#2E2E2E] mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6"></path>
            </svg>
            <span className="text-[#2E2E2E] text-lg font-semibold mb-2" style={{ fontFamily: FONT.subheading }}>
              Top Downloads
            </span>
            <ul className="text-center">
              {books.slice(0, 3).map((book, i) => (
                <li key={book._id} className="text-[#8B4513] font-bold text-sm" style={{ fontFamily: FONT.body }}>
                  {book.title} <span className="text-[#E97451]">({book.downloadCount || 0})</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      ) : (
        <p>No statistics available</p>
      )}
    </section>
  );

  const renderCategories = () => (
    <section className="mb-10">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold" style={{ color: COLOR.heading, fontFamily: FONT.header }}>
          Manage Categories
        </h2>
        <button
          className="px-4 py-2 bg-[#E97451] text-white rounded hover:bg-[#CD5C5C] transition-all font-semibold flex items-center"
          style={{ fontFamily: FONT.ui }}
          onClick={() => {
            setShowCategoryModal(true);
            setEditingCategory(null);
            setNewCategory("");
          }}
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="inline mr-1">
            <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" />
            <path d="M15 3h6v6" />
            <path d="M10 14L21 3" />
          </svg>
          Add Category
        </button>
      </div>
      {categories.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {categories.map((cat) => (
            <div key={cat._id} className="bg-[#FAEBD7] rounded-xl shadow p-6 border border-[#CDB79E] flex flex-col gap-2 group hover:shadow-lg transition-all">
              <div className="flex items-center justify-between">
                <span className="text-xl font-bold" style={{ color: COLOR.heading, fontFamily: FONT.subheading }}>
                  {cat.name}
                </span>
                <span
                  className="px-2 py-1 rounded-full text-xs font-semibold bg-[#E97451] text-white"
                  style={{ fontFamily: FONT.ui }}
                >
                  Active
                </span>
              </div>
              <span className="text-[#707070] text-sm" style={{ fontFamily: FONT.body }}>
                {books.filter(book => book.category === cat.name).length} books
              </span>
              <div className="flex gap-2 mt-2">
                <button
                  className="px-3 py-1 bg-[#E97451] text-white rounded hover:bg-[#CD5C5C] transition-all font-semibold flex items-center"
                  style={{ fontFamily: FONT.ui }}
                  onClick={() => {
                    setEditingCategory(cat);
                    setNewCategory(cat.name);
                    setShowCategoryModal(true);
                  }}
                >
                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="inline mr-1">
                    <path d="M17 3a2.828 2.828 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5L17 3z" />
                    <path d="M20.5 6.5L19 5l-4 4" />
                  </svg>
                  Edit
                </button>
                <button
                  className="px-3 py-1 bg-[#FAEBD7] text-[#CD5C5C] border border-[#CDB79E] rounded hover:bg-[#CD5C5C] hover:text-white transition-all font-semibold flex items-center"
                  style={{ fontFamily: FONT.ui }}
                  onClick={() => handleDeleteCategory(cat._id)}
                >
                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="inline mr-1">
                    <path d="M18 6 5 19" />
                    <path d="m19 5-14 14" />
                  </svg>
                  Delete
                </button>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <p className="text-[#707070]" style={{ fontFamily: FONT.body }}>
          No categories found
        </p>
      )}

      {/* Category Modal */}
      {showCategoryModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-30 animate-fadeIn">
          <div className="bg-[#FAEBD7] rounded-xl shadow-lg p-8 w-full max-w-md border-2 border-[#8B4513] relative animate-slideDown">
            <button
              className="absolute top-3 right-3 text-[#2E2E2E] hover:scale-110 transition"
              onClick={() => setShowCategoryModal(false)}
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="m18 6-12 12" />
                <path d="m6 6 12 12" />
              </svg>
            </button>
            <h3 className="text-xl font-bold mb-4" style={{ fontFamily: FONT.header }}>
              {editingCategory ? "Edit Category" : "Add Category"}
            </h3>
            <form onSubmit={handleCategorySubmit} className="flex flex-col gap-4">
              <input
                type="text"
                value={newCategory}
                onChange={(e) => setNewCategory(e.target.value)}
                placeholder="Category name"
                className="p-2 rounded border border-[#CDB79E] focus:outline-none"
                style={{ fontFamily: FONT.body }}
                autoFocus
                required
              />
              <div className="flex gap-2 justify-end">
                <button
                  type="button"
                  className="px-4 py-2 bg-[#FAEBD7] text-[#CD5C5C] border border-[#CDB79E] rounded hover:bg-[#CD5C5C] hover:text-white transition-all font-semibold"
                  style={{ fontFamily: FONT.ui }}
                  onClick={() => setShowCategoryModal(false)}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-[#E97451] text-white rounded hover:bg-[#CD5C5C] transition-all font-semibold"
                  style={{ fontFamily: FONT.ui }}
                >
                  {editingCategory ? "Update" : "Add"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </section>
  );

  const renderBooks = () => (
    <section className="mb-10">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold" style={{ color: COLOR.heading, fontFamily: FONT.header }}>
          Manage Books
        </h2>
        <button
          className="px-4 py-2 bg-[#E97451] text-white rounded hover:bg-[#CD5C5C] transition-all font-semibold flex items-center"
          style={{ fontFamily: FONT.ui }}
          onClick={() => {
            setShowBookModal(true);
            setEditingBook(null);
            setBookForm({ title: "", author: "", category: "", status: "active" });
          }}
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="inline mr-1">
            <path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z" />
            <path d="M17 21v-6a2 2 0 0 0-2-2H9a2 2 0 0 0-2 2v6" />
            <path d="M7 10h10" />
            <path d="M7 14h10" />
            <path d="M7 18h7" />
          </svg>
          Upload Book
        </button>
      </div>
      {books.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {books.map((book) => (
            <div key={book._id} className="bg-[#FAEBD7] rounded-xl shadow p-6 border border-[#CDB79E] flex flex-col gap-2 group hover:shadow-lg transition-all">
              <span className="text-xl font-bold" style={{ color: COLOR.heading, fontFamily: FONT.subheading }}>
                {book.title}
              </span>
              <span className="text-[#707070] text-sm" style={{ fontFamily: FONT.body }}>
                by {book.author}
              </span>
              <span className="text-[#E97451] text-xs font-semibold" style={{ fontFamily: FONT.ui }}>
                {book.category}
              </span>
              <span className="text-[#707070] text-xs" style={{ fontFamily: FONT.body }}>
                Downloads: {book.downloadCount || 0}
              </span>
              <span className="text-[#707070] text-xs" style={{ fontFamily: FONT.body }}>
                Uploaded: {new Date(book.createdAt || book.uploadDate).toLocaleDateString()}
              </span>
              <div className="flex gap-2 mt-2">
                <button
                  className="px-3 py-1 bg-[#E97451] text-white rounded hover:bg-[#CD5C5C] transition-all font-semibold flex items-center"
                  style={{ fontFamily: FONT.ui }}
                  onClick={() => {
                    setEditingBook(book);
                    setBookForm({
                      title: book.title,
                      author: book.author,
                      category: book.category,
                      status: "active",
                    });
                    setShowBookModal(true);
                  }}
                >
                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="inline mr-1">
                    <path d="M17 3a2.828 2.828 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5L17 3z" />
                    <path d="M20.5 6.5L19 5l-4 4" />
                  </svg>
                  Edit
                </button>
                <button
                  className="px-3 py-1 bg-[#FAEBD7] text-[#CD5C5C] border border-[#CDB79E] rounded hover:bg-[#CD5C5C] hover:text-white transition-all font-semibold flex items-center"
                  style={{ fontFamily: FONT.ui }}
                  onClick={() => handleDeleteBook(book._id)}
                >
                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="inline mr-1">
                    <path d="M18 6 5 19" />
                    <path d="m19 5-14 14" />
                  </svg>
                  Delete
                </button>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <p className="text-[#707070]" style={{ fontFamily: FONT.body }}>
          No books found
        </p>
      )}

      {/* Book Modal */}
      {showBookModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-30 animate-fadeIn">
          <div className="bg-[#FAEBD7] rounded-xl shadow-lg p-8 w-full max-w-md border-2 border-[#8B4513] relative animate-slideDown">
            <button
              className="absolute top-3 right-3 text-[#2E2E2E] hover:scale-110 transition"
              onClick={() => setShowBookModal(false)}
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="m18 6-12 12" />
                <path d="m6 6 12 12" />
              </svg>
            </button>
            <h3 className="text-xl font-bold mb-4" style={{ fontFamily: FONT.header }}>
              {editingBook ? "Edit Book" : "Upload Book"}
            </h3>
            <form onSubmit={handleBookSubmit} className="flex flex-col gap-4">
              <input
                type="text"
                value={bookForm.title}
                onChange={(e) => setBookForm({ ...bookForm, title: e.target.value })}
                placeholder="Book title"
                className="p-2 rounded border border-[#CDB79E] focus:outline-none"
                style={{ fontFamily: FONT.body }}
                autoFocus
                required
              />
              <input
                type="text"
                value={bookForm.author}
                onChange={(e) => setBookForm({ ...bookForm, author: e.target.value })}
                placeholder="Author"
                className="p-2 rounded border border-[#CDB79E] focus:outline-none"
                style={{ fontFamily: FONT.body }}
                required
              />
              <select
                value={bookForm.category}
                onChange={(e) => setBookForm({ ...bookForm, category: e.target.value })}
                className="p-2 rounded border border-[#CDB79E] focus:outline-none"
                style={{ fontFamily: FONT.body }}
                required
              >
                <option value="">Select a category</option>
                {categories.map((cat) => (
                  <option key={cat.id} value={cat.name}>
                    {cat.name}
                  </option>
                ))}
              </select>
              <select
                value={bookForm.status}
                onChange={(e) => setBookForm({ ...bookForm, status: e.target.value })}
                className="p-2 rounded border border-[#CDB79E] focus:outline-none"
                style={{ fontFamily: FONT.body }}
              >
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
              </select>
              <div className="flex gap-2 justify-end">
                <button
                  type="button"
                  className="px-4 py-2 bg-[#FAEBD7] text-[#CD5C5C] border border-[#CDB79E] rounded hover:bg-[#CD5C5C] hover:text-white transition-all font-semibold"
                  style={{ fontFamily: FONT.ui }}
                  onClick={() => setShowBookModal(false)}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-[#E97451] text-white rounded hover:bg-[#CD5C5C] transition-all font-semibold"
                  style={{ fontFamily: FONT.ui }}
                >
                  {editingBook ? "Update" : "Upload"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </section>
  );

  const renderRequests = () => (
    <section className="mb-10">
      <h2 className="text-2xl font-bold mb-6" style={{ color: COLOR.heading, fontFamily: FONT.header }}>
        Book Requests
      </h2>
      {requests.length > 0 ? (
        <div className="overflow-x-auto rounded-xl shadow border border-[#CDB79E] bg-[#FAEBD7]">
          <table className="min-w-full divide-y divide-[#CDB79E]">
            <thead>
              <tr>
                <th className="px-6 py-3 text-left text-xs font-bold uppercase" style={{ color: COLOR.heading, fontFamily: FONT.subheading }}>
                  Title
                </th>
                <th className="px-6 py-3 text-left text-xs font-bold uppercase" style={{ color: COLOR.heading, fontFamily: FONT.subheading }}>
                  User
                </th>
                <th className="px-6 py-3 text-left text-xs font-bold uppercase" style={{ color: COLOR.heading, fontFamily: FONT.subheading }}>
                  Category
                </th>
                <th className="px-6 py-3 text-left text-xs font-bold uppercase" style={{ color: COLOR.heading, fontFamily: FONT.subheading }}>
                  Date
                </th>
                <th className="px-6 py-3 text-left text-xs font-bold uppercase" style={{ color: COLOR.heading, fontFamily: FONT.subheading }}>
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-bold uppercase" style={{ color: COLOR.heading, fontFamily: FONT.subheading }}>
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#CDB79E]">
              {requests.map((req) => (
                <tr key={req._id} className="hover:bg-[#E97451]/10 transition-all">
                  <td className="px-6 py-4 font-medium" style={{ color: COLOR.heading, fontFamily: FONT.body }}>
                    {req.title}
                  </td>
                  <td className="px-6 py-4" style={{ color: COLOR.label2, fontFamily: FONT.body }}>
                    {req.requestedBy?.username || req.requestedBy?.email || 'Unknown'}
                  </td>
                  <td className="px-6 py-4" style={{ color: COLOR.label2, fontFamily: FONT.body }}>
                    {req.category}
                  </td>
                  <td className="px-6 py-4" style={{ color: COLOR.label2, fontFamily: FONT.body }}>
                    {new Date(req.createdAt).toLocaleString()}
                  </td>
                  <td className="px-6 py-4" style={{ fontFamily: FONT.ui }}>
                    <span
                      className={`px-2 py-1 rounded-full text-xs font-semibold ${
                        req.status === "Pending"
                          ? "bg-[#E97451] text-white"
                          : req.status === "Approved"
                          ? "bg-green-500 text-white"
                          : req.status === "Rejected"
                          ? "bg-[#CD5C5C] text-white"
                          : "bg-gray-500 text-white"
                      }`}
                    >
                      {req.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 flex gap-2">
                    <button
                      className="px-2 py-1 bg-green-500 text-white rounded hover:bg-green-600 transition-all flex items-center"
                      style={{ fontFamily: FONT.ui }}
                      onClick={() => handleRequestAction(req._id, "Approved")}
                      disabled={req.status === "Approved"}
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="inline mr-1">
                        <path d="M20 6 9 17l-5-5" />
                      </svg>
                      Approve
                    </button>
                    <button
                      className="px-2 py-1 bg-[#CD5C5C] text-white rounded hover:bg-red-700 transition-all flex items-center"
                      style={{ fontFamily: FONT.ui }}
                      onClick={() => handleRequestAction(req._id, "Rejected")}
                      disabled={req.status === "Rejected"}
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="inline mr-1">
                        <path d="M18 6 5 19" />
                        <path d="m19 5-14 14" />
                      </svg>
                      Reject
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <p className="text-[#707070]" style={{ fontFamily: FONT.body }}>
          No book requests found
        </p>
      )}
    </section>
  );

  const renderLogs = () => (
    <section className="mb-10">
      <h2 className="text-2xl font-bold mb-6" style={{ color: COLOR.heading, fontFamily: FONT.header }}>
        User Download Logs
      </h2>
      {logs.length > 0 ? (
        <div className="overflow-x-auto rounded-xl shadow border border-[#CDB79E] bg-[#FAEBD7]">
          <table className="min-w-full divide-y divide-[#CDB79E]">
            <thead>
              <tr>
                <th className="px-6 py-3 text-left text-xs font-bold uppercase" style={{ color: COLOR.heading, fontFamily: FONT.subheading }}>
                  Book
                </th>
                <th className="px-6 py-3 text-left text-xs font-bold uppercase" style={{ color: COLOR.heading, fontFamily: FONT.subheading }}>
                  User
                </th>
                <th className="px-6 py-3 text-left text-xs font-bold uppercase" style={{ color: COLOR.heading, fontFamily: FONT.subheading }}>
                  Date
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#CDB79E]">
              {logs.map((log) => (
                <tr key={log._id} className="hover:bg-[#E97451]/10 transition-all">
                  <td className="px-6 py-4 font-medium" style={{ color: COLOR.heading, fontFamily: FONT.body }}>
                    {log.book?.title || 'Unknown Book'}
                  </td>
                  <td className="px-6 py-4" style={{ color: COLOR.label2, fontFamily: FONT.body }}>
                    {log.user?.username || log.user?.email || 'Unknown User'}
                  </td>
                  <td className="px-6 py-4" style={{ color: COLOR.label2, fontFamily: FONT.body }}>
                    {new Date(log.downloadedAt || log.createdAt).toLocaleString()}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <p className="text-[#707070]" style={{ fontFamily: FONT.body }}>
          No download logs found
        </p>
      )}
    </section>
  );

  return (
    <div className="min-h-screen flex flex-col" style={{ background: COLOR.bg }}>
      {/* Navbar */}
      <nav className="flex items-center justify-between p-3 shadow-md bg-[#8B4513] text-[#FAEBD7] z-30 sticky top-0">
        <div className="flex items-center space-x-2 m-2">
          <img src={inkdropLogo} alt="Logo" className="h-22 w-22 rounded-full border-2 border-[#FAEBD7] hover:scale-105 transition-transform duration-500 hover:shadow-lg" />
        </div>
        <div className="flex justify-end gap-4">
          <Link to="/">
            <img src={homelogo} alt="Home" className="w-10 h-10 rounded-full p-1 hover:bg-[#A0522D] cursor-pointer" />
          </Link>
          <Link to="/about">
            <img src={aboutlogo} alt="About" className="w-10 h-10 rounded-full p-1 hover:bg-[#A0522D] cursor-pointer" />
          </Link>
          <button onClick={() => setSidebarOpen(true)} className="focus:outline-none">
            <img src={hamberglogo} alt="Menu" className="w-10 h-10 rounded-full p-1 hover:bg-[#A0522D] cursor-pointer" />
          </button>
        </div>
      </nav>

      {/* Blur Overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-40 backdrop-blur-sm bg-opacity-1 transition-all duration-300"
          onClick={() => setSidebarOpen(false)}
        ></div>
      )}

      {/* Sidebar */}
      <div
        ref={sidebarRef}
        className={`fixed top-1/2 right-0 w-64 bg-[#FAEBD7] shadow-xl flex flex-col transition-all duration-300 ease-in-out z-50 rounded-l-lg border-l-2 border-t-2 border-b-2 border-[#2E2E2E] transform ${
          sidebarOpen ? "translate-x-0 -translate-y-1/2" : "translate-x-full -translate-y-1/2"
        }`}
        style={{ maxHeight: "80vh" }}
      >
        <button
          className="absolute top-3 right-3 text-[#2E2E2E] hover:scale-110 transition"
          onClick={() => setSidebarOpen(false)}
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-6 w-6"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
        <div className="flex flex-col items-center justify-center p-4 h-full overflow-y-auto">
          <div className="relative px-4 w-full">
            <div className="absolute -inset-1.5 bg-[#FFF5CC] rounded-lg border-2 border-black transform -rotate-2 z-0"></div>
            <div className="relative z-10 text-center">
              <p className="text-xl font-extrabold text-[#2E2E2E] drop-shadow-sm" style={{ fontFamily: FONT.header }}>
                Fuel Your Flow
              </p>
              <p className="text-sm text-[#444] mt-2" style={{ fontFamily: FONT.body }}>
                {isLoggedIn ? `Hello, ${auth.user?.username}` : "Login to track and triumph"}
              </p>
            </div>
          </div>
          <div className="w-full px-4 space-y-2 mt-4 flex-grow flex flex-col items-center justify-center">
            {isLoggedIn ? (
              <>
                <div className="w-full space-y-2">
                  {finalLinks.map((link, index) => (
                    <Link
                      to={link.path}
                      key={index}
                      onClick={() => setSidebarOpen(false)}
                      className="block text-center py-2 px-3 bg-[#E97451] text-white font-semibold rounded-full hover:bg-[#CD5C5C] transition"
                      style={{ fontFamily: "Poppins, sans-serif" }}
                    >
                      {link.name}
                    </Link>
                  ))}
                </div>
                <button
                  onClick={() => {
                    logout();
                    navigate('/authPage');
                    setSidebarOpen(false);
                  }}
                  className="w-full mt-4 px-6 py-2 bg-red-600 text-white font-semibold rounded-full border-2 border-black hover:bg-red-700 transition-all duration-200 shadow-lg hover:shadow-xl"
                  style={{ fontFamily: "Poppins, sans-serif" }}
                >
                  Logout
                </button>
              </>
            ) : (
              <div className="w-full flex flex-col items-center justify-center">
                <Link
                  to="/authPage"
                  className="w-full px-6 py-2 bg-[#E97451] text-white font-semibold rounded-full border-2 border-black hover:bg-[#d9623c] transition-all duration-200 shadow-lg hover:shadow-xl hover:-translate-y-1 text-center"
                  style={{ fontFamily: "Poppins, sans-serif" }}
                >
                  Login / Signup
                </Link>
                <p className="text-sm text-gray-600 mt-4 text-center">
                  Login to access all features
                </p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Main Content */}
      <main className="flex-1 w-full max-w-7xl mx-auto px-4 py-8">
        {/* Admin Dashboard Navigation */}
        <div className="mb-8">
          <div className="flex flex-wrap gap-4 justify-center">
            {SIDEBAR_LINKS.map((link) => (
              <button
                key={link.key}
                onClick={() => setActiveSection(link.key)}
                className={`px-6 py-3 rounded-lg font-semibold transition-all ${
                  activeSection === link.key 
                    ? "bg-[#E97451] text-white shadow-lg" 
                    : "bg-[#FAEBD7] text-[#8B4513] border border-[#CDB79E] hover:bg-[#CD5C5C] hover:text-white"
                }`}
                style={{ fontFamily: FONT.ui }}
              >
                {link.name}
              </button>
            ))}
          </div>
        </div>

        {loading ? (
          <div className="flex justify-center items-center h-40 text-xl font-bold text-[#8B4513]">
            Loading Dashboard Data...
          </div>
        ) : error ? (
          <div className="flex flex-col items-center justify-center h-40">
            <p className="text-xl font-bold text-[#CD5C5C] mb-4">{error}</p>
            <button
              onClick={() => window.location.reload()}
              className="px-4 py-2 bg-[#E97451] text-white rounded hover:bg-[#CD5C5C] transition-all font-semibold"
              style={{ fontFamily: FONT.ui }}
            >
              Retry
            </button>
          </div>
        ) : (
          <>
            {toast && (
              <div
                className={`fixed top-20 right-6 z-50 px-6 py-3 rounded shadow-lg font-semibold text-white animate-fadeIn flex items-center ${
                  toast.type === "success" ? "bg-[#E97451]" : "bg-[#CD5C5C]"
                }`}
                style={{ fontFamily: FONT.ui }}
              >
                {toast.msg}
                <button
                  onClick={() => setToast(null)}
                  className="ml-4 text-white hover:text-gray-200"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M18 6 5 19" />
                    <path d="m19 5-14 14" />
                  </svg>
                </button>
              </div>
            )}
            {activeSection === "overview" && renderOverview()}
            {activeSection === "categories" && renderCategories()}
            {activeSection === "books" && renderBooks()}
            {activeSection === "requests" && renderRequests()}
            {activeSection === "logs" && renderLogs()}
          </>
        )}
      </main>

      {/* Footer */}
      <footer className="w-full bg-[#8B4513] text-[#FAEBD7] font-sans">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 w-full p-10">
          {/* Designer Info */}
          <div>
            <h1 className="text-lg font-bold" style={{ fontFamily: FONT.subheading }}>
              Designed By :-
              <ul>
                <li className="text-md font-medium pl-4 py-1.5">Harshit Singh</li>
                <li className="text-md font-medium pl-4 pt-1">Rudra Tiwari</li>
                <li className="text-md font-medium pl-4 py-2">Ansh Mishra</li>
              </ul>
            </h1>
          </div>
          {/* Quick Links */}
          <div>
            <h3 className="text-lg font-semibold mb-4 underline" style={{ fontFamily: FONT.subheading }}>
              Quick Links
            </h3>
            <ul className="space-y-2 list-disc pl-7">
              <li>
                <a href="/" className="hover:text-[#E97451] text-[#FAEBD7]" style={{ fontFamily: FONT.header }}>
                  Home
                </a>
              </li>
              <li>
                <a href="/dashboardAdmin" className="hover:text-[#E97451] text-[#FAEBD7]" style={{ fontFamily: FONT.header }}>
                  Dashboard
                </a>
              </li>
              <li>
                <a href="/library" className="hover:text-[#E97451] text-[#FAEBD7]" style={{ fontFamily: FONT.header }}>
                  My Library
                </a>
              </li>
              <li>
                <a href="/contact" className="hover:text-[#E97451] text-[#FAEBD7]" style={{ fontFamily: FONT.header }}>
                  Contact Us
                </a>
              </li>
              <li>
                <a href="/about" className="hover:text-[#E97451] text-[#FAEBD7]" style={{ fontFamily: FONT.header }}>
                  About Us
                </a>
              </li>
              {isLoggedIn && role === "admin" && (
                <li>
                  <a href="/upload" className="hover:text-[#E97451] text-[#FAEBD7]" style={{ fontFamily: FONT.header }}>
                    Upload (Admin)
                  </a>
                </li>
              )}
            </ul>
          </div>
          {/* Documents */}
          <div>
            <h3 className="text-lg font-semibold mb-4 underline" style={{ fontFamily: FONT.subheading }}>
              Related Documents
            </h3>
            <ul className="space-y-2 list-disc pl-7">
              <li>
                <a href="#" className="hover:text-[#E97451] text-[#FAEBD7]" style={{ fontFamily: FONT.header }}>
                  Licensing Information
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-[#E97451] text-[#FAEBD7]" style={{ fontFamily: FONT.header }}>
                  Privacy Policy
                </a>
              </li>
            </ul>
          </div>
          {/* Newsletter & Quote */}
          <div className="md:col-span-3 mt-8">
            <div className="text-center mb-4">
              <p className="text-sm italic">Empowering curious minds with free knowledge, one download at a time.</p>
            </div>
            <form className="flex flex-col sm:flex-row gap-3 items-center justify-center">
              <input
                type="email"
                placeholder="Enter your email"
                className="p-2 rounded bg-[#FAEBD7] text-[#2E2E2E] border border-[#8B4513] w-72 focus:outline-none"
              />
              <button className="px-4 py-2 bg-[#E97451] text-white rounded hover:bg-[#d8623d] transition-all duration-200">
                Subscribe
              </button>
            </form>
          </div>
        </div>
        <hr className="border-[#2E2E2E] mx-4" />
        {/* Back to Top */}
        <div className="w-full py-4 text-center relative">
          <p className="text-sm text-[#FAEBD7]">© 2025 InkDrop. All rights reserved.</p>
          <button
            onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
            className="absolute right-6 top-2 px-3 py-2 bg-[#E97451] hover:bg-[#d8623d] text-white rounded-full shadow-md transition-all duration-200"
          >
            ↑ Top
          </button>
        </div>
      </footer>
    </div>
  );
}