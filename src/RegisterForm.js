import React, { useState, useEffect } from 'react';
import { http } from './services/httpClient';
import logger from './services/logger';
import { getErrorMessage } from './services/errorHandler';

const RegisterForm = ({ onRegisterSuccess }) => {
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [role, setRole] = useState('user'); // Default role is 'user'
  const [message, setMessage] = useState('');
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);

  // Check if current user is an admin on component mount
  useEffect(() => {
    const checkAdminStatus = async () => {
      try {
        const currentUser = await http.get('/api/users/current');
        setIsAdmin(currentUser.role === 'admin');
      } catch (err) {
        logger.debug('User not authenticated or error checking admin status');
        setIsAdmin(false);
      } finally {
        setLoading(false);
      }
    };
    checkAdminStatus();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Security check: Only admins can register new users
    if (!isAdmin) {
      setMessage('Only administrators can register new users');
      logger.warn('Unauthorized registration attempt by non-admin user');
      return;
    }

    // Validate passwords match
    if (password !== confirmPassword) {
      setMessage('Passwords do not match');
      return;
    }

    // Validate password length
    if (password.length < 6) {
      setMessage('Password must be at least 6 characters long');
      return;
    }

    try {
      logger.debug('Registering user:', { username, email, role });
      await http.post('/register', { username, email, password, role });
      setMessage('User registered successfully! Redirecting to login...');
      logger.info('User registered successfully', { username, email, role });
      
      // Redirect to login after 2 seconds
      setTimeout(() => {
        onRegisterSuccess();
      }, 2000);
    } catch (err) {
      const userMessage = err.userMessage || getErrorMessage(err.parsedError || {});
      setMessage(`Error registering user: ${userMessage}`);
      logger.error('Registration failed', err.parsedError || err);
    }
  };

  return (
    <div className="form-container">
      <h3>Create New Account</h3>
      
      {loading ? (
        <div className="alert alert-info">
          Verifying permissions...
        </div>
      ) : !isAdmin ? (
        <div className="alert alert-error">
          <strong>Access Denied:</strong> Only administrators can register new users. Please contact an admin to create new accounts.
        </div>
      ) : (
        <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label>Username</label>
          <input
            type="text"
            placeholder="Choose a username"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            required
          />
        </div>

        <div className="form-group">
          <label>Email Address</label>
          <input
            type="email"
            placeholder="Enter your email address"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
        </div>

        <div className="form-group">
          <label>Password</label>
          <input
            type="password"
            placeholder="Create a strong password (min 6 characters)"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
        </div>

        <div className="form-group">
          <label>Confirm Password</label>
          <input
            type="password"
            placeholder="Re-enter your password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            required
          />
        </div>

        <div className="form-group">
          <label>Role</label>
          <select value={role} onChange={(e) => setRole(e.target.value)} required>
            <option value="user">User</option>
            <option value="manager">Manager</option>
            <option value="admin">Admin</option>
          </select>
        </div>

        <button type="submit" className="btn-success" style={{ width: '100%' }}>Register</button>
      </form>
      )}
      {message && (
        <div className={`alert alert-${message.includes('successfully') ? 'success' : 'error'}`} style={{ marginTop: '20px' }}>
          {message}
        </div>
      )}
    </div>
  );
};

export default RegisterForm;
