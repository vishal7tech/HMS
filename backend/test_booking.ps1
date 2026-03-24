$token = Get-Content token.txt
$headers = @{
    Authorization = "Bearer $token"
}

"--- Booking Appointment ---"
$tomorrow = (Get-Date).AddDays(1).ToString("yyyy-MM-ddT10:00:00")
$appointmentData = @{
    patientId = 1
    doctorId  = 1
    slotTime  = $tomorrow
    reason    = "Routine checkup"
    notes     = "First visit for this patient"
}

try {
    $response = Invoke-RestMethod -Uri "http://localhost:8080/api/appointments" -Method Post -Body ($appointmentData | ConvertTo-Json) -ContentType "application/json" -Headers $headers
    $response | ConvertTo-Json
}
catch {
    $_.Exception.Message
    $_.ErrorDetails.Message
}
