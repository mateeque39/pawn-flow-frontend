import React, { useState } from "react";
import axios from "axios";

const SearchLoanForm = ({ loggedInUser }) => {
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [customerNumber, setCustomerNumber] = useState("");
  const [email, setEmail] = useState("");
  const [transactionNumber, setTransactionNumber] = useState("");
  const [loans, setLoans] = useState([]);
  const [message, setMessage] = useState("");
  const [paymentHistory, setPaymentHistory] = useState([]);
  const [amountToAdd, setAmountToAdd] = useState(""); // State to track money to add
  const [selectedLoanId, setSelectedLoanId] = useState(null); // Track the loan to which money is added

  // Handle loan search
  const handleSearch = async (e) => {
    e.preventDefault();

    try {
      const response = await axios.get("http://localhost:5000/search-loan", {
        params: {
          firstName,
          lastName,
          customerNumber,
          email,
          transactionNumber,
          _ts: Date.now(), // cache-busting timestamp to avoid 304 cached responses
        },
        headers: {
          'Cache-Control': 'no-cache',
          Pragma: 'no-cache',
        },
      });

      if (response.data.length === 0) {
        setMessage("No loans found");
        setLoans([]);
        setPaymentHistory([]);
        return;
      }

      setLoans(response.data);
      setMessage("");
      // Fetch payment history for the first loan if it has an id
      const firstLoan = response.data[0];
      if (firstLoan && (firstLoan.id || firstLoan.transaction_number)) {
        try {
          const paymentRes = await axios.get("http://localhost:5000/payment-history", {
            params: { loanId: firstLoan.id || firstLoan.transaction_number, _ts: Date.now() },
            headers: {
              'Cache-Control': 'no-cache',
              Pragma: 'no-cache',
            },
          });

          setPaymentHistory(paymentRes.data || []);
        } catch (histErr) {
          console.warn('Could not fetch payment history:', histErr?.response?.data || histErr.message);
          setPaymentHistory([]);
        }
      } else {
        setPaymentHistory([]);
      }
    } catch (error) {
      console.error(error);
      setMessage("Error searching for loans");
      setLoans([]);
      setPaymentHistory([]);
    }
  };

  // Add money to loan (unconditional as long as loan is active)
  const handleAddMoney = async () => {
    if (!amountToAdd || isNaN(amountToAdd) || parseFloat(amountToAdd) <= 0) {
      alert("Please enter a valid amount");
      return;
    }

    try {
      const loanToUpdate = loans.find((loan) => loan.id === selectedLoanId);
      if (!loanToUpdate) return;

      // Parse the current loan amount to ensure proper arithmetic
      const currentLoanAmount = parseFloat(loanToUpdate.loan_amount);
      const amountToAddNum = parseFloat(amountToAdd);

      // Recalculate new loan values
      const newLoanAmount = currentLoanAmount + amountToAddNum;
      const newInterestAmount = (newLoanAmount * loanToUpdate.interest_rate) / 100;
      const newTotalPayableAmount = newLoanAmount + newInterestAmount;
      const newRemainingBalance = newTotalPayableAmount;

      const response = await axios.post("http://localhost:5000/add-money", {
        loanId: selectedLoanId,
        amount: amountToAddNum,
        newLoanAmount,
        newInterestAmount,
        newTotalPayableAmount,
        addedByUserId: loggedInUser?.id,
        addedByUsername: loggedInUser?.username
      });

      alert("Money added successfully!");

      // Update loan amount, interest, total payable amount, and remaining balance
      setLoans(
        loans.map((loan) =>
          loan.id === selectedLoanId
            ? {
                ...loan,
                loan_amount: newLoanAmount,
                interest_amount: newInterestAmount,
                total_payable_amount: newTotalPayableAmount,
                remaining_balance: newRemainingBalance,
              }
            : loan
        )
      );

      setAmountToAdd(""); // Clear the amount input after submitting
      setSelectedLoanId(null); // Deselect the loan
    } catch (error) {
      alert("Error adding money");
      console.error(error);
    }
  };

  // Redeem loan if fully paid
  const handleRedeemLoan = async (loanId) => {
    try {
      const response = await axios.post("http://localhost:5000/redeem-loan", {
        loanId,
        redeemedByUserId: loggedInUser?.id,
        redeemedByUsername: loggedInUser?.username
      });

      alert("Loan redeemed successfully!");
      // Optionally, update the loan status in your frontend after redemption
      setLoans(loans.map((loan) => (loan.id === loanId ? { ...loan, status: "redeemed" } : loan)));
    } catch (error) {
      console.error(error);
      alert("Error redeeming loan");
    }
  };

  return (
    <div className="form-container">
      <h3>Search Loan</h3>

      <form onSubmit={handleSearch}>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
          <div className="form-group">
            <label>First Name</label>
            <input
              type="text"
              placeholder="Search by first name"
              value={firstName}
              onChange={(e) => setFirstName(e.target.value)}
            />
          </div>
          <div className="form-group">
            <label>Last Name</label>
            <input
              type="text"
              placeholder="Search by last name"
              value={lastName}
              onChange={(e) => setLastName(e.target.value)}
            />
          </div>
          <div className="form-group">
            <label>Phone Number</label>
            <input
              type="text"
              placeholder="Search by phone"
              value={customerNumber}
              onChange={(e) => setCustomerNumber(e.target.value)}
            />
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
          <div className="form-group">
            <label>Email Address</label>
            <input
              type="email"
              placeholder="Search by email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>
          <div className="form-group">
            <label>Transaction Number</label>
            <input
              type="text"
              placeholder="Search by transaction"
              value={transactionNumber}
              onChange={(e) => setTransactionNumber(e.target.value)}
            />
          </div>
        </div>

        <button type="submit" className="btn-primary" style={{ width: '100%' }}>Search Loans</button>
      </form>

      {/* Message Area */}
      {message && (
        <div className={`alert alert-${message.includes('found') ? 'error' : 'info'}`} style={{ marginTop: '20px' }}>
          {message}
        </div>
      )}

      {/* Display Multiple Loans */}
      {loans.length > 0 && (
        <div style={{ marginTop: '30px' }}>
          <h4 style={{ borderBottom: '2px solid #667eea', paddingBottom: '10px', marginBottom: '20px' }}>Loan Details ({loans.length})</h4>

          {loans.map((loan, idx) => (
            <div key={loan.id || loan.transaction_number || idx} className="card">
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', marginBottom: '15px' }}>
                <div>
                  <p><strong>First Name:</strong> {loan.first_name || loan.firstName || (loan.customer_name ? (loan.customer_name.split(' ')[0]) : '')}</p>
                  <p><strong>Last Name:</strong> {loan.last_name || loan.lastName || (loan.customer_name ? loan.customer_name.split(' ').slice(1).join(' ') : '')}</p>
                  <p><strong>Home Phone:</strong> {loan.home_phone || loan.homePhone || ''}</p>
                  <p><strong>Mobile Phone:</strong> {loan.mobile_phone || loan.mobilePhone || loan.customer_number}</p>
                  <p><strong>Email:</strong> {loan.email || loan.customer_email || loan.customerEmail || ''}</p>
                  <p><strong>Birthdate:</strong> {loan.birthdate || loan.birth_date || ''}</p>
                  <p><strong>Referral:</strong> {loan.referral || ''}</p>
                  <p><strong>ID Type:</strong> {loan.id_type || loan.idType || loan.identification_type || loan.identificationType || (loan.identification && (loan.identification.type || loan.identification.id_type || loan.identification.name)) || ''}</p>
                  <p><strong>ID Number:</strong> {loan.id_number || loan.idNumber || loan.identification_number || loan.identificationNumber || loan.id_no || loan.idNo || (loan.identification && (loan.identification.number || loan.identification.id_number || loan.identification.idNo)) || ''}</p>
                  <p><strong>ID Details:</strong> {loan.identification_info || loan.identificationInfo || ''}</p>
                  <p><strong>Street:</strong> {loan.street_address || loan.streetAddress || loan.address || ''}</p>
                  <p><strong>City:</strong> {loan.city || ''}</p>
                  <p><strong>State:</strong> {loan.state || loan.stateValue || ''}</p>
                  <p><strong>Zipcode:</strong> {loan.zipcode || loan.postal_code || ''}</p>
                </div>
                <div>
                  <p><strong>Transaction Number:</strong> {loan.transaction_number || loan.transactionNumber || loan.transaction_id || loan.transactionId || ''}</p>
                  <p><strong>Loan Issued Date:</strong> {loan.loan_issued_date?.substring(0, 10)}</p>
                  <p><strong>Due Date:</strong> {loan.due_date?.substring(0, 10)}</p>
                </div>
              </div>

              <div style={{ backgroundColor: '#e8f4f8', padding: '12px', borderRadius: '6px', marginBottom: '15px', borderLeft: '4px solid #5dd9ff' }}>
                <p>
                  <strong>Created by:</strong>
                  {
                    ' ' + (
                      loan.created_by_username || loan.createdByUsername ||
                      (loan.created_by && (loan.created_by.username || loan.created_by.name)) ||
                      loan.created_by || loan.createdBy || ''
                    )
                  }
                  {' '}
                  (ID: {
                    loan.created_by_user_id || loan.createdByUserId ||
                    (loan.created_by && (loan.created_by.id || loan.created_by.user_id)) ||
                    loan.created_by_user || loan.creator_id || ''
                  })
                </p>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', marginBottom: '15px' }}>
                <div>
                  <p><strong>Loan Amount:</strong> $ {loan.loan_amount}</p>
                  <p><strong>Interest Amount:</strong> $ {loan.interest_amount}</p>
                </div>
                <div>
                  <p><strong>Total Payable Amount:</strong> $ {loan.total_payable_amount}</p>
                  <p><strong>Remaining Balance:</strong> $ {loan.remaining_balance}</p>
                </div>
              </div>

              <div style={{ marginBottom: '15px' }}>
                <p><strong>Status:</strong> <span className={`badge badge-${loan.status === 'active' ? 'success' : loan.status === 'overdue' ? 'danger' : 'info'}`}>{loan.status}</span></p>
              </div>

              {/* Redeem or Add Money buttons */}
              {loan.status === "active" && (
                <div style={{ display: 'flex', gap: '10px', marginBottom: '10px' }}>
                  <button onClick={() => handleRedeemLoan(loan.id)} className="btn-success">Redeem Loan</button>
                  <button onClick={() => setSelectedLoanId(loan.id)} className="btn-info">Add Money</button>
                </div>
              )}

              {/* Show Add Money field when button is clicked */}
              {selectedLoanId === loan.id && (
                <div style={{ display: 'flex', gap: '10px', padding: '15px', backgroundColor: '#f8f9fb', borderRadius: '8px' }}>
                  <input
                    type="number"
                    value={amountToAdd}
                    onChange={(e) => setAmountToAdd(e.target.value)}
                    placeholder="Enter amount to add"
                    style={{ flex: 1 }}
                  />
                  <button onClick={handleAddMoney} className="btn-success">Submit</button>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Show Payment History */}
      {paymentHistory.length > 0 && (
        <div style={{ marginTop: '30px' }}>
          <h4 style={{ borderBottom: '2px solid #667eea', paddingBottom: '10px', marginBottom: '20px' }}>Payment History</h4>
          {paymentHistory.map((payment, pidx) => (
            <div key={payment.id || pidx} className="card">
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '20px', marginBottom: '10px' }}>
                <p><strong>Amount Paid:</strong> $ {payment.payment_amount}</p>
                <p><strong>Method:</strong> {payment.payment_method}</p>
                <p><strong>Date:</strong> {new Date(payment.payment_date).toLocaleString()}</p>
              </div>
              <div style={{ backgroundColor: '#f0e8f8', padding: '10px', borderRadius: '6px', borderLeft: '4px solid #5dd9ff' }}>
                <p><strong>Payment processed by:</strong> {payment.processed_by_username} (ID: {payment.processed_by_user_id})</p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default SearchLoanForm;
