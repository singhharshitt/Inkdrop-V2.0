import React, { useState, useRef, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";

import axios from "../api/axios";
import inkdropLogo from "../assets/Inkdrop.png";
import homelogo from "../assets/home.png";
import hamberglogo from "../assets/hamburger.png";
import aboutlogo from "../assets/info.png";
import { useAuth } from "../context/AuthContext";


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

const UploadBookAdmin = () => {
  
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const sidebarRef = useRef(null);
  const { auth, logout } = useAuth();
  const { isLoggedIn, user } = auth;
  const role = user?.role;
  const navigate = useNavigate();

  const commonLinks = [
    { name: "Home", path: "/" },
    { name: "Discover", path: "/discover" },
    { name: "My Library", path: "/library" },
    { name: "Contact Us", path: "/contact" },
    { name: "About Us", path: "/about" },
  ];

  const adminLinks = [
    { name: "Upload (Admin)", path: "/upload" },
    { name: "Dashboard", path: "/dashboardAdmin" },
  ];

  const getFinalLinks = () => {
    const dashboardLink = {
      name: "Dashboard",
      path: role === "admin" ? "/dashboardAdmin" : "/userdashbord",
    };

    const links = [commonLinks[0], dashboardLink, ...commonLinks.slice(1)];

    if (isLoggedIn && role === "admin") {
      links.splice(2, 0, adminLinks[0]);
    }

    return links;
  };

  const finalLinks = getFinalLinks();

  // Upload form state
  const [formData, setFormData] = useState({
    title: "",
    author: "",
    category: "",
    description: "",
    cover: null,
    pdf: null,
  });

  const [categories, setCategories] = useState([]);
  const [showAddCategory, setShowAddCategory] = useState(false);
  const [newCategory, setNewCategory] = useState("");
  const [uploading, setUploading] = useState(false);
  const [toast, setToast] = useState(null);

  const [requests, setRequests] = useState([]);
  const [loadingRequests, setLoadingRequests] = useState(true);
  const [requestActionLoading, setRequestActionLoading] = useState(null);
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  
const handleFileChange = (e) => {
  const { name, files } = e.target;
  setFormData((prev) => ({
    ...prev,
    [name]: files[0], 
  }));
};

  
  useEffect(() => {
    const fetchInitialData = async () => {
      try {
        const [categoriesRes, requestsRes] = await Promise.all([
          axios.get("/admin/categories"),
          axios.get("/admin/requests"),
        ]);

        setCategories(categoriesRes.data);
        setRequests(requestsRes.data);
      } catch (error) {
        console.error("Initial data load failed:", error);
        setToast({
          type: "error",
          msg: "Failed to load categories or requests.",
        });
      } finally {
        setLoadingRequests(false);
      }
    };

    fetchInitialData();
  }, []);


 const handleUpload = async (e) => {
  e.preventDefault();

  const { title, author, category, description, cover, pdf } = formData;

  
  if (
    !title.trim() ||
    !author.trim() ||
    !category.trim() ||
    !description.trim() ||
    !cover ||
    !pdf
  ) {
    setToast({ type: "error", msg: "All fields are required." });
    return;
  }

  setUploading(true);

  try {
    const formDataToSend = new FormData();

    
    formDataToSend.append("title", title);
    formDataToSend.append("author", author);
    formDataToSend.append("category", category);
    formDataToSend.append("description", description);

    
    formDataToSend.append("cover", cover); 
    formDataToSend.append("pdf", pdf);    

    
    const token = localStorage.getItem("token");

   
    await axios.post("/admin/upload", formDataToSend, {
      headers: {
        "Content-Type": "multipart/form-data",
        Authorization: `Bearer ${token}`, 
      },
    });

    setToast({ type: "success", msg: "Book uploaded successfully!" });

 
    setFormData({
      title: "",
      author: "",
      category: "",
      description: "",
      cover: null,
      pdf: null,
    });

  } catch (error) {
    console.error("Upload error:", error);
    setToast({
      type: "error",
      msg: error.response?.data?.message || "Upload failed. Please try again.",
    });
  } finally {
    setUploading(false);
  }
};


  const handleAddCategory = async (e) => {
    e.preventDefault();

    if (!newCategory.trim()) {
      setToast({ type: "error", msg: "Category name is required" });
      return;
    }

    try {
      const { data } = await axios.post("/admin/categories", {
        name: newCategory,
      });

      setCategories((prev) => [...prev, data]);
      setFormData((prev) => ({ ...prev, category: data.name }));
      setNewCategory("");
      setShowAddCategory(false);
      setToast({ type: "success", msg: "Category added!" });
    } catch (error) {
      console.error("Category creation error:", error);
      setToast({
        type: "error",
        msg: error.response?.data?.message || "Something went wrong",
      });
    }
  };

 
  const handleRequestAction = async (id, status) => {
    setRequestActionLoading(id + status);

    try {
      await axios.patch(`/admin/requests/${id}`, { status });
      setRequests((prev) =>
        prev.map((r) => (r._id === id ? { ...r, status } : r))
      );
      setToast({ type: "success", msg: `Request marked as ${status}.` });
    } catch (error) {
      console.error("Request action error:", error);
      setToast({
        type: "error",
        msg: error.response?.data?.message || "Failed to update request.",
      });
    } finally {
      setRequestActionLoading(null);
    }
  };

  

  return (
    <div
      className="min-h-screen flex flex-col"
      style={{ background: COLOR.bg }}
    >
      {/* Navbar */}
      <nav className="flex items-center justify-between p-3 shadow-md bg-[#8B4513] text-[#FAEBD7] z-30 sticky top-0">
        <div className="flex items-center space-x-2 m-2">
          <img
            src={inkdropLogo}
            alt="Logo"
            className="h-22 w-22 rounded-full border-2 border-[#FAEBD7] hover:scale-105 transition-transform duration-500 hover:shadow-lg"
          />
        </div>
        <div className="flex justify-end gap-4">
          <Link to="/" aria-label="Home">
            <img
              src={homelogo}
              alt="Home"
              className="w-10 h-10 rounded-full p-1 hover:bg-[#A0522D] cursor-pointer"
            />
          </Link>
          <Link to="/about" aria-label="About">
            <img
              src={aboutlogo}
              alt="About"
              className="w-10 h-10 rounded-full p-1 hover:bg-[#A0522D] cursor-pointer"
            />
          </Link>
          <button
            onClick={() => setSidebarOpen(true)}
            className="focus:outline-none"
            aria-label="Open menu"
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
          role="presentation"
        />
      )}

      {/* Sidebar */}
      <div
        ref={sidebarRef}
        className={`fixed top-1/2 right-0 w-64 bg-[#FAEBD7] shadow-xl flex flex-col transition-all duration-300 ease-in-out z-50 rounded-l-lg border-l-2 border-t-2 border-b-2 border-[#2E2E2E] transform ${sidebarOpen
            ? "translate-x-0 -translate-y-1/2"
            : "translate-x-full -translate-y-1/2"
          }`}
        style={{ maxHeight: "80vh" }}
        aria-hidden={!sidebarOpen}
      >
        <button
          className="absolute top-3 right-3 text-[#2E2E2E] hover:scale-110 transition"
          onClick={() => setSidebarOpen(false)}
          aria-label="Close sidebar"
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
            <div className="absolute -inset-1.5 bg-[#FFF5CC] rounded-lg border-2 border-black transform -rotate-2 z-0" />
            <div className="relative z-10 text-center">
              <p
                className="text-xl font-extrabold text-[#2E2E2E] drop-shadow-sm"
                style={{ fontFamily: FONT.header }}
              >
                {role === "admin" ? "Admin Control" : "Fuel Your Flow"}
              </p>
              <p
                className="text-sm text-[#444] mt-2"
                style={{ fontFamily: FONT.body }}
              >
                {isLoggedIn ? `Hello, ${user?.username}` : "Login to manage"}
              </p>
            </div>
          </div>

          <div className="w-full px-4 space-y-2 mt-4 flex-grow flex flex-col items-center justify-center">
            {isLoggedIn ? (
              <>
                <div className="w-full space-y-2">
                  {finalLinks.map((link) => (
                    <Link
                      to={link.path}
                      key={link.name}
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
      <main className="flex-1 w-full max-w-4xl mx-auto px-4 py-8">
        {/* Toast/Alert */}
        {toast && (
          <div
            className={`fixed top-20 right-6 z-50 px-6 py-3 rounded shadow-lg font-semibold text-white animate-fadeIn ${toast.type === "success" ? "bg-[#E97451]" : "bg-[#CD5C5C]"
              }`}
            style={{ fontFamily: FONT.ui }}
            role="alert"
          >
            {toast.msg}
          </div>
        )}

        {/* Upload Form */}
        <section className="mb-12 bg-[#FFFFFF] rounded-xl shadow p-8 border border-[#CDB79E]">
          <h2
            className="text-2xl font-bold mb-6"
            style={{ color: COLOR.heading, fontFamily: FONT.header }}
          >
            Upload New Book
          </h2>
          <form className="flex flex-col gap-5" onSubmit={handleUpload}>
            <div className="flex flex-col gap-1">
              <label
                htmlFor="title"
                className="font-semibold text-[#2E2E2E]"
                style={{ fontFamily: FONT.ui }}
              >
                Book Title
              </label>
              <input
                type="text"
                id="title"
                name="title"
                className="p-2 rounded border border-[#CDB79E] focus:outline-none"
                style={{ fontFamily: FONT.body }}
                value={formData.title}
                onChange={handleInputChange}
                required
              />
            </div>

            <div className="flex flex-col gap-1">
              <label
                htmlFor="author"
                className="font-semibold text-[#2E2E2E]"
                style={{ fontFamily: FONT.ui }}
              >
                Author
              </label>
              <input
                type="text"
                id="author"
                name="author"
                className="p-2 rounded border border-[#CDB79E] focus:outline-none"
                style={{ fontFamily: FONT.body }}
                value={formData.author}
                onChange={handleInputChange}
                required
              />
            </div>

            <div className="flex flex-col gap-1">
              <label
                htmlFor="category"
                className="font-semibold text-[#2E2E2E]"
                style={{ fontFamily: FONT.ui }}
              >
                Category
              </label>
              <div className="flex gap-2 items-center">
                <select
                  id="category"
                  name="category"
                  className="p-2 rounded border border-[#CDB79E] focus:outline-none flex-1"
                  style={{ fontFamily: FONT.body }}
                  value={formData.category}
                  onChange={handleInputChange}
                  required
                >
                  <option value="">Select category</option>
                  {categories.map((cat) => (
                    <option key={cat._id || cat.name} value={cat.name}>
                      {cat.name}
                    </option>
                  ))}
                </select>
                <button
                  type="button"
                  className="px-3 py-2 bg-[#E97451] text-white rounded hover:bg-[#A0522D] transition-all font-semibold"
                  style={{ fontFamily: FONT.ui }}
                  onClick={() => setShowAddCategory(true)}
                  aria-label="Add new category"
                >
                  <svg
                    width="16"
                    height="16"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="#8B4513"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <line x1="12" y1="5" x2="12" y2="19" />
                    <line x1="5" y1="12" x2="19" y2="12" />
                  </svg>
                </button>
              </div>
            </div>

            {showAddCategory && (
              <div className="flex gap-2 mt-2">
                <input
                  type="text"
                  className="p-2 rounded border border-[#CDB79E] focus:outline-none flex-1"
                  style={{ fontFamily: FONT.body }}
                  value={newCategory}
                  onChange={(e) => setNewCategory(e.target.value)}
                  placeholder="New category"
                  required
                />
                <button
                  className="px-3 py-2 bg-[#E97451] text-white rounded hover:bg-[#A0522D] transition-all font-semibold"
                  style={{ fontFamily: FONT.ui }}
                  onClick={handleAddCategory}
                >
                  Add
                </button>
                <button
                  type="button"
                  className="px-3 py-2 bg-[#FAEBD7] text-[#CD5C5C] border border-[#CDB79E] rounded hover:bg-[#CD5C5C] hover:text-white transition-all font-semibold"
                  style={{ fontFamily: FONT.ui }}
                  onClick={() => setShowAddCategory(false)}
                  aria-label="Cancel adding category"
                >
                  <svg
                    width="16"
                    height="16"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="#CD5C5C"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <circle cx="12" cy="12" r="10" />
                    <line x1="4.93" y1="4.93" x2="19.07" y2="19.07" />
                  </svg>
                </button>
              </div>
            )}

            <div className="flex flex-col gap-1">
              <label
                htmlFor="description"
                className="font-semibold text-[#2E2E2E]"
                style={{ fontFamily: FONT.ui }}
              >
                Description
              </label>
              <textarea
                id="description"
                name="description"
                className="p-2 rounded border border-[#CDB79E] focus:outline-none"
                style={{ fontFamily: FONT.body }}
                value={formData.description}
                onChange={handleInputChange}
                rows={3}
                required
              />
            </div>

            <div className="flex flex-col gap-1">
              <label
                htmlFor="cover"
                className="font-semibold text-[#2E2E2E]"
                style={{ fontFamily: FONT.ui }}
              >
                Cover Image
              </label>
              <input
                type="file"
                id="cover"
                name="cover"
                accept="image/*"
                className="p-2 rounded border border-[#CDB79E] focus:outline-none"
                style={{ fontFamily: FONT.body }}
                onChange={handleFileChange}
                required
              />
            </div>

            <div className="flex flex-col gap-1">
              <label
                htmlFor="pdf"
                className="font-semibold text-[#2E2E2E]"
                style={{ fontFamily: FONT.ui }}
              >
                PDF File
              </label>
              <input
                type="file"
                id="pdf"
                name="pdf"
                accept="application/pdf"
                className="p-2 rounded border border-[#CDB79E] focus:outline-none"
                style={{ fontFamily: FONT.body }}
                onChange={handleFileChange}
                required
              />
            </div>

            <button
              type="submit"
              className="mt-4 px-6 py-3 bg-[#E97451] text-white rounded-lg font-bold text-lg flex items-center justify-center gap-2 hover:bg-[#A0522D] transition-all"
              style={{ fontFamily: FONT.ui }}
              disabled={uploading}
            >
              {uploading ? (
                <svg
                  className="animate-spin"
                  width="20"
                  height="20"
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
              ) : (
                <svg
                  width="20"
                  height="20"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="#FAEBD7"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                  <polyline points="17 8 12 3 7 8" />
                  <line x1="12" y1="3" x2="12" y2="15" />
                </svg>
              )}
              {uploading ? "Uploading..." : "Upload Book"}
            </button>
          </form>
        </section>

        {/* Requested Books Panel */}
        <section className="mb-12 bg-[#FFFFFF] rounded-xl shadow p-8 border border-[#CDB79E]">
          <h2
            className="text-2xl font-bold mb-6"
            style={{ color: COLOR.heading, fontFamily: FONT.header }}
          >
            Requested Books
          </h2>

          {loadingRequests ? (
            <div
              className="flex justify-center items-center h-32 text-[#E97451] font-bold"
              style={{ fontFamily: FONT.ui }}
            >
              <svg
                className="animate-spin mr-2"
                width="20"
                height="20"
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
              Loading requests...
            </div>
          ) : requests.length === 0 ? (
            <div
              className="text-[#707070] text-center"
              style={{ fontFamily: FONT.body }}
            >
              No requests found.
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {requests.map((req, idx) => (
                <div
                  key={req._id || req.id || idx}
                  className="bg-[#FAEBD7] rounded-xl shadow p-6 border border-[#CDB79E] flex flex-col gap-2 group hover:shadow-lg transition-all"
                >
                  <div className="flex items-center justify-between">
                    <span
                      className="text-lg font-bold"
                      style={{
                        color: COLOR.heading,
                        fontFamily: FONT.subheading,
                      }}
                    >
                      {req.title}
                    </span>
                    <span
                      className={`px-2 py-1 rounded-full text-xs font-semibold ${req.status === "pending"
                          ? "bg-[#E97451] text-white"
                          : req.status === "fulfilled"
                            ? "bg-green-500 text-white"
                            : "bg-[#CD5C5C] text-white"
                        }`}
                      style={{ fontFamily: FONT.ui }}
                    >
                      {req.status}
                    </span>
                  </div>

                  <span
                    className="text-[#707070] text-sm"
                    style={{ fontFamily: FONT.body }}
                  >
                    {req.category}
                  </span>

                  <span
                    className="text-[#444] text-xs"
                    style={{ fontFamily: FONT.body }}
                  >
                    Requested: {new Date(req.date).toLocaleString()}
                  </span>

                  {req.user && (
                    <span
                      className="text-[#444] text-xs"
                      style={{ fontFamily: FONT.body }}
                    >
                      By: {req.user}
                    </span>
                  )}

                  <div className="flex gap-2 mt-2">
                    <button
                      className="px-3 py-1 bg-green-500 text-white rounded hover:bg-green-600 transition-all font-semibold flex items-center gap-1"
                      style={{ fontFamily: FONT.ui }}
                      disabled={requestActionLoading === req.id + "fulfilled"}
                      onClick={() => handleRequestAction(req.id, "fulfilled")}
                    >
                      {requestActionLoading === req.id + "fulfilled" ? (
                        <svg
                          className="animate-spin"
                          width="16"
                          height="16"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="#fff"
                          strokeWidth="2"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        >
                          <circle cx="12" cy="12" r="10" strokeOpacity="0.25" />
                          <path d="M22 12a10 10 0 0 1-10 10" />
                        </svg>
                      ) : (
                        <svg
                          width="16"
                          height="16"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="#fff"
                          strokeWidth="2"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        >
                          <polyline points="20 6 9 17 4 12" />
                        </svg>
                      )}
                      Fulfilled
                    </button>

                    <button
                      className="px-3 py-1 bg-[#CD5C5C] text-white rounded hover:bg-red-700 transition-all font-semibold flex items-center gap-1"
                      style={{ fontFamily: FONT.ui }}
                      disabled={requestActionLoading === req.id + "declined"}
                      onClick={() => handleRequestAction(req.id, "declined")}
                    >
                      {requestActionLoading === req.id + "declined" ? (
                        <svg
                          className="animate-spin"
                          width="16"
                          height="16"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="#fff"
                          strokeWidth="2"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        >
                          <circle cx="12" cy="12" r="10" strokeOpacity="0.25" />
                          <path d="M22 12a10 10 0 0 1-10 10" />
                        </svg>
                      ) : (
                        <svg
                          width="16"
                          height="16"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="#fff"
                          strokeWidth="2"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        >
                          <circle cx="12" cy="12" r="10" />
                          <line x1="4.93" y1="4.93" x2="19.07" y2="19.07" />
                        </svg>
                      )}
                      Declined
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>
      </main>
    </div>
  );
};

export default UploadBookAdmin;
