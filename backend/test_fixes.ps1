# Verification Script for HMS Fixes
# 1. Doctor Availability
# 2. Dashboard Revenue

$baseUrl = "http://localhost:8080/api"
$adminUser = "admin_$(Get-Random)"
$adminPass = "pass123"

function Register-Admin {
    param ($username, $password)
    $body = @{
        username = $username
        password = $password
        role = "ADMIN"
    } | ConvertTo-Json

    try {
        Invoke-RestMethod -Uri "$baseUrl/auth/register" -Method Post -Body $body -ContentType "application/json"
        Write-Host "Admin registered: $username"
    } catch {
        Write-Warning "Registration failed (might already exist): $_"
    }
}

Register-Admin -username $adminUser -password $adminPass

function Get-Token {
    param ($username, $password)
    $body = @{
        username = $username
        password = $password
    } | ConvertTo-Json

    try {
        $response = Invoke-RestMethod -Uri "$baseUrl/auth/login" -Method Post -Body $body -ContentType "application/json"
        return $response.token
    } catch {
        Write-Error "Login failed response: $_"
        return $null
    }
}

$token = Get-Token -username $adminUser -password $adminPass
if (-not $token) {
    Write-Error "Could not get token. Exiting."
    exit 1
}
$headers = @{ Authorization = "Bearer $token" }

Write-Host "`n--- 1. Testing Doctor Availability ---"
$doctorName = "Dr. TestAvailability_$(Get-Random)"
$doctorBody = @{
    name = $doctorName
    specialization = "General"
    email = "dr.test_$(Get-Random)@example.com"
    phone = "1234567890"
    qualification = "MBBS"
    availability = "Mon-Fri 09:00-17:00"
    shiftStart = "09:00:00"
    shiftEnd = "17:00:00"
} | ConvertTo-Json

try {
    $doctor = Invoke-RestMethod -Uri "$baseUrl/doctors" -Method Post -Body $doctorBody -Headers $headers -ContentType "application/json"
    Write-Host "Doctor Created: $($doctor.name) (ID: $($doctor.id))"
    Write-Host "Availability: $($doctor.availability)"
    if ($doctor.availability -eq "Mon-Fri 09:00-17:00") {
        Write-Host "SUCCESS: Availability field persisted and returned." -ForegroundColor Green
    } else {
        Write-Host "FAILURE: Availability field mismatch." -ForegroundColor Red
    }
} catch {
    Write-Error "Failed to create doctor: $_"
}

Write-Host "`n--- 2. Testing Dashboard Revenue ---"

# Need a patient and appointment first to create billing
# Creating a dummy patient
$patientBody = @{
    name = "Rev Patient"
    age = 30
    email = "rev.pat_$(Get-Random)@example.com"
    phoneNumber = "9876543210"
    medicalHistory = "None"
} | ConvertTo-Json

try {
    $patient = Invoke-RestMethod -Uri "$baseUrl/patients" -Method Post -Body $patientBody -Headers $headers -ContentType "application/json"
    Write-Host "Patient Created: $($patient.id)"
} catch {
    Write-Error "Failed to create patient: $_"
}

# Creating a dummy appointment
$appTime = (Get-Date).AddDays(1).ToString("yyyy-MM-ddTHH:mm:00")
$appBody = @{
    patientId = $patient.id
    doctorId = $doctor.id
    dateTime = $appTime
    reason = "Checkup"
} | ConvertTo-Json

try {
    $app = Invoke-RestMethod -Uri "$baseUrl/appointments" -Method Post -Body $appBody -Headers $headers -ContentType "application/json"
    Write-Host "Appointment Created: $($app.id)"
} catch {
    Write-Error "Failed to create appointment: $_"
}

# Creating Billing (PAID)
$billingAmount = 500.00
$billingBody = @{
    patientId = $patient.id
    appointmentId = $app.id
    amount = $billingAmount
    paymentMethod = "CASH"
    paymentStatus = "PAID"
} | ConvertTo-Json

try {
    $billing = Invoke-RestMethod -Uri "$baseUrl/billings" -Method Post -Body $billingBody -Headers $headers -ContentType "application/json"
    Write-Host "Billing Created: $($billing.amount) (Status: $($billing.paymentStatus))"
} catch {
    Write-Error "Failed to create billing: $_"
}

# Check Dashboard Stats
try {
    $stats = Invoke-RestMethod -Uri "$baseUrl/dashboard/stats" -Method Get -Headers $headers
    Write-Host "Total Revenue from Dashboard: $($stats.totalRevenue)"
    
    if ($stats.totalRevenue -ge $billingAmount) {
         Write-Host "SUCCESS: Revenue is being calculated." -ForegroundColor Green
    } else {
         Write-Host "FAILURE: Revenue is 0 or incorrect." -ForegroundColor Red
    }

} catch {
    Write-Error "Failed to get dashboard stats: $_"
}
