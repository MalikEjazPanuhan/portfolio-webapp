// F:\portfolio-webapp\frontend\src\components\Admin\Login.js
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { FaEnvelope, FaLock, FaSpinner, FaUserShield } from 'react-icons/fa';
import { supabase } from '../../utils/supabase';
import { toast } from 'react-toastify';
import './Admin.css';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  // Email/Password Login
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    const result = await login(email, password);
    setLoading(false);

    if (result.success) {
      navigate('/');
    }
  };

  // Google Login
  const handleGoogleLogin = async () => {
    try {
      const { data, error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: window.location.origin
        }
      });
      if (error) {
        toast.error(error.message);
      }
    } catch (error) {
      toast.error('Google login failed');
    }
  };

  return (
    <div className="login-page">
      <div className="login-container">
        <div className="login-card">
          <div className="login-header">
            <div className="login-logo">
              <FaUserShield />
              <h1>Portfolio <span>360</span></h1>
            </div>
            <p className="login-subtitle">Admin Dashboard Login</p>
          </div>

          <form onSubmit={handleSubmit} className="login-form">
            {/* Google Login Button - Professional Style */}
<button 
  type="button" 
  onClick={handleGoogleLogin} 
  className="google-btn"
>
  <svg width="20" height="20" viewBox="0 0 24 24" className="google-icon">
    <path fill="#EA4335" d="M12 5c1.6 0 3.1.6 4.2 1.7l3.2-3.2C17.1 1.5 14.7 0 12 0 7.3 0 3.2 2.8 1.3 6.8l3.8 3c1-2.6 3.6-4.8 6.9-4.8z"/>
    <path fill="#FBBC05" d="M23.5 12.3c0-.8-.1-1.6-.2-2.3H12v4.5h6.5c-.3 1.5-1.2 2.8-2.5 3.6l3.8 3c2.2-2.1 3.7-5.2 3.7-8.8z"/>
    <path fill="#34A853" d="M5.1 14.8c-.5-1.1-.8-2.3-.8-3.6s.3-2.5.8-3.6l-3.8-3C.5 6.8 0 9.3 0 12s.5 5.2 1.3 7.4l3.8-2.6z"/>
    <path fill="#4285F4" d="M12 24c3.3 0 6.1-1.1 8.1-3l-3.8-3c-1.1.7-2.5 1.1-4.3 1.1-3.3 0-6.1-2.2-7.1-5.2l-3.8 3C3.2 21.2 7.3 24 12 24z"/>
  </svg>
  <span>Continue with Google</span>
</button>

            {/* Divider - Centered OR */}
<div className="divider">
  <span className="divider-line"></span>
  <span className="divider-text">OR</span>
  <span className="divider-line"></span>
</div>

            <div className="form-group">
              <label>Email Address</label>
              <div className="input-wrapper">
                <FaEnvelope className="input-icon" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="admin@yourportfolio.com"
                  required
                  disabled={loading}
                />
              </div>
            </div>

            <div className="form-group">
              <label>Password</label>
              <div className="input-wrapper">
                <FaLock className="input-icon" />
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter your password"
                  required
                  disabled={loading}
                />
              </div>
            </div>

            <button type="submit" className="login-btn" disabled={loading}>
              {loading ? (
                <>
                  <FaSpinner className="spinner" /> Logging in...
                </>
              ) : (
                'Login'
              )}
            </button>
          </form>

          <div className="login-footer">
            <p>🔒 Secure Admin Panel</p>
            <small>v1.0.0</small>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
