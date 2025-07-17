import { useAuth } from "../context/AuthContext";
import { Navigate } from "react-router-dom";

export default function PrivateRoute({ children }) {
  const { auth, loading } = useAuth();
  if (loading) return null; // or a spinner
  if (!auth.isLoggedIn) {
    return <Navigate to="/authPage" replace />;
  }
  return children;
} 