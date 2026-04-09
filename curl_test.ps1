# Test automatic invoice generation using curl commands

$baseUrl = "http://localhost:8080"

Write-Host "=== Testing Automatic Invoice Generation ===" -ForegroundColor Green

# Step 1: Admin login
Write-Host "`n1. Admin login..." -ForegroundColor Yellow
$adminLogin = curl.exe -s -X POST "$baseUrl/api/auth/login" -H "Content-Type: application/json" -d '{"username": "admin@hms.com", "password": "admin123"}'
$adminToken = ($adminLogin | ConvertFrom-Json).token
Write-Host "Token received: $adminToken" -ForegroundColor Green

# Step 2: Get appointments
Write-Host "`n2. Getting appointments..." -ForegroundColor Yellow
$appointments = curl.exe -s -X GET "$baseUrl/api/appointments" -H "Authorization: Bearer $adminToken"
Write-Host "Appointments: $appointments" -ForegroundColor White

# Step 3: Complete first scheduled appointment
Write-Host "`n3. Completing appointment..." -ForegroundColor Yellow
$appointmentsObj = $appointments | ConvertFrom-Json
$scheduledAppointments = $appointmentsObj | Where-Object { $_.status -eq "SCHEDULED" -or $_.status -eq "CONFIRMED" }

if ($scheduledAppointments.Count -gt 0) {
    $appointmentId = $scheduledAppointments[0].id
    Write-Host "Completing appointment ID: $appointmentId" -ForegroundColor White
    
    $completeResponse = curl.exe -s -X PUT "$baseUrl/api/appointments/$appointmentId/complete" -H "Authorization: Bearer $adminToken"
    Write-Host "Completion response: $completeResponse" -ForegroundColor Green
    
    # Step 4: Wait and check invoices
    Write-Host "`n4. Waiting for invoice generation..." -ForegroundColor Yellow
    Start-Sleep -Seconds 3
    
    # Step 5: Billing login
    Write-Host "`n5. Billing login..." -ForegroundColor Yellow
    $billingLogin = curl.exe -s -X POST "$baseUrl/api/auth/login" -H "Content-Type: application/json" -d '{"username": "Billing1@hms.com", "password": "billing123"}'
    $billingToken = ($billingLogin | ConvertFrom-Json).token
    Write-Host "Billing token received" -ForegroundColor Green
    
    # Step 6: Check invoices
    Write-Host "`n6. Checking invoices..." -ForegroundColor Yellow
    $invoices = curl.exe -s -X GET "$baseUrl/api/invoices" -H "Authorization: Bearer $billingToken"
    Write-Host "Invoices: $invoices" -ForegroundColor White
    
    # Step 7: Check billing stats
    Write-Host "`n7. Checking billing stats..." -ForegroundColor Yellow
    $stats = curl.exe -s -X GET "$baseUrl/api/billing/stats" -H "Authorization: Bearer $billingToken"
    Write-Host "Billing stats: $stats" -ForegroundColor White
    
    Write-Host "`n✓ Test completed!" -ForegroundColor Green
} else {
    Write-Host "⚠ No scheduled appointments found" -ForegroundColor Yellow
    Write-Host "Please create an appointment first" -ForegroundColor Yellow
}
