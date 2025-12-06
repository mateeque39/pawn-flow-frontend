import React, { useState, useEffect } from 'react';
import { jsPDF } from 'jspdf';
import { http } from './services/httpClient';
import logger from './services/logger';
import { getErrorMessage } from './services/errorHandler';
import CollateralImageCapture from './CollateralImageCapture';

const CreateLoanForm = ({ loggedInUser }) => {
  // State variables for the form fields
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [loanAmount, setLoanAmount] = useState('');
  const [interestRate, setInterestRate] = useState('');
  const [interestAmount, setInterestAmount] = useState('');
  const [totalPayableAmount, setTotalPayableAmount] = useState('');
  const [collateralDescription, setCollateralDescription] = useState('');
  const [collateralImage, setCollateralImage] = useState(null); // Collateral image
  const [showImageCapture, setShowImageCapture] = useState(false); // Show/hide image capture modal
  const [customerNote, setCustomerNote] = useState('');
  const [homePhone, setHomePhone] = useState('');
  const [mobilePhone, setMobilePhone] = useState('');
  const [birthdate, setBirthdate] = useState('');
  const [referral, setReferral] = useState('');
  const [idType, setIdType] = useState('');
  const [idNumber, setIdNumber] = useState('');
  const [idDetails, setIdDetails] = useState('');
  const [streetAddress, setStreetAddress] = useState('');
  const [city, setCity] = useState('');
  const [stateValue, setStateValue] = useState('');
  const [zipcode, setZipcode] = useState('');
  const [transactionNumber, setTransactionNumber] = useState('');
  const [loanIssuedDate, setLoanIssuedDate] = useState('');
  const [loanTerm, setLoanTerm] = useState(''); // Loan term in days
  const [dueDate, setDueDate] = useState('');
  const [recurringFee, setRecurringFee] = useState(''); // Monthly recurring flat fee
  const [message, setMessage] = useState('');

  // Handle image capture from webcam/file
  const handleImageCapture = (imageData) => {
    setCollateralImage(imageData);
    setShowImageCapture(false);
    logger.debug('Collateral image captured/selected');
  };

  // Remove captured image
  const removeCollateralImage = () => {
    setCollateralImage(null);
  };

  useEffect(() => {
    // Generate a random transaction number
    setTransactionNumber(Math.floor(Math.random() * 1000000000)); // Example random number

    // Set the current date as the loan issued date
    const currentDate = new Date().toISOString().split('T')[0]; // Format YYYY-MM-DD
    setLoanIssuedDate(currentDate);
  }, []);

  useEffect(() => {
    // Calculate the due date based on loan term (in days)
    if (loanTerm) {
      const issueDate = new Date(loanIssuedDate);
      const due = new Date(issueDate);
      due.setDate(due.getDate() + parseInt(loanTerm)); // Add loanTerm days to loanIssuedDate
      setDueDate(due.toISOString().split('T')[0]); // Format YYYY-MM-DD
    }
  }, [loanTerm, loanIssuedDate]);

  const calculateLoanDetails = () => {
    // Calculate the interest amount and total payable amount
    const interest = (loanAmount * interestRate) / 100;
    const totalPayable = parseFloat(loanAmount) + interest + (parseFloat(recurringFee) || 0);

    setInterestAmount(interest.toFixed(2));
    setTotalPayableAmount(totalPayable.toFixed(2));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Prepare loan data for backend
    const loanData = {
      firstName,
      lastName,
      homePhone,
      mobilePhone,
      email,
      birthdate,
      referral,
      id_type: idType,
      id_number: idNumber,
      identification_info: idDetails,
      streetAddress,
      city,
      state: stateValue,
      zipcode,
      loanAmount,
      interestRate,
      interestAmount,
      totalPayableAmount,
      recurringFee,
      collateralDescription,
      collateralImage,
      customerNote,
      transactionNumber,
      loanIssuedDate,
      loanTerm,
      dueDate,
      createdByUserId: loggedInUser?.id,
      createdByUsername: loggedInUser?.username
    };

    try {
      logger.debug('Creating loan with data:', loanData);
      console.log('Payload being sent to backend:', JSON.stringify(loanData, null, 2));
      const response = await http.post('/create-loan', loanData);
      console.log('Loan created response:', JSON.stringify(response.data, null, 2));
      setMessage('Loan created successfully!');
      logger.info('Loan created successfully', { transactionNumber: response.data.loan?.transaction_number });

      // Store creator info locally for display purposes (backend workaround)
      if (response.data.loan) {
        const createdLoans = JSON.parse(localStorage.getItem('createdLoans') || '{}');
        const transactionId = response.data.loan.transaction_number || response.data.loan.id;
        createdLoans[transactionId] = {
          created_by_username: loggedInUser?.username,
          created_by_user_id: loggedInUser?.id,
          created_at: new Date().toISOString()
        };
        localStorage.setItem('createdLoans', JSON.stringify(createdLoans));
        logger.debug('Stored creator info in localStorage for transaction:', transactionId);
      }

      // Generate PDF after loan creation
      if (response.data.loan) {
        generatePDF(response.data.loan);
      }
    } catch (error) {
      const userMessage = error.userMessage || getErrorMessage(error.parsedError || {});
      setMessage(`Error creating loan: ${userMessage}`);
      logger.error('Failed to create loan', error.parsedError || error);
    }
  };

  // Generate PDF with loan details
  const generatePDF = (loanData) => {
    console.log('=== PDF GENERATION DEBUG ===');
    console.log('Full loanData object:', loanData);
    console.log('Available keys:', Object.keys(loanData || {}));
    console.log('Raw values:');
    console.log('  id:', loanData?.id);
    console.log('  loan_id:', loanData?.loan_id);
    console.log('  transaction_number:', loanData?.transaction_number);
    console.log('  transactionNumber:', loanData?.transactionNumber);
    console.log('  loan_amount:', loanData?.loan_amount);
    console.log('  loanAmount:', loanData?.loanAmount);
    console.log('  first_name:', loanData?.first_name);
    console.log('  firstName:', loanData?.firstName);
    console.log('  last_name:', loanData?.last_name);
    console.log('  lastName:', loanData?.lastName);
    console.log('  due_date:', loanData?.due_date);
    console.log('  dueDate:', loanData?.dueDate);
    
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

    // Extract data from loanData - use correct backend field names
    const firstName = loanData?.first_name || '';
    const lastName = loanData?.last_name || '';
    const customerName = loanData?.customer_name || `${firstName} ${lastName}` || 'N/A';
    const loanId = loanData?.id || 'N/A';
    const transNumber = loanData?.transaction_number || 'N/A';
    
    // Amount fields - backend returns as loan_amount, not loanAmount
    const loanAmt = parseFloat(loanData?.loan_amount || 0);
    const interestAmt = parseFloat(loanData?.interest_amount || 0);
    const totalAmt = parseFloat(loanData?.total_payable_amount || 0);
    
    // Date fields - backend returns loan_issued_date and due_date
    let dueDate = loanData?.due_date || 'N/A';
    if (dueDate && dueDate !== 'N/A') {
      try {
        const dateObj = new Date(dueDate);
        dueDate = dateObj.toLocaleDateString();
      } catch (e) {
        // Keep original if parsing fails
      }
    }
    
    // Log extracted values for debugging
    console.log('Extracted PDF values:', {
      firstName,
      lastName,
      customerName,
      loanId,
      transNumber,
      loanAmt,
      interestAmt,
      totalAmt,
      dueDate
    });
    console.log('=== END DEBUG ===')

    // Customer info on left
    doc.setFontSize(9);
    doc.setFont(undefined, 'bold');
    doc.text('[ORIGINAL]', margin, yPosition);
    
    // Transaction on right
    doc.setFontSize(8);
    doc.text(`Transaction: ${transNumber}`, pageWidth - margin - 40, yPosition);
    yPosition += 5;

    doc.setFontSize(9);
    doc.setFont(undefined, 'normal');
    doc.text(`${firstName} ${lastName}`.trim(), margin, yPosition);
    yPosition += 4;
    doc.setFontSize(8);
    doc.text(`Loan ID: ${loanId}`, margin, yPosition);
    yPosition += 4;
    doc.text(`Loan Amount: $${loanAmt.toFixed(2)}`, margin, yPosition);
    yPosition += 4;
    doc.text(`Due Date: ${dueDate}`, margin, yPosition);
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

    // Table content row - using extracted data
    doc.setFont(undefined, 'normal');
    doc.setFontSize(8);
    
    const itemNum = 'LN-' + loanId;
    const tableCategory = 'Loan';
    const tableDescription = 'Pawn Loan Agreement';
    const tableAmount = `$${loanAmt.toFixed(2)}`;
    
    doc.text(itemNum, col1Start + 2, yPosition);
    doc.text(tableCategory, col2Start + 2, yPosition);
    doc.text(tableDescription, col3Start + 2, yPosition, { maxWidth: colWidths.description - 4 });
    doc.text(tableAmount, col4Start + 30, yPosition, { align: 'right' });

    yPosition += 8;

    // Charges/Due info row
    doc.setFont(undefined, 'normal');
    doc.setFontSize(8);
    doc.text('CHARGES ON THIS ACCOUNT ARE DUE ON OR BEFORE', margin + colWidths.item + colWidths.category + 5, yPosition);
    doc.text(dueDate, pageWidth - margin - 40, yPosition);
    yPosition += 6;

    // Totals
    doc.setFont(undefined, 'bold');
    doc.setFontSize(9);
    doc.text('TOTAL', margin + colWidths.item + colWidths.category + 5, yPosition);
    doc.text(`$${loanAmt.toFixed(2)}`, pageWidth - margin - 40, yPosition);
    yPosition += 8;

    // Legal text
    doc.setFont(undefined, 'normal');
    doc.setFontSize(7);
    const legalText = doc.splitTextToSize(
      `I, the undersigned (herein 'the seller'), do hereby loan the item(s) above to ${firstName} ${lastName} amount, the receipt of which is acknowledge by the undersigned (herein 'the Seller'), said Seller does sell, transfer, and assign all rights, title and interest in the described property to GRN. The seller declares that the above is their own personal property free and clear of all claims and liens whatsoever and that they have the full power to sell, transfer and deliver said property as provided herein.`,
      contentWidth - 4
    );
    doc.text(legalText, margin + 2, yPosition);

    // Bottom divider line
    doc.setDrawColor(0, 0, 0);
    doc.line(margin, pageHeight - 10, pageWidth - margin, pageHeight - 10);
    doc.setFontSize(7);
    doc.text('Pawn-GR-02-CAN', pageWidth - margin - 30, pageHeight - 5);

    // Save the generated PDF
    doc.save(`loan_${transNumber}.pdf`);
  };

  return (
    <div className="form-container">
      <h3>Create New Loan</h3>
      <form onSubmit={handleSubmit}>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
          <div className="form-group">
            <label>First Name</label>
            <input
              type="text"
              placeholder="First name"
              value={firstName}
              onChange={(e) => setFirstName(e.target.value)}
              required
            />
          </div>
          <div className="form-group">
            <label>Last Name</label>
            <input
              type="text"
              placeholder="Last name"
              value={lastName}
              onChange={(e) => setLastName(e.target.value)}
              required
            />
          </div>
        </div>

        <div className="form-group">
          <label>Email Address</label>
          <input
            type="email"
            placeholder="Email address"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
          <div className="form-group">
            <label>Home Phone</label>
            <input
              type="text"
              placeholder="Home phone"
              value={homePhone}
              onChange={(e) => setHomePhone(e.target.value)}
            />
          </div>
          <div className="form-group">
            <label>Mobile Phone</label>
            <input
              type="text"
              placeholder="Mobile phone"
              value={mobilePhone}
              onChange={(e) => setMobilePhone(e.target.value)}
            />
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
          <div className="form-group">
            <label>Birthdate</label>
            <input
              type="date"
              value={birthdate}
              onChange={(e) => setBirthdate(e.target.value)}
            />
          </div>
          <div className="form-group">
            <label>Referral</label>
            <input
              type="text"
              placeholder="Referral source"
              value={referral}
              onChange={(e) => setReferral(e.target.value)}
            />
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr 1fr', gap: '20px' }}>
          <div className="form-group">
            <label>Loan Amount ($)</label>
            <input
              type="number"
              placeholder="0.00"
              value={loanAmount}
              onChange={(e) => setLoanAmount(e.target.value)}
              onBlur={calculateLoanDetails}
              required
            />
          </div>
          <div className="form-group">
            <label>Interest Rate (%)</label>
            <input
              type="number"
              placeholder="0.00"
              value={interestRate}
              onChange={(e) => setInterestRate(e.target.value)}
              onBlur={calculateLoanDetails}
              required
            />
          </div>
          <div className="form-group">
            <label>Loan Term (Days)</label>
            <input
              type="number"
              placeholder="30"
              value={loanTerm}
              onChange={(e) => setLoanTerm(e.target.value)}
              required
            />
          </div>
          <div className="form-group">
            <label>Recurring Fee ($/month)</label>
            <input
              type="number"
              placeholder="0.00"
              step="0.01"
              value={recurringFee}
              onChange={(e) => setRecurringFee(e.target.value)}
              onBlur={calculateLoanDetails}
            />
          </div>
        </div>

        <div className="card" style={{ backgroundColor: '#f8f9fb', marginBottom: '20px' }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
            <div>
              <p><strong>Interest Amount:</strong> ${interestAmount}</p>
            </div>
            <div>
              <p><strong>Total Payable Amount:</strong> ${totalPayableAmount}</p>
            </div>
          </div>
        </div>

        <div className="form-group">
          <label>Collateral Description</label>
          <textarea
            placeholder="Describe the collateral being pledged"
            value={collateralDescription}
            onChange={(e) => setCollateralDescription(e.target.value)}
          />
        </div>

        {/* Collateral Image Capture Section */}
        <div className="card" style={{ marginBottom: '20px', backgroundColor: '#f8f9fb' }}>
          <div className="card-header">Collateral Image</div>
          <div style={{ marginTop: '15px' }}>
            {collateralImage ? (
              <div>
                <img
                  src={collateralImage}
                  alt="Collateral"
                  style={{
                    width: '100%',
                    maxHeight: '250px',
                    borderRadius: '8px',
                    marginBottom: '15px',
                    objectFit: 'cover'
                  }}
                />
                <button
                  type="button"
                  className="btn-secondary"
                  onClick={removeCollateralImage}
                  style={{ width: '100%', marginBottom: '10px' }}
                >
                  Remove Image
                </button>
                <button
                  type="button"
                  className="btn-primary"
                  onClick={() => setShowImageCapture(true)}
                  style={{ width: '100%' }}
                >
                  Change Image
                </button>
              </div>
            ) : (
              <button
                type="button"
                className="btn-primary"
                onClick={() => setShowImageCapture(true)}
                style={{ width: '100%', padding: '12px' }}
              >
                📷 Capture or Upload Collateral Image
              </button>
            )}
          </div>
        </div>

        <div className="form-group">
          <label>Customer Notes</label>
          <textarea
            placeholder="Add any additional notes"
            value={customerNote}
            onChange={(e) => setCustomerNote(e.target.value)}
          />
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
          <div className="form-group">
            <label>ID Type</label>
            <input
              type="text"
              placeholder="e.g., Passport, Driver's License"
              value={idType}
              onChange={(e) => setIdType(e.target.value)}
            />
          </div>
          <div className="form-group">
            <label>ID Number</label>
            <input
              type="text"
              placeholder="ID number"
              value={idNumber}
              onChange={(e) => setIdNumber(e.target.value)}
            />
          </div>
        </div>

        <div className="form-group">
          <label>ID Details</label>
          <textarea
            placeholder="Additional details about the ID"
            value={idDetails}
            onChange={(e) => setIdDetails(e.target.value)}
          />
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
          <div className="form-group">
            <label>Street Address</label>
            <input
              type="text"
              placeholder="Street address"
              value={streetAddress}
              onChange={(e) => setStreetAddress(e.target.value)}
            />
          </div>
          <div className="form-group">
            <label>City</label>
            <input
              type="text"
              placeholder="City"
              value={city}
              onChange={(e) => setCity(e.target.value)}
            />
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
          <div className="form-group">
            <label>State</label>
            <input
              type="text"
              placeholder="State"
              value={stateValue}
              onChange={(e) => setStateValue(e.target.value)}
            />
          </div>
          <div className="form-group">
            <label>Zipcode</label>
            <input
              type="text"
              placeholder="Zipcode"
              value={zipcode}
              onChange={(e) => setZipcode(e.target.value)}
            />
          </div>
        </div>

        <div className="card" style={{ backgroundColor: '#f8f9fb', marginBottom: '20px' }}>
          <p><strong>Transaction Number:</strong> <span style={{ color: '#667eea', fontSize: '16px' }}>{transactionNumber}</span></p>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
          <div className="form-group">
            <label>Loan Issued Date</label>
            <input type="date" value={loanIssuedDate} disabled style={{ backgroundColor: '#e0e6ed' }} />
          </div>
          <div className="form-group">
            <label>Due Date</label>
            <input type="date" value={dueDate} disabled style={{ backgroundColor: '#e0e6ed' }} />
          </div>
        </div>

        <button type="submit" className="btn-success" style={{ width: '100%', marginTop: '10px' }}>Create Loan</button>
      </form>

      {message && (
        <div className={`alert alert-${message.includes('successfully') ? 'success' : 'error'}`} style={{ marginTop: '20px' }}>
          {message}
        </div>
      )}

      {/* Collateral Image Capture Modal */}
      {showImageCapture && (
        <CollateralImageCapture
          onImageCapture={handleImageCapture}
          onCancel={() => setShowImageCapture(false)}
        />
      )}
    </div>
  );
};

export default CreateLoanForm;
