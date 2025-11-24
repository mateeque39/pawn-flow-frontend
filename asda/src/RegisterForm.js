import React, { useState } from 'react';
import axios from 'axios';

const RegisterForm = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState('user'); // Default role is 'user'
  const [message, setMessage] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const res = await axios.post('http://localhost:5000/register', { username, password, role });
      setMessage('User registered successfully!');
    } catch (err) {
      setMessage('Error registering user');
    }
  };

  return (
    <div className="form-container">
      <h3>Create New Account</h3>
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
          <label>Password</label>
          <input
            type="password"
            placeholder="Create a strong password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
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
      {message && (
        <div className={`alert alert-${message.includes('successfully') ? 'success' : 'error'}`} style={{ marginTop: '20px' }}>
          {message}
        </div>
      )}
    </div>
  );
};

export default RegisterForm;
