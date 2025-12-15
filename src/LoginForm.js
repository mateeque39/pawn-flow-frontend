import React, { useState } from 'react';
import { http } from './services/httpClient';
import logger from './services/logger';
import { getErrorMessage } from './services/errorHandler';

const LoginForm = ({ onLoginSuccess, onSwitchToRegister, onSwitchToAdminPanel }) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [message, setMessage] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      logger.debug('Attempting login for user:', { username });
      const res = await http.post('/login', { username, password });
      
      // After successful login, pass the user details to the parent component (App)
      const user = { username: res.data.username, id: res.data.id };
      // Store token in localStorage for httpClient interceptor
      if (res.data.token) {
        localStorage.setItem('authToken', res.data.token);
      }
      onLoginSuccess(user);
      logger.info('Login successful', { username });
      setMessage('Login successful!');
    } catch (err) {
      const userMessage = err.userMessage || getErrorMessage(err.parsedError || {});
      setMessage(`❌ Login failed: ${userMessage}`);
      logger.error('Login failed', err.parsedError || err);
    }
  };

  return (
    <div className="form-container">
      <h3 style={{ color: '#fff !important', textAlign: 'center', marginBottom: '30px', fontWeight: 'bold' }}>Login to Your Account</h3>
      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label>Username</label>
          <input
            type="text"
            placeholder="Enter your username"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            required
          />
        </div>
        <div className="form-group">
          <label>Password</label>
          <input
            type="password"
            placeholder="Enter your password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
        </div>
        <button type="submit" className="btn-primary" style={{ width: '100%' }}>Login</button>
      </form>
      {message && (
        <div className={`alert alert-${message.includes('✅') ? 'success' : 'error'}`} style={{ marginTop: '20px' }}>
          {message}
        </div>
      )}

      <div style={{ textAlign: 'center', marginTop: '20px' }}>
        <p>Need admin access? <button 
          onClick={onSwitchToAdminPanel}
          style={{ 
            background: 'none', 
            border: 'none', 
            color: '#28a745', 
            textDecoration: 'underline', 
            cursor: 'pointer',
            fontWeight: 'bold'
          }}
        >
          Admin Panel
        </button></p>
      </div>
    </div>
  );
};

export default LoginForm;

