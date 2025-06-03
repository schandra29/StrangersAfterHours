Write-Host "=== Project Structure Check ===" -ForegroundColor Cyan

# Check directories
Write-Host "`n[DIRECTORIES]" -ForegroundColor Yellow
@("client", "client/src", "client/public", "server") | ForEach-Object {
    if (Test-Path -Path $_) {
        Write-Host "✅ $_" -ForegroundColor Green
    } else {
        Write-Host "❌ $_ (missing)" -ForegroundColor Red
    }
}

# Check package.json files
Write-Host "`n[PACKAGE.JSON]" -ForegroundColor Yellow
@("client/package.json", "server/package.json") | ForEach-Object {
    if (Test-Path -Path $_) {
        Write-Host "✅ $_" -ForegroundColor Green
    } else {
        Write-Host "❌ $_ (missing)" -ForegroundColor Red
    }
}

# Check environment files
Write-Host "`n[ENVIRONMENT FILES]" -ForegroundColor Yellow
@(".env", ".env.local", "client/.env.local") | ForEach-Object {
    if (Test-Path -Path $_) {
        Write-Host "✅ $_" -ForegroundColor Green
    } else {
        Write-Host "⚠️  $_ (missing)" -ForegroundColor Yellow
    }
}

Write-Host "`n=== Check Complete ===" -ForegroundColor Cyan
