import React, { useState, useEffect } from 'react';
import { Route, Switch, Redirect } from 'react-router-dom';  // Import needed routing components
import RegisterForm from './RegisterForm';
import LoginForm from './LoginForm';
import CreateLoanForm from './CreateLoanForm';
import SearchLoanForm from './SearchLoanForm';
import MakePaymentForm from './MakePaymentForm';
import RedeemLoanForm from './RedeemLoanForm';
import ExtendLoanForm from './ExtendLoanForm';
import ForfeitLoanForm from './ForfeitLoanForm';
import ShiftManagement from './ShiftManagement';
import CheckDueDateForm from './CheckDueDateForm';
import ErrorBoundary from './ErrorBoundary'; // Import the ErrorBoundary component

function App() {
  const [isLogin, setIsLogin] = useState(true);
  const [loggedInUser, setLoggedInUser] = useState(null); // Track logged-in user
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
  };

  // Handle Logout
  const handleLogout = () => {
    setLoggedInUser(null); // Clear logged-in user state
    setIsLogin(true); // Redirect back to login
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
        {isLogin ? (
          <div className="form-container">
            <h2>Login</h2>
            <LoginForm onLoginSuccess={handleLoginSuccess} />
            <p style={{ textAlign: 'center', marginTop: '20px' }}>
              Don't have an account? <a href="/register">Register here</a>
            </p>
          </div>
        ) : (
          <div>
            <h2 style={{ textAlign: 'center', marginBottom: '20px' }}>Welcome to Dashboard, {loggedInUser.username}</h2>
            <div className="menu">
              <button className="btn-primary" onClick={() => setSelectedOption('create-loan')}>Create Loan</button>
              <button className="btn-info" onClick={() => setSelectedOption('search-loan')}>Search Loan</button>
              <button className="btn-success" onClick={() => setSelectedOption('make-payment')}>Make Payments</button>
              <button className="btn-warning" onClick={() => setSelectedOption('extend-loan')}>Extend Loan</button>
              <button className="btn-primary" onClick={() => setSelectedOption('redeem-loan')}>Redeem Loan</button>
              <button className="btn-danger" onClick={() => setSelectedOption('forfeit-loan')}>Forfeit Loan</button>
              <button className="btn-info" onClick={() => setSelectedOption('shift-management')}>Shift Management</button>
              <button className="btn-warning" onClick={() => setSelectedOption('check-due-date')}>Check Due Date</button>
              <button className="btn-danger" onClick={handleLogout}>Logout</button>
            </div>

            {/* Wrap the components inside ErrorBoundary to catch runtime errors */}
            <ErrorBoundary>
              {selectedOption === 'create-loan' && <CreateLoanForm loggedInUser={loggedInUser} />}
              {selectedOption === 'search-loan' && <SearchLoanForm loggedInUser={loggedInUser} />}
              {selectedOption === 'make-payment' && <MakePaymentForm loggedInUser={loggedInUser} />}
              {selectedOption === 'extend-loan' && <ExtendLoanForm loggedInUser={loggedInUser} />}
              {selectedOption === 'redeem-loan' && <RedeemLoanForm loggedInUser={loggedInUser} />}
              {selectedOption === 'forfeit-loan' && <ForfeitLoanForm loggedInUser={loggedInUser} />}
              {selectedOption === 'shift-management' && <ShiftManagement />}
              {selectedOption === 'check-due-date' && <CheckDueDateForm />}
            </ErrorBoundary>
          </div>
        )}
      </div>
    </div>
  );
}

export default App;