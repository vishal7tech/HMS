$token = Get-Content token.txt # admin token
$headers = @{
    Authorization = "Bearer $token"
}

"--- Creating a new Doctor ---"
$doctorData = @{
    username       = "dr_feedback"
    password       = "Password123"
    name           = "Dr. Feedback"
    email          = "feedback@hms.com"
    specialization = @("Neurology", "Psychiatry")
    contactNumber  = "+1122334455"
    qualifications = "MBBS, MD, PhD"
}

try {
    $response = Invoke-RestMethod -Uri "http://localhost:8080/api/doctors" -Method Post -Body ($doctorData | ConvertTo-Json) -ContentType "application/json" -Headers $headers
    $response | ConvertTo-Json
}
catch {
    $_.Exception.Message
    $_.ErrorDetails.Message
}
