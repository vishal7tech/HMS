-- HMS Database Performance Optimization
-- Production-ready indexes for optimal query performance

-- Users table indexes
CREATE INDEX idx_users_username ON users(username);
CREATE INDEX idx_users_role ON users(role);
CREATE INDEX idx_users_doctor_id ON users(doctor_id);

-- Patients table indexes
CREATE INDEX idx_patients_name ON patients(name);
CREATE INDEX idx_patients_email ON patients(email);
CREATE INDEX idx_patients_phone ON patients(phone_number);
CREATE INDEX idx_patients_dob ON patients(date_of_birth);

-- Doctors table indexes
CREATE INDEX idx_doctors_name ON doctors(name);
CREATE INDEX idx_doctors_specialization ON doctors(specialization);
CREATE INDEX idx_doctors_available ON doctors(available);
CREATE INDEX idx_doctors_email ON doctors(email);

-- Appointments table indexes (CRITICAL for performance)
CREATE INDEX idx_appointments_patient_id ON appointments(patient_id);
CREATE INDEX idx_appointments_doctor_id ON appointments(doctor_id);
CREATE INDEX idx_appointments_datetime ON appointments(date_time);
CREATE INDEX idx_appointments_status ON appointments(status);
CREATE INDEX idx_appointments_doctor_datetime ON appointments(doctor_id, date_time);
CREATE INDEX idx_appointments_patient_datetime ON appointments(patient_id, date_time);

-- Billing table indexes
CREATE INDEX idx_billings_patient_id ON billings(patient_id);
CREATE INDEX idx_billings_appointment_id ON billings(appointment_id);
CREATE INDEX idx_billings_payment_status ON billings(payment_status);
CREATE INDEX idx_billings_issued_at ON billings(issued_at);
CREATE INDEX idx_billings_status_issued ON billings(payment_status, issued_at);

-- Composite indexes for common queries
CREATE INDEX idx_appointments_doctor_status_datetime ON appointments(doctor_id, status, date_time);
CREATE INDEX idx_billings_patient_status ON billings(patient_id, payment_status);

-- Add foreign key constraints if not already present
ALTER TABLE appointments 
ADD CONSTRAINT fk_appointments_patient 
FOREIGN KEY (patient_id) REFERENCES patients(id) ON DELETE CASCADE;

ALTER TABLE appointments 
ADD CONSTRAINT fk_appointments_doctor 
FOREIGN KEY (doctor_id) REFERENCES doctors(id) ON DELETE CASCADE;

ALTER TABLE billings 
ADD CONSTRAINT fk_billings_patient 
FOREIGN KEY (patient_id) REFERENCES patients(id) ON DELETE CASCADE;

ALTER TABLE billings 
ADD CONSTRAINT fk_billings_appointment 
FOREIGN KEY (appointment_id) REFERENCES appointments(id) ON DELETE CASCADE;

ALTER TABLE users 
ADD CONSTRAINT fk_users_doctor 
FOREIGN KEY (doctor_id) REFERENCES doctors(id) ON DELETE SET NULL;
