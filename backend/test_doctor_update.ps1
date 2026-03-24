$token = Get-Content dr_feedback_token.txt
$headers = @{
    Authorization = "Bearer $token"
}

"--- Updating Doctor Profile (ID: 2) ---"
$updateData = @{
    name           = "Dr. Feedback (Updated)"
    email          = "feedback_new@hms.com"
    specialization = @("Neurology", "Psychiatry", "Surgery")
    contactNumber  = "+1122334455"
    qualifications = "MBBS, MD, PhD, FACS"
}

try {
    $response = Invoke-RestMethod -Uri "http://localhost:8080/api/doctors/2" -Method Put -Body ($updateData | ConvertTo-Json) -ContentType "application/json" -Headers $headers
    $response | ConvertTo-Json
}
catch {
    $_.Exception.Message
}
