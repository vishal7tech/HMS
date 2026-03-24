-- Create users table
CREATE TABLE users (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    username VARCHAR(50) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL,
    email VARCHAR(100) NOT NULL UNIQUE,
    name VARCHAR(100) NOT NULL,
    role ENUM('ADMIN', 'DOCTOR', 'RECEPTIONIST', 'PATIENT') NOT NULL,
    enabled BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_username (username),
    INDEX idx_email (email),
    INDEX idx_role (role)
);

-- Create patients table
CREATE TABLE patients (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    email VARCHAR(100) NOT NULL UNIQUE,
    phone VARCHAR(20) NOT NULL,
    date_of_birth DATE NOT NULL,
    address TEXT,
    medical_history TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_email (email),
    INDEX idx_phone (phone),
    INDEX idx_name (name)
);

-- Create doctors table
CREATE TABLE doctors (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    email VARCHAR(100) NOT NULL UNIQUE,
    phone VARCHAR(20) NOT NULL,
    specialization VARCHAR(100) NOT NULL,
    experience_years INT NOT NULL DEFAULT 0,
    available BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_email (email),
    INDEX idx_phone (phone),
    INDEX idx_specialization (specialization),
    INDEX idx_available (available)
);

-- Create appointments table
CREATE TABLE appointments (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    patient_id BIGINT NOT NULL,
    doctor_id BIGINT NOT NULL,
    date_time TIMESTAMP NOT NULL,
    end_time TIMESTAMP NOT NULL,
    reason TEXT,
    notes TEXT,
    status ENUM('SCHEDULED', 'COMPLETED', 'CANCELLED', 'NO_SHOW') DEFAULT 'SCHEDULED',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (patient_id) REFERENCES patients(id) ON DELETE RESTRICT,
    FOREIGN KEY (doctor_id) REFERENCES doctors(id) ON DELETE RESTRICT,
    INDEX idx_patient_id (patient_id),
    INDEX idx_doctor_id (doctor_id),
    INDEX idx_date_time (date_time),
    INDEX idx_status (status),
    INDEX idx_doctor_datetime (doctor_id, date_time),
    CONSTRAINT chk_appointment_times CHECK (end_time > date_time)
);

-- Create billings table
CREATE TABLE billings (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    patient_id BIGINT NOT NULL,
    appointment_id BIGINT NOT NULL UNIQUE,
    amount DECIMAL(10,2) NOT NULL,
    payment_method ENUM('CASH', 'CARD', 'UPI', 'INSURANCE') DEFAULT 'CASH',
    payment_status ENUM('PENDING', 'PAID', 'CANCELLED') DEFAULT 'PENDING',
    issued_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (patient_id) REFERENCES patients(id) ON DELETE RESTRICT,
    FOREIGN KEY (appointment_id) REFERENCES appointments(id) ON DELETE CASCADE,
    INDEX idx_patient_id (patient_id),
    INDEX idx_appointment_id (appointment_id),
    INDEX idx_payment_status (payment_status),
    INDEX idx_issued_at (issued_at),
    CONSTRAINT chk_billing_amount CHECK (amount >= 0)
);

-- Create audit log table for tracking user activities
CREATE TABLE audit_logs (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    user_id BIGINT,
    action VARCHAR(50) NOT NULL,
    entity_type VARCHAR(50) NOT NULL,
    entity_id BIGINT,
    old_values JSON,
    new_values JSON,
    ip_address VARCHAR(45),
    user_agent TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL,
    INDEX idx_user_id (user_id),
    INDEX idx_action (action),
    INDEX idx_entity_type (entity_type),
    INDEX idx_created_at (created_at)
);

-- Insert default admin user (password: admin123)
INSERT INTO users (username, password, email, name, role) VALUES 
('admin', '$2a$12$LQv3c1yqBWVHxkd0LHAkOvE8bW8YfJgBtUvK1Nd8uHK6Uqk6gG', 'admin@hms.com', 'System Administrator', 'ADMIN');

-- Insert sample data
INSERT INTO doctors (name, email, phone, specialization, experience_years, available) VALUES 
('Dr. John Smith', 'john.smith@hms.com', '+1234567890', 'Cardiology', 15, TRUE),
('Dr. Sarah Johnson', 'sarah.johnson@hms.com', '+1234567891', 'Pediatrics', 10, TRUE),
('Dr. Michael Brown', 'michael.brown@hms.com', '+1234567892', 'Orthopedics', 12, TRUE),
('Dr. Emily Davis', 'emily.davis@hms.com', '+1234567893', 'General Medicine', 8, TRUE),
('Dr. Robert Wilson', 'robert.wilson@hms.com', '+1234567894', 'Neurology', 20, TRUE);

INSERT INTO patients (name, email, phone, date_of_birth, address, medical_history) VALUES 
('Alice Johnson', 'alice.j@email.com', '+1234567890', '1985-05-15', '123 Main St, City, State', 'Hypertension, Diabetes'),
('Bob Smith', 'bob.s@email.com', '+1234567891', '1990-08-22', '456 Oak Ave, City, State', 'No significant medical history'),
('Carol Williams', 'carol.w@email.com', '+1234567892', '1978-12-10', '789 Pine Rd, City, State', 'Asthma, Allergies'),
('David Brown', 'david.b@email.com', '+1234567893', '1995-03-25', '321 Elm St, City, State', 'No significant medical history'),
('Eva Martinez', 'eva.m@email.com', '+1234567894', '1982-07-18', '654 Maple Dr, City, State', 'Arthritis, High cholesterol');
