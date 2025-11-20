import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { jsPDF } from 'jspdf'; // Import jsPDF for PDF generation

const CreateLoanForm = ({ loggedInUser }) => {
  // State variables for the form fields
  const [customerName, setCustomerName] = useState('');
  const [customerNumber, setCustomerNumber] = useState('');
  const [email, setEmail] = useState('');
  const [loanAmount, setLoanAmount] = useState('');
  const [interestRate, setInterestRate] = useState('');
  const [interestAmount, setInterestAmount] = useState('');
  const [totalPayableAmount, setTotalPayableAmount] = useState('');
  const [collateralDescription, setCollateralDescription] = useState('');
  const [customerNote, setCustomerNote] = useState('');
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
      customerName,
      customerNumber,
      email,
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
      const response = await axios.post('http://localhost:5000/create-loan', loanData);
      setMessage('Loan created successfully!');
      
      // Generate PDF after loan creation
      generatePDF(response.data.loan);

      // Reset the form or update UI as needed
      console.log(response.data); // Optionally log the created loan
    } catch (error) {
      setMessage('Error creating loan');
      console.error(error);
    }
  };

  // Generate PDF with loan details
  const generatePDF = (loanData) => {
    const doc = new jsPDF();

    doc.setFontSize(16);
    doc.text('Loan Details', 20, 20);

    // Add loan details to the PDF
    doc.setFontSize(12);
    doc.text(`Customer Name: ${loanData.customer_name}`, 20, 30);
    doc.text(`Email: ${loanData.email}`, 20, 40);
    doc.text(`Phone: ${loanData.customer_number}`, 20, 50);
    doc.text(`Loan Amount: $ ${loanData.loan_amount}`, 20, 60);
    doc.text(`Interest Rate: ${loanData.interest_rate}%`, 20, 70);
    doc.text(`Interest Amount: $ ${loanData.interest_amount}`, 20, 80);
    doc.text(`Total Payable Amount: $ ${loanData.total_payable_amount}`, 20, 90);
    doc.text(`Loan Issued Date: ${loanData.loan_issued_date}`, 20, 100);
    doc.text(`Due Date: ${loanData.due_date}`, 20, 110);
    doc.text(`Transaction Number: ${loanData.transaction_number}`, 20, 120);

    // Save the generated PDF
    doc.save(`loan_${loanData.transaction_number}.pdf`);
  };

  return (
    <div className="form-container">
      <h3>Create New Loan</h3>
      <form onSubmit={handleSubmit}>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
          <div className="form-group">
            <label>Customer Name</label>
            <input
              type="text"
              placeholder="Full name"
              value={customerName}
              onChange={(e) => setCustomerName(e.target.value)}
              required
            />
          </div>
          <div className="form-group">
            <label>Phone Number</label>
            <input
              type="text"
              placeholder="Contact number"
              value={customerNumber}
              onChange={(e) => setCustomerNumber(e.target.value)}
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
