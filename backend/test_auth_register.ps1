$baseUrl = "http://localhost:8080"
$randomId = Get-Random -Maximum 10000
$username = "testuser_$randomId"

$body = @{
    username = $username
    password = "password123"
    role     = "RECEPTIONIST"
} | ConvertTo-Json

Write-Host "Calling POST /api/auth/register..."
try {
    $response = Invoke-RestMethod -Uri "$baseUrl/api/auth/register" -Method Post -Body $body -ContentType "application/json"
    Write-Host "SUCCESS"
    $response
}
catch {
    Write-Host "FAILED"
    Write-Host "Status Code: $($_.Exception.Response.StatusCode.value__)"
    $reader = New-Object System.IO.StreamReader($_.Exception.Response.GetResponseStream())
    $errorBody = $reader.ReadToEnd()
    Write-Host "Error Body: $errorBody"
}
