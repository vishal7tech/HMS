$json = '{"username":"test_doctor","password":"Password123"}'
$resp = Invoke-RestMethod -Uri "http://localhost:8080/api/auth/login" -Method Post -Body $json -ContentType "application/json"
$resp.token | Out-File -FilePath doctor_token.txt -Encoding ascii
"Doctor token saved to doctor_token.txt"
