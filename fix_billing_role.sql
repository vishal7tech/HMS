-- Manual SQL script to fix the BILLING role issue
-- Run this directly against your MySQL database

USE hms_db;

-- Modify the role column to include BILLING
ALTER TABLE users 
MODIFY COLUMN role ENUM('ADMIN', 'DOCTOR', 'RECEPTIONIST', 'PATIENT', 'BILLING') NOT NULL;

-- Verify the change
DESCRIBE users;
