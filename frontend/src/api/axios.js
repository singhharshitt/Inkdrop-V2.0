import axios from "axios";

// Smart baseURL selection: use env, or auto-detect local vs deployed
let baseURL = import.meta.env.VITE_API_BASE_URL;
if (!baseURL) {
  if (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') {
    baseURL = 'http://localhost:5000';
  } else {
    baseURL = 'https://inkdrop-backend.onrender.com';
  }
}

const axiosInstance = axios.create({
  baseURL,
  withCredentials: true, // Send cookies across domains
});

// ✅ Inject token into every request
axiosInstance.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

export default axiosInstance;
