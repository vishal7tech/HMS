-- Add doctor user accounts for testing
-- Passwords are hashed with BCrypt (password: doctor123)

INSERT INTO users (username, password, email, name, role, doctor_id) VALUES 
('doctor1', '$2a$12$LQv3c1yqBWVHxkd0LHAkOvE8bW8YfJgBtUvK1Nd8uHK6Uqk6gG', 'john.smith@hms.com', 'Dr. John Smith', 'DOCTOR', 1),
('doctor2', '$2a$12$LQv3c1yqBWVHxkd0LHAkOvE8bW8YfJgBtUvK1Nd8uHK6Uqk6gG', 'sarah.johnson@hms.com', 'Dr. Sarah Johnson', 'DOCTOR', 2),
('doctor3', '$2a$12$LQv3c1yqBWVHxkd0LHAkOvE8bW8YfJgBtUvK1Nd8uHK6Uqk6gG', 'michael.brown@hms.com', 'Dr. Michael Brown', 'DOCTOR', 3),
('doctor4', '$2a$12$LQv3c1yqBWVHxkd0LHAkOvE8bW8YfJgBtUvK1Nd8uHK6Uqk6gG', 'emily.davis@hms.com', 'Dr. Emily Davis', 'DOCTOR', 4),
('doctor5', '$2a$12$LQv3c1yqBWVHxkd0LHAkOvE8bW8YfJgBtUvK1Nd8uHK6Uqk6gG', 'robert.wilson@hms.com', 'Dr. Robert Wilson', 'DOCTOR', 5);

-- Add receptionist user for testing
INSERT INTO users (username, password, email, name, role) VALUES 
('receptionist1', '$2a$12$LQv3c1yqBWVHxkd0LHAkOvE8bW8YfJgBtUvK1Nd8uHK6Uqk6gG', 'receptionist@hms.com', 'Front Desk Receptionist', 'RECEPTIONIST');
