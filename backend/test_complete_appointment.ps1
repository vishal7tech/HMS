$token = Get-Content dr_feedback_token.txt
$headers = @{
    Authorization = "Bearer $token"
}

"--- Completing Appointment (ID: 8) ---"
try {
    $response = Invoke-RestMethod -Uri "http://localhost:8080/api/appointments/8/status?status=COMPLETED" -Method Put -Headers $headers
    $response | ConvertTo-Json
}
catch {
    $_.Exception.Message
}
