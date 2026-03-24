$token = Get-Content token.txt # admin token
$headers = @{
    Authorization = "Bearer $token"
}

"--- Creating a new Receptionist ---"
$staffData = @{
    username = "test_receptionist"
    password = "Password123"
    email    = "receptionist@hms.com"
    name     = "Test Receptionist"
    role     = "RECEPTIONIST"
}

try {
    $response = Invoke-RestMethod -Uri "http://localhost:8080/api/staff" -Method Post -Body ($staffData | ConvertTo-Json) -ContentType "application/json" -Headers $headers
    $response | ConvertTo-Json
}
catch {
    $_.Exception.Message
}
