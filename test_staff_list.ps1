# Test Staff List API
$adminLogin = @{
    username = "admin"
    password = "admin123"
} | ConvertTo-Json

# Get admin token
$loginResponse = Invoke-RestMethod -Uri "http://localhost:8080/api/auth/login" -Method Post -Body $adminLogin -ContentType "application/json"
$token = $loginResponse.token

$headers = @{
    "Authorization" = "Bearer $token"
    "Content-Type" = "application/json"
}

try {
    $response = Invoke-RestMethod -Uri "http://localhost:8080/api/staff" -Method Get -Headers $headers
    Write-Host "SUCCESS: Staff list retrieved successfully!"
    Write-Host "Total staff members: $($response.Count)"
    Write-Host ""
    Write-Host "Staff List:"
    $response | ForEach-Object {
        Write-Host "ID: $($_.id), Name: $($_.name), Email: $($_.email), Role: $($_.role)"
    }
} catch {
    Write-Host "ERROR: Failed to fetch staff list"
    Write-Host "Status Code: $($_.Exception.Response.StatusCode)"
    Write-Host "Error Message: $($_.Exception.Message)"
    $errorResponse = $_.Exception.Response.GetResponseStream()
    $reader = New-Object System.IO.StreamReader($errorResponse)
    $errorBody = $reader.ReadToEnd()
    Write-Host "Error Body: $errorBody"
}
