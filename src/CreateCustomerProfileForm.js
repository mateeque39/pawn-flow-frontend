import React, { useState } from 'react';
import { http } from './services/httpClient';
import { parseError, getErrorMessage } from './services/errorHandler';
import logger from './services/logger';

const CreateCustomerProfileForm = ({ loggedInUser }) => {
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [messageType, setMessageType] = useState('');
  const [createdProfile, setCreatedProfile] = useState(null);

  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    homePhone: '',
    mobilePhone: '',
    email: '',
    birthdate: '',
    referral: '',
    idType: '',
    idNumber: '',
    idDetails: '',
    streetAddress: '',
    city: '',
    state: '',
    zipcode: ''
  });

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validate required fields
    if (!formData.firstName || !formData.lastName) {
      setMessage('First Name and Last Name are required');
      setMessageType('error');
      return;
    }

    if (!formData.homePhone && !formData.mobilePhone) {
      setMessage('At least one phone number is required');
      setMessageType('error');
      return;
    }

    setLoading(true);
    try {
      const payload = {
        firstName: formData.firstName,
        lastName: formData.lastName,
        homePhone: formData.homePhone,
        mobilePhone: formData.mobilePhone,
        email: formData.email,
        birthdate: formData.birthdate,
        referral: formData.referral,
        idType: formData.idType,
        idNumber: formData.idNumber,
        idDetails: formData.idDetails,
        streetAddress: formData.streetAddress,
        city: formData.city,
        state: formData.state,
        zipcode: formData.zipcode,
        createdByUserId: loggedInUser?.id,
        createdByUsername: loggedInUser?.username,
        createdAt: new Date().toISOString()
      };

      const response = await http.post('/customers', payload);
      // The backend returns { message: '...', customer: {...} }
      const customer = response?.data?.customer || response?.data || response;

      // Normalize customer profile with field fallbacks
      const getFieldValue = (obj, ...keys) => {
        for (const key of keys) {
          if (obj && obj[key] !== undefined && obj[key] !== null && obj[key] !== '') {
            return obj[key];
          }
        }
        return null;
      };

      const normalizedCustomer = {
        id: getFieldValue(customer, 'id', 'customerId', 'customer_id') || customer.id,
        firstName: getFieldValue(customer, 'firstName', 'first_name', 'firstname') || 'N/A',
        lastName: getFieldValue(customer, 'lastName', 'last_name', 'lastname') || 'N/A',
        homePhone: getFieldValue(customer, 'homePhone', 'home_phone', 'phone') || '',
        mobilePhone: getFieldValue(customer, 'mobilePhone', 'mobile_phone', 'mobile') || ''
      };

      setCreatedProfile(normalizedCustomer);
      setMessage('✅ Customer profile created successfully!');
      setMessageType('success');

      // Reset form
      setFormData({
        firstName: '',
        lastName: '',
        homePhone: '',
        mobilePhone: '',
        email: '',
        birthdate: '',
        referral: '',
        idType: '',
        idNumber: '',
        idDetails: '',
        streetAddress: '',
        city: '',
        state: '',
        zipcode: ''
      });

      logger.info('Customer profile created', { 
        customerId: normalizedCustomer.id, 
        name: `${normalizedCustomer.firstName} ${normalizedCustomer.lastName}`,
        createdBy: loggedInUser?.username 
      });
    } catch (error) {
      const parsedError = error.parsedError || parseError(error);
      const userMessage = error.userMessage || getErrorMessage(parsedError);
      setMessage(userMessage);
      setMessageType('error');
      logger.error('Error creating customer profile', parsedError);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="form-container">
      <h3>Create Customer Profile</h3>
      <p style={{ color: '#888', marginBottom: '20px', fontSize: '13px' }}>
        Create a new customer profile with personal and identification information. This profile can be used to create multiple loans.
      </p>

      {/* Message Area */}
      {message && (
        <div className={`alert alert-${messageType}`} style={{ marginBottom: '20px' }}>
          {message}
        </div>
      )}

      {/* Success Display */}
      {createdProfile && (
        <div className="card" style={{ marginBottom: '20px', backgroundColor: '#d4edda', borderColor: '#6bc77f' }}>
          <div style={{ padding: '20px' }}>
            <p style={{ margin: 0, fontWeight: 'bold', color: '#2d5f2e', marginBottom: '10px' }}>
              ✓ Profile Created Successfully!
            </p>
            <p style={{ margin: 0, color: '#2d5f2e', fontSize: '14px' }}>
              <strong>Customer ID:</strong> {createdProfile.id}<br />
              <strong>Name:</strong> {createdProfile.firstName !== 'N/A' || createdProfile.lastName !== 'N/A' ? `${createdProfile.firstName} ${createdProfile.lastName}` : 'N/A'}<br />
              <strong>Phone:</strong> {createdProfile.homePhone || createdProfile.mobilePhone || 'N/A'}
            </p>
          </div>
        </div>
      )}

      <form onSubmit={handleSubmit}>
        {/* Personal Information */}
        <fieldset style={{ border: '1px solid #ddd', padding: '15px', borderRadius: '8px', marginBottom: '20px' }}>
          <legend style={{ fontWeight: 'bold', paddingLeft: '10px', paddingRight: '10px' }}>Personal Information</legend>
          
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
            <div className="form-group">
              <label htmlFor="firstName">First Name *</label>
              <input
                type="text"
                id="firstName"
                name="firstName"
                value={formData.firstName}
                onChange={handleInputChange}
                placeholder="First name"
                required
                disabled={loading}
              />
            </div>

            <div className="form-group">
              <label htmlFor="lastName">Last Name *</label>
              <input
                type="text"
                id="lastName"
                name="lastName"
                value={formData.lastName}
                onChange={handleInputChange}
                placeholder="Last name"
                required
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
              <label htmlFor="mobilePhone">Mobile Phone *</label>
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
              <label htmlFor="referral">How did you hear about us?</label>
              <input
                type="text"
                id="referral"
                name="referral"
                value={formData.referral}
                onChange={handleInputChange}
                placeholder="e.g., Google, Friend, Social Media"
                disabled={loading}
              />
            </div>
          </div>
        </fieldset>

        {/* Identification Information */}
        <fieldset style={{ border: '1px solid #ddd', padding: '15px', borderRadius: '8px', marginBottom: '20px' }}>
          <legend style={{ fontWeight: 'bold', paddingLeft: '10px', paddingRight: '10px' }}>Identification Information</legend>
          
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
            <div className="form-group">
              <label htmlFor="idType">ID Type</label>
              <select
                id="idType"
                name="idType"
                value={formData.idType}
                onChange={handleInputChange}
                disabled={loading}
              >
                <option value="">Select ID Type</option>
                <option value="drivers_license">Driver's License</option>
                <option value="passport">Passport</option>
                <option value="state_id">State ID</option>
                <option value="national_id">National ID</option>
                <option value="other">Other</option>
              </select>
            </div>

            <div className="form-group">
              <label htmlFor="idNumber">ID Number</label>
              <input
                type="text"
                id="idNumber"
                name="idNumber"
                value={formData.idNumber}
                onChange={handleInputChange}
                placeholder="ID number"
                disabled={loading}
              />
            </div>

            <div className="form-group" style={{ gridColumn: '1 / -1' }}>
              <label htmlFor="idDetails">Additional ID Details</label>
              <input
                type="text"
                id="idDetails"
                name="idDetails"
                value={formData.idDetails}
                onChange={handleInputChange}
                placeholder="e.g., Expiration date, issuing state"
                disabled={loading}
              />
            </div>
          </div>
        </fieldset>

        {/* Address Information */}
        <fieldset style={{ border: '1px solid #ddd', padding: '15px', borderRadius: '8px', marginBottom: '20px' }}>
          <legend style={{ fontWeight: 'bold', paddingLeft: '10px', paddingRight: '10px' }}>Address Information</legend>
          
          <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '16px' }}>
            <div className="form-group">
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

            <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 1fr', gap: '16px' }}>
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
          </div>
        </fieldset>

        <button type="submit" className="btn-success" disabled={loading}>
          {loading ? 'Creating Profile...' : '✓ Create Customer Profile'}
        </button>
      </form>
    </div>
  );
};

export default CreateCustomerProfileForm;
