# Final Debug Test
Write-Host "=== FINAL DEBUG TEST ==="
Write-Host ""

# Test with admin login and get token
try {
    $loginResponse = Invoke-RestMethod -Uri "http://localhost:8080/api/auth/login" -Method Post -Body '{"username":"admin","password":"admin123"}' -ContentType "application/json"
    $token = $loginResponse.token
    
    # Decode the JWT to see what's inside
    $tokenParts = $token.Split('.')
    $payload = $tokenParts[1]
    
    # Add padding if needed
    while ($payload.Length % 4 -ne 0) {
        $payload += "="
    }
    
    $decodedBytes = [System.Convert]::FromBase64String($payload)
    $decodedJson = [System.Text.Encoding]::UTF8.GetString($decodedBytes)
    $decoded = $decodedJson | ConvertFrom-Json
    
    Write-Host "✅ Admin login successful"
    Write-Host "JWT Token payload:"
    Write-Host $decodedJson
    Write-Host ""
    Write-Host "User role from token: $($decoded.role)"
    Write-Host "Username from token: $($decoded.sub)"
    Write-Host ""
    
    # Test API calls with this token
    $headers = @{
        "Authorization" = "Bearer $token"
        "Content-Type" = "application/json"
    }
    
    Write-Host "Testing API calls with admin token:"
    Write-Host "===================================="
    
    $apis = @(
        @{name="Patients"; url="http://localhost:8080/api/patients"},
        @{name="Doctors"; url="http://localhost:8080/api/doctors"},
        @{name="Appointments"; url="http://localhost:8080/api/appointments"},
        @{name="Billing"; url="http://localhost:8080/api/billings"}
    )
    
    foreach ($api in $apis) {
        try {
            $response = Invoke-RestMethod -Uri $api.url -Method Get -Headers $headers
            Write-Host "✅ $($api.name): $($response.Count) items found"
        } catch {
            Write-Host "❌ $($api.name): $($_.Exception.Response.StatusCode)"
        }
    }
    
} catch {
    Write-Host "❌ Login failed: $($_.Exception.Message)"
}

Write-Host ""
Write-Host "NEXT STEPS:"
Write-Host "1. Open browser: http://localhost:5173/"
Write-Host "2. Press F12 to open developer tools"
Write-Host "3. Go to Console tab"
Write-Host "4. Login as admin"
Write-Host "5. Click on Patients tab"
Write-Host "6. Look at the console output - you should see the debug messages"
Write-Host "7. Tell me what the console shows!"
