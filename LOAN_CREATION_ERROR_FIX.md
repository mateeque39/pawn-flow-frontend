# Loan Creation 404 Error - Troubleshooting & Fix

## Error Summary

**Error:** `POST /customers/2/loans` returns **404 (Not Found)**

**When it occurs:** When trying to create a new loan in ManageCustomerProfileForm after selecting a customer.

**Console logs:**
```
Failed to load resource: the server responded with a status of 404 (Not Found)
[WARN] API POST /customers/2/loans - 404 (38ms)
[ERROR] /customers/2/loans: Request failed with status code 404
```

---

## Root Cause Analysis

### Frontend Status ✅
- ✅ Frontend is correctly using the endpoint: `POST /customers/{customerId}/loans`
- ✅ Customer ID 2 is being correctly passed
- ✅ Loan payload is properly formatted (see below)
- ✅ Backend API is reachable on `http://localhost:5000`

### Backend Issue 🔴
The backend is returning **404 (Not Found)** which typically means:
1. **Endpoint not implemented** - Backend doesn't have `POST /customers/{customerId}/loans` route
2. **Customer not found** - Backend validates customer exists and customer 2 doesn't exist  
3. **Wrong HTTP method** - Backend expects GET/PUT instead of POST
4. **Route/Controller error** - There's a routing configuration issue on backend

---

## Expected Loan Creation Payload

The frontend sends this payload when creating a loan for customer 2:

```json
{
  "loanAmount": 500,
  "interestRate": 5,
  "itemDescription": "Diamond Ring",
  "customerNote": "Rush processing",
  "loanTerm": 30,
  "loanIssuedDate": "2025-11-24",
  "dueDate": "2025-12-24",
  "createdByUserId": "user-1",
  "createdByUsername": "manager"
}
```

**Notes:**
- Customer data (name, phone, etc.) is NOT in loan payload - only loan details
- Customer ID comes from the URL path: `/customers/2/loans`
- User info from logged-in user

---

## Troubleshooting Steps

### Step 1: Verify Backend Endpoint Exists

**Option A: Check Backend Code**
Look for a route handler like:
```javascript
// Example (Node.js/Express)
app.post('/customers/:customerId/loans', createLoan);

// Or Python/Flask
@app.route('/customers/<int:customerId>/loans', methods=['POST'])
def create_loan(customerId):
```

**Option B: Test Endpoint with curl**
```powershell
# Test if endpoint exists
curl -X POST http://localhost:5000/customers/2/loans `
  -H "Content-Type: application/json" `
  -d '{"loanAmount": 100, "interestRate": 5, "itemDescription": "Test", "loanTerm": 30, "loanIssuedDate": "2025-11-24", "dueDate": "2025-12-24"}'
```

### Step 2: Check Customer Exists

**If you get 404, first verify customer 2 exists:**

```powershell
# Test customer endpoint
curl http://localhost:5000/customers/2
```

Expected: Returns customer data (200 OK)
If 404: Customer doesn't exist - create a customer first via frontend

### Step 3: Check Backend Logs

**Look in backend console/logs for:**
- Route not found errors
- Controller errors
- Validation errors
- Database errors

**Example error messages:**
```
Error: Route '/customers/:customerId/loans' not found
Error: POST /customers/2/loans - Cannot POST
Error: Customer 2 not found
```

### Step 4: Verify CORS Configuration

**Check if backend CORS allows POST:**
```
Access-Control-Allow-Methods: POST, GET, PUT, DELETE, OPTIONS
```

---

## Common Backend Issues & Fixes

### Issue 1: Endpoint Not Implemented

**Symptom:** All POST requests to `/customers/{id}/loans` return 404

**Fix:** Backend needs to implement the endpoint:

**Node.js/Express:**
```javascript
app.post('/customers/:customerId/loans', (req, res) => {
  const { customerId } = req.params;
  const { loanAmount, interestRate, itemDescription, loanTerm, loanIssuedDate, dueDate, createdByUserId, createdByUsername } = req.body;
  
  // Validate customer exists
  // Create loan in database
  // Return loan data
  res.json({ loan: { id: 101, customerId, loanAmount, ... } });
});
```

**Python/Flask:**
```python
@app.route('/customers/<int:customerId>/loans', methods=['POST'])
def create_loan(customerId):
    data = request.json
    # Validate customer exists
    # Create loan in database
    return jsonify({ 'loan': { 'id': 101, 'customerId': customerId, ... } }), 201
```

### Issue 2: Customer Doesn't Exist

**Symptom:** POST to `/customers/2/loans` returns 404, but customer creation works

**Fix:** Create a customer first before creating a loan:

1. Go to "Create Customer Profile" in frontend
2. Fill in customer details and submit
3. Note the Customer ID returned
4. Use that ID to create a loan

**Example workflow:**
```
1. Create Customer → Returns: Customer ID = 5
2. Select Customer ID 5 in Manage Profile
3. Create Loan for Customer 5 → Should succeed
```

### Issue 3: Backend Not Running

**Symptom:** Connection refused or timeout

**Fix:** Ensure backend is running:
```powershell
# Check if backend is running on port 5000
Test-NetConnection -ComputerName localhost -Port 5000

# Check running processes
netstat -ano | Select-String ':5000'
```

---

## Verification Checklist

Before creating a loan, verify all these items:

- [ ] **Backend running** - `http://localhost:5000` responds
- [ ] **Customer exists** - Can search for customer in frontend
- [ ] **Customer selected** - Showing in ManageCustomerProfileForm
- [ ] **Endpoint implemented** - Backend has POST `/customers/{id}/loans`
- [ ] **Payload format correct** - Sending all required fields
- [ ] **CORS configured** - Backend allows POST from http://localhost:3001
- [ ] **Database writable** - Backend can write to database
- [ ] **API logs checked** - No errors in backend logs

---

## Next Steps

### If Backend Endpoint Not Implemented:

1. **Get Backend Code** - Find the backend repository/source
2. **Implement Endpoint** - Add POST `/customers/{customerId}/loans`
3. **Test with curl** - Verify it works before frontend testing
4. **Frontend Test** - Retry loan creation

### If Backend Endpoint Exists but Still 404:

1. Check backend error logs - look for specific error message
2. Verify customer exists - `GET /customers/2` should return 200
3. Check request body - log what frontend is sending
4. Test with curl using exact same payload
5. Verify routing configuration in backend

### If All Else Fails:

1. Check backend framework documentation for routing (Express, Flask, Django, etc.)
2. Ensure route is registered/loaded when app starts
3. Check for typos in route definition
4. Verify HTTP method is POST (not GET, PUT, etc.)
5. Check for middleware interfering with routing

---

## Frontend Code Reference

**File:** `ManageCustomerProfileForm.js`
**Line:** ~146 (handleLoanOperation function)

```javascript
if (operationType === 'create') {
  endpoint = `/customers/${selectedProfile.id}/loans`;  // ← Uses this endpoint
  payload = {
    loanAmount: parseFloat(loanFormData.loanAmount),
    interestRate: parseFloat(loanFormData.interestRate),
    itemDescription: loanFormData.collateralDescription,
    customerNote: loanFormData.customerNote,
    loanTerm: parseInt(loanFormData.loanTerm),
    loanIssuedDate,
    dueDate: dueDate.toISOString().split('T')[0],
    createdByUserId: loggedInUser?.id,
    createdByUsername: loggedInUser?.username
  };
}

const response = await http.post(endpoint, payload);  // ← Makes POST request
```

---

## Testing Checklist

### Test 1: Verify Backend Connectivity
```powershell
# Should respond with customer data
curl http://localhost:5000/customers/2
```

**Expected Response:** 200 OK with customer JSON

### Test 2: Test Loan Creation Endpoint
```powershell
$body = @{
    loanAmount = 500
    interestRate = 5
    itemDescription = "Test Item"
    loanTerm = 30
    loanIssuedDate = "2025-11-24"
    dueDate = "2025-12-24"
    createdByUserId = "user1"
    createdByUsername = "testuser"
} | ConvertTo-Json

curl -X POST http://localhost:5000/customers/2/loans `
  -H "Content-Type: application/json" `
  -d $body
```

**Expected Response:** 201 Created with new loan data (or 200 OK)

### Test 3: Frontend UI Test
1. Go to `http://localhost:3001`
2. Login
3. Click "Manage Profile & Loans"
4. Search for customer (or create one)
5. Click "Create New Loan"
6. Fill form and submit
7. Should see success message, not error

---

## API Response Format

**Successful Loan Creation (Backend should return):**
```json
{
  "id": 101,
  "customerId": 2,
  "loanAmount": 500,
  "interestRate": 5,
  "status": "active",
  "createdAt": "2025-11-24T22:16:12.000Z",
  ...
}
```

Or wrapped in success object:
```json
{
  "success": true,
  "data": { "loan": {...} },
  "message": "Loan created successfully"
}
```

---

## Summary

| Component | Status | Issue |
|-----------|--------|-------|
| Frontend App | ✅ Working | None - correctly implemented |
| Frontend Endpoint | ✅ Correct | Using `/customers/2/loans` |
| Frontend Payload | ✅ Valid | All required fields included |
| Backend Connectivity | ✅ OK | Port 5000 is accessible |
| Backend Endpoint | 🔴 **404** | **NOT FOUND** - needs implementation or verification |
| Customer Data | ❓ Unknown | May or may not exist (verify with GET /customers/2) |

---

## Questions for Backend Team

1. Is the `POST /customers/{customerId}/loans` endpoint implemented?
2. Does customer ID 2 exist in the database?
3. What exact error is the backend logging for this request?
4. What is the expected request/response format?
5. Are there any authentication/authorization requirements?

