# Backend Implementation - Database Migration Guide

## Quick Setup

The discount feature requires a new `discount_logs` table for audit trail logging. 

### Option 1: Manual SQL Setup (Recommended for Quick Testing)

Run this SQL directly in your PostgreSQL database:

```sql
-- Create discount_logs table for audit trail
CREATE TABLE IF NOT EXISTS discount_logs (
  id SERIAL PRIMARY KEY,
  loan_id INTEGER NOT NULL REFERENCES loans(id) ON DELETE CASCADE,
  customer_id INTEGER NOT NULL REFERENCES customers(id) ON DELETE CASCADE,
  discount_amount DECIMAL(10, 2) NOT NULL,
  applied_by_user_id VARCHAR(255),
  applied_by_username VARCHAR(255),
  previous_interest_amount DECIMAL(10, 2) NOT NULL,
  new_interest_amount DECIMAL(10, 2) NOT NULL,
  previous_total_payable DECIMAL(10, 2) NOT NULL,
  new_total_payable DECIMAL(10, 2) NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Add audit columns to loans table if needed
ALTER TABLE loans 
ADD COLUMN IF NOT EXISTS last_discounted_at TIMESTAMP;

ALTER TABLE loans 
ADD COLUMN IF NOT EXISTS last_discounted_by VARCHAR(255);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS discount_logs_loan_id_idx ON discount_logs(loan_id);
CREATE INDEX IF NOT EXISTS discount_logs_customer_id_idx ON discount_logs(customer_id);
CREATE INDEX IF NOT EXISTS discount_logs_created_at_idx ON discount_logs(created_at);
CREATE INDEX IF NOT EXISTS loans_last_discounted_at_idx ON loans(last_discounted_at);
```

### Option 2: Using Migration File

A migration file is provided at: `migrations/001_create_discount_logs_table.sql`

You can run it with:

```bash
psql -U postgres -d pawn_shop -f migrations/001_create_discount_logs_table.sql
```

Or if using environment variables:

```bash
psql "$DATABASE_URL" -f migrations/001_create_discount_logs_table.sql
```

### Option 3: Using Your Migration Runner (if you have one)

If you have a migration runner set up in your backend:

```javascript
// Example: Running migration on app startup
const runMigrations = async () => {
  try {
    const migrationFile = fs.readFileSync('./migrations/001_create_discount_logs_table.sql', 'utf8');
    await pool.query(migrationFile);
    console.log('✅ Discount migrations completed');
  } catch (err) {
    console.error('⚠️ Migration error:', err);
  }
};

// Call before starting server
runMigrations();
```

## Database Tables

### discount_logs Table
Records every discount applied to a loan:
- `id` - Primary key
- `loan_id` - Reference to the loan
- `customer_id` - Reference to the customer
- `discount_amount` - How much was discounted
- `applied_by_user_id` - User who applied the discount
- `applied_by_username` - Username who applied the discount
- `previous_interest_amount` - Interest before discount
- `new_interest_amount` - Interest after discount
- `previous_total_payable` - Total payable before discount
- `new_total_payable` - Total payable after discount
- `created_at` - When the discount was applied

### loans Table Updates
Added columns for audit trail:
- `last_discounted_at` - When the loan was last discounted
- `last_discounted_by` - Who applied the last discount

## Verification

After running the migration, verify the tables were created:

```sql
-- Check if discount_logs table exists
SELECT * FROM discount_logs;

-- Check if loans table has new columns
SELECT column_name FROM information_schema.columns 
WHERE table_name = 'loans' AND column_name IN ('last_discounted_at', 'last_discounted_by');
```

Expected output:
```
last_discounted_at
last_discounted_by
```

## Testing

Once the database is set up, test the endpoint:

```bash
curl -X POST http://localhost:3001/customers/1/loans/1/discount \
  -H "Content-Type: application/json" \
  -d '{
    "discountAmount": 20.00,
    "userId": "user123",
    "username": "john_doe"
  }'
```

Expected successful response:
```json
{
  "success": true,
  "message": "✅ Discount of $20.00 applied successfully! Interest reduced from $50.00 to $30.00",
  "loan": { ... },
  "discount": {
    "amount": "20.00",
    "previousInterest": "50.00",
    "newInterest": "30.00",
    "previousTotal": "1050.00",
    "newTotal": "1030.00",
    "appliedBy": "john_doe",
    "appliedAt": "2025-11-27T..."
  }
}
```

## Troubleshooting

**Error: "relation 'discount_logs' does not exist"**
- Solution: Run the SQL migration (Option 1 above)

**Error: "column 'last_discounted_at' does not exist"**
- Solution: Make sure to run the ALTER TABLE statements in the migration

**Error: "psql: command not found"**
- Solution: Ensure PostgreSQL is installed and in your PATH, or use your database admin tool directly

## Next Steps

1. ✅ Run the database migration (choose one option above)
2. ✅ Verify the tables were created
3. ✅ Test the endpoint with the curl command above
4. ✅ Test from the frontend UI
5. ✅ Deploy to production

The backend implementation is complete and ready to use!
