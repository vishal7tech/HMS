$token = Get-Content token.txt
$headers = @{
    Authorization = "Bearer $token"
}

"--- Patient Appointments (ID: 1) ---"
try {
    $response = Invoke-RestMethod -Uri "http://localhost:8080/api/appointments/patient/1" -Method Get -Headers $headers
    $response | ConvertTo-Json
}
catch {
    $_.Exception.Message
}
