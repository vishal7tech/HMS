# Test Billing and Appointments APIs
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

Write-Host "=== Testing Billing and Appointments APIs ==="
Write-Host ""

# Test the specific APIs that Billing component is calling
$apis = @(
    @{name="Billings"; url="http://localhost:8080/api/billings"},
    @{name="Billings Pending"; url="http://localhost:8080/api/billings/pending"},
    @{name="Completed Appointments"; url="http://localhost:8080/api/appointments/completed"},
    @{name="Appointments"; url="http://localhost:8080/api/appointments"}
)

foreach ($api in $apis) {
    try {
        $response = Invoke-RestMethod -Uri $api.url -Method Get -Headers $headers
        Write-Host "✅ $($api.name): Working ($($response.Count) items)"
    } catch {
        Write-Host "❌ $($api.name): FAILED - $($_.Exception.Response.StatusCode)"
        if ($_.Exception.Response.StatusCode -eq 404) {
            Write-Host "   → API endpoint not found (404)"
        } elseif ($_.Exception.Response.StatusCode -eq 403) {
            Write-Host "   → Access forbidden (403)"
        } elseif ($_.Exception.Response.StatusCode -eq 500) {
            Write-Host "   → Server error (500)"
        }
        Write-Host "   → URL: $($api.url)"
    }
}

Write-Host ""
Write-Host "If APIs are missing (404 errors), we need to:"
Write-Host "1. Create the missing backend endpoints"
Write-Host "2. Or fix the frontend API calls"
