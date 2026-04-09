# Test Profile Update Fix
Write-Host "=== Testing Profile Update Fix ===" -ForegroundColor Green

# Login as patient
$loginBody = @{
    username = "patient"
    password = "patient123"
} | ConvertTo-Json

try {
    $loginResponse = Invoke-RestMethod -Uri "http://localhost:8080/api/auth/login" -Method POST -Body $loginBody -ContentType "application/json"
    $token = $loginResponse.token
    Write-Host "Login successful!" -ForegroundColor Green
    
    # Get current profile
    $headers = @{
        "Authorization" = "Bearer $token"
    }
    
    $profileResponse = Invoke-RestMethod -Uri "http://localhost:8080/api/patients/me" -Method GET -Headers $headers
    Write-Host "Current profile retrieved!" -ForegroundColor Green
    
    # Update profile with correct format
    $updateData = @{
        name = "Updated Patient Name"
        email = $profileResponse.email
        contactNumber = "+1234567890"
        address = "Updated Address"
        emergencyContact = "+0987654321"
        bloodGroup = "A+"
        allergies = "Updated allergies"
        dateOfBirth = "1990-05-20"
        gender = "MALE"
        medicalHistory = "Updated medical history"
    } | ConvertTo-Json
    
    $updateResponse = Invoke-RestMethod -Uri "http://localhost:8080/api/patients/$($profileResponse.id)" -Method PUT -Headers $headers -Body $updateData -ContentType "application/json"
    Write-Host "Profile updated successfully!" -ForegroundColor Green
    Write-Host "Updated Name: $($updateResponse.name)" -ForegroundColor Cyan
    Write-Host "Updated Contact: $($updateResponse.contactNumber)" -ForegroundColor Cyan
    
} catch {
    Write-Host "Test failed: $($_.Exception.Message)" -ForegroundColor Red
    if ($_.Exception.Response) {
        Write-Host "Status Code: $($_.Exception.Response.StatusCode)" -ForegroundColor Red
        try {
            $errorBody = $_.Exception.Response.GetResponseStream()
            $reader = New-Object System.IO.StreamReader($errorBody)
            $errorText = $reader.ReadToEnd()
            Write-Host "Error Body: $errorText" -ForegroundColor Red
        } catch {
            Write-Host "Could not read error body" -ForegroundColor Yellow
        }
    }
}

Write-Host "`n=== Profile Update Test Complete ===" -ForegroundColor Green
