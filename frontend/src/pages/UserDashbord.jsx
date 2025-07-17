import React, { useState, useRef, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import axios from "../api/axios";
import inkdropLogo from '../assets/Inkdrop.png';
import homelogo from '../assets/home.png';
import hamberglogo from '../assets/hamburger.png';
import aboutlogo from '../assets/info.png';
import man1 from '../assets/man1.jpg';
import { useAuth } from "../context/AuthContext";
import { commonLinks, adminLinks } from "../constants/links";

export default function UserDashboard() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const sidebarRef = useRef(null);
  const { auth, logout } = useAuth();
  const isLoggedIn = auth.isLoggedIn;
  const role = auth?.user?.role;
  const navigate = useNavigate();

  // Sidebar 
  const dashboardLink = {
    name: "Dashboard",
    path: role === "admin" ? "/dashboardAdmin" : "/userdashboard",
  };

  const finalLinks = [
    commonLinks[0],
    dashboardLink,
    ...commonLinks.slice(1),
  ];

  if (isLoggedIn && role === "admin") {
    finalLinks.splice(4, 0, adminLinks[0]);
  }

  // Sidebar click outside handler
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

  // User data state with real-time updates
  const [userData, setUserData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [lastUpdated, setLastUpdated] = useState(null);

 
  const [downloadedBooks, setDownloadedBooks] = useState([]);

  // Fetch user data with polling
  useEffect(() => {
    let isMounted = true;
    let intervalId;

    const fetchUserData = async () => {
      try {
        const token = localStorage.getItem('token');
        if (!token) {
          navigate('/login');
          return;
        }

        const response = await axios.get('/dashboard', {
          headers: { Authorization: `Bearer ${token}` },
          params: { t: Date.now() } 
        });

        if (isMounted) {
          setUserData(response.data);
          setLastUpdated(new Date());
          setError(null);
        }
      } catch (err) {
        if (isMounted) {
          setError(err.response?.data?.message || 'Failed to load dashboard data');
          setUserData(null);
        }
      } finally {
        if (isMounted) setLoading(false);
      }
    };

   
    fetchUserData();
    

    intervalId = setInterval(fetchUserData, 3000);

    return () => {
      isMounted = false;
      clearInterval(intervalId);
    };
  }, [navigate, auth.user?.id]);


  useEffect(() => {
    let isMounted = true;
    let intervalId;
    const fetchDownloads = async () => {
      try {
        const token = localStorage.getItem('token');
        if (!token) return;
        const response = await axios.get('/downloads/my-downloads', {
          headers: { Authorization: `Bearer ${token}` },
          params: { t: Date.now() }
        });
        if (isMounted) {
          
          const uniqueMap = new Map();
          response.data
            .filter(d => d.book)
            .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
            .forEach(d => {
              if (!uniqueMap.has(d.book._id)) {
                uniqueMap.set(d.book._id, {
                  ...d.book,
                  downloadedAt: d.createdAt
                });
              }
            });
          setDownloadedBooks(Array.from(uniqueMap.values()));
        }
      } catch (err) {
        
      }
    };
    fetchDownloads();
    intervalId = setInterval(fetchDownloads, 3000);
    return () => {
      isMounted = false;
      clearInterval(intervalId);
    };
  }, [navigate, auth.user?.id]);

  
  const [userRequests, setUserRequests] = useState([]);

  
  useEffect(() => {
    let isMounted = true;
    let intervalId;
    const fetchRequests = async () => {
      try {
        const token = localStorage.getItem('token');
        if (!token) return;
        const response = await axios.get('/requests/myrequests', {
          headers: { Authorization: `Bearer ${token}` },
          params: { t: Date.now() }
        });
        if (isMounted) setUserRequests(response.data);
      } catch (err) {
        
      }
    };
    fetchRequests();
    intervalId = setInterval(fetchRequests, 3000);
    return () => {
      isMounted = false;
      clearInterval(intervalId);
    };
  }, [navigate, auth.user?.id]);

 
  const defaultUserData = {
    booksDownloaded: 0,
    requestsMade: 0,
    lastLogin: new Date().toISOString(),
    recentlyDownloaded: [],
    savedBooks: [],
    readBooks: [],
    requestStatus: "N/A",
    notifications: [],
    categories: ["Technology", "Fiction", "Science", "Biography", "Philosophy"]
  };

  
  const {
    booksDownloaded = 0,
    requestsMade = 0,
    lastLogin,
    recentlyDownloaded = [],
    savedBooks = [],
    readBooks = [],
    requestStatus = "N/A",
    notificationsList = [],
    categories = defaultUserData.categories
  } = userData || defaultUserData;

  
  const formattedLastLogin = lastLogin ? new Date(lastLogin).toLocaleDateString() : "N/A";

  if (loading) {
    return (
      <div className="min-h-screen bg-[#FAEBD7] flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#E97451] mx-auto"></div>
          <p className="mt-4 text-[#8B4513]">Loading your dashboard...</p>
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
      <main className="flex-1 w-full max-w-6xl mx-auto px-4 py-8">
        {/* Welcome Header */}
        <div className="flex flex-col sm:flex-row items-center gap-6 mb-8">
          <Link to="/dashboard/profile">
            <img
              src={man1}
              alt="Profile"
              className="w-24 h-24 rounded-full border-4 border-[#E97451] shadow-md object-cover cursor-pointer"
            />
          </Link>
          <div className="flex-1">
            <h1 className="text-3xl md:text-4xl font-extrabold text-[#2E2E2E] mb-2" style={{ fontFamily: 'Libertinus Mono, monospace' }}>
              Welcome back, {auth?.user?.username}
            </h1>
            <p className="text-[#707070] text-base" style={{ fontFamily: 'Nunito, sans-serif' }}>
              Your personal reading dashboard
            </p>
            {lastUpdated && (
              <p className="text-xs text-[#8B4513] mt-1" style={{ fontFamily: 'Nunito, sans-serif' }}>
                Last updated: {lastUpdated.toLocaleString()}
              </p>
            )}
          </div>
        </div>

        {/* Personal Summary */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-10">
          <div className="bg-white rounded-xl shadow p-6 flex flex-col items-center border border-[#CDB79E] hover:shadow-lg transition-all duration-300">
            <span className="text-[#8B4513] text-2xl font-bold" style={{ fontFamily: 'Bitter, serif' }}>
              {downloadedBooks.length}
            </span>
            <span className="text-[#707070] text-sm" style={{ fontFamily: 'Nunito, sans-serif' }}>
              Books Downloaded
            </span>
          </div>
          <div className="bg-white rounded-xl shadow p-6 flex flex-col items-center border border-[#CDB79E] hover:shadow-lg transition-all duration-300">
            <span className="text-[#E97451] text-2xl font-bold" style={{ fontFamily: 'Bitter, serif' }}>
              {userRequests.length}
            </span>
            <span className="text-[#707070] text-sm" style={{ fontFamily: 'Nunito, sans-serif' }}>
              Requests Made
            </span>
          </div>
          <div className="bg-white rounded-xl shadow p-6 flex flex-col items-center border border-[#CDB79E] hover:shadow-lg transition-all duration-300">
            <span className="text-[#2E2E2E] text-lg font-semibold" style={{ fontFamily: 'Open Sans, sans-serif' }}>
              {formattedLastLogin}
            </span>
            <span className="text-[#707070] text-sm" style={{ fontFamily: 'Nunito, sans-serif' }}>
              Last Login
            </span>
          </div>
        </div>

        {/* Recently Downloaded Books */}
        <section className="mb-10">
          <h2 className="text-2xl font-bold mb-4 text-[#8B4513]" style={{ fontFamily: 'Bitter, serif' }}>
            Recently Downloaded Books
          </h2>
          {downloadedBooks.length === 0 ? (
            <div className="bg-white p-6 rounded-lg shadow border border-[#CDB79E] text-center">
              <p className="text-[#707070]" style={{ fontFamily: 'Nunito, sans-serif' }}>
                No books downloaded yet. Explore books in the Discover section!
              </p>
              <Link 
                to="/discover" 
                className="mt-4 inline-block px-4 py-2 bg-[#E97451] text-white rounded hover:bg-[#A0522D] transition"
                style={{ fontFamily: 'Open Sans, sans-serif' }}
              >
                Discover Books
              </Link>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
              {downloadedBooks.map((book) => (
                <div
                  key={book._id || book.id}
                  className="bg-white rounded-xl shadow-md p-4 flex flex-col items-center border border-[#CDB79E] hover:shadow-lg transition-all duration-300 group"
                >
                  <img
                    src={book.coverImageUrl || book.cover || '/default-cover.png'}
                    alt={book.title}
                    className="w-28 h-40 object-cover rounded-lg mb-3 shadow group-hover:scale-105 transition-transform duration-300"
                    onError={(e) => {
                      e.target.src = '/default-cover.png';
                      e.target.onerror = null;
                    }}
                  />
                  <h3 className="text-lg font-bold text-[#2E2E2E] mb-1" style={{ fontFamily: 'Bitter, serif' }}>
                    {book.title}
                  </h3>
                  <p className="text-sm text-[#707070]" style={{ fontFamily: 'Nunito, sans-serif' }}>
                    {book.author}
                  </p>
                  <div className="flex gap-2 mt-3">
                    <button
                      className="px-3 py-1 bg-[#E97451] text-white rounded-full font-semibold text-xs hover:bg-[#A0522D] transition-all duration-200"
                      style={{ fontFamily: 'Open Sans, sans-serif' }}
                      onClick={() => navigate(`/read/${book._id || book.id}`)}
                    >
                      Read Now
                    </button>
                    <button
                      className="px-3 py-1 bg-[#FAEBD7] text-[#8B4513] border border-[#CDB79E] rounded-full font-semibold text-xs hover:bg-[#CD5C5C] hover:text-white transition-all duration-200"
                      style={{ fontFamily: 'Open Sans, sans-serif' }}
                    >
                      Rate
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>

        {/* Saved Books */}
        
        {/* Browse by Category */}
        <section className="mb-10">
          <h2 className="text-2xl font-bold mb-4 text-[#8B4513]" style={{ fontFamily: 'Bitter, serif' }}>
            Browse by Category
          </h2>
          <div className="flex flex-wrap gap-4">
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => navigate('/discover', { state: { category: cat } })}
                className="px-6 py-3 bg-[#CDB79E] text-[#2E2E2E] rounded-lg font-semibold shadow hover:bg-[#E97451] hover:text-white transition-all duration-200"
                style={{ fontFamily: 'Open Sans, sans-serif' }}
              >
                {cat}
              </button>
            ))}
          </div>
        </section>

        {/* Requests Made */}
        <section className="mb-10">
          <h2 className="text-2xl font-bold mb-4 text-[#8B4513]" style={{ fontFamily: 'Bitter, serif' }}>
            Requests Made
          </h2>
          {userRequests.length > 0 ? (
            <div className="overflow-x-auto rounded-xl shadow border border-[#CDB79E] bg-[#FAEBD7]">
              <table className="min-w-full divide-y divide-[#CDB79E]">
                <thead>
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-bold uppercase" style={{ color: '#2E2E2E', fontFamily: 'Bitter, serif' }}>Title</th>
                    <th className="px-6 py-3 text-left text-xs font-bold uppercase" style={{ color: '#2E2E2E', fontFamily: 'Bitter, serif' }}>Category</th>
                    <th className="px-6 py-3 text-left text-xs font-bold uppercase" style={{ color: '#2E2E2E', fontFamily: 'Bitter, serif' }}>Date</th>
                    <th className="px-6 py-3 text-left text-xs font-bold uppercase" style={{ color: '#2E2E2E', fontFamily: 'Bitter, serif' }}>Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#CDB79E]">
                  {userRequests.map((req) => (
                    <tr key={req._id} className="hover:bg-[#E97451]/10 transition-all">
                      <td className="px-6 py-4 font-medium" style={{ color: '#2E2E2E', fontFamily: 'Nunito, sans-serif' }}>{req.title}</td>
                      <td className="px-6 py-4" style={{ color: '#707070', fontFamily: 'Nunito, sans-serif' }}>{req.category}</td>
                      <td className="px-6 py-4" style={{ color: '#707070', fontFamily: 'Nunito, sans-serif' }}>{new Date(req.createdAt).toLocaleString()}</td>
                      <td className="px-6 py-4" style={{ fontFamily: 'Open Sans, sans-serif' }}>
                        <span className={`px-2 py-1 rounded-full text-xs font-semibold ${
                          req.status === 'Pending' ? 'bg-[#E97451] text-white' :
                          req.status === 'Approved' ? 'bg-green-500 text-white' :
                          req.status === 'Rejected' ? 'bg-[#CD5C5C] text-white' :
                          'bg-gray-500 text-white'
                        }`}>
                          {req.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <p className="text-[#707070]" style={{ fontFamily: 'Nunito, sans-serif' }}>
              No requests found
            </p>
          )}
        </section>

        {/* Request New Book */}
        <section className="mb-10">
          <h2 className="text-2xl font-bold mb-4 text-[#8B4513]" style={{ fontFamily: 'Bitter, serif' }}>
            Request New Book
          </h2>
          <div className="flex flex-col sm:flex-row items-center gap-4">
            <Link
              to="/discover"
              className="px-6 py-3 bg-[#E97451] text-white rounded-lg font-semibold shadow hover:bg-[#A0522D] transition-all duration-200"
              style={{ fontFamily: 'Open Sans, sans-serif' }}
            >
              Request a Book
            </Link>
            <span
              className="px-4 py-2 bg-[#CDB79E] text-[#8B4513] rounded-full font-semibold text-xs shadow"
              style={{ fontFamily: 'Open Sans, sans-serif' }}
            >
              {requestStatus}
            </span>
          </div>
        </section>

        {/* Notifications */}
        {notificationsList.length > 0 && (
          <section className="mb-10">
            <h2 className="text-2xl font-bold mb-4 text-[#8B4513]" style={{ fontFamily: 'Bitter, serif' }}>
              Notifications
            </h2>
            <div className="space-y-3">
              {notificationsList.map((note) => (
                <div
                  key={note._id || note.id}
                  className={`p-4 rounded-lg border ${
                    note.type === 'info' 
                      ? 'bg-blue-50 border-blue-200' 
                      : 'bg-green-50 border-green-200'
                  }`}
                >
                  <p className="text-[#2E2E2E]" style={{ fontFamily: 'Nunito, sans-serif' }}>
                    {note.message}
                  </p>
                  {note.createdAt && (
                    <p className="text-xs text-[#707070] mt-1" style={{ fontFamily: 'Nunito, sans-serif' }}>
                      {new Date(note.createdAt).toLocaleString()}
                    </p>
                  )}
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Help & Support */}
        <section className="mb-10">
          <h2 className="text-2xl font-bold mb-4 text-[#8B4513]" style={{ fontFamily: 'Bitter, serif' }}>
            Help & Support
          </h2>
          <div className="flex gap-4 items-center">
            <Link
              to="/contact"
              className="px-6 py-3 bg-[#E97451] text-white rounded-lg font-semibold shadow hover:bg-[#A0522D] transition-all duration-200"
              style={{ fontFamily: 'Open Sans, sans-serif' }}
            >
              Contact Us
            </Link>
            <button
              className="px-6 py-3 bg-[#CDB79E] text-[#2E2E2E] rounded-lg font-semibold shadow hover:bg-[#E97451] hover:text-white transition-all duration-200 flex items-center gap-2"
              style={{ fontFamily: 'Open Sans, sans-serif' }}
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                className="w-5 h-5"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M8 10h.01M12 10h.01M16 10h.01M21 12c0 4.418-4.03 8-9 8s-9-3.582-9-8a9 9 0 1118 0z"
                />
              </svg>
              FAQ / Live Chat
            </button>
          </div>
        </section>
      </main>

      {/* Footer */}
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
    </div>
  );
}