import React, { useState } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';  // Import the Link component for navigation

const LoginForm = ({ onLoginSuccess }) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [message, setMessage] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const res = await axios.post('http://localhost:5000/login', { username, password });
      
      // After successful login, pass the user details to the parent component (App)
      const user = { username: res.data.username }; // Assuming the backend returns the username
      onLoginSuccess(user);  // This will trigger the state update in App.js

      setMessage('Login successful!');
    } catch (err) {
      setMessage('Login failed: Invalid credentials');
    }
  };

  return (
    <div className="form-container">
      <h3>Login to Your Account</h3>
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
        <div className={`alert alert-${message.includes('successful') ? 'success' : 'error'}`} style={{ marginTop: '20px' }}>
          {message}
        </div>
      )}

      <div style={{ textAlign: 'center', marginTop: '20px' }}>
        <p>Don't have an account? <a href="/register">Register here</a></p>
      </div>
    </div>
  );
};

export default LoginForm;
