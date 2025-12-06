import React, { useState } from 'react';
import { http } from './services/httpClient';
import { parseError, getErrorMessage } from './services/errorHandler';
import logger from './services/logger';

const ExtendLoanForm = ({ loggedInUser }) => {
  const [transactionNumber, setTransactionNumber] = useState('');
  const [loan, setLoan] = useState(null);
  const [message, setMessage] = useState('');
  const [messageType, setMessageType] = useState(''); // 'success' or 'error'

  // Search loan by transaction number
  const handleSearchLoan = async () => {
    if (!transactionNumber.trim()) {
      setMessage('Please enter a transaction number');
      setMessageType('error');
      return;
    }

    try {
      const response = await http.get('/search-loan', {
        params: { transactionNumber, _ts: Date.now() },
      });

      if (!response || response.length === 0) {
        setMessage('Loan not found');
        setMessageType('error');
        setLoan(null);
      } else {
        setLoan(response[0]);
        setMessage('');
        setMessageType('');
        logger.debug('Loan found', { transactionNumber });
      }
    } catch (error) {
      const parsedError = parseError(error);
      const userMessage = getErrorMessage(parsedError);
      setMessage(userMessage);
      setMessageType('error');
      setLoan(null);
      logger.error('Error searching for loan', parsedError);
    }
  };

  // Extend loan due date
  const handleExtendLoan = async () => {
    if (!loan) {
      setMessage('No loan selected');
      setMessageType('error');
      return;
    }

    try {
      const response = await http.post('/extend-loan', {
        loanId: loan.id,
        extendedByUserId: loggedInUser?.id,
        extendedByUsername: loggedInUser?.username
      });

      setMessage(response.message || 'Loan extended successfully!');
      setMessageType('success');
      setLoan(response.loan || loan);
      logger.info('Loan extended successfully', { loanId: loan.id });
    } catch (error) {
      const parsedError = parseError(error);
      const userMessage = getErrorMessage(parsedError);
      setMessage(userMessage);
      setMessageType('error');
      logger.error('Error extending loan', parsedError);
    }
  };

  return (
    <div className="form-container">
      <h3>Extend Loan Due Date</h3>

      <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '15px', marginBottom: '20px' }}>
        <div className="form-group">
          <label>Transaction Number</label>
          <input
            type="text"
            placeholder="Enter transaction number"
            value={transactionNumber}
            onChange={(e) => setTransactionNumber(e.target.value)}
          />
        </div>
        <button onClick={handleSearchLoan} className="btn-primary" style={{ height: 'fit-content', alignSelf: 'flex-end' }}>Search Loan</button>
      </div>

      {/* Message Area */}
      {message && (
        <div className={`alert alert-${messageType}`} style={{ marginBottom: '20px' }}>
          {message}
        </div>
      )}

      {/* Display Loan Details */}
      {loan && (
        <div className="card">
          <div className="card-header">Loan Details</div>

          <div style={{ marginTop: '15px', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
            <div>
              <p><strong>Customer Name:</strong> {loan.customer_name}</p>
              <p><strong>Phone Number:</strong> {loan.customer_number}</p>
              <p><strong>Email:</strong> {loan.email}</p>
            </div>
            <div>
              <p><strong>Loan Amount:</strong> $ {parseFloat(loan.loan_amount).toFixed(2)}</p>
              <p><strong>Interest Rate:</strong> {loan.interest_rate}%</p>
              <p><strong>Interest Amount:</strong> $ {parseFloat(loan.interest_amount).toFixed(2)}</p>
            </div>
          </div>

          <div style={{ marginTop: '20px', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
            <div>
              <p><strong>Total Payable Amount:</strong> $ {parseFloat(loan.total_payable_amount).toFixed(2)}</p>
              <p><strong>Remaining Balance:</strong> $ {parseFloat(loan.remaining_balance).toFixed(2)}</p>
            </div>
            <div>
              <p><strong>Loan Issued Date:</strong> {new Date(loan.loan_issued_date).toLocaleDateString()}</p>
              <p><strong>Current Due Date:</strong> {new Date(loan.due_date).toLocaleDateString()}</p>
            </div>
          </div>

          <div style={{ marginTop: '20px' }}>
            <p><strong>Status:</strong> <span className={`badge badge-${loan.status === 'active' ? 'success' : 'danger'}`}>{loan.status}</span></p>
            <p><strong>Transaction Number:</strong> {loan.transaction_number}</p>
            <p><strong>Collateral:</strong> {loan.item_description || loan.itemDescription || loan.collateral_description || loan.collateralDescription || 'N/A'}</p>
          </div>

          {/* Extend Button - Only show if loan is active and due date has passed */}
          {loan.status === 'active' && (
            <div style={{ marginTop: '20px' }}>
              <button 
                onClick={handleExtendLoan}
                className="btn-warning"
                style={{ width: '100%' }}
              >
                Extend Loan by 30 Days
              </button>
            </div>
          )}

          {loan.status !== 'active' && (
            <div className="alert alert-warning" style={{ marginTop: '20px' }}>
              ⚠️ Loan status is '{loan.status}'. Cannot extend non-active loans.
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default ExtendLoanForm;
