import {
  BrowserRouter,
  Navigate,
  NavLink,
  Route,
  Routes,
  useNavigate
} from "react-router-dom";
import {
  Bell,
  BriefcaseBusiness,
  CalendarDays,
  GraduationCap,
  LayoutDashboard,
  LogOut,
  Shield,
  Upload,
  UserCog,
  Users
} from "lucide-react";

import Login from "./pages/Login";
import Register from "./pages/Register";
import Dashboard from "./pages/Dashboard";
import Directory from "./pages/Directory";
import Events from "./pages/Events";
import Mentorship from "./pages/Mentorship";
import Opportunities from "./pages/Opportunities";
import SecurityDashboard from "./pages/SecurityDashboard";
import AdminPanel from "./pages/AdminPanel";
import Profile from "./pages/Profile";
import { AuthProvider, useAuth } from "./context/AuthContext";

function ProtectedRoute({ children, roles }) {
  const { token, user } = useAuth();

  if (!token) {
    return <Navigate to="/login" replace />;
  }

  if (roles?.length && !roles.includes(user?.role)) {
    return <Navigate to="/" replace />;
  }

  return children;
}

function Shell() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const links = [
    { to: "/", label: "Dashboard", icon: LayoutDashboard },
    { to: "/directory", label: "Directory", icon: Users },
    { to: "/events", label: "Events", icon: CalendarDays },
    { to: "/mentorship", label: "Mentorship", icon: GraduationCap },
    { to: "/opportunities", label: "Opportunities", icon: BriefcaseBusiness },
    { to: "/profile", label: "Profile", icon: Upload }
  ];

  if (user?.role === "admin") {
    links.push({ to: "/security", label: "Security", icon: Shield });
    links.push({ to: "/admin", label: "Admin", icon: UserCog });
  }

  return (
    <div className="app-shell">
      <aside className="sidebar">
        <div className="brand-lockup">
          <Shield size={28} />
          <div>
            <strong>Secure Alumni</strong>
            <span>Engagement SOC</span>
          </div>
        </div>

        <nav className="nav-list">
          {links.map((link) => {
            const Icon = link.icon;
            return (
              <NavLink
                key={link.to}
                to={link.to}
                end={link.to === "/"}
                className={({ isActive }) => `nav-item ${isActive ? "active" : ""}`}
              >
                <Icon size={18} />
                <span>{link.label}</span>
              </NavLink>
            );
          })}
        </nav>
      </aside>

      <main className="content">
        <header className="topbar">
          <div>
            <p className="eyebrow mb-1">Signed in as {user?.role}</p>
            <h1>{user?.username}</h1>
          </div>
          <div className="topbar-actions">
            <button className="icon-button" title="Notifications" type="button">
              <Bell size={18} />
            </button>
            <button
              className="btn btn-outline-secondary btn-sm d-inline-flex align-items-center gap-2"
              type="button"
              onClick={() => {
                logout();
                navigate("/login");
              }}
            >
              <LogOut size={16} />
              Logout
            </button>
          </div>
        </header>

        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/directory" element={<Directory />} />
          <Route path="/events" element={<Events />} />
          <Route path="/mentorship" element={<Mentorship />} />
          <Route path="/opportunities" element={<Opportunities />} />
          <Route path="/profile" element={<Profile />} />
          <Route
            path="/security"
            element={
              <ProtectedRoute roles={["admin"]}>
                <SecurityDashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin"
            element={
              <ProtectedRoute roles={["admin"]}>
                <AdminPanel />
              </ProtectedRoute>
            }
          />
        </Routes>
      </main>
    </div>
  );
}

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route
            path="/*"
            element={
              <ProtectedRoute>
                <Shell />
              </ProtectedRoute>
            }
          />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;
