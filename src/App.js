import React, { useState, useEffect } from 'react';
import logger from './services/logger';
import { http } from './services/httpClient';
import RegisterForm from './RegisterForm';
import LoginForm from './LoginForm';
import ShiftManagement from './ShiftManagement';
import CashReport from './CashReport';
import CreateCustomerProfileForm from './CreateCustomerProfileForm';
import ManageCustomerProfileForm from './ManageCustomerProfileForm';
import UpdateCustomerForm from './UpdateCustomerForm';
import PDFSettingsForm from './PDFSettingsForm';
import ErrorBoundary from './ErrorBoundary'; // Import the ErrorBoundary component

function App() {
  const [isLogin, setIsLogin] = useState(true);
  const [isRegister, setIsRegister] = useState(false);
  const [loggedInUser, setLoggedInUser] = useState(() => {
    // Restore logged-in user from localStorage on app load
    const saved = localStorage.getItem('loggedInUser');
    if (saved) {
      try {
        const user = JSON.parse(saved);
        // SECURITY: Only restore if valid token exists
        if (user && user.token) {
          logger.info('User session restored from localStorage');
          return user;
        } else {
          // Invalid session - force re-login
          localStorage.removeItem('loggedInUser');
          return null;
        }
      } catch (e) {
        logger.warn('Failed to parse saved user:', e);
        localStorage.removeItem('loggedInUser');
        return null;
      }
    }
    return null;
  });
  const [selectedOption, setSelectedOption] = useState('');
  const [isDarkMode, setIsDarkMode] = useState(() => {
    // Get dark mode preference from localStorage
    const saved = localStorage.getItem('darkMode');
    return saved ? JSON.parse(saved) : false;
  });

  // Apply dark mode class to document
  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add('dark-mode');
    } else {
      document.documentElement.classList.remove('dark-mode');
    }
    localStorage.setItem('darkMode', JSON.stringify(isDarkMode));
  }, [isDarkMode]);

  // Handle Login Success (set logged-in user)
  const handleLoginSuccess = (user) => {
    setLoggedInUser(user);
    setIsLogin(false);
    setIsRegister(false); // Hide register form
    // Save user to localStorage to persist across page refreshes
    localStorage.setItem('loggedInUser', JSON.stringify(user));
    logger.info('User logged in successfully:', { username: user.username, role: user.role });
  };

  // Handle Logout
  const handleLogout = async () => {
    try {
      // Validate user ID before making request
      if (!loggedInUser?.user_id) {
        logger.warn('Logout: No valid user_id found, proceeding with logout');
        setLoggedInUser(null);
        localStorage.removeItem('loggedInUser');
        return;
      }

      // Check if user has an active shift
      const response = await http.get(`/current-shift/${loggedInUser.user_id}`);
      const activeShift = response?.data;
      
      if (activeShift && activeShift.shift_end_time === null) {
        // User has an active shift
        alert('You cannot logout before closing your shift. Please end your shift first.');
        logger.warn('Logout blocked - user has active shift', { userId: loggedInUser.user_id });
        return;
      }
    } catch (error) {
      // If we get 404 or other errors, it means no active shift (which is good)
      logger.debug('No active shift found, proceeding with logout');
    }
    
    // No active shift, proceed with logout
    setLoggedInUser(null); // Clear logged-in user state
    setIsLogin(true); // Redirect back to login
    setIsRegister(false); // Hide register form
    // Remove user from localStorage
    localStorage.removeItem('loggedInUser');
    setSelectedOption(''); // Clear selected menu option
    logger.info('User logged out');
  };

  const toggleDarkMode = () => {
    setIsDarkMode(!isDarkMode);
  };

  return (
    <div className="App">
      <div className="pawnflow-header">
        <button 
          className="theme-toggle" 
          onClick={toggleDarkMode}
          title={isDarkMode ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
        >
          {isDarkMode ? '☀️ Light' : '🌙 Dark'}
        </button>
        <div className="header-content">
          <img src="/pawnflow-logo.png" alt="PawnFlow Logo" className="logo-img-title" />
        </div>
      </div>

      <div className="container">
        {isRegister ? (
          <div className="form-container">
            <h2>Create New Account</h2>
            <RegisterForm 
              onRegisterSuccess={() => {
                setIsRegister(false);
                setIsLogin(true);
              }}
              onSwitchToLogin={() => {
                setIsRegister(false);
                setIsLogin(true);
              }}
            />
          </div>
        ) : isLogin ? (
          <div className="form-container">
            <h2>Login</h2>
            <LoginForm 
              onLoginSuccess={handleLoginSuccess}
              onSwitchToRegister={() => {
                setIsLogin(false);
                setIsRegister(true);
              }}
            />
          </div>
        ) : loggedInUser ? (
          <div>
            <h2 style={{ textAlign: 'center', marginBottom: '20px' }}>Welcome to Dashboard, {loggedInUser.username}</h2>
            <div className="menu">
              <button className="btn-primary" onClick={() => setSelectedOption('create-profile')}>👤 Create Customer Profile</button>
              <button className="btn-success" onClick={() => setSelectedOption('manage-profile')}>⚙️ Manage Profile & Loans</button>
              <button className="btn-info" onClick={() => setSelectedOption('edit-loan')}>✏️ Edit Existing Loan</button>
              <button className="btn-warning" onClick={() => setSelectedOption('pdf-settings')}>📄 PDF Settings</button>
              <button className="btn-info" onClick={() => setSelectedOption('shift-management')}>Shift Management</button>
              <button className="btn-success" onClick={() => setSelectedOption('cash-report')}>💰 Cash Report</button>
              {loggedInUser?.role === 'admin' && (
                <button className="btn-warning" onClick={() => setSelectedOption('register-user')}>👥 Register User (Admin Only)</button>
              )}
              <button className="btn-danger" onClick={handleLogout}>Logout</button>
            </div>

            {/* Wrap the components inside ErrorBoundary to catch runtime errors */}
            <ErrorBoundary>
              {selectedOption === 'create-profile' && <CreateCustomerProfileForm loggedInUser={loggedInUser} />}
              {selectedOption === 'manage-profile' && <ManageCustomerProfileForm loggedInUser={loggedInUser} />}
              {selectedOption === 'edit-loan' && <UpdateCustomerForm loggedInUser={loggedInUser} />}
              {selectedOption === 'pdf-settings' && <PDFSettingsForm loggedInUser={loggedInUser} />}
              {selectedOption === 'shift-management' && <ShiftManagement userId={loggedInUser?.id} />}
              {selectedOption === 'cash-report' && <CashReport loggedInUser={loggedInUser} />}
              {selectedOption === 'register-user' && loggedInUser?.role === 'admin' && (
                <div className="form-container">
                  <h3>Register New User (Admin Only)</h3>
                  <RegisterForm loggedInUser={loggedInUser} onRegisterSuccess={() => setSelectedOption('')} />
                </div>
              )}
            </ErrorBoundary>
          </div>
        ) : (
          <div className="form-container">
            <h2>Session Expired</h2>
            <p>Please log in again to continue.</p>
            <LoginForm 
              onLoginSuccess={handleLoginSuccess}
              onSwitchToRegister={() => {
                setIsLogin(false);
                setIsRegister(true);
              }}
            />
          </div>
        )}
      </div>
    </div>
  );
}

export default App;