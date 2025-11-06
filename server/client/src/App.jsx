import { Routes, Route, Navigate, Link, useLocation } from "react-router-dom";
import { AuthProvider, useAuth } from "./auth/AuthContext.jsx";
import AuthPage from "./auth/AuthPage.jsx";
import Dashboard from "./pages/Dashboard.jsx";
import Marketplace from "./pages/Marketplace.jsx";
import Requests from "./pages/Requests.jsx";
import { useState, useEffect } from "react";
import { api } from "./services/api.js";

function Protected({ children }) {
  const { token } = useAuth();
  return token ? children : <Navigate to="/login" replace />;
}

function Layout({ children }) {
  const { token, logout, user } = useAuth();
  const location = useLocation();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [requestCount, setRequestCount] = useState(0);

  // === Fetch new requests count ===
  async function fetchRequestCount() {
    if (!token) return;
    try {
      const incoming = await api.get("/requests/incoming", token);
      const pending = (incoming || []).filter((r) => r.status === "PENDING");
      setRequestCount(pending.length);
    } catch (err) {
      console.error("Failed to load request count:", err);
    }
  }

  useEffect(() => {
    if (token) {
      fetchRequestCount();
      const interval = setInterval(fetchRequestCount, 10000); // refresh every 10s
      return () => clearInterval(interval);
    }
  }, [token]);

  return (
    <div className="app">
      {token && (
        <>
          {/* === TOP NAVBAR (Desktop) === */}
          <nav className="navbar desktop-nav">
            <Link to="/" className="logo">
              SlotSwapper
            </Link>
            <div className="nav-right">
              <span className="muted">Hi, {user?.name}</span>
              <Link
                to="/"
                className={location.pathname === "/" ? "active" : ""}
              >
                Dashboard
              </Link>
              <Link
                to="/marketplace"
                className={location.pathname === "/marketplace" ? "active" : ""}
              >
                Marketplace
              </Link>
              <Link
                to="/requests"
                className={`nav-link ${
                  location.pathname === "/requests" ? "active" : ""
                }`}
              >
                Requests{" "}
                {requestCount > 0 && (
                  <span className="notif-badge">{requestCount}</span>
                )}
              </Link>
              <button className="btn-ghost" onClick={logout}>
                Logout
              </button>
            </div>
          </nav>

          {/* === MOBILE HEADER === */}
          <div className="mobile-header">
            <button
              className="menu-btn"
              onClick={() => setSidebarOpen(!sidebarOpen)}
            >
              ☰
            </button>
            <h2 className="mobile-title">SlotSwapper</h2>
          </div>

          {/* === SIDEBAR MENU (Mobile) === */}
          <div className={`mobile-sidebar ${sidebarOpen ? "open" : ""}`}>
            <div className="sidebar-content">
              <button
                className="close-btn"
                onClick={() => setSidebarOpen(false)}
              >
                ✕
              </button>
              <Link
                to="/"
                className={location.pathname === "/" ? "active" : ""}
                onClick={() => setSidebarOpen(false)}
              >
                Dashboard
              </Link>
              <Link
                to="/marketplace"
                className={location.pathname === "/marketplace" ? "active" : ""}
                onClick={() => setSidebarOpen(false)}
              >
                Marketplace
              </Link>
              <Link
                to="/requests"
                className={location.pathname === "/requests" ? "active" : ""}
                onClick={() => setSidebarOpen(false)}
              >
                Requests{" "}
                {requestCount > 0 && (
                  <span className="notif-badge">{requestCount}</span>
                )}
              </Link>
              <button
                className="btn-ghost"
                onClick={() => {
                  logout();
                  setSidebarOpen(false);
                }}
              >
                Logout
              </button>
            </div>
          </div>
        </>
      )}

      <main className="container">{children}</main>
    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <Routes>
        <Route path="/login" element={<AuthPage />} />
        <Route
          path="/"
          element={
            <Layout>
              <Protected>
                <Dashboard />
              </Protected>
            </Layout>
          }
        />
        <Route
          path="/marketplace"
          element={
            <Layout>
              <Protected>
                <Marketplace />
              </Protected>
            </Layout>
          }
        />
        <Route
          path="/requests"
          element={
            <Layout>
              <Protected>
                <Requests />
              </Protected>
            </Layout>
          }
        />
      </Routes>
    </AuthProvider>
  );
}
