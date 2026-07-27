import React, { useState } from "react";
import { http } from './services/httpClient';
import { parseError, getErrorMessage } from './services/errorHandler';
import logger from './services/logger';

const MakePaymentForm = ({ loggedInUser }) => {
  const [transactionNumber, setTransactionNumber] = useState("");
  const [paymentMethod, setPaymentMethod] = useState("cash");
  const [paymentAmount, setPaymentAmount] = useState("");
  const [redemptionFee, setRedemptionFee] = useState("");
  const [loan, setLoan] = useState(null);
  const [paymentHistory, setPaymentHistory] = useState([]);
  const [message, setMessage] = useState("");
  const [loanDueDateExtended, setLoanDueDateExtended] = useState(false);  // New state for tracking due date extension

  // Search loan using transaction number
  const handleSearchLoan = async () => {
    try {
      const response = await http.get("/search-loan", {
        params: { transactionNumber, _ts: Date.now() },
      });

      if (!response || response.length === 0) {
        setMessage("Loan not found");
        setLoan(null);
        setPaymentHistory([]);
        return;
      }

      const foundLoan = response[0];
      setLoan(foundLoan);
      setMessage("");

      // Fetch payment history
      const historyRes = await http.get("/payment-history", {
        params: { loanId: foundLoan.id },
      });

      const history = historyRes?.payments || historyRes || [];
      setPaymentHistory(history.filter((p) => p));
      logger.debug('Loan and payment history retrieved', { loanId: foundLoan.id });
    } catch (error) {
      const parsedError = parseError(error);
      const userMessage = getErrorMessage(parsedError);
      setMessage(userMessage);
      logger.error('Error searching loan', parsedError);
    }
  };

  // Submit payment
  const handlePaymentSubmit = async (e) => {
    e.preventDefault();

    if (!paymentAmount || Number(paymentAmount) <= 0) {
      setMessage("Please enter a valid payment amount");
      return;
    }

    if (!loan) {
      setMessage("Search loan first");
      return;
    }

    if (loan.status === "redeemed") {
      setMessage("Loan already redeemed. Cannot take payments.");
      return;
    }

    try {
      // Check if this payment will fully redeem the loan
      const remainingAfterPayment = parseFloat(loan.remaining_balance) - parseFloat(paymentAmount);
      const willFullyPay = remainingAfterPayment <= 0;

      const response = await http.post(`/customers/${loan.customer_id}/loans/${loan.id}/payment`, {
        paymentMethod,
        paymentAmount,
        userId: loggedInUser?.id,
        redemptionFee: (willFullyPay && redemptionFee) ? parseFloat(redemptionFee) : undefined
      });

      setMessage("Payment successful!");

      // Update loan details with new remaining balance
      setLoan(response.loan);

      // Add new payment record to history
      setPaymentHistory([response.paymentHistory, ...paymentHistory]);

      // Check if loan is fully paid
      if (response.loan.remaining_balance === 0) {
        setMessage("🎉 Loan is now fully paid and automatically redeemed!");
      }

      // Check if payment covers interest and attempt to extend due date
      const totalPaymentsMade = paymentHistory.reduce((sum, p) => sum + parseFloat(p.payment_amount || 0), 0) + parseFloat(paymentAmount);
      if (totalPaymentsMade >= loan.interest_amount && new Date() > new Date(loan.due_date)) {
        try {
          const extendResponse = await http.post("/extend-loan", {
            loanId: loan.id,
          });
          setMessage("Payment successful! Loan due date extended by 30 days!");
          setLoan(extendResponse.loan);
          setLoanDueDateExtended(true);
          logger.info('Payment successful and loan extended', { loanId: loan.id });
        } catch (extendError) {
          setMessage("Payment successful!");
          logger.info('Payment successful', { loanId: loan.id });
        }
      }

      setPaymentAmount("");
      setRedemptionFee("");
    } catch (error) {
      const parsedError = parseError(error);
      const userMessage = getErrorMessage(parsedError);
      setMessage(userMessage);
      logger.error('Error making payment', parsedError);
    }
  };

  return (
    <div className="form-container">
      <h3>Make Payment</h3>

      <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '15px', marginBottom: '20px' }}>
        <div className="form-group">
          <label>Transaction Number</label>
          <input
            type="text"
            placeholder="Enter transaction number"
            value={transactionNumber}
            onChange={(e) => setTransactionNumber(e.target.value)}
          />
        </div>
        <button onClick={handleSearchLoan} className="btn-primary" style={{ height: 'fit-content', alignSelf: 'flex-end' }}>Search Loan</button>
      </div>

      {/* Message Area */}
      {message && (
        <div className={`alert alert-${message.includes('successful') || message.includes('fully paid') ? 'success' : 'error'}`} style={{ marginBottom: '20px' }}>
          {message}
        </div>
      )}

      {loan && (
        <div>
          <div className="card" style={{ marginBottom: '20px' }}>
            <div className="card-header">Loan Details</div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', marginTop: '15px' }}>
              <p><strong>Customer Name:</strong> {loan.customer_name}</p>
              <p><strong>Status:</strong> <span className={`badge badge-${loan.status === 'active' ? 'success' : 'danger'}`}>{loan.status}</span></p>
              <p><strong>Loan Amount:</strong> $ {loan.loan_amount}</p>
              <p><strong>Total Payable:</strong> $ {loan.total_payable_amount}</p>
              <p><strong>Remaining Balance:</strong> $ {loan.remaining_balance}</p>
            </div>
          </div>

          {/* Payment Form */}
          {loan.status !== 'redeemed' && (
            <div className="card" style={{ marginBottom: '20px' }}>
              <div className="card-header">Process Payment</div>
              <form onSubmit={handlePaymentSubmit} style={{ marginTop: '15px' }}>
                <div className="form-group">
                  <label>Payment Method</label>
                  <select value={paymentMethod} onChange={(e) => setPaymentMethod(e.target.value)}>
                    <option value="cash">Cash</option>
                    <option value="card">Card</option>
                  </select>
                </div>

                <div className="form-group">
                  <label>Payment Amount ($)</label>
                  <input
                    type="number"
                    placeholder="0.00"
                    value={paymentAmount}
                    onChange={(e) => setPaymentAmount(e.target.value)}
                    required
                  />
                </div>

                {/* Show redemption fee input only if payment will fully pay the loan */}
                {paymentAmount && loan.remaining_balance && (parseFloat(loan.remaining_balance) - parseFloat(paymentAmount)) <= 0 && (
                  <div className="form-group">
                    <label>Redemption Fee - Optional (repairs, processing, etc.) ($)</label>
                    <input
                      type="number"
                      placeholder="0.00"
                      value={redemptionFee}
                      onChange={(e) => setRedemptionFee(e.target.value)}
                      min="0"
                      step="0.01"
                    />
                    <small style={{ color: '#666', marginTop: '5px', display: 'block' }}>
                      This fee will be charged when the item is redeemed (one-time fee)
                    </small>
                  </div>
                )}

                <button type="submit" className="btn-success" style={{ width: '100%' }}>Process Payment</button>
              </form>
            </div>
          )}

          {/* Show if loan due date is extended */}
          {loanDueDateExtended && (
            <div className="alert alert-info" style={{ marginBottom: '20px' }}>
              ✓ Your loan due date has been extended by 30 days.
            </div>
          )}

          {/* Payment History */}
          {paymentHistory.length > 0 && (
            <div className="card">
              <div className="card-header">Payment History</div>
              <div style={{ marginTop: '15px' }}>
                {paymentHistory
                  .filter((p) => p !== undefined && p !== null)
                  .map((p) => (
                    <div key={p.id} style={{ padding: '12px 0', borderBottom: '1px solid #e0e6ed' }}>
                      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '15px' }}>
                        <p><strong>Amount:</strong> $ {p.payment_amount}</p>
                        <p><strong>Method:</strong> {p.payment_method}</p>
                        <p><strong>Date:</strong> {new Date(p.payment_date).toLocaleString()}</p>
                      </div>
                    </div>
                  ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default MakePaymentForm;
