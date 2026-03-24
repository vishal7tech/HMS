$headers = @{
    "Authorization" = "Bearer invalid.token.value"
    "Content-Type"  = "application/json"
}

try {
    Invoke-RestMethod -Uri "http://localhost:8080/api/auth/login" -Method Post -Headers $headers -Body '{}'
}
catch {
    Write-Host "Status Code: $($_.Exception.Response.StatusCode.value__)"
    Write-Host "Response: $($_.ErrorDetails.Message)"
}

try {
    Invoke-RestMethod -Uri "http://localhost:8080/v3/api-docs" -Method Get -Headers $headers
}
catch {
    Write-Host "Swagger Status Code: $($_.Exception.Response.StatusCode.value__)"
}
