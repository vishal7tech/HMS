$token = Get-Content receptionist_token.txt
$headers = @{
    Authorization = "Bearer $token"
}

"--- Processing Payment for Invoice (ID: 2) ---"
$paymentData = @{
    invoiceId     = 2
    amountPaid    = 500.00
    method        = "CASH"
    transactionId = "CASH-TXN-001"
}

try {
    $response = Invoke-RestMethod -Uri "http://localhost:8080/api/payments" -Method Post -Body ($paymentData | ConvertTo-Json) -ContentType "application/json" -Headers $headers
    $response | ConvertTo-Json
    $response | Out-File -FilePath receptionist_payment_2.json -Encoding utf8

    "--- Verifying Invoice Status after Payment ---"
    $invResponse = Invoke-RestMethod -Uri "http://localhost:8080/api/invoices/2" -Method Get -Headers $headers
    $invResponse | ConvertTo-Json
}
catch {
    $_.Exception.Message
}
