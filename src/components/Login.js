import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import '../styles.css';
import { authAPI } from '../services/api';
import { storage } from '../utils/storage';

const Login = ({ onLogin }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      // Call login API
      const response = await authAPI.login(email, password);
      
      // Save auth data to localStorage
      storage.setAuthData(response.token, response.user);
      
      // Show success message (optional)
      console.log(response.message || 'Login successful');
      
      // Call parent onLogin callback
      onLogin();
      
      // Redirect to settings page
      navigate('/settings');
      
    } catch (err) {
      console.error('Login error:', err);
      setError(err.message || 'Login failed. Please check your credentials.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-container">

      {/* Right Side - Login Form */}
      <div className="login-right">
        <form className="login-form" onSubmit={handleSubmit}>
          <div className="login-header">
            <div className="login-logo">
              <div className="login-logo-icon"><img src={require('../assets/naari-logo.png')} alt="Naari Art" className='login-logo' /></div>
              <div className="login-logo-text">Naari Art</div>
            </div>
            <h2 className="login-title">Sign In</h2>
            <p className="login-subtitle">Enter your credentials to access your account</p>
          </div>

          <div className="form-group">
            <label className="form-label" htmlFor="email">
              Email Address
            </label>
            <input
              type="email"
              id="email"
              className="form-input"
              placeholder="Enter your email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              disabled={loading}
              required
            />
          </div>

          <div className="form-group">
            <label className="form-label" htmlFor="password">
              Password
            </label>
            <input
              type="password"
              id="password"
              className="form-input"
              placeholder="Enter your password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              disabled={loading}
              required
            />
          </div>

          {error && (
            <div className="form-error" style={{ color: 'var(--alert-color)', marginBottom: '16px', fontSize: '14px' }}>
              {error}
            </div>
          )}

          <div className="form-checkbox-group">
            <div className="checkbox-wrapper">
              <input
                type="checkbox"
                id="remember"
                className="checkbox"
                checked={rememberMe}
                onChange={(e) => setRememberMe(e.target.checked)}
              />
              <label htmlFor="remember" className="checkbox-label">
                Remember me
              </label>
            </div>
            <a href="#forgot" className="forgot-link">
              Forgot password?
            </a>
          </div>

          <button type="submit" className="login-button" disabled={loading}>
            {loading ? 'Signing In...' : 'Sign In'}
          </button>

          {/* <div className="signup-prompt">
            Don't have an account? <a href="#signup" className="signup-link">Sign up</a>
          </div> */}
        </form>
      </div>
    </div>
  );
};

export default Login;
