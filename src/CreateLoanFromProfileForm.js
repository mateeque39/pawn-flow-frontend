import React, { useState } from 'react';
import { jsPDF } from 'jspdf';
import { http } from './services/httpClient';
import { parseError, getErrorMessage } from './services/errorHandler';
import logger from './services/logger';
import SearchCustomerProfileForm from './SearchCustomerProfileForm';

const CreateLoanFromProfileForm = ({ loggedInUser }) => {
  const [selectedProfile, setSelectedProfile] = useState(null);
  const [loanAmount, setLoanAmount] = useState('');
  const [interestRate, setInterestRate] = useState('');
  const [interestAmount, setInterestAmount] = useState('');
  const [totalPayableAmount, setTotalPayableAmount] = useState('');
  const [collateralDescription, setCollateralDescription] = useState('');
  const [customerNote, setCustomerNote] = useState('');
  const [loanTerm, setLoanTerm] = useState('');
  const [dueDate, setDueDate] = useState('');
  const [loanIssuedDate, setLoanIssuedDate] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [messageType, setMessageType] = useState('');
  const [transactionNumber, setTransactionNumber] = useState('');

  // Initialize transaction number and date when component mounts
  React.useEffect(() => {
    setTransactionNumber(Math.floor(Math.random() * 1000000000));
    const currentDate = new Date().toISOString().split('T')[0];
    setLoanIssuedDate(currentDate);
  }, []);

  // Calculate due date based on loan term
  React.useEffect(() => {
    if (loanTerm && loanIssuedDate) {
      const issueDate = new Date(loanIssuedDate);
      const due = new Date(issueDate);
      due.setDate(due.getDate() + parseInt(loanTerm));
      setDueDate(due.toISOString().split('T')[0]);
    }
  }, [loanTerm, loanIssuedDate]);

  // Calculate loan details
  const calculateLoanDetails = () => {
    if (loanAmount && interestRate) {
      const interest = (parseFloat(loanAmount) * parseFloat(interestRate)) / 100;
      const totalPayable = parseFloat(loanAmount) + interest;
      setInterestAmount(interest.toFixed(2));
      setTotalPayableAmount(totalPayable.toFixed(2));
    }
  };

  React.useEffect(() => {
    calculateLoanDetails();
  }, [loanAmount, interestRate]);

  const handleProfileSelect = (profile) => {
    setSelectedProfile(profile);
    setMessage('');
    setMessageType('');
    logger.info('Profile selected for loan creation', { customerId: profile.id });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!selectedProfile) {
      setMessage('Please select a customer profile first');
      setMessageType('error');
      return;
    }

    if (!loanAmount || !interestRate || !collateralDescription) {
      setMessage('Loan Amount, Interest Rate, and Collateral Description are required');
      setMessageType('error');
      return;
    }

    setLoading(true);
    try {
      const loanData = {
        customerId: selectedProfile.id,
        firstName: selectedProfile.firstName,
        lastName: selectedProfile.lastName,
        homePhone: selectedProfile.homePhone,
        mobilePhone: selectedProfile.mobilePhone,
        email: selectedProfile.email,
        birthdate: selectedProfile.birthdate,
        referral: selectedProfile.referral,
        idType: selectedProfile.idType,
        idNumber: selectedProfile.idNumber,
        idDetails: selectedProfile.idDetails,
        streetAddress: selectedProfile.streetAddress,
        city: selectedProfile.city,
        state: selectedProfile.state,
        zipcode: selectedProfile.zipcode,
        loanAmount: parseFloat(loanAmount),
        interestRate: parseFloat(interestRate),
        interestAmount: parseFloat(interestAmount),
        totalPayableAmount: parseFloat(totalPayableAmount),
        itemDescription: collateralDescription,
        customerNote,
        transactionNumber,
        loanIssuedDate,
        loanTerm: parseInt(loanTerm),
        dueDate,
        createdByUserId: loggedInUser?.id,
        createdByUsername: loggedInUser?.username,
        createdAt: new Date().toISOString()
      };

      logger.debug('Creating loan against customer profile', { customerId: selectedProfile.id, loanAmount });
      
      const response = await http.post('/loans', loanData);
      const createdLoan = response?.data || response;

      setMessage('✅ Loan created successfully!');
      setMessageType('success');

      // Generate PDF after successful creation
      setTimeout(() => {
        generateLoanPDF(createdLoan);
      }, 500);

      // Reset form
      setLoanAmount('');
      setInterestRate('');
      setInterestAmount('');
      setTotalPayableAmount('');
      setCollateralDescription('');
      setCustomerNote('');
      setLoanTerm('');
      setDueDate('');
      setTransactionNumber(Math.floor(Math.random() * 1000000000));

      logger.info('Loan created against profile', { 
        loanId: createdLoan.id, 
        customerId: selectedProfile.id, 
        amount: loanAmount 
      });
    } catch (error) {
      const parsedError = error.parsedError || parseError(error);
      const userMessage = error.userMessage || getErrorMessage(parsedError);
      setMessage(userMessage);
      setMessageType('error');
      logger.error('Error creating loan against profile', parsedError);
    } finally {
      setLoading(false);
    }
  };

  const generateLoanPDF = (loan) => {
    console.log('PDF Generation - Received loan data:', JSON.stringify(loan, null, 2));
    
    const doc = new jsPDF();
    const pageWidth = doc.internal.pageSize.getWidth();
    const pageHeight = doc.internal.pageSize.getHeight();
    const margin = 12;
    const contentWidth = pageWidth - 2 * margin;
    let yPosition = margin;

    // Top centered company header
    doc.setFontSize(14);
    doc.setFont(undefined, 'bold');
    doc.text('GREEN MOOLAA BRAMPTON', pageWidth / 2, yPosition, { align: 'center' });
    yPosition += 5;

    doc.setFontSize(10);
    doc.text('263 QUEEN ST. E. UNIT 4', pageWidth / 2, yPosition, { align: 'center' });
    yPosition += 4;
    doc.text('BRAMPTON ON L6W 4K6', pageWidth / 2, yPosition, { align: 'center' });
    yPosition += 4;
    doc.text('(905) 796-7777', pageWidth / 2, yPosition, { align: 'center' });
    yPosition += 6;

    // Dividing line
    doc.setDrawColor(0, 0, 0);
    doc.line(margin, yPosition, pageWidth - margin, yPosition);
    yPosition += 5;

    // Extract data from loan object - use correct backend field names
    const custName = loan?.customer_name || `${selectedProfile?.first_name || selectedProfile?.firstName} ${selectedProfile?.last_name || selectedProfile?.lastName}` || 'N/A';
    const loanId = loan?.id || 'N/A';
    const transNum = loan?.transaction_number || 'N/A';
    const loanTerm_val = loan?.loan_term || 'N/A';
    const issueDate = loan?.loan_issued_date || new Date().toLocaleDateString();
    const amount = parseFloat(loan?.loan_amount || 0);
    
    let formattedDueDate = loan?.due_date || 'N/A';
    if (formattedDueDate && formattedDueDate !== 'N/A') {
      try {
        const dateObj = new Date(formattedDueDate);
        formattedDueDate = dateObj.toLocaleDateString();
      } catch (e) {
        // Keep original
      }
    }

    // Customer info on left, barcode placeholder on right
    doc.setFontSize(9);
    doc.setFont(undefined, 'bold');
    doc.text('[ORIGINAL]', margin, yPosition);
    
    // Transaction on right
    doc.setFontSize(8);
    doc.text(`Transaction: ${transNum}`, pageWidth - margin - 40, yPosition);
    yPosition += 5;

    doc.setFontSize(9);
    doc.setFont(undefined, 'normal');
    doc.text(`${custName}`, margin, yPosition);
    yPosition += 4;
    doc.setFontSize(8);
    doc.text(`Cust: ${loanId}; 1221 M/T: ${loanTerm_val}`, margin, yPosition);
    yPosition += 4;
    doc.text(`Contract Date: ${issueDate}  Date: ${issueDate} Time: ${new Date().toLocaleTimeString()}`, margin, yPosition);
    yPosition += 6;

    // Table header with proper column alignment
    const tableTop = yPosition;
    const colWidths = {
      item: 20,
      category: 30,
      description: 75,
      amount: 35
    };

    // Calculate column positions
    const col1Start = margin;
    const col2Start = col1Start + colWidths.item;
    const col3Start = col2Start + colWidths.category;
    const col4Start = col3Start + colWidths.description;

    // Header background
    doc.setFillColor(200, 200, 200);
    doc.rect(margin, tableTop, contentWidth, 7, 'F');

    doc.setFont(undefined, 'bold');
    doc.setFontSize(9);
    doc.text('ITEM', col1Start + 2, tableTop + 5);
    doc.text('CATEGORY', col2Start + 2, tableTop + 5);
    doc.text('DESCRIPTION', col3Start + 2, tableTop + 5);
    doc.text('AMOUNT', col4Start + 2, tableTop + 5, { align: 'right' });

    // Table borders
    doc.setDrawColor(0, 0, 0);
    doc.setLineWidth(0.3);
    
    // Outer border
    doc.rect(margin, tableTop, contentWidth, 7);
    
    // Column dividers
    doc.line(col2Start, tableTop, col2Start, tableTop + 7);
    doc.line(col3Start, tableTop, col3Start, tableTop + 7);
    doc.line(col4Start, tableTop, col4Start, tableTop + 7);

    yPosition = tableTop + 8;

    // Table content row - using extracted loan data
    doc.setFont(undefined, 'normal');
    doc.setFontSize(8);
    
    const collateralDesc_val = collateralDescription || 'Collateral Items';
    const itemNum = 'LN-' + loanId;
    const tableCategory = 'Collateral';
    const descText = doc.splitTextToSize(`${collateralDesc_val}`, colWidths.description - 4);
    const tableAmount = `$${amount.toFixed(2)}`;
    
    doc.text(itemNum, col1Start + 2, yPosition);
    doc.text(tableCategory, col2Start + 2, yPosition);
    doc.text(descText, col3Start + 2, yPosition);
    doc.text(tableAmount, col4Start + 30, yPosition, { align: 'right' });

    // Add height for wrapped description
    const descHeight = descText.length * 3.5;
    yPosition += Math.max(5, descHeight) + 3;

    // Charges/Due info row
    doc.setFont(undefined, 'normal');
    doc.setFontSize(8);
    doc.text('CHARGES ON THIS ACCOUNT ARE DUE ON OR BEFORE', margin + colWidths.item + colWidths.category + 5, yPosition);
    doc.text(formattedDueDate, pageWidth - margin - 40, yPosition);
    yPosition += 6;

    // Totals
    doc.setFont(undefined, 'bold');
    doc.setFontSize(9);
    doc.text('TOTAL', margin + colWidths.item + colWidths.category + 5, yPosition);
    doc.text(`$${amount.toFixed(2)}`, pageWidth - margin - 40, yPosition);
    yPosition += 8;

    // Legal text
    doc.setFont(undefined, 'normal');
    doc.setFontSize(7);
    const legalText = doc.splitTextToSize(
      `I, the undersigned (herein 'the seller'), do hereby loan the item(s) above to ${selectedProfile.firstName} ${selectedProfile.lastName} amount, the receipt of which is acknowledge by the undersigned (herein 'the Seller'), said Seller does sell, transfer, and assign all rights, title and interest in the described property to GRN. The seller declares that the above is their own personal property free and clear of all claims and liens whatsoever and that they have the full power to sell, transfer and deliver said property as provided herein.`,
      contentWidth - 4
    );
    doc.text(legalText, margin + 2, yPosition);
    yPosition += legalText.length * 3 + 3;

    // More legal text
    const legalText2 = doc.splitTextToSize(
      `Seller is hereby granted a ${selectedProfile.firstName} ${selectedProfile.lastName} option by GRN to repurchase the described property from GRN at a mutually agreeable price, which is set forth on this contract. The seller has (30) days from the date of this agreement to exercise this option. The seller is not obligated to exercise this option and will forfeit this option (1) days from the agreement date.`,
      contentWidth - 4
    );
    doc.text(legalText2, margin + 2, yPosition);
    yPosition += legalText2.length * 3 + 5;

    // Payment info
    doc.setFont(undefined, 'bold');
    doc.setFontSize(9);
    doc.text('MINIMUM 30 DAY PAYMENT DUE', margin + 2, yPosition);
    doc.text('$' + (parseFloat(totalPayableAmount) * 0.1).toFixed(2), pageWidth / 2 - 20, yPosition);
    yPosition += 5;
    doc.text('ALL FEES DUE', margin + 2, yPosition);
    doc.text('$' + parseFloat(totalPayableAmount).toFixed(2), pageWidth / 2 - 20, yPosition);

    // Bottom divider line
    doc.setDrawColor(0, 0, 0);
    doc.line(margin, pageHeight - 10, pageWidth - margin, pageHeight - 10);
    doc.setFontSize(7);
    doc.text('Pawn-GR-02-CAN', pageWidth - margin - 30, pageHeight - 5);

    // Save PDF
    doc.save(`loan-${transactionNumber}.pdf`);
    logger.info('Loan PDF generated', { transactionNumber });
  };

  if (!selectedProfile) {
    return <SearchCustomerProfileForm loggedInUser={loggedInUser} onProfileSelect={handleProfileSelect} />;
  }

  return (
    <div className="form-container">
      <h3>Create Loan Against Customer Profile</h3>

      {/* Message Area */}
      {message && (
        <div className={`alert alert-${messageType}`} style={{ marginBottom: '20px' }}>
          {message}
        </div>
      )}

      {/* Selected Profile Card */}
      <div className="card" style={{ marginBottom: '20px' }}>
        <div className="card-header">Selected Customer Profile</div>
        <div style={{ padding: '20px' }}>
          <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '20px' }}>
            <div>
              <p style={{ margin: '5px 0' }}>
                <strong>Name:</strong> {selectedProfile.firstName} {selectedProfile.lastName}
              </p>
              <p style={{ margin: '5px 0' }}>
                <strong>Customer ID:</strong> {selectedProfile.id}
              </p>
              <p style={{ margin: '5px 0' }}>
                <strong>Phone:</strong> {selectedProfile.homePhone || selectedProfile.mobilePhone || 'N/A'}
              </p>
              <p style={{ margin: '5px 0' }}>
                <strong>Address:</strong> {selectedProfile.streetAddress ? `${selectedProfile.streetAddress}, ${selectedProfile.city}, ${selectedProfile.state}` : 'N/A'}
              </p>
            </div>
            <div>
              <button
                type="button"
                onClick={() => {
                  setSelectedProfile(null);
                  setMessage('');
                  setMessageType('');
                }}
                className="btn-primary"
              >
                Change Profile
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Loan Creation Form */}
      <form onSubmit={handleSubmit}>
        {/* Loan Amount & Interest */}
        <fieldset style={{ border: '1px solid #ddd', padding: '15px', borderRadius: '8px', marginBottom: '20px' }}>
          <legend style={{ fontWeight: 'bold', paddingLeft: '10px', paddingRight: '10px' }}>Loan Details</legend>
          
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '16px' }}>
            <div className="form-group">
              <label htmlFor="loanAmount">Loan Amount *</label>
              <input
                type="number"
                id="loanAmount"
                value={loanAmount}
                onChange={(e) => setLoanAmount(e.target.value)}
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
                value={interestRate}
                onChange={(e) => setInterestRate(e.target.value)}
                placeholder="Enter interest rate"
                step="0.01"
                required
                disabled={loading}
              />
            </div>

            <div className="form-group">
              <label htmlFor="loanTerm">Loan Term (days) *</label>
              <input
                type="number"
                id="loanTerm"
                value={loanTerm}
                onChange={(e) => setLoanTerm(e.target.value)}
                placeholder="Enter loan term in days"
                required
                disabled={loading}
              />
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '16px', marginTop: '12px' }}>
            <div className="form-group">
              <label htmlFor="loanIssuedDate">Loan Issued Date</label>
              <input
                type="date"
                id="loanIssuedDate"
                value={loanIssuedDate}
                onChange={(e) => setLoanIssuedDate(e.target.value)}
                disabled={loading}
              />
            </div>

            <div className="form-group">
              <label htmlFor="dueDate">Due Date</label>
              <input
                type="date"
                id="dueDate"
                value={dueDate}
                disabled
              />
            </div>

            <div className="form-group">
              <label htmlFor="transactionNumber">Transaction Number</label>
              <input
                type="text"
                id="transactionNumber"
                value={transactionNumber}
                disabled
              />
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '16px', marginTop: '12px', backgroundColor: '#f0f4ff', padding: '12px', borderRadius: '8px' }}>
            <div style={{ padding: '0' }}>
              <p style={{ margin: '0 0 5px 0', fontSize: '12px', color: '#667eea' }}>Interest Amount</p>
              <p style={{ margin: '0', fontSize: '16px', fontWeight: 'bold', color: '#667eea' }}>
                ${interestAmount || '0.00'}
              </p>
            </div>
            <div style={{ padding: '0' }}>
              <p style={{ margin: '0 0 5px 0', fontSize: '12px', color: '#667eea' }}>Loan Amount</p>
              <p style={{ margin: '0', fontSize: '16px', fontWeight: 'bold', color: '#667eea' }}>
                ${parseFloat(loanAmount || 0).toFixed(2)}
              </p>
            </div>
            <div style={{ padding: '0' }}>
              <p style={{ margin: '0 0 5px 0', fontSize: '12px', color: '#667eea', fontWeight: 'bold' }}>Total Payable</p>
              <p style={{ margin: '0', fontSize: '16px', fontWeight: 'bold', color: '#28a745' }}>
                ${totalPayableAmount || '0.00'}
              </p>
            </div>
          </div>
        </fieldset>

        {/* Collateral & Notes */}
        <fieldset style={{ border: '1px solid #ddd', padding: '15px', borderRadius: '8px', marginBottom: '20px' }}>
          <legend style={{ fontWeight: 'bold', paddingLeft: '10px', paddingRight: '10px' }}>Collateral & Notes</legend>
          
          <div className="form-group">
            <label htmlFor="collateralDescription">Collateral Description *</label>
            <textarea
              id="collateralDescription"
              value={collateralDescription}
              onChange={(e) => setCollateralDescription(e.target.value)}
              placeholder="Describe the item being used as collateral"
              required
              disabled={loading}
              style={{ minHeight: '100px' }}
            />
          </div>

          <div className="form-group">
            <label htmlFor="customerNote">Additional Notes</label>
            <textarea
              id="customerNote"
              value={customerNote}
              onChange={(e) => setCustomerNote(e.target.value)}
              placeholder="Any additional notes about this loan"
              disabled={loading}
              style={{ minHeight: '80px' }}
            />
          </div>
        </fieldset>

        <button type="submit" className="btn-success" disabled={loading}>
          {loading ? 'Creating Loan...' : '✓ Create Loan'}
        </button>
      </form>
    </div>
  );
};

export default CreateLoanFromProfileForm;
