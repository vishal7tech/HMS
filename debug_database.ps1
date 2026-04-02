# Test database connection and check patient data
Write-Host "=== Database Debug ===" -ForegroundColor Green

# Test admin login first to make sure backend is working
try {
    $adminResponse = Invoke-RestMethod -Uri "http://localhost:8080/api/auth/login" -Method POST -ContentType "application/json" -Body '{"username":"admin","password":"admin123"}' -UseBasicParsing
    $adminToken = $adminResponse.token
    Write-Host "✅ Admin login successful" -ForegroundColor Green
    
    $headers = @{
        "Authorization" = "Bearer $adminToken"
        "Content-Type" = "application/json"
    }
    
    # Check all patients
    Write-Host "`nChecking all patients..." -ForegroundColor Yellow
    try {
        $patientsResponse = Invoke-RestMethod -Uri "http://localhost:8080/api/patients" -Method GET -Headers $headers -UseBasicParsing
        Write-Host "✅ Found $($patientsResponse.Count) patients in database" -ForegroundColor Green
        $patientsResponse | ForEach-Object { 
            Write-Host "  - ID: $($_.id), Name: $($_.firstName) $($_.lastName), User ID: $($_.userId)" -ForegroundColor Gray 
        }
    } catch {
        Write-Host "❌ Failed to fetch patients: $($_.Exception.Message)" -ForegroundColor Red
    }
    
    # Check all users to see if patient user exists
    Write-Host "`nChecking if patient user exists (via patient endpoints)..." -ForegroundColor Yellow
    
} catch {
    Write-Host "❌ Admin login failed: $($_.Exception.Message)" -ForegroundColor Red
}

# Now test patient login
try {
    $patientResponse = Invoke-RestMethod -Uri "http://localhost:8080/api/auth/login" -Method POST -ContentType "application/json" -Body '{"username":"patient","password":"patient123"}' -UseBasicParsing
    Write-Host "✅ Patient user exists and can login" -ForegroundColor Green
    Write-Host "Patient token: $($patientResponse.token.Substring(0, 20))..." -ForegroundColor Gray
} catch {
    Write-Host "❌ Patient login failed: $($_.Exception.Message)" -ForegroundColor Red
}

Write-Host "`n=== Database Debug Complete ===" -ForegroundColor Green
