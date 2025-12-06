# Loan Interest Discount Feature - User Guide

## Feature Overview

The **Discount Interest** feature allows you to reduce the interest amount owed on any active loan at any time. This is perfect for:
- Negotiated settlements
- Final payment deals
- Customer retention offers
- Dispute resolutions

## How to Apply a Discount

### Step 1: Search for Customer
1. Go to "Manage Customer Profile & Loans"
2. Search for the customer using:
   - Phone number
   - Name
   - Customer ID
3. Select the customer from the results

### Step 2: View Active Loans
The customer's active loans will be displayed in a list with:
- Loan amount
- Interest rate and amount
- Total payable
- Remaining balance
- Action buttons

### Step 3: Click "🏷️ Discount Interest" Button
For any active loan, you'll see several action buttons:
- 💰 Add Money
- 💳 Make Payment
- 🏷️ **Discount Interest** ← Click this
- 📅 Extend Loan
- ✓ Redeem
- ✕ Forfeit (if applicable)

Click the "🏷️ Discount Interest" button.

### Step 4: Enter Discount Amount
A form will appear with:

```
╔════════════════════════════════════════╗
║    Discount Interest Form              ║
╠════════════════════════════════════════╣
║ Current Interest Amount: $50.00        ║
║                                        ║
║ Discount Amount * ________________     ║
║                 Max: $50.00            ║
║                                        ║
║ ┌──────────────────────────────────┐  ║
║ │ New Interest Amount: $XX.XX      │  ║
║ │ New Total Payable: $XXXX.XX      │  ║
║ └──────────────────────────────────┘  ║
║                                        ║
║ [✓ Confirm]  [Cancel]                 ║
╚════════════════════════════════════════╝
```

**Fields:**
- **Current Interest Amount**: Shows the interest owed (read-only)
- **Discount Amount**: Enter the dollar amount you want to discount
  - Must be between $0 and the current interest amount
  - Decimals allowed (e.g., $20.50)

### Step 5: Review the Preview
As you type the discount amount, the form automatically shows:
- **New Interest Amount**: Interest after the discount
- **New Total Payable**: Loan amount + new interest

**Example:**
```
Original:
- Loan: $1000
- Interest: $50
- Total: $1050

After $20 discount:
- Loan: $1000
- Interest: $30
- Total: $1030
```

### Step 6: Confirm the Discount
Click the "✓ Confirm" button to apply the discount.

The system will:
1. Validate the discount amount
2. Update the loan interest
3. Recalculate the total payable
4. Refresh the loan display
5. Show success message

## Real-World Scenarios

### Scenario 1: Settlement Negotiation
**Situation**: Customer owes $1050 but wants to negotiate the final payment.

**Original Loan:**
```
Loan Amount: $1000
Interest Rate: 5% = $50
Total Payable: $1050
Remaining Balance: $1050
```

**Negotiation:**
Customer agrees to pay $1030 (instead of $1050).

**Action:**
1. Click "🏷️ Discount Interest"
2. Enter Discount Amount: $20
3. Confirm

**Result:**
```
New Interest: $30
New Total Payable: $1030
New Remaining Balance: $1030
```

Customer can now pay $1030 to fully redeem.

---

### Scenario 2: Partial Payment + Discount
**Situation**: Customer has made payments but still owes interest.

**Current Status:**
```
Original Total: $1050
Payments Made: $500
Remaining Balance: $550

Break Down:
- Loan Remaining: $500
- Interest Remaining: $50
```

**Action:**
Customer wants to pay $520 and close the loan.

**Solution:**
1. Click "🏷️ Discount Interest"
2. Enter Discount Amount: $30 (reduce $50 interest to $20)
3. Confirm

**Result:**
```
New Interest: $20
New Remaining Balance: $520
```

Customer can now pay $520 to complete the loan.

---

### Scenario 3: Loyalty Discount
**Situation**: Regular customer wants to refinance multiple loans.

**You decide to:**
- Offer a 5% interest discount across all loans
- Reward customer loyalty

**Action:**
For each loan, click "🏷️ Discount Interest" and apply the appropriate discount.

**Example for $1000 loan at 5%:**
- Original interest: $50
- 5% discount: $2.50
- New interest: $47.50

---

## Important Rules

✅ **Can Apply Discount When:**
- Loan is in "active" status
- At any time during the loan period
- Before or after payments are made
- Even on the final payment

❌ **Cannot Apply Discount When:**
- Loan is "redeemed" (already paid off)
- Loan is "forfeited" (collateral seized)
- Trying to discount more than the interest amount
- Entering zero or negative amount

## After Applying Discount

### What Changes
- ✅ Interest amount decreases
- ✅ Total payable decreases
- ✅ Remaining balance decreases
- ✅ Loan status stays "active"
- ✅ Audit trail records the discount

### What Doesn't Change
- Loan amount (principal stays the same)
- Interest rate (rate stays the same, but interest is reduced)
- Loan issue date
- Due date (unless you extend it separately)

### Next Steps
After applying a discount, you can:

1. **Make a Payment**: Click "💳 Make Payment" to accept payment on the new balance
2. **Extend the Loan**: Still available via "📅 Extend Loan"
3. **Redeem the Loan**: Customer can pay the new total and redeem
4. **Apply Another Discount**: Can apply additional discounts if needed

## Tips & Best Practices

### ✓ Best Practices
1. **Document the Reason**: When discounting, keep notes on why (if system supports)
2. **Inform Customer**: Tell customer the new total payable before applying
3. **Keep Records**: The discount is logged automatically for audit
4. **One at a Time**: Apply discounts one per operation (don't stack in same form)
5. **Verify Balance**: Double-check the "New Total Payable" before confirming

### ⚠️ Things to Avoid
1. **Don't Discount More Than Interest**: System prevents this, but verify first
2. **Don't Lose Track**: The original interest is recorded, but track discounts given
3. **Don't Close Loan Without Confirming**: Verify customer has agreed to new amount
4. **Don't Apply Accidentally**: Double-check the loan is correct before confirming

## Troubleshooting

### "Discount amount cannot exceed current interest"
**Problem**: You entered a discount larger than the interest owed.

**Solution**: 
- Check the "Current Interest Amount"
- Enter a smaller discount amount
- For example, if interest is $50, max discount is $50

### "Cannot discount [status] loans"
**Problem**: The loan is not in active status.

**Solution**:
- Loan must be "active"
- Redeemed or forfeited loans cannot be discounted
- Create a new loan if needed

### "Discount amount must be greater than 0"
**Problem**: You entered zero or left the field empty.

**Solution**:
- Enter an amount greater than $0
- Use decimals if needed ($0.01 to $XX.XX)

### Discount didn't apply
**Problem**: Form was submitted but discount isn't showing.

**Solution**:
1. Check for error messages
2. Verify internet connection
3. Search for the loan again to refresh
4. Contact support if error persists

## FAQ

**Q: Can I apply multiple discounts to the same loan?**
A: Yes, you can apply multiple discounts over time if needed.

**Q: Can I undo a discount?**
A: Not directly. If needed, you would need to contact support to manually adjust. Track discounts carefully.

**Q: Does discount affect the due date?**
A: No, discount only changes interest amount. Use "Extend Loan" to change due date.

**Q: Who can apply discounts?**
A: Any user with access to "Manage Customer Profile & Loans" - verify your authorization settings.

**Q: Is the discount logged?**
A: Yes, all discounts are automatically logged with user, date, and amount for audit purposes.

**Q: Can customer see the discount?**
A: If you generate a statement/receipt, yes. The new total payable will be shown.

**Q: What if customer only partially pays the discounted amount?**
A: The remaining balance adjusts. For example:
- Original balance after discount: $1030
- Customer pays: $500
- New remaining balance: $530

**Q: Can I discount the loan amount (principal)?**
A: No, only interest can be discounted. The principal loan amount doesn't change.

## Examples

### Example 1: Simple Discount
```
Start:
├─ Loan Amount: $1,000
├─ Interest: $100
└─ Total: $1,100

Apply $25 discount:
├─ Loan Amount: $1,000 (unchanged)
├─ Interest: $75 ($100 - $25)
└─ Total: $1,075 ($1,000 + $75)
```

### Example 2: Multiple Payments + Discount
```
Day 1: Loan created - $1000 @ 5% = $50 total interest
Day 10: Customer pays $300
  └─ Remaining: $750

Day 20: Apply $15 discount
  └─ New Interest: $35 ($50 - $15)
  └─ New Balance: $735 ($750 - $15)

Day 25: Customer pays $735
  └─ Loan complete!
```

### Example 3: Negotiated Settlement
```
Original: $5000 loan @ 10% = $500 interest = $5500 total
Customer has paid: $2000
Remaining: $3500

Customer says: "I can pay $3200 now to close it"
You agree: "OK, that means $300 discount"

Apply $300 discount:
├─ Interest: $200 ($500 - $300)
├─ Remaining: $3200 ($5000 + $200)
└─ Customer pays $3200 → Loan closed!
```

## Support

If you have questions or need help:
1. Check the "Troubleshooting" section above
2. Review the DISCOUNT_FEATURE.md technical documentation
3. Contact your system administrator
4. Check system logs for detailed error information
