# Debug Admin Navigation Issues
Write-Host "=== Admin Navigation Debug ==="
Write-Host ""

# First, let's check if the services are running
Write-Host "Checking if services are running..."

# Check backend
try {
    $backendResponse = Invoke-RestMethod -Uri "http://localhost:8080/api/auth/login" -Method Post -Body '{"username":"admin","password":"admin123"}' -ContentType "application/json" -TimeoutSec 5
    Write-Host "✅ Backend is running and responding"
    $token = $backendResponse.token
} catch {
    Write-Host "❌ Backend is not running or not accessible: $($_.Exception.Message)"
    Write-Host "Please start the backend first!"
    exit
}

# Check frontend
try {
    $frontendResponse = Invoke-WebRequest -Uri "http://localhost:5173/" -TimeoutSec 5
    Write-Host "✅ Frontend is running"
} catch {
    Write-Host "❌ Frontend is not running: $($_.Exception.Message)"
    Write-Host "Please start the frontend first!"
    exit
}

Write-Host ""
Write-Host "Let's check the actual frontend routes..."

# Test the frontend routes directly
$routes = @(
    "http://localhost:5173/dashboard",
    "http://localhost:5173/patients", 
    "http://localhost:5173/doctors",
    "http://localhost:5173/billing",
    "http://localhost:5173/appointments"
)

foreach ($route in $routes) {
    try {
        $response = Invoke-WebRequest -Uri $route -TimeoutSec 5
        Write-Host "✅ $route - Status: $($response.StatusCode)"
    } catch {
        Write-Host "❌ $route - Error: $($_.Exception.Message)"
    }
}

Write-Host ""
Write-Host "Manual Testing Steps:"
Write-Host "1. Make sure both backend and frontend are running"
Write-Host "2. Open browser and go to: http://localhost:5173/"
Write-Host "3. Open browser developer tools (F12)"
Write-Host "4. Go to Console tab"
Write-Host "5. Login as admin"
Write-Host "6. Click on Patients tab"
Write-Host "7. Watch for any errors in console"
Write-Host "8. Check Network tab for any failed requests"
Write-Host ""
Write-Host "If you still see issues, please tell me:"
Write-Host "- What exactly happens when you click the tabs?"
Write-Host "- Any error messages in browser console?"
Write-Host "- Does the URL change in the address bar?"
Write-Host "- Do you see any loading spinner?"
