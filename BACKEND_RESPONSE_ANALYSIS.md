# 🔧 Backend Response Analysis - Why PDF Values Might Be Wrong

## 📤 What Your Backend Returns

When you create a loan, your backend (`server.js` line 540) returns:

```json
{
  "loan": {
    "id": 123,
    "first_name": "John",
    "last_name": "Doe",
    "email": "john@example.com",
    "home_phone": "905-123-4567",
    "mobile_phone": "905-987-6543",
    "birthdate": "1990-01-15",
    "id_type": "Driver License",
    "id_number": "D1234567",
    "referral": "Friend",
    "identification_info": "Valid ID",
    "street_address": "123 Main St",
    "city": "Brampton",
    "state": "ON",
    "zipcode": "L6W 4K6",
    "customer_number": "CUST-001",
    "loan_amount": 500,
    "interest_rate": 10,
    "interest_amount": 50,
    "total_payable_amount": 550,
    "loan_issued_date": "2025-11-27",
    "loan_term": "30 days",
    "due_date": "2025-12-27",
    "transaction_number": "TXN-2025-001",
    "status": "active",
    "collateral_description": "Gold Ring",
    "customer_note": "Good customer",
    "remaining_balance": 550,
    "created_by": null,
    "created_by_user_id": 1,
    "created_by_username": "admin",
    "item_category": "Jewelry",
    "item_description": "14K Gold Ring",
    "created_at": "2025-11-27T10:30:00.000Z",
    "updated_at": "2025-11-27T10:30:00.000Z"
  },
  "pdf_url": "/loan-pdf/123"
}
```

## ✅ Frontend Expects These Fields for PDF

The PDF code in `CreateLoanForm.js` looks for:

```javascript
// REQUIRED for PDF to work:
loanData.first_name           ← Customer first name
loanData.last_name            ← Customer last name
loanData.id                   ← Loan ID
loanData.transaction_number   ← Transaction number
loanData.loan_amount          ← Loan amount
loanData.interest_amount      ← Interest amount
loanData.total_payable_amount ← Total payable
loanData.due_date             ← Due date
loanData.customer_name        ← Optional: Full name
```

## 🐛 Common Problems & Solutions

### Problem 1: `first_name` is NULL in Database

**Symptom**: PDF shows "N/A" for customer name

**Check**:
```sql
SELECT first_name, last_name FROM customers WHERE id = 1;
-- Returns: NULL | NULL
```

**Solution**:
1. Verify you're sending customer data to backend
2. Check frontend form is filling in name fields
3. Verify backend is storing it: `INSERT INTO customers (..., first_name, ...)`

**Backend code** (server.js ~line 440):
```javascript
const query = `INSERT INTO customers (
  first_name,  ← Make sure this is included
  last_name,
  email,
  ...
) VALUES ($1, $2, ...) RETURNING *`;
```

### Problem 2: `loan_amount` is 0 or NULL

**Symptom**: PDF shows "$0.00" for amount

**Check**:
```sql
SELECT loan_amount FROM loans WHERE id = 123;
-- Returns: 0 or NULL
```

**Solution**:
1. When creating loan, pass `loan_amount: 500` (not `loanAmount`)
2. Backend receives and maps it
3. Verify calculation: `parseFloat(loanAmount || 0)`

**Frontend sends** (CreateLoanForm.js):
```javascript
const loanData = {
  firstName: "John",    ← Frontend sends camelCase
  lastName: "Doe",
  loanAmount: 500,      ← This is the amount
  interestRate: 10,
  ...
};

await http.post('/create-loan', loanData);
```

**Backend receives and maps** (server.js):
```javascript
const mapped = validators.mapRequestToDb(req.body);
// Converts loanAmount → loan_amount
```

**Backend stores**:
```javascript
const query = `INSERT INTO loans (..., loan_amount, ...) 
               VALUES (..., $X, ...) RETURNING *`;
```

### Problem 3: `due_date` is empty

**Symptom**: PDF shows blank for due date

**Check**:
```sql
SELECT due_date FROM loans WHERE id = 123;
-- Returns: NULL or blank
```

**Solution**:
1. Calculate due_date if not provided
2. Format it correctly: YYYY-MM-DD
3. Make sure it's included in RETURNING clause

**Backend code** (server.js ~line 390-400):
```javascript
// If due_date not provided, calculate it
let dueDate;
if (inputDueDate) {
  dueDate = inputDueDate;
} else {
  // Calculate based on loan term
  const termDays = parseInt(loanTerm) || 30;
  const date = new Date();
  date.setDate(date.getDate() + termDays);
  dueDate = date.toISOString().slice(0, 10);  // YYYY-MM-DD
}
```

### Problem 4: `transaction_number` is missing

**Symptom**: PDF shows "N/A" for transaction ID

**Check**:
```sql
SELECT transaction_number FROM loans WHERE id = 123;
-- Returns: NULL
```

**Solution**:
1. Generate transaction number if not provided
2. Make it unique
3. Store in database

**Backend code** (server.js ~line 400):
```javascript
const transactionNumber = inputTransactionNumber || 
  Math.floor(Math.random() * 1000000000).toString();
// Or: `TXN-${Date.now()}`

// Then include in INSERT:
const query = `INSERT INTO loans (..., transaction_number, ...) 
               VALUES (..., $X, ...) RETURNING *`;
```

---

## 🔍 How to Verify Backend Response

### Method 1: Browser Developer Tools

1. **Create a loan** through web app
2. **Open DevTools** (F12)
3. **Network tab** → Refresh
4. **Find** `POST /create-loan`
5. **Click it** → **Response tab**

**Should see**:
```json
{
  "loan": {
    "first_name": "John",
    "loan_amount": 500,
    "due_date": "2025-12-27",
    "transaction_number": "TXN-123456",
    ...
  }
}
```

**If you see NULL or missing fields**: Backend query isn't returning them

### Method 2: Backend Logs

Add console.log to backend before sending response:

```javascript
// In server.js, before res.status(201).json(...)

console.log('About to return loan:', {
  id: result.rows[0].id,
  first_name: result.rows[0].first_name,
  loan_amount: result.rows[0].loan_amount,
  due_date: result.rows[0].due_date,
  transaction_number: result.rows[0].transaction_number
});

res.status(201).json({ loan, pdf_url: `/loan-pdf/${result.rows[0].id}` });
```

Then run:
```powershell
cd C:\Users\HP\pawn-flow
node server.js  # Watch console for logs
```

Create a loan and check console output.

### Method 3: Direct Database Query

```powershell
# Connect to PostgreSQL
psql -U postgres -d pawn_shop

# Check most recent loan
SELECT id, first_name, last_name, loan_amount, due_date, transaction_number 
FROM loans 
ORDER BY created_at DESC 
LIMIT 1;
```

---

## ✅ Data Flow Checklist

```
Frontend Form
  ↓ (user fills in: firstName, loanAmount, etc)
  ↓
POST /create-loan
  ↓ (sends camelCase JSON)
  ↓
Backend mapRequestToDb()
  ↓ (converts to snake_case)
  ↓
Database INSERT
  ↓ (INSERT INTO loans VALUES (...) RETURNING *)
  ↓
Frontend receives response.data.loan
  ↓ (accesses: first_name, loan_amount, etc)
  ↓
PDF Code (CreateLoanForm.js line 175)
  ↓ (extracts: firstName, loanAmt, etc)
  ↓
PDF Displays ✅ or N/A ❌
```

---

## 🚨 Most Common Issues (In Order)

1. **Backend not including field in RETURNING clause**
   - Solution: Add `RETURNING *` to INSERT query
   
2. **Frontend not sending field**
   - Solution: Check form passes value to createLoan()
   
3. **Database column doesn't exist**
   - Solution: Add column: `ALTER TABLE loans ADD COLUMN field_name TYPE;`
   
4. **Calculation logic wrong**
   - Solution: Verify math: `(amount * rate) / 100`
   
5. **Date formatting incorrect**
   - Solution: Use format: `YYYY-MM-DD` consistently

---

## 🧪 Test With Known Values

**Create loan with**:
- Name: "TEST USER"
- Amount: $500.00
- Interest: 10%
- Expected Interest: $50.00
- Expected Total: $550.00
- Days: 30

**Check in PDF**:
- ✅ Name shows as "TEST USER"
- ✅ Amount shows as "$500.00"
- ✅ Interest shows as "$50.00"
- ✅ Total shows as "$550.00"

If any show as $0.00 or N/A → That field isn't in database response

---

## 💡 Pro Tips

1. **Always use RETURNING * in PostgreSQL queries**
   - Returns all columns, even calculated ones
   
2. **Verify field names match everywhere**
   - Frontend form → Backend mapping → Database column → Response
   
3. **Test with realistic data**
   - Don't test with empty or zero values
   - Use actual amounts and dates
   
4. **Check console logs consistently**
   - Frontend: F12 → Console (shows extracted values)
   - Backend: Terminal where node runs (shows DB results)
   - Database: pgAdmin or psql (shows actual stored values)

5. **Database queries must include all fields**
   - Bad: `SELECT id, first_name FROM loans`
   - Good: `SELECT * FROM loans` or `SELECT id, first_name, last_name, loan_amount, due_date FROM loans`
