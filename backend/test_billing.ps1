$base_url = "http://localhost:8080/api"

# 1. Login to get token
Write-Host "Logging in as admin..."
$login_body = @{
    username = "adminpart5"
    password = "passwordpart5"
} | ConvertTo-Json

$login_response = Invoke-RestMethod -Uri "$base_url/auth/login" -Method Post -Body $login_body -ContentType "application/json"
$token = $login_response.token
$headers = @{ Authorization = "Bearer $token" }

# 2. Create Billing (Assuming appointment 15 and patient 56 exist from previous screenshots)
Write-Host "Creating bill for appointment 15..."
$billing_body = @{
    appointmentId = 15
    patientId     = 56
    amount        = 500.00
    paymentStatus = "PAID"
    paymentMethod = "CASH"
} | ConvertTo-Json

$billing_response = Invoke-RestMethod -Uri "$base_url/billings" -Method Post -Body $billing_body -Headers $headers -ContentType "application/json"
Write-Host "Billing created: ID $($billing_response.id)"

# 3. Get Billing by Patient
Write-Host "Fetching bills for patient 56..."
$bills = Invoke-RestMethod -Uri "$base_url/billings/patient/56" -Method Get -Headers $headers
Write-Host "Found $($bills.Count) bills for patient 56"

Write-Host "Verification complete."
