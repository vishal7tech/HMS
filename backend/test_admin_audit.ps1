$token = Get-Content token.txt
$headers = @{
    Authorization = "Bearer $token"
}

"--- Admin Audit Logs ---"
try {
    $response = Invoke-RestMethod -Uri "http://localhost:8080/api/audit" -Method Get -Headers $headers
    $response | ConvertTo-Json
    $response | Out-File -FilePath admin_audit_logs.json -Encoding utf8
}
catch {
    $_.Exception.Message
}
