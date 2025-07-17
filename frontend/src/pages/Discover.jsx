import React, { useState, useEffect, useRef } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import axios from "../api/axios";
import { useAuth } from "../context/AuthContext";

import inkdropLogo from "../assets/Inkdrop.png";
import homelogo from "../assets/home.png";
import hamberglogo from "../assets/hamburger.png";
import aboutlogo from "../assets/info.png";
import { commonLinks, adminLinks } from "../constants/links";

const COLOR = {
  nav: "#8B4513",
  bg: "#FAEBD7",
  accent: "#E97451",
  accentHover: "#A0522D",
  accentRed: "#d8623d",
  accentRedHover: "#d9623c",
  white: "#FFFFFF",
  muted: "#CDB79E",
  heading: "#2E2E2E",
  label: "#444",
  label2: "#707070",
};
const FONT = {
  header: '"Libertinus Mono", monospace',
  subheading: '"Bitter", serif',
  ui: '"Open Sans", sans-serif',
  body: '"Nunito", sans-serif',
};

function useDebounce(value, delay) {
  const [debounced, setDebounced] = useState(value);
  useEffect(() => {
    const handler = setTimeout(() => setDebounced(value), delay);
    return () => clearTimeout(handler);
  }, [value, delay]);
  return debounced;
}

const Discover = () => {
  // Navbar/Sidebar state
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const sidebarRef = useRef(null);
  const { auth, logout } = useAuth();
  const isLoggedIn = auth.isLoggedIn;
  const role = auth?.user?.role;
  const navigate = useNavigate();
  const location = useLocation();

  // Sidebar links
  const dashboardLink = {
    name: "Dashboard",
    path: role === "admin" ? "/dashboardAdmin" : "/userdashbord",
  };

  const finalLinks = [
    commonLinks[0], 
    dashboardLink, 
    ...commonLinks.slice(1), 
  ];

  if (isLoggedIn && role === "admin") {
    finalLinks.splice(4, 0, adminLinks[0]); 
  }
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

  const [books, setBooks] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);


  const [filterCategory, setFilterCategory] = useState("");
  const [filterTitle, setFilterTitle] = useState("");
  const [filterAuthor, setFilterAuthor] = useState("");
  const [recentOnly, setRecentOnly] = useState(false);


  const debouncedTitle = useDebounce(filterTitle, 300);
  const debouncedAuthor = useDebounce(filterAuthor, 300);


  const [toast, setToast] = useState(null);


  const [showRequestModal, setShowRequestModal] = useState(false);
  const [requestForm, setRequestForm] = useState({
    title: "",
    author: "",
    category: "", 
    message: "",
  });
  const [requestLoading, setRequestLoading] = useState(false);

  // Fetch books and categories
  useEffect(() => {
    setLoading(true);
    Promise.all([axios.get("/books"), axios.get("/categories")])
      .then(([booksRes, catRes]) => {
        console.log("Books data:", booksRes.data);
        console.log("Categories data:", catRes.data);
        setBooks(booksRes.data);
        setCategories(catRes.data);
      })
      .catch((error) => {
        console.error("Error fetching data:", error);
        setToast({ type: "error", msg: "Failed to load books or categories." });
      })
      .finally(() => setLoading(false));
  }, []);

  // Set category from navigation state if present
  useEffect(() => {
    if (location.state && location.state.category) {
      setFilterCategory(location.state.category);
    }
  }, [location.state]);

  // Filtered books
  const filteredBooks = books
    .filter((book) => !filterCategory || book.category === filterCategory)
    .filter(
      (book) =>
        !debouncedTitle ||
        book.title.toLowerCase().includes(debouncedTitle.toLowerCase())
    )
    .filter(
      (book) =>
        !debouncedAuthor ||
        book.author.toLowerCase().includes(debouncedAuthor.toLowerCase())
    )
    .sort((a, b) => {
      if (recentOnly) {
        return new Date(b.createdAt) - new Date(a.createdAt);
      }
      return 0;
    });

  // Toast auto-hide
  useEffect(() => {
    if (toast) {
      const t = setTimeout(() => setToast(null), 3000);
      return () => clearTimeout(t);
    }
  }, [toast]);

  // Book Request Submit
  const handleRequestSubmit = async (e) => {
    e.preventDefault();
    if (!requestForm.title.trim() || !requestForm.category) {
      setToast({ type: "error", msg: "Book title and category are required." });
      return;
    }
    setRequestLoading(true);
    try {
      const token = localStorage.getItem('token');
      await axios.post(
        '/requests/upload',
        {
          title: requestForm.title,
          author: requestForm.author,
          category: requestForm.category, 
          additionalNotes: requestForm.message,
        },
        token ? { headers: { Authorization: `Bearer ${token}` } } : {}
      );
      setShowRequestModal(false);
      setRequestForm({ title: "", author: "", category: "", message: "" });
      setToast({ type: "success", msg: "Request submitted successfully" });
    } catch (err) {
      setToast({ type: "error", msg: "Failed to submit request." });
    } finally {
      setRequestLoading(false);
    }
  };

  // Handle PDF Download
  const handleDownload = async (bookId) => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        setToast({ type: 'error', msg: 'You need to login to download books' });
        return;
      }

     
      const bookToDownload = books.find(book => book._id === bookId);
      
      if (!bookToDownload) {
        throw new Error('Book not found in local data');
      }

      
      let pdfFile = bookToDownload.fileUrl || bookToDownload.file || bookToDownload.pdfFilename;
      if (!pdfFile) throw new Error('This book is missing PDF file information');

     
      await axios.post(
        '/downloads',
        { bookId: bookId }, 
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

     
      const response = await axios.get(
        `http://localhost:5000${pdfFile}`,
        { responseType: 'blob' }
      );

      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `${bookToDownload.title.replace(/[^a-z0-9]/gi, '_')}.pdf`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);

      setToast({
        msg: `Downloading "${bookToDownload.title}"...`,
        type: 'success'
      });

    } catch (error) {
      console.error("Download error:", error);
      let errorMsg = "Failed to download book";
      
      if (error.response) {
        errorMsg = error.response.data.error || errorMsg;
      } else if (error.message) {
        errorMsg = error.message;
      }

      setToast({
        msg: errorMsg,
        type: 'error'
      });
    }
  };




  const clearFilters = () => {
    setFilterCategory("");
    setFilterTitle("");
    setFilterAuthor("");
    setRecentOnly(false);
  };

  return (
    <>
      {/* Navbar */}
      <nav className="flex items-center justify-between p-3 shadow-md bg-[#8B4513] text-[#FAEBD7] z-30 ">
        <div className="flex items-center space-x-2 m-2">
          <img
            src={inkdropLogo}
            alt="Logo"
            className="h-22 w-22 rounded-full border-2 border-[#FAEBD7] hover:scale-105 transition-transform duration-500 hover:shadow-lg"
          />
        </div>
        <div className="flex justify-end gap-4">
          <Link to="/">
            <img
              src={homelogo}
              alt="Home"
              className="w-10 h-10 rounded-full p-1 hover:bg-[#A0522D] cursor-pointer"
            />
          </Link>
          <Link to="/about">
            <img
              src={aboutlogo}
              alt="About"
              className="w-10 h-10 rounded-full p-1 hover:bg-[#A0522D] cursor-pointer"
            />
          </Link>
          <button
            onClick={() => setSidebarOpen(true)}
            className="focus:outline-none"
          >
            <img
              src={hamberglogo}
              alt="Menu"
              className="w-10 h-10 rounded-full p-1 hover:bg-[#A0522D] cursor-pointer"
            />
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
          sidebarOpen
            ? "translate-x-0 -translate-y-1/2"
            : "translate-x-full -translate-y-1/2"
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
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M6 18L18 6M6 6l12 12"
            />
          </svg>
        </button>
        <div className="flex flex-col items-center justify-center p-4 h-full overflow-y-auto">
          <div className="relative px-4 w-full">
            <div className="absolute -inset-1.5 bg-[#FFF5CC] rounded-lg border-2 border-black transform -rotate-2 z-0"></div>
            <div className="relative z-10 text-center">
              <p
                className="text-xl font-extrabold text-[#2E2E2E] drop-shadow-sm"
                style={{ fontFamily: FONT.header }}
              >
                Fuel Your Flow
              </p>
              <p
                className="text-sm text-[#444] mt-2"
                style={{ fontFamily: FONT.body }}
              >
                {isLoggedIn
                  ? `Hello, ${auth.user?.username}`
                  : "Login to track and triumph"}
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

      {/* Toast */}
      {toast && (
        <div
          className={`fixed top-20 right-6 z-50 px-6 py-3 rounded shadow-lg font-semibold text-white animate-fadeIn ${
            toast.type === "success" ? "bg-[#E97451]" : "bg-[#CD5C5C]"
          }`}
          style={{ fontFamily: FONT.ui }}
        >
          {toast.msg}
        </div>
      )}

      {/* Filters */}
      <section className="max-w-5xl mx-auto px-4 py-8">
        <div className="flex flex-col md:flex-row md:items-end gap-4 mb-8">
          <div className="flex flex-col flex-1">
            <label
              className="font-semibold mb-1"
              style={{ fontFamily: FONT.ui }}
            >
              Category
            </label>
            <select
              className="p-2 rounded border border-[#CDB79E] focus:outline-none"
              style={{ fontFamily: FONT.body }}
              value={filterCategory}
              onChange={(e) => setFilterCategory(e.target.value)}
            >
              <option value="">All Categories</option>
              {categories.map((cat) => (
                <option key={cat._id || cat.name} value={cat.name}>
                  {cat.name}
                </option>
              ))}
            </select>
          </div>
          <div className="flex flex-col flex-1">
            <label
              className="font-semibold mb-1"
              style={{ fontFamily: FONT.ui }}
            >
              Title
            </label>
            <input
              type="text"
              className="p-2 rounded border border-[#CDB79E] focus:outline-none"
              style={{ fontFamily: FONT.body }}
              placeholder="Search by title"
              value={filterTitle}
              onChange={(e) => setFilterTitle(e.target.value)}
            />
          </div>
          <div className="flex flex-col flex-1">
            <label
              className="font-semibold mb-1"
              style={{ fontFamily: FONT.ui }}
            >
              Author
            </label>
            <input
              type="text"
              className="p-2 rounded border border-[#CDB79E] focus:outline-none"
              style={{ fontFamily: FONT.body }}
              placeholder="Search by author"
              value={filterAuthor}
              onChange={(e) => setFilterAuthor(e.target.value)}
            />
          </div>
          <div className="flex flex-col items-center">
            <label
              className="font-semibold mb-1"
              style={{ fontFamily: FONT.ui }}
            >
              Recently Added
            </label>
            <input
              type="checkbox"
              className="w-6 h-6 accent-[#E97451] border-[#CDB79E] rounded"
              checked={recentOnly}
              onChange={(e) => setRecentOnly(e.target.checked)}
            />
          </div>
        </div>
        {(filterCategory || filterTitle || filterAuthor || recentOnly) && (
          <button
            className="mb-6 px-4 py-2 bg-[#E97451] text-white rounded hover:bg-[#A0522D] transition-all font-semibold"
            style={{ fontFamily: FONT.ui }}
            onClick={clearFilters}
          >
            Clear Filters
          </button>
        )}
      </section>

      {/* Book Cards */}
      <section className="max-w-6xl mx-auto px-4 pb-16">
        {loading ? (
          <div className="flex justify-center items-center h-64">
            <svg
              className="animate-spin mr-2"
              width="32"
              height="32"
              viewBox="0 0 24 24"
              fill="none"
              stroke="#E97451"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <circle cx="12" cy="12" r="10" strokeOpacity="0.25" />
              <path d="M22 12a10 10 0 0 1-10 10" />
            </svg>
            <span
              className="text-[#E97451] font-bold"
              style={{ fontFamily: FONT.ui }}
            >
              Loading books...
            </span>
          </div>
        ) : filteredBooks.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-64">
            <div className="bg-[#FAEBD7] border border-[#CDB79E] rounded-xl shadow p-8 flex flex-col items-center">
              <span
                className="text-2xl font-bold mb-2"
                style={{ color: COLOR.heading, fontFamily: FONT.header }}
              >
                No books found.
              </span>
              <button
                className="mt-4 px-6 py-2 bg-[#E97451] text-white rounded-lg font-bold text-lg hover:bg-[#A0522D] transition-all"
                style={{ fontFamily: FONT.ui }}
                onClick={() => setShowRequestModal(true)}
              >
                Request a Book
              </button>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-8">
            {filteredBooks.map((book) => (
              <div
                key={book._id}
                className="bg-[#FAEBD7] p-5 rounded-lg hover:scale-105 transition-transform duration-500 hover:shadow-lg border border-[#CDB79E] flex flex-col"
              >
                <img
                  src={`http://localhost:5000${book.coverImageUrl || '/default-cover.png'}`}
                  alt={book.title}
                  className="object-cover w-full h-48 rounded-lg mb-4"
                  style={{ background: "#fff" }}
                  onError={e => {
                    if (!e.target.src.endsWith('default-cover.png')) {
                      e.target.onerror = null; // Prevent infinite loop
                      e.target.src = '/default-cover.png';
                    }
                  }}
                />

                <h2
                  className="text-xl text-[#2E2E2E] font-bold mb-1"
                  style={{ fontFamily: FONT.subheading }}
                >
                  {book.title}
                </h2>
                <p
                  className="text-md font-semibold"
                  style={{ fontFamily: FONT.ui }}
                >
                  Author: {book.author}
                </p>
                <p
                  className="text-sm font-semibold"
                  style={{ fontFamily: FONT.ui }}
                >
                  Category: {book.category}
                </p>
                <p
                  className="text-xs text-[#707070] mb-2"
                  style={{ fontFamily: FONT.body }}
                >
                  Uploaded: {new Date(book.createdAt).toLocaleDateString()}
                </p>

                {/* Updated Download Button */}
                <button
                  onClick={() => handleDownload(book._id)}
                  className={`mt-auto px-4 py-2 rounded font-semibold text-center ${
                    book.file || book.pdfFilename || book.fileUrl
                      ? 'bg-[#E97451] text-white hover:bg-[#A0522D] cursor-pointer'
                      : 'bg-gray-400 text-gray-700 cursor-not-allowed'
                  } transition-all`}
                  style={{ fontFamily: FONT.ui }}
                  disabled={!book.file && !book.pdfFilename && !book.fileUrl}
                >
                  {book.file || book.pdfFilename || book.fileUrl ? 'Download PDF' : 'Unavailable'}
                </button>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* Book Request Modal */}
      {showRequestModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40">
          <div className="bg-[#FAEBD7] rounded-xl shadow-lg p-8 max-w-md w-full border border-[#CDB79E] relative">
            <button
              className="absolute top-3 right-3 text-[#2E2E2E] hover:scale-110 transition"
              onClick={() => setShowRequestModal(false)}
              aria-label="Close"
            >
              <svg
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill="none"
                stroke="#2E2E2E"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <line x1="18" y1="6" x2="6" y2="18" />
                <line x1="6" y1="6" x2="18" y2="18" />
              </svg>
            </button>
            <h2
              className="text-xl font-bold mb-4"
              style={{ color: COLOR.heading, fontFamily: FONT.header }}
            >
              Request a Book
            </h2>
            <form
              className="flex flex-col gap-4"
              onSubmit={handleRequestSubmit}
            >
              <div>
                <label
                  className="block font-semibold mb-1"
                  style={{ fontFamily: FONT.ui }}
                >
                  Book Title <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  className="p-2 rounded border border-[#CDB79E] focus:outline-none w-full"
                  style={{ fontFamily: FONT.body }}
                  value={requestForm.title}
                  onChange={(e) =>
                    setRequestForm((f) => ({ ...f, title: e.target.value }))
                  }
                  required
                />
              </div>
              <div>
                <label
                  className="block font-semibold mb-1"
                  style={{ fontFamily: FONT.ui }}
                >
                  Author Name
                </label>
                <input
                  type="text"
                  className="p-2 rounded border border-[#CDB79E] focus:outline-none w-full"
                  style={{ fontFamily: FONT.body }}
                  value={requestForm.author}
                  onChange={(e) =>
                    setRequestForm((f) => ({ ...f, author: e.target.value }))
                  }
                />
              </div>
              <div>
                <label
                  className="block font-semibold mb-1"
                  style={{ fontFamily: FONT.ui }}
                >
                  Category <span className="text-red-500">*</span>
                </label>
                <select
                  className="p-2 rounded border border-[#CDB79E] focus:outline-none w-full"
                  style={{ fontFamily: FONT.body }}
                  value={requestForm.category}
                  onChange={e => setRequestForm(f => ({ ...f, category: e.target.value }))}
                  required
                >
                  <option value="">Select a category</option>
                  {categories.map(cat => (
                    <option key={cat._id || cat.name} value={cat.name}>
                      {cat.name}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label
                  className="block font-semibold mb-1"
                  style={{ fontFamily: FONT.ui }}
                >
                  Message
                </label>
                <textarea
                  className="p-2 rounded border border-[#CDB79E] focus:outline-none w-full"
                  style={{ fontFamily: FONT.body }}
                  value={requestForm.message}
                  onChange={(e) =>
                    setRequestForm((f) => ({ ...f, message: e.target.value }))
                  }
                  rows={3}
                />
              </div>
              <button
                type="submit"
                className="mt-2 px-6 py-2 bg-[#E97451] text-white rounded-lg font-bold text-lg hover:bg-[#A0522D] transition-all"
                style={{ fontFamily: FONT.ui }}
                disabled={requestLoading}
              >
                {requestLoading ? "Submitting..." : "Submit Request"}
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Footer (copied from Home.jsx) */}
      <footer className="w-full bg-[#8B4513] text-[#FAEBD7] font-sans">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 w-full p-10">
          {/* Designer Info */}
          <div>
            <h1
              className="text-lg font-bold"
              style={{ fontFamily: '"Bitter", serif' }}
            >
              Designed By :-
              <ul>
                <li className="text-md font-medium pl-4 py-1.5">
                  Harshit Singh
                </li>
                <li className="text-md font-medium pl-4 pt-1">Rudra Tiwari</li>
                <li className="text-md font-medium pl-4 py-2">Ansh Mishra</li>
              </ul>
            </h1>
          </div>
          {/* Quick Links */}
          <div>
            <h3
              className="text-lg font-semibold mb-4 underline"
              style={{ fontFamily: '"Bitter", serif' }}
            >
              Quick Links
            </h3>
            <ul className="space-y-2 list-disc pl-7">
              <li>
                <Link
                  to="/"
                  className="hover:text-[#E97451] text-[#FAEBD7]"
                  style={{ fontFamily: '"Libertinus Mono", monospace' }}
                >
                  Home
                </Link>
              </li>
              {isLoggedIn && (
                <>
                  <li>
                    <Link
                      to={
                        role === "admin" ? "/dashboardAdmin" : "/userdashbord"
                      }
                      className="hover:text-[#E97451] text-[#FAEBD7]"
                      style={{ fontFamily: '"Libertinus Mono", monospace' }}
                    >
                      Dashboard
                    </Link>
                  </li>
                  <li>
                    <Link
                      to="/discover"
                      className="hover:text-[#E97451] text-[#FAEBD7]"
                      style={{ fontFamily: '"Libertinus Mono", monospace' }}
                    >
                      Discover
                    </Link>
                  </li>
                  <li>
                    <Link
                      to="/library"
                      className="hover:text-[#E97451] text-[#FAEBD7]"
                      style={{ fontFamily: '"Libertinus Mono", monospace' }}
                    >
                      Library
                    </Link>
                  </li>
                  <li>
                    <Link
                      to="/contact"
                      className="hover:text-[#E97451] text-[#FAEBD7]"
                      style={{ fontFamily: '"Libertinus Mono", monospace' }}
                    >
                      Contact Us
                    </Link>
                  </li>
                </>
              )}
              {/* Always show */}
              <li>
                <Link
                  to="/about"
                  className="hover:text-[#E97451] text-[#FAEBD7]"
                  style={{ fontFamily: '"Libertinus Mono", monospace' }}
                >
                  About Us
                </Link>
              </li>
            </ul>
          </div>
          {/* Documents */}
          <div>
            <h3
              className="text-lg font-semibold mb-4 underline"
              style={{ fontFamily: '"Bitter", serif' }}
            >
              Related Documents
            </h3>
            <ul className="space-y-2 list-disc pl-7">
              <li>
                <a
                  href="#"
                  className=" hover:text-[#E97451] text-[#FAEBD7]"
                  style={{ fontFamily: '"Libertinus Mono", monospace' }}
                >
                  Licensing Information
                </a>
              </li>
              <li>
                <a
                  href="#"
                  className=" hover:text-[#E97451] text-[#FAEBD7]"
                  style={{ fontFamily: '"Libertinus Mono", monospace' }}
                >
                  Privacy Policy
                </a>
              </li>
            </ul>
          </div>
          {/* Newsletter & Quote */}
          <div className="md:col-span-3 mt-8">
            <div className="text-center mb-4">
              <p className="text-sm italic">
                Empowering curious minds with free knowledge, one download at a
                time.
              </p>
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
          {/* Social Icons */}
          <div className="md:col-span-3 mt-6">
            <div className="flex gap-5 justify-center md:justify-start">
              {/* X */}
              <a
                href=""
                target="_blank"
                rel="noopener noreferrer"
                className="hover:opacity-80 text-[#FAEBD7]"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  fill="currentColor"
                  className="w-6 h-6"
                  viewBox="0 0 24 24"
                >
                  <path d="M22.25 2H1.75C.78 2 0 2.78 0 3.75v16.5C0 21.22.78 22 1.75 22h20.5c.97 0 1.75-.78 1.75-1.75V3.75C24 2.78 23.22 2 22.25 2Zm-5.95 13.32h-1.9l-2.59-3.5-2.99 3.5H7.01l3.84-4.48L7.5 7.09h1.89l2.3 2.95 2.55-2.95h1.94l-3.78 4.27 3.7 4.96Z" />
                </svg>
              </a>
              {/* Instagram */}
              <a
                href=""
                target="_blank"
                rel="noopener noreferrer"
                className="hover:opacity-80 text-[#FAEBD7]"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  fill="currentColor"
                  className="w-6 h-6"
                  viewBox="0 0 24 24"
                >
                  <path d="M7.75 2h8.5A5.75 5.75 0 0 1 22 7.75v8.5A5.75 5.75 0 0 1 16.25 22h-8.5A5.75 5.75 0 0 1 2 16.25v-8.5A5.75 5.75 0 0 1 7.75 2Zm0 1.5A4.25 4.25 0 0 0 3.5 7.75v8.5A4.25 4.25 0 0 0 7.75 20.5h8.5a4.25 4.25 0 0 0 4.25-4.25v-8.5A4.25 4.25 0 0 0 16.25 3.5h-8.5Zm8 2.25a.75.75 0 1 1 0 1.5h-.008a.75.75 0 0 1 0-1.5H15.75ZM12 7a5 5 0 1 1 0 10 5 5 0 0 1 0-10Zm0 1.5a3.5 3.5 0 1 0 0 7 3.5 3.5 0 0 0 0-7Z" />
                </svg>
              </a>
              {/* Facebook */}
              <a
                href=""
                target="_blank"
                rel="noopener noreferrer"
                className="hover:opacity-80 text-[#FAEBD7]"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  fill="currentColor"
                  className="w-6 h-6"
                  viewBox="0 0 24 24"
                >
                  <path d="M13.5 3.001h3.75V.082A48.255 48.255 0 0 0 13.61 0c-3.555 0-5.988 2.167-5.988 6.155v3.45H4.5v4.487h3.122V24h4.492v-9.908h3.598l.571-4.487h-4.17V6.613c0-1.299.35-2.185 2.387-2.185Z" />
                </svg>
              </a>
              {/* LinkedIn */}
              <a
                href=""
                target="_blank"
                rel="noopener noreferrer"
                className="hover:opacity-80 text-[#FAEBD7]"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  fill="currentColor"
                  className="w-6 h-6"
                  viewBox="0 0 24 24"
                >
                  <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
                </svg>
              </a>
            </div>
          </div>
        </div>
        <hr className="border-[#2E2E2E] mx-4" />
        {/* Back to Top */}
        <div className="w-full py-4 text-center relative">
          <p className="text-sm text-[#FAEBD7]">
            © 2025 InkDrop. All rights reserved.
          </p>
          <button
            onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
            className="absolute right-6 top-2 px-3 py-2 bg-[#E97451] hover:bg-[#d8623d] text-white rounded-full shadow-md transition-all duration-200"
          >
            ↑ Top
          </button>
        </div>
      </footer>
    </>
  );
};

export default Discover;
