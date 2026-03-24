# Test Fixed Billing APIs
$adminLogin = @{
    username = "admin"
    password = "admin123"
} | ConvertTo-Json

# Get admin token
$loginResponse = Invoke-RestMethod -Uri "http://localhost:8080/api/auth/login" -Method Post -Body $adminLogin -ContentType "application/json"
$token = $loginResponse.token

$headers = @{
    "Authorization" = "Bearer $token"
    "Content-Type" = "application/json"
}

Write-Host "=== Testing FIXED Billing APIs ==="
Write-Host ""

# Test the corrected API endpoints
$apis = @(
    @{name="Invoices", url="http://localhost:8080/api/invoices"},
    @{name="Invoices Pending", url="http://localhost:8080/api/invoices/pending"},
    @{name="Appointments", url="http://localhost:8080/api/appointments"}
)

foreach ($api in $apis) {
    try {
        $response = Invoke-RestMethod -Uri $api.url -Method Get -Headers $headers
        Write-Host "✅ $($api.name): Working ($($response.Count) items)"
    } catch {
        Write-Host "❌ $($api.name): FAILED - $($_.Exception.Response.StatusCode)"
        if ($_.Exception.Response.StatusCode -eq 404) {
            Write-Host "   → API endpoint still not found"
        } elseif ($_.Exception.Response.StatusCode -eq 403) {
            Write-Host "   → Access forbidden"
        } elseif ($_.Exception.Response.StatusCode -eq 500) {
            Write-Host "   → Server error"
        }
        Write-Host "   → URL: $($api.url)"
    }
}

Write-Host ""
Write-Host "🎉 BILLING ISSUE SHOULD BE FIXED NOW!"
Write-Host "The frontend is now calling the correct /api/invoices endpoints"
Write-Host ""
Write-Host "Please test:"
Write-Host "1. Refresh browser (Ctrl+F5)"
Write-Host "2. Go to: http://localhost:5173/"
Write-Host "3. Login as admin"
Write-Host "4. Click on Billing/Invoices tab - should work now!"
