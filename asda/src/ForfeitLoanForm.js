import React, { useState } from 'react';
import axios from 'axios';

const ForfeitLoanForm = ({ loggedInUser }) => {
  const [transactionNumber, setTransactionNumber] = useState('');
  const [loan, setLoan] = useState(null);
  const [message, setMessage] = useState('');
  const [messageType, setMessageType] = useState(''); // 'success' or 'error'
  const [forfeitHistory, setForfeitHistory] = useState([]);
  const [userId, setUserId] = useState(1); // Assuming userId is 1 for now

  // Search loan by transaction number
  const handleSearchLoan = async () => {
    if (!transactionNumber.trim()) {
      setMessage('Please enter a transaction number');
      setMessageType('error');
      return;
    }

    try {
      const response = await axios.get('http://localhost:5000/search-loan', {
        params: { transactionNumber },
      });

      if (!response.data || response.data.length === 0) {
        setMessage('Loan not found');
        setMessageType('error');
        setLoan(null);
      } else {
        setLoan(response.data[0]);
        setMessage('');
        setMessageType('');
      }
    } catch (error) {
      setMessage('Error searching for loan');
      setMessageType('error');
      setLoan(null);
      console.error(error);
    }
  };

  // Forfeit loan
  const handleForfeitLoan = async () => {
    if (!loan) {
      setMessage('No loan selected');
      setMessageType('error');
      return;
    }

    // Validation: Loan balance must be zero
    if (loan.remaining_balance > 0) {
      setMessage(`Loan balance is not zero. Remaining balance: $ ${loan.remaining_balance}. Cannot forfeit.`);
      setMessageType('error');
      return;
    }

    // Validation: Loan must not already be redeemed or forfeited
    if (loan.status === 'redeemed' || loan.status === 'forfeited') {
      setMessage(`Loan has already been ${loan.status}. Cannot forfeit.`);
      setMessageType('error');
      return;
    }

    try {
      const response = await axios.post('http://localhost:5000/forfeit-loan', {
        loanId: loan.id,
        forfeitedByUserId: loggedInUser?.id,
        forfeitedByUsername: loggedInUser?.username
      });

      setMessage(response.data.message);
      setMessageType('success');
      setLoan({ ...loan, status: 'forfeited' });
      setForfeitHistory([response.data.forfeitHistory, ...forfeitHistory]);
    } catch (error) {
      setMessage(error.response?.data?.message || 'Error forfeiting loan');
      setMessageType('error');
      console.error(error);
    }
  };

  return (
    <div className="form-container">
      <h3>Forfeit Loan</h3>

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
        <div className="card" style={{ marginBottom: '20px' }}>
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
              <p><strong>Due Date:</strong> {new Date(loan.due_date).toLocaleDateString()}</p>
            </div>
          </div>

          <div style={{ marginTop: '20px' }}>
            <p><strong>Status:</strong> <span className={`badge badge-${loan.status === 'active' ? 'success' : 'danger'}`}>{loan.status}</span></p>
            <p><strong>Transaction Number:</strong> {loan.transaction_number}</p>
            <p><strong>Collateral:</strong> {loan.collateral_description}</p>
          </div>

          {/* Forfeit Button - Only show if loan is active and balance is 0 */}
          {loan.status === 'active' && loan.remaining_balance === 0 && (
            <div style={{ marginTop: '20px' }}>
              <button 
                onClick={handleForfeitLoan}
                className="btn-danger"
                style={{ width: '100%' }}
              >
                Forfeit Loan (Collateral Kept)
              </button>
              <div className="alert alert-warning" style={{ marginTop: '15px' }}>
                ⚠️ Warning: Forfeiting means the collateral will be kept by the pawn shop.
              </div>
            </div>
          )}

          {loan.status !== 'active' && (
            <div className="alert alert-warning" style={{ marginTop: '20px' }}>
              ⚠️ Loan status is '{loan.status}'. Cannot forfeit non-active loans.
            </div>
          )}

          {loan.status === 'active' && loan.remaining_balance > 0 && (
            <div className="alert alert-warning" style={{ marginTop: '20px' }}>
              ⚠️ Loan balance must be zero to forfeit. Current balance: $ {parseFloat(loan.remaining_balance).toFixed(2)}
            </div>
          )}
        </div>
      )}

      {/* Forfeit History */}
      {forfeitHistory.length > 0 && (
        <div className="card">
          <div className="card-header">Forfeit History</div>
          <div style={{ marginTop: '15px' }}>
            {forfeitHistory.map((forfeit) => (
              <div key={forfeit.id} style={{ borderBottom: '1px solid #e0e6ed', paddingBottom: '15px', marginBottom: '15px' }}>
                <p><strong>Forfeited By:</strong> User {forfeit.redeemed_by}</p>
                <p><strong>Forfeited At:</strong> {new Date(forfeit.redeemed_at).toLocaleString()}</p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default ForfeitLoanForm;
