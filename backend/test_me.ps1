$token = Get-Content token.txt
$headers = @{
    Authorization = "Bearer $token"
}
$response = Invoke-RestMethod -Uri "http://localhost:8080/api/auth/me" -Method Get -Headers $headers
$response | ConvertTo-Json
