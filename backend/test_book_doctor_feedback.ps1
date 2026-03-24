$token = Get-Content token.txt # admin token
$headers = @{
    Authorization = "Bearer $token"
}

"--- Booking New Appointment for Dr. Feedback (ID: 2) ---"
$appointmentData = @{
    patientId = 1
    doctorId  = 2
    slotTime  = "2026-03-05T10:00:00"
    reason    = "Follow up for Neurology"
    notes     = "Patient has recurring headaches."
}

try {
    $response = Invoke-RestMethod -Uri "http://localhost:8080/api/appointments" -Method Post -Body ($appointmentData | ConvertTo-Json) -ContentType "application/json" -Headers $headers
    $response | ConvertTo-Json
    $response | Out-File -FilePath dr_feedback_new_appointment.json -Encoding utf8
}
catch {
    $_.Exception.Message
}
