import React, { useState, useRef, useEffect, useMemo } from "react";
import { Link, useNavigate } from "react-router-dom";
import axios from "../api/axios";
import inkdropLogo from '../assets/Inkdrop.png';
import homelogo from '../assets/home.png';
import hamberglogo from '../assets/hamburger.png';
import aboutlogo from '../assets/info.png';
import { useAuth } from "../context/AuthContext";
import { commonLinks, adminLinks } from "../constants/links";

const categories = ["All", "Technology", "Fiction", "Science", "Biography", "Philosophy"];
const sortOptions = ["Recent", "Popular", "A–Z"];

export default function Library() {
  const { auth, logout } = useAuth();
  const isLoggedIn = auth.isLoggedIn;
  const role = auth?.user?.role;
  const navigate = useNavigate();
  
  // State for books data
  const [books, setBooks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // UI state
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const sidebarRef = useRef(null);
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("All");
  const [sort, setSort] = useState("Recent");
  const [view, setView] = useState("grid");
  const [removedBookIds, setRemovedBookIds] = useState([]);
  const [toast, setToast] = useState(null);

  // Fetch user's downloaded books with improved polling
  useEffect(() => {
    let intervalId;
    let isMounted = true;
    let retryCount = 0;
    const maxRetries = 3;

    const fetchLibraryData = async () => {
      if (!isMounted) return;
      
      try {
        const token = localStorage.getItem('token');
        if (!token) {
          navigate('/login');
          return;
        }

        const response = await axios.get('/api/downloads/my-downloads', {
          headers: { Authorization: `Bearer ${token}` },
          params: { t: Date.now() } // Cache busting
        });

        if (isMounted) {
          const sortedBooks = response.data
            .filter(download => download.book)
            .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
            .map(download => ({
              ...download.book,
              downloadedAt: download.createdAt // Preserve download timestamp
            }));

          setBooks(prevBooks => {
            // Only update if books have actually changed
            if (JSON.stringify(prevBooks) !== JSON.stringify(sortedBooks)) {
              return sortedBooks;
            }
            return prevBooks;
          });
          
          setLoading(false);
          retryCount = 0; // Reset retry count on success
        }
      } catch (err) {
        if (isMounted) {
          if (retryCount < maxRetries) {
            retryCount++;
            console.warn(`Fetch failed, retrying (${retryCount}/${maxRetries})...`);
            return;
          }
          
          setError(err.response?.data?.message || 'Failed to load library');
          setLoading(false);
        }
      }
    };

    // Initial fetch immediately
    fetchLibraryData();
    
    // Then poll every 3 seconds (reduced from 5s for better responsiveness)
    intervalId = setInterval(fetchLibraryData, 3000);
    
    return () => {
      isMounted = false;
      clearInterval(intervalId);
    };
  }, [navigate, auth.user?.id]); // Add auth.user?.id as dependency

  // Filter and sort books with useMemo for optimization
  const filteredBooks = useMemo(() => {
    return books.filter(book => {
      const matchesSearch = book.title.toLowerCase().includes(search.toLowerCase()) || 
                          book.author.toLowerCase().includes(search.toLowerCase());
      const matchesCategory = category === "All" || book.category === category;
      return matchesSearch && matchesCategory;
    });
  }, [books, search, category]);

  const sortedBooks = useMemo(() => {
    return [...filteredBooks].sort((a, b) => {
      if (sort === "A-Z") return a.title.localeCompare(b.title);
      if (sort === "Popular") return (b.likes || 0) - (a.likes || 0);
      return new Date(b.downloadedAt || b.createdAt) - new Date(a.downloadedAt || a.createdAt);
    });
  }, [filteredBooks, sort]);

  // Section books
  // Remove duplicates and filter out removed books
  const uniqueBooksMap = new Map();
  for (const book of sortedBooks) {
    if (!uniqueBooksMap.has(book._id)) {
      uniqueBooksMap.set(book._id, book);
    }
  }
  const downloadedBooks = Array.from(uniqueBooksMap.values()).filter(
    (b) => !removedBookIds.includes(b._id)
  );
  const recommendedBooks = useMemo(() => {
    // Improved recommendation logic - prioritize books from same category
    if (books.length === 0) return [];
    
    const userCategories = books.reduce((acc, book) => {
      acc[book.category] = (acc[book.category] || 0) + 1;
      return acc;
    }, {});
    
    const favoriteCategory = Object.keys(userCategories).length > 0 
      ? Object.keys(userCategories).reduce((a, b) => userCategories[a] > userCategories[b] ? a : b)
      : 'Technology'; // Default category
      
    return books
      .filter(book => book.category === favoriteCategory)
      .sort((a, b) => (b.likes || 0) - (a.likes || 0))
      .slice(0, 4);
  }, [books]);

  // Handle book actions
  const handleBookAction = (bookId, action, section) => {
    if (section === 'recommended' && action === 'download') {
      navigate('/discover');
      return;
    }
    if (action === 'remove') {
      setRemovedBookIds((prev) => prev.includes(bookId) ? prev : [...prev, bookId]);
      return;
    }
    if (action === 'read') {
      setToast({
        type: 'info',
        msg: 'You can check this book in your local downloads.'
      });
      return;
    }
   
  };

  // Sidebar links based on role
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

  // Toast auto-hide
  useEffect(() => {
    if (toast) {
      const t = setTimeout(() => setToast(null), 3000);
      return () => clearTimeout(t);
    }
  }, [toast]);

  if (loading) {
    return (
      <div className="min-h-screen bg-[#FAEBD7] flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#E97451] mx-auto"></div>
          <p className="mt-4 text-[#8B4513]">Loading your library...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-[#FAEBD7] flex items-center justify-center">
        <div className="text-center p-6 bg-white rounded-lg shadow-md max-w-md">
          <p className="text-red-500 mb-4">{error}</p>
          <button 
            onClick={() => window.location.reload()}
            className="px-4 py-2 bg-[#E97451] text-white rounded hover:bg-[#A0522D]"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#FAEBD7] flex flex-col">
      {/* Toast */}
      {toast && (
        <div
          className={`fixed top-20 right-6 z-50 px-6 py-3 rounded shadow-lg font-semibold text-white animate-fadeIn ${
            toast.type === 'info' ? 'bg-[#E97451]' : 'bg-[#CD5C5C]'
          }`}
          style={{ fontFamily: 'Open Sans, sans-serif' }}
        >
          {toast.msg}
        </div>
      )}
      {/* Navbar */}
      <nav className="flex items-center justify-between p-3 shadow-md bg-[#8B4513] text-[#FAEBD7] z-30">
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

      {/* Sidebar */}
      {sidebarOpen && (
        <div className="fixed inset-0 z-40 backdrop-blur-sm bg-opacity-1 transition-all duration-300" onClick={() => setSidebarOpen(false)}></div>
      )}
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
          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
        <div className="flex flex-col items-center justify-center p-4 h-full overflow-y-auto">
          <div className="relative px-4 w-full">
            <div className="absolute -inset-1.5 bg-[#FFF5CC] rounded-lg border-2 border-black transform -rotate-2 z-0"></div>
            <div className="relative z-10 text-center">
              <p className="text-xl font-extrabold text-[#2E2E2E] drop-shadow-sm" style={{ fontFamily: 'Libertinus Mono, monospace' }}>
                Fuel Your Flow
              </p>
              <p className="text-sm text-[#444] mt-2" style={{ fontFamily: 'Poppins, sans-serif' }}>
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
                      style={{ fontFamily: 'Poppins, sans-serif' }}
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
                  style={{ fontFamily: 'Poppins, sans-serif' }}
                >
                  Logout
                </button>
              </>
            ) : (
              <div className="w-full flex flex-col items-center justify-center">
                <Link
                  to="/login"
                  className="w-full px-6 py-2 bg-[#E97451] text-white font-semibold rounded-full border-2 border-black hover:bg-[#d9623c] transition-all duration-200 shadow-lg hover:shadow-xl hover:-translate-y-1 text-center"
                  style={{ fontFamily: 'Poppins, sans-serif' }}
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
        {/* Search & Filter Bar */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-8 bg-white rounded-xl shadow p-6 border border-[#CDB79E]">
          <div className="flex-1 flex items-center gap-3">
            <input
              type="text"
              placeholder="Search by title, author, or keyword..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="flex-1 p-3 rounded-lg border border-[#CDB79E] bg-[#FAEBD7] text-[#2E2E2E] focus:outline-none focus:ring-2 focus:ring-[#E97451] font-sans text-base"
              style={{ fontFamily: 'Nunito, sans-serif' }}
            />
            <select
              value={category}
              onChange={e => setCategory(e.target.value)}
              className="p-3 rounded-lg border border-[#CDB79E] bg-[#FAEBD7] text-[#2E2E2E] focus:outline-none font-sans text-base"
              style={{ fontFamily: 'Open Sans, sans-serif' }}
            >
              {categories.map(cat => (
                <option key={cat} value={cat}>{cat}</option>
              ))}
            </select>
            <select
              value={sort}
              onChange={e => setSort(e.target.value)}
              className="p-3 rounded-lg border border-[#CDB79E] bg-[#FAEBD7] text-[#2E2E2E] focus:outline-none font-sans text-base"
              style={{ fontFamily: 'Open Sans, sans-serif' }}
            >
              {sortOptions.map(opt => (
                <option key={opt} value={opt}>{opt}</option>
              ))}
            </select>
          </div>
          <div className="flex gap-2 mt-3 md:mt-0">
            <button
              className={`px-4 py-2 rounded-lg font-semibold transition-all duration-200 shadow-sm border border-[#CDB79E] ${view === 'grid' ? 'bg-[#E97451] text-white' : 'bg-[#FAEBD7] text-[#2E2E2E] hover:bg-[#A0522D] hover:text-white'}`}
              style={{ fontFamily: 'Open Sans, sans-serif' }}
              onClick={() => setView('grid')}
            >
              Grid
            </button>
            <button
              className={`px-4 py-2 rounded-lg font-semibold transition-all duration-200 shadow-sm border border-[#CDB79E] ${view === 'list' ? 'bg-[#E97451] text-white' : 'bg-[#FAEBD7] text-[#2E2E2E] hover:bg-[#A0522D] hover:text-white'}`}
              style={{ fontFamily: 'Open Sans, sans-serif' }}
              onClick={() => setView('list')}
            >
              List
            </button>
          </div>
        </div>

        {/* Book Sections */}
        <BookSection 
          title="Downloaded Books" 
          books={downloadedBooks} 
          view={view} 
          emptyMessage="No books downloaded yet. Explore books in the Discover section!"
          onAction={(bookId, action) => handleBookAction(bookId, action, 'downloaded')}
        />

        {downloadedBooks.length > 0 && (
          <BookSection 
            title="Recommended for You" 
            books={recommendedBooks} 
            view="grid" 
            emptyMessage="Download more books to get better recommendations!"
            onAction={(bookId, action) => handleBookAction(bookId, action, 'recommended')}
            isRecommendation
          />
        )}
      </main>

      {/* Footer */}
      <Footer />
    </div>
  );
}

// Reusable Book Section Component
const BookSection = ({ title, books, view, emptyMessage, onAction, isRecommendation }) => (
  <section className="mb-10">
    <h2 className="text-3xl font-extrabold mb-4 text-[#8B4513]" style={{ fontFamily: 'Libertinus Mono, monospace' }}>
      {title}
    </h2>
    {books.length === 0 ? (
      <div className="bg-white p-6 rounded-lg shadow border border-[#CDB79E]">
        <p className="text-[#707070]" style={{ fontFamily: 'Nunito, sans-serif' }}>{emptyMessage}</p>
        {isRecommendation && (
          <Link 
            to="/discover" 
            className="mt-4 inline-block px-4 py-2 bg-[#E97451] text-white rounded hover:bg-[#A0522D] transition"
            style={{ fontFamily: 'Open Sans, sans-serif' }}
          >
            Discover Books
          </Link>
        )}
      </div>
    ) : view === 'grid' ? (
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
        {books.map((book, idx) => (
          <BookCard 
            key={`${book._id}-${title.replace(/\s/g, '')}-${idx}`} 
            book={book} 
            onAction={onAction}
            isRecommendation={isRecommendation}
          />
        ))}
      </div>
    ) : (
      <div className="flex flex-col gap-4">
        {books.map((book, idx) => (
          <BookListItem 
            key={`${book._id}-${title.replace(/\s/g, '')}-${idx}`} 
            book={book} 
            onAction={onAction}
          />
        ))}
      </div>
    )}
  </section>
);

// Book Card Component (Grid View)
const BookCard = ({ book, onAction, isRecommendation }) => {
  const [imageError, setImageError] = useState(false);

  return (
    <div className="bg-white rounded-xl shadow-md p-4 flex flex-col items-center border border-[#CDB79E] hover:shadow-lg transition-all duration-300 group h-full">
      <img 
        src={imageError ? '/default-cover.png' : (book.coverImageUrl || '/default-cover.png')} 
        alt={book.title} 
        className="w-32 h-44 object-cover rounded-lg mb-3 shadow group-hover:scale-105 transition-transform duration-300"
        onError={() => setImageError(true)}
      />
      <div className="flex-1 flex flex-col">
        <h3 className="text-lg font-bold text-[#2E2E2E] mb-1 text-center" style={{ fontFamily: 'Bitter, serif' }}>
          {book.title}
        </h3>
        <p className="text-sm text-[#707070] mb-2 text-center" style={{ fontFamily: 'Nunito, sans-serif' }}>
          {book.author}
        </p>
        {isRecommendation && (
          <div className="flex items-center justify-center gap-2 mb-2">
            <span className="text-xs bg-[#FAEBD7] text-[#8B4513] px-2 py-1 rounded-full border border-[#CDB79E]" style={{ fontFamily: 'Open Sans, sans-serif' }}>
              {book.format || 'PDF'}
            </span>
            <span className="text-xs bg-[#FAEBD7] text-[#8B4513] px-2 py-1 rounded-full border border-[#CDB79E]" style={{ fontFamily: 'Open Sans, sans-serif' }}>
              {book.category || 'General'}
            </span>
          </div>
        )}
      </div>
      <div className="flex gap-2 mt-2 w-full justify-center">
        <button 
          onClick={() => onAction(book._id, isRecommendation ? 'download' : 'read')}
          className="px-3 py-1 bg-[#E97451] text-white rounded-full font-semibold text-xs hover:bg-[#A0522D] transition-all duration-200 w-full max-w-[120px]" 
          style={{ fontFamily: 'Open Sans, sans-serif' }}
        >
          {isRecommendation ? 'Download' : 'Read now'}
        </button>
        {!isRecommendation && (
          <button 
            onClick={() => onAction(book._id, 'remove')}
            className="px-3 py-1 bg-[#FAEBD7] text-[#8B4513] border border-[#CDB79E] rounded-full font-semibold text-xs hover:bg-[#CD5C5C] hover:text-white transition-all duration-200 w-full max-w-[120px]" 
            style={{ fontFamily: 'Open Sans, sans-serif' }}
          >
            Remove
          </button>
        )}
      </div>
    </div>
  );
};

// Book List Item Component (List View)
const BookListItem = ({ book, onAction }) => {
  const [imageError, setImageError] = useState(false);

  return (
    <div className="bg-white rounded-xl shadow-md p-4 flex items-center border border-[#CDB79E] hover:shadow-lg transition-all duration-300 group">
      <img 
        src={imageError ? '/default-cover.png' : (book.coverImageUrl || '/default-cover.png')} 
        alt={book.title} 
        className="w-20 h-28 object-cover rounded-lg mr-4 shadow group-hover:scale-105 transition-transform duration-300"
        onError={() => setImageError(true)}
      />
      <div className="flex-1">
        <h3 className="text-lg font-bold text-[#2E2E2E] mb-1" style={{ fontFamily: 'Bitter, serif' }}>
          {book.title}
        </h3>
        <p className="text-sm text-[#707070] mb-2" style={{ fontFamily: 'Nunito, sans-serif' }}>
          {book.author} • {book.category || 'General'} • {book.format || 'PDF'}
        </p>
        <p className="text-xs text-[#707070]" style={{ fontFamily: 'Nunito, sans-serif' }}>
          Downloaded: {new Date(book.downloadedAt || book.createdAt).toLocaleDateString()}
        </p>
      </div>
      <div className="flex gap-2">
        <button 
          onClick={() => onAction(book._id, 'read')}
          className="px-3 py-1 bg-[#E97451] text-white rounded-full font-semibold text-xs hover:bg-[#A0522D] transition-all duration-200" 
          style={{ fontFamily: 'Open Sans, sans-serif' }}
        >
          Open
        </button>
        <button 
          onClick={() => onAction(book._id, 'remove')}
          className="px-3 py-1 bg-[#FAEBD7] text-[#8B4513] border border-[#CDB79E] rounded-full font-semibold text-xs hover:bg-[#CD5C5C] hover:text-white transition-all duration-200" 
          style={{ fontFamily: 'Open Sans, sans-serif' }}
        >
          Remove
        </button>
      </div>
    </div>
  );
};

// Footer Component
const Footer = () => (
  <footer className="w-full bg-[#8B4513] text-[#FAEBD7] font-sans mt-10">
    <div className="grid grid-cols-1 md:grid-cols-3 gap-8 w-full p-10">
      <div>
        <h1 className="text-lg font-bold" style={{ fontFamily: 'Bitter, serif' }}>
          Designed By:
          <ul>
            <li className="text-md font-medium pl-4 py-1.5">Harshit Singh</li>
            <li className="text-md font-medium pl-4 pt-1">Rudra Tiwari</li>
            <li className="text-md font-medium pl-4 py-2">Ansh Mishra</li>
          </ul>
        </h1>
      </div>
      <div>
        <h3 className="text-lg font-semibold mb-4 underline" style={{ fontFamily: 'Bitter, serif' }}>Quick Links</h3>
        <ul className="space-y-2 list-disc pl-7">
          <li><Link to="/" className="hover:text-[#E97451] text-[#FAEBD7]" style={{ fontFamily: 'Libertinus Mono, monospace' }}>Home</Link></li>
          <li><Link to="/discover" className="hover:text-[#E97451] text-[#FAEBD7]" style={{ fontFamily: 'Libertinus Mono, monospace' }}>Discover</Link></li>
          <li><Link to="/about" className="hover:text-[#E97451] text-[#FAEBD7]" style={{ fontFamily: 'Libertinus Mono, monospace' }}>About Us</Link></li>
          <li><Link to="/contact" className="hover:text-[#E97451] text-[#FAEBD7]" style={{ fontFamily: 'Libertinus Mono, monospace' }}>Contact Us</Link></li>
        </ul>
      </div>
      <div>
        <h3 className="text-lg font-semibold mb-4 underline" style={{ fontFamily: 'Bitter, serif' }}>Related Documents</h3>
        <ul className="space-y-2 list-disc pl-7">
          <li><Link to="/privacy" className="hover:text-[#E97451] text-[#FAEBD7]" style={{ fontFamily: 'Libertinus Mono, monospace' }}>Privacy Policy</Link></li>
          <li><Link to="/terms" className="hover:text-[#E97451] text-[#FAEBD7]" style={{ fontFamily: 'Libertinus Mono, monospace' }}>Terms of Service</Link></li>
        </ul>
      </div>
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
      <div className="md:col-span-3 mt-6">
        <div className="flex gap-5 justify-center md:justify-start">
          {/* Social icons would go here */}
        </div>
      </div>
    </div>
    <hr className="border-[#2E2E2E] mx-4" />
    <div className="w-full py-4 text-center relative">
      <p className="text-sm text-[#FAEBD7]">© {new Date().getFullYear()} InkDrop. All rights reserved.</p>
      <button
        onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
        className="absolute right-6 top-2 px-3 py-2 bg-[#E97451] hover:bg-[#d8623d] text-white rounded-full shadow-md transition-all duration-200"
      >
        ↑ Top
      </button>
    </div>
  </footer>
);