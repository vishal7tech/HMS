$token = Get-Content token.txt
$headers = @{
    Authorization = "Bearer $token"
}

"--- Admin: List Staff ---"
try {
    $response = Invoke-RestMethod -Uri "http://localhost:8080/api/staff" -Method Get -Headers $headers
    $response | ConvertTo-Json
}
catch {
    $_.Exception.Message
}

"--- Admin: List Doctors ---"
try {
    $response = Invoke-RestMethod -Uri "http://localhost:8080/api/doctors" -Method Get -Headers $headers
    $response | ConvertTo-Json
}
catch {
    $_.Exception.Message
}
