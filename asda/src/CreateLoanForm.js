import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { jsPDF } from 'jspdf'; // Import jsPDF for PDF generation

const CreateLoanForm = ({ loggedInUser }) => {
  // State variables for the form fields
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [customerNumber, setCustomerNumber] = useState('');
  const [email, setEmail] = useState('');
  const [loanAmount, setLoanAmount] = useState('');
  const [interestRate, setInterestRate] = useState('');
  const [interestAmount, setInterestAmount] = useState('');
  const [totalPayableAmount, setTotalPayableAmount] = useState('');
  const [collateralDescription, setCollateralDescription] = useState('');
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
  const [message, setMessage] = useState('');

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
    const totalPayable = parseFloat(loanAmount) + interest;

    setInterestAmount(interest.toFixed(2));
    setTotalPayableAmount(totalPayable.toFixed(2));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Prepare loan data for backend
    const loanData = {
      firstName,
      lastName,
      customerNumber,
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
      collateralDescription,
      customerNote,
      transactionNumber,
      loanIssuedDate,
      loanTerm,
      dueDate,
      createdByUserId: loggedInUser?.id,
      createdByUsername: loggedInUser?.username
    };

    try {
      console.log('Creating loan, payload:', loanData);
      const response = await axios.post('http://localhost:5000/create-loan', loanData);
      setMessage('Loan created successfully!');

      // Generate PDF after loan creation
      generatePDF(response.data.loan);

      // Reset the form or update UI as needed
      console.log(response.data); // Optionally log the created loan
    } catch (error) {
      const status = error?.response?.status;
      const respData = error?.response?.data;
      const serverMessage = respData?.message || respData || error.message;
      setMessage(`Error creating loan${status ? ` (status ${status})` : ''}: ${serverMessage}`);
      console.error('Create loan error:', {
        message: error.message,
        status,
        responseData: respData,
        request: error?.request,
      });
    }
  };

  // Generate PDF with loan details
  const generatePDF = (loanData) => {
    const doc = new jsPDF();

    doc.setFontSize(16);
    doc.text('Loan Details', 20, 20);

    // Add loan details to the PDF
      doc.setFontSize(12);
      const first = loanData.first_name || loanData.firstName || (loanData.customer_name ? loanData.customer_name.split(' ')[0] : '') || '';
      const last = loanData.last_name || loanData.lastName || (loanData.customer_name ? loanData.customer_name.split(' ').slice(1).join(' ') : '') || '';
      const home = loanData.home_phone || loanData.homePhone || '';
      const mobile = loanData.mobile_phone || loanData.mobilePhone || loanData.customer_number || '';
      const idTypeVal = loanData.id_type || loanData.idType || '';
      const idNumberVal = loanData.id_number || loanData.idNumber || '';
      const idDetailsVal = loanData.identification_info || loanData.identificationInfo || loanData.idDetails || '';
      const street = loanData.street_address || loanData.streetAddress || loanData.address || '';
      const cityVal = loanData.city || '';
      const stateVal = loanData.state || loanData.stateValue || '';
      const zip = loanData.zipcode || loanData.postal_code || '';

      doc.text(`First Name: ${first}`, 20, 30);
      doc.text(`Last Name: ${last}`, 20, 40);
      doc.text(`Email: ${loanData.email || ''}`, 20, 50);
      doc.text(`Home Phone: ${home}`, 20, 60);
      doc.text(`Mobile Phone: ${mobile}`, 20, 70);
      doc.text(`ID Type: ${idTypeVal}`, 20, 80);
      doc.text(`ID Number: ${idNumberVal}`, 20, 90);
      doc.text(`ID Details: ${idDetailsVal}`, 20, 100);
      doc.text(`Street: ${street}`, 20, 110);
      doc.text(`City: ${cityVal}`, 20, 120);
      doc.text(`State: ${stateVal}`, 20, 130);
      doc.text(`Zipcode: ${zip}`, 20, 140);
      doc.text(`Loan Amount: $ ${loanData.loan_amount || loanData.loanAmount || ''}`, 20, 150);
      doc.text(`Interest Rate: ${loanData.interest_rate || loanData.interestRate || ''}%`, 20, 160);
      doc.text(`Interest Amount: $ ${loanData.interest_amount || loanData.interestAmount || ''}`, 20, 170);
      doc.text(`Total Payable Amount: $ ${loanData.total_payable_amount || loanData.totalPayableAmount || ''}`, 20, 180);
      doc.text(`Loan Issued Date: ${loanData.loan_issued_date || loanData.loanIssuedDate || ''}`, 20, 190);
      doc.text(`Due Date: ${loanData.due_date || loanData.dueDate || ''}`, 20, 200);
      doc.text(`Transaction Number: ${loanData.transaction_number || loanData.transactionNumber || ''}`, 20, 210);

    // Save the generated PDF
    doc.save(`loan_${loanData.transaction_number}.pdf`);
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

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
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
            <label>Loan Term (Days)</label>
            <input
              type="number"
              placeholder="30"
              value={loanTerm}
              onChange={(e) => setLoanTerm(e.target.value)}
              required
            />
          </div>
        </div>

        <div className="form-group">
          <label>Due Date</label>
          <input type="date" value={dueDate} disabled style={{ backgroundColor: '#e0e6ed' }} />
        </div>

        <button type="submit" className="btn-success" style={{ width: '100%', marginTop: '10px' }}>Create Loan</button>
      </form>

      {message && (
        <div className={`alert alert-${message.includes('successfully') ? 'success' : 'error'}`} style={{ marginTop: '20px' }}>
          {message}
        </div>
      )}
    </div>
  );
};

export default CreateLoanForm;
