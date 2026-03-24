# HMS Functionality Test Script (Fixed)
$ErrorActionPreference = "Stop"

$baseUrl = "http://localhost:8080/api"
$randomId = Get-Random

# Users
$adminUser = "admin_$randomId"
$docUser = "doctor_$randomId"
$recepUser = "recep_$randomId"
$password = "pass123"

function Register-User {
    param ($username, $role, $doctorId)
    $body = @{ username = $username; password = $password; role = $role; doctorId = $doctorId }
    if ($doctorId) { $body.doctorId = $doctorId }
    $json = $body | ConvertTo-Json
    try {
        $res = Invoke-RestMethod -Uri "$baseUrl/auth/register" -Method Post -Body $json -ContentType "application/json"
        Write-Host "Registered $role user: $username " -ForegroundColor Green
    }
    catch {
        Write-Warning "Registration failed for $username: $($_.Exception.Message)"
    }
}

function Get-Token {
    param ($username)
    $body = @{ username = $username; password = $password } | ConvertTo-Json
    try {
        $res = Invoke-RestMethod -Uri "$baseUrl/auth/login" -Method Post -Body $body -ContentType "application/json"
        return $res.token
    }
    catch {
        Write-Error "Login failed for $username: $($_.Exception.Message)"
        return $null
    }
}

Write-Host "`n--- 1. Authentication & Roles ---"
Register-User -username $adminUser -role "ADMIN"
Register-User -username $recepUser -role "RECEPTIONIST"

$adminToken = Get-Token -username $adminUser
if (!$adminToken) { exit }
$adminHeaders = @{ Authorization = "Bearer $adminToken" }

Write-Host "`n--- 2. Doctor Management (Phase 5) ---"
$docName = "Dr. Test_$randomId"
$docBody = @{
    name           = $docName
    specialization = "Cardiology"
    email          = "dr_$randomId@test.com"
    phone          = "1234567890"
    qualification  = "MD"
    availability   = "Mon-Fri 09:00-17:00"
    shiftStart     = "09:00:00"
    shiftEnd       = "17:00:00"
} | ConvertTo-Json

try {
    $doctor = Invoke-RestMethod -Uri "$baseUrl/doctors" -Method Post -Body $docBody -Headers $adminHeaders -ContentType "application/json"
    Write-Host "Doctor Created: $($doctor.name) (ID: $($doctor.id))" -ForegroundColor Green
}
catch {
    Write-Error "Failed to create doctor: $($_.ToString())"
    exit
}

# Register Doctor User
Register-User -username $docUser -role "DOCTOR" -doctorId $doctor.id
$docToken = Get-Token -username $docUser
$recepToken = Get-Token -username $recepUser

$docHeaders = @{ Authorization = "Bearer $docToken" }
$recepHeaders = @{ Authorization = "Bearer $recepToken" }

Write-Host "`n--- 3. Patient Management (Phase 4) ---"
$patName = "Patient_$randomId"
$patBody = @{
    name           = $patName
    age            = 30
    email          = "pat_$randomId@test.com"
    phoneNumber    = "9876543210"
    medicalHistory = "Healthy"
    gender         = "MALE"
} | ConvertTo-Json

try {
    $patient = Invoke-RestMethod -Uri "$baseUrl/patients" -Method Post -Body $patBody -Headers $recepHeaders -ContentType "application/json"
    Write-Host "Patient Created: $($patient.name) (ID: $($patient.id))" -ForegroundColor Green
}
catch {
    Write-Error "Receptionist failed to create patient: $($_.ToString())"
}

try {
    $readPat = Invoke-RestMethod -Uri "$baseUrl/patients/$($patient.id)" -Method Get -Headers $docHeaders
    Write-Host "Doctor retrieved patient: $($readPat.name)" -ForegroundColor Green
}
catch {
    Write-Error "Doctor failed to read patient: $($_.ToString())"
}

Write-Host "`n--- 4. Appointment Booking & Overlap (Phase 5) ---"
$today = Get-Date
$future = $today.AddDays(2)
$appTime = Get-Date -Date $future -Hour 10 -Minute 0 -Second 0
$dateTimeStr = $appTime.ToString("yyyy-MM-ddTHH:mm:00")

$appBody = @{
    patientId = $patient.id
    doctorId  = $doctor.id
    dateTime  = $dateTimeStr
    reason    = "Consultation"
} | ConvertTo-Json

# Book 1st
try {
    $app = Invoke-RestMethod -Uri "$baseUrl/appointments" -Method Post -Body $appBody -Headers $recepHeaders -ContentType "application/json"
    Write-Host "Appointment 1 Booked: $($app.dateTime)" -ForegroundColor Green
}
catch {
    Write-Error "Failed to book appointment 1: $($_.ToString())"
    exit
}

# Overlap
Write-Host "Attempting Overlapping Booking..."
try {
    Invoke-RestMethod -Uri "$baseUrl/appointments" -Method Post -Body $appBody -Headers $recepHeaders -ContentType "application/json"
    Write-Error "FAILURE: Overlapping appointment was allowed!" 
}
catch {
    if ($_.Exception.Response.StatusCode -eq [System.Net.HttpStatusCode]::Conflict) {
        Write-Host "SUCCESS: Overlapping appointment rejected (409 Conflict)" -ForegroundColor Green
    }
    else {
        Write-Error "FAILURE: Unexpected error code: $($_.Exception.Response.StatusCode)"
    }
}

Write-Host "`n--- 5. Billing & Dashboard (Phase 5) ---"
$billAmount = 150.00
$billBody = @{
    patientId     = $patient.id
    appointmentId = $app.id
    amount        = $billAmount
    paymentMethod = "CARD"
    paymentStatus = "PAID"
} | ConvertTo-Json

try {
    $bill = Invoke-RestMethod -Uri "$baseUrl/billings" -Method Post -Body $billBody -Headers $recepHeaders -ContentType "application/json"
    Write-Host "Bill Created: $($bill.amount)" -ForegroundColor Green
}
catch {
    Write-Error "Failed to create bill: $($_.ToString())"
}

try {
    $stats = Invoke-RestMethod -Uri "$baseUrl/dashboard/stats" -Method Get -Headers $adminHeaders
    Write-Host "Dashboard Revenue: $($stats.totalRevenue)"
    if ($stats.totalRevenue -ge $billAmount) {
        Write-Host "SUCCESS: Dashboard reflects revenue." -ForegroundColor Green
    }
    else {
        Write-Error "FAILURE: Revenue not updated."
    }
}
catch {
    Write-Error "Failed to get dashboard stats: $($_.ToString())"
}
