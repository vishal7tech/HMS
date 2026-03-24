$json = '{"username":"dr_feedback","password":"Password123"}'
$resp = Invoke-RestMethod -Uri "http://localhost:8080/api/auth/login" -Method Post -Body $json -ContentType "application/json"
$resp.token | Out-File -FilePath dr_feedback_token.txt -Encoding ascii
"Dr. Feedback token saved to dr_feedback_token.txt"
