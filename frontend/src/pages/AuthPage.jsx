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
    <div className="min-h-screen flex items-center justify-center bg-[#FAEBD7] px-2 py-8">
      <div className="w-full max-w-md bg-white rounded-xl shadow-lg p-6 sm:p-8 flex flex-col items-center">
        <img src={inkicon} alt="InkDrop Logo" className="w-16 h-16 mb-4" />
        <h2 className="text-2xl font-bold mb-2 text-[#8B4513] text-center">{isLogin ? "Login" : "Sign Up"}</h2>
        <MagnetLines />
        <form
          className="w-full flex flex-col gap-4 mt-4"
          onSubmit={isLogin ? handleLogin : handleSignup}
        >
          {!isLogin && (
            <>
              <div>
                <label className="block text-sm font-semibold mb-1" htmlFor="name">Name</label>
                <input
                  type="text"
                  id="name"
                  name="name"
                  className="w-full p-2 rounded border border-[#CDB79E] focus:outline-none"
                  value={formData.name}
                  onChange={handleChange}
                  autoComplete="name"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold mb-1" htmlFor="username">Username</label>
                <input
                  type="text"
                  id="username"
                  name="username"
                  className="w-full p-2 rounded border border-[#CDB79E] focus:outline-none"
                  value={formData.username}
                  onChange={handleChange}
                  autoComplete="username"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold mb-1" htmlFor="email">Email</label>
                <input
                  type="email"
                  id="email"
                  name="email"
                  className="w-full p-2 rounded border border-[#CDB79E] focus:outline-none"
                  value={formData.email}
                  onChange={handleChange}
                  autoComplete="email"
                />
              </div>
            </>
          )}
          {isLogin ? (
            <>
              <div>
                <label className="block text-sm font-semibold mb-1" htmlFor="loginInput">Username or Email</label>
                <input
                  type="text"
                  id="loginInput"
                  name="loginInput"
                  className="w-full p-2 rounded border border-[#CDB79E] focus:outline-none"
                  value={formData.loginInput}
                  onChange={handleChange}
                  autoComplete="username"
                />
              </div>
            </>
          ) : null}
          <div>
            <label className="block text-sm font-semibold mb-1" htmlFor="password">Password</label>
            <input
              type="password"
              id="password"
              name="password"
              className="w-full p-2 rounded border border-[#CDB79E] focus:outline-none"
              value={formData.password}
              onChange={handleChange}
              autoComplete={isLogin ? "current-password" : "new-password"}
            />
          </div>
          {!isLogin && (
            <div>
              <label className="block text-sm font-semibold mb-1" htmlFor="confirmPassword">Confirm Password</label>
              <input
                type="password"
                id="confirmPassword"
                name="confirmPassword"
                className="w-full p-2 rounded border border-[#CDB79E] focus:outline-none"
                value={formData.confirmPassword}
                onChange={handleChange}
                autoComplete="new-password"
              />
            </div>
          )}
          <div>
            <label className="block text-sm font-semibold mb-1" htmlFor="role">Role</label>
            <select
              id="role"
              name="role"
              className="w-full p-2 rounded border border-[#CDB79E] focus:outline-none"
              value={formData.role}
              onChange={handleChange}
            >
              <option value="">Select Role</option>
              <option value="user">User</option>
              <option value="admin">Admin</option>
            </select>
          </div>
          {message && (
            <div className={`text-center text-sm font-semibold rounded p-2 ${messageType === 'success' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>{message}</div>
          )}
          <button
            type="submit"
            className="w-full py-2 px-4 bg-[#E97451] text-white font-bold rounded hover:bg-[#A0522D] transition-all duration-200 mt-2"
          >
            {isLogin ? "Login" : "Sign Up"}
          </button>
        </form>
        <div className="w-full flex flex-col sm:flex-row items-center justify-between mt-4 gap-2">
          <button
            className="text-[#8B4513] hover:underline text-sm"
            onClick={() => setIsLogin(!isLogin)}
          >
            {isLogin ? "Don't have an account? Sign Up" : "Already have an account? Login"}
          </button>
        </div>
      </div>
    </div>
  );
}
