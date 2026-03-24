# Test Admin Access to Different Pages
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

# Test access to different pages (these would normally be frontend routes, but we can test the backend APIs)
$pages = @(
    @{name="Patients"; url="http://localhost:8080/api/patients"},
    @{name="Doctors"; url="http://localhost:8080/api/doctors"},
    @{name="Appointments"; url="http://localhost:8080/api/appointments"},
    @{name="Billing"; url="http://localhost:8080/api/billings"}
)

Write-Host "Testing Admin Access to Different Pages:"
Write-Host "======================================"

foreach ($page in $pages) {
    try {
        $response = Invoke-RestMethod -Uri $page.url -Method Get -Headers $headers
        Write-Host "✅ $($page.name): Access Granted (Found $($response.Count) items)"
    } catch {
        if ($_.Exception.Response.StatusCode -eq 403) {
            Write-Host "❌ $($page.name): Access Forbidden"
        } elseif ($_.Exception.Response.StatusCode -eq 401) {
            Write-Host "❌ $($page.name): Unauthorized"
        } else {
            Write-Host "⚠️ $($page.name): Error - $($_.Exception.Message)"
        }
    }
}
