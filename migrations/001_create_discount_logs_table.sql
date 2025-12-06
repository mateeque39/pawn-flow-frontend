-- Discount Logs Table Migration
-- This table tracks all interest discounts applied to loans for audit purposes

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
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  INDEX loan_id_idx (loan_id),
  INDEX customer_id_idx (customer_id),
  INDEX created_at_idx (created_at)
);

-- Add columns to loans table if they don't exist
ALTER TABLE loans 
ADD COLUMN IF NOT EXISTS last_discounted_at TIMESTAMP,
ADD COLUMN IF NOT EXISTS last_discounted_by VARCHAR(255);

-- Create index for discount tracking
CREATE INDEX IF NOT EXISTS last_discounted_at_idx ON loans(last_discounted_at);
