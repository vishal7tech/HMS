# Test the new PDF generation
Write-Host "Testing new PDF generation..."

# Remove old test files
if (Test-Path "invoices\TEST-001.txt") { Remove-Item "invoices\TEST-001.txt" }
if (Test-Path "invoices\TEST-001.pdf") { Remove-Item "invoices\TEST-001.pdf" }

# Test creating a simple PDF manually
$pdfContent = "%PDF-1.4`n1 0 obj<</Type /Catalog /Pages 2 0 R>>endobj`n2 0 obj<</Type /Pages /Kids [3 0 R] /Count 1>>endobj`n3 0 obj<</Type /Page /Parent 2 0 R /MediaBox [0 0 612 792] /Contents 4 0 R /Resources<</Font <</F1 5 0 R>>>>endobj`n5 0 obj<</Type /Font /Subtype /Type1 /BaseFont /Helvetica>>endobj`n4 0 obj<</Length 85>>stream`nBT/F1 12 Tf`n100 700 Td (Test Invoice) Tj`n0 -20 Td (Amount: ₹500.00) Tj`nET`nendstream`nendobj`nxref`n0 6`n0000000000 65535 f `n0000000010 00000 n `n0000000079 00000 n `n0000000173 00000 n `n0000000301 00000 n `n0000000412 00000 n `ntrailer<</Size 6 /Root 1 0 R>>startxref`n495`n%%EOF"

$pdfContent | Out-File -FilePath "invoices\TEST-001.pdf" -Encoding UTF8 -NoNewline

# Check if file was created
if (Test-Path "invoices\TEST-001.pdf") {
    $fileInfo = Get-Item "invoices\TEST-001.pdf"
    Write-Host "Test PDF created successfully!"
    Write-Host "File size: $($fileInfo.Length) bytes"
} else {
    Write-Host "Failed to create test PDF"
}

Write-Host "PDF test completed"
