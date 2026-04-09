# Test the new PDF generation
Write-Host "🔍 Testing new PDF generation..."

# Remove old test files
if (Test-Path "invoices\TEST-001.txt") { Remove-Item "invoices\TEST-001.txt" }
if (Test-Path "invoices\TEST-001.pdf") { Remove-Item "invoices\TEST-001.pdf" }

# Test creating a simple PDF manually
$pdfContent = @"
%PDF-1.4
1 0 obj<</Type /Catalog /Pages 2 0 R>>endobj
2 0 obj<</Type /Pages /Kids [3 0 R] /Count 1>>endobj
3 0 obj<</Type /Page /Parent 2 0 R /MediaBox [0 0 612 792] /Contents 4 0 R /Resources<</Font <</F1 5 0 R>>>>endobj
5 0 obj<</Type /Font /Subtype /Type1 /BaseFont /Helvetica>>endobj
4 0 obj<</Length 85>>stream
BT/F1 12 Tf
100 700 Td (Test Invoice) Tj
0 -20 Td (Amount: ₹500.00) Tj
ET
endstream
endobj
xref
0 6
0000000000 65535 f 
0000000010 00000 n 
0000000079 00000 n 
0000000173 00000 n 
0000000301 00000 n 
0000000412 00000 n 
trailer<</Size 6 /Root 1 0 R>>startxref
495
%%EOF
"@

$pdfContent | Out-File -FilePath "invoices\TEST-001.pdf" -Encoding UTF8 -NoNewline

# Check if file was created
if (Test-Path "invoices\TEST-001.pdf") {
    $fileInfo = Get-Item "invoices\TEST-001.pdf"
    Write-Host "✅ Test PDF created successfully!"
    Write-Host "📄 File size: $($fileInfo.Length) bytes"
    
    # Try to open it
    Start-Process "invoices\TEST-001.pdf"
} else {
    Write-Host "❌ Failed to create test PDF"
}

Write-Host "🔍 PDF test completed"
