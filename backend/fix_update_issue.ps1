$baseUrl = "http://localhost:8080"
$pass = "password"
$username = "receptionist_fixed"

Write-Host "1. Registering new Receptionist ($username)..."
try {
    Invoke-RestMethod -Uri "$baseUrl/auth/register" -Method Post -Body (@{username = $username; password = $pass; role = "RECEPTIONIST" } | ConvertTo-Json) -ContentType "application/json" | Out-Null
    Write-Host "   Success."
}
catch {
    Write-Host "   Note: User might already exist ($($_.Exception.Message))"
}

Write-Host "`n2. Logging in..."
try {
    $token = (Invoke-RestMethod -Uri "$baseUrl/auth/login" -Method Post -Body (@{username = $username; password = $pass } | ConvertTo-Json) -ContentType "application/json").token
    Write-Host "   Login Success."
    Write-Host "   ---------------------------------------------------"
    Write-Host "   YOUR NEW TOKEN (Copy this to Postman):"
    Write-Host "   $token"
    Write-Host "   ---------------------------------------------------"
}
catch {
    Write-Host "   Login Failed: $($_.Exception.Message)"
    exit
}

Write-Host "`n3. Creating a dummy patient to update..."
try {
    $patientBody = @{name = "Original Name"; age = 25; email = "fix_$(Get-Random)@test.com"; phoneNumber = "+1234567890"; medicalHistory = "None" } | ConvertTo-Json
    $p = Invoke-RestMethod -Uri "$baseUrl/api/patients" -Method Post -Body $patientBody -ContentType "application/json" -Headers @{Authorization = "Bearer $token" }
    $id = $p.id
    Write-Host "   Created Patient ID: $id"
}
catch {
    Write-Host "   Create Failed: $($_.Exception.Message)"
    exit
}

Write-Host "`n4. Testing Update with CORRECT URL (http://localhost:8080/api/patients/$id)..."
$updateBody = @{name = "Fixed Name"; age = 26; email = "fixed_$(Get-Random)@test.com"; phoneNumber = "+1987654321"; medicalHistory = "Updated History" } | ConvertTo-Json
try {
    # Uses correct ID in URL, no curly braces
    $updated = Invoke-RestMethod -Uri "$baseUrl/api/patients/$id" -Method Put -Body $updateBody -ContentType "application/json" -Headers @{Authorization = "Bearer $token" }
    Write-Host "   SUCCESS! Patient updated. New Name: $($updated.name)"
}
catch {
    Write-Host "   Update Failed: $($_.Exception.Message)"
    Write-Host "   Details: $($_.ErrorDetails.Message)"
}
