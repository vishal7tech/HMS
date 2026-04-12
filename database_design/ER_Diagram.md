# Hospital Management System - ER Diagram

## Entity-Relationship Diagram Overview

```mermaid
erDiagram
    %% Core User Management
    USERS {
        bigint id PK
        varchar username UK
        varchar password
        varchar email UK
        varchar name
        enum role
        boolean enabled
        timestamp last_login
        int login_count
        boolean account_locked
        timestamp password_changed_at
        varchar password_reset_token
        timestamp password_reset_expiry
        timestamp created_at
        timestamp updated_at
        bigint created_by FK
        bigint updated_by FK
    }

    %% Patient Management
    PATIENT_PROFILES {
        bigint id PK
        bigint user_id FK
        varchar first_name
        varchar last_name
        varchar contact_number
        text address
        varchar emergency_contact
        varchar blood_group
        text allergies
        date date_of_birth
        enum gender
        text medical_history
        timestamp created_at
        timestamp updated_at
        bigint created_by FK
        bigint updated_by FK
    }

    %% Doctor Management
    DOCTOR_PROFILES {
        bigint id PK
        bigint user_id FK
        varchar contact_number
        text qualifications
        int experience_years
        varchar license_number UK
        varchar department
        decimal consultation_fee
        timestamp created_at
        timestamp updated_at
        bigint created_by FK
        bigint updated_by FK
    }

    %% Doctor Specializations (Junction Table)
    DOCTOR_SPECIALIZATIONS {
        bigint id PK
        bigint doctor_id FK
        varchar specialization
        timestamp created_at
    }

    %% Appointment Management
    APPOINTMENTS {
        bigint id PK
        bigint patient_id FK
        bigint doctor_id FK
        timestamp slot_time
        timestamp end_time
        enum status
        text notes
        text reason
        bigint created_by FK
        bigint updated_by FK
        timestamp created_at
        timestamp updated_at
    }

    %% Availability Management
    AVAILABILITY_SLOTS {
        bigint id PK
        bigint doctor_id FK
        date date
        time start_time
        time end_time
        boolean is_available
        enum recurrence
        int max_appointments
        timestamp created_at
        timestamp updated_at
    }

    %% Billing Management
    BILLING {
        bigint id PK
        bigint appointment_id FK
        bigint patient_id FK
        bigint doctor_id FK
        decimal amount
        enum status
        date invoice_date
        date due_date
        enum payment_method
        text notes
        bigint created_by FK
        bigint updated_by FK
        timestamp created_at
        timestamp updated_at
    }

    %% Invoice Management
    INVOICES {
        bigint id PK
        varchar invoice_number UK
        bigint appointment_id FK
        bigint patient_id FK
        decimal amount
        decimal tax_amount
        decimal total_amount
        enum status
        date due_date
        varchar payment_method
        text notes
        varchar pdf_path
        timestamp paid_at
        bigint created_by FK
        bigint updated_by FK
        timestamp created_at
        timestamp updated_at
    }

    %% Invoice Items
    INVOICE_ITEMS {
        bigint id PK
        bigint invoice_id FK
        varchar description
        decimal quantity
        decimal unit_price
        decimal total_price
        enum item_type
        varchar service_code
        timestamp created_at
        timestamp updated_at
    }

    %% Prescription Management
    PRESCRIPTIONS {
        bigint id PK
        bigint appointment_id FK
        bigint patient_id FK
        bigint doctor_id FK
        text diagnosis
        varchar medication
        varchar dosage
        text instructions
        timestamp follow_up_date
        bigint created_by FK
        bigint updated_by FK
        timestamp created_at
        timestamp updated_at
    }

    %% File Attachments
    PATIENT_FILE_ATTACHMENTS {
        bigint id PK
        bigint patient_id FK
        varchar file_name
        varchar file_path
        varchar file_type
        bigint file_size
        bigint uploaded_by FK
        timestamp created_at
    }

    %% Audit Trail
    AUDIT_LOGS {
        bigint id PK
        varchar entity_type
        bigint entity_id
        enum action
        text old_values
        text new_values
        bigint changed_by FK
        timestamp changed_at
        varchar ip_address
        text user_agent
        varchar entity_name
        varchar email
    }

    %% Payment Management
    PAYMENTS {
        bigint id PK
        bigint invoice_id FK
        decimal amount
        enum payment_method
        enum status
        varchar transaction_id
        timestamp payment_date
        text notes
        bigint created_by FK
        timestamp created_at
    }

    %% Relationships
    USERS ||--o{ PATIENT_PROFILES : "has"
    USERS ||--o{ DOCTOR_PROFILES : "has"
    USERS ||--o{ AUDIT_LOGS : "performs"
    
    PATIENT_PROFILES ||--o{ APPOINTMENTS : "books"
    DOCTOR_PROFILES ||--o{ APPOINTMENTS : "conducts"
    DOCTOR_PROFILES ||--o{ DOCTOR_SPECIALIZATIONS : "specializes_in"
    DOCTOR_PROFILES ||--o{ AVAILABILITY_SLOTS : "available_in"
    
    APPOINTMENTS ||--|| BILLING : "generates"
    APPOINTMENTS ||--|| INVOICES : "creates"
    APPOINTMENTS ||--o{ PRESCRIPTIONS : "results_in"
    
    PATIENT_PROFILES ||--o{ BILLING : "pays_for"
    DOCTOR_PROFILES ||--o{ BILLING : "earns_from"
    
    INVOICES ||--o{ INVOICE_ITEMS : "contains"
    INVOICES ||--o{ PAYMENTS : "receives"
    
    PATIENT_PROFILES ||--o{ PATIENT_FILE_ATTACHMENTS : "has_files"
    
    USERS ||--o{ APPOINTMENTS : "creates"
    USERS ||--o{ BILLING : "manages"
    USERS ||--o{ INVOICES : "issues"
    USERS ||--o{ PRESCRIPTIONS : "prescribes"
    USERS ||--o{ PATIENT_FILE_ATTACHMENTS : "uploads"
```

## ER Diagram Description

### Core Entities

1. **USERS** - Central authentication entity
2. **PATIENT_PROFILES** - Extended patient information
3. **DOCTOR_PROFILES** - Extended doctor information
4. **APPOINTMENTS** - Appointment scheduling
5. **BILLING** - Financial billing records
6. **INVOICES** - Detailed invoice management
7. **PRESCRIPTIONS** - Medical prescriptions
8. **AUDIT_LOGS** - System audit trail

### Relationships Summary

| Relationship | Cardinality | Description |
|--------------|-------------|-------------|
| User → Patient Profile | 1:1 | One user has one patient profile |
| User → Doctor Profile | 1:1 | One user has one doctor profile |
| Patient → Appointments | 1:N | One patient has many appointments |
| Doctor → Appointments | 1:N | One doctor has many appointments |
| Appointment → Billing | 1:1 | One appointment has one billing record |
| Invoice → Invoice Items | 1:N | One invoice has many line items |
| User → Audit Logs | 1:N | One user generates many audit logs |

### Key Constraints

- **Unique Constraints:** username, email, license_number, invoice_number
- **Foreign Key Constraints:** All relationships maintain referential integrity
- **Check Constraints:** Email format, phone numbers, positive amounts
- **Business Rules:** Appointment end_time > start_time, due_date >= invoice_date
