# Test Patient Appointment Booking Fix
# This script tests the patient appointment booking functionality

Write-Host "=== HMS Patient Appointment Booking Test ===" -ForegroundColor Green

# Test 1: Login as patient and get token
Write-Host "`n1. Testing patient login..." -ForegroundColor Yellow
try {
    $loginResponse = Invoke-RestMethod -Uri "http://localhost:8080/api/auth/login" -Method POST -ContentType "application/json" -Body '{"username":"patient","password":"patient123"}' -UseBasicParsing
    $patientToken = $loginResponse.token
    Write-Host "✅ Patient login successful" -ForegroundColor Green
    Write-Host "Token: $($patientToken.Substring(0, 20))..." -ForegroundColor Gray
} catch {
    Write-Host "❌ Patient login failed: $($_.Exception.Message)" -ForegroundColor Red
    exit 1
}

# Test 2: Fetch doctors list (should work now)
Write-Host "`n2. Testing doctors list access..." -ForegroundColor Yellow
try {
    $headers = @{
        "Authorization" = "Bearer $patientToken"
        "Content-Type" = "application/json"
    }
    $doctorsResponse = Invoke-RestMethod -Uri "http://localhost:8080/api/doctors" -Method GET -Headers $headers -UseBasicParsing
    Write-Host "✅ Doctors list fetched successfully" -ForegroundColor Green
    Write-Host "Found $($doctorsResponse.Count) doctors" -ForegroundColor Gray
    $doctorsResponse | ForEach-Object { Write-Host "  - Dr. $($_.name) ($($_.specialization))" -ForegroundColor Gray }
} catch {
    Write-Host "❌ Doctors list fetch failed: $($_.Exception.Message)" -ForegroundColor Red
    exit 1
}

# Test 3: Book appointment as patient
Write-Host "`n3. Testing appointment booking..." -ForegroundColor Yellow
if ($doctorsResponse.Count -gt 0) {
    $firstDoctor = $doctorsResponse[0]
    $appointmentData = @{
        doctorId = $firstDoctor.id
        slotTime = (Get-Date).AddDays(1).ToString("yyyy-MM-ddTHH:mm:ss")
        reason = "Test appointment booking"
        notes = "This is a test appointment"
    }
    
    try {
        $bookResponse = Invoke-RestMethod -Uri "http://localhost:8080/api/appointments" -Method POST -Headers $headers -Body ($appointmentData | ConvertTo-Json) -UseBasicParsing
        Write-Host "✅ Appointment booked successfully!" -ForegroundColor Green
        Write-Host "Appointment ID: $($bookResponse.id)" -ForegroundColor Gray
        Write-Host "Doctor: Dr. $($bookResponse.doctorName)" -ForegroundColor Gray
        Write-Host "Time: $($bookResponse.slotTime)" -ForegroundColor Gray
        Write-Host "Status: $($bookResponse.status)" -ForegroundColor Gray
    } catch {
        Write-Host "❌ Appointment booking failed: $($_.Exception.Message)" -ForegroundColor Red
        if ($_.Exception.Response) {
            $errorBody = $_.Exception.Response.GetResponseStream()
            $reader = New-Object System.IO.StreamReader($errorBody)
            $errorText = $reader.ReadToEnd()
            Write-Host "Error details: $errorText" -ForegroundColor Red
        }
    }
} else {
    Write-Host "❌ No doctors available for booking" -ForegroundColor Red
}

# Test 4: Fetch patient appointments
Write-Host "`n4. Testing patient appointments fetch..." -ForegroundColor Yellow
try {
    $patientApptsResponse = Invoke-RestMethod -Uri "http://localhost:8080/api/appointments/patient/me" -Method GET -Headers $headers -UseBasicParsing
    Write-Host "✅ Patient appointments fetched successfully" -ForegroundColor Green
    Write-Host "Found $($patientApptsResponse.Count) appointments" -ForegroundColor Gray
    $patientApptsResponse | ForEach-Object { 
        Write-Host "  - Appointment with Dr. $($_.doctorName) on $($_.slotTime) - Status: $($_.status)" -ForegroundColor Gray 
    }
} catch {
    Write-Host "❌ Patient appointments fetch failed: $($_.Exception.Message)" -ForegroundColor Red
}

Write-Host "`n=== Test Complete ===" -ForegroundColor Green
Write-Host "Patient appointment booking functionality has been tested." -ForegroundColor Cyan
