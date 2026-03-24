# Test Doctor Registration
$adminLogin = @{
    username = "admin"
    password = "admin123"
} | ConvertTo-Json

# Get admin token
$loginResponse = Invoke-RestMethod -Uri "http://localhost:8080/api/auth/login" -Method Post -Body $adminLogin -ContentType "application/json"
$token = $loginResponse.token

# Register a new doctor
$doctor = @{
    firstName = "Sarah"
    lastName = "Doctor"
    email = "sarah.doctor@hms.com"
    phoneNumber = "1234567890"
    gender = "Female"
    dateOfBirth = "1985-05-15"
    specializations = @("Cardiology")
    qualifications = "MD in Cardiology"
    experienceYears = 10
    password = "doctor123"
    confirmPassword = "doctor123"
} | ConvertTo-Json -Depth 3

$headers = @{
    "Authorization" = "Bearer $token"
    "Content-Type" = "application/json"
}

try {
    $response = Invoke-RestMethod -Uri "http://localhost:8080/api/auth/register/doctor" -Method Post -Body $doctor -Headers $headers
    Write-Host "SUCCESS: Doctor registered successfully!"
    Write-Host "Response: $response"
} catch {
    Write-Host "ERROR: Failed to register doctor"
    Write-Host "Status Code: $($_.Exception.Response.StatusCode)"
    Write-Host "Error Message: $($_.Exception.Message)"
    $errorResponse = $_.Exception.Response.GetResponseStream()
    $reader = New-Object System.IO.StreamReader($errorResponse)
    $errorBody = $reader.ReadToEnd()
    Write-Host "Error Body: $errorBody"
}
