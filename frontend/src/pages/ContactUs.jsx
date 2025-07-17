import { useState, useRef, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import inkdropLogo from "../assets/Inkdrop.png";
import homelogo from "../assets/home.png";
import aboutlogo from "../assets/info.png";
import hamberglogo from "../assets/hamburger.png";
import MagnetLines from "../components/MagnetLines";
import { commonLinks, adminLinks } from "../constants/links";

export default function ContactUs() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const sidebarRef = useRef(null);
  const { auth, logout } = useAuth();
  const isLoggedIn = auth?.isLoggedIn;
  const role = auth?.user?.role;
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    message: ''
  });
  const [finalLinks, setFinalLinks] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    const dashboardLink = {
      name: "Dashboard",
      path: role === "admin" ? "/dashboardAdmin" : "/userdashbord",
    };

    const links = [
      commonLinks[0],      
      dashboardLink,       
      ...commonLinks.slice(1),  
    ];

    if (isLoggedIn && role === "admin") {
      links.splice(4, 0, adminLinks[0]); 
    }

    setFinalLinks(links);
  }, [isLoggedIn, role]);

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

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    if (!formData.name || !formData.email || !formData.message) {
      alert("Please fill all fields");
      return;
    }

    if (!/^\S+@\S+\.\S+$/.test(formData.email)) {
      alert("Please enter a valid email address");
      return;
    }

    console.log("Form submitted:", formData);
    setFormData({
      name: "",
      email: "",
      message: ""
    });
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#FAEBD7] relative overflow-x-hidden">
      {/* Background Animation */}
      <div className="absolute inset-0 z-0">
        <MagnetLines
          rows={9}
          columns={9}
          containerSize="100%"
          lineColor="rgba(233, 116, 81, 0.3)"
          lineWidth="1vmin"
          lineHeight="3.5vmin"
          baseAngle={0}
        />
      </div>

      {/* Navigation */}
      <nav className="flex items-center justify-between p-3 shadow-md bg-[#8B4513] text-[#FAEBD7] z-30 top-0">
        {/* Logo */}
        <div className="flex items-center space-x-2 m-2">
          <img
            src={inkdropLogo}
            alt="Logo"
            className="h-22 w-22 rounded-full border-2 border-[#FAEBD7] hover:scale-105 transition-transform duration-500 hover:shadow-lg"
          />
        </div>

        {/* Right Icons */}
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
          <button onClick={() => setSidebarOpen(true)} className="focus:outline-none">
            <img
              src={hamberglogo}
              alt="Menu"
              className="w-10 h-10 rounded-full p-1 hover:bg-[#A0522D] cursor-pointer"
            />
          </button>
        </div>
      </nav>

      {/* Blur Overlay - Only shown when sidebar is open */}
      {sidebarOpen && (
        <div 
          className="fixed inset-0 z-40 backdrop-blur-sm bg-opacity-1 transition-all duration-300"
          onClick={() => setSidebarOpen(false)}
        ></div>
      )}

      {/* Sidebar */}
      <div
        ref={sidebarRef}
        className={`fixed top-0 right-0 h-full w-64 bg-[#FAEBD7] shadow-xl flex flex-col transition-all duration-300 ease-in-out z-50 rounded-l-lg border-l-2 border-t-2 border-b-2 border-[#2E2E2E]`}
        style={{ 
          top: '50%',
          transform: sidebarOpen 
            ? 'translateY(-50%) translateX(0)' 
            : 'translateY(-50%) translateX(100%)'
        }}
      >
        {/* Close Button */}
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

        {/* Sidebar Content Container with centered items */}
        <div className="flex flex-col items-center justify-center p-4 h-full overflow-y-auto">
          {/* Header */}
          <div className="relative px-4 w-full">
            <div className="absolute -inset-1.5 bg-[#FFF5CC] rounded-lg border-2 border-black transform -rotate-2 z-0"></div>
            <div className="relative z-10 text-center">
              <p
                className="text-xl font-extrabold text-[#2E2E2E] drop-shadow-sm"
                style={{ fontFamily: '"Libertinus Mono", monospace' }}
              >
                Fuel Your Flow
              </p>
              <p className="text-sm text-[#444] mt-2" style={{ fontFamily: "Poppins, sans-serif" }}>
                {isLoggedIn ? `Hello, ${auth.user?.username}` : "Login to track and triumph"}
              </p>
            </div>
          </div>

          {/* Sidebar Links - Centered in the available space */}
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
                  to="/login"
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
      <main className="flex-grow flex items-center justify-center p-4 z-10 relative">
        <div className="w-full max-w-4xl bg-white rounded-xl shadow-2xl overflow-hidden my-16 md:my-8">
          <div className="flex flex-col md:flex-row">
            {/* Left Section - Decorative */}
            <div className="w-full md:w-1/4 bg-[#8B4513] text-white flex flex-col items-center justify-center p-6">
              <div className="text-center">
                <h3 className="text-xl font-bold mb-2" style={{ fontFamily: '"Libertinus Mono", monospace' }}>
                  Get in Touch
                </h3>
                <p className="text-sm" style={{ fontFamily: "Poppins, sans-serif" }}>
                  We'd love to hear from you!
                </p>
              </div>
              <div className="mt-8 w-24 h-24 rounded-full bg-[#E97451] flex items-center justify-center shadow-lg">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-12 w-12 text-white"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                  />
                </svg>
              </div>
            </div>

            {/* Right Section - Contact Form */}
            <div className="w-full md:w-3/4 p-6 md:p-8">
              <h1 
                className="text-3xl md:text-4xl lg:text-5xl font-extrabold text-center mb-2" 
                style={{ fontFamily: '"Winky Rough", cursive' }}
              >
                CONTACT <span className="text-[#E97451]">US</span>
              </h1>
              <h2 
                className="text-base md:text-lg font-semibold text-[#2E2E2E] mb-6 text-center" 
                style={{ fontFamily: '"Bitter", serif' }}
              >
                "Your feedback writes our next chapter"
              </h2>
              
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
                    Your Name
                  </label>
                  <input
                    type="text"
                    id="name"
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    placeholder="Enter your name"
                    className="w-full p-3 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-[#8B4513]"
                    required
                  />
                </div>
                
                <div>
                  <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                    Your Email
                  </label>
                  <input
                    type="email"
                    id="email"
                    name="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    placeholder="Enter your email"
                    className="w-full p-3 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-[#8B4513]"
                    required
                  />
                </div>
                
                <div>
                  <label htmlFor="message" className="block text-sm font-medium text-gray-700 mb-1">
                    Your Message
                  </label>
                  <textarea
                    id="message"
                    name="message"
                    rows="4"
                    value={formData.message}
                    onChange={handleInputChange}
                    placeholder="Type your message here..."
                    className="w-full p-3 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-[#8B4513]"
                    required
                  ></textarea>
                </div>
                
                <button
                  type="submit"
                  className="w-full bg-[#E97451] text-white py-3 font-bold rounded hover:bg-[#CD5C5C] transition duration-300 shadow-md hover:shadow-lg"
                >
                  Send Message
                </button>
              </form>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}