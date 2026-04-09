# Debug PDF generation
Write-Host "🔍 Testing PDF generation..."

# Check if invoices directory exists
if (Test-Path "invoices") {
    Write-Host "✅ Invoices directory exists"
    Get-ChildItem "invoices" | ForEach-Object {
        Write-Host "📄 Found file: $($_.Name) - Size: $($_.Length) bytes"
    }
} else {
    Write-Host "❌ Invoices directory does not exist"
    New-Item -ItemType Directory -Path "invoices"
    Write-Host "✅ Created invoices directory"
}

# Test basic file creation
try {
    $testContent = @"
HOSPITAL MANAGEMENT SYSTEM INVOICE
=====================================

Invoice Number: TEST-001
Date: 2026-04-04 14:30

PATIENT INFORMATION
-----------------
Name: Test Patient
ID: 123

BILLING DETAILS
---------------
Consultation Fee: ₹500.00
Tax (18%): ₹90.00
Total Amount: ₹590.00

=====================================
Thank you for choosing our hospital.
"@
    
    $testContent | Out-File -FilePath "invoices\TEST-001.txt" -Encoding UTF8
    Write-Host "✅ Test invoice file created successfully"
    
    # Check file size
    $fileInfo = Get-Item "invoices\TEST-001.txt"
    Write-Host "📄 File size: $($fileInfo.Length) bytes"
    
} catch {
    Write-Host "❌ Error creating test file: $($_.Exception.Message)"
}

Write-Host "🔍 PDF generation test completed"
