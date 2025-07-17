import { createContext, useContext, useEffect, useState } from "react";

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [auth, setAuth] = useState({
    isLoggedIn: false,
    user: null,
    token: null,
  });
  const [loading, setLoading] = useState(true);

  // Load user and token from localStorage on mount
  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    const storedToken = localStorage.getItem("token");
    if (storedUser && storedToken) {
      setAuth({
        isLoggedIn: true,
        user: JSON.parse(storedUser),
        token: storedToken,
      });
    }
    setLoading(false);
  }, []);

  // Login handler
  const login = (userData, token) => {
    localStorage.setItem("user", JSON.stringify(userData));
    localStorage.setItem("token", token);
    setAuth({
      isLoggedIn: true,
      user: userData,
      token: token,
    });
  };

  // Logout handler
  const logout = () => {
    localStorage.removeItem("user");
    localStorage.removeItem("token");
    setAuth({
      isLoggedIn: false,
      user: null,
      token: null,
    });
  };

  return (
    <AuthContext.Provider value={{ auth, login, logout, loading }}>
      {children}
    </AuthContext.Provider>
  );
};

// Custom hook to use auth
export const useAuth = () => useContext(AuthContext);
