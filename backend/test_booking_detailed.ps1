$token = Get-Content token.txt
$headers = @{
    Authorization = "Bearer $token"
}

"--- Booking Appointment (Detailed) ---"
$tomorrow = (Get-Date).AddDays(2).ToString("yyyy-MM-ddT10:00:00")
$appointmentData = @{
    patientId = 1
    doctorId  = 1
    slotTime  = $tomorrow
    reason    = "Routine checkup"
    notes     = "Detailed test"
}

try {
    $response = Invoke-WebRequest -Uri "http://localhost:8080/api/appointments" -Method Post -Body ($appointmentData | ConvertTo-Json) -ContentType "application/json" -Headers $headers -ErrorAction Stop -UseBasicParsing
    "Status: " + $response.StatusCode
    $response.Content
}
catch {
    "Error: " + $_.Exception.Message
    if ($_.Exception.Response) {
        $reader = New-Object System.IO.StreamReader($_.Exception.Response.GetResponseStream())
        "Body: " + $reader.ReadToEnd()
    }
    else {
        $_.ErrorDetails
    }
}
