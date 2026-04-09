# Test script for automatic invoice generation on appointment completion

# Base URL
$baseUrl = "http://localhost:8080"

Write-Host "=== Testing Automatic Invoice Generation ===" -ForegroundColor Green

try {
    # Step 1: Login as Admin
    Write-Host "`n1. Logging in as Admin..." -ForegroundColor Yellow
    $loginResponse = Invoke-RestMethod -Uri "$baseUrl/api/auth/login" -Method POST -ContentType "application/json" -Body '{
        "username": "admin@hms.com",
        "password": "admin123"
    }' -UseBasicParsing
    
    $adminToken = $loginResponse.token
    Write-Host "✓ Admin login successful" -ForegroundColor Green
    
    # Step 2: Get appointments
    Write-Host "`n2. Fetching appointments..." -ForegroundColor Yellow
    $headers = @{
        "Authorization" = "Bearer $adminToken"
        "Content-Type" = "application/json"
    }
    
    $appointmentsResponse = Invoke-RestMethod -Uri "$baseUrl/api/appointments" -Method GET -Headers $headers -UseBasicParsing
    $appointments = $appointmentsResponse | Where-Object { $_.status -eq "SCHEDULED" -or $_.status -eq "CONFIRMED" }
    
    if ($appointments.Count -eq 0) {
        Write-Host "⚠ No scheduled appointments found to complete. Creating a test appointment first..." -ForegroundColor Yellow
        
        # Get patients and doctors for creating appointment
        $patientsResponse = Invoke-RestMethod -Uri "$baseUrl/api/patients" -Method GET -Headers $headers -UseBasicParsing
        $doctorsResponse = Invoke-RestMethod -Uri "$baseUrl/api/doctors" -Method GET -Headers $headers -UseBasicParsing
        
        if ($patientsResponse.Count -eq 0 -or $doctorsResponse.Count -eq 0) {
            Write-Host "✗ No patients or doctors available. Please seed the database first." -ForegroundColor Red
            exit 1
        }
        
        $newAppointment = @{
            patientId = $patientsResponse[0].id
            doctorId = $doctorsResponse[0].id
            slotTime = (Get-Date).AddHours(1).ToString("yyyy-MM-ddTHH:mm:ss")
            reason = "Test appointment for invoice generation"
            notes = "Auto-generated test appointment"
        }
        
        $createResponse = Invoke-RestMethod -Uri "$baseUrl/api/appointments" -Method POST -Headers $headers -Body ($newAppointment | ConvertTo-Json) -UseBasicParsing
        $appointments = @($createResponse)
        Write-Host "✓ Created test appointment: $($appointments[0].id)" -ForegroundColor Green
    }
    
    $appointmentToComplete = $appointments[0]
    Write-Host "✓ Found appointment to complete: $($appointmentToComplete.id) - $($appointmentToComplete.patientName)" -ForegroundColor Green
    
    # Step 3: Complete the appointment
    Write-Host "`n3. Marking appointment as completed..." -ForegroundColor Yellow
    $completeResponse = Invoke-RestMethod -Uri "$baseUrl/api/appointments/$($appointmentToComplete.id)/complete" -Method PUT -Headers $headers -UseBasicParsing
    Write-Host "✓ Appointment marked as completed" -ForegroundColor Green
    
    # Step 4: Wait a moment for async invoice generation
    Write-Host "`n4. Waiting for automatic invoice generation..." -ForegroundColor Yellow
    Start-Sleep -Seconds 3
    
    # Step 5: Login as Billing user
    Write-Host "`n5. Logging in as Billing user..." -ForegroundColor Yellow
    $billingLoginResponse = Invoke-RestMethod -Uri "$baseUrl/api/auth/login" -Method POST -ContentType "application/json" -Body '{
        "username": "Billing1@hms.com",
        "password": "billing123"
    }' -UseBasicParsing
    
    $billingToken = $billingLoginResponse.token
    Write-Host "✓ Billing user login successful" -ForegroundColor Green
    
    $billingHeaders = @{
        "Authorization" = "Bearer $billingToken"
        "Content-Type" = "application/json"
    }
    
    # Step 6: Check billing dashboard
    Write-Host "`n6. Checking billing dashboard..." -ForegroundColor Yellow
    $billingStatsResponse = Invoke-RestMethod -Uri "$baseUrl/api/billing/stats" -Method GET -Headers $billingHeaders -UseBasicParsing
    $stats = $billingStatsResponse
    
    Write-Host "Billing Statistics:" -ForegroundColor Cyan
    Write-Host "  - Total Revenue: $($stats.totalRevenue)" -ForegroundColor White
    Write-Host "  - Pending Count: $($stats.pendingCount)" -ForegroundColor White
    Write-Host "  - Invoice Count: $($stats.invoiceCount)" -ForegroundColor White
    Write-Host "  - Today's Billing: $($stats.todayBilling)" -ForegroundColor White
    
    # Step 7: Check invoices
    Write-Host "`n7. Checking invoices..." -ForegroundColor Yellow
    $invoicesResponse = Invoke-RestMethod -Uri "$baseUrl/api/invoices" -Method GET -Headers $billingHeaders -UseBasicParsing
    $invoices = $invoicesResponse
    
    Write-Host "Total invoices: $($invoices.Count)" -ForegroundColor Cyan
    
    # Look for invoice related to our completed appointment
    $relatedInvoice = $invoices | Where-Object { $_.appointmentId -eq $appointmentToComplete.id }
    
    if ($relatedInvoice) {
        Write-Host "✓ SUCCESS: Invoice automatically generated for completed appointment!" -ForegroundColor Green
        Write-Host "  Invoice Details:" -ForegroundColor Cyan
        Write-Host "    - Invoice #: $($relatedInvoice.invoiceNumber)" -ForegroundColor White
        Write-Host "    - Patient: $($relatedInvoice.patientName)" -ForegroundColor White
        Write-Host "    - Amount: $($relatedInvoice.totalAmount)" -ForegroundColor White
        Write-Host "    - Status: $($relatedInvoice.status)" -ForegroundColor White
        Write-Host "    - Due Date: $($relatedInvoice.dueDate)" -ForegroundColor White
    } else {
        Write-Host "⚠ WARNING: No invoice found for the completed appointment. Checking all invoices..." -ForegroundColor Yellow
        if ($invoices.Count -gt 0) {
            Write-Host "Recent invoices:" -ForegroundColor Cyan
            $invoices | Select-Object -First 3 | ForEach-Object {
                Write-Host "  - $($_.invoiceNumber): $($_.patientName) - $($_.totalAmount) ($($_.status))" -ForegroundColor White
            }
        } else {
            Write-Host "✗ No invoices found in the system" -ForegroundColor Red
        }
    }
    
    # Step 8: Check completed appointments without invoices
    Write-Host "`n8. Checking completed appointments without invoices..." -ForegroundColor Yellow
    $completedAppointmentsResponse = Invoke-RestMethod -Uri "$baseUrl/api/billing/completed-appointments" -Method GET -Headers $billingHeaders -UseBasicParsing
    $completedWithoutInvoices = $completedAppointmentsResponse
    
    Write-Host "Completed appointments without invoices: $($completedWithoutInvoices.Count)" -ForegroundColor Cyan
    
    # Step 9: Test payment recording
    if ($relatedInvoice) {
        Write-Host "`n9. Testing payment recording..." -ForegroundColor Yellow
        $paymentUpdate = @{
            paymentStatus = "PAID"
        }
        
        $paymentResponse = Invoke-RestMethod -Uri "$baseUrl/api/invoices/$($relatedInvoice.id)/payment-status" -Method PUT -Headers $billingHeaders -Body ($paymentUpdate | ConvertTo-Json) -UseBasicParsing
        Write-Host "✓ Payment status updated to PAID" -ForegroundColor Green
        
        # Check updated stats
        $updatedStatsResponse = Invoke-RestMethod -Uri "$baseUrl/api/billing/stats" -Method GET -Headers $billingHeaders -UseBasicParsing
        $updatedStats = $updatedStatsResponse
        
        Write-Host "Updated Billing Statistics:" -ForegroundColor Cyan
        Write-Host "  - Total Revenue: $($updatedStats.totalRevenue)" -ForegroundColor White
        Write-Host "  - Paid Amount: $($updatedStats.paidAmount)" -ForegroundColor White
        Write-Host "  - Pending Count: $($updatedStats.pendingCount)" -ForegroundColor White
    }
    
    Write-Host "`n=== Test Completed ===" -ForegroundColor Green
    Write-Host "✓ Automatic invoice generation is working!" -ForegroundColor Green
    
} catch {
    Write-Host "✗ Test failed with error: $($_.Exception.Message)" -ForegroundColor Red
    Write-Host "Stack trace: $($_.ScriptStackTrace)" -ForegroundColor Red
    exit 1
}
