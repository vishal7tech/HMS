# Test Doctor Dashboard APIs
$doctorLogin = @{
    username = "doctor"
    password = "doctor123"
} | ConvertTo-Json

# Get doctor token
try {
    $loginResponse = Invoke-RestMethod -Uri "http://localhost:8080/api/auth/login" -Method Post -Body $doctorLogin -ContentType "application/json"
    $token = $loginResponse.token

    $headers = @{
        "Authorization" = "Bearer $token"
        "Content-Type" = "application/json"
    }

    Write-Host "=== Testing Doctor Dashboard APIs ==="
    Write-Host ""

    # Test the APIs that DoctorDashboard is calling
    $apis = @(
        @{name="Doctor Profile"; url="http://localhost:8080/api/doctors/me"},
        @{name="Today Appointments"; url="http://localhost:8080/api/appointments/today"},
        @{name="My Availability"; url="http://localhost:8080/api/availability/my-slots"},
        @{name="All Appointments"; url="http://localhost:8080/api/appointments"}
    )

    foreach ($api in $apis) {
        try {
            $response = Invoke-RestMethod -Uri $api.url -Method Get -Headers $headers
            Write-Host "✅ $($api.name): Working ($($response.Count) items)"
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
            }
            Write-Host "   → URL: $($api.url)"
        }
    }
} catch {
    Write-Host "❌ Doctor login failed: $($_.Exception.Message)"
    Write-Host "Make sure doctor user exists in the system"
}
