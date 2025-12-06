import React, { useState } from 'react';
import { http } from './services/httpClient';
import { parseError, getErrorMessage } from './services/errorHandler';
import logger from './services/logger';

const SearchCustomerProfileForm = ({ loggedInUser, onProfileSelect }) => {
  const [searchType, setSearchType] = useState('phone');
  const [searchValue, setSearchValue] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [messageType, setMessageType] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [selectedProfile, setSelectedProfile] = useState(null);

  // Helper function to get field value with multiple fallback keys
  const getFieldValue = (obj, ...keys) => {
    for (const key of keys) {
      if (obj && obj[key] !== undefined && obj[key] !== null && obj[key] !== '') {
        return obj[key];
      }
    }
    return null;
  };

  const handleSearch = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      let endpoint = '';
      let params = { _ts: Date.now() };

      if (searchType === 'phone') {
        endpoint = '/customers/search-phone';
        params.phone = searchValue;
      } else if (searchType === 'name') {
        endpoint = '/customers/search-name';
        params.firstName = searchValue.split(' ')[0];
        params.lastName = searchValue.split(' ').slice(1).join(' ') || '';
      } else if (searchType === 'customerId') {
        endpoint = `/customers/${searchValue}`;
      }

      const response = await http.get(endpoint, { params });
      const results = Array.isArray(response?.data) ? response.data : [response?.data];

      if (results.length === 0) {
        setMessage('No customer profiles found with that search criteria');
        setMessageType('warning');
        setSearchResults([]);
      } else {
        setSearchResults(results);
        setMessage('');
        setMessageType('');
        logger.info('Customer search results', { searchType, resultCount: results.length });
      }
    } catch (error) {
      const parsedError = error.parsedError || parseError(error);
      const userMessage = error.userMessage || getErrorMessage(parsedError);
      setMessage(userMessage);
      setMessageType('error');
      setSearchResults([]);
      logger.error('Error searching customers', parsedError);
    } finally {
      setLoading(false);
    }
  };

  const handleSelectProfile = (profile) => {
    // Normalize profile data with field fallbacks
    const normalizedProfile = {
      id: getFieldValue(profile, 'id', 'customer_id', 'customerId') || profile.id,
      firstName: getFieldValue(profile, 'firstName', 'first_name', 'firstname') || '',
      lastName: getFieldValue(profile, 'lastName', 'last_name', 'lastname') || '',
      homePhone: getFieldValue(profile, 'homePhone', 'home_phone', 'phone') || '',
      mobilePhone: getFieldValue(profile, 'mobilePhone', 'mobile_phone', 'mobile') || '',
      email: getFieldValue(profile, 'email') || '',
      birthdate: getFieldValue(profile, 'birthdate', 'date_of_birth', 'dob') || '',
      referral: getFieldValue(profile, 'referral', 'referred_by') || '',
      idType: getFieldValue(profile, 'idType', 'id_type') || '',
      idNumber: getFieldValue(profile, 'idNumber', 'id_number') || '',
      idDetails: getFieldValue(profile, 'idDetails', 'id_details') || '',
      streetAddress: getFieldValue(profile, 'streetAddress', 'street_address', 'address_street', 'street') || '',
      city: getFieldValue(profile, 'city', 'city_name') || '',
      state: getFieldValue(profile, 'state', 'state_code', 'state_name') || '',
      zipcode: getFieldValue(profile, 'zipcode', 'zip_code', 'postal_code', 'zip') || '',
      createdAt: getFieldValue(profile, 'createdAt', 'created_at', 'created_date') || new Date().toISOString()
    };

    setSelectedProfile(normalizedProfile);
    if (onProfileSelect) {
      onProfileSelect(normalizedProfile);
    }
    logger.info('Customer profile selected', { customerId: normalizedProfile.id, name: `${normalizedProfile.firstName} ${normalizedProfile.lastName}` });
  };

  return (
    <div className="form-container">
      <h3>Search Customer Profile</h3>
      <p style={{ color: '#888', marginBottom: '20px', fontSize: '13px' }}>
        Search for an existing customer profile by phone number, name, or customer ID. Once selected, you can view their loans and create new loans.
      </p>

      {/* Message Area */}
      {message && (
        <div className={`alert alert-${messageType}`} style={{ marginBottom: '20px' }}>
          {message}
        </div>
      )}

      {/* Search Form */}
      {!selectedProfile ? (
        <form onSubmit={handleSearch} style={{ marginBottom: '30px' }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr auto', gap: '12px', alignItems: 'flex-end' }}>
            <div className="form-group" style={{ marginBottom: 0 }}>
              <label htmlFor="searchType">Search By</label>
              <select
                id="searchType"
                value={searchType}
                onChange={(e) => {
                  setSearchType(e.target.value);
                  setSearchValue('');
                  setSearchResults([]);
                }}
                disabled={loading}
              >
                <option value="phone">Phone Number</option>
                <option value="name">Name</option>
                <option value="customerId">Customer ID</option>
              </select>
            </div>

            <div className="form-group" style={{ marginBottom: 0 }}>
              <label htmlFor="searchValue">
                {searchType === 'phone' ? 'Phone' : searchType === 'name' ? 'First & Last Name' : 'Customer ID'}
              </label>
              <input
                type="text"
                id="searchValue"
                value={searchValue}
                onChange={(e) => setSearchValue(e.target.value)}
                placeholder={
                  searchType === 'phone' ? 'e.g., 555-123-4567' : 
                  searchType === 'name' ? 'e.g., John Doe' : 
                  'e.g., CUST-12345'
                }
                disabled={loading}
              />
            </div>

            <button type="submit" className="btn-primary" disabled={loading || !searchValue}>
              {loading ? 'Searching...' : 'Search'}
            </button>
          </div>
        </form>
      ) : null}

      {/* Search Results */}
      {searchResults.length > 0 && !selectedProfile && (
        <div>
          <h4 style={{ marginBottom: '15px' }}>Found {searchResults.length} Profile(s)</h4>
          {searchResults.map((profile, idx) => {
            const firstName = getFieldValue(profile, 'firstName', 'first_name', 'firstname') || '';
            const lastName = getFieldValue(profile, 'lastName', 'last_name', 'lastname') || '';
            const homePhone = getFieldValue(profile, 'homePhone', 'home_phone') || '';
            const mobilePhone = getFieldValue(profile, 'mobilePhone', 'mobile_phone') || '';
            const email = getFieldValue(profile, 'email') || '';
            const displayName = firstName && lastName ? `${firstName} ${lastName}` : firstName || lastName || `Customer ${profile.id}`;

            return (
              <div
                key={idx}
                className="card"
                style={{ marginBottom: '15px', cursor: 'pointer', transition: 'all 0.3s ease' }}
                onClick={() => handleSelectProfile(profile)}
              >
                <div style={{ padding: '20px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start' }}>
                    <div>
                      <p style={{ margin: '0 0 10px 0', fontSize: '16px', fontWeight: 'bold' }}>
                        {displayName}
                      </p>
                      <p style={{ margin: '5px 0', fontSize: '14px' }}>
                        <strong>Customer ID:</strong> {profile.id}
                      </p>
                      <p style={{ margin: '5px 0', fontSize: '14px' }}>
                        <strong>Phone:</strong> {homePhone || mobilePhone || 'N/A'}
                      </p>
                      {email && (
                        <p style={{ margin: '5px 0', fontSize: '14px' }}>
                          <strong>Email:</strong> {email}
                        </p>
                      )}
                    </div>
                    <button
                      type="button"
                      className="btn-info"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleSelectProfile(profile);
                      }}
                    >
                      Select Profile
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Selected Profile Display */}
      {selectedProfile && (
        <div>
          <div className="card" style={{ marginBottom: '20px', backgroundColor: '#d1ecf1', borderColor: '#17a2b8' }}>
            <div style={{ padding: '20px' }}>
              <h4 style={{ margin: '0 0 15px 0', color: '#0c5460' }}>
                ✓ Profile Selected: {selectedProfile.firstName && selectedProfile.lastName ? `${selectedProfile.firstName} ${selectedProfile.lastName}` : selectedProfile.firstName || selectedProfile.lastName || `Customer ${selectedProfile.id}`}
              </h4>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px', fontSize: '14px' }}>
                <div>
                  <p style={{ margin: '5px 0' }}>
                    <strong>Customer ID:</strong> {selectedProfile.id}
                  </p>
                  <p style={{ margin: '5px 0' }}>
                    <strong>Home Phone:</strong> {selectedProfile.homePhone || 'N/A'}
                  </p>
                  <p style={{ margin: '5px 0' }}>
                    <strong>Mobile Phone:</strong> {selectedProfile.mobilePhone || 'N/A'}
                  </p>
                  <p style={{ margin: '5px 0' }}>
                    <strong>Email:</strong> {selectedProfile.email || 'N/A'}
                  </p>
                </div>
                <div>
                  <p style={{ margin: '5px 0' }}>
                    <strong>Address:</strong> {selectedProfile.streetAddress && selectedProfile.city ? `${selectedProfile.streetAddress}, ${selectedProfile.city}, ${selectedProfile.state || ''} ${selectedProfile.zipcode || ''}`.trim() : 'N/A'}
                  </p>
                  <p style={{ margin: '5px 0' }}>
                    <strong>Birthdate:</strong> {selectedProfile.birthdate || 'N/A'}
                  </p>
                  <p style={{ margin: '5px 0' }}>
                    <strong>ID Type:</strong> {selectedProfile.idType || 'N/A'}
                  </p>
                  <p style={{ margin: '5px 0' }}>
                    <strong>ID Number:</strong> {selectedProfile.idNumber || 'N/A'}
                  </p>
                </div>
              </div>
            </div>
          </div>

          <button
            type="button"
            className="btn-primary"
            onClick={() => {
              setSelectedProfile(null);
              setSearchResults([]);
              setSearchValue('');
              setMessage('');
            }}
          >
            Search Another Profile
          </button>
        </div>
      )}
    </div>
  );
};

export default SearchCustomerProfileForm;
