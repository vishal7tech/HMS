$user = "recep_manual_$(Get-Random)"
$pass = "password"
$baseUrl = "http://localhost:8080"

# Register
Invoke-RestMethod -Uri "$baseUrl/auth/register" -Method Post -Body (@{username = $user; password = $pass; role = "RECEPTIONIST" } | ConvertTo-Json) -ContentType "application/json" | Out-Null

# Login
$token = (Invoke-RestMethod -Uri "$baseUrl/auth/login" -Method Post -Body (@{username = $user; password = $pass } | ConvertTo-Json) -ContentType "application/json").token

# Create
try {
    $body = @{name = "Manual Test"; age = 25; email = "manual_$(Get-Random)@test.com"; phoneNumber = "+1234567890"; medicalHistory = "ok" } | ConvertTo-Json
    $p = Invoke-RestMethod -Uri "$baseUrl/api/patients" -Method Post -Body $body -Headers @{Authorization = "Bearer $token" } -ContentType "application/json"
    Write-Host "CREATED_PATIENT_ID:$($p.id)"
}
catch {
    Write-Host "CREATE_FAILED"
    Write-Host "ERROR: $($_.Exception.Message)"
    if ($_.ErrorDetails) {
        Write-Host "DETAILS: $($_.ErrorDetails.Message)"
    }
}
