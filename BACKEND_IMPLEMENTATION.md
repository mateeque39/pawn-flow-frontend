# Backend Implementation Guide - Loan Interest Discount Feature

## Quick Summary
The frontend is ready to handle loan interest discounts. You need to implement ONE endpoint on the backend to complete this feature.

## Endpoint Specification

### Route
```
POST /customers/:customerId/loans/:loanId/discount
```

### Request Parameters
- **customerId** (URL parameter): Customer ID from path
- **loanId** (URL parameter): Loan ID from path

### Request Body
```json
{
  "discountAmount": 20.00,
  "userId": "user123", 
  "username": "john_doe"
}
```

### Field Descriptions
- `discountAmount`: (Number) Amount to reduce from the interest. Must be positive and not exceed current interest.
- `userId`: (String) ID of the user applying the discount (for audit trail)
- `username`: (String) Username of the user applying the discount (for audit trail)

## Implementation Steps

### 1. Input Validation
```javascript
// Validate discount amount
if (!discountAmount || discountAmount <= 0) {
  return res.status(400).json({ 
    error: 'Discount amount must be greater than 0' 
  });
}

// Get current loan
const loan = await Loan.findById(loanId);
if (!loan) {
  return res.status(404).json({ error: 'Loan not found' });
}

// Check loan status
if (loan.status.toLowerCase() !== 'active') {
  return res.status(409).json({ 
    error: `Cannot discount ${loan.status} loans. Only active loans can be discounted.` 
  });
}

// Validate discount doesn't exceed interest
if (discountAmount > loan.interest_amount) {
  return res.status(400).json({ 
    error: `Discount amount ($${discountAmount}) cannot exceed current interest ($${loan.interest_amount})` 
  });
}
```

### 2. Calculate New Values
```javascript
const previousInterest = loan.interest_amount;
const newInterest = previousInterest - discountAmount;
const newTotalPayable = loan.loan_amount + newInterest;

// remaining_balance should decrease by the discount amount too
const newRemainingBalance = loan.remaining_balance - discountAmount;
```

### 3. Update Database
```javascript
// Update the loan record
const updatedLoan = await Loan.findByIdAndUpdate(
  loanId,
  {
    interest_amount: newInterest,
    total_payable_amount: newTotalPayable,
    remaining_balance: newRemainingBalance,
    // Optional: Add discount tracking fields
    last_discounted_at: new Date(),
    last_discounted_by: userId
  },
  { new: true }
);
```

### 4. Create Audit Entry (Recommended)
```javascript
// Create discount transaction record for audit trail
const discountTransaction = new DiscountTransaction({
  loan_id: loanId,
  customer_id: customerId,
  discount_amount: discountAmount,
  applied_by_user_id: userId,
  applied_by_username: username,
  applied_date: new Date(),
  previous_interest_amount: previousInterest,
  new_interest_amount: newInterest,
  previous_total_payable: loan.total_payable_amount,
  new_total_payable: newTotalPayable,
  notes: `Interest discount applied: $${previousInterest} → $${newInterest}`
});

await discountTransaction.save();
```

### 5. Send Response
```javascript
res.json({
  success: true,
  message: 'Discount applied successfully',
  loan: {
    id: updatedLoan._id,
    transaction_number: updatedLoan.transaction_number,
    loan_amount: updatedLoan.loan_amount,
    interest_rate: updatedLoan.interest_rate,
    interest_amount: updatedLoan.interest_amount,
    total_payable_amount: updatedLoan.total_payable_amount,
    remaining_balance: updatedLoan.remaining_balance,
    status: updatedLoan.status,
    discount_applied: discountAmount
  }
});
```

## Error Handling

Return appropriate HTTP status codes:

| Scenario | Status | Message |
|----------|--------|---------|
| Invalid discount amount | 400 | Discount amount must be greater than 0 |
| Discount exceeds interest | 400 | Discount cannot exceed current interest |
| Loan not found | 404 | Loan not found |
| Loan not active | 409 | Cannot discount non-active loans |
| Database error | 500 | Server error |

## Example Implementation (Express.js)

```javascript
// POST /customers/:customerId/loans/:loanId/discount
router.post('/customers/:customerId/loans/:loanId/discount', async (req, res) => {
  try {
    const { customerId, loanId } = req.params;
    const { discountAmount, userId, username } = req.body;

    // 1. Validate input
    if (!discountAmount || discountAmount <= 0) {
      return res.status(400).json({ 
        error: 'Discount amount must be greater than 0' 
      });
    }

    // 2. Find and validate loan
    const loan = await Loan.findById(loanId);
    
    if (!loan) {
      return res.status(404).json({ error: 'Loan not found' });
    }

    if (loan.customer_id.toString() !== customerId) {
      return res.status(403).json({ 
        error: 'Loan does not belong to this customer' 
      });
    }

    if (loan.status.toLowerCase() !== 'active') {
      return res.status(409).json({ 
        error: `Cannot discount ${loan.status} loans` 
      });
    }

    if (discountAmount > loan.interest_amount) {
      return res.status(400).json({ 
        error: `Discount amount cannot exceed current interest` 
      });
    }

    // 3. Calculate new values
    const previousInterest = loan.interest_amount;
    const newInterest = previousInterest - discountAmount;
    const newTotalPayable = loan.loan_amount + newInterest;
    const newRemainingBalance = loan.remaining_balance - discountAmount;

    // 4. Update loan
    const updatedLoan = await Loan.findByIdAndUpdate(
      loanId,
      {
        interest_amount: newInterest,
        total_payable_amount: newTotalPayable,
        remaining_balance: Math.max(0, newRemainingBalance),
        last_discounted_at: new Date(),
        last_discounted_by: userId
      },
      { new: true }
    );

    // 5. Create audit entry
    await DiscountLog.create({
      loan_id: loanId,
      customer_id: customerId,
      discount_amount: discountAmount,
      applied_by: userId,
      applied_by_username: username,
      previous_interest: previousInterest,
      new_interest: newInterest,
      timestamp: new Date()
    });

    // 6. Return response
    res.json({
      success: true,
      message: 'Discount applied successfully',
      loan: updatedLoan
    });

  } catch (error) {
    console.error('Error applying discount:', error);
    res.status(500).json({ 
      error: 'Failed to apply discount',
      details: error.message 
    });
  }
});
```

## Database Schema Updates (If Using MongoDB)

### Loan Collection - Add Optional Fields
```javascript
{
  // ... existing fields
  interest_amount: Number,           // Updated by discount
  total_payable_amount: Number,      // Updated by discount
  remaining_balance: Number,         // Updated by discount
  
  // New audit fields
  last_discounted_at: Date,          // When discount was last applied
  last_discounted_by: String,        // User ID who applied discount
}
```

### New Collection - DiscountLog (Optional but Recommended)
```javascript
{
  _id: ObjectId,
  loan_id: ObjectId,
  customer_id: ObjectId,
  discount_amount: Number,
  applied_by: String,                // User ID
  applied_by_username: String,       // Username
  previous_interest_amount: Number,
  new_interest_amount: Number,
  applied_at: Date,
  notes: String                      // Optional notes about discount
}
```

## Testing the Endpoint

### Using cURL
```bash
curl -X POST http://localhost:3001/customers/123/loans/456/discount \
  -H "Content-Type: application/json" \
  -d '{
    "discountAmount": 20.00,
    "userId": "user123",
    "username": "john_doe"
  }'
```

### Using Postman
1. Set method to POST
2. URL: `http://localhost:3001/customers/:customerId/loans/:loanId/discount`
3. Headers: `Content-Type: application/json`
4. Body (raw JSON):
```json
{
  "discountAmount": 20.00,
  "userId": "user123",
  "username": "john_doe"
}
```

## Integration with Existing Features

### Payment Processing
After discount is applied, the customer sees the new remaining balance:
- Customer payment against discounted amount works normally
- Example: $20 discount reduces remaining balance from $1050 to $1030
- Payment of $1030 now fully redeems the loan

### Loan Status
- Discount does NOT change loan status (remains "active")
- Loan can still be redeemed, extended, or forfeited after discount

### Payment History
- Existing payments are not affected
- New payments are credited against the discounted total

## Security Considerations

1. **Authorization Check**: Verify user has permission to apply discounts
2. **Audit Trail**: Always log who applied the discount and when
3. **Validation**: Validate all inputs server-side (not just client-side)
4. **Customer Notification**: Consider notifying customer of discount via email/SMS
5. **Approval Workflow**: For larger discounts, consider requiring approval

## Monitoring & Logging

Track discount metrics:
- Total discounts applied per user
- Average discount amount
- Discounts by reason (if collecting reason)
- High-value discounts for review

Example logging:
```javascript
logger.info('Loan discount applied', {
  loanId,
  customerId,
  discountAmount,
  appliedBy: userId,
  previousInterest,
  newInterest,
  timestamp: new Date()
});
```

## Success Indicators

Your implementation is complete when:
- ✅ Frontend sends discount request to backend
- ✅ Backend validates discount amount
- ✅ Backend updates loan interest and total payable
- ✅ Frontend receives updated loan details
- ✅ UI refreshes to show new amounts
- ✅ Error messages display for invalid discounts
- ✅ Discount is logged for audit trail
- ✅ Customer can pay the new discounted total
