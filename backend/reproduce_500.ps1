$baseUrl = "http://localhost:8080"
$adminJwt = "eyJhbGciOiJIUzI1NiJ9.eyJzdWIiOiJhZG1pbjc0Iiwicm9sZSI6IkFETUlOIiwiaWF0IjoxNzcwNDUzNTQxLCJleHAiOjE3NzA1Mzk5NDF9.JPn-eyTCXtInyVB8_FUhtvqAPUcdVJFheCFLXbiUq8Y"

$body = @{
    name        = "John Doe"
    age         = 30
    email       = "john@example.com"
    phone       = "9876543210"
    address     = "123 Main St"
    gender      = "MALE"
    dateOfBirth = "1994-01-01"
} | ConvertTo-Json

Write-Host "Sending request to create patient..."
try {
    $response = Invoke-RestMethod -Uri "$baseUrl/api/patients" -Method Post -Body $body -ContentType "application/json" -Headers @{Authorization = "Bearer $adminJwt" }
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
