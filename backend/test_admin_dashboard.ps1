$token = Get-Content token.txt # admin token
$headers = @{
    Authorization = "Bearer $token"
}

"--- Admin Dashboard Stats ---"
try {
    $response = Invoke-RestMethod -Uri "http://localhost:8080/api/dashboard/stats" -Method Get -Headers $headers
    $response | ConvertTo-Json
    $response | Out-File -FilePath admin_dashboard_stats.json -Encoding utf8
}
catch {
    $_.Exception.Message
}

"--- Admin Dashboard Chart Data ---"
try {
    $response = Invoke-RestMethod -Uri "http://localhost:8080/api/dashboard/chart-data" -Method Get -Headers $headers
    $response | ConvertTo-Json
}
catch {
    $_.Exception.Message
}
