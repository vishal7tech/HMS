# Simple Test Script
$ErrorActionPreference = "Stop"
$baseUrl = "http://localhost:8080/api"

Write-Host "Testing connectivity..."
try {
    $res = Invoke-RestMethod -Uri "$baseUrl/ping" -Method Get
    Write-Host "Ping response: $res"
}
catch {
    Write-Warning "Ping failed or endpoint not found: $($_.Exception.Message)"
}

Write-Host "Registering Admin..."
$adminUser = "admin_check_$(Get-Random)"
$password = "pass123"
$body = @{ username = $adminUser; password = $password; role = "ADMIN" } | ConvertTo-Json

try {
    Invoke-RestMethod -Uri "$baseUrl/auth/register" -Method Post -Body $body -ContentType "application/json"
    Write-Host "Admin Registered: $adminUser"
}
catch {
    Write-Error "Registration failed: $($_.Exception.Message)"
}

Write-Host "Logging in..."
$loginBody = @{ username = $adminUser; password = $password } | ConvertTo-Json
try {
    $tokenRes = Invoke-RestMethod -Uri "$baseUrl/auth/login" -Method Post -Body $loginBody -ContentType "application/json"
    $token = $tokenRes.token
    Write-Host "Token obtained length: $($token.Length)"
}
catch {
    Write-Error "Login failed: $($_.Exception.Message)"
}
