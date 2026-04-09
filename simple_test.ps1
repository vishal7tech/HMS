# Simple test for automatic invoice generation

$baseUrl = "http://localhost:8080"

Write-Host "=== Testing Automatic Invoice Generation ===" -ForegroundColor Green

# Step 1: Login as Admin
Write-Host "`n1. Logging in as Admin..." -ForegroundColor Yellow
try {
    $loginResponse = Invoke-RestMethod -Uri "$baseUrl/api/auth/login" -Method POST -ContentType "application/json" -Body '{"username": "admin@hms.com", "password": "admin123"}' -UseBasicParsing
    $adminToken = $loginResponse.token
    Write-Host "✓ Admin login successful" -ForegroundColor Green
} catch {
    Write-Host "✗ Admin login failed: $($_.Exception.Message)" -ForegroundColor Red
    exit 1
}

# Step 2: Get appointments
Write-Host "`n2. Fetching appointments..." -ForegroundColor Yellow
$headers = @{
    "Authorization" = "Bearer $adminToken"
    "Content-Type" = "application/json"
}

try {
    $appointmentsResponse = Invoke-RestMethod -Uri "$baseUrl/api/appointments" -Method GET -Headers $headers -UseBasicParsing
    $scheduledAppointments = $appointmentsResponse | Where-Object { $_.status -eq "SCHEDULED" -or $_.status -eq "CONFIRMED" }
    
    if ($scheduledAppointments.Count -eq 0) {
        Write-Host "⚠ No scheduled appointments found." -ForegroundColor Yellow
        Write-Host "Please create an appointment first using the UI." -ForegroundColor Yellow
        exit 0
    }
    
    $appointmentToComplete = $scheduledAppointments[0]
    Write-Host "✓ Found appointment: $($appointmentToComplete.id) - $($appointmentToComplete.patientName)" -ForegroundColor Green
} catch {
    Write-Host "✗ Failed to get appointments: $($_.Exception.Message)" -ForegroundColor Red
    exit 1
}

# Step 3: Complete the appointment
Write-Host "`n3. Marking appointment as completed..." -ForegroundColor Yellow
try {
    Invoke-RestMethod -Uri "$baseUrl/api/appointments/$($appointmentToComplete.id)/complete" -Method PUT -Headers $headers -UseBasicParsing
    Write-Host "✓ Appointment marked as completed" -ForegroundColor Green
} catch {
    Write-Host "✗ Failed to complete appointment: $($_.Exception.Message)" -ForegroundColor Red
    exit 1
}

# Step 4: Wait for invoice generation
Write-Host "`n4. Waiting for automatic invoice generation..." -ForegroundColor Yellow
Start-Sleep -Seconds 5

# Step 5: Login as Billing user
Write-Host "`n5. Logging in as Billing user..." -ForegroundColor Yellow
try {
    $billingLoginResponse = Invoke-RestMethod -Uri "$baseUrl/api/auth/login" -Method POST -ContentType "application/json" -Body '{"username": "Billing1@hms.com", "password": "billing123"}' -UseBasicParsing
    $billingToken = $billingLoginResponse.token
    Write-Host "✓ Billing user login successful" -ForegroundColor Green
} catch {
    Write-Host "✗ Billing login failed: $($_.Exception.Message)" -ForegroundColor Red
    exit 1
}

$billingHeaders = @{
    "Authorization" = "Bearer $billingToken"
    "Content-Type" = "application/json"
}

# Step 6: Check invoices
Write-Host "`n6. Checking invoices..." -ForegroundColor Yellow
try {
    $invoicesResponse = Invoke-RestMethod -Uri "$baseUrl/api/invoices" -Method GET -Headers $billingHeaders -UseBasicParsing
    $invoices = $invoicesResponse
    
    Write-Host "Total invoices: $($invoices.Count)" -ForegroundColor Cyan
    
    # Look for invoice related to our completed appointment
    $relatedInvoice = $invoices | Where-Object { $_.appointmentId -eq $appointmentToComplete.id }
    
    if ($relatedInvoice) {
        Write-Host "✓ SUCCESS: Invoice automatically generated!" -ForegroundColor Green
        Write-Host "  Invoice #: $($relatedInvoice.invoiceNumber)" -ForegroundColor White
        Write-Host "  Patient: $($relatedInvoice.patientName)" -ForegroundColor White
        Write-Host "  Amount: $($relatedInvoice.totalAmount)" -ForegroundColor White
        Write-Host "  Status: $($relatedInvoice.status)" -ForegroundColor White
    } else {
        Write-Host "⚠ No invoice found for the completed appointment" -ForegroundColor Yellow
        Write-Host "Checking recent invoices..." -ForegroundColor Yellow
        if ($invoices.Count -gt 0) {
            $invoices | Select-Object -First 3 | ForEach-Object {
                Write-Host "  - $($_.invoiceNumber): $($_.patientName) - $($_.totalAmount) ($($_.status))" -ForegroundColor White
            }
        }
    }
} catch {
    Write-Host "✗ Failed to check invoices: $($_.Exception.Message)" -ForegroundColor Red
    exit 1
}

# Step 7: Check billing stats
Write-Host "`n7. Checking billing dashboard..." -ForegroundColor Yellow
try {
    $statsResponse = Invoke-RestMethod -Uri "$baseUrl/api/billing/stats" -Method GET -Headers $billingHeaders -UseBasicParsing
    $stats = $statsResponse
    
    Write-Host "Billing Statistics:" -ForegroundColor Cyan
    Write-Host "  - Total Revenue: $($stats.totalRevenue)" -ForegroundColor White
    Write-Host "  - Pending Count: $($stats.pendingCount)" -ForegroundColor White
    Write-Host "  - Invoice Count: $($stats.invoiceCount)" -ForegroundColor White
} catch {
    Write-Host "✗ Failed to get billing stats: $($_.Exception.Message)" -ForegroundColor Red
}

Write-Host "`n=== Test Completed ===" -ForegroundColor Green
