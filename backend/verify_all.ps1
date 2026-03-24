# HMS End-to-End Verification Script
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "HMS System Verification" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# Test 1: Backend Health Check
Write-Host "[1/6] Testing Backend Health..." -ForegroundColor Yellow
try {
    $ping = Invoke-RestMethod -Uri "http://localhost:8080/ping" -Method Get
    Write-Host "✓ Backend is running: $ping" -ForegroundColor Green
}
catch {
    Write-Host "✗ Backend health check failed: $_" -ForegroundColor Red
    exit 1
}

# Test 2: User Registration
Write-Host "`n[2/6] Testing User Registration..." -ForegroundColor Yellow
$registerBody = @{
    username = "testuser@hms.com"
    password = "test123"
    role     = "DOCTOR"
} | ConvertTo-Json

try {
    $registerResponse = Invoke-RestMethod -Uri "http://localhost:8080/api/auth/register" `
        -Method Post `
        -ContentType "application/json" `
        -Body $registerBody
    Write-Host "✓ Registration successful: $registerResponse" -ForegroundColor Green
}
catch {
    if ($_.Exception.Response.StatusCode -eq 400) {
        $errorBody = $_.ErrorDetails.Message
        if ($errorBody -like "*already exists*") {
            Write-Host "✓ User already exists (expected for repeat tests)" -ForegroundColor Green
        }
        else {
            Write-Host "✗ Registration failed: $errorBody" -ForegroundColor Red
        }
    }
    else {
        Write-Host "✗ Registration failed: $_" -ForegroundColor Red
    }
}

# Test 3: User Login
Write-Host "`n[3/6] Testing User Login..." -ForegroundColor Yellow
$loginBody = @{
    username = "admin@hms.com"
    password = "admin123"
} | ConvertTo-Json

try {
    $loginResponse = Invoke-RestMethod -Uri "http://localhost:8080/api/auth/login" `
        -Method Post `
        -ContentType "application/json" `
        -Body $loginBody
    
    $token = $loginResponse.token
    Write-Host "✓ Login successful!" -ForegroundColor Green
    Write-Host "  Token (first 50 chars): $($token.Substring(0, 50))..." -ForegroundColor Gray
}
catch {
    Write-Host "✗ Login failed: $_" -ForegroundColor Red
    exit 1
}

# Test 4: Protected Endpoint with Token
Write-Host "`n[4/6] Testing Protected Endpoint..." -ForegroundColor Yellow
try {
    $headers = @{
        "Authorization" = "Bearer $token"
    }
    $meResponse = Invoke-RestMethod -Uri "http://localhost:8080/api/auth/me" `
        -Method Get `
        -Headers $headers
    
    Write-Host "✓ Protected endpoint accessible with token" -ForegroundColor Green
    Write-Host "  User: $($meResponse.username)" -ForegroundColor Gray
    Write-Host "  Role: $($meResponse.role)" -ForegroundColor Gray
}
catch {
    Write-Host "✗ Protected endpoint failed: $_" -ForegroundColor Red
}

# Test 5: Frontend Dev Server
Write-Host "`n[5/6] Testing Frontend Dev Server..." -ForegroundColor Yellow
try {
    $frontendResponse = Invoke-WebRequest -Uri "http://localhost:5173" -Method Get -TimeoutSec 5
    if ($frontendResponse.StatusCode -eq 200) {
        Write-Host "✓ Frontend dev server is running on port 5173" -ForegroundColor Green
    }
}
catch {
    Write-Host "✗ Frontend dev server not accessible: $_" -ForegroundColor Red
}

# Test 6: Swagger UI
Write-Host "`n[6/6] Testing Swagger UI..." -ForegroundColor Yellow
try {
    $swaggerResponse = Invoke-WebRequest -Uri "http://localhost:8080/swagger-ui/index.html" -Method Get -TimeoutSec 5
    if ($swaggerResponse.StatusCode -eq 200) {
        Write-Host "✓ Swagger UI is accessible" -ForegroundColor Green
    }
}
catch {
    Write-Host "⚠ Swagger UI check: $($_.Exception.Message)" -ForegroundColor Yellow
}

# Summary
Write-Host "`n========================================" -ForegroundColor Cyan
Write-Host "Verification Complete!" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "`nNext Steps:" -ForegroundColor White
Write-Host "1. Open browser to http://localhost:5173/login" -ForegroundColor White
Write-Host "2. Login with: admin@hms.com / admin123" -ForegroundColor White
Write-Host "3. Verify redirect to dashboard" -ForegroundColor White
Write-Host "4. Check browser DevTools Network tab:" -ForegroundColor White
Write-Host "   - Login request should go to http://localhost:8080/api/auth/login" -ForegroundColor White
Write-Host "   - NOT to http://localhost:5173/api/auth/login" -ForegroundColor White
Write-Host "`nSwagger UI: http://localhost:8080/swagger-ui/index.html" -ForegroundColor Cyan
