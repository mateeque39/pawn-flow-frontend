import React, { useState, useEffect } from 'react';
import { http } from './services/httpClient';
import { parseError, getErrorMessage } from './services/errorHandler';
import './DetailedLoansBreakdown.css';

const DetailedLoansBreakdown = () => {
  const [breakdownData, setBreakdownData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [expandedCustomers, setExpandedCustomers] = useState({});

  // Fetch detailed loans breakdown
  const fetchBreakdown = async () => {
    setLoading(true);
    setError('');
    try {
      const params = { status: statusFilter };
      if (startDate) params.startDate = startDate;
      if (endDate) params.endDate = endDate;

      const response = await http.get('/detailed-loans-breakdown', { params });
      const data = response?.data || response;
      setBreakdownData(data);
    } catch (err) {
      const parsedError = err.parsedError || parseError(err);
      setError('Failed to fetch loans breakdown: ' + getErrorMessage(parsedError));
      console.error('Error fetching breakdown:', err);
    } finally {
      setLoading(false);
    }
  };

  // Fetch on component mount
  useEffect(() => {
    fetchBreakdown();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Toggle customer expansion
  const toggleCustomer = (customerName) => {
    setExpandedCustomers(prev => ({
      ...prev,
      [customerName]: !prev[customerName]
    }));
  };

  // Format currency
  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount);
  };

  // Format date
  const formatDate = (date) => {
    if (!date) return 'N/A';
    return new Date(date).toLocaleDateString('en-US');
  };

  // Get status badge color
  const getStatusBadgeClass = (status) => {
    switch (status) {
      case 'overdue':
        return 'badge-danger';
      case 'due-today':
        return 'badge-warning';
      case 'active':
      default:
        return 'badge-success';
    }
  };

  // Get status text
  const getStatusText = (statusDetail, statusOriginal) => {
    switch (statusDetail) {
      case 'overdue':
        return 'OVERDUE';
      case 'due-today':
        return 'DUE TODAY';
      case 'active':
      default:
        return statusOriginal?.toUpperCase() || 'ACTIVE';
    }
  };

  if (loading) {
    return <div className="breakdown-container"><p className="loading">Loading loans breakdown...</p></div>;
  }

  if (error) {
    return (
      <div className="breakdown-container">
        <p className="error">{error}</p>
        <button onClick={fetchBreakdown} className="btn-retry">Retry</button>
      </div>
    );
  }

  const summary = breakdownData?.summary || {};
  const customerGroups = breakdownData?.customerGroups || [];

  return (
    <div className="breakdown-container">
      <h2>📊 Detailed Loans Breakdown</h2>

      {/* Filters */}
      <div className="filters-section">
        <div className="filter-group">
          <label>Status Filter:</label>
          <select 
            value={statusFilter} 
            onChange={(e) => {
              setStatusFilter(e.target.value);
            }}
          >
            <option value="all">All Loans</option>
            <option value="active">Active Loans</option>
            <option value="overdue">Overdue Loans</option>
          </select>
        </div>

        <div className="filter-group">
          <label>From Date:</label>
          <input 
            type="date" 
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
          />
        </div>

        <div className="filter-group">
          <label>To Date:</label>
          <input 
            type="date" 
            value={endDate}
            onChange={(e) => setEndDate(e.target.value)}
          />
        </div>

        <button onClick={fetchBreakdown} className="btn-primary">
          {loading ? 'Loading...' : 'Refresh'}
        </button>
      </div>

      {/* Summary Cards */}
      <div className="summary-cards">
        <div className="card">
          <h3>Total Customers</h3>
          <p className="value">{summary.totalCustomers}</p>
        </div>
        <div className="card">
          <h3>Total Loans</h3>
          <p className="value">{summary.totalLoans}</p>
        </div>
        <div className="card">
          <h3>Total Loan Amount</h3>
          <p className="value">{formatCurrency(summary.totalLoanAmount)}</p>
        </div>
        <div className="card">
          <h3>Total Interest</h3>
          <p className="value">{formatCurrency(summary.totalInterest)}</p>
        </div>
        <div className="card">
          <h3>Total Paid</h3>
          <p className="value">{formatCurrency(summary.totalPaid)}</p>
        </div>
        <div className="card">
          <h3>Loans with Payments</h3>
          <p className="value">{summary.loansWithPayments}</p>
        </div>
        <div className="card">
          <h3>Active Loans</h3>
          <p className="value highlight-success">{summary.activeLoans}</p>
        </div>
        <div className="card">
          <h3>Overdue Loans</h3>
          <p className="value highlight-danger">{summary.overdueLoans}</p>
        </div>
      </div>

      {/* Customers and Loans List */}
      <div className="loans-section">
        <h3>Loans by Customer</h3>
        {customerGroups.length === 0 ? (
          <p className="no-data">No loans found matching the selected criteria.</p>
        ) : (
          <div className="customer-groups">
            {customerGroups.map((group, idx) => (
              <div key={idx} className="customer-group">
                <div 
                  className="customer-header"
                  onClick={() => toggleCustomer(group.customerName)}
                >
                  <span className="toggle-icon">
                    {expandedCustomers[group.customerName] ? '▼' : '▶'}
                  </span>
                  <span className="customer-name">{group.customerName}</span>
                  <span className="loan-count">{group.loans.length} loans</span>
                </div>

                {expandedCustomers[group.customerName] && (
                  <div className="loans-list">
                    <table className="loans-table">
                      <thead>
                        <tr>
                          <th>Transaction #</th>
                          <th>Loan Amount</th>
                          <th>Interest</th>
                          <th>Due Date</th>
                          <th>Status</th>
                          <th>Payment Status</th>
                          <th>Total Paid</th>
                          <th>Remaining</th>
                          <th>Payment Count</th>
                        </tr>
                      </thead>
                      <tbody>
                        {group.loans.map((loan, loanIdx) => (
                          <tr key={loanIdx} className={`status-${loan.statusDetail}`}>
                            <td>{loan.transactionNumber}</td>
                            <td>{formatCurrency(loan.loanAmount)}</td>
                            <td>{formatCurrency(loan.interestAmount)}</td>
                            <td>{formatDate(loan.dueDate)}</td>
                            <td>
                              <span className={`badge ${getStatusBadgeClass(loan.statusDetail)}`}>
                                {getStatusText(loan.statusDetail, loan.status)}
                              </span>
                              {loan.statusDetail === 'overdue' && loan.daysOverdue > 0 && (
                                <span className="days-overdue">({loan.daysOverdue}d)</span>
                              )}
                            </td>
                            <td>
                              {loan.hasPayment ? (
                                <span className="payment-badge payment-yes">✓ Paid ({loan.paymentCount})</span>
                              ) : (
                                <span className="payment-badge payment-no">✗ No Payment</span>
                              )}
                            </td>
                            <td>{formatCurrency(loan.totalPaid)}</td>
                            <td>{formatCurrency(loan.remainingBalance)}</td>
                            <td>{loan.paymentCount}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default DetailedLoansBreakdown;
