# HMS API Documentation

## Base URL
```
http://localhost:8080/api
```

## Authentication
All protected endpoints require a JWT token in the Authorization header:
```
Authorization: Bearer <token>
```

## Endpoints

### Authentication

#### Register User
```bash
curl -X POST http://localhost:8080/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "username": "admin",
    "password": "admin123",
    "role": "ADMIN"
  }'
```

#### Login
```bash
curl -X POST http://localhost:8080/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "username": "admin",
    "password": "admin123"
  }'
```

### Patients

#### Get All Patients
```bash
curl -X GET http://localhost:8080/api/patients \
  -H "Authorization: Bearer <token>"
```

#### Get Patient by ID
```bash
curl -X GET http://localhost:8080/api/patients/1 \
  -H "Authorization: Bearer <token>"
```

#### Create Patient
```bash
curl -X POST http://localhost:8080/api/patients \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "John Doe",
    "email": "john@example.com",
    "phone": "+1234567890",
    "dateOfBirth": "1990-01-01",
    "address": "123 Main St",
    "medicalHistory": "No significant history"
  }'
```

#### Update Patient
```bash
curl -X PUT http://localhost:8080/api/patients/1 \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "John Updated",
    "email": "john.updated@example.com",
    "phone": "+1234567890",
    "dateOfBirth": "1990-01-01",
    "address": "456 Oak Ave",
    "medicalHistory": "Updated history"
  }'
```

#### Delete Patient
```bash
curl -X DELETE http://localhost:8080/api/patients/1 \
  -H "Authorization: Bearer <token>"
```

### Doctors

#### Get All Doctors
```bash
curl -X GET http://localhost:8080/api/doctors \
  -H "Authorization: Bearer <token>"
```

#### Get Doctor by ID
```bash
curl -X GET http://localhost:8080/api/doctors/1 \
  -H "Authorization: Bearer <token>"
```

#### Create Doctor
```bash
curl -X POST http://localhost:8080/api/doctors \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Dr. Jane Smith",
    "email": "jane.smith@hms.com",
    "phone": "+1234567890",
    "specialization": "Cardiology",
    "experience": 15,
    "available": true
  }'
```

#### Update Doctor
```bash
curl -X PUT http://localhost:8080/api/doctors/1 \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Dr. Jane Updated",
    "email": "jane.updated@hms.com",
    "phone": "+1234567890",
    "specialization": "Cardiology",
    "experience": 16,
    "available": false
  }'
```

#### Delete Doctor
```bash
curl -X DELETE http://localhost:8080/api/doctors/1 \
  -H "Authorization: Bearer <token>"
```

#### Toggle Doctor Availability
```bash
curl -X PATCH http://localhost:8080/api/doctors/1/availability \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -d '{
    "available": false
  }'
```

### Appointments

#### Get All Appointments
```bash
curl -X GET http://localhost:8080/api/appointments \
  -H "Authorization: Bearer <token>"
```

#### Get Appointment by ID
```bash
curl -X GET http://localhost:8080/api/appointments/1 \
  -H "Authorization: Bearer <token>"
```

#### Create Appointment
```bash
curl -X POST http://localhost:8080/api/appointments \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -d '{
    "patientId": 1,
    "doctorId": 1,
    "dateTime": "2024-12-25T10:00:00",
    "reason": "Regular checkup",
    "notes": "Patient complains of headache"
  }'
```

#### Reschedule Appointment
```bash
curl -X PUT http://localhost:8080/api/appointments/1/reschedule \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -d '{
    "dateTime": "2024-12-26T14:00:00"
  }'
```

#### Cancel Appointment
```bash
curl -X DELETE http://localhost:8080/api/appointments/1 \
  -H "Authorization: Bearer <token>"
```

#### Complete Appointment
```bash
curl -X PUT http://localhost:8080/api/appointments/1/complete \
  -H "Authorization: Bearer <token>"
```

#### Get Today's Appointments
```bash
curl -X GET http://localhost:8080/api/appointments/today \
  -H "Authorization: Bearer <token>"
```

### Billing

#### Get All Bills
```bash
curl -X GET http://localhost:8080/api/billings \
  -H "Authorization: Bearer <token>"
```

#### Get Bill by ID
```bash
curl -X GET http://localhost:8080/api/billings/1 \
  -H "Authorization: Bearer <token>"
```

#### Create Bill
```bash
curl -X POST http://localhost:8080/api/billings \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -d '{
    "patientId": 1,
    "appointmentId": 1,
    "amount": 200.00,
    "paymentMethod": "CASH"
  }'
```

#### Generate Bill for Appointment
```bash
curl -X POST http://localhost:8080/api/billings/appointment/1 \
  -H "Authorization: Bearer <token>"
```

#### Update Payment Status
```bash
curl -X PUT http://localhost:8080/api/billings/1/payment-status \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -d '{
    "paymentStatus": "PAID"
  }'
```

#### Get Pending Bills
```bash
curl -X GET http://localhost:8080/api/billings/pending \
  -H "Authorization: Bearer <token>"
```

#### Get Bills by Patient
```bash
curl -X GET http://localhost:8080/api/billings/patient/1 \
  -H "Authorization: Bearer <token>"
```

#### Delete Bill
```bash
curl -X DELETE http://localhost:8080/api/billings/1 \
  -H "Authorization: Bearer <token>"
```

### Dashboard

#### Get Dashboard Stats
```bash
curl -X GET http://localhost:8080/api/dashboard/stats \
  -H "Authorization: Bearer <token>"
```

#### Get Dashboard Stats with Date Range
```bash
curl -X GET "http://localhost:8080/api/dashboard/stats?from=2024-01-01&to=2024-12-31" \
  -H "Authorization: Bearer <token>"
```

## Role-Based Access Control

### Role Permissions:
- **ADMIN**: Full access to all endpoints
- **RECEPTIONIST**: Access to patients, doctors, appointments, billing, dashboard
- **DOCTOR**: Read-only access to patients, full access to appointments
- **PATIENT**: Limited access (not implemented in current version)

### Response Codes:
- `200 OK`: Request successful
- `201 Created`: Resource created successfully
- `204 No Content`: Resource deleted successfully
- `400 Bad Request`: Invalid request data
- `401 Unauthorized`: Authentication required or invalid
- `403 Forbidden`: Insufficient permissions
- `404 Not Found`: Resource not found
- `409 Conflict`: Resource conflict (e.g., overlapping appointment)
- `500 Internal Server Error`: Server error

## Error Response Format:
```json
{
  "timestamp": "2024-01-01T12:00:00.000+00:00",
  "status": 404,
  "error": "Not Found",
  "message": "Patient not found",
  "path": "/api/patients/999"
}
```

## Testing with Postman

1. Import the provided curl commands into Postman
2. Set environment variables:
   - `base_url`: http://localhost:8080/api
   - `token`: {{login_response.body.token}} (after login request)
3. Use the following collection structure:
   - Authentication
     - Register
     - Login
   - Patients (CRUD operations)
   - Doctors (CRUD operations)
   - Appointments (CRUD + management)
   - Billing (CRUD + payment management)
   - Dashboard (statistics)

## Default Users for Testing

### Admin User:
- Username: `admin`
- Password: `admin123`
- Role: `ADMIN`

### Sample Data:
The system includes sample doctors and patients created via database migration for testing purposes.
