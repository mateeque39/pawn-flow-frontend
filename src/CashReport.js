import React, { useState, useEffect } from 'react';
import { http } from './services/httpClient';
import { parseError, getErrorMessage } from './services/errorHandler';
import logger from './services/logger';
import { jsPDF } from 'jspdf';
import DetailedLoansBreakdown from './DetailedLoansBreakdown';

const CashReport = ({ loggedInUser }) => {
  const [reportData, setReportData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [messageType, setMessageType] = useState('');
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  
  // Revenue report state
  const [revenueData, setRevenueData] = useState(null);
  const [revenueLoading, setRevenueLoading] = useState(false);
  const [revenueMessage, setRevenueMessage] = useState('');
  const [revenueMessageType, setRevenueMessageType] = useState('');
  const [revenueDateRange, setRevenueDateRange] = useState('7');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');

  // Loan portfolio analytics state (not currently used)
  // const [portfolioData, setPortfolioData] = useState(null);
  // const [portfolioLoading, setPortfolioLoading] = useState(false);
  // const [portfolioMessage, setPortfolioMessage] = useState('');
  // const [portfolioMessageType, setPortfolioMessageType] = useState('');
  // const [portfolioDays, setPortfolioDays] = useState('7');
  // const [portfolioStartDate, setPortfolioStartDate] = useState('');
  // const [portfolioEndDate, setPortfolioEndDate] = useState('')

  // Balancing report state
  const [balancingData, setBalancingData] = useState(null);
  const [balancingLoading, setBalancingLoading] = useState(false);
  const [balancingMessage, setBalancingMessage] = useState('');
  const [balancingMessageType, setBalancingMessageType] = useState('');
  const [balancingStartDate, setBalancingStartDate] = useState('');
  const [balancingEndDate, setBalancingEndDate] = useState('');

  // Today's loans breakdown state
  const [todaysLoansData, setTodaysLoansData] = useState(null);
  const [todaysLoansLoading, setTodaysLoansLoading] = useState(false);
  const [todaysLoansMessage, setTodaysLoansMessage] = useState('');
  const [todaysLoansMessageType, setTodaysLoansMessageType] = useState('');
  const [showTodaysLoansDetails, setShowTodaysLoansDetails] = useState(false);
  const [loansDateRange, setLoansDateRange] = useState('today');
  const [loansStartDate, setLoansStartDate] = useState('');
  const [loansEndDate, setLoansEndDate] = useState('');

  // Active loans report state
  const [activeLoansData, setActiveLoansData] = useState(null);
  const [activeLoansLoading, setActiveLoansLoading] = useState(false);
  const [activeLoansMessage, setActiveLoansMessage] = useState('');
  const [activeLoansMessageType, setActiveLoansMessageType] = useState('');
  const [showActiveLoansDetails, setShowActiveLoansDetails] = useState(false);

  // Overdue loans report state
  const [overdueLoansData, setOverdueLoansData] = useState(null);
  const [overdueLoansLoading, setOverdueLoansLoading] = useState(false);
  const [overdueLoansMessage, setOverdueLoansMessage] = useState('');
  const [overdueLoansMessageType, setOverdueLoansMessageType] = useState('');
  const [showOverdueLoansDetails, setShowOverdueLoansDetails] = useState(false);

  // Detailed loans breakdown state
  const [showDetailedBreakdown, setShowDetailedBreakdown] = useState(false);

  // Fetch cash report for selected date
  const handleFetchReport = async () => {
    setLoading(true);
    try {
      const response = await http.get('/cash-report', {
        params: { date: selectedDate, _ts: Date.now() }
      });

      const data = response?.data || response;
      setReportData(data);
      setMessage('');
      setMessageType('');
      logger.info('Cash report fetched', { date: selectedDate });
    } catch (error) {
      const parsedError = error.parsedError || parseError(error);
      
      // Special handling for 404 - endpoint not implemented yet
      if (parsedError.status === 404) {
        setMessage(
          '⚠️ Cash Report endpoint not yet implemented on backend. ' +
          'Please create a GET /cash-report endpoint that accepts a "date" parameter (YYYY-MM-DD format) ' +
          'and returns the report data structure.'
        );
        setMessageType('warning');
      } else {
        const userMessage = error.userMessage || getErrorMessage(parsedError);
        setMessage(userMessage);
        setMessageType('error');
      }
      
      setReportData(null);
      logger.error('Error fetching cash report', parsedError);
    } finally {
      setLoading(false);
    }
  };

  // Auto-fetch on date change
  useEffect(() => {
    handleFetchReport();
    handleFetchTodaysLoans();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Handle revenue report fetch
  const handleFetchRevenueReport = async () => {
    setRevenueLoading(true);
    try {
      let start, end;
      
      if (revenueDateRange === 'custom') {
        if (!startDate || !endDate) {
          setRevenueMessage('Please select both start and end dates');
          setRevenueMessageType('error');
          setRevenueLoading(false);
          return;
        }
        start = startDate;
        end = endDate;
      } else {
        const days = parseInt(revenueDateRange, 10);
        end = new Date().toISOString().split('T')[0];
        const startDateObj = new Date();
        startDateObj.setDate(startDateObj.getDate() - days);
        start = startDateObj.toISOString().split('T')[0];
      }

      const response = await http.get('/revenue-report', {
        params: { startDate: start, endDate: end, _ts: Date.now() }
      });

      const data = response?.data || response;
      setRevenueData({
        ...data,
        startDate: start,
        endDate: end
      });
      setRevenueMessage('');
      setRevenueMessageType('');
      logger.info('Revenue report fetched', { startDate: start, endDate: end });
    } catch (error) {
      const parsedError = error.parsedError || parseError(error);
      
      if (parsedError.status === 404) {
        setRevenueMessage(
          '⚠️ Revenue Report endpoint not yet implemented on backend. ' +
          'Please create a GET /revenue-report endpoint that accepts "startDate" and "endDate" parameters.'
        );
        setRevenueMessageType('warning');
      } else {
        const userMessage = error.userMessage || getErrorMessage(parsedError);
        setRevenueMessage(userMessage);
        setRevenueMessageType('error');
      }
      
      setRevenueData(null);
      logger.error('Error fetching revenue report', parsedError);
    } finally {
      setRevenueLoading(false);
    }
  };

  // Handle loan portfolio analytics fetch (not currently used)
  /* const handleFetchPortfolioReport = async () => {
    setPortfolioLoading(true);
    try {
      let start, end;
      
      if (portfolioDays === 'custom') {
        if (!portfolioStartDate || !portfolioEndDate) {
          setPortfolioMessage('Please select both start and end dates');
          setPortfolioMessageType('error');
          setPortfolioLoading(false);
          return;
        }
        start = portfolioStartDate;
        end = portfolioEndDate;
      } else {
        const days = parseInt(portfolioDays, 10);
        end = new Date().toISOString().split('T')[0];
        const startDateObj = new Date();
        startDateObj.setDate(startDateObj.getDate() - days);
        start = startDateObj.toISOString().split('T')[0];
      }

      const response = await http.get('/loan-portfolio-report', {
        params: { startDate: start, endDate: end, _ts: Date.now() }
      });

      const data = response?.data || response;
      setPortfolioData({
        ...data,
        startDate: start,
        endDate: end
      });
      setPortfolioMessage('');
      setPortfolioMessageType('');
      logger.info('Loan portfolio report fetched', { startDate: start, endDate: end });
    } catch (error) {
      const parsedError = error.parsedError || parseError(error);
      
      if (parsedError.status === 404) {
        setPortfolioMessage(
          '⚠️ Loan Portfolio Report endpoint not yet implemented on backend. ' +
          'Please create a GET /loan-portfolio-report endpoint.'
        );
        setPortfolioMessageType('warning');
      } else {
        const userMessage = error.userMessage || getErrorMessage(parsedError);
        setPortfolioMessage(userMessage);
        setPortfolioMessageType('error');
      }
      
      setPortfolioData(null);
      logger.error('Error fetching loan portfolio report', parsedError);
    } finally {
      setPortfolioLoading(false);
    }
  }; */

  // Handle balancing report fetch
  const handleFetchBalancingReport = async () => {
    setBalancingLoading(true);
    try {
      if (!balancingStartDate || !balancingEndDate) {
        setBalancingMessage('Please select both start and end dates');
        setBalancingMessageType('error');
        setBalancingLoading(false);
        return;
      }

      const response = await http.get('/balancing-report', {
        params: { startDate: balancingStartDate, endDate: balancingEndDate, _ts: Date.now() }
      });

      const data = response?.data || response;
      setBalancingData({
        ...data,
        startDate: balancingStartDate,
        endDate: balancingEndDate
      });
      setBalancingMessage('');
      setBalancingMessageType('');
      logger.info('Balancing report fetched', { startDate: balancingStartDate, endDate: balancingEndDate });
    } catch (error) {
      const parsedError = error.parsedError || parseError(error);
      
      if (parsedError.status === 404) {
        setBalancingMessage(
          '⚠️ Balancing Report endpoint not yet implemented on backend. ' +
          'Please create a GET /balancing-report endpoint that accepts "startDate" and "endDate" parameters.'
        );
        setBalancingMessageType('warning');
      } else {
        const userMessage = error.userMessage || getErrorMessage(parsedError);
        setBalancingMessage(userMessage);
        setBalancingMessageType('error');
      }
      
      setBalancingData(null);
      logger.error('Error fetching balancing report', parsedError);
    } finally {
      setBalancingLoading(false);
    }
  };

  // Handle today's loans breakdown fetch
  const handleFetchTodaysLoans = async () => {
    setTodaysLoansLoading(true);
    try {
      let params = { _ts: Date.now() };

      // Add date range parameters if custom range is selected
      if (loansDateRange === 'custom') {
        if (!loansStartDate || !loansEndDate) {
          setTodaysLoansMessage('Please select both start and end dates');
          setTodaysLoansMessageType('error');
          setTodaysLoansLoading(false);
          return;
        }
        params.startDate = loansStartDate;
        params.endDate = loansEndDate;
      }

      const response = await http.get('/reports/todays-loans-breakdown', { params });

      const data = response?.data || response;
      setTodaysLoansData(data);
      setTodaysLoansMessage('');
      setTodaysLoansMessageType('');
      logger.info('Loans breakdown fetched', { count: data.count, startDate: data.startDate, endDate: data.endDate });
    } catch (error) {
      const parsedError = error.parsedError || parseError(error);
      
      if (parsedError.status === 404) {
        setTodaysLoansMessage(
          '⚠️ Loans endpoint not yet implemented on backend.'
        );
        setTodaysLoansMessageType('warning');
      } else {
        const userMessage = error.userMessage || getErrorMessage(parsedError);
        setTodaysLoansMessage(userMessage);
        setTodaysLoansMessageType('error');
      }
      
      setTodaysLoansData(null);
      logger.error('Error fetching loans breakdown', parsedError);
    } finally {
      setTodaysLoansLoading(false);
    }
  };

  const handleFetchActiveLoans = async () => {
    setActiveLoansLoading(true);
    try {
      const response = await http.get('/reports/active-loans', {
        params: { _ts: Date.now() }
      });

      const data = response?.data || response;
      setActiveLoansData(data);
      setActiveLoansMessage('');
      setActiveLoansMessageType('');
      logger.info('Active loans fetched', { count: data.count });
    } catch (error) {
      const parsedError = error.parsedError || parseError(error);
      
      if (parsedError.status === 404) {
        setActiveLoansMessage('⚠️ Active loans endpoint not found.');
        setActiveLoansMessageType('warning');
      } else {
        const userMessage = error.userMessage || getErrorMessage(parsedError);
        setActiveLoansMessage(userMessage);
        setActiveLoansMessageType('error');
      }
      
      setActiveLoansData(null);
      logger.error('Error fetching active loans', parsedError);
    } finally {
      setActiveLoansLoading(false);
    }
  };

  const handleFetchOverdueLoans = async () => {
    setOverdueLoansLoading(true);
    try {
      const response = await http.get('/reports/overdue-loans', { params: { _ts: Date.now() } });

      const data = response?.data || response;
      setOverdueLoansData(data);
      setOverdueLoansMessage('');
      setOverdueLoansMessageType('');
      logger.info('Overdue loans fetched', { count: data.count });
    } catch (error) {
      const parsedError = error.parsedError || parseError(error);
      
      if (parsedError.status === 404) {
        setOverdueLoansMessage('⚠️ Overdue loans endpoint not found.');
        setOverdueLoansMessageType('warning');
      } else {
        const userMessage = error.userMessage || getErrorMessage(parsedError);
        setOverdueLoansMessage(userMessage);
        setOverdueLoansMessageType('error');
      }
      
      setOverdueLoansData(null);
      logger.error('Error fetching overdue loans', parsedError);
    } finally {
      setOverdueLoansLoading(false);
    }
  };

  const generatePDF = () => {
    if (!reportData) return;

    const doc = new jsPDF();
    const pageWidth = doc.internal.pageSize.getWidth();
    // const pageHeight = doc.internal.pageSize.getHeight(); // Not used
    let yPosition = 15;

    // Title
    doc.setFontSize(16);
    doc.text('CASH REPORT', pageWidth / 2, yPosition, { align: 'center' });
    yPosition += 10;

    // Date
    doc.setFontSize(10);
    doc.text(`Date: ${selectedDate}`, 15, yPosition);
    yPosition += 8;

    // Pawn Activity Section
    doc.setFontSize(12);
    doc.text('PAWN ACTIVITY', 15, yPosition);
    yPosition += 7;

    doc.setFontSize(9);
    const pawnActivity = reportData.pawnActivity || {};
    const pawnRows = [
      ['New Loans', pawnActivity.newLoans?.qty || 0, '$' + (pawnActivity.newLoans?.amount || 0).toFixed(2)],
      ['Buyouts', pawnActivity.buyouts?.qty || 0, '$' + (pawnActivity.buyouts?.amount || 0).toFixed(2)],
      ['In-Store Total', pawnActivity.inStoreTotal?.qty || 0, '$' + (pawnActivity.inStoreTotal?.amount || 0).toFixed(2)]
    ];

    pawnRows.forEach(row => {
      doc.text(row[0], 20, yPosition);
      doc.text(row[1].toString(), 100, yPosition);
      doc.text(row[2], 150, yPosition);
      yPosition += 6;
    });

    yPosition += 5;

    // In Store Transactions Section
    doc.setFontSize(12);
    doc.text('IN STORE TRANSACTIONS', 15, yPosition);
    yPosition += 7;

    doc.setFontSize(9);
    const inStoreTxns = reportData.inStoreTxns || {};
    const txnRows = [
      ['Renewals', inStoreTxns.renewals?.qty || 0, '$' + (inStoreTxns.renewals?.principal || 0).toFixed(2)],
      ['Partial Payments', inStoreTxns.partialPayments?.qty || 0, '$' + (inStoreTxns.partialPayments?.amount || 0).toFixed(2)],
      ['Extensions', inStoreTxns.extensions?.qty || 0, '$' + (inStoreTxns.extensions?.amount || 0).toFixed(2)],
      ['Redemptions', inStoreTxns.redemptions?.qty || 0, '$' + (inStoreTxns.redemptions?.amount || 0).toFixed(2)],
      ['In-Store Subtotal', inStoreTxns.subtotal?.qty || 0, '$' + (inStoreTxns.subtotal?.amount || 0).toFixed(2)]
    ];

    txnRows.forEach(row => {
      doc.text(row[0], 20, yPosition);
      doc.text(row[1].toString(), 100, yPosition);
      doc.text(row[2], 150, yPosition);
      yPosition += 6;
    });

    yPosition += 5;

    // Open Store Section
    doc.setFontSize(12);
    doc.text('OPEN STORE', 15, yPosition);
    yPosition += 7;

    doc.setFontSize(9);
    const openStore = reportData.openStore || {};
    const storeRows = [
      ['ONLINE', '$' + (openStore.online?.expected || 0).toFixed(2), '$' + (openStore.online?.actual || 0).toFixed(2)],
      ['TILL 01', '$' + (openStore.till01?.expected || 0).toFixed(2), '$' + (openStore.till01?.actual || 0).toFixed(2)],
      ['TILL 02', '$' + (openStore.till02?.expected || 0).toFixed(2), '$' + (openStore.till02?.actual || 0).toFixed(2)],
      ['Store Sale', '$' + (openStore.storeSale?.expected || 0).toFixed(2), '$' + (openStore.storeSale?.actual || 0).toFixed(2)]
    ];

    storeRows.forEach(row => {
      doc.text(row[0], 20, yPosition);
      doc.text(row[1], 100, yPosition);
      doc.text(row[2], 150, yPosition);
      yPosition += 6;
    });

    // Totals
    yPosition += 5;
    doc.setFontSize(11);
    doc.text(`Today's Opening Total: $${(reportData.todayOpeningTotal || 0).toFixed(2)}`, 15, yPosition);
    yPosition += 8;
    doc.text(`Today's Closing Total: $${(reportData.todayClosingTotal || 0).toFixed(2)}`, 15, yPosition);

    // Save PDF
    doc.save(`cash-report-${selectedDate}.pdf`);
    logger.info('Cash report PDF generated', { date: selectedDate });
  };

  return (
    <div className="form-container">
      <h3>Cash Report</h3>

      {/* Date Picker */}
      <div style={{ marginBottom: '20px' }}>
        <div className="form-group">
          <label>Select Date</label>
          <div style={{ display: 'flex', gap: '10px' }}>
            <input
              type="date"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              style={{ flex: 1 }}
            />
            <button onClick={handleFetchReport} className="btn-primary" disabled={loading}>
              {loading ? 'Loading...' : 'Generate Report'}
            </button>
            {reportData && (
              <button onClick={generatePDF} className="btn-success">
                📥 Export PDF
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Message Area */}
      {message && (
        <div className={`alert alert-${messageType}`} style={{ marginBottom: '20px' }}>
          {message}
        </div>
      )}

      {/* Report Display */}
      {reportData && (
        <div>
          {/* Pawn Activity Section */}
          <div className="card" style={{ marginBottom: '20px' }}>
            <div className="card-header">Pawn Activity</div>
            <table style={{ width: '100%', marginTop: '15px', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ borderBottom: '2px solid #667eea' }}>
                  <th style={{ textAlign: 'left', padding: '10px' }}>Activity Type</th>
                  <th style={{ textAlign: 'center', padding: '10px' }}>Qty</th>
                  <th style={{ textAlign: 'right', padding: '10px' }}>Amount</th>
                </tr>
              </thead>
              <tbody>
                <tr style={{ borderBottom: '1px solid #e0e6ed' }}>
                  <td style={{ padding: '10px' }}>New Loans</td>
                  <td style={{ textAlign: 'center', padding: '10px' }}>{reportData.pawnActivity?.newLoans?.qty || 0}</td>
                  <td style={{ textAlign: 'right', padding: '10px' }}>${(reportData.pawnActivity?.newLoans?.amount || 0).toFixed(2)}</td>
                </tr>
                <tr style={{ borderBottom: '1px solid #e0e6ed' }}>
                  <td style={{ padding: '10px' }}>Buys</td>
                  <td style={{ textAlign: 'center', padding: '10px' }}>{reportData.pawnActivity?.buys?.qty || 0}</td>
                  <td style={{ textAlign: 'right', padding: '10px' }}>${(reportData.pawnActivity?.buys?.amount || 0).toFixed(2)}</td>
                </tr>
                <tr style={{ borderBottom: '1px solid #e0e6ed' }}>
                  <td style={{ padding: '10px' }}>Buyouts</td>
                  <td style={{ textAlign: 'center', padding: '10px' }}>{reportData.pawnActivity?.buyouts?.qty || 0}</td>
                  <td style={{ textAlign: 'right', padding: '10px' }}>${(reportData.pawnActivity?.buyouts?.amount || 0).toFixed(2)}</td>
                </tr>
                <tr style={{ backgroundColor: '#f8f9fa', fontWeight: 'bold', borderBottom: '2px solid #667eea' }}>
                  <td style={{ padding: '10px' }}>In-Store Total</td>
                  <td style={{ textAlign: 'center', padding: '10px' }}>{reportData.pawnActivity?.inStoreTotal?.qty || 0}</td>
                  <td style={{ textAlign: 'right', padding: '10px' }}>${(reportData.pawnActivity?.inStoreTotal?.amount || 0).toFixed(2)}</td>
                </tr>
              </tbody>
            </table>
          </div>

          {/* In Store Transactions Section */}
          <div className="card" style={{ marginBottom: '20px' }}>
            <div className="card-header">In Store Transactions</div>
            <table style={{ width: '100%', marginTop: '15px', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ borderBottom: '2px solid #667eea' }}>
                  <th style={{ textAlign: 'left', padding: '10px' }}>Transaction Type</th>
                  <th style={{ textAlign: 'center', padding: '10px' }}>Qty</th>
                  <th style={{ textAlign: 'right', padding: '10px' }}>Principal</th>
                  <th style={{ textAlign: 'right', padding: '10px' }}>Interest</th>
                  <th style={{ textAlign: 'right', padding: '10px' }}>Fees</th>
                  <th style={{ textAlign: 'right', padding: '10px' }}>Total</th>
                </tr>
              </thead>
              <tbody>
                <tr style={{ borderBottom: '1px solid #e0e6ed' }}>
                  <td style={{ padding: '10px' }}>Renewals</td>
                  <td style={{ textAlign: 'center', padding: '10px' }}>{reportData.inStoreTxns?.renewals?.qty || 0}</td>
                  <td style={{ textAlign: 'right', padding: '10px' }}>${(reportData.inStoreTxns?.renewals?.principal || 0).toFixed(2)}</td>
                  <td style={{ textAlign: 'right', padding: '10px' }}>${(reportData.inStoreTxns?.renewals?.interest || 0).toFixed(2)}</td>
                  <td style={{ textAlign: 'right', padding: '10px' }}>${(reportData.inStoreTxns?.renewals?.fees || 0).toFixed(2)}</td>
                  <td style={{ textAlign: 'right', padding: '10px' }}>${(reportData.inStoreTxns?.renewals?.total || 0).toFixed(2)}</td>
                </tr>
                <tr style={{ borderBottom: '1px solid #e0e6ed' }}>
                  <td style={{ padding: '10px' }}>Partial Payments</td>
                  <td style={{ textAlign: 'center', padding: '10px' }}>{reportData.inStoreTxns?.partialPayments?.qty || 0}</td>
                  <td style={{ textAlign: 'right', padding: '10px' }}>${(reportData.inStoreTxns?.partialPayments?.principal || 0).toFixed(2)}</td>
                  <td style={{ textAlign: 'right', padding: '10px' }}>${(reportData.inStoreTxns?.partialPayments?.interest || 0).toFixed(2)}</td>
                  <td style={{ textAlign: 'right', padding: '10px' }}>${(reportData.inStoreTxns?.partialPayments?.fees || 0).toFixed(2)}</td>
                  <td style={{ textAlign: 'right', padding: '10px' }}>${(reportData.inStoreTxns?.partialPayments?.total || 0).toFixed(2)}</td>
                </tr>
                <tr style={{ borderBottom: '1px solid #e0e6ed' }}>
                  <td style={{ padding: '10px' }}>Extensions</td>
                  <td style={{ textAlign: 'center', padding: '10px' }}>{reportData.inStoreTxns?.extensions?.qty || 0}</td>
                  <td style={{ textAlign: 'right', padding: '10px' }}>${(reportData.inStoreTxns?.extensions?.principal || 0).toFixed(2)}</td>
                  <td style={{ textAlign: 'right', padding: '10px' }}>${(reportData.inStoreTxns?.extensions?.interest || 0).toFixed(2)}</td>
                  <td style={{ textAlign: 'right', padding: '10px' }}>${(reportData.inStoreTxns?.extensions?.fees || 0).toFixed(2)}</td>
                  <td style={{ textAlign: 'right', padding: '10px' }}>${(reportData.inStoreTxns?.extensions?.total || 0).toFixed(2)}</td>
                </tr>
                <tr style={{ borderBottom: '1px solid #e0e6ed' }}>
                  <td style={{ padding: '10px' }}>Redemptions</td>
                  <td style={{ textAlign: 'center', padding: '10px' }}>{reportData.inStoreTxns?.redemptions?.qty || 0}</td>
                  <td style={{ textAlign: 'right', padding: '10px' }}>${(reportData.inStoreTxns?.redemptions?.principal || 0).toFixed(2)}</td>
                  <td style={{ textAlign: 'right', padding: '10px' }}>${(reportData.inStoreTxns?.redemptions?.interest || 0).toFixed(2)}</td>
                  <td style={{ textAlign: 'right', padding: '10px' }}>${(reportData.inStoreTxns?.redemptions?.fees || 0).toFixed(2)}</td>
                  <td style={{ textAlign: 'right', padding: '10px' }}>${(reportData.inStoreTxns?.redemptions?.total || 0).toFixed(2)}</td>
                </tr>
                <tr style={{ backgroundColor: '#f8f9fa', fontWeight: 'bold', borderBottom: '2px solid #667eea' }}>
                  <td style={{ padding: '10px' }}>In-Store Subtotal</td>
                  <td style={{ textAlign: 'center', padding: '10px' }}>{reportData.inStoreTxns?.subtotal?.qty || 0}</td>
                  <td style={{ textAlign: 'right', padding: '10px' }}>${(reportData.inStoreTxns?.subtotal?.principal || 0).toFixed(2)}</td>
                  <td style={{ textAlign: 'right', padding: '10px' }}>${(reportData.inStoreTxns?.subtotal?.interest || 0).toFixed(2)}</td>
                  <td style={{ textAlign: 'right', padding: '10px' }}>${(reportData.inStoreTxns?.subtotal?.fees || 0).toFixed(2)}</td>
                  <td style={{ textAlign: 'right', padding: '10px' }}>${(reportData.inStoreTxns?.subtotal?.total || 0).toFixed(2)}</td>
                </tr>
              </tbody>
            </table>
          </div>

          {/* Open Store Section */}
          <div className="card" style={{ marginBottom: '20px' }}>
            <div className="card-header">Open Store</div>
            <table style={{ width: '100%', marginTop: '15px', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ borderBottom: '2px solid #667eea' }}>
                  <th style={{ textAlign: 'left', padding: '10px' }}>Store Location</th>
                  <th style={{ textAlign: 'right', padding: '10px' }}>Expected</th>
                  <th style={{ textAlign: 'right', padding: '10px' }}>Actual</th>
                  <th style={{ textAlign: 'right', padding: '10px' }}>Over/Short</th>
                </tr>
              </thead>
              <tbody>
                <tr style={{ borderBottom: '1px solid #e0e6ed' }}>
                  <td style={{ padding: '10px' }}>ONLINE</td>
                  <td style={{ textAlign: 'right', padding: '10px' }}>${(reportData.openStore?.online?.expected || 0).toFixed(2)}</td>
                  <td style={{ textAlign: 'right', padding: '10px' }}>${(reportData.openStore?.online?.actual || 0).toFixed(2)}</td>
                  <td style={{ textAlign: 'right', padding: '10px', color: (reportData.openStore?.online?.difference || 0) >= 0 ? 'green' : 'red' }}>
                    ${(reportData.openStore?.online?.difference || 0).toFixed(2)}
                  </td>
                </tr>
                <tr style={{ borderBottom: '1px solid #e0e6ed' }}>
                  <td style={{ padding: '10px' }}>TILL 01</td>
                  <td style={{ textAlign: 'right', padding: '10px' }}>${(reportData.openStore?.till01?.expected || 0).toFixed(2)}</td>
                  <td style={{ textAlign: 'right', padding: '10px' }}>${(reportData.openStore?.till01?.actual || 0).toFixed(2)}</td>
                  <td style={{ textAlign: 'right', padding: '10px', color: (reportData.openStore?.till01?.difference || 0) >= 0 ? 'green' : 'red' }}>
                    ${(reportData.openStore?.till01?.difference || 0).toFixed(2)}
                  </td>
                </tr>
                <tr style={{ borderBottom: '1px solid #e0e6ed' }}>
                  <td style={{ padding: '10px' }}>TILL 02</td>
                  <td style={{ textAlign: 'right', padding: '10px' }}>${(reportData.openStore?.till02?.expected || 0).toFixed(2)}</td>
                  <td style={{ textAlign: 'right', padding: '10px' }}>${(reportData.openStore?.till02?.actual || 0).toFixed(2)}</td>
                  <td style={{ textAlign: 'right', padding: '10px', color: (reportData.openStore?.till02?.difference || 0) >= 0 ? 'green' : 'red' }}>
                    ${(reportData.openStore?.till02?.difference || 0).toFixed(2)}
                  </td>
                </tr>
                <tr style={{ backgroundColor: '#f8f9fa', fontWeight: 'bold', borderBottom: '2px solid #667eea' }}>
                  <td style={{ padding: '10px' }}>Store Sale</td>
                  <td style={{ textAlign: 'right', padding: '10px' }}>${(reportData.openStore?.storeSale?.expected || 0).toFixed(2)}</td>
                  <td style={{ textAlign: 'right', padding: '10px' }}>${(reportData.openStore?.storeSale?.actual || 0).toFixed(2)}</td>
                  <td style={{ textAlign: 'right', padding: '10px', color: (reportData.openStore?.storeSale?.difference || 0) >= 0 ? 'green' : 'red' }}>
                    ${(reportData.openStore?.storeSale?.difference || 0).toFixed(2)}
                  </td>
                </tr>
              </tbody>
            </table>
          </div>

          {/* Totals Section */}
          <div className="card" style={{ marginBottom: '20px' }}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', padding: '20px' }}>
              <div style={{ backgroundColor: '#e8f4f8', padding: '15px', borderRadius: '8px', borderLeft: '4px solid #5dd9ff' }}>
                <p style={{ margin: '0 0 10px 0', color: '#222', fontWeight: '600' }}>
                  <strong>Today's Opening Total:</strong>
                </p>
                <p style={{ margin: 0, fontSize: '18px', fontWeight: 'bold', color: '#5dd9ff' }}>
                  ${(reportData.todayOpeningTotal || 0).toFixed(2)}
                </p>
              </div>
              <div style={{ backgroundColor: '#d4edda', padding: '15px', borderRadius: '8px', borderLeft: '4px solid #28a745' }}>
                <p style={{ margin: '0 0 10px 0', color: '#222', fontWeight: '600' }}>
                  <strong>Today's Closing Total:</strong>
                </p>
                <p style={{ margin: 0, fontSize: '18px', fontWeight: 'bold', color: '#28a745' }}>
                  ${(reportData.todayClosingTotal || 0).toFixed(2)}
                </p>
              </div>
            </div>
          </div>

          {/* Loan Portfolio Section */}
          <div className="card">
            <div className="card-header">📊 Loan Portfolio Summary</div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '15px', padding: '20px' }}>
              <div style={{ backgroundColor: '#e8f4f8', padding: '15px', borderRadius: '8px', borderLeft: '4px solid #5dd9ff' }}>
                <p style={{ margin: '0 0 5px 0', color: '#666', fontSize: '13px' }}>
                  💼 Active Loan Base
                </p>
                <p style={{ margin: 0, fontSize: '20px', fontWeight: 'bold', color: '#5dd9ff' }}>
                  {reportData.activeLoanCount || 0}
                </p>
                <p style={{ margin: '5px 0 0 0', color: '#666', fontSize: '12px' }}>
                  loans outstanding
                </p>
              </div>

              <div style={{ backgroundColor: '#f8d7da', padding: '15px', borderRadius: '8px', borderLeft: '4px solid #dc3545' }}>
                <p style={{ margin: '0 0 5px 0', color: '#666', fontSize: '13px' }}>
                  ⚠️ Overdue Loans Balance
                </p>
                <p style={{ margin: 0, fontSize: '20px', fontWeight: 'bold', color: '#dc3545' }}>
                  ${(reportData.overdueLoanBalance || 0).toFixed(2)}
                </p>
                <p style={{ margin: '5px 0 0 0', color: '#666', fontSize: '12px' }}>
                  amount past due
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {!reportData && !loading && !message && (
        <div className="alert alert-info">
          Select a date and click "Generate Report" to view the cash report.
        </div>
      )}

      {/* ===== TODAY'S LOANS SECTION ===== */}
      <hr style={{ margin: '40px 0', borderColor: '#e0e6ed' }} />
      
      <h3 style={{ marginTop: '40px' }}>📋 Loans Breakdown by Date</h3>

      <div style={{ marginBottom: '20px' }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '15px', marginBottom: '15px' }}>
          <div className="form-group">
            <label>Select Period</label>
            <select
              value={loansDateRange}
              onChange={(e) => setLoansDateRange(e.target.value)}
              style={{ width: '100%' }}
            >
              <option value="today">Today Only</option>
              <option value="custom">Custom Range</option>
            </select>
          </div>
        </div>

        {loansDateRange === 'custom' && (
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '15px', marginBottom: '15px' }}>
            <div className="form-group">
              <label>Start Date</label>
              <input
                type="date"
                value={loansStartDate}
                onChange={(e) => setLoansStartDate(e.target.value)}
                style={{ width: '100%' }}
              />
            </div>
            <div className="form-group">
              <label>End Date</label>
              <input
                type="date"
                value={loansEndDate}
                onChange={(e) => setLoansEndDate(e.target.value)}
                style={{ width: '100%' }}
              />
            </div>
          </div>
        )}

        <button 
          onClick={handleFetchTodaysLoans} 
          className="btn-primary" 
          disabled={todaysLoansLoading}
          style={{ width: '100%', marginBottom: '15px' }}
        >
          {todaysLoansLoading ? 'Loading...' : '🔄 Fetch Loans Breakdown'}
        </button>
      </div>

      {/* Today's Loans Message Area */}
      {todaysLoansMessage && (
        <div className={`alert alert-${todaysLoansMessageType}`} style={{ marginBottom: '20px' }}>
          {todaysLoansMessage}
        </div>
      )}

      {/* Today's Loans Summary Card */}
      {todaysLoansData && (
        <div>
          <div className="card" style={{ marginBottom: '20px', backgroundColor: '#f8f9fa' }}>
            <div style={{ padding: '20px' }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '20px', marginBottom: '15px' }}>
                <div style={{ backgroundColor: '#e3f2fd', padding: '20px', borderRadius: '8px', borderLeft: '4px solid #2196f3' }}>
                  <p style={{ margin: '0 0 10px 0', color: '#666', fontSize: '13px' }}>
                    📅 Date Range
                  </p>
                  <p style={{ margin: 0, fontSize: '14px', fontWeight: 'bold', color: '#2196f3' }}>
                    {todaysLoansData.startDate === todaysLoansData.endDate 
                      ? todaysLoansData.startDate 
                      : `${todaysLoansData.startDate} to ${todaysLoansData.endDate}`}
                  </p>
                </div>
                <div style={{ backgroundColor: '#e3f2fd', padding: '20px', borderRadius: '8px', borderLeft: '4px solid #2196f3' }}>
                  <p style={{ margin: '0 0 10px 0', color: '#666', fontSize: '13px' }}>
                    📊 Loans Created
                  </p>
                  <p style={{ margin: 0, fontSize: '32px', fontWeight: 'bold', color: '#2196f3' }}>
                    {todaysLoansData.count || 0}
                  </p>
                </div>
                <div style={{ backgroundColor: '#f3e5f5', padding: '20px', borderRadius: '8px', borderLeft: '4px solid #9c27b0' }}>
                  <p style={{ margin: '0 0 10px 0', color: '#666', fontSize: '13px' }}>
                    💰 Total Amount Loaned
                  </p>
                  <p style={{ margin: 0, fontSize: '32px', fontWeight: 'bold', color: '#9c27b0' }}>
                    ${todaysLoansData.loans?.reduce((sum, loan) => sum + loan.loan_amount, 0).toFixed(2) || '0.00'}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Toggle Details Button */}
          <div style={{ marginBottom: '20px' }}>
            <button
              onClick={() => setShowTodaysLoansDetails(!showTodaysLoansDetails)}
              className="btn-info"
              style={{ width: '100%', padding: '12px', fontSize: '16px', fontWeight: 'bold' }}
            >
              {showTodaysLoansDetails ? '▼ Hide Detailed Breakdown' : '▶ Show Detailed Breakdown'}
            </button>
          </div>

          {/* Detailed Loans Table */}
          {showTodaysLoansDetails && todaysLoansData.loans && todaysLoansData.loans.length > 0 && (
            <div className="card">
              <div className="card-header">Detailed Loan Breakdown</div>
              <div style={{ overflowX: 'auto' }}>
                <table style={{ width: '100%', marginTop: '15px', borderCollapse: 'collapse', minWidth: '900px' }}>
                  <thead>
                    <tr style={{ borderBottom: '2px solid #667eea', backgroundColor: '#f8f9fa' }}>
                      <th style={{ textAlign: 'left', padding: '12px', fontWeight: 'bold' }}>Customer Name</th>
                      <th style={{ textAlign: 'left', padding: '12px', fontWeight: 'bold' }}>Transaction #</th>
                      <th style={{ textAlign: 'left', padding: '12px', fontWeight: 'bold' }}>Collateral Description</th>
                      <th style={{ textAlign: 'right', padding: '12px', fontWeight: 'bold' }}>Amount Loaned</th>
                      <th style={{ textAlign: 'left', padding: '12px', fontWeight: 'bold' }}>Date Issued</th>
                      <th style={{ textAlign: 'left', padding: '12px', fontWeight: 'bold' }}>Due Date</th>
                      <th style={{ textAlign: 'left', padding: '12px', fontWeight: 'bold' }}>Phone Number</th>
                    </tr>
                  </thead>
                  <tbody>
                    {todaysLoansData.loans.map((loan, index) => (
                      <tr key={loan.id} style={{ borderBottom: '1px solid #e0e6ed', backgroundColor: index % 2 === 0 ? '#fff' : '#f9f9f9' }}>
                        <td style={{ padding: '12px', fontWeight: '500' }}>{loan.customer_name}</td>
                        <td style={{ padding: '12px', color: '#667eea', fontWeight: 'bold' }}>{loan.transaction_number}</td>
                        <td style={{ padding: '12px', maxWidth: '250px', wordWrap: 'break-word' }}>{loan.collateral_description}</td>
                        <td style={{ textAlign: 'right', padding: '12px', fontWeight: 'bold', color: '#28a745' }}>
                          ${loan.loan_amount.toFixed(2)}
                        </td>
                        <td style={{ padding: '12px', color: '#666', fontSize: '14px' }}>{loan.issued_date}</td>
                        <td style={{ padding: '12px', color: '#666', fontSize: '14px' }}>{loan.due_date || 'N/A'}</td>
                        <td style={{ padding: '12px', color: '#666' }}>{loan.phone_number}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <div style={{ padding: '15px', backgroundColor: '#f8f9fa', borderTop: '2px solid #e0e6ed', fontWeight: 'bold', textAlign: 'right' }}>
                <span>Total Loans: </span>
                <span style={{ color: '#2196f3', fontSize: '18px' }}>{todaysLoansData.count}</span>
                <span style={{ marginLeft: '40px' }}>Total Amount: </span>
                <span style={{ color: '#28a745', fontSize: '18px' }}>
                  ${todaysLoansData.loans?.reduce((sum, loan) => sum + loan.loan_amount, 0).toFixed(2) || '0.00'}
                </span>
              </div>
            </div>
          )}

          {showTodaysLoansDetails && (!todaysLoansData.loans || todaysLoansData.loans.length === 0) && (
            <div className="alert alert-info">
              No loans found for the selected period.
            </div>
          )}
        </div>
      )}

      {!todaysLoansData && !todaysLoansLoading && !todaysLoansMessage && (
        <div className="alert alert-info">
          Select a period and click "Fetch Loans Breakdown" to view loan activity.
        </div>
      )}

      {/* ===== ACTIVE LOANS REPORT SECTION ===== */}
      <hr style={{ margin: '40px 0', borderColor: '#e0e6ed' }} />
      
      <h3 style={{ marginTop: '40px' }}>Active Loans Report</h3>

      <button
        onClick={handleFetchActiveLoans}
        disabled={activeLoansLoading}
        style={{
          padding: '10px 20px',
          marginBottom: '20px',
          backgroundColor: '#007bff',
          color: 'white',
          border: 'none',
          borderRadius: '4px',
          cursor: activeLoansLoading ? 'not-allowed' : 'pointer'
        }}
      >
        {activeLoansLoading ? 'Loading...' : 'Fetch Active Loans'}
      </button>

      {activeLoansMessage && (
        <div className={`alert alert-${activeLoansMessageType}`}>
          {activeLoansMessage}
        </div>
      )}

      {activeLoansData && (
        <div>
          <div style={{ 
            display: 'grid', 
            gridTemplateColumns: 'repeat(2, 1fr)', 
            gap: '15px', 
            marginBottom: '20px' 
          }}>
            <div style={{ 
              backgroundColor: '#f8f9fa', 
              padding: '15px', 
              borderRadius: '4px',
              border: '1px solid #dee2e6'
            }}>
              <div style={{ fontSize: '12px', color: '#666', marginBottom: '5px' }}>Total Active Loans</div>
              <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#007bff' }}>
                {activeLoansData.count}
              </div>
            </div>

            <div style={{ 
              backgroundColor: '#f8f9fa', 
              padding: '15px', 
              borderRadius: '4px',
              border: '1px solid #dee2e6'
            }}>
              <div style={{ fontSize: '12px', color: '#666', marginBottom: '5px' }}>Total Amount Loaned</div>
              <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#28a745' }}>
                ${activeLoansData.loans.reduce((sum, loan) => sum + (parseFloat(loan.loan_amount) || 0), 0).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </div>
            </div>
          </div>

          <button
            onClick={() => setShowActiveLoansDetails(!showActiveLoansDetails)}
            style={{
              padding: '10px 15px',
              backgroundColor: '#f8f9fa',
              border: '1px solid #dee2e6',
              borderRadius: '4px',
              cursor: 'pointer',
              marginBottom: '15px',
              fontWeight: 'bold'
            }}
          >
            {showActiveLoansDetails ? '▼ Hide Detailed Breakdown' : '▶ Show Detailed Breakdown'}
          </button>

          {showActiveLoansDetails && activeLoansData.loans && activeLoansData.loans.length > 0 && (
            <div style={{ overflowX: 'auto' }}>
              <table style={{
                width: '100%',
                borderCollapse: 'collapse',
                marginBottom: '20px'
              }}>
                <thead>
                  <tr style={{ backgroundColor: '#f8f9fa', borderBottom: '2px solid #dee2e6' }}>
                    <th style={{ padding: '12px', textAlign: 'left', fontWeight: 'bold' }}>Customer Name</th>
                    <th style={{ padding: '12px', textAlign: 'left', fontWeight: 'bold' }}>Transaction #</th>
                    <th style={{ padding: '12px', textAlign: 'left', fontWeight: 'bold' }}>Collateral Description</th>
                    <th style={{ padding: '12px', textAlign: 'left', fontWeight: 'bold' }}>Amount Loaned</th>
                    <th style={{ padding: '12px', textAlign: 'left', fontWeight: 'bold' }}>Date Issued</th>
                    <th style={{ padding: '12px', textAlign: 'left', fontWeight: 'bold' }}>Due Date</th>
                    <th style={{ padding: '12px', textAlign: 'left', fontWeight: 'bold' }}>Phone Number</th>
                  </tr>
                </thead>
                <tbody>
                  {activeLoansData.loans.map((loan, index) => (
                    <tr 
                      key={loan.id || index} 
                      style={{ 
                        borderBottom: '1px solid #dee2e6',
                        backgroundColor: index % 2 === 0 ? '#fff' : '#f9f9f9'
                      }}
                    >
                      <td style={{ padding: '12px' }}>{loan.customer_name}</td>
                      <td style={{ padding: '12px' }}>{loan.transaction_number}</td>
                      <td style={{ padding: '12px' }}>{loan.collateral_description}</td>
                      <td style={{ padding: '12px' }}>${(parseFloat(loan.loan_amount) || 0).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</td>
                      <td style={{ padding: '12px' }}>{new Date(loan.issued_date).toLocaleDateString('en-US')}</td>
                      <td style={{ padding: '12px', color: '#666', fontSize: '14px' }}>{loan.due_date ? new Date(loan.due_date).toLocaleDateString('en-US') : 'N/A'}</td>
                      <td style={{ padding: '12px' }}>{loan.phone_number}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {showActiveLoansDetails && (!activeLoansData.loans || activeLoansData.loans.length === 0) && (
            <div className="alert alert-info">
              No active loans found.
            </div>
          )}
        </div>
      )}

      {!activeLoansData && !activeLoansLoading && !activeLoansMessage && (
        <div className="alert alert-info">
          Click "Fetch Active Loans" to view all currently active loans.
        </div>
      )}

      {/* ===== OVERDUE LOANS REPORT SECTION ===== */}
      <hr style={{ margin: '40px 0', borderColor: '#e0e6ed' }} />
      
      <h3 style={{ marginTop: '40px' }}>Overdue Loans Report</h3>

      <button
        onClick={handleFetchOverdueLoans}
        disabled={overdueLoansLoading}
        style={{
          padding: '10px 20px',
          marginBottom: '20px',
          backgroundColor: '#dc3545',
          color: 'white',
          border: 'none',
          borderRadius: '4px',
          cursor: overdueLoansLoading ? 'not-allowed' : 'pointer'
        }}
      >
        {overdueLoansLoading ? 'Loading...' : 'Fetch Overdue Loans'}
      </button>

      {overdueLoansMessage && (
        <div className={`alert alert-${overdueLoansMessageType}`}>
          {overdueLoansMessage}
        </div>
      )}

      {overdueLoansData && (
        <div>
          <div style={{ 
            display: 'grid', 
            gridTemplateColumns: 'repeat(2, 1fr)', 
            gap: '15px', 
            marginBottom: '20px' 
          }}>
            <div style={{ 
              backgroundColor: '#f8f9fa', 
              padding: '15px', 
              borderRadius: '4px',
              border: '1px solid #dee2e6'
            }}>
              <div style={{ fontSize: '12px', color: '#666', marginBottom: '5px' }}>Total Overdue Loans</div>
              <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#dc3545' }}>
                {overdueLoansData.count}
              </div>
            </div>

            <div style={{ 
              backgroundColor: '#f8f9fa', 
              padding: '15px', 
              borderRadius: '4px',
              border: '1px solid #dee2e6'
            }}>
              <div style={{ fontSize: '12px', color: '#666', marginBottom: '5px' }}>Total Amount Overdue</div>
              <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#dc3545' }}>
                ${overdueLoansData.loans.reduce((sum, loan) => sum + (parseFloat(loan.loan_amount) || 0), 0).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </div>
            </div>
          </div>

          <button
            onClick={() => setShowOverdueLoansDetails(!showOverdueLoansDetails)}
            style={{
              padding: '10px 15px',
              backgroundColor: '#f8f9fa',
              border: '1px solid #dee2e6',
              borderRadius: '4px',
              cursor: 'pointer',
              marginBottom: '15px',
              fontWeight: 'bold'
            }}
          >
            {showOverdueLoansDetails ? '▼ Hide Detailed Breakdown' : '▶ Show Detailed Breakdown'}
          </button>

          {showOverdueLoansDetails && overdueLoansData.loans && overdueLoansData.loans.length > 0 && (
            <div style={{ overflowX: 'auto' }}>
              <table style={{
                width: '100%',
                borderCollapse: 'collapse',
                marginBottom: '20px'
              }}>
                <thead>
                  <tr style={{ backgroundColor: '#f8f9fa', borderBottom: '2px solid #dee2e6' }}>
                    <th style={{ padding: '12px', textAlign: 'left', fontWeight: 'bold' }}>Customer Name</th>
                    <th style={{ padding: '12px', textAlign: 'left', fontWeight: 'bold' }}>Transaction #</th>
                    <th style={{ padding: '12px', textAlign: 'left', fontWeight: 'bold' }}>Collateral Description</th>
                    <th style={{ padding: '12px', textAlign: 'left', fontWeight: 'bold' }}>Amount Loaned</th>
                    <th style={{ padding: '12px', textAlign: 'left', fontWeight: 'bold' }}>Date Issued</th>
                    <th style={{ padding: '12px', textAlign: 'left', fontWeight: 'bold' }}>Due Date</th>
                    <th style={{ padding: '12px', textAlign: 'left', fontWeight: 'bold' }}>Phone Number</th>
                  </tr>
                </thead>
                <tbody>
                  {overdueLoansData.loans.map((loan, index) => (
                    <tr 
                      key={loan.id || index} 
                      style={{ 
                        borderBottom: '1px solid #dee2e6',
                        backgroundColor: index % 2 === 0 ? '#fff' : '#f9f9f9'
                      }}
                    >
                      <td style={{ padding: '12px' }}>{loan.customer_name}</td>
                      <td style={{ padding: '12px' }}>{loan.transaction_number}</td>
                      <td style={{ padding: '12px' }}>{loan.collateral_description}</td>
                      <td style={{ padding: '12px' }}>${(parseFloat(loan.loan_amount) || 0).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</td>
                      <td style={{ padding: '12px' }}>{new Date(loan.issued_date).toLocaleDateString('en-US')}</td>
                      <td style={{ padding: '12px' }}>{new Date(loan.due_date).toLocaleDateString('en-US')}</td>
                      <td style={{ padding: '12px' }}>{loan.phone_number}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {showOverdueLoansDetails && (!overdueLoansData.loans || overdueLoansData.loans.length === 0) && (
            <div className="alert alert-info">
              No overdue loans found.
            </div>
          )}
        </div>
      )}

      {!overdueLoansData && !overdueLoansLoading && !overdueLoansMessage && (
        <div className="alert alert-info">
          Click "Fetch Overdue Loans" to view all overdue loans.
        </div>
      )}

      {/* ===== REVENUE REPORT SECTION ===== */}
      <hr style={{ margin: '40px 0', borderColor: '#e0e6ed' }} />
      
      <h3 style={{ marginTop: '40px' }}>Revenue Report</h3>

      {/* Date Range Selector */}
      <div style={{ marginBottom: '20px' }}>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '15px' }}>
          <div className="form-group">
            <label>Select Period</label>
            <select
              value={revenueDateRange}
              onChange={(e) => setRevenueDateRange(e.target.value)}
              style={{ width: '100%' }}
            >
              <option value="7">Last 7 Days</option>
              <option value="14">Last 14 Days</option>
              <option value="20">Last 20 Days</option>
              <option value="30">Last 30 Days</option>
              <option value="60">Last 60 Days</option>
              <option value="90">Last 90 Days</option>
              <option value="custom">Custom Range</option>
            </select>
          </div>

          {revenueDateRange === 'custom' && (
            <>
              <div className="form-group">
                <label>Start Date</label>
                <input
                  type="date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  style={{ width: '100%' }}
                />
              </div>
              <div className="form-group">
                <label>End Date</label>
                <input
                  type="date"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                  style={{ width: '100%' }}
                />
              </div>
            </>
          )}

          {revenueDateRange !== 'custom' && (
            <div style={{ display: 'flex', alignItems: 'flex-end' }}>
              <button
                onClick={handleFetchRevenueReport}
                className="btn-primary"
                disabled={revenueLoading}
                style={{ width: '100%' }}
              >
                {revenueLoading ? 'Loading...' : '📊 Generate Revenue Report'}
              </button>
            </div>
          )}
        </div>

        {revenueDateRange === 'custom' && (
          <div style={{ marginTop: '15px' }}>
            <button
              onClick={handleFetchRevenueReport}
              className="btn-primary"
              disabled={revenueLoading || !startDate || !endDate}
              style={{ width: '100%' }}
            >
              {revenueLoading ? 'Loading...' : '📊 Generate Revenue Report'}
            </button>
          </div>
        )}
      </div>

      {/* Revenue Message Area */}
      {revenueMessage && (
        <div className={`alert alert-${revenueMessageType}`} style={{ marginBottom: '20px' }}>
          {revenueMessage}
        </div>
      )}

      {/* Revenue Report Display */}
      {revenueData && (
        <div>
          <div className="card" style={{ marginBottom: '20px', backgroundColor: '#f8f9fa' }}>
            <div style={{ padding: '20px' }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px', marginBottom: '20px' }}>
                <div>
                  <p style={{ margin: '0 0 5px 0', color: '#666', fontSize: '14px' }}>Report Period</p>
                  <p style={{ margin: '0', fontSize: '16px', fontWeight: 'bold' }}>
                    {revenueData.startDate} to {revenueData.endDate}
                  </p>
                </div>
                <div>
                  <p style={{ margin: '0 0 5px 0', color: '#666', fontSize: '14px' }}>Number of Days</p>
                  <p style={{ margin: '0', fontSize: '16px', fontWeight: 'bold' }}>
                    {Math.ceil((new Date(revenueData.endDate) - new Date(revenueData.startDate)) / (1000 * 60 * 60 * 24)) + 1} days
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Revenue Summary Cards */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '20px', marginBottom: '20px' }}>
            <div style={{ backgroundColor: '#d4edda', padding: '20px', borderRadius: '8px', borderLeft: '4px solid #28a745' }}>
              <p style={{ margin: '0 0 10px 0', color: '#666', fontSize: '13px' }}>
                💰 Total Revenue
              </p>
              <p style={{ margin: 0, fontSize: '24px', fontWeight: 'bold', color: '#28a745' }}>
                ${(revenueData.totalRevenue || 0).toFixed(2)}
              </p>
            </div>

            <div style={{ backgroundColor: '#e7d4f5', padding: '20px', borderRadius: '8px', borderLeft: '4px solid #667eea' }}>
              <p style={{ margin: '0 0 10px 0', color: '#666', fontSize: '13px' }}>
                📈 Interest Revenue
              </p>
              <p style={{ margin: 0, fontSize: '24px', fontWeight: 'bold', color: '#667eea' }}>
                ${(revenueData.interestRevenue || 0).toFixed(2)}
              </p>
            </div>

            <div style={{ backgroundColor: '#fff3cd', padding: '20px', borderRadius: '8px', borderLeft: '4px solid #ffc107' }}>
              <p style={{ margin: '0 0 10px 0', color: '#666', fontSize: '13px' }}>
                💳 Principal Received
              </p>
              <p style={{ margin: 0, fontSize: '24px', fontWeight: 'bold', color: '#ffc107' }}>
                ${(revenueData.principalReceived || 0).toFixed(2)}
              </p>
            </div>

            <div style={{ backgroundColor: '#e2e3e5', padding: '20px', borderRadius: '8px', borderLeft: '4px solid #6c757d' }}>
              <p style={{ margin: '0 0 10px 0', color: '#666', fontSize: '13px' }}>
                🏷️ Fees Collected
              </p>
              <p style={{ margin: 0, fontSize: '24px', fontWeight: 'bold', color: '#6c757d' }}>
                ${(revenueData.feesCollected || 0).toFixed(2)}
              </p>
            </div>

            <div style={{ backgroundColor: '#e8f4f8', padding: '20px', borderRadius: '8px', borderLeft: '4px solid #5dd9ff' }}>
              <p style={{ margin: '0 0 10px 0', color: '#666', fontSize: '13px' }}>
                💼 Active Loan Base
              </p>
              <p style={{ margin: 0, fontSize: '24px', fontWeight: 'bold', color: '#5dd9ff' }}>
                {revenueData.activeLoanCount || 0}
              </p>
            </div>

            <div style={{ backgroundColor: '#f8d7da', padding: '20px', borderRadius: '8px', borderLeft: '4px solid #dc3545' }}>
              <p style={{ margin: '0 0 10px 0', color: '#666', fontSize: '13px' }}>
                ⚠️ Overdue Loans Balance
              </p>
              <p style={{ margin: 0, fontSize: '24px', fontWeight: 'bold', color: '#dc3545' }}>
                ${(revenueData.overdueLoanBalance || 0).toFixed(2)}
              </p>
            </div>
          </div>

          {/* Revenue by Loan Status Section */}
          <div className="card" style={{ marginBottom: '20px' }}>
            <div className="card-header">💵 Revenue Breakdown by Loan Status</div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '20px', padding: '20px' }}>
              <div style={{ backgroundColor: '#e8f5e9', padding: '15px', borderRadius: '8px', borderLeft: '4px solid #4caf50' }}>
                <p style={{ margin: '0 0 3px 0', color: '#666', fontSize: '13px' }}>Active Loans Revenue</p>
                <p style={{ margin: '3px 0', fontSize: '20px', fontWeight: 'bold', color: '#4caf50' }}>
                  ${(revenueData.activeLoansRevenue || 0).toFixed(2)}
                </p>
                <p style={{ margin: '5px 0 2px 0', color: '#999', fontSize: '12px' }}>
                  Principal: ${((revenueData.activeLoansRevenue || 0) - (revenueData.activeLoansInterest || 0)).toFixed(2)}
                </p>
                <p style={{ margin: '2px 0 0 0', color: '#999', fontSize: '12px' }}>
                  Interest: ${(revenueData.activeLoansInterest || 0).toFixed(2)}
                </p>
              </div>

              <div style={{ backgroundColor: '#fff8e1', padding: '15px', borderRadius: '8px', borderLeft: '4px solid #ff9800' }}>
                <p style={{ margin: '0 0 3px 0', color: '#666', fontSize: '13px' }}>Overdue Loans Revenue</p>
                <p style={{ margin: '3px 0', fontSize: '20px', fontWeight: 'bold', color: '#ff9800' }}>
                  ${(revenueData.dueLoansRevenue || 0).toFixed(2)}
                </p>
                <p style={{ margin: '5px 0 2px 0', color: '#999', fontSize: '12px' }}>
                  Principal: ${((revenueData.dueLoansRevenue || 0) - (revenueData.dueLoansInterest || 0)).toFixed(2)}
                </p>
                <p style={{ margin: '2px 0 0 0', color: '#999', fontSize: '12px' }}>
                  Interest: ${(revenueData.dueLoansInterest || 0).toFixed(2)}
                </p>
              </div>

              <div style={{ backgroundColor: '#f3e5f5', padding: '15px', borderRadius: '8px', borderLeft: '4px solid #9c27b0' }}>
                <p style={{ margin: '0 0 3px 0', color: '#666', fontSize: '13px' }}>Redeemed Loans Revenue</p>
                <p style={{ margin: '3px 0', fontSize: '20px', fontWeight: 'bold', color: '#9c27b0' }}>
                  ${(revenueData.redeemedLoansRevenue || 0).toFixed(2)}
                </p>
                <p style={{ margin: '5px 0 2px 0', color: '#999', fontSize: '12px' }}>
                  Principal: ${((revenueData.redeemedLoansRevenue || 0) - (revenueData.redeemedLoansInterest || 0)).toFixed(2)}
                </p>
                <p style={{ margin: '2px 0 0 0', color: '#999', fontSize: '12px' }}>
                  Interest: ${(revenueData.redeemedLoansInterest || 0).toFixed(2)}
                </p>
              </div>
            </div>
          </div>

          {/* Revenue Details Table */}
          <div className="card">
            <div className="card-header">Revenue Breakdown by Category</div>
            <table style={{ width: '100%', marginTop: '15px', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ borderBottom: '2px solid #667eea' }}>
                  <th style={{ textAlign: 'left', padding: '10px' }}>Revenue Source</th>
                  <th style={{ textAlign: 'center', padding: '10px' }}>Count</th>
                  <th style={{ textAlign: 'right', padding: '10px' }}>Amount</th>
                  <th style={{ textAlign: 'right', padding: '10px' }}>% of Total</th>
                </tr>
              </thead>
              <tbody>
                <tr style={{ borderBottom: '1px solid #e0e6ed' }}>
                  <td style={{ padding: '10px' }}>Interest from Loans</td>
                  <td style={{ textAlign: 'center', padding: '10px' }}>{revenueData.interestCount || 0}</td>
                  <td style={{ textAlign: 'right', padding: '10px' }}>${(revenueData.interestRevenue || 0).toFixed(2)}</td>
                  <td style={{ textAlign: 'right', padding: '10px' }}>
                    {((revenueData.interestRevenue || 0) / (revenueData.totalRevenue || 1) * 100).toFixed(2)}%
                  </td>
                </tr>
                <tr style={{ borderBottom: '1px solid #e0e6ed' }}>
                  <td style={{ padding: '10px' }}>Principal Received (Payments)</td>
                  <td style={{ textAlign: 'center', padding: '10px' }}>{revenueData.principalCount || 0}</td>
                  <td style={{ textAlign: 'right', padding: '10px' }}>${(revenueData.principalReceived || 0).toFixed(2)}</td>
                  <td style={{ textAlign: 'right', padding: '10px' }}>
                    {((revenueData.principalReceived || 0) / (revenueData.totalRevenue || 1) * 100).toFixed(2)}%
                  </td>
                </tr>
                <tr style={{ borderBottom: '1px solid #e0e6ed' }}>
                  <td style={{ padding: '10px' }}>Service Fees</td>
                  <td style={{ textAlign: 'center', padding: '10px' }}>{revenueData.feeCount || 0}</td>
                  <td style={{ textAlign: 'right', padding: '10px' }}>${(revenueData.feesCollected || 0).toFixed(2)}</td>
                  <td style={{ textAlign: 'right', padding: '10px' }}>
                    {((revenueData.feesCollected || 0) / (revenueData.totalRevenue || 1) * 100).toFixed(2)}%
                  </td>
                </tr>
                <tr style={{ backgroundColor: '#f8f9fa', fontWeight: 'bold', borderBottom: '2px solid #667eea' }}>
                  <td style={{ padding: '10px' }}>Total Revenue</td>
                  <td style={{ textAlign: 'center', padding: '10px' }}>{(revenueData.interestCount || 0) + (revenueData.principalCount || 0) + (revenueData.feeCount || 0)}</td>
                  <td style={{ textAlign: 'right', padding: '10px' }}>${(revenueData.totalRevenue || 0).toFixed(2)}</td>
                  <td style={{ textAlign: 'right', padding: '10px' }}>100%</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ===== BALANCING REPORT SECTION ===== */}
      <hr style={{ margin: '40px 0', borderColor: '#e0e6ed' }} />
      
      <h3 style={{ marginTop: '40px' }}>Daily Cash Report - Balancing Tab</h3>

      {/* Date Range Selector for Balancing */}
      <div style={{ marginBottom: '20px' }}>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '15px' }}>
          <div className="form-group">
            <label>Start Date</label>
            <input
              type="date"
              value={balancingStartDate}
              onChange={(e) => setBalancingStartDate(e.target.value)}
              style={{ width: '100%' }}
            />
          </div>
          <div className="form-group">
            <label>End Date</label>
            <input
              type="date"
              value={balancingEndDate}
              onChange={(e) => setBalancingEndDate(e.target.value)}
              style={{ width: '100%' }}
            />
          </div>
          <div style={{ display: 'flex', alignItems: 'flex-end' }}>
            <button
              onClick={handleFetchBalancingReport}
              className="btn-primary"
              disabled={balancingLoading || !balancingStartDate || !balancingEndDate}
              style={{ width: '100%' }}
            >
              {balancingLoading ? 'Loading...' : '⚖️ Generate Balancing Report'}
            </button>
          </div>
        </div>
      </div>

      {/* Balancing Message Area */}
      {balancingMessage && (
        <div className={`alert alert-${balancingMessageType}`} style={{ marginBottom: '20px' }}>
          {balancingMessage}
        </div>
      )}

      {/* Balancing Report Display */}
      {balancingData && (
        <div>
          <div className="card" style={{ marginBottom: '20px', backgroundColor: '#f8f9fa' }}>
            <div style={{ padding: '20px' }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px', marginBottom: '20px' }}>
                <div>
                  <p style={{ margin: '0 0 5px 0', color: '#666', fontSize: '14px' }}>Report Period</p>
                  <p style={{ margin: '0', fontSize: '16px', fontWeight: 'bold' }}>
                    {balancingData.startDate} to {balancingData.endDate}
                  </p>
                </div>
                <div>
                  <p style={{ margin: '0 0 5px 0', color: '#666', fontSize: '14px' }}>Number of Days</p>
                  <p style={{ margin: '0', fontSize: '16px', fontWeight: 'bold' }}>
                    {Math.ceil((new Date(balancingData.endDate) - new Date(balancingData.startDate)) / (1000 * 60 * 60 * 24)) + 1} days
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Active Loans Section */}
          <div className="card" style={{ marginBottom: '20px' }}>
            <div className="card-header">💼 Active Loans Summary</div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '20px', padding: '20px' }}>
              <div style={{ backgroundColor: '#e8f5e9', padding: '20px', borderRadius: '8px', borderLeft: '4px solid #4caf50' }}>
                <p style={{ margin: '0 0 10px 0', color: '#666', fontSize: '13px' }}>
                  📊 Total Active Loans
                </p>
                <p style={{ margin: '0', fontSize: '28px', fontWeight: 'bold', color: '#4caf50' }}>
                  {balancingData.totalActiveLoanCount || 0}
                </p>
                <p style={{ margin: '8px 0 0 0', color: '#666', fontSize: '12px' }}>
                  loans outstanding
                </p>
              </div>

              <div style={{ backgroundColor: '#c8e6c9', padding: '20px', borderRadius: '8px', borderLeft: '4px solid #388e3c' }}>
                <p style={{ margin: '0 0 10px 0', color: '#666', fontSize: '13px' }}>
                  💰 Total Principal (Active Loans)
                </p>
                <p style={{ margin: '0', fontSize: '28px', fontWeight: 'bold', color: '#388e3c' }}>
                  ${(balancingData.totalActivePrincipal || 0).toFixed(2)}
                </p>
                <p style={{ margin: '8px 0 0 0', color: '#666', fontSize: '12px' }}>
                  shop receives
                </p>
              </div>

              <div style={{ backgroundColor: '#e1f5fe', padding: '20px', borderRadius: '8px', borderLeft: '4px solid #0288d1' }}>
                <p style={{ margin: '0 0 10px 0', color: '#666', fontSize: '13px' }}>
                  📈 Total Interest (Active Loans)
                </p>
                <p style={{ margin: '0', fontSize: '28px', fontWeight: 'bold', color: '#0288d1' }}>
                  ${(balancingData.totalActiveInterest || 0).toFixed(2)}
                </p>
                <p style={{ margin: '8px 0 0 0', color: '#666', fontSize: '12px' }}>
                  shop receives
                </p>
              </div>
            </div>
          </div>

          {/* Due Loans Section */}
          <div className="card" style={{ marginBottom: '20px' }}>
            <div className="card-header">⚠️ Due Loans Summary</div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '20px', padding: '20px' }}>
              <div style={{ backgroundColor: '#fff3e0', padding: '20px', borderRadius: '8px', borderLeft: '4px solid #ff9800' }}>
                <p style={{ margin: '0 0 10px 0', color: '#666', fontSize: '13px' }}>
                  ⏰ Total Due Loans
                </p>
                <p style={{ margin: '0', fontSize: '28px', fontWeight: 'bold', color: '#ff9800' }}>
                  {balancingData.totalDueLoanCount || 0}
                </p>
                <p style={{ margin: '8px 0 0 0', color: '#666', fontSize: '12px' }}>
                  loans past due
                </p>
              </div>

              <div style={{ backgroundColor: '#ffe0b2', padding: '20px', borderRadius: '8px', borderLeft: '4px solid #f57c00' }}>
                <p style={{ margin: '0 0 10px 0', color: '#666', fontSize: '13px' }}>
                  💵 Total Principal (Due Loans)
                </p>
                <p style={{ margin: '0', fontSize: '28px', fontWeight: 'bold', color: '#f57c00' }}>
                  ${(balancingData.totalDuePrincipal || 0).toFixed(2)}
                </p>
                <p style={{ margin: '8px 0 0 0', color: '#666', fontSize: '12px' }}>
                  shop receives
                </p>
              </div>

              <div style={{ backgroundColor: '#ffccbc', padding: '20px', borderRadius: '8px', borderLeft: '4px solid #d84315' }}>
                <p style={{ margin: '0 0 10px 0', color: '#666', fontSize: '13px' }}>
                  🔴 Total Interest (Due Loans)
                </p>
                <p style={{ margin: '0', fontSize: '28px', fontWeight: 'bold', color: '#d84315' }}>
                  ${(balancingData.totalDueInterest || 0).toFixed(2)}
                </p>
                <p style={{ margin: '8px 0 0 0', color: '#666', fontSize: '12px' }}>
                  shop receives
                </p>
              </div>
            </div>
          </div>

          {/* Summary Comparison Card */}
          <div className="card" style={{ marginBottom: '20px', backgroundColor: '#f5f5f5' }}>
            <div className="card-header">📋 Summary Comparison</div>
            <div style={{ padding: '20px' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead>
                  <tr style={{ borderBottom: '2px solid #667eea' }}>
                    <th style={{ textAlign: 'left', padding: '15px', color: '#333', fontWeight: 'bold' }}>Metric</th>
                    <th style={{ textAlign: 'center', padding: '15px', color: '#333', fontWeight: 'bold' }}>Active Loans</th>
                    <th style={{ textAlign: 'center', padding: '15px', color: '#333', fontWeight: 'bold' }}>Due Loans</th>
                    <th style={{ textAlign: 'center', padding: '15px', color: '#333', fontWeight: 'bold' }}>Total</th>
                  </tr>
                </thead>
                <tbody>
                  <tr style={{ borderBottom: '1px solid #e0e6ed', backgroundColor: '#fafafa' }}>
                    <td style={{ padding: '12px 15px', fontWeight: '500' }}>Number of Loans</td>
                    <td style={{ textAlign: 'center', padding: '12px 15px', color: '#4caf50', fontWeight: 'bold' }}>
                      {balancingData.totalActiveLoanCount || 0}
                    </td>
                    <td style={{ textAlign: 'center', padding: '12px 15px', color: '#ff9800', fontWeight: 'bold' }}>
                      {balancingData.totalDueLoanCount || 0}
                    </td>
                    <td style={{ textAlign: 'center', padding: '12px 15px', color: '#333', fontWeight: 'bold' }}>
                      {(balancingData.totalActiveLoanCount || 0) + (balancingData.totalDueLoanCount || 0)}
                    </td>
                  </tr>
                  <tr style={{ borderBottom: '1px solid #e0e6ed', backgroundColor: '#fff' }}>
                    <td style={{ padding: '12px 15px', fontWeight: '500' }}>Principal Amount</td>
                    <td style={{ textAlign: 'center', padding: '12px 15px', color: '#388e3c', fontWeight: 'bold' }}>
                      ${(balancingData.totalActivePrincipal || 0).toFixed(2)}
                    </td>
                    <td style={{ textAlign: 'center', padding: '12px 15px', color: '#f57c00', fontWeight: 'bold' }}>
                      ${(balancingData.totalDuePrincipal || 0).toFixed(2)}
                    </td>
                    <td style={{ textAlign: 'center', padding: '12px 15px', color: '#333', fontWeight: 'bold' }}>
                      ${((balancingData.totalActivePrincipal || 0) + (balancingData.totalDuePrincipal || 0)).toFixed(2)}
                    </td>
                  </tr>
                  <tr style={{ borderBottom: '2px solid #667eea', backgroundColor: '#fafafa' }}>
                    <td style={{ padding: '12px 15px', fontWeight: '500' }}>Interest Amount</td>
                    <td style={{ textAlign: 'center', padding: '12px 15px', color: '#0288d1', fontWeight: 'bold' }}>
                      ${(balancingData.totalActiveInterest || 0).toFixed(2)}
                    </td>
                    <td style={{ textAlign: 'center', padding: '12px 15px', color: '#d84315', fontWeight: 'bold' }}>
                      ${(balancingData.totalDueInterest || 0).toFixed(2)}
                    </td>
                    <td style={{ textAlign: 'center', padding: '12px 15px', color: '#333', fontWeight: 'bold' }}>
                      ${((balancingData.totalActiveInterest || 0) + (balancingData.totalDueInterest || 0)).toFixed(2)}
                    </td>
                  </tr>
                  <tr style={{ backgroundColor: '#e8f5e9' }}>
                    <td style={{ padding: '12px 15px', fontWeight: 'bold', color: '#333' }}>Total Shop Gets</td>
                    <td style={{ textAlign: 'center', padding: '12px 15px', color: '#2e7d32', fontWeight: 'bold', fontSize: '16px' }}>
                      ${((balancingData.totalActivePrincipal || 0) + (balancingData.totalActiveInterest || 0)).toFixed(2)}
                    </td>
                    <td style={{ textAlign: 'center', padding: '12px 15px', color: '#e65100', fontWeight: 'bold', fontSize: '16px' }}>
                      ${((balancingData.totalDuePrincipal || 0) + (balancingData.totalDueInterest || 0)).toFixed(2)}
                    </td>
                    <td style={{ textAlign: 'center', padding: '12px 15px', color: '#1565c0', fontWeight: 'bold', fontSize: '18px', backgroundColor: '#bbdefb' }}>
                      ${((balancingData.totalActivePrincipal || 0) + (balancingData.totalActiveInterest || 0) + (balancingData.totalDuePrincipal || 0) + (balancingData.totalDueInterest || 0)).toFixed(2)}
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {!balancingData && !balancingLoading && !balancingMessage && (
        <div className="alert alert-info">
          Select a date range and click "Generate Balancing Report" to view the balancing metrics.
        </div>
      )}

      {/* ===== DETAILED LOANS BREAKDOWN SECTION ===== */}
      <hr style={{ margin: '40px 0', borderColor: '#e0e6ed' }} />
      
      <h3 style={{ marginTop: '40px', marginBottom: '20px' }}>📋 Detailed Loans Breakdown</h3>
      <p style={{ color: '#666', marginBottom: '20px' }}>
        View all active and overdue loans grouped by customer with payment status and due dates.
      </p>

      <div style={{ marginBottom: '20px' }}>
        <button
          onClick={() => setShowDetailedBreakdown(!showDetailedBreakdown)}
          className="btn-primary"
          style={{ marginBottom: '15px' }}
        >
          {showDetailedBreakdown ? '▼ Hide Detailed Breakdown' : '▶ Show Detailed Breakdown'}
        </button>
      </div>

      {showDetailedBreakdown && (
        <div style={{ 
          backgroundColor: '#f9f9f9', 
          padding: '20px', 
          borderRadius: '8px',
          border: '1px solid #e0e6ed',
          marginBottom: '30px'
        }}>
          <DetailedLoansBreakdown />
        </div>
      )}
    </div>
  );
};

export default CashReport;
