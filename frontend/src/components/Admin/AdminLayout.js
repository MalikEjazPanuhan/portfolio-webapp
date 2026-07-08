// F:\portfolio-webapp\frontend\src\components\Admin\AdminLayout.js
import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { 
  FaHome, 
  FaProjectDiagram, 
  FaVideo, 
  FaStar, 
  FaEnvelope, 
  FaChartBar, 
  FaSignOutAlt, 
  FaUser, 
  FaBars, 
  FaTimes,
  FaCertificate  // ✅ Only ONCE
} from 'react-icons/fa';
import './Admin.css';

const AdminLayout = ({ children }) => {
  const { user, logout } = useAuth();
  const location = useLocation();
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);
  const [theme, setTheme] = useState(localStorage.getItem('portfolio-theme') || 'dark');

  // Load theme on mount - SYNC WITH CV PORTFOLIO
  useEffect(() => {
    const savedTheme = localStorage.getItem('portfolio-theme') || 'dark';
    const themeToApply = savedTheme === 'light' ? 'light' : 'dark';
    setTheme(themeToApply);
    document.body.setAttribute('data-theme', themeToApply);
    if (themeToApply === 'light') {
      document.body.classList.add('light-theme');
    } else {
      document.body.classList.remove('light-theme');
    }
  }, []);

  const handleThemeChange = (e) => {
    const newTheme = e.target.value;
    setTheme(newTheme);
    document.body.setAttribute('data-theme', newTheme);
    localStorage.setItem('portfolio-theme', newTheme === 'dark' ? 'dark' : 'light');
    if (newTheme === 'light') {
      document.body.classList.add('light-theme');
    } else {
      document.body.classList.remove('light-theme');
    }
  };

  const toggleMobileSidebar = () => {
    setMobileSidebarOpen(!mobileSidebarOpen);
  };

  const closeMobileSidebar = () => {
    setMobileSidebarOpen(false);
  };

  const menuItems = [
    { path: '/', label: 'Dashboard', icon: <FaHome /> },
    { path: '/projects', label: 'Projects', icon: <FaProjectDiagram /> },
    { path: '/videos', label: 'Videos', icon: <FaVideo /> },
    { path: '/ratings', label: 'Ratings', icon: <FaStar /> },
    { path: '/contacts', label: 'Contacts', icon: <FaEnvelope /> },
    { path: '/analytics', label: 'Analytics', icon: <FaChartBar /> },
    { path: '/certificates', label: 'Certificates', icon: <FaCertificate /> },
  ];

  return (
    <div className="admin-layout">
      {/* Mobile Toggle */}
      <button className="sidebar-toggle" onClick={toggleMobileSidebar}>
        {mobileSidebarOpen ? <FaTimes /> : <FaBars />}
      </button>

      {/* Sidebar */}
      <aside className={`admin-sidebar ${mobileSidebarOpen ? 'open' : ''}`}>
        <div className="sidebar-header">
          <div className="sidebar-logo">
            <h1>Portfolio <span>360</span></h1>
            <small>Admin Panel</small>
          </div>
        </div>

        <nav className="sidebar-nav">
          {menuItems.map((item) => (
            <Link
              key={item.path}
              to={item.path}
              className={`nav-link ${location.pathname === item.path ? 'active' : ''}`}
              onClick={closeMobileSidebar}
            >
              <span className="nav-icon">{item.icon}</span>
              <span className="nav-label">{item.label}</span>
            </Link>
          ))}
        </nav>

        <div className="sidebar-footer">
          <div className="user-info">
            <div className="user-avatar">
              <FaUser />
            </div>
            <div className="user-details">
              <span className="user-name">{user?.full_name || 'Admin'}</span>
              <span className="user-email">{user?.email || 'admin@portfolio.com'}</span>
            </div>
          </div>

          {/* Theme Selector - Sync with CV */}
          <div className="theme-selector">
            <label>🎨 Theme:</label>
            <select 
              value={theme}
              onChange={handleThemeChange}
              className="theme-select"
            >
              <option value="dark">🌙 Dark</option>
              <option value="light">☀️ Light</option>
            </select>
          </div>

          <button onClick={logout} className="logout-btn">
            <FaSignOutAlt /> Logout
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="admin-main">
        <div className="admin-content">
          {children}
        </div>
      </main>
    </div>
  );
};

export default AdminLayout;
