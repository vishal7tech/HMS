# Quick Test - Direct URL Access
Write-Host "=== Testing Direct URL Access ==="
Write-Host ""

# Test if we can access the pages directly by URL
$urls = @(
    "http://localhost:5173/login",
    "http://localhost:5173/dashboard", 
    "http://localhost:5173/patients",
    "http://localhost:5173/doctors",
    "http://localhost:5173/billing",
    "http://localhost:5173/appointments"
)

Write-Host "Testing direct URL access (simulating typing URL in browser):"
Write-Host "========================================================"

foreach ($url in $urls) {
    try {
        $response = Invoke-WebRequest -Uri $url -UseBasicParsing -TimeoutSec 10
        $status = $response.StatusCode
        $contentLength = $response.Content.Length
        
        if ($status -eq 200) {
            if ($contentLength -gt 1000) {
                Write-Host "✅ $url - Working (Content: $contentLength bytes)"
            } else {
                Write-Host "⚠️  $url - Working but small content ($contentLength bytes) - might be redirecting"
            }
        } else {
            Write-Host "❌ $url - Status: $status"
        }
    } catch {
        Write-Host "❌ $url - Error: $($_.Exception.Message)"
    }
}

Write-Host ""
Write-Host "IMPORTANT: Please try these steps:"
Write-Host "1. Clear your browser cache (Ctrl+Shift+Delete)"
Write-Host "2. Open a NEW browser window (incognito/private mode if possible)"
Write-Host "3. Go to: http://localhost:5173/"
Write-Host "4. Login as admin"
Write-Host "5. Try clicking the tabs again"
Write-Host ""
Write-Host "If it still doesn't work, please tell me:"
Write-Host "- What browser are you using?"
Write-Host "- Do you see any loading spinners?"
Write-Host "- Does the URL in address bar change when you click tabs?"
Write-Host "- Any error messages in browser console (F12)?"
