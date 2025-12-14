Write-Host "🚀 Quick Start - Progress Tracker (Minimal Setup)" -ForegroundColor Green
Write-Host ""

# Load environment variables
if (Test-Path ".env") {
    Write-Host "📋 Loading environment variables..." -ForegroundColor Yellow
    Get-Content .env | Where-Object { $_ -notmatch '^#' -and $_ -match '=' } | ForEach-Object {
        $parts = $_ -split '=', 2
        if ($parts.Length -eq 2) {
            $key = $parts[0].Trim()
            $value = $parts[1].Trim()
            [Environment]::SetEnvironmentVariable($key, $value, "Process")
            Write-Host "✓ $key" -ForegroundColor Green
        }
    }
} else {
    Write-Host "❌ .env file not found!" -ForegroundColor Red
    exit 1
}

Write-Host ""
Write-Host "🌐 Starting development server..." -ForegroundColor Yellow
Write-Host "   URL: http://localhost:3000" -ForegroundColor Cyan
Write-Host ""
Write-Host "⚠️  If you see 'Module not found' errors:" -ForegroundColor Yellow
Write-Host "   1. Run: npm install" -ForegroundColor Cyan
Write-Host "   2. Or check your disk space and try again" -ForegroundColor Cyan
Write-Host ""

# Try to start with npx (downloads Next.js if needed)
npx next@14 dev --port 3000