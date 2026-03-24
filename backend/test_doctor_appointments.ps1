$token = Get-Content dr_feedback_token.txt
$headers = @{
    Authorization = "Bearer $token"
}

"--- Doctor Appointments (ID: 2) ---"
try {
    $response = Invoke-RestMethod -Uri "http://localhost:8080/api/doctors/2/appointments" -Method Get -Headers $headers
    $response | ConvertTo-Json
    $response | Out-File -FilePath dr_feedback_appointments.json -Encoding utf8
}
catch {
    $_.Exception.Message
}
