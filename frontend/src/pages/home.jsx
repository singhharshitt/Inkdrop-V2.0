import React, { useState, useRef, useEffect } from "react";
import inkdropLogo from '../assets/Inkdrop.png';
import homelogo from '../assets/home.png';
import hamberglogo from '../assets/hamburger.png';
import aboutlogo from '../assets/info.png';
import inkicon from '../assets/inkicon.png';
import Quotations from '../assets/QuotationsFromMao.png';
import MagnetLines from '../components/MagnetLines';
import TiltedCards from '../components/TiltedCards';
import ImageTrail from "../components/ImageTrial"; 
import image1 from '../assets/image1.png';
import image2 from '../assets/image2.png';
import image3 from '../assets/image3.png';
import image4 from '../assets/image4.png';
import steve from '../assets/steve.png';
import frank from '../assets/frank.png';
import books from '../assets/books.png';
import AndThenThereWereNone from '../assets/AndThenThereWereNone.png';
import ManSerches from '../assets/ManSerches.png';
import Harry from '../assets/HarryPotter.png';
import RequestNew from '../assets/RequestNew.png';
import trackReads from '../assets/trackReads.png';
import pdfdownload from '../assets/pdfdownload.png';
import man1 from '../assets/man1.jpg';
import man2 from '../assets/man2.jpg';
import women from '../assets/woman1.jpg';



import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from "../context/AuthContext";


function Home() {
  
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const sidebarRef = useRef(null);
  const { auth, logout } = useAuth();
  const navigate = useNavigate();
  

  
  const commonLinks = [
  { name: "Home", path: "/" },
  { name: "Discover", path: "/discover" },
  { name: "My Library", path: "/library" },
  { name: "Contact Us", path: "/contact" },
  { name: "About Us", path: "/about" },
];

  const adminLinks = [{ name: "Upload (Admin)", path: "/upload" }, {name:"dashboard", path:"/dashboardAdmin"}];
  const isLoggedIn = auth.isLoggedIn;
  const role = auth?.user?.role;

 
  const dashboardLink = { name: "Dashboard", path: role === "admin" ? "/dashboardAdmin" : "/userdashbord" };
  
  const finalLinks = [
    commonLinks[0],
    dashboardLink,
    ...commonLinks.slice(1)
  ];
  if (isLoggedIn && role === "admin") {
   
    finalLinks.splice(4, 0, adminLinks[0]);
  }

  
  const handleGetNow = () => {
    if (isLoggedIn) {
      navigate('/discover');
    } else {
      navigate('/authPage');
    }
  };


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
      <nav className="flex items-center justify-between p-3 shadow-md bg-[#8B4513] text-[#FAEBD7] z-30  ">
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

      {/* Hero Section */}
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

        <div className="absolute inset-0 z-5" style={{ opacity: 0.3 }}>
          <ImageTrail
            items={[
              ManSerches,
              image2,
              image3,
              image4,
              steve,
              Harry,
              image1,
              AndThenThereWereNone,
            ]}
            variant={1}
          />
        </div>
        

        <div className="z-10 flex flex-col items-center justify-center text-center cursor-pointer">
          <img src={inkicon} alt="Inkdrop Icon" className="w-20 h-20 md:w-24 md:h-24 object-contain mb-[-20px] -mr-4 cursor-pointer " />
          <h2 className="text-7xl md:text-8xl sm:text-10xl font-extrabold text-[#2E2E2E] mb-6 pl-2 " style={{ fontFamily: '"Winky Rough", cursive' }} >INKDROP</h2>
          <p className="text-base md:text-lg text-gray-700 max-w-[250px]" style={{ fontFamily: '"Nunito", sans-serif' }}>Your personal vintage library in the digital world.</p>
        </div>
        
      </section>

      {/*Categories Overview*/}
      <section className="bg-[#CDB79E] p-8 ">
      
        <div className="flex justify-center items-center w-full pb-10 ">
          <div className="flex flex-col items-center justify-center mt-2 p-4">
            <h1
              className="block text-3xl text-center  md:text-6xl font-extrabold text-gray-900 mb-3.5" style={{ fontFamily: '"Libertinus Mono", monospace' }}>
              <span className="border-b-4 rounded-sm">Feat</span>ured 
            </h1>
          </div>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          <div className="bg-[#FAEBD7] p-5 m-4 rounded-lg hover:scale-105 transition-transform duration-500 hover:shadow-lg">
            <div>
              <img src={Quotations} alt="Quotations" className=" object-cover w-full h-auto rounded-lg " />
            </div>
            <div>
              <h2 className="text-xl text-[#2E2E2E] font-bold mt-4 mb-2" style={{ fontFamily: '"Bitter", serif' }} >Quotations from Mao</h2>
              <p className="text-md  font-semibold " style={{ fontFamily: '"Open Sans", sans-serif' }}>Author ~ Mao Zedong </p>
              <p className="text-sm font-semibold" style={{ fontFamily: '"Open Sans", sans-serif' }} ><i>Genre ~ Political ideology</i></p>
              <p className="text-sm font-medium" style={{ fontFamily: '"Open Sans", sans-serif' }} ><i>Copies Sold ~ 800 million</i></p>

              <button 
                onClick={handleGetNow}
                className="mt-4 bg-red-500 w-24 h-8 border-2 rounded-md cursor-pointer transition-transform duration-300 hover:scale-105 hover:shadow-lg hover:ring-2 hover:ring-red-300"
              >
                <span className="text-sm text-white">Get Now</span>
              </button>
            </div>
          </div>
          <div className="bg-[#FAEBD7] p-5 m-4 rounded-lg hover:scale-105 transition-transform duration-500 hover:shadow-lg">
            <div>
              <img src={steve} alt="Steve Jobs" className=" object-cover w-full h-auto rounded-lg " />
            </div>
            <div>
              <h2 className="text-xl text-[#2E2E2E] font-bold mt-4 mb-2" style={{ fontFamily: '"Bitter", serif' }} >Steve Jobs</h2>
              <p className="text-md  font-semibold" style={{ fontFamily: '"Open Sans", sans-serif' }}>Author ~ Walter Isaacson </p>
              <p className="text-sm font-semibold" style={{ fontFamily: '"Open Sans", sans-serif' }} ><i>Genre ~ Biography</i></p>
              <p className="text-sm font-medium" style={{ fontFamily: '"Open Sans", sans-serif' }} ><i>Copies Sold ~ Over 3 million</i></p>
              <button 
                onClick={handleGetNow}
                className="mt-4  bg-red-500 w-24 h-8 border-2 rounded-md cursor-pointer transition-transform duration-300 hover:scale-105 hover:shadow-lg hover:ring-2 hover:ring-red-300"
              >
                <span className="text-sm text-white">Get Now</span>
              </button>
            </div>
          </div>
          <div className="bg-[#FAEBD7] p-5 m-4 rounded-lg hover:scale-105 transition-transform duration-500 hover:shadow-lg">
            <div>
              <img src={frank} alt="Frankenstein" className=" object-cover w-full h-auto rounded-lg " />
            </div>
            <div>
              <h2 className="text-xl text-[#2E2E2E] font-bold mt-4 mb-2" style={{ fontFamily: '"Bitter", serif' }} >Frankenstein</h2>
              <p className="text-md  font-semibold" style={{ fontFamily: '"Open Sans", sans-serif' }}>Author ~ Mary Shelley </p>
              <p className="text-sm font-semibold" style={{ fontFamily: '"Open Sans", sans-serif' }} ><i>Genre ~ Gothic horror</i></p>
              <p className="text-sm font-medium" style={{ fontFamily: '"Open Sans", sans-serif' }} ><i>Copies Sold ~ Over 10 million</i></p>
              <button 
                onClick={handleGetNow}
                className="mt-4  bg-red-500 w-24 h-8 border-2 rounded-md cursor-pointer transition-transform duration-300 hover:scale-105 hover:shadow-lg hover:ring-2 hover:ring-red-300"
              >
                <span className="text-sm text-white">Get Now</span>
              </button>
            </div>
          </div>
          <div className="bg-[#FAEBD7] p-5 m-4 rounded-lg hover:scale-105 transition-transform duration-500 hover:shadow-lg">
            <div>
              <img src={image1} alt="The Da Vinci Code" className=" object-cover w-full h-auto rounded-lg " />
            </div>
            <div>
              <h2 className="text-xl text-[#2E2E2E] font-bold mt-4 mb-2" style={{ fontFamily: '"Bitter", serif' }} >The Da Vinci Code</h2>
              <p className="text-md  font-semibold" style={{ fontFamily: '"Open Sans", sans-serif' }}>Author ~ Dan Brown </p>
              <p className="text-sm font-semibold" style={{ fontFamily: '"Open Sans", sans-serif' }} ><i>Genre ~ Thriller / Mystery</i></p>
              <p className="text-sm font-medium" style={{ fontFamily: '"Open Sans", sans-serif' }} ><i>Copies Sold ~ Over 80 million</i></p>
              <button 
                onClick={handleGetNow}
                className="mt-4  bg-red-500 w-24 h-8 border-2 rounded-md cursor-pointer transition-transform duration-300 hover:scale-105 hover:shadow-lg hover:ring-2 hover:ring-red-300"
              >
                <span className="text-sm text-white">Get Now</span>
              </button>
            </div>
          </div>
          <div className="bg-[#FAEBD7] p-5 m-4 rounded-lg hover:scale-105 transition-transform duration-500 hover:shadow-lg">
            <div>
              <img src={AndThenThereWereNone} alt="And Then There Were None" className=" object-cover w-full h-auto rounded-lg " />
            </div>
            <div>
              <h2 className="text-xl text-[#2E2E2E] font-bold mt-4 mb-2" style={{ fontFamily: '"Bitter", serif' }} >And Then There Were None</h2>
              <p className="text-md  font-semibold" style={{ fontFamily: '"Open Sans", sans-serif' }}>Author ~ Agatha Christie </p>
              <p className="text-sm font-semibold" style={{ fontFamily: '"Open Sans", sans-serif' }} ><i>Genre ~ Mystery / Crime </i></p>
              <p className="text-sm font-medium" style={{ fontFamily: '"Open Sans", sans-serif' }} ><i>Copies Sold ~ Over 100 million</i></p>
              <button 
                onClick={handleGetNow}
                className="mt-4  bg-red-500 w-24 h-8 border-2 rounded-md cursor-pointer transition-transform duration-300 hover:scale-105 hover:shadow-lg hover:ring-2 hover:ring-red-300"
              >
                <span className="text-sm text-white">Get Now</span>
              </button>
            </div>
          </div>
          <div className="bg-[#FAEBD7] p-5 m-4 rounded-lg hover:scale-105 transition-transform duration-500 hover:shadow-lg">
            <div>
              <img src={ManSerches} alt="Man's Search for Meaning" className=" object-cover w-full h-auto rounded-lg " />
            </div>
            <div>
              <h2 className="text-xl text-[#2E2E2E] font-bold mt-4 mb-2" style={{ fontFamily: '"Bitter", serif' }} >Man's Search for Meaning </h2>
              <p className="text-md  font-semibold" style={{ fontFamily: '"Open Sans", sans-serif' }}>Author ~ Viktor E. Frankl </p>
              <p className="text-sm font-semibold" style={{ fontFamily: '"Open Sans", sans-serif' }} ><i>Genre ~ Psychology / Philosophy </i></p>
              <p className="text-sm font-medium" style={{ fontFamily: '"Open Sans", sans-serif' }} ><i>Copies Sold ~ Over 16 million</i></p>
              <button 
                onClick={handleGetNow}
                className="mt-4  bg-red-500 w-24 h-8 border-2 rounded-md cursor-pointer transition-transform duration-300 hover:scale-105 hover:shadow-lg hover:ring-2 hover:ring-red-300"
              >
                <span className="text-sm text-white">Get Now</span>
              </button>
            </div>
          </div>
          <div className="bg-[#FAEBD7] p-5 m-4 rounded-lg hover:scale-105 transition-transform duration-500 hover:shadow-lg">
            <div>
              <img src={Harry} alt="Harry Potter" className=" object-cover w-full h-auto rounded-lg " />
            </div>
            <div>
              <h2 className="text-xl text-[#2E2E2E] font-bold mt-4 mb-2" style={{ fontFamily: '"Bitter", serif' }} >Harry Potter </h2>
              <p className="text-md  font-semibold" style={{ fontFamily: '"Open Sans", sans-serif' }}>Author ~ J.K. Rowling </p>
              <p className="text-sm font-semibold" style={{ fontFamily: '"Open Sans", sans-serif' }} ><i>Genre ~ Fantasy / Adventure </i></p>
              <p className="text-sm font-medium" style={{ fontFamily: '"Open Sans", sans-serif' }} ><i>Copies Sold ~ Over 600 million</i></p>
              <button 
                onClick={handleGetNow}
                className="mt-4  bg-red-500 w-24 h-8 border-2 rounded-md cursor-pointer transition-transform duration-300 hover:scale-105 hover:shadow-lg hover:ring-2 hover:ring-red-300"
              >
                <span className="text-sm text-white">Get Now</span>
              </button>
            </div>
          </div>
          <div className="bg-[#FAEBD7] p-5 m-4 rounded-lg hover:scale-105 transition-transform duration-500 hover:shadow-lg">
            <div>
              <img src={image2} alt="The Alchemist" className=" object-cover w-full h-auto rounded-lg " />
            </div>
            <div>
              <h2 className="text-xl text-[#2E2E2E] font-bold mt-4 mb-2" style={{ fontFamily: '"Bitter", serif' }} >The Alchemist </h2>
              <p className="text-md  font-semibold" style={{ fontFamily: '"Open Sans", sans-serif' }}>Author ~ Paulo Coelho </p>
              <p className="text-sm font-semibold" style={{ fontFamily: '"Open Sans", sans-serif' }} ><i>Genre ~ Spiritual allegory / Fiction </i></p>
              <p className="text-sm font-medium" style={{ fontFamily: '"Open Sans", sans-serif' }} ><i>Copies Sold ~ Over 150 million</i></p>
              <button 
                onClick={handleGetNow}
                className="mt-4  bg-red-500 w-24 h-8 border-2 rounded-md cursor-pointer transition-transform duration-300 hover:scale-105 hover:shadow-lg hover:ring-2 hover:ring-red-300"
              >
                <span className="text-sm text-white">Get Now</span>
              </button>
            </div>
          </div>
        </div>
        
      </section>

      {/*How It Works*/}
      <section className="bg-[#FAEBD7] pb-12 px-4">
        <div className="flex justify-center items-center w-full pb-10">
          <div className="flex flex-col items-center justify-center mt-2 p-4">
            <h1
              className="block text-3xl text-center md:text-6xl font-extrabold text-gray-900 mb-3.5"
              style={{ fontFamily: '"Libertinus Mono", monospace' }}
            >
              <span className="border-b-4 border-[#E97451] rounded-sm">How i</span>t Works?
            </h1>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 px-8 py-12 max-w-6xl mx-auto items-center">
          
          <div className="flex flex-col space-y-6">
          
            <div className="bg-white shadow-md p-4 rounded-md border-l-4 border-[#8B4513] hover:scale-105 transition-transform duration-500 hover:shadow-lg">
              <h2 className="text-xl text-[#2E2E2E] font-bold mb-1" style={{ fontFamily: '"Bitter", serif' }}>
                Step 1: Browse & Discover
              </h2>
              <p className="text-gray-700 text-sm" style={{ fontFamily: '"Nunito", sans-serif' }}>
                Explore a wide collection of books sorted by category. From fiction to tech, find your favorite titles easily with our clean, classic interface.
              </p>
            </div>

            <div className="bg-white shadow-md p-4 rounded-md border-l-4 border-[#8B4513] hover:scale-105 transition-transform duration-500 hover:shadow-lg">
              <h2 className="text-xl text-[#2E2E2E] font-bold mb-1" style={{ fontFamily: '"Bitter", serif' }}>
                Step 2: Download Instantly
              </h2>
              <p className="text-gray-700 text-sm" style={{ fontFamily: '"Nunito", sans-serif' }}>
                Select a book and download it instantly in PDF format.
                No waiting, no sign-up needed — just click and start reading offline.
              </p>
            </div>

            <div className="bg-white shadow-md p-4 rounded-md border-l-4 border-[#8B4513] hover:scale-105 transition-transform duration-500 hover:shadow-lg">
              <h2 className="text-xl text-[#2E2E2E] font-bold mb-1" style={{ fontFamily: '"Bitter", serif' }}>
                Step 3: Request What's Missing
              </h2>
              <p className="text-gray-700 text-sm" style={{ fontFamily: '"Nunito", sans-serif' }}>
                Can't find a book? Submit a request and we'll add it.
                We keep expanding our library based on your suggestions.
              </p>
            </div>
          </div>

          <div className="bg-[#8B4513] text-[#FAEBD7] p-6 rounded-md shadow-md h-full flex flex-col justify-center">
            <h3 className="text-2xl font-bold mb-2" style={{ fontFamily: '"Bitter", serif' }}>Summary</h3>
            <p className="text-sm" style={{ fontFamily: '"Nunito", sans-serif' }}>
              A vintage-inspired digital library experience that makes finding and reading your favorite books elegant, fast, and easy.
            </p>
          </div>
        </div>
      </section>

      {/* Why Choose Us */}
      <section className="bg-[#CDB79E] min-w-full">
        <div className="flex justify-center items-center w-full pb-10 ">
          <div className="flex flex-col items-center justify-center mt-2 p-4">
            <h1
              className="block text-3xl text-center  md:text-6xl font-extrabold text-gray-900 mb-3.5" style={{ fontFamily: '"Libertinus Mono", monospace' }}>
              <span className="border-b-4 rounded-sm">Why C</span>hoose Us?
            </h1>
          </div>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-4 gap-8 px-6 pb-16 justify-items-center overflow-hidden w-full pt-10">

          {/* Card 1 */}
          <TiltedCards
            imageSrc={books}
            altText="Curated Collection"
            captionText="Handpicked Categories
All books are neatly organized by genres, so you find exactly what you love faster."
            containerHeight="260px"
            containerWidth="260px"
            imageHeight="260px"
            imageWidth="260px"
            rotateAmplitude={12}
            scaleOnHover={1.2}
            showMobileWarning={false}
            showTooltip={true}
            displayOverlayContent={true}
            overlayContent={
              <p className="text-[#2E2E2E] font-semibold">Curated by Readers</p>
            }
          />

          {/* Card 2 */}
          <TiltedCards
            imageSrc={pdfdownload}
            altText="Instant Downloads"
            captionText="One-Click Access.Click, download, and read - it’s that easy."
            containerHeight="260px"
            containerWidth="260px"
            imageHeight="260px"
            imageWidth="260px"
            rotateAmplitude={12}
            scaleOnHover={1.2}
            showMobileWarning={false}
            showTooltip={true}
            displayOverlayContent={true}
            overlayContent={
              <p className="text-[#2E2E2E] font-semibold">Download Instantly</p>
            }
          />

          {/* Card 3 */}
          <TiltedCards
            imageSrc={trackReads}
            altText="Track Downloads"
            captionText="Stay Organized
Your download history helps you keep track of what you’ve read and what’s next."
            containerHeight="260px"
            containerWidth="260px"
            imageHeight="260px"
            imageWidth="260px"
            rotateAmplitude={12}
            scaleOnHover={1.2}
            showMobileWarning={false}
            showTooltip={true}
            displayOverlayContent={true}
            overlayContent={
              <p className="text-[#2E2E2E] font-semibold">Track Your Reads</p>
            }
          />

          {/* Card 4 */}
          <TiltedCards
            imageSrc={RequestNew}
            altText="Request Books"
            captionText="Missing a Book?
Can’t find something? Submit a request- we’ll try to add it just for you."
            containerHeight="260px"
            containerWidth="260px"
            imageHeight="260px"
            imageWidth="260px"
            rotateAmplitude={12}
            scaleOnHover={1.2}
            showMobileWarning={false}
            showTooltip={true}
            displayOverlayContent={true}
            overlayContent={
              <p className="text-[#2E2E2E] font-semibold">Request New Titles</p>
            }
          />

        </div>
      </section>
      <section className="bg-[#FAEBD7] min-w-full">
  <div className="flex justify-center items-center w-full pb-10">
    <div className="flex flex-col items-center justify-center mt-2 p-4">
      <h1
        className="block text-3xl text-center md:text-6xl font-extrabold text-[#2E2E2E] mb-3.5"
        style={{ fontFamily: '"Libertinus Mono", monospace' }}
      >
        <span className="border-b-4 border-[#E97451] rounded-sm">Test</span>imonials
      </h1>
    </div>
  </div>

  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 p-6 px-5 gap-x-6 gap-y-8">
    {/* Testimonial 1 */}
    <div className="hover:scale-105 transition-transform duration-500 hover:shadow-lg">
      <div className="grid grid-cols-2 w-auto gap-3 border-2 border-[#2E2E2E] p-4 bg-[#CDB79E] rounded-md min-h-[15rem] float-up-down">
        <div className="w-20 h-20">
          <img src={women} className="rounded-full border-2 border-[#2E2E2E]" />
        </div>
        <div>
          <p className="text-sm text-[#2E2E2E] text-center">
            <i>
              "I found every textbook I needed - from classics to rare reference PDFs - all categorized so intuitively. The instant downloads saved me during exams! It’s like having a digital library that’s open 24/7."
              <br />— <span className="text-[#8B4513] font-semibold">Riya S., Literature Student</span>
            </i>
          </p>
        </div>
      </div>
    </div>

    {/* Testimonial 2 */}
    <div className="hover:scale-105 transition-transform duration-500 hover:shadow-lg">
      <div className="grid grid-cols-2 w-auto gap-3 border-2 border-[#2E2E2E] p-4 bg-[#CDB79E] rounded-md min-h-[15rem] float-up-down">
        <div className="w-20 h-20">
          <img src={man1} className="rounded-full border-2 border-[#2E2E2E]" />
        </div>
        <div>
          <p className="text-sm text-[#2E2E2E] text-center">
            <i>
              "I recommend this app to my students regularly. It’s accessible, minimal, and the PDF quality is perfect. Knowing I can request academic books that aren’t available elsewhere is a game-changer."
              <br />— <span className="text-[#8B4513] font-semibold">Siddharth R., Professor of History</span>
            </i>
          </p>
        </div>
      </div>
    </div>

    {/* Testimonial 3 */}
    <div className="hover:scale-105 transition-transform duration-500 hover:shadow-lg">
      <div className="grid grid-cols-2 w-auto gap-3 border-2 border-[#2E2E2E] p-4 bg-[#CDB79E] rounded-md min-h-[15rem] float-up-down">
        <div className="w-20 h-20">
          <img src={man2} className="rounded-full border-2 border-[#2E2E2E]" />
        </div>
        <div>
          <p className="text-sm text-[#2E2E2E] text-center">
            <i>
              "This app is a goldmine for techies. I was surprised to find niche programming eBooks that even big stores don’t list. I requested a title and it was uploaded within days!"
              <br />— <span className="text-[#8B4513] font-semibold">Nikhil M., Software Engineer</span>
            </i>
          </p>
        </div>
      </div>
    </div>
  </div>
</section>


    <footer className="w-full bg-[#8B4513] text-[#FAEBD7] font-sans">
  <div className="grid grid-cols-1 md:grid-cols-3 gap-8 w-full p-10">
    {/* Designer Info */}
    <div>
      <h1 className="text-lg font-bold" style={{ fontFamily: '"Bitter", serif' }}>
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
      <h3 className="text-lg font-semibold mb-4 underline" style={{ fontFamily: '"Bitter", serif' }}>Quick Links</h3>
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
              to={role === "admin" ? "/dashboardAdmin" : "/userdashbord"}
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
      <h3 className="text-lg font-semibold mb-4 underline" style={{ fontFamily: '"Bitter", serif' }}>Related Documents</h3>
      <ul className="space-y-2 list-disc pl-7">
        <li><a href="#" className=" hover:text-[#E97451] text-[#FAEBD7]" style={{ fontFamily: '"Libertinus Mono", monospace' }}>Licensing Information</a></li>
        <li><a href="#" className=" hover:text-[#E97451] text-[#FAEBD7]" style={{ fontFamily: '"Libertinus Mono", monospace' }}>Privacy Policy</a></li>
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

        {/* Social Icons */}
        <div className="md:col-span-3 mt-6">
          <div className="flex gap-5 justify-center md:justify-start">
            {/* X */}
            <a href="" target="_blank" rel="noopener noreferrer" className="hover:opacity-80 text-[#FAEBD7]">
              <svg xmlns="http://www.w3.org/2000/svg" fill="currentColor" className="w-6 h-6" viewBox="0 0 24 24">
                <path d="M22.25 2H1.75C.78 2 0 2.78 0 3.75v16.5C0 21.22.78 22 1.75 22h20.5c.97 0 1.75-.78 1.75-1.75V3.75C24 2.78 23.22 2 22.25 2Zm-5.95 13.32h-1.9l-2.59-3.5-2.99 3.5H7.01l3.84-4.48L7.5 7.09h1.89l2.3 2.95 2.55-2.95h1.94l-3.78 4.27 3.7 4.96Z" />
              </svg>
            </a>
            {/* Instagram */}
            <a href="" target="_blank" rel="noopener noreferrer" className="hover:opacity-80 text-[#FAEBD7]">
              <svg xmlns="http://www.w3.org/2000/svg" fill="currentColor" className="w-6 h-6" viewBox="0 0 24 24">
                <path d="M7.75 2h8.5A5.75 5.75 0 0 1 22 7.75v8.5A5.75 5.75 0 0 1 16.25 22h-8.5A5.75 5.75 0 0 1 2 16.25v-8.5A5.75 5.75 0 0 1 7.75 2Zm0 1.5A4.25 4.25 0 0 0 3.5 7.75v8.5A4.25 4.25 0 0 0 7.75 20.5h8.5a4.25 4.25 0 0 0 4.25-4.25v-8.5A4.25 4.25 0 0 0 16.25 3.5h-8.5Zm8 2.25a.75.75 0 1 1 0 1.5h-.008a.75.75 0 0 1 0-1.5H15.75ZM12 7a5 5 0 1 1 0 10 5 5 0 0 1 0-10Zm0 1.5a3.5 3.5 0 1 0 0 7 3.5 3.5 0 0 0 0-7Z" />
              </svg>
            </a>
            {/* Facebook */}
            <a href="" target="_blank" rel="noopener noreferrer" className="hover:opacity-80 text-[#FAEBD7]">
              <svg xmlns="http://www.w3.org/2000/svg" fill="currentColor" className="w-6 h-6" viewBox="0 0 24 24">
                <path d="M13.5 3.001h3.75V.082A48.255 48.255 0 0 0 13.61 0c-3.555 0-5.988 2.167-5.988 6.155v3.45H4.5v4.487h3.122V24h4.492v-9.908h3.598l.571-4.487h-4.17V6.613c0-1.299.35-2.185 2.387-2.185Z" />
              </svg>
            </a>
            {/* LinkedIn */}
            <a href="" target="_blank" rel="noopener noreferrer" className="hover:opacity-80 text-[#FAEBD7]">
              <svg xmlns="http://www.w3.org/2000/svg" fill="currentColor" className="w-6 h-6" viewBox="0 0 24 24">
                <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
              </svg>
            </a>
          </div>
        </div>
      </div>

       <hr className="border-[#2E2E2E] mx-4" />

  {/* Back to Top */}
  <div className="w-full py-4 text-center relative">
    <p className="text-sm text-[#FAEBD7]">© 2025 InkDrop. All rights reserved.</p>
    <button
      onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
      className="absolute right-6 top-2 px-3 py-2 bg-[#E97451] hover:bg-[#d8623d] text-white rounded-full shadow-md transition-all duration-200"
    >
      ↑ Top
    </button>
  </div>
    </footer>


    </>
  );
}

export default Home;