"--- Swagger API Docs Check ---"
try {
    $response = Invoke-WebRequest -Uri "http://localhost:8080/v3/api-docs" -Method Get
    $response.StatusCode
    "Swagger JSON length: " + $response.Content.Length
}
catch {
    $_.Exception.Message
}
