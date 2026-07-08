// F:\portfolio-webapp\frontend\src\components\Admin\Login.js
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { FaEnvelope, FaLock, FaSpinner, FaUserShield, FaGoogle } from 'react-icons/fa';
import { supabase } from '../../utils/supabase';
import { toast } from 'react-toastify';
import './Admin.css';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  // ✅ Email/Password Login Function
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    const result = await login(email, password);
    setLoading(false);

    if (result.success) {
      navigate('/');
    }
  };

  // ✅ Google Login Function
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
            {/* Google Login Button - Force Show */}
<button 
  type="button" 
  onClick={handleGoogleLogin} 
  style={{
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '10px',
    width: '100%',
    padding: '12px',
    background: '#ffffff',
    border: '1px solid #dadce0',
    borderRadius: '8px',
    color: '#3c4043',
    fontSize: '15px',
    fontWeight: '500',
    cursor: 'pointer',
    marginBottom: '12px'
  }}
>
  <FaGoogle style={{ color: '#ea4335', fontSize: '20px' }} /> Continue with Google
</button>

<div style={{ display: 'flex', alignItems: 'center', gap: '12px', color: '#6A6A8A', margin: '16px 0' }}>
  <hr style={{ flex: 1, border: 'none', borderTop: '1px solid #333' }} />
  <span>or</span>
  <hr style={{ flex: 1, border: 'none', borderTop: '1px solid #333' }} />
</div>

            <div className="divider">or</div>

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
