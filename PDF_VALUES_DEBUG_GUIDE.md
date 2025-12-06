# 🔍 PDF Values Debug Guide - Why Values Aren't Showing Correctly

## 🎯 The Issue

You're seeing:
- ❌ `N/A` for customer names
- ❌ `$0.00` for loan amounts  
- ❌ Empty fields for dates

## 🔧 Root Cause Analysis

### The Data Flow

```
Frontend Form → POST /create-loan → Backend Creates Loan → Returns response
   (send data)    (mapped to DB)    (queries DB)         (formatLoanResponse)
                                                              ↓
Frontend receives response.data.loan ← Uses snake_case field names
   └─ first_name, last_name, loan_amount, transaction_number, due_date
```

### Why Values Show as N/A or $0.00

The PDF extraction expects backend to return:
```javascript
{
  first_name: "John",
  last_name: "Doe", 
  loan_amount: 500,
  interest_amount: 50,
  total_payable_amount: 550,
  transaction_number: "12345",
  due_date: "2025-12-27"
}
```

But if the response is missing these fields, the code defaults to:
```javascript
const firstName = loanData?.first_name || '';  // Shows as empty
const loanAmt = parseFloat(loanData?.loan_amount || 0);  // Shows as $0.00
```

## 🐛 Debugging Steps

### Step 1: Check Browser Console

1. Open your web app → Create a loan → Click "Generate PDF"
2. Open **Developer Tools** (F12)
3. Go to **Console** tab
4. Look for logs that say `"BEGIN DEBUG"` and `"END DEBUG"`
5. You should see `"Extracted PDF values:"` with actual values

**Example output**:
```javascript
Extracted PDF values: {
  firstName: "John",
  lastName: "Doe",
  customerName: "John Doe",
  loanId: 123,
  transNumber: "TX-2025-001",
  loanAmt: 500,
  interestAmt: 50,
  totalAmt: 550,
  dueDate: "11/27/2025"
}
```

**If values are showing as empty/zero**: Backend isn't returning them

### Step 2: Check Backend Response

1. Open **Network** tab (F12 → Network)
2. Create a loan
3. Look for `POST /create-loan` request
4. Click on it → Go to **Response** tab
5. Look at the JSON response under `"loan"` object

**Should show**:
```json
{
  "loan": {
    "id": 123,
    "first_name": "John",
    "last_name": "Doe",
    "loan_amount": 500,
    "interest_amount": 50,
    "total_payable_amount": 550,
    "transaction_number": "TX-2025-001",
    "due_date": "2025-11-27",
    ...
  }
}
```

**If missing fields**: Backend query isn't returning them from database

### Step 3: Check Backend Logs

Run your backend and check the console output:

```powershell
cd C:\Users\HP\pawn-flow
node server.js
# Look for error messages or check database query results
```

## ✅ Common Fixes

### Issue 1: Backend Returns Camel Case Instead of Snake Case

**Problem**: Backend returns `firstName` instead of `first_name`

**Fix**: Frontend already handles both! Lines 175-186 of CreateLoanForm.js:
```javascript
const firstName = loanData?.first_name || '';
const lastName = loanData?.last_name || '';
```

### Issue 2: Backend Doesn't Include Response Fields

**Problem**: Backend doesn't return fields in `response.json()`

**Check**: In `server.js` line 308-570, the create-loan endpoint should have:
```javascript
res.status(201).json({
  loan,  // ← This includes all loan fields
  pdf_url: `/loan-pdf/${result.rows[0].id}`
});
```

### Issue 3: Database Query Missing Fields

**Problem**: INSERT query doesn't retrieve calculated values

**Check**: `server.js` around line 420-450 should RETURN all fields:
```sql
INSERT INTO loans (
  first_name, last_name, loan_amount, interest_amount, 
  total_payable_amount, transaction_number, due_date, ...
) VALUES (...) RETURNING *
```

The `RETURNING *` is crucial - it returns all columns including calculated ones.

## 📊 Field Mapping Reference

**What Frontend Sends to Backend** (camelCase):
```javascript
{
  firstName: "John",
  lastName: "Doe",
  loanAmount: 500,
  interestRate: 10,
  dueDate: "2025-12-27",
  transactionNumber: "12345"
}
```

**Backend Stores** (snake_case):
```sql
first_name, last_name, loan_amount, interest_rate, 
due_date, transaction_number
```

**Backend Returns** (snake_case, via formatLoanResponse):
```json
{
  "first_name": "John",
  "last_name": "Doe",
  "loan_amount": 500,
  "interest_rate": 10,
  "due_date": "2025-12-27",
  "transaction_number": "12345"
}
```

**Frontend Extracts** (expects snake_case):
```javascript
const firstName = loanData?.first_name || '';
const loanAmt = parseFloat(loanData?.loan_amount || 0);
```

## 🧪 Test Checklist

- [ ] Create a test loan with values (e.g., $500 loan, 10% interest)
- [ ] Check browser console for extracted values
- [ ] Open Network tab, find POST /create-loan response
- [ ] Verify response includes `"loan"` object with all fields
- [ ] Check that `first_name`, `loan_amount`, `due_date` are present
- [ ] Generate PDF and verify values display correctly
- [ ] If still showing N/A/$0.00, backend query is missing fields

## 📝 Files to Check

1. **Frontend PDF Extraction**
   - `src/CreateLoanForm.js` - Lines 175-186 (value extraction)
   - `src/CreateLoanForm.js` - Lines 200-210 (debug logging)

2. **Backend Response**
   - `pawn-flow/server.js` - Line 540-560 (response format)
   - `pawn-flow/validators.js` - formatLoanResponse function

3. **Database Schema**
   - Check that customers and loans tables have all required columns
   - Run: `SELECT * FROM loans LIMIT 1;`
   - Verify columns exist: first_name, last_name, loan_amount, transaction_number, due_date

## 🆘 Still Having Issues?

**Symptoms → Solutions**:

| Symptom | Check |
|---------|-------|
| All values N/A | Backend query not returning fields |
| Only amounts are $0.00 | Calculations not happening in backend |
| Dates are blank | due_date not being set or formatted wrong |
| Customer name is empty | first_name/last_name not passed to backend |
| Transaction ID is N/A | transaction_number not generated |

**Quick Debug**:
1. In CreateLoanForm.js, add after line 140: `console.log('Full loanData:', JSON.stringify(loanData, null, 2));`
2. Create a loan
3. Check console output
4. Share output if still having issues

## ✨ Expected PDF Output

After fix, your PDF should show:

```
GREEN MOOLAA BRAMPTON
263 QUEEN ST. E. UNIT 4
BRAMPTON ON L6W 4K6
(905) 796-7777

[ORIGINAL]          Transaction: TX-2025-001234

Customer: John Doe
Loan ID: 123

┌─────────┬──────────┬─────────────────┬─────────┐
│ ITEM    │ CATEGORY │ DESCRIPTION     │ AMOUNT  │
├─────────┼──────────┼─────────────────┼─────────┤
│ 1       │ Loan     │ Pawn Loan       │ $500.00 │
└─────────┴──────────┴─────────────────┴─────────┘

Interest Amount: $50.00
Total Amount: $550.00
Due Date: 12/27/2025
```

Not:
```
Transaction: N/A
Customer: N/A
Loan ID: N/A
Amount: $0.00
```

---

**Need help?** Check the console logs first! They tell you exactly what data the frontend received from the backend.
