$token = Get-Content dr_feedback_token.txt
$headers = @{
    Authorization = "Bearer $token"
}

"--- Doctor Profile (Me) ---"
try {
    $response = Invoke-RestMethod -Uri "http://localhost:8080/api/doctors/me" -Method Get -Headers $headers
    $response | ConvertTo-Json
    $response | Out-File -FilePath dr_feedback_profile.json -Encoding utf8
}
catch {
    $_.Exception.Message
}
