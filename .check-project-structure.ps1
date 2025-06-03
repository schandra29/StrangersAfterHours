Write-Host "🔍 Checking project structure..." -ForegroundColor Cyan

# Define expected directories
$expectedDirs = @(
    "client",
    "client/src",
    "client/public",
    "server"  # Adjust if your backend is in a different folder
)

# Check if directories exist
$missingDirs = @()
foreach ($dir in $expectedDirs) {
    if (-not (Test-Path -Path $dir)) {
        $missingDirs += $dir
        Write-Host "❌ Missing directory: $dir" -ForegroundColor Red
    } else {
        Write-Host "✅ Found: $dir" -ForegroundColor Green
    }
}

# Print CWD paths for launch.json
Write-Host "`n📂 Use these paths in launch.json:" -ForegroundColor Cyan
Write-Host "Client CWD:   `"`${workspaceFolder}/client`""
Write-Host "Backend CWD:  `"`${workspaceFolder}/server`"  $(if (-not (Test-Path -Path "server")) { '[MISSING]' })"

# Check for package.json in client and server
Write-Host "`n📦 Checking for package.json files:" -ForegroundColor Cyan
$clientPkg = "client/package.json"
$serverPkg = "server/package.json"

if (Test-Path $clientPkg) {
    Write-Host "✅ Client package.json found" -ForegroundColor Green
} else {
    Write-Host "❌ Client package.json missing" -ForegroundColor Red
}

if (Test-Path $serverPkg) {
    Write-Host "✅ Server package.json found" -ForegroundColor Green
} else {
    Write-Host "❌ Server package.json missing (expected at: $serverPkg)" -ForegroundColor Red
}

# Check for .env files
Write-Host "`n🔑 Checking for environment files:" -ForegroundColor Cyan
$envFiles = @(".env", ".env.local", "client/.env.local")

foreach ($file in $envFiles) {
    if (Test-Path $file) {
        Write-Host "✅ Found: $file" -ForegroundColor Green
    } else {
        Write-Host "⚠️  Missing: $file" -ForegroundColor Yellow
    }
}

if ($missingDirs.Count -gt 0) {
    Write-Host "`n❌ Missing directories detected. Please create them or update launch.json paths." -ForegroundColor Red
} else {
    Write-Host "`n✨ Project structure looks good! You can use the CWD paths above in launch.json." -ForegroundColor Green
}