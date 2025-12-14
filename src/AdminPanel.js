import React, { useState, useEffect } from 'react';
import { http } from './services/httpClient';
import { parseError, getErrorMessage } from './services/errorHandler';
import logger from './services/logger';

const AdminPanel = ({ onSwitchToLogin }) => {
  const [adminPassword, setAdminPassword] = useState('');
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [message, setMessage] = useState('');
  const [messageType, setMessageType] = useState('');
  
  const [accounts, setAccounts] = useState([]);
  const [loadingAccounts, setLoadingAccounts] = useState(false);
  const [showRegisterForm, setShowRegisterForm] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState(null);
  
  const [registerData, setRegisterData] = useState({
    username: '',
    password: '',
    confirmPassword: '',
    role: 'employee'
  });

  const ADMIN_PASSWORD = 'pawnflowniran!@#12';

  const handleAdminPasswordSubmit = (e) => {
    e.preventDefault();
    
    if (adminPassword === ADMIN_PASSWORD) {
      setIsAuthenticated(true);
      setAdminPassword('');
      setMessage('');
      fetchAllAccounts();
    } else {
      setMessage('❌ Incorrect admin password');
      setMessageType('error');
      setAdminPassword('');
    }
  };

  const fetchAllAccounts = async () => {
    setLoadingAccounts(true);
    try {
      const response = await http.get('/all-accounts');
      setAccounts(response?.data || []);
      setMessage('');
      logger.debug('Fetched all accounts', { count: response?.data?.length || 0 });
    } catch (error) {
      const parsedError = parseError(error);
      const userMessage = getErrorMessage(parsedError);
      setMessage(`❌ Error loading accounts: ${userMessage}`);
      setMessageType('error');
      logger.error('Error fetching accounts', parsedError);
      setAccounts([]);
    } finally {
      setLoadingAccounts(false);
    }
  };

  const handleDeleteAccount = async (accountId) => {
    try {
      await http.delete(`/delete-account/${accountId}`);
      setMessage('✅ Account deleted successfully!');
      setMessageType('success');
      setDeleteConfirm(null);
      fetchAllAccounts();
    } catch (error) {
      const parsedError = parseError(error);
      const userMessage = getErrorMessage(parsedError);
      setMessage(`❌ Error deleting account: ${userMessage}`);
      setMessageType('error');
      logger.error('Error deleting account', parsedError);
    }
  };

  const handleRegisterAccount = async (e) => {
    e.preventDefault();
    setMessage('');

    if (!registerData.username || !registerData.password) {
      setMessage('❌ Username and password are required');
      setMessageType('error');
      return;
    }

    if (registerData.password !== registerData.confirmPassword) {
      setMessage('❌ Passwords do not match');
      setMessageType('error');
      return;
    }

    if (registerData.password.length < 8) {
      setMessage('❌ Password must be at least 8 characters');
      setMessageType('error');
      return;
    }

    // Check password complexity (uppercase + number)
    const hasUppercase = /[A-Z]/.test(registerData.password);
    const hasNumber = /[0-9]/.test(registerData.password);
    if (!hasUppercase || !hasNumber) {
      setMessage('❌ Password must contain at least one uppercase letter and one number');
      setMessageType('error');
      return;
    }

    try {
      const response = await http.post('/register', {
        username: registerData.username,
        password: registerData.password,
        role: registerData.role
      });

      setMessage('✅ Account registered successfully!');
      setMessageType('success');
      setRegisterData({ username: '', password: '', confirmPassword: '', role: 'employee' });
      setShowRegisterForm(false);
      fetchAllAccounts();
    } catch (error) {
      const parsedError = parseError(error);
      const userMessage = getErrorMessage(parsedError);
      setMessage(`❌ Registration failed: ${userMessage}`);
      setMessageType('error');
      logger.error('Registration error', parsedError);
    }
  };

  if (!isAuthenticated) {
    return (
      <div className="form-container" style={{ maxWidth: '400px' }}>
        <h2>Admin Panel</h2>
        <form onSubmit={handleAdminPasswordSubmit}>
          <div className="form-group">
            <label>Admin Password</label>
            <input
              type="password"
              placeholder="Enter admin password"
              value={adminPassword}
              onChange={(e) => setAdminPassword(e.target.value)}
              required
              autoFocus
            />
          </div>
          <button type="submit" className="btn-primary" style={{ width: '100%' }}>
            Access Admin Panel
          </button>
        </form>
        {message && (
          <div className={`alert alert-${messageType === 'success' ? 'success' : 'error'}`} style={{ marginTop: '20px' }}>
            {message}
          </div>
        )}
        <button
          onClick={onSwitchToLogin}
          style={{
            width: '100%',
            marginTop: '15px',
            padding: '10px',
            backgroundColor: '#6c757d',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            cursor: 'pointer',
            fontWeight: 'bold'
          }}
        >
          Back to Login
        </button>
      </div>
    );
  }

  return (
    <div style={{ maxWidth: '1000px', margin: '0 auto', padding: '20px' }}>
      <h2>Admin Panel</h2>

      <div style={{ marginBottom: '20px', display: 'flex', gap: '10px' }}>
        <button
          onClick={() => setShowRegisterForm(!showRegisterForm)}
          className="btn-success"
        >
          {showRegisterForm ? '✕ Cancel' : '➕ Register New Account'}
        </button>
        <button
          onClick={() => {
            setIsAuthenticated(false);
            setAccounts([]);
            onSwitchToLogin();
          }}
          className="btn-danger"
        >
          Back to Login
        </button>
      </div>

      {message && (
        <div className={`alert alert-${messageType === 'success' ? 'success' : 'error'}`} style={{ marginBottom: '20px' }}>
          {message}
        </div>
      )}

      {showRegisterForm && (
        <div style={{
          backgroundColor: '#f8f9fa',
          padding: '20px',
          borderRadius: '8px',
          marginBottom: '20px',
          border: '1px solid #ddd'
        }}>
          <h4>Register New Account</h4>
          <form onSubmit={handleRegisterAccount}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px' }}>
              <div className="form-group">
                <label>Username</label>
                <input
                  type="text"
                  placeholder="Enter username"
                  value={registerData.username}
                  onChange={(e) => setRegisterData({ ...registerData, username: e.target.value })}
                  required
                />
              </div>
              <div className="form-group">
                <label>Role</label>
                <select
                  value={registerData.role}
                  onChange={(e) => setRegisterData({ ...registerData, role: e.target.value })}
                >
                  <option value="employee">Employee</option>
                  <option value="admin">Admin</option>
                </select>
              </div>
              <div className="form-group">
                <label>Password</label>
                <input
                  type="password"
                  placeholder="Enter password (min 8 chars, 1 uppercase, 1 number)"
                  value={registerData.password}
                  onChange={(e) => setRegisterData({ ...registerData, password: e.target.value })}
                  required
                />
              </div>
              <div className="form-group">
                <label>Confirm Password</label>
                <input
                  type="password"
                  placeholder="Confirm password"
                  value={registerData.confirmPassword}
                  onChange={(e) => setRegisterData({ ...registerData, confirmPassword: e.target.value })}
                  required
                />
              </div>
            </div>
            <button type="submit" className="btn-success" style={{ width: '100%', marginTop: '10px' }}>
              Register Account
            </button>
          </form>
        </div>
      )}

      <div style={{
        backgroundColor: '#f8f9fa',
        padding: '20px',
        borderRadius: '8px',
        border: '1px solid #ddd'
      }}>
        <h4>All Registered Accounts ({accounts.length})</h4>

        {loadingAccounts && (
          <p style={{ textAlign: 'center', color: '#666' }}>Loading accounts...</p>
        )}

        {!loadingAccounts && accounts.length === 0 && (
          <p style={{ textAlign: 'center', color: '#999' }}>No accounts found</p>
        )}

        {!loadingAccounts && accounts.length > 0 && (
          <div style={{ overflowX: 'auto' }}>
            <table style={{
              width: '100%',
              borderCollapse: 'collapse',
              marginTop: '15px'
            }}>
              <thead>
                <tr style={{ backgroundColor: '#e9ecef', borderBottom: '2px solid #dee2e6' }}>
                  <th style={{ padding: '12px', textAlign: 'left' }}>ID</th>
                  <th style={{ padding: '12px', textAlign: 'left' }}>Username</th>
                  <th style={{ padding: '12px', textAlign: 'left' }}>Role</th>
                  <th style={{ padding: '12px', textAlign: 'left' }}>Created</th>
                  <th style={{ padding: '12px', textAlign: 'center' }}>Action</th>
                </tr>
              </thead>
              <tbody>
                {accounts.map((account) => (
                  <tr key={account.id} style={{ borderBottom: '1px solid #dee2e6' }}>
                    <td style={{ padding: '12px' }}>{account.id}</td>
                    <td style={{ padding: '12px' }}>{account.username}</td>
                    <td style={{ padding: '12px' }}>
                      <span style={{
                        padding: '4px 8px',
                        borderRadius: '4px',
                        backgroundColor: account.role === 'admin' ? '#dc3545' : '#007bff',
                        color: 'white',
                        fontSize: '12px',
                        fontWeight: 'bold'
                      }}>
                        {account.role}
                      </span>
                    </td>
                    <td style={{ padding: '12px' }}>
                      {new Date(account.created_at).toLocaleDateString()}
                    </td>
                    <td style={{ padding: '12px', textAlign: 'center' }}>
                      {deleteConfirm === account.id ? (
                        <div style={{ display: 'flex', gap: '5px', justifyContent: 'center' }}>
                          <button
                            onClick={() => handleDeleteAccount(account.id)}
                            style={{
                              padding: '5px 10px',
                              backgroundColor: '#dc3545',
                              color: 'white',
                              border: 'none',
                              borderRadius: '4px',
                              cursor: 'pointer',
                              fontSize: '12px'
                            }}
                          >
                            Confirm
                          </button>
                          <button
                            onClick={() => setDeleteConfirm(null)}
                            style={{
                              padding: '5px 10px',
                              backgroundColor: '#6c757d',
                              color: 'white',
                              border: 'none',
                              borderRadius: '4px',
                              cursor: 'pointer',
                              fontSize: '12px'
                            }}
                          >
                            Cancel
                          </button>
                        </div>
                      ) : (
                        <button
                          onClick={() => setDeleteConfirm(account.id)}
                          style={{
                            padding: '5px 10px',
                            backgroundColor: '#dc3545',
                            color: 'white',
                            border: 'none',
                            borderRadius: '4px',
                            cursor: 'pointer',
                            fontSize: '12px'
                          }}
                        >
                          Delete
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminPanel;
