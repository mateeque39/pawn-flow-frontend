import React, { useState, useEffect } from 'react';
import { http } from './services/httpClient';
import logger from './services/logger';
import './PDFSettingsForm.css';

const PDFSettingsForm = ({ loggedInUser }) => {
  const [settings, setSettings] = useState({
    companyName: 'GREEN MOOLAA BRAMPTON',
    address1: '263 QUEEN ST. E. UNIT 4',
    address2: 'BRAMPTON ON L6W 4K6',
    phone: '(905) 796-7777',
    legalTerm1: 'I, the undersigned (herein \'the seller\'), do hereby loan the item(s) above to the customer amount, the receipt of which is acknowledge by the undersigned (herein \'the Seller\'), said Seller does sell, transfer, and assign all rights, title and interest in the described property to GRN. The seller declares that the above is their own personal property free and clear of all claims and liens whatsoever and that they have the full power to sell, transfer and deliver said property as provided herein.',
    legalTerm2: 'Seller is hereby granted a customer option by GRN to repurchase the described property from GRN at a mutually agreeable price, which is set forth on this contract. The seller has (30) days from the date of this agreement to exercise this option. The seller is not obligated to exercise this option and will forfeit this option (1) days from the agreement date.',
    documentCode: 'Pawn-GR-02-CAN',
    minPaymentPercentage: 10,
    categoryDefaultText: 'Collateral',
    itemDescriptionTemplate: 'Pawn Loan Agreement'
  });

  // const [savedSettings, setSavedSettings] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');
  const [activeTab, setActiveTab] = useState('company');

  // Load settings on component mount
  useEffect(() => {
    loadSettings();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const loadSettings = async () => {
    try {
      setLoading(true);
      const response = await http.get('/admin/pdf-settings');
      if (response.data && response.data.settings) {
        setSettings(response.data.settings);
        // setSavedSettings(response.data.settings); // Not used
        logger.info('PDF settings loaded', { settings: response.data.settings });
      }
    } catch (error) {
      // If endpoint doesn't exist yet, use defaults
      logger.warn('Could not load PDF settings, using defaults', { error: error.message });
      // setSavedSettings(settings); // Not used
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setSettings((prev) => ({
      ...prev,
      [name]: name === 'minPaymentPercentage' ? parseFloat(value) : value
    }));
    setMessage('');
  };

  const handleSaveSettings = async () => {
    try {
      setSaving(true);
      const response = await http.post('/admin/pdf-settings', { settings });
      if (response.data && response.data.success) {
        // setSavedSettings(settings); // Not used
        setMessage('✅ PDF settings saved successfully!');
        logger.info('PDF settings saved', { settings });
        setTimeout(() => setMessage(''), 3000);
      }
    } catch (error) {
      const errorMsg = error.response?.data?.message || error.message;
      setMessage(`❌ Error saving settings: ${errorMsg}`);
      logger.error('Failed to save PDF settings', { error: errorMsg });
    } finally {
      setSaving(false);
    }
  };

  const handleResetToDefaults = () => {
    if (window.confirm('Are you sure you want to reset all settings to default?')) {
      const defaultSettings = {
        companyName: 'GREEN MOOLAA BRAMPTON',
        address1: '263 QUEEN ST. E. UNIT 4',
        address2: 'BRAMPTON ON L6W 4K6',
        phone: '(905) 796-7777',
        legalTerm1: 'I, the undersigned (herein \'the seller\'), do hereby loan the item(s) above to the customer amount, the receipt of which is acknowledge by the undersigned (herein \'the Seller\'), said Seller does sell, transfer, and assign all rights, title and interest in the described property to GRN. The seller declares that the above is their own personal property free and clear of all claims and liens whatsoever and that they have the full power to sell, transfer and deliver said property as provided herein.',
        legalTerm2: 'Seller is hereby granted a customer option by GRN to repurchase the described property from GRN at a mutually agreeable price, which is set forth on this contract. The seller has (30) days from the date of this agreement to exercise this option. The seller is not obligated to exercise this option and will forfeit this option (1) days from the agreement date.',
        documentCode: 'Pawn-GR-02-CAN',
        minPaymentPercentage: 10,
        categoryDefaultText: 'Collateral',
        itemDescriptionTemplate: 'Pawn Loan Agreement'
      };
      setSettings(defaultSettings);
      setMessage('⚙️ Settings reset to defaults');
    }
  };

  if (loading) {
    return (
      <div className="pdf-settings-container">
        <div className="loading-spinner">Loading PDF settings...</div>
      </div>
    );
  }

  return (
    <div className="pdf-settings-container">
      <div className="pdf-settings-header">
        <h2>📄 PDF Settings Management</h2>
        <p>Customize how PDFs are generated for loans - company info, legal terms, and more</p>
      </div>

      {message && <div className={`message ${message.includes('✅') ? 'success' : 'error'}`}>{message}</div>}

      <div className="settings-tabs">
        <button
          className={`tab-button ${activeTab === 'company' ? 'active' : ''}`}
          onClick={() => setActiveTab('company')}
        >
          🏢 Company Info
        </button>
        <button
          className={`tab-button ${activeTab === 'legal' ? 'active' : ''}`}
          onClick={() => setActiveTab('legal')}
        >
          📋 Legal Terms
        </button>
        <button
          className={`tab-button ${activeTab === 'format' ? 'active' : ''}`}
          onClick={() => setActiveTab('format')}
        >
          📐 Format & Templates
        </button>
      </div>

      <div className="settings-content">
        {/* Company Info Tab */}
        {activeTab === 'company' && (
          <div className="tab-content">
            <h3>Company Information</h3>
            <p>Configure company details that appear at the top of all generated PDFs</p>

            <div className="settings-group">
              <div className="form-group">
                <label>Company Name</label>
                <input
                  type="text"
                  name="companyName"
                  value={settings.companyName}
                  onChange={handleInputChange}
                  placeholder="Enter company name"
                />
              </div>

              <div className="form-group">
                <label>Address Line 1</label>
                <input
                  type="text"
                  name="address1"
                  value={settings.address1}
                  onChange={handleInputChange}
                  placeholder="Street address"
                />
              </div>

              <div className="form-group">
                <label>Address Line 2</label>
                <input
                  type="text"
                  name="address2"
                  value={settings.address2}
                  onChange={handleInputChange}
                  placeholder="City, Province, Postal Code"
                />
              </div>

              <div className="form-group">
                <label>Phone Number</label>
                <input
                  type="text"
                  name="phone"
                  value={settings.phone}
                  onChange={handleInputChange}
                  placeholder="Contact phone number"
                />
              </div>

              <div className="preview-section">
                <h4>Preview (Top of PDF)</h4>
                <div className="pdf-preview-header">
                  <div className="preview-company">{settings.companyName}</div>
                  <div className="preview-address">{settings.address1}</div>
                  <div className="preview-address">{settings.address2}</div>
                  <div className="preview-phone">{settings.phone}</div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Legal Terms Tab */}
        {activeTab === 'legal' && (
          <div className="tab-content">
            <h3>Legal Terms & Conditions</h3>
            <p>Customize the legal text that appears on loan PDFs</p>

            <div className="settings-group">
              <div className="form-group">
                <label>Primary Legal Term (Seller Declaration)</label>
                <textarea
                  name="legalTerm1"
                  value={settings.legalTerm1}
                  onChange={handleInputChange}
                  placeholder="Enter primary legal term"
                  rows="6"
                />
                <small>This text appears first, explaining the loan agreement and seller's declaration</small>
              </div>

              <div className="form-group">
                <label>Secondary Legal Term (Option Rights)</label>
                <textarea
                  name="legalTerm2"
                  value={settings.legalTerm2}
                  onChange={handleInputChange}
                  placeholder="Enter secondary legal term"
                  rows="6"
                />
                <small>This text appears second, explaining buyback options and terms</small>
              </div>

              <div className="preview-section">
                <h4>Preview (PDF Legal Section)</h4>
                <div className="pdf-preview-legal">
                  <p className="legal-preview">{settings.legalTerm1}</p>
                  <hr />
                  <p className="legal-preview">{settings.legalTerm2}</p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Format & Templates Tab */}
        {activeTab === 'format' && (
          <div className="tab-content">
            <h3>PDF Format & Templates</h3>
            <p>Configure default values and templates used in PDFs</p>

            <div className="settings-group">
              <div className="form-group">
                <label>Default Category Name</label>
                <input
                  type="text"
                  name="categoryDefaultText"
                  value={settings.categoryDefaultText}
                  onChange={handleInputChange}
                  placeholder="e.g., Collateral, Item, Loan Item"
                />
                <small>Default value for the CATEGORY column in PDF tables</small>
              </div>

              <div className="form-group">
                <label>Item Description Template</label>
                <input
                  type="text"
                  name="itemDescriptionTemplate"
                  value={settings.itemDescriptionTemplate}
                  onChange={handleInputChange}
                  placeholder="e.g., Pawn Loan Agreement"
                />
                <small>Default description text for loan items in PDF</small>
              </div>

              <div className="form-group">
                <label>Minimum Payment Percentage (%)</label>
                <input
                  type="number"
                  name="minPaymentPercentage"
                  value={settings.minPaymentPercentage}
                  onChange={handleInputChange}
                  min="0"
                  max="100"
                  step="0.5"
                />
                <small>Percentage of total shown as "30-day minimum payment" (e.g., 10% = $100 on $1000 loan)</small>
              </div>

              <div className="form-group">
                <label>Document Reference Code</label>
                <input
                  type="text"
                  name="documentCode"
                  value={settings.documentCode}
                  onChange={handleInputChange}
                  placeholder="e.g., Pawn-GR-02-CAN"
                />
                <small>Appears in footer of all PDFs as a reference identifier</small>
              </div>

              <div className="preview-section">
                <h4>Preview (PDF Footer & Calculations)</h4>
                <div className="pdf-preview-format">
                  <div className="format-row">
                    <span>Category Default:</span>
                    <strong>{settings.categoryDefaultText}</strong>
                  </div>
                  <div className="format-row">
                    <span>Item Description:</span>
                    <strong>{settings.itemDescriptionTemplate}</strong>
                  </div>
                  <div className="format-row">
                    <span>30-Day Payment on $1000 loan:</span>
                    <strong>${(1000 * settings.minPaymentPercentage / 100).toFixed(2)}</strong>
                  </div>
                  <div className="format-row footer-code">
                    <span>Document Code (Footer):</span>
                    <strong>{settings.documentCode}</strong>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      <div className="settings-actions">
        <button
          className="btn-primary"
          onClick={handleSaveSettings}
          disabled={saving}
        >
          {saving ? '💾 Saving...' : '💾 Save Settings'}
        </button>
        <button
          className="btn-secondary"
          onClick={handleResetToDefaults}
          disabled={saving}
        >
          ⚙️ Reset to Defaults
        </button>
      </div>

      <div className="info-section">
        <h4>ℹ️ How It Works</h4>
        <ul>
          <li>Changes made here will affect all new PDFs generated after saving</li>
          <li>All loan PDF documents will use these settings automatically</li>
          <li>Previous PDFs won't be affected - only new ones will use updated settings</li>
          <li>You can update settings anytime and changes take effect immediately</li>
        </ul>
      </div>
    </div>
  );
};

export default PDFSettingsForm;
