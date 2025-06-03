Write-Host "Testing API endpoints..."
Write-Host "Attempting to connect to http://localhost:3002/api/health"

try {
    $response = Invoke-RestMethod -Uri "http://localhost:3002/api/health" -Method Get -TimeoutSec 5
    Write-Host "Success! Response received:"
    $response | ConvertTo-Json -Depth 5
} catch {
    Write-Host "Error connecting to the API: $_"
}

Write-Host "`nTesting root endpoint..."
try {
    $rootResponse = Invoke-RestMethod -Uri "http://localhost:3002/" -Method Get -TimeoutSec 5
    Write-Host "Success! Response received:"
    $rootResponse
} catch {
    Write-Host "Error connecting to the root endpoint: $_"
}

Write-Host "`nPress any key to exit..."
$null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown")
