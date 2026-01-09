import React, { useState } from 'react';
import { http } from './services/httpClient';
import { parseError, getErrorMessage } from './services/errorHandler';
import logger from './services/logger';

const EditLoanForm = ({ loggedInUser }) => {
  const [searchId, setSearchId] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [messageType, setMessageType] = useState('');
  const [loanData, setLoanData] = useState(null);
  const [editMode, setEditMode] = useState(false);

  // Form state for editing
  const [formData, setFormData] = useState({
    loanAmount: '',
    interestRate: '',
    loanTerm: '',
    collateralDescription: '',
    customerNote: ''
  });

  // Search for loan by transaction number
  const handleSearchLoan = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const response = await http.get(`/loans/transaction/${searchId}`, {
        params: { _ts: Date.now() }
      });

      const loan = response?.data || response;
      const loanDetails = loan.loanDetails || {};

      setLoanData({
        id: loan.id,
        transactionNumber: loan.transactionNumber,
        customerName: loan.customerInfo?.firstName + ' ' + loan.customerInfo?.lastName || 'Unknown',
        loanAmount: loanDetails.loanAmount || 0,
        interestRate: loanDetails.interestRate || 0,
        interestAmount: loanDetails.interestAmount || 0,
        totalPayableAmount: loanDetails.totalPayableAmount || 0,
        loanTerm: loanDetails.loanTerm || 0,
        status: loanDetails.status || 'unknown',
        dueDate: loanDetails.dueDate || 'N/A',
        loanIssuedDate: loanDetails.loanIssuedDate || 'N/A',
        remainingBalance: loanDetails.remainingBalance || 0,
        collateralDescription: loan.collateralDescription || '',
        customerNote: loan.customerNote || ''
      });

      setFormData({
        loanAmount: loanDetails.loanAmount || '',
        interestRate: loanDetails.interestRate || '',
        loanTerm: loanDetails.loanTerm || '',
        collateralDescription: loan.collateralDescription || '',
        customerNote: loan.customerNote || ''
      });

      setEditMode(false);
      setMessage('');
      setMessageType('');
      logger.info('Loan data retrieved for editing', { transactionNumber: searchId });
    } catch (error) {
      const parsedError = error.parsedError || parseError(error);
      const userMessage = error.userMessage || getErrorMessage(parsedError);
      setMessage(userMessage);
      setMessageType('error');
      setLoanData(null);
      logger.error('Error retrieving loan data', parsedError);
    } finally {
      setLoading(false);
    }
  };

  // Handle form field changes
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: name === 'loanAmount' || name === 'interestRate' || name === 'loanTerm' ? parseFloat(value) || '' : value
    }));
  };

  // Update loan information
  const handleUpdateLoan = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      // Validate required fields
      if (!formData.loanAmount || !formData.interestRate) {
        setMessage('Loan Amount and Interest Rate are required');
        setMessageType('error');
        setLoading(false);
        return;
      }

      await http.put(`/loans/${loanData.id}`, {
        loanAmount: parseFloat(formData.loanAmount),
        interestRate: parseFloat(formData.interestRate),
        loanTerm: formData.loanTerm ? parseInt(formData.loanTerm) : null,
        collateralDescription: formData.collateralDescription,
        customerNote: formData.customerNote,
        updatedByUserId: loggedInUser?.id,
        updatedByUsername: loggedInUser?.username
      });

      setMessage('✅ Loan information updated successfully!');
      setMessageType('success');
      setEditMode(false);

      // Refresh loan data
      setLoanData(prev => ({
        ...prev,
        loanAmount: formData.loanAmount,
        interestRate: formData.interestRate,
        loanTerm: formData.loanTerm,
        collateralDescription: formData.collateralDescription,
        customerNote: formData.customerNote
      }));

      logger.info('Loan updated successfully', { loanId: loanData.id });
    } catch (error) {
      const parsedError = error.parsedError || parseError(error);
      const userMessage = error.userMessage || getErrorMessage(parsedError);
      setMessage(userMessage);
      setMessageType('error');
      logger.error('Error updating loan', parsedError);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="form-container">
      <h3>Edit Existing Loan</h3>
      <p style={{ color: '#888', marginBottom: '20px', fontSize: '13px' }}>
        Search for a loan by transaction number, then edit the loan amount, interest rate, due date, collateral description, or other loan details.
      </p>

      {/* Message Area */}
      {message && (
        <div className={`alert alert-${messageType}`} style={{ marginBottom: '20px' }}>
          {message}
        </div>
      )}

      {/* Search Form */}
      {!loanData ? (
        <form onSubmit={handleSearchLoan}>
          <div className="form-group">
            <label htmlFor="searchId">Transaction Number *</label>
            <input
              type="text"
              id="searchId"
              value={searchId}
              onChange={(e) => setSearchId(e.target.value)}
              placeholder="Enter transaction number to find loan"
              required
              disabled={loading}
            />
          </div>
          <button type="submit" className="btn-primary" disabled={loading || !searchId}>
            {loading ? 'Searching...' : 'Search Loan'}
          </button>
        </form>
      ) : (
        <div>
          {/* Current Loan Info */}
          {!editMode && (
            <div className="card" style={{ marginBottom: '20px' }}>
              <div className="card-header">Current Loan Information</div>
              <div style={{ padding: '20px' }}>
                <div className="card-field">
                  <strong>Transaction Number:</strong>
                  <span>{loanData.transactionNumber}</span>
                </div>
                <div className="card-field">
                  <strong>Loan ID:</strong>
                  <span>{loanData.id}</span>
                </div>
                <div className="card-field">
                  <strong>Customer Name:</strong>
                  <span>{loanData.customerName}</span>
                </div>
                <div className="card-field">
                  <strong>Loan Amount:</strong>
                  <span>${parseFloat(loanData.loanAmount).toFixed(2)}</span>
                </div>
                <div className="card-field">
                  <strong>Interest Rate:</strong>
                  <span>{loanData.interestRate}%</span>
                </div>
                <div className="card-field">
                  <strong>Interest Amount:</strong>
                  <span>${parseFloat(loanData.interestAmount).toFixed(2)}</span>
                </div>
                <div className="card-field">
                  <strong>Total Payable:</strong>
                  <span>${parseFloat(loanData.totalPayableAmount).toFixed(2)}</span>
                </div>
                <div className="card-field">
                  <strong>Loan Term (Days):</strong>
                  <span>{loanData.loanTerm}</span>
                </div>
                <div className="card-field">
                  <strong>Issued Date:</strong>
                  <span>{loanData.loanIssuedDate}</span>
                </div>
                <div className="card-field">
                  <strong>Due Date:</strong>
                  <span>{loanData.dueDate}</span>
                </div>
                <div className="card-field">
                  <strong>Status:</strong>
                  <span style={{ textTransform: 'uppercase', fontWeight: 'bold', color: loanData.status === 'active' ? '#28a745' : '#dc3545' }}>
                    {loanData.status}
                  </span>
                </div>
                <div className="card-field">
                  <strong>Remaining Balance:</strong>
                  <span>${parseFloat(loanData.remainingBalance).toFixed(2)}</span>
                </div>
                <div className="card-field">
                  <strong>Collateral Description:</strong>
                  <span>{loanData.collateralDescription || 'Not provided'}</span>
                </div>
                <div className="card-field">
                  <strong>Customer Note:</strong>
                  <span>{loanData.customerNote || 'Not provided'}</span>
                </div>
              </div>
            </div>
          )}

          {/* Edit Form */}
          {editMode && (
            <form onSubmit={handleUpdateLoan} className="card" style={{ marginBottom: '20px' }}>
              <div className="card-header">Edit Loan Details</div>
              <div style={{ padding: '20px' }}>
                <div className="form-group">
                  <label htmlFor="loanAmount">Loan Amount *</label>
                  <input
                    type="number"
                    id="loanAmount"
                    name="loanAmount"
                    value={formData.loanAmount}
                    onChange={handleInputChange}
                    placeholder="Enter loan amount"
                    step="0.01"
                    required
                    disabled={loading}
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="interestRate">Interest Rate (%) *</label>
                  <input
                    type="number"
                    id="interestRate"
                    name="interestRate"
                    value={formData.interestRate}
                    onChange={handleInputChange}
                    placeholder="Enter interest rate"
                    step="0.01"
                    required
                    disabled={loading}
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="loanTerm">Loan Term (Days)</label>
                  <input
                    type="number"
                    id="loanTerm"
                    name="loanTerm"
                    value={formData.loanTerm}
                    onChange={handleInputChange}
                    placeholder="Enter loan term in days"
                    disabled={loading}
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="collateralDescription">Collateral Description</label>
                  <textarea
                    id="collateralDescription"
                    name="collateralDescription"
                    value={formData.collateralDescription}
                    onChange={handleInputChange}
                    placeholder="Enter collateral description"
                    rows="4"
                    disabled={loading}
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="customerNote">Customer Note</label>
                  <textarea
                    id="customerNote"
                    name="customerNote"
                    value={formData.customerNote}
                    onChange={handleInputChange}
                    placeholder="Enter any customer notes"
                    rows="4"
                    disabled={loading}
                  />
                </div>

                <div style={{ display: 'flex', gap: '10px' }}>
                  <button type="submit" className="btn-success" disabled={loading}>
                    {loading ? 'Updating...' : '✓ Update Loan'}
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setEditMode(false);
                      setFormData({
                        loanAmount: loanData.loanAmount,
                        interestRate: loanData.interestRate,
                        loanTerm: loanData.loanTerm,
                        collateralDescription: loanData.collateralDescription,
                        customerNote: loanData.customerNote
                      });
                    }}
                    className="btn-primary"
                    disabled={loading}
                  >
                    Cancel
                  </button>
                </div>
              </div>
            </form>
          )}

          {/* Action Buttons */}
          {!editMode && (
            <div style={{ display: 'flex', gap: '10px' }}>
              <button
                onClick={() => setEditMode(true)}
                className="btn-info"
                disabled={loading}
              >
                ✏️ Edit Loan Details
              </button>
              <button
                onClick={() => {
                  setLoanData(null);
                  setSearchId('');
                  setMessage('');
                }}
                className="btn-primary"
                disabled={loading}
              >
                Search Another
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default EditLoanForm;
