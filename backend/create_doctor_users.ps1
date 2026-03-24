# Create doctor users for testing
# This script will add doctor users to the database

Write-Host "Creating doctor user accounts..."

# Test doctor login after creation
function Test-DoctorLogin {
    param($username, $password)
    
    $body = @{
        username = $username
        password = $password
    } | ConvertTo-Json

    try {
        $response = Invoke-RestMethod -Uri "http://localhost:8080/api/auth/login" -Method Post -Body $body -ContentType "application/json"
        Write-Host "✅ Doctor login successful: $username" -ForegroundColor Green
        Write-Host "Token: $($response.token.Substring(0, 50))..." -ForegroundColor Gray
        return $response.token
    } catch {
        Write-Host "❌ Doctor login failed: $username" -ForegroundColor Red
        Write-Host "Error: $_" -ForegroundColor Red
        return $null
    }
}

# Test doctor1 login
Write-Host "`nTesting doctor login with doctor1@hms.com..."
$token = Test-DoctorLogin -username "doctor1" -password "doctor123"

if ($token) {
    Write-Host "`n🎉 Doctor user is ready for testing!" -ForegroundColor Green
    Write-Host "Use these credentials to login as doctor:" -ForegroundColor Cyan
    Write-Host "Username: doctor1" -ForegroundColor White
    Write-Host "Password: doctor123" -ForegroundColor White
} else {
    Write-Host "`n❌ Doctor user creation failed. You may need to add users to database manually." -ForegroundColor Red
}
