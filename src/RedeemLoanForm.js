import React, { useState, useEffect } from 'react';
import { http } from './services/httpClient';
import { parseError, getErrorMessage } from './services/errorHandler';
import logger from './services/logger';

const RedeemLoanForm = ({ loggedInUser }) => {
  const [loanId, setLoanId] = useState('');
  const [loans, setLoans] = useState([]);  // Store multiple loans
  const [message, setMessage] = useState('');
  const [userId, setUserId] = useState(1); // Assuming userId is 1 for Admin/Manager for now (can be dynamic)
  const [redeemHistory, setRedeemHistory] = useState([]);
  const [forfeitMessage, setForfeitMessage] = useState('');  // Forfeit message

  // Search loan by transaction number
  const handleSearchLoan = async () => {
    try {
      const response = await http.get('/search-loan', {
        params: { transactionNumber: loanId, _ts: Date.now() },
      });

      if (response.length === 0) {
        setMessage('Loan not found');
        setLoans([]);
      } else {
        setLoans(response);
        setMessage('');
        logger.debug('Loans found', { count: response.length });
      }
    } catch (error) {
      const parsedError = parseError(error);
      const userMessage = getErrorMessage(parsedError);
      setMessage(userMessage);
      logger.error('Error searching loan', parsedError);
    }
  };

  // Redeem the loan if fully paid
  const handleRedeemLoan = async (loan) => {
    if (loan.remaining_balance > 0) {
      setMessage('Loan is not fully paid, cannot redeem');
      return;
    }

    try {
      const response = await http.post('/redeem-loan', {
        loanId: loan.id,
        redeemedByUserId: loggedInUser?.id,
        redeemedByUsername: loggedInUser?.username
      });

      setMessage('Loan redeemed successfully!');
      setRedeemHistory([response.redeemHistory, ...redeemHistory]);
      setLoans(loans.map((l) => (l.id === loan.id ? { ...l, status: 'redeemed' } : l)));
      logger.info('Loan redeemed successfully', { loanId: loan.id });
    } catch (error) {
      const parsedError = parseError(error);
      const userMessage = getErrorMessage(parsedError);
      setMessage(userMessage);
      logger.error('Error redeeming loan', parsedError);
    }
  };

  // Forfeit loan if balance is 0 and status is active
  const handleForfeitLoan = async (loan) => {
    if (loan.remaining_balance > 0) {
      setForfeitMessage('Loan balance is not zero, cannot forfeit');
      return;
    }

    try {
      const response = await http.post('/forfeit-loan', {
        loanId: loan.id,
        forfeitedByUserId: loggedInUser?.id,
        forfeitedByUsername: loggedInUser?.username
      });

      setForfeitMessage('Loan forfeited successfully!');
      setLoans(loans.map((l) => (l.id === loan.id ? { ...l, status: 'forfeited' } : l)));
      logger.info('Loan forfeited successfully', { loanId: loan.id });
    } catch (error) {
      const parsedError = parseError(error);
      const userMessage = getErrorMessage(parsedError);
      setForfeitMessage(userMessage);
      logger.error('Error forfeiting loan', parsedError);
    }
  };

  return (
    <div className="form-container">
      <h3>Redeem or Forfeit Loan</h3>
      
      <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '15px', marginBottom: '20px' }}>
        <div className="form-group">
          <label>Loan Transaction Number</label>
          <input
            type="text"
            placeholder="Enter transaction number"
            value={loanId}
            onChange={(e) => setLoanId(e.target.value)}
          />
        </div>
        <button onClick={handleSearchLoan} className="btn-primary" style={{ height: 'fit-content', alignSelf: 'flex-end' }}>Search Loan</button>
      </div>

      {message && (
        <div className={`alert alert-${message.includes('not') ? 'error' : 'success'}`} style={{ marginBottom: '20px' }}>
          {message}
        </div>
      )}
      {forfeitMessage && (
        <div className={`alert alert-${forfeitMessage.includes('not') ? 'error' : 'success'}`} style={{ marginBottom: '20px' }}>
          {forfeitMessage}
        </div>
      )}

      {loans.length > 0 && (
        <div>
          <h4 style={{ borderBottom: '2px solid #667eea', paddingBottom: '10px', marginBottom: '20px' }}>Loan Details ({loans.length})</h4>
          {loans.map((loan) => (
            <div key={loan.id} className="card" style={{ marginBottom: '20px' }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', marginBottom: '15px' }}>
                <p><strong>Customer Name:</strong> {loan.customer_name}</p>
                <p><strong>Loan Amount:</strong> $ {loan.loan_amount}</p>
                <p><strong>Remaining Balance:</strong> $ {loan.remaining_balance}</p>
                <p><strong>Status:</strong> <span className={`badge badge-${loan.status === 'active' ? 'success' : loan.status === 'redeemed' ? 'info' : 'danger'}`}>{loan.status}</span></p>
              </div>

              <p><strong>Collateral:</strong> {loan.item_description || loan.itemDescription || loan.collateral_description || loan.collateralDescription || 'N/A'}</p>

              {/* Redeem or Forfeit buttons */}
              {loan.remaining_balance === 0 && loan.status === 'active' && (
                <div style={{ display: 'flex', gap: '10px', marginTop: '15px' }}>
                  <button onClick={() => handleRedeemLoan(loan)} className="btn-success">✓ Redeem Loan</button>
                  <button onClick={() => handleForfeitLoan(loan)} className="btn-danger">✕ Forfeit Loan</button>
                </div>
              )}

              {/* If not eligible for redemption/forfeiting */}
              {loan.remaining_balance > 0 && loan.status === 'active' && (
                <div className="alert alert-warning" style={{ marginTop: '15px' }}>
                  ⚠️ Loan balance must be $ 0 to redeem or forfeit. Current balance: $ {loan.remaining_balance}
                </div>
              )}

              {loan.status !== 'active' && (
                <div className="alert alert-info" style={{ marginTop: '15px' }}>
                  ℹ️ This loan has already been {loan.status}.
                </div>
              )}
            </div>
          ))}

          {/* Redeem History */}
          <h4 style={{ borderBottom: '2px solid #667eea', paddingBottom: '10px', marginBottom: '20px', marginTop: '30px' }}>Redeem History</h4>
          {redeemHistory.length > 0 ? (
            <div>
              {redeemHistory.map((redeem) => (
                <div key={redeem.id} className="card" style={{ marginBottom: '10px' }}>
                  <p><strong>Redeemed By:</strong> User {redeem.redeemed_by}</p>
                  <p><strong>Redeemed At:</strong> {new Date(redeem.redeemed_at).toLocaleString()}</p>
                </div>
              ))}
            </div>
          ) : (
            <p style={{ color: '#999' }}>No redeem history found.</p>
          )}
        </div>
      )}
    </div>
  );
};

export default RedeemLoanForm;
