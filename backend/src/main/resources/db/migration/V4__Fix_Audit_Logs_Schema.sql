-- Fix audit logs schema to support proper entity name and email tracking

-- Add entity_name and email columns to audit_logs table
ALTER TABLE audit_logs 
ADD COLUMN IF NOT EXISTS entity_name VARCHAR(255),
ADD COLUMN IF NOT EXISTS email VARCHAR(100);

-- Create indexes for the new columns
CREATE INDEX IF NOT EXISTS idx_audit_entity_name ON audit_logs(entity_name);
CREATE INDEX IF NOT EXISTS idx_audit_email ON audit_logs(email);

-- Create a view for audit logs with user information
CREATE OR REPLACE VIEW audit_logs_with_user_info AS
SELECT 
    al.id,
    al.changed_at,
    al.action,
    al.entity_type,
    al.entity_name,
    al.entity_id,
    COALESCE(u.email, al.email) AS email,
    al.changed_by,
    al.ip_address,
    al.user_agent,
    al.old_values,
    al.new_values,
    u.name AS user_name
FROM audit_logs al
LEFT JOIN users u ON al.changed_by = u.id;

-- Create a daily audit summary view
CREATE OR REPLACE VIEW daily_audit_summary AS
SELECT 
    DATE(al.changed_at) AS audit_date,
    al.action,
    COUNT(*) AS action_count
FROM audit_logs al
WHERE al.changed_at >= CURDATE()
GROUP BY DATE(al.changed_at), al.action
ORDER BY audit_date DESC, al.action;
