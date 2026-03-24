# Test Appointments API specifically
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

Write-Host "=== Testing Appointments API for Admin ==="
Write-Host ""

# Test all the APIs that Appointments component is calling
$apis = @(
    @{name="Appointments"; url="http://localhost:8080/api/appointments"},
    @{name="Patients"; url="http://localhost:8080/api/patients"},
    @{name="Doctors"; url="http://localhost:8080/api/doctors"}
)

foreach ($api in $apis) {
    try {
        $response = Invoke-RestMethod -Uri $api.url -Method Get -Headers $headers
        Write-Host "✅ $($api.name): Working ($($response.Count) items)"
        
        # Show first item structure if available
        if ($response.Count -gt 0) {
            Write-Host "   → First item: $($response[0] | ConvertTo-Json -Compress)"
        }
    } catch {
        Write-Host "❌ $($api.name): FAILED - $($_.Exception.Response.StatusCode)"
        if ($_.Exception.Response.StatusCode -eq 404) {
            Write-Host "   → API endpoint not found (404)"
        } elseif ($_.Exception.Response.StatusCode -eq 403) {
            Write-Host "   → Access forbidden (403)"
        } elseif ($_.Exception.Response.StatusCode -eq 500) {
            Write-Host "   → Server error (500)"
            # Try to get error details
            try {
                $errorResponse = $_.Exception.Response.GetResponseStream()
                $reader = New-Object System.IO.StreamReader($errorResponse)
                $errorBody = $reader.ReadToEnd()
                Write-Host "   → Error details: $errorBody"
            } catch {
                Write-Host "   → Could not read error details"
            }
        }
        Write-Host "   → URL: $($api.url)"
    }
}

Write-Host ""
Write-Host "If you're still seeing errors, please:"
Write-Host "1. Open browser console (F12)"
Write-Host "2. Click on Appointments tab"
Write-Host "3. Tell me the exact error message from console"
