# Test Profile API Endpoints
Write-Host "=== Testing Profile API Endpoints ===" -ForegroundColor Green

# Test 1: Check if backend is accessible
Write-Host "`nTest 1: Backend Health Check" -ForegroundColor Yellow
try {
    $response = Invoke-WebRequest -Uri "http://localhost:8080/api/patients/me" -Method GET -TimeoutSec 5 -UseBasicParsing
    if ($response.StatusCode -eq 403) {
        Write-Host "Backend is running and requires authentication (403) - Expected!" -ForegroundColor Green
    } else {
        Write-Host "Backend returned unexpected status: $($response.StatusCode)" -ForegroundColor Yellow
    }
} catch {
    if ($_.Exception.Response.StatusCode -eq 403) {
        Write-Host "Backend is running and requires authentication (403) - Expected!" -ForegroundColor Green
    } else {
        Write-Host "Backend not accessible: $($_.Exception.Message)" -ForegroundColor Red
    }
}

# Test 2: Try to login as patient user
Write-Host "`nTest 2: Patient Login" -ForegroundColor Yellow
$loginBody = @{
    username = "patient"
    password = "patient123"
} | ConvertTo-Json

try {
    $loginResponse = Invoke-RestMethod -Uri "http://localhost:8080/api/auth/login" -Method POST -Body $loginBody -ContentType "application/json" -TimeoutSec 10
    if ($loginResponse.token) {
        Write-Host "Login successful! Token received." -ForegroundColor Green
        $token = $loginResponse.token
        
        # Test 3: Get patient profile with token
        Write-Host "`nTest 3: Get Patient Profile" -ForegroundColor Yellow
        $headers = @{
            "Authorization" = "Bearer $token"
        }
        
        try {
            $profileResponse = Invoke-RestMethod -Uri "http://localhost:8080/api/patients/me" -Method GET -Headers $headers -TimeoutSec 10
            Write-Host "Profile retrieved successfully!" -ForegroundColor Green
            Write-Host "Patient ID: $($profileResponse.id)" -ForegroundColor Cyan
            Write-Host "Name: $($profileResponse.name)" -ForegroundColor Cyan
            Write-Host "Email: $($profileResponse.email)" -ForegroundColor Cyan
            
            # Test 4: Update patient profile
            Write-Host "`nTest 4: Update Patient Profile" -ForegroundColor Yellow
            $updateData = @{
                name = "Updated Patient Name"
                contactNumber = "07820841208"
                address = "Updated Address"
                emergencyContact = "Updated Emergency Contact"
                bloodGroup = "A+"
                allergies = "Updated allergies"
                dateOfBirth = "1990-05-20"
                gender = "MALE"
                medicalHistory = "Updated medical history"
            } | ConvertTo-Json
            
            try {
                $updateResponse = Invoke-RestMethod -Uri "http://localhost:8080/api/patients/$($profileResponse.id)" -Method PUT -Headers $headers -Body $updateData -ContentType "application/json" -TimeoutSec 10
                Write-Host "Profile updated successfully!" -ForegroundColor Green
                Write-Host "Updated Name: $($updateResponse.name)" -ForegroundColor Cyan
                
            } catch {
                Write-Host "Profile update failed: $($_.Exception.Message)" -ForegroundColor Red
                if ($_.Exception.Response) {
                    Write-Host "Status Code: $($_.Exception.Response.StatusCode)" -ForegroundColor Red
                    $errorBody = $_.Exception.Response.GetResponseStream()
                    $reader = New-Object System.IO.StreamReader($errorBody)
                    $errorText = $reader.ReadToEnd()
                    Write-Host "Error Body: $errorText" -ForegroundColor Red
                }
            }
            
        } catch {
            Write-Host "Failed to get profile: $($_.Exception.Message)" -ForegroundColor Red
            if ($_.Exception.Response) {
                Write-Host "Status Code: $($_.Exception.Response.StatusCode)" -ForegroundColor Red
            }
        }
        
    } else {
        Write-Host "Login failed - no token received" -ForegroundColor Red
    }
} catch {
    Write-Host "Login failed: $($_.Exception.Message)" -ForegroundColor Red
    if ($_.Exception.Response) {
        Write-Host "Status Code: $($_.Exception.Response.StatusCode)" -ForegroundColor Red
        $errorBody = $_.Exception.Response.GetResponseStream()
        $reader = New-Object System.IO.StreamReader($errorBody)
        $errorText = $reader.ReadToEnd()
        Write-Host "Error Body: $errorText" -ForegroundColor Red
    }
}

Write-Host "`n=== Profile API Testing Complete ===" -ForegroundColor Green
