# Test PDF download functionality
try {
    # Test the PDF download endpoint
    $response = Invoke-WebRequest -Uri "http://localhost:8080/api/invoices/1/pdf" -Method GET -UseBasicParsing
    
    Write-Host "Status Code:" $response.StatusCode
    Write-Host "Content Type:" $response.Headers["Content-Type"]
    Write-Host "Content Length:" $response.Headers["Content-Length"]
    
    if ($response.StatusCode -eq 200) {
        Write-Host "✅ PDF download endpoint is working!"
        # Save the response to a file to test
        $response.Content | Out-File -FilePath "test-download.pdf" -Encoding bytes
        Write-Host "✅ Test file saved as test-download.pdf"
    } else {
        Write-Host "❌ PDF download failed with status:" $response.StatusCode
    }
} catch {
    Write-Host "❌ Error testing PDF download:" $_.Exception.Message
}
