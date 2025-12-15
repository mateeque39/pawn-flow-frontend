import React, { useState } from 'react';
import { http } from './services/httpClient';
import logger from './services/logger';
import { getErrorMessage } from './services/errorHandler';

const RegisterForm = ({ onRegisterSuccess, onSwitchToLogin }) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage('');
    setLoading(true);

    // Validate passwords match
    if (password !== confirmPassword) {
      setMessage('❌ Passwords do not match');
      setLoading(false);
      return;
    }

    // Validate password length
    if (password.length < 6) {
      setMessage('❌ Password must be at least 6 characters long');
      setLoading(false);
      return;
    }

    // Validate username length
    if (username.length < 3) {
      setMessage('❌ Username must be at least 3 characters long');
      setLoading(false);
      return;
    }

    try {
      logger.debug('Registering user:', { username });
      await http.post('/register', { username, password });
      setMessage('✅ Account created successfully! Redirecting to login...');
      logger.info('User registered successfully', { username });
      
      // Redirect to login after 2 seconds
      setTimeout(() => {
        onRegisterSuccess();
      }, 2000);
    } catch (err) {
      const userMessage = err.userMessage || getErrorMessage(err.parsedError || {});
      setMessage(`❌ Registration failed: ${userMessage}`);
      logger.error('Registration failed', err.parsedError || err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="form-container">
      <h3 style={{ color: '#fff', textAlign: 'center', marginBottom: '30px' }}>Create Your Account</h3>
      
      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label>Username</label>
          <input
            type="text"
            placeholder="Choose a username (min 3 characters)"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            required
            disabled={loading}
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
            disabled={loading}
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
            disabled={loading}
          />
        </div>

        <button type="submit" className="btn-success" style={{ width: '100%' }} disabled={loading}>
          {loading ? 'Creating Account...' : 'Register'}
        </button>
      </form>

      {message && (
        <div className={`alert alert-${message.includes('✅') ? 'success' : 'error'}`} style={{ marginTop: '20px' }}>
          {message}
        </div>
      )}

      <div style={{ textAlign: 'center', marginTop: '20px' }}>
        <p>Already have an account? <button 
          onClick={onSwitchToLogin}
          style={{ 
            background: 'none', 
            border: 'none', 
            color: '#007bff', 
            textDecoration: 'underline', 
            cursor: 'pointer',
            fontWeight: 'bold'
          }}
        >
          Login here
        </button></p>
      </div>
    </div>
  );
};

export default RegisterForm;
