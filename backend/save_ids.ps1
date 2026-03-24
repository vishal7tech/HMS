$token = Get-Content token.txt
$headers = @{
    Authorization = "Bearer $token"
}

"--- Patients ---"
$patients = Invoke-RestMethod -Uri "http://localhost:8080/api/patients" -Method Get -Headers $headers
$patients | ConvertTo-Json | Out-File -FilePath patients.json -Encoding utf8

"--- Doctors ---"
$doctors = Invoke-RestMethod -Uri "http://localhost:8080/api/doctors" -Method Get -Headers $headers
$doctors | ConvertTo-Json | Out-File -FilePath doctors.json -Encoding utf8

"IDs Saved to patients.json and doctors.json"
