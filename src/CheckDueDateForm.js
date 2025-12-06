import React, { useState } from 'react';
import { http } from './services/httpClient';
import { parseError, getErrorMessage } from './services/errorHandler';
import logger from './services/logger';

const CheckDueDateForm = () => {
  const [message, setMessage] = useState('');
  const [messageType, setMessageType] = useState(''); // 'success', 'info', or 'error'
  const [checkResults, setCheckResults] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  // Manually trigger the due date check
  const handleCheckDueDate = async () => {
    setIsLoading(true);
    try {
      const response = await http.post('/check-due-date');

      setMessage(response.message || 'Due dates checked successfully!');
      setMessageType('success');
      setCheckResults({
        timestamp: new Date().toLocaleString(),
        status: 'completed',
      });
      logger.info('Due date check completed successfully');
    } catch (error) {
      const parsedError = parseError(error);
      const userMessage = getErrorMessage(parsedError);
      setMessage(userMessage);
      setMessageType('error');
      logger.error('Error checking due dates', parsedError);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="form-container">
      <h3>Manual Due Date Check</h3>

      <div className="card" style={{ backgroundColor: '#e7f3ff', border: '2px solid #17a2b8', marginBottom: '20px' }}>
        <p style={{ margin: 0 }}>
          <strong>ℹ️ What This Does:</strong> Manually trigger the due date checking system to process all loans with passed due dates.
        </p>
        <ul style={{ marginTop: '12px', marginBottom: 0, paddingLeft: '20px' }}>
          <li>Finds all loans with due dates that have passed</li>
          <li>Checks if interest has been paid for each loan</li>
          <li>Extends due date by 30 days if interest is paid</li>
          <li>Marks loan as "overdue" if interest is not paid</li>
        </ul>
        <p style={{ marginTop: '12px', marginBottom: 0, fontSize: '12px', opacity: 0.8 }}>
          📅 Note: This check also runs automatically every day at midnight.
        </p>
      </div>

      {/* Message Area */}
      {message && (
        <div className={`alert alert-${messageType}`} style={{ marginBottom: '20px' }}>
          {message}
        </div>
      )}

      {/* Check Button */}
      <div style={{ marginBottom: '20px' }}>
        <button
          onClick={handleCheckDueDate}
          disabled={isLoading}
          className={isLoading ? 'btn-success' : 'btn-primary'}
          style={{ width: '100%' }}
        >
          {isLoading ? '⏳ Checking Due Dates...' : '✓ Check Due Dates Now'}
        </button>
      </div>

      {/* Results */}
      {checkResults && (
        <div className="card" style={{ backgroundColor: '#d4edda', borderLeft: '4px solid #28a745' }}>
          <div className="card-header">Check Completed Successfully</div>
          <div style={{ marginTop: '15px' }}>
            <p><strong>Last Check:</strong> {checkResults.timestamp}</p>
            <p><strong>Status:</strong> <span style={{ color: '#28a745', fontWeight: 'bold' }}>✓ Completed</span></p>
            <div style={{ marginTop: '15px', padding: '12px', backgroundColor: 'white', borderRadius: '8px' }}>
              <p style={{ margin: 0 }}>✓ All loans with passed due dates have been processed.</p>
            </div>
          </div>
        </div>
      )}

      {/* Information Box */}
      <div className="card" style={{ marginTop: '30px', backgroundColor: '#fffbea', borderLeft: '4px solid #ffc107' }}>
        <div className="card-header" style={{ borderBottomColor: '#ffc107' }}>How It Works</div>
        <div style={{ marginTop: '15px' }}>
          <ol style={{ lineHeight: '2', margin: 0 }}>
            <li><strong>Due Date Passes:</strong> When a loan's due date is reached or passed</li>
            <li><strong>Check Payment:</strong> System checks if interest amount has been paid</li>
            <li><strong>If Interest Paid:</strong> Due date is automatically extended by 30 days</li>
            <li><strong>If Interest NOT Paid:</strong> Loan status is changed to "overdue"</li>
          </ol>

          <div style={{ marginTop: '20px', padding: '15px', backgroundColor: 'white', borderRadius: '8px' }}>
            <p style={{ margin: 0 }}><strong>📅 Automatic Scheduling:</strong></p>
            <p style={{ margin: '8px 0 0 0', fontSize: '14px' }}>
              This check runs automatically every day at <strong>midnight (00:00)</strong>. You can use the button above to manually trigger it at any time.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CheckDueDateForm;
