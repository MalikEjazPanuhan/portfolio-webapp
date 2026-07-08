// F:\portfolio-webapp\frontend\src\App.js
import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import './styles/App.css';

// Context
import { AuthProvider } from './context/AuthContext';

// Components
import Login from './components/Admin/Login';
import AdminLayout from './components/Admin/AdminLayout';
import Dashboard from './components/Admin/Dashboard';
import ProjectsManager from './components/Admin/ProjectsManager';
import VideosManager from './components/Admin/VideosManager';
import RatingsManager from './components/Admin/RatingsManager';
import ContactsManager from './components/Admin/ContactsManager';
import Analytics from './components/Admin/Analytics';
import CertificatesManager from './components/Admin/CertificatesManager'; // ✅ ADD THIS

// Protected Route Component
const ProtectedRoute = ({ children }) => {
  const token = localStorage.getItem('token');
  if (!token) {
    return <Navigate to="/login" replace />;
  }
  return children;
};

function App() {
  return (
    <AuthProvider>
      <Router>
        <div className="app-container">
          <Routes>
            {/* Public Routes */}
            <Route path="/login" element={<Login />} />
            
            {/* Protected Admin Routes */}
            <Route path="/" element={
              <ProtectedRoute>
                <AdminLayout>
                  <Dashboard />
                </AdminLayout>
              </ProtectedRoute>
            } />
            
            <Route path="/projects" element={
              <ProtectedRoute>
                <AdminLayout>
                  <ProjectsManager />
                </AdminLayout>
              </ProtectedRoute>
            } />
            
            <Route path="/videos" element={
              <ProtectedRoute>
                <AdminLayout>
                  <VideosManager />
                </AdminLayout>
              </ProtectedRoute>
            } />
            
            <Route path="/ratings" element={
              <ProtectedRoute>
                <AdminLayout>
                  <RatingsManager />
                </AdminLayout>
              </ProtectedRoute>
            } />
            
            <Route path="/contacts" element={
              <ProtectedRoute>
                <AdminLayout>
                  <ContactsManager />
                </AdminLayout>
              </ProtectedRoute>
            } />
            
            <Route path="/analytics" element={
              <ProtectedRoute>
                <AdminLayout>
                  <Analytics />
                </AdminLayout>
              </ProtectedRoute>
            } />

            {/* ✅ ADD THIS ROUTE */}
            <Route path="/certificates" element={
              <ProtectedRoute>
                <AdminLayout>
                  <CertificatesManager />
                </AdminLayout>
              </ProtectedRoute>
            } />
          </Routes>
          
          <ToastContainer 
            position="bottom-right"
            autoClose={3000}
            hideProgressBar={false}
            newestOnTop
            closeOnClick
            rtl={false}
            pauseOnFocusLoss
            draggable
            pauseOnHover
            theme="dark"
          />
        </div>
      </Router>
    </AuthProvider>
  );
}

export default App;
