// ======================== BALANCING REPORT (FOR DAILY CASH REPORT - BALANCING TAB) ========================

// GET BALANCING REPORT - Active and Due loans within a custom date range
// Frontend calls: GET /balancing-report?startDate=YYYY-MM-DD&endDate=YYYY-MM-DD
app.get('/balancing-report', async (req, res) => {
  try {
    const { startDate, endDate } = req.query;

    // Validate date parameters
    if (!startDate || !endDate) {
      return res.status(400).json({ 
        message: 'startDate and endDate query parameters are required (YYYY-MM-DD format)' 
      });
    }

    // Validate date format
    if (!/^\d{4}-\d{2}-\d{2}$/.test(startDate) || !/^\d{4}-\d{2}-\d{2}$/.test(endDate)) {
      return res.status(400).json({ 
        message: 'Invalid date format. Use YYYY-MM-DD' 
      });
    }

    // Parse dates
    const start = new Date(startDate);
    const end = new Date(endDate);

    if (isNaN(start.getTime()) || isNaN(end.getTime())) {
      return res.status(400).json({ 
        message: 'Invalid date values' 
      });
    }

    // Verify start date is before end date
    if (start > end) {
      return res.status(400).json({ 
        message: 'Start date must be before or equal to end date' 
      });
    }

    // Get ACTIVE loans (non-overdue) created or active within the date range
    // Active loans: status = 'active' AND due_date >= today (not yet due)
    const activeLoansResult = await pool.query(
      `SELECT 
        COUNT(*) as total_count,
        COALESCE(SUM(loan_amount), 0) as total_principal,
        COALESCE(SUM(interest_amount), 0) as total_interest,
        COALESCE(SUM(loan_amount + interest_amount), 0) as total_amount
      FROM loans 
      WHERE status = $1 
        AND DATE(loan_issued_date) >= $2 
        AND DATE(loan_issued_date) <= $3
        AND DATE(due_date) >= CURRENT_DATE`,
      ['active', startDate, endDate]
    );

    // Get DUE/OVERDUE loans (active loans with due date passed)
    // Due loans: status = 'active' AND due_date < today
    const dueLoansResult = await pool.query(
      `SELECT 
        COUNT(*) as total_count,
        COALESCE(SUM(loan_amount), 0) as total_principal,
        COALESCE(SUM(interest_amount), 0) as total_interest,
        COALESCE(SUM(loan_amount + interest_amount), 0) as total_amount
      FROM loans 
      WHERE status = $1 
        AND DATE(loan_issued_date) >= $2 
        AND DATE(loan_issued_date) <= $3
        AND DATE(due_date) < CURRENT_DATE`,
      ['active', startDate, endDate]
    );

    const activeLoans = activeLoansResult.rows[0];
    const dueLoans = dueLoansResult.rows[0];

    // Format response with proper decimal places
    const response = {
      startDate,
      endDate,
      totalActiveLoanCount: parseInt(activeLoans.total_count) || 0,
      totalActivePrincipal: parseFloat(activeLoans.total_principal) || 0.00,
      totalActiveInterest: parseFloat(activeLoans.total_interest) || 0.00,
      totalDueLoanCount: parseInt(dueLoans.total_count) || 0,
      totalDuePrincipal: parseFloat(dueLoans.total_principal) || 0.00,
      totalDueInterest: parseFloat(dueLoans.total_interest) || 0.00
    };

    console.log('📊 Balancing Report Generated:', response);
    res.json(response);
  } catch (err) {
    console.error('Error generating balancing report:', err);
    res.status(500).json({ 
      message: 'Error generating balancing report', 
      error: err.message 
    });
  }
});

// ======================== END BALANCING REPORT ========================
