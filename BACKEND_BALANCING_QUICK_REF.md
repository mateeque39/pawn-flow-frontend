# Backend Implementation Quick Reference - Balancing Report

## 🎯 What You Need to Build

A new API endpoint that calculates loan statistics for a date range.

---

## 📍 Endpoint Details

### URL
```
GET /balancing-report
```

### Query Parameters
```
?startDate=YYYY-MM-DD&endDate=YYYY-MM-DD
```

**Example:**
```
GET /balancing-report?startDate=2025-01-01&endDate=2025-01-31
```

---

## 📥 Request

```http
GET /balancing-report?startDate=2025-01-01&endDate=2025-01-31
Host: your-api.com
Accept: application/json
```

---

## 📤 Response

### Success Response (200 OK)

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

### Field Descriptions

| Field | Type | Description |
|-------|------|-------------|
| `startDate` | string | Echo back the start date from request |
| `endDate` | string | Echo back the end date from request |
| `totalActiveLoanCount` | number | Count of non-overdue loans in date range |
| `totalActivePrincipal` | number | Sum of principal for active loans (2 decimals) |
| `totalActiveInterest` | number | Sum of interest for active loans (2 decimals) |
| `totalDueLoanCount` | number | Count of overdue loans in date range |
| `totalDuePrincipal` | number | Sum of principal for due loans (2 decimals) |
| `totalDueInterest` | number | Sum of interest for due loans (2 decimals) |

---

## 🔍 SQL Query Example (PostgreSQL)

```sql
SELECT
  -- Active loans (not overdue)
  COUNT(CASE WHEN status = 'active' AND dueDate >= NOW()::date THEN 1 END) as totalActiveLoanCount,
  COALESCE(SUM(CASE WHEN status = 'active' AND dueDate >= NOW()::date THEN principal ELSE 0 END), 0) as totalActivePrincipal,
  COALESCE(SUM(CASE WHEN status = 'active' AND dueDate >= NOW()::date THEN interest ELSE 0 END), 0) as totalActiveInterest,
  
  -- Due loans (overdue)
  COUNT(CASE WHEN status = 'active' AND dueDate < NOW()::date THEN 1 END) as totalDueLoanCount,
  COALESCE(SUM(CASE WHEN status = 'active' AND dueDate < NOW()::date THEN principal ELSE 0 END), 0) as totalDuePrincipal,
  COALESCE(SUM(CASE WHEN status = 'active' AND dueDate < NOW()::date THEN interest ELSE 0 END), 0) as totalDueInterest

FROM loans
WHERE createdDate >= $1::date 
  AND createdDate <= $2::date;
```

---

## 🟢 Success Scenarios

### Scenario 1: Normal Response
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

### Scenario 2: No Loans in Range
```json
{
  "startDate": "2025-06-01",
  "endDate": "2025-06-30",
  "totalActiveLoanCount": 0,
  "totalActivePrincipal": 0.00,
  "totalActiveInterest": 0.00,
  "totalDueLoanCount": 0,
  "totalDuePrincipal": 0.00,
  "totalDueInterest": 0.00
}
```

---

## 🔴 Error Scenarios

### Missing Query Parameters
```
Status: 400 Bad Request

{
  "error": "Missing required parameters: startDate or endDate"
}
```

### Invalid Date Format
```
Status: 400 Bad Request

{
  "error": "Invalid date format. Use YYYY-MM-DD"
}
```

### Start Date After End Date
```
Status: 400 Bad Request

{
  "error": "Start date cannot be after end date"
}
```

### Server Error
```
Status: 500 Internal Server Error

{
  "error": "Internal server error"
}
```

---

## 🔑 Key Calculation Rules

1. **Active Loans**: Loans with status = 'active' AND due date >= today
2. **Due Loans**: Loans with status = 'active' AND due date < today
3. **Date Range**: Based on loan creation date or transaction date (confirm which)
4. **Amounts**: Should include principal + interest for each loan type
5. **Precision**: Round to 2 decimal places for currency

---

## 🧪 Test Cases

### Test 1: Basic Date Range
```
Request: GET /balancing-report?startDate=2025-01-01&endDate=2025-01-31
Expected: Return aggregated loan data for January 2025
```

### Test 2: Single Day
```
Request: GET /balancing-report?startDate=2025-01-01&endDate=2025-01-01
Expected: Return loans created/active on 2025-01-01
```

### Test 3: Future Date Range
```
Request: GET /balancing-report?startDate=2099-01-01&endDate=2099-01-31
Expected: Return empty results (0 counts, 0 amounts)
```

### Test 4: Invalid Dates
```
Request: GET /balancing-report?startDate=2025-13-01&endDate=2025-01-31
Expected: 400 Bad Request with error message
```

### Test 5: Missing Parameters
```
Request: GET /balancing-report?startDate=2025-01-01
Expected: 400 Bad Request (missing endDate)
```

---

## 📝 Implementation Checklist

- [ ] Create `/balancing-report` GET endpoint
- [ ] Validate `startDate` and `endDate` parameters
- [ ] Check date format (YYYY-MM-DD)
- [ ] Verify startDate <= endDate
- [ ] Query database for active loans in range
- [ ] Query database for due loans in range
- [ ] Calculate totals (count, principal sum, interest sum)
- [ ] Return JSON response with correct format
- [ ] Add error handling for edge cases
- [ ] Add logging for debugging
- [ ] Test with sample data
- [ ] Document edge cases
- [ ] Add input validation
- [ ] Test with concurrent requests

---

## 🔗 Integration Points

The frontend will:
1. Call this endpoint with date range parameters
2. Display data in cards and comparison table
3. Show loading state while fetching
4. Display errors if endpoint fails
5. Cache/store results in React state

---

## 💡 Tips

- Ensure query is optimized for large date ranges
- Consider caching results for frequently requested ranges
- Use database indexes on `status`, `dueDate`, and `createdDate`
- Return 0 values instead of null for missing data
- Always return both startDate and endDate in response
- Round monetary values to 2 decimal places
- Consider timezone handling if applicable

---

## 📞 Frontend Integration

Once this endpoint is ready:
1. Frontend will automatically call it when user selects dates
2. Results will populate the Balancing Tab UI
3. No additional frontend changes needed
4. Both active and due loan metrics will display with proper styling

**Status**: Waiting for backend implementation ⏳

---

## Example Node.js/Express Implementation

```javascript
app.get('/balancing-report', async (req, res) => {
  try {
    const { startDate, endDate } = req.query;

    // Validate parameters
    if (!startDate || !endDate) {
      return res.status(400).json({
        error: 'Missing required parameters: startDate or endDate'
      });
    }

    // Validate date format
    if (!/^\d{4}-\d{2}-\d{2}$/.test(startDate) || 
        !/^\d{4}-\d{2}-\d{2}$/.test(endDate)) {
      return res.status(400).json({
        error: 'Invalid date format. Use YYYY-MM-DD'
      });
    }

    // Query database
    const result = await db.query(`
      SELECT
        COUNT(CASE WHEN dueDate >= $3::date THEN 1 END) as totalActiveLoanCount,
        COALESCE(SUM(CASE WHEN dueDate >= $3::date THEN principal ELSE 0 END), 0) as totalActivePrincipal,
        COALESCE(SUM(CASE WHEN dueDate >= $3::date THEN interest ELSE 0 END), 0) as totalActiveInterest,
        COUNT(CASE WHEN dueDate < $3::date THEN 1 END) as totalDueLoanCount,
        COALESCE(SUM(CASE WHEN dueDate < $3::date THEN principal ELSE 0 END), 0) as totalDuePrincipal,
        COALESCE(SUM(CASE WHEN dueDate < $3::date THEN interest ELSE 0 END), 0) as totalDueInterest
      FROM loans
      WHERE status = 'active'
        AND createdDate >= $1::date
        AND createdDate <= $2::date
    `, [startDate, endDate, new Date().toISOString().split('T')[0]]);

    res.json({
      startDate,
      endDate,
      ...result.rows[0]
    });
  } catch (error) {
    console.error('Error in balancing-report:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});
```

---

**Last Updated**: January 2025
**Status**: Ready for Implementation ✅
