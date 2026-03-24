-- HMS Seed Data Script
-- WINDSURF: Complete seed data for testing all roles and flowchart functionality

-- Clean existing data (for testing)
DELETE FROM payments;
DELETE FROM invoices;
DELETE FROM appointments;
DELETE FROM availability_slots;
DELETE FROM patient_file_attachments;
DELETE FROM doctor_specializations;
DELETE FROM patient_profiles;
DELETE FROM doctor_profiles;
DELETE FROM users;

-- Insert Users with all roles
INSERT INTO users (id, username, password, role, email, name, enabled, created_at) VALUES
(1, 'admin', '$2a$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewdBPj6ukx.LFvO6', 'ADMIN', 'admin@hms.com', 'Hospital Administrator', true, NOW()),
(2, 'receptionist', '$2a$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewdBPj6ukx.LFvO6', 'RECEPTIONIST', 'reception@hms.com', 'Front Desk Receptionist', true, NOW()),
(3, 'dr_smith', '$2a$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewdBPj6ukx.LFvO6', 'DOCTOR', 'dr.smith@hms.com', 'Dr. John Smith', true, NOW()),
(4, 'dr_jones', '$2a$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewdBPj6ukx.LFvO6', 'DOCTOR', 'dr.jones@hms.com', 'Dr. Sarah Jones', true, NOW()),
(5, 'patient1', '$2a$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewdBPj6ukx.LFvO6', 'PATIENT', 'john.doe@email.com', 'John Doe', true, NOW()),
(6, 'patient2', '$2a$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewdBPj6ukx.LFvO6', 'PATIENT', 'jane.smith@email.com', 'Jane Smith', true, NOW()),
(7, 'patient3', '$2a$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewdBPj6ukx.LFvO6', 'PATIENT', 'bob.wilson@email.com', 'Bob Wilson', true, NOW()),
(8, 'vinay', '$2a$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewdBPj6ukx.LFvO6', 'ADMIN', 'vinay@hms.com', 'Vinay Kumar', true, NOW());

-- Insert Doctor Profiles
INSERT INTO doctor_profiles (id, user_id, qualifications, contact_number, created_at) VALUES
(1, 3, 'MD, Cardiology Specialist, 10 years experience', '+1-555-0101', NOW()),
(2, 4, 'MD, Orthopedic Surgeon, 8 years experience', '+1-555-0102', NOW());

-- Insert Doctor Specializations
INSERT INTO doctor_specializations (doctor_id, specialization) VALUES
(1, 'Cardiology'),
(1, 'Internal Medicine'),
(2, 'Orthopedics'),
(2, 'Sports Medicine');

-- Insert Patient Profiles
INSERT INTO patient_profiles (id, user_id, first_name, last_name, contact_number, address, emergency_contact, blood_group, allergies, date_of_birth, gender, medical_history, created_at) VALUES
(1, 5, 'John', 'Doe', '+1-555-0201', '123 Main St, City, State 12345', '+1-555-0202', 'O+', 'Penicillin', '1985-05-15', 'Male', 'Hypertension, occasional migraines. Previous surgery: Appendix removal 2010.', NOW()),
(2, 6, 'Jane', 'Smith', '+1-555-0203', '456 Oak Ave, City, State 12345', '+1-555-0204', 'A+', 'None', '1990-08-22', 'Female', 'No chronic conditions. Regular checkups only.', NOW()),
(3, 7, 'Bob', 'Wilson', '+1-555-0205', '789 Pine Rd, City, State 12345', '+1-555-0206', 'B+', 'Latex, Peanuts', '1978-12-10', 'Male', 'Type 2 Diabetes, managed with medication. Allergic to latex and peanuts.', NOW());

-- Insert Availability Slots for next 7 days
INSERT INTO availability_slots (id, doctor_id, date, start_time, end_time, is_available, recurrence, created_at) VALUES
-- Dr. Smith slots
(1, 1, CURDATE(), '09:00:00', '09:30:00', true, 'WEEKLY', NOW()),
(2, 1, CURDATE(), '09:30:00', '10:00:00', true, 'WEEKLY', NOW()),
(3, 1, CURDATE(), '10:00:00', '10:30:00', false, 'WEEKLY', NOW()),
(4, 1, CURDATE(), '10:30:00', '11:00:00', true, 'WEEKLY', NOW()),
(5, 1, CURDATE(), '11:00:00', '11:30:00', true, 'WEEKLY', NOW()),
(6, 1, CURDATE(), '14:00:00', '14:30:00', true, 'WEEKLY', NOW()),
(7, 1, CURDATE(), '14:30:00', '15:00:00', true, 'WEEKLY', NOW()),
(8, 1, CURDATE(), '15:00:00', '15:30:00', false, 'WEEKLY', NOW()),
-- Dr. Jones slots
(9, 2, CURDATE(), '09:00:00', '09:30:00', true, 'WEEKLY', NOW()),
(10, 2, CURDATE(), '09:30:00', '10:00:00', true, 'WEEKLY', NOW()),
(11, 2, CURDATE(), '10:00:00', '10:30:00', true, 'WEEKLY', NOW()),
(12, 2, CURDATE(), '14:00:00', '14:30:00', true, 'WEEKLY', NOW()),
(13, 2, CURDATE(), '14:30:00', '15:00:00', true, 'WEEKLY', NOW()),
-- Tomorrow slots for Dr. Smith
(14, 1, DATE_ADD(CURDATE(), INTERVAL 1 DAY), '09:00:00', '09:30:00', true, 'WEEKLY', NOW()),
(15, 1, DATE_ADD(CURDATE(), INTERVAL 1 DAY), '09:30:00', '10:00:00', true, 'WEEKLY', NOW()),
(16, 1, DATE_ADD(CURDATE(), INTERVAL 1 DAY), '10:00:00', '10:30:00', true, 'WEEKLY', NOW());

-- Insert Sample Appointments
INSERT INTO appointments (id, patient_id, doctor_id, slot_time, end_time, status, notes, reason, created_by, created_at) VALUES
(1, 1, 1, CONCAT(CURDATE(), ' 09:00:00'), CONCAT(CURDATE(), ' 09:30:00'), 'SCHEDULED', 'Regular checkup', 'Annual physical examination', 2, NOW()),
(2, 2, 2, CONCAT(CURDATE(), ' 09:30:00'), CONCAT(CURDATE(), ' 10:00:00'), 'SCHEDULED', 'Follow-up visit', 'Post-surgery follow-up', 2, NOW()),
(3, 3, 1, CONCAT(CURDATE(), ' 14:00:00'), CONCAT(CURDATE(), ' 14:30:00'), 'SCHEDULED', 'Consultation', 'Chest pain evaluation', 2, NOW()),
(4, 1, 1, DATE_ADD(CONCAT(CURDATE(), ' 09:00:00'), INTERVAL 1 DAY), DATE_ADD(CONCAT(CURDATE(), ' 09:30:00'), INTERVAL 1 DAY), 'SCHEDULED', 'Cardiology consultation', 'Heart palpitations', 2, NOW());

-- Update availability slots to mark booked ones
UPDATE availability_slots SET is_available = false WHERE id IN (1, 9, 5);

-- Insert Sample Invoices
INSERT INTO invoices (id, appointment_id, patient_id, amount, tax_amount, total_amount, status, invoice_number, payment_method, due_date, created_at) VALUES
(1, 1, 1, 150.00, 27.00, 177.00, 'PAID', 'INV-2024-001', 'CARD', DATE_ADD(NOW(), INTERVAL 7 DAY), NOW()),
(2, 2, 2, 200.00, 36.00, 236.00, 'PENDING', 'INV-2024-002', 'CASH', DATE_ADD(NOW(), INTERVAL 7 DAY), NOW()),
(3, 3, 3, 175.00, 31.50, 206.50, 'PARTIAL', 'INV-2024-003', 'CASH', DATE_ADD(NOW(), INTERVAL 7 DAY), NOW()),
(4, 4, 1, 150.00, 27.00, 177.00, 'PENDING', 'INV-2024-004', 'CASH', DATE_ADD(NOW(), INTERVAL 7 DAY), NOW());

-- Insert Sample Payments
INSERT INTO payments (id, invoice_id, amount_paid, method, transaction_id, status, created_at) VALUES
(1, 1, 150.00, 'CARD', 'TXN-001', 'COMPLETED', NOW()),
(2, 3, 100.00, 'CASH', 'TXN-002', 'COMPLETED', NOW());

-- Insert Audit Logs for testing
INSERT INTO audit_logs (id, user_id, action, entity_type, entity_id, old_values, new_values, ip_address, user_agent, created_at) VALUES
(1, 2, 'CREATE', 'APPOINTMENT', 1, NULL, '{"patientId": 1, "doctorId": 1, "slotTime": "2024-01-15 09:00:00"}', '127.0.0.1', 'Mozilla/5.0', NOW()),
(2, 2, 'UPDATE', 'APPOINTMENT', 1, '{"status": "SCHEDULED"}', '{"status": "CONFIRMED"}', '127.0.0.1', 'Mozilla/5.0', NOW()),
(3, 2, 'CREATE', 'INVOICE', 2, NULL, '{"appointmentId": 2, "amount": 200.00}', '127.0.0.1', 'Mozilla/5.0', NOW());

-- Output summary
SELECT 'Seed data created successfully!' as message;
SELECT 'Users:' as entity, COUNT(*) as count FROM users
UNION ALL
SELECT 'Doctors:', COUNT(*) FROM doctor_profiles
UNION ALL
SELECT 'Patients:', COUNT(*) FROM patient_profiles
UNION ALL
SELECT 'Availability Slots:', COUNT(*) FROM availability_slots
UNION ALL
SELECT 'Appointments:', COUNT(*) FROM appointments
UNION ALL
SELECT 'Invoices:', COUNT(*) FROM invoices
UNION ALL
SELECT 'Payments:', COUNT(*) FROM payments;

-- Test login credentials (all passwords are: password)
SELECT 'Login Credentials:' as info;
SELECT 'Admin: admin / password' as credentials;
SELECT 'Receptionist: receptionist / password' as credentials;
SELECT 'Doctor: dr_smith / password' as credentials;
SELECT 'Patient: patient1 / password' as credentials;
