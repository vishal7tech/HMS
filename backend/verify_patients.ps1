$baseUrl = "http://localhost:8080"
$adminUser = "admin_test_$(Get-Random)"
$recepUser = "recep_test_$(Get-Random)"
$docUser = "doc_test_$(Get-Random)"
$pass = "password"

Write-Host "Registering Users..."
try {
    Invoke-RestMethod -Uri "$baseUrl/auth/register" -Method Post -Body (@{username=$adminUser; password=$pass; role="ADMIN"} | ConvertTo-Json) -ContentType "application/json" | Out-Null
    Invoke-RestMethod -Uri "$baseUrl/auth/register" -Method Post -Body (@{username=$recepUser; password=$pass; role="RECEPTIONIST"} | ConvertTo-Json) -ContentType "application/json" | Out-Null
    Invoke-RestMethod -Uri "$baseUrl/auth/register" -Method Post -Body (@{username=$docUser; password=$pass; role="DOCTOR"} | ConvertTo-Json) -ContentType "application/json" | Out-Null
    Write-Host "Registration Complete."
} catch {
    Write-Host "Registration Failed: $($_.Exception.Message)"
    exit
}

Write-Host "Logging in..."
try {
    $adminToken = (Invoke-RestMethod -Uri "$baseUrl/auth/login" -Method Post -Body (@{username=$adminUser; password=$pass} | ConvertTo-Json) -ContentType "application/json").token
    $recepToken = (Invoke-RestMethod -Uri "$baseUrl/auth/login" -Method Post -Body (@{username=$recepUser; password=$pass} | ConvertTo-Json) -ContentType "application/json").token
    $docToken = (Invoke-RestMethod -Uri "$baseUrl/auth/login" -Method Post -Body (@{username=$docUser; password=$pass} | ConvertTo-Json) -ContentType "application/json").token
    Write-Host "Tokens acquired."
} catch {
    Write-Host "Login Failed: $($_.Exception.Message)"
    exit
}

# 1. Create Patient (Receptionist) - Should Success
$patientEmail = "test_$(Get-Random)@patient.com"
$patientBody = @{
    name = "Test Patient"
    age = 30
    email = $patientEmail
    phoneNumber = "+1234567890"
    medicalHistory = "None"
} | ConvertTo-Json

Write-Host "`nTesting Create Patient (Receptionist)..."
try {
    $p = Invoke-RestMethod -Uri "$baseUrl/api/patients" -Method Post -Body $patientBody -ContentType "application/json" -Headers @{Authorization="Bearer $recepToken"}
    Write-Host "SUCCESS: Created Patient ID: $($p.id)"
} catch {
    Write-Host "FAILED: $($_.Exception.Message)"
    Write-Host "Response: $($_.ErrorDetails.Message)"
}

# 2. Create Patient (Doctor) - Should Fail
Write-Host "`nTesting Create Patient (Doctor) [Expect Failure]..."
try {
   Invoke-RestMethod -Uri "$baseUrl/api/patients" -Method Post -Body $patientBody -ContentType "application/json" -Headers @{Authorization="Bearer $docToken"}
   Write-Host "FAILED: Doctor was able to create patient (Unexpected)"
} catch {
   Write-Host "SUCCESS: Doctor denied (Caught expected exception: $($_.Exception.Message))"
}

# 3. Get Patients (Doctor) - Should Success
Write-Host "`nTesting Get Patients (Doctor)..."
try {
   $list = Invoke-RestMethod -Uri "$baseUrl/api/patients" -Method Get -Headers @{Authorization="Bearer $docToken"}
   Write-Host "SUCCESS: Retrieved $($list.Count) patients."
} catch {
   Write-Host "FAILED: $($_.Exception.Message)"
}

# 4. Delete Patient (Receptionist) - Should Fail
if ($p) {
    Write-Host "`nTesting Delete Patient (Receptionist) [Expect Failure]..."
    try {
        Invoke-RestMethod -Uri "$baseUrl/api/patients/$($p.id)" -Method Delete -Headers @{Authorization="Bearer $recepToken"}
        Write-Host "FAILED: Receptionist was able to delete patient (Unexpected)"
    } catch {
        Write-Host "SUCCESS: Receptionist denied (Caught expected exception: $($_.Exception.Message))"
    }

    # 5. Delete Patient (Admin) - Should Success
    Write-Host "`nTesting Delete Patient (Admin)..."
    try {
        Invoke-RestMethod -Uri "$baseUrl/api/patients/$($p.id)" -Method Delete -Headers @{Authorization="Bearer $adminToken"}
        Write-Host "SUCCESS: Admin deleted patient."
    } catch {
        Write-Host "FAILED: $($_.Exception.Message)"
    }
}
