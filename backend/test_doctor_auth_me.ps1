$token = Get-Content dr_feedback_token.txt
$headers = @{
    Authorization = "Bearer $token"
}

"--- Doctor Me (Auth Check) ---"
try {
    $response = Invoke-RestMethod -Uri "http://localhost:8080/api/auth/me" -Method Get -Headers $headers
    $response | ConvertTo-Json
}
catch {
    $_.Exception.Message
}
