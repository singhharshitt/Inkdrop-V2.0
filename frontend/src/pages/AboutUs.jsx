import React, { useRef, useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import inkdropLogo from "../assets/Inkdrop.png";
import homelogo from "../assets/home.png";
import hamberglogo from "../assets/hamburger.png";
import aboutlogo from "../assets/info.png";
import inkicon from "../assets/inkicon.png";
import MagnetLines from "../components/MagnetLines";
import aboutbook from "../assets/aboutbook.png";
import { commonLinks, adminLinks } from "../constants/links";


export default function AboutUs() {
 
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const sidebarRef = useRef(null);
  const { auth, logout } = useAuth();
  const isLoggedIn = auth.isLoggedIn;
  const role = auth?.user?.role;
  const navigate = useNavigate();

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
        className={`fixed top-1/2 right-0 w-64 bg-[#FAEBD7] shadow-xl flex flex-col transition-all duration-300 ease-in-out z-50 rounded-l-lg border-l-2 border-t-2 border-b-2 border-[#2E2E2E] transform ${
          sidebarOpen ? "translate-x-0 -translate-y-1/2" : "translate-x-full -translate-y-1/2"
        }`}
        style={{ maxHeight: "80vh" }}
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
        {/* Sidebar Content */}
        <div className="flex flex-col items-center justify-center p-4 h-full overflow-y-auto">
          {/* Header */}
          <div className="relative px-4 w-full">
            <div className="absolute -inset-1.5 bg-[#FFF5CC] rounded-lg border-2 border-black transform -rotate-2 z-0"></div>
            <div className="relative z-10 text-center">
              <p className="text-xl font-extrabold text-[#2E2E2E] drop-shadow-sm" style={{ fontFamily: '"Libertinus Mono", monospace' }}>
                Fuel Your Flow
              </p>
              <p className="text-sm text-[#444] mt-2" style={{ fontFamily: 'Poppins, sans-serif' }}>
                {isLoggedIn ? `Hello, ${auth.user?.username}` : "Login to track and triumph"}
              </p>
            </div>
          </div>
          {/* Sidebar Links */}
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

      <section className="relative bg-[#FAEBD7] h-screen w-full flex items-center justify-center overflow-hidden">
        {/* Background MagnetLines */}
        <div className="absolute inset-0 z-0 opacity-30">
          <MagnetLines
            rows={9}
            columns={9}
            containerSize="100%"
            lineColor="tomato"
            lineWidth="1vmin"
          lineHeight="3.5vmin"
            baseAngle={0}
          />
        </div>
        <div className="relative z-10 flex flex-col items-center justify-center text-center cursor-pointer">
          {/* Main heading */}
          <h2
            className="text-5xl sm:text-6xl md:text-7xl lg:text-8xl xl:text-8xl font-extrabold text-[#2E2E2E] mb-4 md:mb-6 relative "
            style={{ fontFamily: '"Winky Rough", cursive' }}
          >
            ABOUT <span className="text-[#E97451]">INKDROP</span>
          </h2>

          {/* Description paragraph */}
          <p
            className="text-sm sm:text-base md:text-md lg:text-md text-gray-700  px-4 max-w-sm md:max-w-lg text-center"
            style={{ fontFamily: '"Nunito", sans-serif' }}
          >
            InkDrop is a simple, powerful platform where readers can explore,
            download, and request e-books across categories-making knowledge
            accessible, one PDF at a time.
          </p>
        </div>
      </section>

      {/* Main Content */}
      <section className="bg-[#CDB79E] p-8  text-[#2E2E2E] min-h-screen w-full">
        {/* Hero Section */}
        <div className="flex flex-col items-center justify-center py-20 px-6 text-center">
          <h1
            className="text-5xl md:text-7xl font-extrabold mb-6"
            style={{ fontFamily: '"Libertinus Mono", monospace' }}
          >
            Our{" "}
            <span className="text-[#E97451] border-b-4 rounded-sm">
              Mission
            </span>
          </h1>
          <p
            className="text-md md:text-lg max-w-3xl mx-auto"
            style={{ fontFamily: "Poppins, sans-serif" }}
          >
            Empowering Readers. Simplifying Access. Curating Culture.
          </p>
        </div>

        {/* Mission Section */}
        <div className="grid md:grid-cols-2 gap-8 px-6 md:px-20 pb-20 max-w-6xl mx-auto">
          <div className="space-y-8">
            <p
              className="text-lg font-medium mt-10"
              style={{ fontFamily: '"Bitter", serif' }}
            >
              At <strong className="text-[#E97451]">InkDrop</strong>, we're
              redefining the way readers discover, save, and share knowledge.
              Whether it's a vintage title from a forgotten era or today's
              hottest read, we believe every book has the power to shape minds
              and spark ideas.
            </p>
            <p
              className="text-lg font-medium"
              style={{ fontFamily: '"Bitter", serif' }}
            >
              Our platform allows users to{" "}
              <span className="text-[#E97451] font-semibold">
                save books, request new titles, and enjoy instant PDF downloads
              </span>{" "}
              — all with a beautifully intuitive interface that blends
              productivity and simplicity.
            </p>
          </div>

          <div className="flex justify-center items-center">
            <img
              src={aboutbook}
              alt="About Illustration"
              className="w-full max-w-md object-contain rounded-xl border-4 border-[#8B4513] shadow-lg hover:scale-105 transition-transform duration-300"
            />
          </div>
        </div>

        {/* Quote Section */}
        <div className="bg-[#FFF5E1] border-y-2 border-[#8B4513] py-16 px-6 my-10">
          <blockquote className="text-center max-w-4xl mx-auto">
            <p
              className="text-2xl md:text-3xl italic mb-4"
              style={{ fontFamily: '"Libertinus Mono", monospace' }}
            >
              "A room without books is like a body without a soul."
            </p>
            <p
              className="text-xl text-[#E97451] font-semibold"
              style={{ fontFamily: '"Bitter", serif' }}
            >
              — Cicero
            </p>
          </blockquote>
        </div>

        {/* Team Section */}
        <div className="py-16 bg-[#FAEBD7] md:px-20 max-w-8xl mx-auto border-y-2 border-[#8B4513] px-6 my-10">
          <h2
            className="text-4xl font-bold text-center mb-16"
            style={{ fontFamily: '"Bitter", serif' }}
          >
            Meet <span className="text-[#E97451]">The Team</span>
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-8">
            {[
              {
                name: "Harshit Singh",
                role: "Frontend, Authentication & User Dashboard",
                img: "https://cdn-icons-png.flaticon.com/512/219/219983.png",
                bio: "Designed the user interface and implemented the complete user-side flow, including homepage, login/signup, dashboard, and book search features using React and Tailwind.",
              },
              {
                name: "Rudra Tiwari",
                role: "Admin Panel & Backend Systems",
                img: "https://cdn-icons-png.flaticon.com/512/219/219970.png",
                bio: "Developed the admin dashboard and backend logic for category and book management, request handling, and upload systems. Built APIs and handled database interactions.",
              },
              {
                name: "Ansh Mishra",
                role: "Book Explorer & Download Flow",
                img: "https://cdn-icons-png.flaticon.com/512/236/236831.png",
                bio: "Implemented the book listing page with filters, download features, and user request logic. Contributed to backend integration for book-related functionalities.",
              },
            ].map((member, index) => (
              <div
                key={index}
                className="bg-white p-6 rounded-lg shadow-lg border-2 border-[#8B4513] hover:shadow-xl transition-all duration-300 flex flex-col items-center hover:scale-105"
              >
                <img
                  src={member.img}
                  alt={member.name}
                  className="w-32 h-32 rounded-full mb-4 border-4 border-[#E97451] object-cover"
                />
                <h3
                  className="text-2xl font-bold mb-1"
                  style={{ fontFamily: '"Bitter", serif' }}
                >
                  {member.name}
                </h3>
                <p
                  className="text-[#E97451] font-semibold mb-3 text-center"
                  style={{ fontFamily: "Poppins, sans-serif" }}
                >
                  {member.role}
                </p>
                <p
                  className="text-center text-gray-600 text-sm"
                  style={{ fontFamily: "Poppins, sans-serif" }}
                >
                  {member.bio}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>
      <section className="bg-[#FFF5E1] w-full py-10">
        <div className="container mx-auto px-4">
          <div className="flex flex-col lg:flex-row gap-8">
            {/* Vision Card (Left Side) */}
            <div className="w-full lg:w-1/2 h-auto min-h-[600px] border-4 rounded-lg border-[#8B4513] p-8 bg-white shadow-lg">
              <div className="flex flex-col items-center justify-center h-full text-center">
                <h1
                  className="text-4xl md:text-5xl lg:text-6xl font-extrabold mb-6"
                  style={{ fontFamily: '"Libertinus Mono", monospace' }}
                >
                  Our{" "}
                  <span className="text-[#E97451] border-b-4 border-[#E97451]">
                    Vision
                  </span>
                </h1>
                <p
                  className="text-base md:text-lg text-gray-700 text-left leading-relaxed"
                  style={{ fontFamily: '"Nunito", sans-serif' }}
                >
                  At InkDrop, we believe knowledge should be for everyone - not
                  just a privilege for a few. We dream of becoming a global
                  space where students, teachers, and curious minds from all
                  walks of life can easily explore and download digital books
                  whenever they need them, wherever they are.</p>
                  <br />
                  Here's what we're working toward:
                  <ul className="list-disc pl-5 space-y-2">
                    <li>
                      <span className="font-semibold">Global Reach:</span>{" "}
                      Reaching communities around the world, especially those
                      with limited access to books and learning materials.
                    </li>
                    <li>
                      <span className="font-semibold">Growing Library:</span>{" "}
                      Expanding our collection daily with more genres,
                      languages, and subjects.
                    </li>
                    <li>
                      <span className="font-semibold">Community Driven:</span> A
                      place where readers can request titles and help shape the
                      platform.
                    </li>
                    <li>
                      <span className="font-semibold">Ethical Access:</span>{" "}
                      Ensuring fair access while respecting creators.
                    </li>
                  </ul>
                  We're building a future where everyone has the freedom to
                  read, learn, and grow.
                
              </div>
            </div>

            <div className="w-full lg:w-1/2 flex flex-col gap-8">
              {/* Admin Dashboard Card */}
              <div className="border-4 rounded-lg border-[#8B4513] p-6 bg-white shadow-lg">
                <div className="flex flex-col gap-4">
                  <h3 className="text-2xl font-bold text-[#8B4513] text-center">
                    Admin Dashboard Features
                  </h3>
                  <p className="text-center text-sm text-gray-500 -mt-3 ">
                    A quick look at what administrators can do to manage the
                    InkDrop library.
                  </p>
                  <div className="space-y-4 text-gray-700">
                    <p>
                      Our admin dashboard puts the power of digital library
                      management at your fingertips.
                    </p>
                    <p className="font-medium text-gray-700">
                      Admins can easily:
                    </p>
                    <ul className="list-disc pl-8 space-y-2 text-gray-700">
                      <li>Upload new books by category</li>
                      <li>Organize and update the catalog in real-time</li>
                      <li>
                        Maintain a clean, efficient system that keeps readers
                        happy
                      </li>
                    </ul>
                    <p>
                      With simple tools and a clean interface, keeping your
                      digital shelf up-to-date has never been easier.
                    </p>
                  </div>
                </div>
              </div>

              {/* Reader Experience Card */}
              <div className="border-4 rounded-lg border-[#8B4513] p-6 bg-white shadow-lg">
                <div className="flex flex-col gap-4">
                  <h3 className="text-2xl font-bold text-[#8B4513] text-center">
                    Reader Experience
                  </h3>
                  <p className="text-center text-sm text-gray-500 -mt-3">
                    Why readers love InkDrop? And how it makes accessing
                    knowledge effortless...
                  </p>
                  <div className="space-y-4">
                    <p className="text-gray-700">
                      Whether you're a student preparing for exams, a
                      professional looking to stay sharp, or just someone who
                      loves to read - InkDrop is built for you.
                    </p>
                    <ul className="list-disc pl-8 space-y-2 text-gray-700">
                      <li>Explore a growing library of PDFs</li>
                      <li>Search by category, title, or author</li>
                      <li>
                        Download instantly without annoying pop-ups or paywalls
                      </li>
                    </ul>
                    <p className="text-gray-700">
                      Reading should be easy, accessible, and enjoyable — and
                      that's exactly what we're here to deliver.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
      <section className="bg-[#CDB79E] py-12 px-4 md:px-8 lg:px-16">
        <div className="max-w-4xl mx-auto">
          {/* Heading */}
          <div className="text-center mb-12">
            <h2
              className="text-3xl md:text-4xl lg:text-5xl font-bold mb-4"
              style={{ fontFamily: '"Libertinus Mono", monospace' }}
            >
              Contact & <span className="text-[#E97451]">Support</span>
            </h2>
            <div className="w-24 h-1 bg-[#E97451] mx-auto"></div>
          </div>

          {/* Content */}
          <div className="bg-[#FAEBD7] rounded-lg shadow-lg p-8 md:p-10">
            <p
              className="text-lg md:text-xl text-gray-800 mb-6 text-center"
              style={{ fontFamily: '"Bitter", serif' }}
            >
              Have a question, suggestion, or just want to say hello? We're here
              for you!
            </p>

            <ul
              className="space-y-4 mb-6 pl-5 "
              style={{ fontFamily: '"Bitter", serif' }}
            >
              <li className="flex items-start gap-3">
                <span className="text-[#E97451] text-xl">👉</span>
                <span className="text-gray-800">
                  Visit our{" "}
                  <Link
                    to="/contact"
                    className="text-[#8B4513] font-semibold hover:underline"
                  >
                    Contact Us
                  </Link>{" "}
                  page
                </span>
              </li>
              <li className="flex items-start gap-3">
                <span className="text-[#E97451] text-xl">📧</span>
                <span className="text-gray-800">
                  Or drop us an email at{" "}
                  <a
                    href="mailto:support@inkdrop.com"
                    className="text-[#8B4513] font-semibold hover:underline"
                  >
                    support@inkdrop.com
                  </a>
                </span>
              </li>
            </ul>

            <p
              className="text-lg md:text-xl text-gray-800 text-center"
              style={{ fontFamily: '"Bitter", serif' }}
            >
              Whether it's technical help or feedback on your reading
              experience, we'd love to hear from you.
            </p>

            {/* Contact Form Button */}
            <div
              className="flex justify-center mt-8 font-medium"
              style={{ fontFamily: '"Bitter", serif' }}
            >
              <Link
                to="/contact"
                className="px-6 py-3 bg-[#E97451] text-white font-semibold rounded-lg hover:bg-[#d9623c] transition-colors duration-300 shadow-md"
              >
                Get in Touch
              </Link>
            </div>
          </div>
        </div>
      </section>
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
                      <Link to="/" className="hover:text-[#E97451] text-[#FAEBD7]" style={{ fontFamily: '"Libertinus Mono", monospace' }}>
                        Home
                      </Link>
                    </li>
              
                    {isLoggedIn && (
                      <>
                        <li>
                          <Link
                            to={role === "admin" ? "/dashboardAdmin" : "/dashboard"}
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
                      <Link to="/about" className="hover:text-[#E97451] text-[#FAEBD7]" style={{ fontFamily: '"Libertinus Mono", monospace' }}>
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
}
