-- Create invoice_items table for detailed invoice line items
CREATE TABLE invoice_items (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    invoice_id BIGINT NOT NULL,
    description VARCHAR(500) NOT NULL,
    quantity DECIMAL(10,2) NOT NULL,
    unit_price DECIMAL(10,2) NOT NULL,
    total_price DECIMAL(10,2) NOT NULL,
    item_type VARCHAR(50),
    service_code VARCHAR(50),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    CONSTRAINT fk_invoice_items_invoice FOREIGN KEY (invoice_id) REFERENCES invoices(id) ON DELETE CASCADE
);

-- Add indexes for better performance
CREATE INDEX idx_invoice_items_invoice_id ON invoice_items(invoice_id);
CREATE INDEX idx_invoice_items_item_type ON invoice_items(item_type);
CREATE INDEX idx_invoice_items_service_code ON invoice_items(service_code);

-- Add relationship to invoices table
ALTER TABLE invoices 
ADD COLUMN total_amount DECIMAL(10,2) DEFAULT 0,
ADD COLUMN tax_amount DECIMAL(10,2) DEFAULT 0,
ADD COLUMN due_date DATE,
ADD COLUMN payment_method VARCHAR(50),
ADD COLUMN notes TEXT;

-- Update existing invoices to have default values
UPDATE invoices 
SET total_amount = amount,
    due_date = DATE_ADD(created_at, INTERVAL 30 DAY)
WHERE total_amount IS NULL OR due_date IS NULL;

-- Add indexes for invoices table
CREATE INDEX idx_invoices_due_date ON invoices(due_date);
CREATE INDEX idx_invoices_status ON invoices(status);
CREATE INDEX idx_invoices_patient_id ON invoices(patient_id);
CREATE INDEX idx_invoices_appointment_id ON invoices(appointment_id);
