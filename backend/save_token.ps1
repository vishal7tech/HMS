$json = '{"username":"test_admin","password":"Password123"}'
$resp = Invoke-RestMethod -Uri "http://localhost:8080/api/auth/login" -Method Post -Body $json -ContentType "application/json"
$resp.token | Out-File -FilePath token.txt -Encoding ascii
"Token saved to token.txt"
