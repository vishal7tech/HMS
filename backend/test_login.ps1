$body = @{
    username = "admin@hms.com"
    password = "admin123"
} | ConvertTo-Json

$response = Invoke-RestMethod -Uri "http://localhost:8080/api/auth/login" `
    -Method Post `
    -ContentType "application/json" `
    -Body $body

Write-Host "Login successful!"
Write-Host "Token: $($response.token.Substring(0, 50))..."
$response | ConvertTo-Json
