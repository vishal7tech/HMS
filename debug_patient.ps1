# Debug Patient Profile
Write-Host "=== Debug Patient Profile ===" -ForegroundColor Green

# Login as patient
try {
    $loginResponse = Invoke-RestMethod -Uri "http://localhost:8080/api/auth/login" -Method POST -ContentType "application/json" -Body '{"username":"patient","password":"patient123"}' -UseBasicParsing
    $patientToken = $loginResponse.token
    Write-Host "✅ Patient login successful" -ForegroundColor Green
    
    # Try to get patient profile
    $headers = @{
        "Authorization" = "Bearer $patientToken"
        "Content-Type" = "application/json"
    }
    
    Write-Host "`nTesting patient profile endpoints..." -ForegroundColor Yellow
    
    # Test /me endpoint
    try {
        $profileResponse = Invoke-RestMethod -Uri "http://localhost:8080/api/patients/me" -Method GET -Headers $headers -UseBasicParsing
        Write-Host "✅ Patient profile /me endpoint works" -ForegroundColor Green
        Write-Host "Profile ID: $($profileResponse.id)" -ForegroundColor Gray
        Write-Host "Name: $($profileResponse.firstName) $($profileResponse.lastName)" -ForegroundColor Gray
    } catch {
        Write-Host "❌ Patient profile /me endpoint failed: $($_.Exception.Message)" -ForegroundColor Red
    }
    
    # Test appointments endpoint
    try {
        $apptsResponse = Invoke-RestMethod -Uri "http://localhost:8080/api/appointments/patient/me" -Method GET -Headers $headers -UseBasicParsing
        Write-Host "✅ Patient appointments /me endpoint works" -ForegroundColor Green
        Write-Host "Appointments count: $($apptsResponse.Count)" -ForegroundColor Gray
    } catch {
        Write-Host "❌ Patient appointments /me endpoint failed: $($_.Exception.Message)" -ForegroundColor Red
    }
    
} catch {
    Write-Host "❌ Patient login failed: $($_.Exception.Message)" -ForegroundColor Red
}

Write-Host "`n=== Debug Complete ===" -ForegroundColor Green
