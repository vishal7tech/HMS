-- Add BILLING role to the users table enum
-- This migration fixes the data truncation error when registering billing staff

ALTER TABLE users 
MODIFY COLUMN role ENUM('ADMIN', 'DOCTOR', 'RECEPTIONIST', 'PATIENT', 'BILLING') NOT NULL;
