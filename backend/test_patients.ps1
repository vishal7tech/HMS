$token = Get-Content token.txt
$headers = @{
    Authorization = "Bearer $token"
}

"--- Creating a new Patient (Fixed DTO) ---"
$patientData = @{
    username      = "john_doe"
    password      = "Password123"
    name          = "John Doe"
    email         = "john@example.com"
    contactNumber = "+1234567890"
    dateOfBirth   = "1990-01-01"
    gender        = "MALE"
    address       = "123 Main St"
}
try {
    $newPatient = Invoke-RestMethod -Uri "http://localhost:8080/api/patients" -Method Post -Body ($patientData | ConvertTo-Json) -ContentType "application/json" -Headers $headers
    $newPatient | ConvertTo-Json
}
catch {
    $_.Exception.Message
    $_.ErrorDetails.Message
}
