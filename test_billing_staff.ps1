# Test Billing Staff Registration
$adminLogin = @{
    username = "admin"
    password = "admin123"
} | ConvertTo-Json

# Get admin token
$loginResponse = Invoke-RestMethod -Uri "http://localhost:8080/api/auth/login" -Method Post -Body $adminLogin -ContentType "application/json"
$token = $loginResponse.token

# Register billing staff
$billingStaff = @{
    firstName = "John"
    lastName = "Billing"
    email = "john.billing@hms.com"
    phoneNumber = "1234567890"
    dateOfBirth = "1990-01-01"
    gender = "MALE"
    role = "BILLING"
    department = "Billing"
    password = "billing123"
    confirmPassword = "billing123"
} | ConvertTo-Json

$headers = @{
    "Authorization" = "Bearer $token"
    "Content-Type" = "application/json"
}

try {
    $response = Invoke-RestMethod -Uri "http://localhost:8080/api/auth/register/staff" -Method Post -Body $billingStaff -Headers $headers
    Write-Host "SUCCESS: Billing staff registered successfully!"
    Write-Host "Response: $response"
} catch {
    Write-Host "ERROR: Failed to register billing staff"
    Write-Host "Status Code: $($_.Exception.Response.StatusCode)"
    Write-Host "Error Message: $($_.Exception.Message)"
    $errorResponse = $_.Exception.Response.GetResponseStream()
    $reader = New-Object System.IO.StreamReader($errorResponse)
    $errorBody = $reader.ReadToEnd()
    Write-Host "Error Body: $errorBody"
}
