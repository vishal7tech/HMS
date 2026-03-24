$baseUrl = "http://localhost:8080"
$adminJwt = "eyJhbGciOiJIUzI1NiJ9.eyJzdWIiOiJhZG1pbjc0Iiwicm9sZSI6IkFETUlOIiwiaWF0IjoxNzcwNDUzNTQxLCJleHAiOjE3NzA1Mzk5NDF9.JPn-eyTCXtInyVB8_FUhtvqAPUcdVJFheCFLXbiUq8Y"

Write-Host "Calling /api/dashboard/stats..."
try {
    $response = Invoke-RestMethod -Uri "$baseUrl/api/dashboard/stats" -Method Get -Headers @{Authorization = "Bearer $adminJwt" }
    Write-Host "SUCCESS"
    $response | ConvertTo-Json
}
catch {
    Write-Host "FAILED"
    Write-Host "Status Code: $($_.Exception.Response.StatusCode.value__)"
    $reader = New-Object System.IO.StreamReader($_.Exception.Response.GetResponseStream())
    $errorBody = $reader.ReadToEnd()
    Write-Host "Error Body: $errorBody"
}
