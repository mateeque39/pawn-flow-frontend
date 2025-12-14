import React, { useState } from 'react';
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
  const [showChangePasswordSection, setShowChangePasswordSection] = useState(false);
  const [changePasswordData, setChangePasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmNewPassword: ''
  });
  const [changePasswordMessage, setChangePasswordMessage] = useState('');
  const [changePasswordMessageType, setChangePasswordMessageType] = useState('');
  const [editingRoleId, setEditingRoleId] = useState(null);
  const [editingRoleValue, setEditingRoleValue] = useState('');

  const handleAdminPasswordSubmit = async (e) => {
    e.preventDefault();
    
    try {
      await http.post('/verify-admin-password', {
        password: adminPassword
      });

      setIsAuthenticated(true);
      setAdminPassword('');
      setMessage('');
      fetchAllAccounts();
    } catch (error) {
      setMessage('❌ Incorrect admin password');
      setMessageType('error');
      setAdminPassword('');
      logger.error('Error verifying admin password', error);
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
      await http.post('/register', {
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

  const handleChangeAdminPassword = async (e) => {
    e.preventDefault();
    setChangePasswordMessage('');

    // Validate inputs
    if (!changePasswordData.currentPassword || !changePasswordData.newPassword) {
      setChangePasswordMessage('❌ All fields are required');
      setChangePasswordMessageType('error');
      return;
    }

    if (changePasswordData.newPassword !== changePasswordData.confirmNewPassword) {
      setChangePasswordMessage('❌ New passwords do not match');
      setChangePasswordMessageType('error');
      return;
    }

    if (changePasswordData.newPassword.length < 8) {
      setChangePasswordMessage('❌ Password must be at least 8 characters');
      setChangePasswordMessageType('error');
      return;
    }

    if (!/[A-Z]/.test(changePasswordData.newPassword)) {
      setChangePasswordMessage('❌ Password must contain at least one uppercase letter');
      setChangePasswordMessageType('error');
      return;
    }

    if (!/[0-9]/.test(changePasswordData.newPassword)) {
      setChangePasswordMessage('❌ Password must contain at least one number');
      setChangePasswordMessageType('error');
      return;
    }

    try {
      await http.post('/update-admin-password', {
        currentPassword: changePasswordData.currentPassword,
        newPassword: changePasswordData.newPassword
      });

      setChangePasswordMessage('✅ Password updated successfully!');
      setChangePasswordMessageType('success');
      setChangePasswordData({ currentPassword: '', newPassword: '', confirmNewPassword: '' });
      setTimeout(() => {
        setShowChangePasswordSection(false);
        setChangePasswordMessage('');
      }, 2000);
    } catch (error) {
      const parsedError = parseError(error);
      const userMessage = getErrorMessage(parsedError);
      setChangePasswordMessage(`❌ ${userMessage}`);
      setChangePasswordMessageType('error');
      logger.error('Error updating admin password', parsedError);
    }
  };

  const handleChangeUserRole = async (userId, newRole) => {
    try {
      await http.put(`/change-user-role/${userId}`, {
        role: newRole
      });

      setMessage('✅ User role updated successfully!');
      setMessageType('success');
      setEditingRoleId(null);
      setEditingRoleValue('');
      fetchAllAccounts();
    } catch (error) {
      const parsedError = parseError(error);
      const userMessage = getErrorMessage(parsedError);
      setMessage(`❌ Error changing role: ${userMessage}`);
      setMessageType('error');
      logger.error('Error changing user role', parsedError);
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

      <div style={{ marginBottom: '20px', display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
        <button
          onClick={() => setShowRegisterForm(!showRegisterForm)}
          className="btn-success"
        >
          {showRegisterForm ? '✕ Cancel' : '➕ Register New Account'}
        </button>
        <button
          onClick={() => setShowChangePasswordSection(!showChangePasswordSection)}
          className="btn-warning"
        >
          {showChangePasswordSection ? '✕ Cancel' : '🔐 Change Admin Password'}
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

      {showChangePasswordSection && (
        <div style={{
          backgroundColor: '#f8f9fa',
          padding: '20px',
          borderRadius: '8px',
          marginBottom: '20px',
          border: '1px solid #ffc107'
        }}>
          <h4>🔐 Change Admin Password</h4>
          <form onSubmit={handleChangeAdminPassword}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '15px', maxWidth: '500px' }}>
              <div className="form-group">
                <label>Current Admin Password</label>
                <input
                  type="password"
                  placeholder="Enter current admin password"
                  value={changePasswordData.currentPassword}
                  onChange={(e) => setChangePasswordData({ ...changePasswordData, currentPassword: e.target.value })}
                  required
                />
              </div>
              <div className="form-group">
                <label>New Password</label>
                <input
                  type="password"
                  placeholder="Enter new password (min 8 chars, 1 uppercase, 1 number)"
                  value={changePasswordData.newPassword}
                  onChange={(e) => setChangePasswordData({ ...changePasswordData, newPassword: e.target.value })}
                  required
                />
              </div>
              <div className="form-group">
                <label>Confirm New Password</label>
                <input
                  type="password"
                  placeholder="Confirm new password"
                  value={changePasswordData.confirmNewPassword}
                  onChange={(e) => setChangePasswordData({ ...changePasswordData, confirmNewPassword: e.target.value })}
                  required
                />
              </div>
            </div>
            {changePasswordMessage && (
              <div className={`alert alert-${changePasswordMessageType === 'success' ? 'success' : 'error'}`} style={{ marginTop: '15px' }}>
                {changePasswordMessage}
              </div>
            )}
            <button type="submit" className="btn-warning" style={{ width: '100%', marginTop: '10px' }}>
              Update Password
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
                      <div style={{ display: 'flex', gap: '5px', justifyContent: 'center', flexWrap: 'wrap' }}>
                        {editingRoleId === account.id ? (
                          <>
                            <select
                              value={editingRoleValue}
                              onChange={(e) => setEditingRoleValue(e.target.value)}
                              style={{
                                padding: '4px 8px',
                                borderRadius: '4px',
                                border: '1px solid #ddd',
                                fontSize: '12px',
                                cursor: 'pointer'
                              }}
                            >
                              <option value="employee">Employee</option>
                              <option value="admin">Admin</option>
                            </select>
                            <button
                              onClick={() => handleChangeUserRole(account.id, editingRoleValue)}
                              style={{
                                padding: '4px 10px',
                                backgroundColor: '#28a745',
                                color: 'white',
                                border: 'none',
                                borderRadius: '4px',
                                cursor: 'pointer',
                                fontSize: '12px'
                              }}
                            >
                              Save
                            </button>
                            <button
                              onClick={() => {
                                setEditingRoleId(null);
                                setEditingRoleValue('');
                              }}
                              style={{
                                padding: '4px 10px',
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
                          </>
                        ) : (
                          <>
                            <button
                              onClick={() => {
                                setEditingRoleId(account.id);
                                setEditingRoleValue(account.role);
                              }}
                              style={{
                                padding: '4px 10px',
                                backgroundColor: '#17a2b8',
                                color: 'white',
                                border: 'none',
                                borderRadius: '4px',
                                cursor: 'pointer',
                                fontSize: '12px'
                              }}
                            >
                              Edit Role
                            </button>
                            {deleteConfirm === account.id ? (
                              <>
                                <button
                                  onClick={() => handleDeleteAccount(account.id)}
                                  style={{
                                    padding: '4px 10px',
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
                                    padding: '4px 10px',
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
                              </>
                            ) : (
                              <button
                                onClick={() => setDeleteConfirm(account.id)}
                                style={{
                                  padding: '4px 10px',
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
                          </>
                        )}
                      </div>
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
