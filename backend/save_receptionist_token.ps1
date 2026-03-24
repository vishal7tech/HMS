$json = '{"username":"test_receptionist","password":"Password123"}'
$resp = Invoke-RestMethod -Uri "http://localhost:8080/api/auth/login" -Method Post -Body $json -ContentType "application/json"
$resp.token | Out-File -FilePath receptionist_token.txt -Encoding ascii
"Receptionist token saved to receptionist_token.txt"
