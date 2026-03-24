# Debug Doctor Role Detection
$doctorLogin = @{
    username = "doctor"
    password = "doctor123"
} | ConvertTo-Json

try {
    $loginResponse = Invoke-RestMethod -Uri "http://localhost:8080/api/auth/login" -Method Post -Body $doctorLogin -ContentType "application/json"
    $token = $loginResponse.token
    
    Write-Host "=== DOCTOR TOKEN DEBUG ==="
    Write-Host "Token: $token"
    Write-Host ""
    
    # Decode JWT token (simple decode without verification for debugging)
    $tokenParts = $token.Split('.')
    $payload = $tokenParts[1]
    
    # Add padding if needed
    while ($payload.Length % 4) {
        $payload += "="
    }
    
    try {
        $decodedBytes = [System.Convert]::FromBase64String($payload.Replace('-', '+').Replace('_', '/'))
        $decodedPayload = [System.Text.Encoding]::UTF8.GetString($decodedBytes)
        Write-Host "Decoded JWT Payload:"
        Write-Host $decodedPayload
        Write-Host ""
        
        # Parse as JSON
        $payloadJson = $decodedPayload | ConvertFrom-Json
        Write-Host "Role from token: $($payloadJson.role)"
        Write-Host "Sub from token: $($payloadJson.sub)"
    } catch {
        Write-Host "Failed to decode JWT: $_"
    }
} catch {
    Write-Host "❌ Doctor login failed: $($_.Exception.Message)"
}
