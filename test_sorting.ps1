# Test the sorting logic
$staffData = @(
    @{id=1; name="System Administrator"; role="ADMIN"},
    @{id=2; name="Dr. Smith"; role="DOCTOR"},
    @{id=3; name="John Billing"; role="BILLING"},
    @{id=4; name="Front Desk Receptionist"; role="RECEPTIONIST"},
    @{id=5; name="ADMIN User"; role="ADMIN"},
    @{id=6; name="Sarah Doctor"; role="DOCTOR"},
    @{id=7; name="Jane Billing"; role="BILLING"},
    @{id=8; name="RECEPTIONIST User"; role="RECEPTIONIST"}
)

# Simulate the sorting logic from the frontend
$roleOrder = @('ADMIN', 'DOCTOR', 'BILLING', 'RECEPTIONIST')

foreach ($role in $roleOrder) {
    $members = $staffData | Where-Object { $_.role -eq $role } | Sort-Object { $_.name }
    if ($members.Count -gt 0) {
        Write-Host "$role ($($members.Count) members):"
        $members | ForEach-Object { Write-Host "  - $($_.name)" }
        Write-Host ""
    }
}
