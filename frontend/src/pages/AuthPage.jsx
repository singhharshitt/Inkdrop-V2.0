import { useState } from "react";
import API from "../api/axios";
import inkicon from "../assets/inkicon.png";
import MagnetLines from "../components/MagnetLines";
import { useNavigate } from 'react-router-dom';
import { useAuth } from "../context/AuthContext";


export default function AuthPage() {
  const { login } = useAuth();

  const [isLogin, setIsLogin] = useState(true);
  const [formData, setFormData] = useState({
    name: "",
    username: "",
    email: "",
    password: "",
    confirmPassword: "",
    loginInput: "",
    role: "",
  });
const navigate = useNavigate();
  const [message, setMessage] = useState("");
  const [messageType, setMessageType] = useState(""); // 'success' or 'error'

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

 const handleLogin = async (e) => {
  e.preventDefault();
  try {
    const res = await API.post("/auth/login", {
      loginInput: formData.loginInput,
      password: formData.password,
      role: formData.role,
    });

    
    localStorage.setItem("token", res.data.token);

    
    login(res.data.user, res.data.token); 

    setMessage(res.data.message || "Login successful");
    setMessageType("success");

    
    navigate('/');
  } catch (err) {
    setMessage(err.response?.data?.error || "Login failed");
    setMessageType("error");
  }
};

  const handleSignup = async (e) => {
    e.preventDefault();

    const { name, username, email, password, confirmPassword, role } = formData;

    if (
      !name.trim() ||
      !username.trim() ||
      !email.trim() ||
      !password ||
      !confirmPassword ||
      !role
    ) {
      setMessage("Please fill in all fields");
      setMessageType("error");
      return;
    }

    if (password !== confirmPassword) {
      setMessage("Passwords do not match");
      setMessageType("error");
      return;
    }

    try {
      const res = await API.post("/auth/signup", {
        name: name.trim(),
        username: username.trim(),
        email: email.trim(),
        password,
        role,
      });

      setMessage(res.data.message || "Signup successful");
      setMessageType("success");
      setIsLogin(true);
    } catch (err) {
      setMessage(err.response?.data?.error || "Signup failed");
      setMessageType("error");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#FAEBD7] relative overflow-hidden">
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

      <div className="w-[95%] max-w-4xl md:w-[80%] h-auto md:h-[80vh] bg-[#F5F5DC] rounded-xl shadow-lg flex flex-col md:flex-row overflow-hidden relative z-10">
        {/* Left Panel */}
        <div className="md:w-1/2 w-full bg-[#8B4513] flex flex-col items-center justify-center p-6 space-y-4">
          <div className="pb-10 md:pb-20">
            <h1
              className="block text-4xl md:text-5xl lg:text-7xl font-extrabold text-gray-900 text-center"
              style={{ fontFamily: '"Winky Rough", cursive' }}
            >
              INKDROP
            </h1>
            <p className="text-xs md:text-md lg:text-md text-center font-medium">
              “Download. Read. Repeat.”
            </p>
          </div>
          <div className="w-24 h-24 md:w-32 md:h-32 rounded-full bg-white border-4 border-[#8B4513] flex items-center justify-center text-2xl font-bold text-[#2E2E2E]">
            <img src={inkicon} alt="Logo" className="w-16 h-16 md:w-24 md:h-24" />
          </div>
          <div className="flex space-x-4 mt-6 mb-10 md:mb-20">
            <button
              className={`px-4 py-2 rounded border-2 ${
                isLogin
                  ? "bg-[#E97451] text-white border-[#E97451]"
                  : "bg-white text-[#E97451] border-[#E97451]"
              }`}
              onClick={() => {
                setIsLogin(true);
                setMessage("");
              }}
            >
              Login
            </button>
            <button
              className={`px-4 py-2 rounded border-2 ${
                !isLogin
                  ? "bg-[#E97451] text-white border-[#E97451]"
                  : "bg-white text-[#E97451] border-[#E97451]"
              }`}
              onClick={() => {
                setIsLogin(false);
                setMessage("");
              }}
            >
              Signup
            </button>
          </div>
        </div>

        {/* Right Panel (Form) */}
        <div
          className="md:w-1/2 w-full p-6 md:p-8 overflow-y-auto transition-all duration-500 text-[#2E2E2E] bg-[#CDB79E] flex flex-col justify-center"
          style={{ fontFamily: '"Libertinus Mono", monospace' }}
        >
          {message && (
            <div
              className={`text-center p-2 mb-2 rounded font-semibold ${
                messageType === "error"
                  ? "bg-red-100 text-red-700 border border-red-300"
                  : "bg-green-100 text-green-700 border border-green-300"
              }`}
            >
              {message}
            </div>
          )}

          {isLogin ? (
            <form className="space-y-4 mt-8 md:mt-16" onSubmit={handleLogin}>
              <h2 className="text-2xl md:text-3xl lg:text-4xl font-bold mb-4 text-center">
                <span className="border-b-4 rounded-sm border-[#E97451]">
                  Log
                </span>
                in
              </h2>
              <input
                type="text"
                placeholder="Username or Email"
                name="loginInput"
                value={formData.loginInput}
                onChange={handleChange}
                className="w-full p-2 border border-gray-900 rounded focus:outline-none text-md"
                autoComplete="username"
              />
              <select
                name="role"
                value={formData.role}
                onChange={handleChange}
                className="w-full p-2 border border-gray-900 rounded text-md"
              >
                <option value="">Select Role</option>
                <option value="user">User</option>
                <option value="admin">Admin</option>
              </select>
              <input
                type="password"
                placeholder="Password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                className="w-full p-2 border border-gray-900 rounded focus:outline-none"
                autoComplete="current-password"
              />
              <div className="flex items-center space-x-2 text-[#8B4513]">
                <input type="checkbox" id="remember" />
                <label htmlFor="remember">Remember Me</label>
              </div>
              <button
                type="submit"
                className="w-full bg-[#E97451] text-white py-2 rounded hover:bg-[#CD5C5C] transition font-extrabold"
              >
                Login
              </button>
            </form>
          ) : (
            <form className="space-y-4 mt-8 md:mt-16" onSubmit={handleSignup}>
              <h2 className="text-2xl md:text-3xl lg:text-4xl font-bold mb-4 text-center text-[#E97451]">
                Sign
                <span className="border-b-4 rounded-sm border-[#2E2E2E]">
                  up
                </span>
              </h2>
              <input
                type="text"
                placeholder="Name"
                name="name"
                value={formData.name}
                onChange={handleChange}
                className="w-full p-2 border border-gray-900 rounded focus:outline-none text-md"
                autoComplete="name"
              />
              <input
                type="text"
                placeholder="Username"
                name="username"
                value={formData.username}
                onChange={handleChange}
                className="w-full p-2 border border-gray-900 rounded focus:outline-none text-md"
                autoComplete="username"
              />
              <input
                type="email"
                placeholder="Email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                className="w-full p-2 border border-gray-900 rounded focus:outline-none text-md"
                autoComplete="email"
              />
              <input
                type="password"
                placeholder="Password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                className="w-full p-2 border border-gray-900 rounded focus:outline-none text-md"
                autoComplete="new-password"
              />
              <input
                type="password"
                placeholder="Confirm Password"
                name="confirmPassword"
                value={formData.confirmPassword}
                onChange={handleChange}
                className="w-full p-2 border border-gray-900 rounded focus:outline-none text-md"
                autoComplete="new-password"
              />
              <select
                name="role"
                value={formData.role}
                onChange={handleChange}
                className="w-full p-2 border border-gray-900 rounded text-md"
              >
                <option value="">Select Role</option>
                <option value="user">User</option>
              </select>
              <button
                type="submit"
                className="w-full bg-[#E97451] text-white py-2 rounded hover:bg-[#CD5C5C] transition font-extrabold"
              >
                Signup
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
