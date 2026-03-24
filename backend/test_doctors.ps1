$token = Get-Content token.txt
$headers = @{
    Authorization = "Bearer $token"
}

"--- Checking Doctors List ---"
try {
    $doctors = Invoke-RestMethod -Uri "http://localhost:8080/api/doctors" -Method Get -Headers $headers
    $doctors | ConvertTo-Json
}
catch {
    $_.Exception.Message
    $_.ErrorDetails.Message
}
