# End-to-End Testing Guide - Loan Discount Feature

## Quick Start: Test the Feature Now

### Prerequisites
- Frontend running (http://localhost:3000)
- Backend running (http://localhost:3001)
- Database connected with test data

### Database Setup (First Time Only)
Run the migration to create the discount_logs table:

```bash
# Option 1: PostgreSQL CLI
psql -U postgres -d pawn_shop -f migrations/001_create_discount_logs_table.sql

# Option 2: Using connection string
psql "$DATABASE_URL" -f migrations/001_create_discount_logs_table.sql
```

---

## Test Workflow

### Test 1: Basic Discount Application ✅

**Objective**: Apply a simple $20 discount to a $50 interest loan

**Steps**:
1. Open browser → http://localhost:3000
2. Login with your credentials
3. Go to "Manage Customer Profile & Loans"
4. Search for any customer with active loans
5. Select a customer
6. Find an active loan
7. Click "🏷️ Discount Interest" button
8. Enter discount: **20**
9. Review preview:
   - Current Interest: $50.00
   - New Interest: $30.00
   - New Total: $1030.00
10. Click "✓ Confirm"

**Expected Result**:
- ✅ Success message appears
- ✅ Loan details refresh
- ✅ Interest amount updates to $30.00
- ✅ Total payable updates to $1030.00
- ✅ Remaining balance updates to $1030.00

**Backend Verification**:
```bash
# Check database
psql pawn_shop
SELECT * FROM loans WHERE id = <loan_id>;
-- Look for updated interest_amount, total_payable_amount, last_discounted_at

SELECT * FROM discount_logs ORDER BY created_at DESC LIMIT 1;
-- Verify discount was logged
```

---

### Test 2: Full Discount (Interest = Discount) ✅

**Objective**: Apply discount equal to entire interest amount

**Steps**:
1. Find loan with $50 interest
2. Click "🏷️ Discount Interest"
3. Enter discount: **50** (entire interest)
4. Verify preview shows:
   - New Interest: $0.00
   - New Total: $1000.00
5. Click "✓ Confirm"

**Expected Result**:
- ✅ Discount applied successfully
- ✅ Interest becomes $0.00
- ✅ Total becomes $1000.00 (just principal)
- ✅ Customer can now pay just principal

---

### Test 3: Insufficient Funds Display ❌

**Objective**: Try to discount more than interest (should fail)

**Steps**:
1. Find loan with $50 interest
2. Click "🏷️ Discount Interest"
3. Try to enter: **100** (more than $50 interest)
4. Form should prevent this or show error

**Expected Result**:
- ✅ Form validation prevents entry OR
- ✅ Backend returns 400 error:
  ```json
  {
    "message": "Discount amount ($100.00) cannot exceed current interest ($50.00)"
  }
  ```

---

### Test 4: Invalid Discount Amount ❌

**Objective**: Try invalid discount amounts

**Scenarios**:

#### Scenario A: Zero Amount
```
Enter: 0
Expected: Error "Discount amount must be greater than 0"
```

#### Scenario B: Negative Amount
```
Enter: -20
Expected: Form validation prevents or error message
```

#### Scenario C: Non-numeric
```
Enter: "abc"
Expected: Form validation prevents (type="number")
```

---

### Test 5: Non-Active Loan ❌

**Objective**: Try to discount redeemed or forfeited loan

**Steps**:
1. Find a redeemed loan
2. Scroll to action buttons
3. Notice "🏷️ Discount Interest" button is NOT visible (only shows for active loans)

**OR manually test via API**:
```bash
curl -X POST http://localhost:3001/customers/1/loans/999/discount \
  -H "Content-Type: application/json" \
  -d '{"discountAmount": 20, "userId": "test", "username": "test"}'

# Expected: 409 Conflict
# "Cannot discount redeemed loans. Only active loans can be discounted."
```

---

### Test 6: Discount Then Payment ✅

**Objective**: Verify payment works correctly after discount

**Steps**:
1. Apply $20 discount to loan with $50 interest
   - New total becomes $1030
2. Click "💳 Make Payment" on same loan
3. Enter payment amount: **1030**
4. Select payment method: Cash
5. Click "✓ Confirm"

**Expected Result**:
- ✅ Payment accepted
- ✅ Remaining balance becomes $0
- ✅ Loan auto-redeems with message "🎉 Loan fully paid and automatically redeemed!"

---

### Test 7: Multiple Discounts ✅

**Objective**: Apply multiple discounts to same loan over time

**Steps**:
1. Apply first discount: **10**
   - Interest: $50 → $40
   - Total: $1050 → $1040
2. Apply second discount: **15**
   - Interest: $40 → $25
   - Total: $1040 → $1025
3. Apply third discount: **25**
   - Interest: $25 → $0
   - Total: $1025 → $1000

**Expected Result**:
- ✅ Each discount applies correctly
- ✅ Running total decreases each time
- ✅ All three logged in discount_logs table

**Verify**:
```sql
SELECT COUNT(*) as discount_count FROM discount_logs WHERE loan_id = <loan_id>;
-- Should return 3
```

---

### Test 8: Audit Trail ✅

**Objective**: Verify discount logging

**Steps**:
1. Apply a discount
2. Check database:

```bash
psql pawn_shop

-- View all discounts
SELECT * FROM discount_logs ORDER BY created_at DESC;

-- View this loan's discounts
SELECT * FROM discount_logs WHERE loan_id = <loan_id>;

-- Check user tracking
SELECT applied_by_username, COUNT(*) FROM discount_logs 
GROUP BY applied_by_username;
```

**Expected Result**:
- ✅ New row in discount_logs table
- ✅ All fields populated correctly
- ✅ Discount amount, user, and timestamp recorded
- ✅ Previous and new values stored

---

### Test 9: PDF Generation ✅

**Objective**: Generate loan PDF after discount

**Steps**:
1. Apply discount to a loan
2. Go back to loan details
3. Look for PDF download link
4. Download or view PDF

**Expected Result**:
- ✅ PDF generated successfully
- ✅ Shows discounted amounts (not original)
- ✅ PDF is accurate and readable

---

### Test 10: API Direct Testing ✅

**Objective**: Test endpoint directly with curl

#### Successful Discount
```bash
curl -X POST http://localhost:3001/customers/1/loans/1/discount \
  -H "Content-Type: application/json" \
  -d '{
    "discountAmount": 20.00,
    "userId": "user123",
    "username": "john_doe"
  }'

# Expected: 200 OK with success response
```

**Check Response**:
```json
{
  "success": true,
  "message": "✅ Discount of $20.00 applied successfully!",
  "loan": {...updated loan...},
  "discount": {
    "amount": "20.00",
    "previousInterest": "50.00",
    "newInterest": "30.00"
  }
}
```

#### Failed Discount (Exceeds Interest)
```bash
curl -X POST http://localhost:3001/customers/1/loans/1/discount \
  -H "Content-Type: application/json" \
  -d '{"discountAmount": 100, "userId": "test", "username": "test"}'

# Expected: 400 Bad Request
```

---

## Verification Checklist

### Frontend
- [ ] "🏷️ Discount Interest" button appears on active loans
- [ ] Form appears when button clicked
- [ ] Current interest displayed correctly
- [ ] Discount input field works
- [ ] Real-time preview shows new amounts
- [ ] Form validation prevents invalid amounts
- [ ] Success message appears after discount
- [ ] Loan details refresh with new amounts
- [ ] Button disabled during processing

### Backend
- [ ] Endpoint responds to POST request
- [ ] Validates discount amount correctly
- [ ] Checks loan status (active only)
- [ ] Updates database correctly
- [ ] Returns success response with updated loan
- [ ] Error responses are appropriate
- [ ] All error cases handled gracefully

### Database
- [ ] discount_logs table created
- [ ] Discount entries logged correctly
- [ ] loans table columns updated (last_discounted_at, last_discounted_by)
- [ ] All required fields populated
- [ ] Timestamps recorded correctly
- [ ] References maintained (foreign keys)

### Integration
- [ ] Frontend sends correct payload
- [ ] Backend receives and parses correctly
- [ ] Frontend displays response correctly
- [ ] Multiple operations in sequence work
- [ ] Payment works after discount
- [ ] Redemption works after discount
- [ ] No side effects on other features

---

## Common Issues & Solutions

### Issue: "relation 'discount_logs' does not exist"
**Solution**: Run database migration
```bash
psql pawn_shop -f migrations/001_create_discount_logs_table.sql
```

### Issue: Discount button doesn't appear
**Solution**: 
- Ensure loan status is "active" (check database)
- Clear browser cache (Ctrl+Shift+Delete)
- Check browser console for errors

### Issue: "Cannot discount redeemed loans" error
**Solution**: Only active loans can be discounted. Try a different loan.

### Issue: Discount form calculation is wrong
**Solution**: 
- Check browser developer tools (F12) for JavaScript errors
- Refresh page
- Check that loan interest_amount is correct

### Issue: Database migration fails
**Solution**:
- Ensure PostgreSQL is running
- Check connection string
- Verify tables already exist (may already be set up)

### Issue: API returns 500 error
**Solution**:
- Check server console logs
- Verify database connection
- Ensure discount_logs table exists
- Check for SQL errors

---

## Performance Testing

### Load Test: Apply 100 Discounts
```bash
# Run in bash
for i in {1..100}; do
  curl -X POST http://localhost:3001/customers/1/loans/1/discount \
    -H "Content-Type: application/json" \
    -d '{"discountAmount": 0.01, "userId": "test", "username": "load_test"}'
done
```

**Expected**: All complete within reasonable time, no timeouts

---

## Final Validation

### When Testing is Complete, Verify:
- [ ] Frontend working as expected
- [ ] Backend responding correctly
- [ ] Database logging all discounts
- [ ] Error cases handled gracefully
- [ ] Performance acceptable
- [ ] No broken features
- [ ] Ready for production deployment

---

## Next Steps After Testing

1. ✅ Run all tests in this guide
2. ✅ Verify all checkboxes pass
3. ✅ Fix any issues found
4. ✅ Code review if applicable
5. ✅ Deploy to staging environment
6. ✅ Test in staging
7. ✅ Deploy to production
8. ✅ Monitor for errors
9. ✅ Train staff on feature

---

**Testing Status**: Ready to Begin
**Estimated Time**: 30-45 minutes
**Difficulty**: Beginner-Friendly

Start with Test 1 and work through in order! 🚀
