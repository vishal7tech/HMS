$token = Get-Content dr_feedback_token.txt
$headers = @{
    Authorization = "Bearer $token"
}

"--- Completing Appointment (ID: 8) ---"
try {
    $response = Invoke-RestMethod -Uri "http://localhost:8080/api/appointments/8/complete" -Method Put -Headers $headers
    "Success: Appointment 8 marked as COMPLETED"
}
catch {
    $_.Exception.Message
}
