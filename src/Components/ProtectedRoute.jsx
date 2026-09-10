import { Navigate } from "react-router-dom";

function isTokenValid(token) {
  if (!token) return false;
  try {
    const payload = JSON.parse(
      atob(token.split(".")[1].replace(/-/g, "+").replace(/_/g, "/"))
    );
    if (!payload.exp) return true;
    return payload.exp * 1000 > Date.now();
  } catch {
    return false;
  }
}

function ProtectedRoute({ children }) {
  const token = localStorage.getItem("token");
  if (!isTokenValid(token)) {
    return <Navigate to="/signin" replace />;
  }
  return children;
}

export default ProtectedRoute;
