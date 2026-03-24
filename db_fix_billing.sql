-- Database cleanup for HMS Billing
USE hms_db;

-- Update existing invoices with sensible defaults
UPDATE invoices 
SET 
    amount = COALESCE(amount, 0),
    tax_amount = COALESCE(tax_amount, amount * 0.18, 0),
    total_amount = COALESCE(total_amount, amount + tax_amount, 0),
    due_date = COALESCE(due_date, DATE_ADD(created_at, INTERVAL 7 DAY), DATE_ADD(NOW(), INTERVAL 7 DAY)),
    payment_method = COALESCE(payment_method, 'CASH'),
    status = COALESCE(status, 'PENDING');

-- Update any payments that might be orphaned or have null values
-- (If needed based on observation)
