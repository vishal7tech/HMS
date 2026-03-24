# Test Doctor Availability APIs
$doctorLogin = @{
    username = "doctor"
    password = "doctor123"
} | ConvertTo-Json

try {
    $loginResponse = Invoke-RestMethod -Uri "http://localhost:8080/api/auth/login" -Method Post -Body $doctorLogin -ContentType "application/json"
    $token = $loginResponse.token

    $headers = @{
        "Authorization" = "Bearer $token"
        "Content-Type" = "application/json"
    }

    Write-Host "=== Testing Doctor Availability APIs ==="
    Write-Host ""

    # Get doctor profile first
    $profileRes = Invoke-RestMethod -Uri "http://localhost:8080/api/doctors/me" -Method Get -Headers $headers
    $doctorId = $profileRes.id
    Write-Host "✅ Doctor Profile: ID = $doctorId"

    # Test availability APIs
    $today = Get-Date -Format "yyyy-MM-dd"
    $apis = @(
        @{name="Doctor Availability"; url="http://localhost:8080/api/availability/doctor/$doctorId?date=$today"},
        @{name="Toggle Slot"; url="http://localhost:8080/api/availability/123/toggle"; method="PUT"}
    )

    foreach ($api in $apis) {
        try {
            if ($api.method -eq "PUT") {
                $response = Invoke-RestMethod -Uri $api.url -Method Put -Headers $headers -Body "{}"
                Write-Host "✅ $($api.name): Working (PUT)"
            } else {
                $response = Invoke-RestMethod -Uri $api.url -Method Get -Headers $headers
                Write-Host "✅ $($api.name): Working ($($response.Count) items)"
            }
        } catch {
            Write-Host "❌ $($api.name): FAILED - $($_.Exception.Response.StatusCode)"
            if ($_.Exception.Response.StatusCode -eq 404) {
                Write-Host "   → API endpoint not found (404)"
            } elseif ($_.Exception.Response.StatusCode -eq 500) {
                Write-Host "   → Server error (500)"
            }
            Write-Host "   → URL: $($api.url)"
        }
    }
} catch {
    Write-Host "❌ Doctor login failed: $($_.Exception.Message)"
}
