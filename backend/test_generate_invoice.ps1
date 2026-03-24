$token = Get-Content receptionist_token.txt
$headers = @{
    Authorization = "Bearer $token"
}

"--- Generating Invoice for Appointment (ID: 8) ---"
try {
    $response = Invoke-RestMethod -Uri "http://localhost:8080/api/invoices/generate/8" -Method Post -Headers $headers
    $response | ConvertTo-Json
    $response | Out-File -FilePath receptionist_invoice_8.json -Encoding utf8
}
catch {
    $_.Exception.Message
}
