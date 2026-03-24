$token = Get-Content doctor_token.txt
$headers = @{
    Authorization = "Bearer $token"
}

"--- Doctor Me ---"
try {
    $response = Invoke-RestMethod -Uri "http://localhost:8080/api/doctors/me" -Method Get -Headers $headers
    $response | ConvertTo-Json
}
catch {
    $_.Exception.Message
}
