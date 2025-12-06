# Loan Interest Discount Feature

## Overview
This feature allows loan officers to manually discount or reduce the interest amount owed on a loan at any time during the loan's lifecycle. This is useful for:
- Settlement negotiations with customers
- Final payments with agreed-upon discounts
- Customer retention promotions
- Disputes resolution

## Example Use Case
- Customer has a $1000 loan at 5% interest = $1050 total payable
- You agree with customer to reduce total to $1030 (discount of $20 on interest)
- Use this feature to apply the discount instantly
- System updates: Interest Amount: $30 (was $50), Total Payable: $1030 (was $1050)

## Frontend Implementation (COMPLETED ✅)

### Files Modified
- `src/ManageCustomerProfileForm.js`

### Changes Made

#### 1. State Management
- Added `discountAmount: ''` to the `loanFormData` state initialization
- Added `'discount'` to the operation type comment

#### 2. User Interface
- **New Button**: Added "🏷️ Discount Interest" button in the active loans action buttons
- **Form Inputs**: Created discount form section with:
  - Display of current interest amount (read-only)
  - Discount amount input field (number, 0-100 scale)
  - Real-time preview of:
    - New Interest Amount (after discount)
    - New Total Payable Amount

#### 3. Form Submission Handler
- Added `discount` case in the `handleLoanFormSubmit` function
- Endpoint: `/customers/{customerId}/loans/{loanId}/discount`
- Payload:
  ```javascript
  {
    discountAmount: number,      // Amount to discount from interest
    userId: string,               // User applying the discount
    username: string              // Username for audit trail
  }
  ```

#### 4. Form Reset
- Added `discountAmount: ''` to form reset operations to clear the field after submission

## Backend Implementation Required

You'll need to implement the following endpoint in your backend:

### Endpoint
```
POST /customers/{customerId}/loans/{loanId}/discount
```

### Request Body
```json
{
  "discountAmount": 20.00,
  "userId": "user123",
  "username": "john_doe"
}
```

### Validation Requirements
1. **Discount Amount Validation**
   - Must be greater than 0
   - Must not exceed the current interest amount
   - Must not be negative

2. **Loan Status Check**
   - Loan must be in "active" status
   - Cannot discount redeemed or forfeited loans

3. **Existing Balance Check**
   - Ensure the discount doesn't create negative interest

### Database Updates Required
When applying a discount, update:

1. **Loan Record**
   - `interest_amount`: Reduce by the discount amount
   - `total_payable_amount`: Recalculate as (loan_amount + new_interest_amount)
   - `remaining_balance`: Recalculate if needed (should remain unchanged from customer's perspective)

2. **Audit Trail** (Recommended)
   - Create a record of the discount transaction for audit purposes
   - Fields: loan_id, discount_amount, applied_by, applied_date, previous_interest, new_interest

### Example Calculation
```
Original Loan:
- Loan Amount: $1000
- Interest Rate: 5%
- Interest Amount: $50
- Total Payable: $1050
- Remaining Balance: $1050

After $20 Discount:
- Loan Amount: $1000 (unchanged)
- Interest Amount: $30 (was $50)
- Total Payable: $1030 (was $1050)
- Remaining Balance: $1030 (was $1050)
```

### Response Expected
```json
{
  "success": true,
  "message": "Discount applied successfully",
  "loan": {
    "id": "loan123",
    "loan_amount": 1000,
    "interest_amount": 30,
    "total_payable_amount": 1030,
    "remaining_balance": 1030,
    "status": "active"
  }
}
```

### Error Responses
- **400 Bad Request**: Invalid discount amount, discount exceeds interest, etc.
- **404 Not Found**: Loan not found
- **409 Conflict**: Loan is not in active status
- **500 Server Error**: Database error

## Features & Behavior

### Real-Time Preview
- As users type the discount amount, the form displays:
  - New interest amount (calculated as: current_interest - discount)
  - New total payable (calculated as: loan_amount + new_interest)

### Validation
- Discount input has `max` attribute set to current interest amount
- Input is `required` to prevent empty submissions
- Minimum value is 0

### User Feedback
- Success message: "✅ Discount completed successfully!"
- Error messages are displayed for any validation/server errors
- Loan details are refreshed after successful discount application

## How to Use (From User Perspective)

1. Search for a customer profile
2. View their active loans
3. Click "🏷️ Discount Interest" button on the loan you want to discount
4. Enter the discount amount in dollars
5. Review the preview showing new interest and total payable
6. Click "✓ Confirm" to apply the discount
7. System confirms the discount has been applied

## Technical Details

### When Discount Can Be Applied
- Only on **active** loans
- Can be applied at any time (not limited to specific loan phases)
- Can be applied before, during, or after payments are made

### Audit Trail
The system tracks:
- User ID and username who applied the discount
- Discount amount
- Date/time of application (backend timestamp)
- Previous and new interest amounts (calculated from loan record)

## Security Considerations

1. **User Authorization**: Ensure only authorized staff can apply discounts
2. **Audit Logging**: All discount operations should be logged
3. **Validation**: Server-side validation is essential (not just client-side)
4. **Rate Limiting**: Consider rate limiting to prevent abuse

## Testing Checklist

- [ ] Apply discount to an active loan
- [ ] Verify loan interest amount decreases by discount amount
- [ ] Verify remaining balance decreases accordingly
- [ ] Try to apply discount exceeding interest amount (should fail)
- [ ] Try to apply negative discount (should fail)
- [ ] Verify discount cannot be applied to redeemed loans
- [ ] Verify discount cannot be applied to forfeited loans
- [ ] Check audit trail logs the discount correctly
- [ ] Verify payment history updates correctly after discount

## Integration Notes

The frontend expects a `/customers/{customerId}/loans/{loanId}/discount` endpoint.

The endpoint should:
1. Validate the discount amount
2. Check loan status
3. Update the loan record with new interest amount
4. Return updated loan details
5. Create an audit entry (if implemented)
6. Return a success response with the updated loan

## Related Features

This discount feature works seamlessly with:
- **Make Payment**: Customer can now pay the discounted total
- **Redeem Loan**: Customers redeem at the new discounted total
- **Payment History**: Shows payments against the new balance

## Future Enhancements

Consider adding:
- Discount approval workflow (request → approve → apply)
- Discount reason tracking (e.g., "Settlement", "Promotion", "Dispute Resolution")
- Bulk discounts for multiple loans
- Discount limits per user per day
- Discount analytics and reporting
