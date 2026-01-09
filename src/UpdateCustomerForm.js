import React, { useState } from 'react';
import { http } from './services/httpClient';
import { parseError, getErrorMessage } from './services/errorHandler';
import logger from './services/logger';

const UpdateCustomerForm = ({ loggedInUser }) => {
  const [searchId, setSearchId] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [messageType, setMessageType] = useState('');
  const [customerData, setCustomerData] = useState(null);
  const [editMode, setEditMode] = useState(false);

  // Form state for editing
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    homePhone: '',
    mobilePhone: '',
    email: '',
    birthdate: '',
    referral: '',
    streetAddress: '',
    city: '',
    state: '',
    zipcode: ''
  });

  // Search for customer (by transaction number)
  const handleSearchCustomer = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const response = await http.get(`/loans/transaction/${searchId}`, {
        params: { _ts: Date.now() }
      });

      const loan = response?.data || response;

      // Extract customer data from loan - backend returns nested customerInfo object
      const customerInfo = loan.customerInfo || {};
      
      const customerDataObj = {
        loanId: loan.id,
        transactionNumber: loan.transactionNumber || searchId,
        firstName: customerInfo.firstName || '',
        lastName: customerInfo.lastName || '',
        homePhone: customerInfo.homePhone || '',
        mobilePhone: customerInfo.mobilePhone || '',
        email: customerInfo.email || '',
        birthdate: customerInfo.birthdate || '',
        referral: customerInfo.referral || '',
        streetAddress: customerInfo.streetAddress || '',
        city: customerInfo.city || '',
        state: customerInfo.state || '',
        zipcode: customerInfo.zipcode || ''
      };

      setCustomerData(customerDataObj);

      // Initialize form with customer data
      setFormData({
        firstName: customerDataObj.firstName,
        lastName: customerDataObj.lastName,
        homePhone: customerDataObj.homePhone,
        mobilePhone: customerDataObj.mobilePhone,
        email: customerDataObj.email,
        birthdate: customerDataObj.birthdate,
        referral: customerDataObj.referral,
        streetAddress: customerDataObj.streetAddress,
        city: customerDataObj.city,
        state: customerDataObj.state,
        zipcode: customerDataObj.zipcode
      });

      setEditMode(false);
      setMessage('');
      setMessageType('');
      logger.info('Customer data retrieved for editing', { transactionNumber: searchId, loanData: loan });
    } catch (error) {
      const parsedError = error.parsedError || parseError(error);
      
      // Special handling for 404 - endpoint not implemented yet
      if (parsedError.status === 404) {
        setMessage(
          '⚠️ Transaction lookup endpoint not yet implemented on backend. ' +
          'Please ensure the backend has a GET /loans/transaction/{transactionNumber} endpoint that returns the loan associated with the transaction number.'
        );
        setMessageType('warning');
      } else {
        const userMessage = error.userMessage || getErrorMessage(parsedError);
        setMessage(userMessage);
        setMessageType('error');
      }
      
      setCustomerData(null);
      logger.error('Error retrieving customer data', parsedError);
    } finally {
      setLoading(false);
    }
  };

  // Handle form field changes
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  // Update customer information
  const handleUpdateCustomer = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      // const response = await http.put(`/loans/${customerData.loanId}/customer-info`, {
      await http.put(`/loans/${customerData.loanId}/customer-info`, {
        firstName: formData.firstName,
        lastName: formData.lastName,
        homePhone: formData.homePhone,
        mobilePhone: formData.mobilePhone,
        email: formData.email,
        birthdate: formData.birthdate,
        referral: formData.referral,
        streetAddress: formData.streetAddress,
        city: formData.city,
        state: formData.state,
        zipcode: formData.zipcode,
        updatedByUserId: loggedInUser?.id,
        updatedByUsername: loggedInUser?.username,
        updatedAt: new Date().toISOString()
      });

      // const result = response?.data || response; // Not used - response handled above

      setMessage('✅ Customer information updated successfully!');
      setMessageType('success');
      setEditMode(false);

      // Update customer data with new values
      setCustomerData(prev => ({
        ...prev,
        ...formData
      }));

      logger.info('Customer information updated', { loanId: customerData.loanId, updatedBy: loggedInUser?.username });
    } catch (error) {
      const parsedError = error.parsedError || parseError(error);
      const userMessage = error.userMessage || getErrorMessage(parsedError);
      setMessage(userMessage);
      setMessageType('error');
      logger.error('Error updating customer information', parsedError);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="form-container">
      <h3>Update Customer Information</h3>
      <p style={{ color: '#888', marginBottom: '20px', fontSize: '13px' }}>
        Search a loan by ID, then update the associated customer's phone number, address, email, or other information.
      </p>

      {/* Message Area */}
      {message && (
        <div className={`alert alert-${messageType}`} style={{ marginBottom: '20px' }}>
          {message}
        </div>
      )}

      {/* Search Form */}
      {!customerData ? (
        <form onSubmit={handleSearchCustomer}>
          <div className="form-group">
            <label htmlFor="searchId">Transaction Number *</label>
            <input
              type="text"
              id="searchId"
              value={searchId}
              onChange={(e) => setSearchId(e.target.value)}
              placeholder="Enter transaction number to find customer"
              required
              disabled={loading}
            />
          </div>

          <button type="submit" className="btn-primary" disabled={loading || !searchId}>
            {loading ? 'Searching...' : 'Search Customer'}
          </button>
        </form>
      ) : (
        <div>
          {/* Current Customer Info */}
          {!editMode && (
            <div className="card" style={{ marginBottom: '20px' }}>
              <div className="card-header">Current Customer Information</div>
              <div style={{ padding: '20px' }}>
                <div className="card-field">
                  <strong>Transaction Number:</strong>
                  <span>{customerData.transactionNumber}</span>
                </div>
                <div className="card-field">
                  <strong>Loan ID:</strong>
                  <span>{customerData.loanId}</span>
                </div>
                <div className="card-field">
                  <strong>Name:</strong>
                  <span>
                    {customerData.firstName} {customerData.lastName}
                  </span>
                </div>
                <div className="card-field">
                  <strong>Home Phone:</strong>
                  <span>{customerData.homePhone || 'Not provided'}</span>
                </div>
                <div className="card-field">
                  <strong>Mobile Phone:</strong>
                  <span>{customerData.mobilePhone || 'Not provided'}</span>
                </div>
                <div className="card-field">
                  <strong>Email:</strong>
                  <span>{customerData.email || 'Not provided'}</span>
                </div>
                <div className="card-field">
                  <strong>Birthdate:</strong>
                  <span>{customerData.birthdate || 'Not provided'}</span>
                </div>
                <div className="card-field">
                  <strong>Address:</strong>
                  <span>
                    {customerData.streetAddress && customerData.city && customerData.state && customerData.zipcode
                      ? `${customerData.streetAddress}, ${customerData.city}, ${customerData.state} ${customerData.zipcode}`
                      : 'Not provided'}
                  </span>
                </div>
                <div className="card-field">
                  <strong>Referral:</strong>
                  <span>{customerData.referral || 'Not provided'}</span>
                </div>
              </div>
            </div>
          )}

          {/* Edit Form */}
          {editMode && (
            <form onSubmit={handleUpdateCustomer}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                <div className="form-group">
                  <label htmlFor="firstName">First Name</label>
                  <input
                    type="text"
                    id="firstName"
                    name="firstName"
                    value={formData.firstName}
                    onChange={handleInputChange}
                    placeholder="First name"
                    disabled={loading}
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="lastName">Last Name</label>
                  <input
                    type="text"
                    id="lastName"
                    name="lastName"
                    value={formData.lastName}
                    onChange={handleInputChange}
                    placeholder="Last name"
                    disabled={loading}
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="homePhone">Home Phone</label>
                  <input
                    type="text"
                    id="homePhone"
                    name="homePhone"
                    value={formData.homePhone}
                    onChange={handleInputChange}
                    placeholder="Home phone number"
                    disabled={loading}
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="mobilePhone">Mobile Phone</label>
                  <input
                    type="text"
                    id="mobilePhone"
                    name="mobilePhone"
                    value={formData.mobilePhone}
                    onChange={handleInputChange}
                    placeholder="Mobile phone number"
                    disabled={loading}
                  />
                </div>

                <div className="form-group" style={{ gridColumn: '1 / -1' }}>
                  <label htmlFor="email">Email</label>
                  <input
                    type="email"
                    id="email"
                    name="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    placeholder="Email address"
                    disabled={loading}
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="birthdate">Birthdate</label>
                  <input
                    type="date"
                    id="birthdate"
                    name="birthdate"
                    value={formData.birthdate}
                    onChange={handleInputChange}
                    disabled={loading}
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="referral">Referral</label>
                  <input
                    type="text"
                    id="referral"
                    name="referral"
                    value={formData.referral}
                    onChange={handleInputChange}
                    placeholder="How customer was referred"
                    disabled={loading}
                  />
                </div>

                <div className="form-group" style={{ gridColumn: '1 / -1' }}>
                  <label htmlFor="streetAddress">Street Address</label>
                  <input
                    type="text"
                    id="streetAddress"
                    name="streetAddress"
                    value={formData.streetAddress}
                    onChange={handleInputChange}
                    placeholder="Street address"
                    disabled={loading}
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="city">City</label>
                  <input
                    type="text"
                    id="city"
                    name="city"
                    value={formData.city}
                    onChange={handleInputChange}
                    placeholder="City"
                    disabled={loading}
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="state">State</label>
                  <input
                    type="text"
                    id="state"
                    name="state"
                    value={formData.state}
                    onChange={handleInputChange}
                    placeholder="State"
                    disabled={loading}
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="zipcode">Zipcode</label>
                  <input
                    type="text"
                    id="zipcode"
                    name="zipcode"
                    value={formData.zipcode}
                    onChange={handleInputChange}
                    placeholder="Zipcode"
                    disabled={loading}
                  />
                </div>
              </div>

              <div style={{ display: 'flex', gap: '10px', marginTop: '20px' }}>
                <button type="submit" className="btn-success" disabled={loading}>
                  {loading ? 'Updating...' : '✓ Save Changes'}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setEditMode(false);
                    setFormData({
                      firstName: customerData.firstName,
                      lastName: customerData.lastName,
                      homePhone: customerData.homePhone,
                      mobilePhone: customerData.mobilePhone,
                      email: customerData.email,
                      birthdate: customerData.birthdate,
                      referral: customerData.referral,
                      streetAddress: customerData.streetAddress,
                      city: customerData.city,
                      state: customerData.state,
                      zipcode: customerData.zipcode
                    });
                  }}
                  className="btn-primary"
                  disabled={loading}
                >
                  Cancel
                </button>
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
                ✏️ Edit Information
              </button>
              <button
                onClick={() => {
                  setCustomerData(null);
                  setSearchId('');
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

export default UpdateCustomerForm;
