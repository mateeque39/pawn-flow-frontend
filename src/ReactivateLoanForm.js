import React, { useState } from 'react';
import { http } from './services/httpClient';
import { parseError, getErrorMessage } from './services/errorHandler';
import logger from './services/logger';

const ReactivateLoanForm = ({ loggedInUser }) => {
  const [loanId, setLoanId] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [messageType, setMessageType] = useState('');
  const [loanDetails, setLoanDetails] = useState(null);
  const [confirmReactivate, setConfirmReactivate] = useState(false);

  // Search for forfeited loan
  const handleSearchLoan = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const response = await http.get(`/loans/${loanId}`, {
        params: { _ts: Date.now() }
      });

      const loan = response?.data || response;

      // Check if loan is actually forfeited
      if (loan.status !== 'forfeited' && loan.status !== 'FORFEITED') {
        setMessage('This loan is not forfeited. Only forfeited loans can be reactivated.');
        setMessageType('warning');
        setLoanDetails(null);
        logger.warn('Attempted to reactivate non-forfeited loan', { loanId, status: loan.status });
      } else {
        setLoanDetails(loan);
        setMessage('');
        setMessageType('');
        setConfirmReactivate(false);
        logger.info('Forfeited loan found', { loanId, status: loan.status });
      }
    } catch (error) {
      const parsedError = error.parsedError || parseError(error);
      const userMessage = error.userMessage || getErrorMessage(parsedError);
      setMessage(userMessage);
      setMessageType('error');
      setLoanDetails(null);
      logger.error('Error searching for loan', parsedError);
    } finally {
      setLoading(false);
    }
  };

  // Reactivate the forfeited loan
  const handleReactivate = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const response = await http.post(`/loans/${loanId}/reactivate`, {
        reactivatedByUserId: loggedInUser?.id,
        reactivatedByUsername: loggedInUser?.username,
        reactivationDate: new Date().toISOString()
      });

      const result = response?.data || response;
      setMessage('✅ Loan successfully reactivated! The forfeiture has been undone.');
      setMessageType('success');
      setLoanId('');
      setLoanDetails(null);
      setConfirmReactivate(false);
      logger.info('Loan reactivated successfully', { loanId, reactivatedBy: loggedInUser?.username });
    } catch (error) {
      const parsedError = error.parsedError || parseError(error);
      const userMessage = error.userMessage || getErrorMessage(parsedError);
      setMessage(userMessage);
      setMessageType('error');
      logger.error('Error reactivating loan', parsedError);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="form-container">
      <h3>Reactivate Forfeited Loan</h3>
      <p style={{ color: '#888', marginBottom: '20px', fontSize: '13px' }}>
        Undo a loan forfeiture and restore it to active status. Only forfeited loans can be reactivated.
      </p>

      {/* Message Area */}
      {message && (
        <div className={`alert alert-${messageType}`} style={{ marginBottom: '20px' }}>
          {message}
        </div>
      )}

      {/* Search Form */}
      {!loanDetails ? (
        <form onSubmit={handleSearchLoan}>
          <div className="form-group">
            <label htmlFor="loanId">Loan ID *</label>
            <input
              type="text"
              id="loanId"
              value={loanId}
              onChange={(e) => setLoanId(e.target.value)}
              placeholder="Enter loan ID to search"
              required
              disabled={loading}
            />
          </div>

          <button type="submit" className="btn-primary" disabled={loading || !loanId}>
            {loading ? 'Searching...' : 'Search Forfeited Loan'}
          </button>
        </form>
      ) : (
        <div>
          {/* Loan Details Display */}
          <div className="card" style={{ marginBottom: '20px' }}>
            <div className="card-header">Forfeited Loan Details</div>
            <div style={{ padding: '20px' }}>
              <div className="card-field">
                <strong>Loan ID:</strong>
                <span>{loanDetails.id}</span>
              </div>
              <div className="card-field">
                <strong>Status:</strong>
                <span style={{ color: '#dc3545', textTransform: 'uppercase' }}>{loanDetails.status}</span>
              </div>
              <div className="card-field">
                <strong>Customer Name:</strong>
                <span>
                  {loanDetails.firstName} {loanDetails.lastName}
                </span>
              </div>
              <div className="card-field">
                <strong>Phone:</strong>
                <span>{loanDetails.homePhone || loanDetails.mobilePhone || 'N/A'}</span>
              </div>
              <div className="card-field">
                <strong>Loan Amount:</strong>
                <span>${loanDetails.loanAmount?.toFixed(2) || '0.00'}</span>
              </div>
              <div className="card-field">
                <strong>Interest Rate:</strong>
                <span>{loanDetails.interestRate || '0'}%</span>
              </div>
              <div className="card-field">
                <strong>Created Date:</strong>
                <span>{new Date(loanDetails.createdAt).toLocaleDateString()}</span>
              </div>
              <div className="card-field">
                <strong>Forfeited Date:</strong>
                <span>{loanDetails.forfeitedAt ? new Date(loanDetails.forfeitedAt).toLocaleDateString() : 'N/A'}</span>
              </div>
              <div className="card-field">
                <strong>Item Description:</strong>
                <span>{loanDetails.itemDescription || 'N/A'}</span>
              </div>
            </div>
          </div>

          {/* Confirmation */}
          {!confirmReactivate ? (
            <div style={{ display: 'flex', gap: '10px' }}>
              <button
                onClick={() => setConfirmReactivate(true)}
                className="btn-success"
                disabled={loading}
              >
                Proceed with Reactivation
              </button>
              <button
                onClick={() => {
                  setLoanDetails(null);
                  setLoanId('');
                }}
                className="btn-primary"
                disabled={loading}
              >
                Cancel
              </button>
            </div>
          ) : (
            <div>
              <div
                style={{
                  backgroundColor: '#fff3cd',
                  padding: '18px',
                  borderRadius: '12px',
                  marginBottom: '20px',
                  borderLeft: '5px solid #ffc107',
                }}
              >
                <strong style={{ color: '#856404' }}>⚠️ Confirmation Required</strong>
                <p style={{ color: '#856404', margin: '10px 0 0 0', fontSize: '14px' }}>
                  You are about to reactivate loan <strong>{loanDetails.id}</strong>. This will undo the forfeiture
                  and restore the loan to active status. This action can be logged for audit purposes. Continue?
                </p>
              </div>

              <div style={{ display: 'flex', gap: '10px' }}>
                <button onClick={handleReactivate} className="btn-success" disabled={loading}>
                  {loading ? 'Reactivating...' : '✓ Confirm Reactivation'}
                </button>
                <button
                  onClick={() => setConfirmReactivate(false)}
                  className="btn-primary"
                  disabled={loading}
                >
                  Cancel
                </button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default ReactivateLoanForm;
