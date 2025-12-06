# Backend Integration Instructions - Balancing Report Endpoint

## 📋 Summary

The frontend's new "Balancing Tab" is waiting for a `/balancing-report` endpoint on your backend.

## ✅ What You Need to Do

### Step 1: Copy the Endpoint Code
The endpoint code has been saved in: `BALANCING_REPORT_ENDPOINT.js`

### Step 2: Add to Your Backend (server.js)

Find this section in your `server.js`:
```javascript
// ======================== END REVENUE REPORT ========================

// ======================== PDF INVOICE GENERATION ========================
```

**Add this code between those two sections** (after the Revenue Report section):

```javascript
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
```

## 🔄 Frontend-Backend Connection

### Frontend Request Example:
```
GET http://localhost:5000/balancing-report?startDate=2025-01-01&endDate=2025-01-31
```

### Backend Response Example:
```json
{
  "startDate": "2025-01-01",
  "endDate": "2025-01-31",
  "totalActiveLoanCount": 45,
  "totalActivePrincipal": 15000.00,
  "totalActiveInterest": 2250.00,
  "totalDueLoanCount": 8,
  "totalDuePrincipal": 3200.00,
  "totalDueInterest": 480.00
}
```

## 📊 What the Endpoint Does

**Active Loans Query:**
- Finds loans created between startDate and endDate
- Status must be 'active'
- Due date must be >= today (not yet overdue)
- Sums: loan_amount (principal) + interest_amount

**Due Loans Query:**
- Finds loans created between startDate and endDate  
- Status must be 'active'
- Due date must be < today (overdue)
- Sums: loan_amount (principal) + interest_amount

## ✨ Features

✅ Date validation (YYYY-MM-DD format)
✅ Error handling for invalid dates
✅ Proper decimal formatting for currency
✅ Logging for debugging
✅ CORS compatible with frontend

## 🧪 Testing

After adding to backend and restarting, test with:

```
GET http://localhost:5000/balancing-report?startDate=2025-01-01&endDate=2025-01-31
```

You should get a JSON response with the metrics.

## 📍 Location in server.js

Add this AFTER the `/revenue-report` endpoint (around line ~1450) and BEFORE the `/loan-pdf/:loanId` endpoint.

---

**That's it!** Once added and backend is restarted, the frontend Balancing Tab will work perfectly! 🚀
